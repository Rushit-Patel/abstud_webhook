<?php

namespace App\Services;

use App\Models\WorkflowTrigger;
use App\Models\TriggerEventLog;
use App\Models\Workflow;
use App\Jobs\ProcessTriggerEventJob;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;

class TriggerProcessingService
{
    public function __construct(
        private WorkflowExecutionService $executionService
    ) {}

    public function processPendingTriggers(): void
    {
        $pendingEvents = TriggerEventLog::where('status', 'triggered')
            ->with(['trigger.workflow'])
            ->orderBy('created_at')
            ->limit(100)
            ->get();

        foreach ($pendingEvents as $event) {
            $this->processEvent($event);
        }
    }

    public function processEvent(TriggerEventLog $event): void
    {
        $startTime = microtime(true);

        try {
            $trigger = $event->trigger;
            
            if (!$trigger || !$trigger->is_active) {
                $event->update([
                    'status' => 'ignored',
                    'failure_reason' => 'Trigger is inactive'
                ]);
                return;
            }

            if (!$trigger->canTrigger()) {
                $event->update([
                    'status' => 'ignored',
                    'failure_reason' => 'Trigger cooldown period not elapsed'
                ]);
                return;
            }

            $workflow = $trigger->workflow;
            if (!$workflow || !$workflow->isExecutable()) {
                $event->update([
                    'status' => 'ignored',
                    'failure_reason' => 'Workflow is not executable'
                ]);
                return;
            }

            // Evaluate trigger conditions
            if (!$trigger->evaluateConditions($event->trigger_payload)) {
                $event->update([
                    'status' => 'ignored',
                    'failure_reason' => 'Trigger conditions not met'
                ]);
                return;
            }

            // Map trigger data to workflow variables
            $workflowData = $this->mapTriggerData($trigger, $event->trigger_payload);

            // Execute workflow
            $execution = $this->executionService->execute(
                $workflow,
                $workflowData
            );

            // Update trigger timestamp
            $trigger->update(['last_triggered_at' => now()]);

            $processingTime = round((microtime(true) - $startTime) * 1000);

            $event->update([
                'status' => 'processed',
                'workflow_execution_id' => $execution->id,
                'processing_time_ms' => $processingTime
            ]);

            // Update metrics
            $this->updateTriggerMetrics($trigger, 'successful_triggers', $processingTime);

        } catch (\Exception $e) {
            $processingTime = round((microtime(true) - $startTime) * 1000);

            $event->update([
                'status' => 'failed',
                'failure_reason' => $e->getMessage(),
                'processing_time_ms' => $processingTime
            ]);

            $this->updateTriggerMetrics($trigger, 'failed_triggers', $processingTime);

            Log::error('Trigger processing failed', [
                'trigger_id' => $trigger->id,
                'event_id' => $event->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    private function mapTriggerData(WorkflowTrigger $trigger, array $eventData): array
    {
        if (empty($trigger->field_mappings)) {
            return $eventData;
        }

        $mappedData = [];
        
        foreach ($trigger->field_mappings as $mapping) {
            $sourceField = $mapping['source'] ?? null;
            $targetField = $mapping['target'] ?? null;
            $transform = $mapping['transform'] ?? null;

            if (!$sourceField || !$targetField) continue;

            $value = data_get($eventData, $sourceField);

            // Apply transformations
            if ($transform) {
                $value = $this->applyTransformation($value, $transform);
            }

            data_set($mappedData, $targetField, $value);
        }

        return array_merge($eventData, $mappedData);
    }

    private function applyTransformation($value, array $transform): mixed
    {
        $type = $transform['type'] ?? null;

        switch ($type) {
            case 'uppercase':
                return strtoupper($value);
            case 'lowercase':
                return strtolower($value);
            case 'trim':
                return trim($value);
            case 'date_format':
                $format = $transform['format'] ?? 'Y-m-d H:i:s';
                return date($format, strtotime($value));
            case 'json_decode':
                return json_decode($value, true);
            case 'extract_field':
                $field = $transform['field'] ?? null;
                $decoded = json_decode($value, true);
                return $field ? data_get($decoded, $field) : $decoded;
            default:
                return $value;
        }
    }

    private function updateTriggerMetrics(WorkflowTrigger $trigger, string $metric, int $processingTime): void
    {
        $today = now()->toDateString();
        
        DB::table('trigger_metrics')
            ->updateOrInsert(
                ['trigger_id' => $trigger->id, 'date' => $today],
                [
                    'total_events' => DB::raw('total_events + 1'),
                    $metric => DB::raw("$metric + 1"),
                    'avg_processing_time_ms' => DB::raw("(avg_processing_time_ms * (total_events - 1) + $processingTime) / total_events"),
                    'updated_at' => now()
                ]
            );
    }
}