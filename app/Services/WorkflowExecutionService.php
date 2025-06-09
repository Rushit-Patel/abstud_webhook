<?php

namespace App\Services;

use App\Models\Workflow;
use App\Models\WorkflowExecution;
use App\Models\WorkflowStep;
use App\Models\WorkflowStepExecution;
use App\Models\User;
use App\Jobs\ExecuteWorkflowStepJob;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;

class WorkflowExecutionService
{
    public function execute(Workflow $workflow, array $triggerData = [], ?User $triggeredBy = null): WorkflowExecution
    {
        $execution = WorkflowExecution::create([
            'workflow_id' => $workflow->id,
            'triggered_by_user_id' => $triggeredBy?->id,
            'trigger_data' => $triggerData,
            'total_steps' => $workflow->steps()->enabled()->count(),
            'execution_context' => [
                'variables' => [],
                'trigger_data' => $triggerData
            ]
        ]);

        $execution->start();

        // Execute first step
        $firstStep = $workflow->steps()->enabled()->orderBy('position')->first();
        if ($firstStep) {
            $this->executeStep($execution, $firstStep);
        } else {
            $execution->complete();
        }

        return $execution;
    }

    public function executeStep(WorkflowExecution $execution, WorkflowStep $step): WorkflowStepExecution
    {
        $stepExecution = WorkflowStepExecution::create([
            'execution_id' => $execution->id,
            'step_id' => $step->id,
            'input_data' => $execution->execution_context
        ]);

        $stepExecution->update([
            'status' => 'running',
            'started_at' => now()
        ]);

        try {
            $result = $this->processStep($step, $stepExecution);
            
            $stepExecution->update([
                'status' => 'completed',
                'completed_at' => now(),
                'output_data' => $result,
                'execution_time_ms' => now()->diffInMilliseconds($stepExecution->started_at)
            ]);

            // Update execution progress
            $execution->increment('completed_steps');
            
            // Update execution context with step results
            $context = $execution->execution_context;
            $context['step_results'][$step->id] = $result;
            $execution->update(['execution_context' => $context]);

            // Execute next step
            $nextStep = $step->getNextStep();
            if ($nextStep) {
                if ($step->step_type === 'delay') {
                    // Schedule delayed execution
                    $delay = $this->calculateDelay($step->config);
                    ExecuteWorkflowStepJob::dispatch($execution, $nextStep)->delay($delay);
                } else {
                    $this->executeStep($execution, $nextStep);
                }
            } else {
                $execution->complete();
            }

        } catch (\Exception $e) {
            $stepExecution->update([
                'status' => 'failed',
                'completed_at' => now(),
                'error_message' => $e->getMessage(),
                'execution_time_ms' => now()->diffInMilliseconds($stepExecution->started_at)
            ]);

            if ($stepExecution->retry_count < $step->retry_count) {
                $stepExecution->increment('retry_count');
                // Retry with exponential backoff
                $delay = pow(2, $stepExecution->retry_count) * 60; // seconds
                ExecuteWorkflowStepJob::dispatch($execution, $step)->delay(now()->addSeconds($delay));
            } else {
                $execution->fail("Step '{$step->name}' failed: " . $e->getMessage());
            }

            Log::error('Workflow step execution failed', [
                'execution_id' => $execution->id,
                'step_id' => $step->id,
                'error' => $e->getMessage()
            ]);
        }

        return $stepExecution;
    }

    protected function processStep(WorkflowStep $step, WorkflowStepExecution $stepExecution): array
    {
        switch ($step->step_type) {
            case 'send_email':
                return $this->sendEmail($step->config, $stepExecution->input_data);
            
            case 'send_webhook':
                return $this->sendWebhook($step->config, $stepExecution->input_data);
            
            case 'send_whatsapp':
                return $this->sendWhatsApp($step->config, $stepExecution->input_data);
            
            case 'add_tag':
                return $this->addTags($step->config, $stepExecution->input_data);
            
            case 'remove_tag':
                return $this->removeTags($step->config, $stepExecution->input_data);
            
            case 'condition':
                return $this->evaluateCondition($step->config, $stepExecution->input_data);
            
            case 'delay':
                return ['delayed_until' => now()->add($this->calculateDelay($step->config))];
            
            default:
                throw new \Exception("Unknown step type: {$step->step_type}");
        }
    }

    protected function sendEmail(array $config, array $inputData): array
    {
        // Implement email sending logic using your preferred mail service
        // Return execution results
        return [
            'sent' => true,
            'message_id' => 'email_' . uniqid(),
            'timestamp' => now()->toISOString()
        ];
    }

    protected function sendWebhook(array $config, array $inputData): array
    {
        // Implement webhook sending logic
        $client = new \GuzzleHttp\Client();
        
        $response = $client->request($config['method'] ?? 'POST', $config['url'], [
            'json' => $inputData,
            'headers' => $config['headers'] ?? [],
            'timeout' => $config['timeout'] ?? 30
        ]);

        return [
            'status_code' => $response->getStatusCode(),
            'response' => $response->getBody()->getContents(),
            'timestamp' => now()->toISOString()
        ];
    }

    protected function sendWhatsApp(array $config, array $inputData): array
    {
        // Implement WhatsApp sending logic
        return [
            'sent' => true,
            'message_id' => 'whatsapp_' . uniqid(),
            'timestamp' => now()->toISOString()
        ];
    }

    protected function addTags(array $config, array $inputData): array
    {
        // Implement tag adding logic
        return [
            'tags_added' => $config['tags'] ?? [],
            'timestamp' => now()->toISOString()
        ];
    }

    protected function removeTags(array $config, array $inputData): array
    {
        // Implement tag removal logic
        return [
            'tags_removed' => $config['tags'] ?? [],
            'timestamp' => now()->toISOString()
        ];
    }

    protected function evaluateCondition(array $config, array $inputData): array
    {
        // Implement condition evaluation logic
        return [
            'condition_met' => true,
            'evaluated_conditions' => $config['conditions'] ?? [],
            'timestamp' => now()->toISOString()
        ];
    }

    protected function calculateDelay(array $config): \Carbon\Carbon
    {
        $duration = $config['duration'] ?? 5;
        $unit = $config['unit'] ?? 'minutes';

        return now()->add($duration, $unit);
    }
}