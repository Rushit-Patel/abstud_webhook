<?php

namespace App\Http\Controllers\Automation;

use App\Http\Controllers\Controller;
use App\Models\Workflow;
use App\Models\WorkflowTrigger;
use App\Models\DatabaseEventTrigger;
use App\Services\TriggerProcessingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class WorkflowTriggerController extends Controller
{
    public function __construct(
        private TriggerProcessingService $triggerService
    ) {}

    public function store(Request $request, Workflow $workflow)
    {
        $this->authorize('update', $workflow);

        $validated = $request->validate([
            'trigger_name' => 'required|string|max:255',
            'trigger_type' => 'required|in:database_event,webhook,schedule,manual,api_event,field_condition,integration_event',
            'event_source' => 'nullable|string',
            'event_action' => 'nullable|in:INSERT,UPDATE,DELETE,SELECT,ANY',
            'trigger_conditions' => 'required|array',
            'field_mappings' => 'nullable|array',
            'priority' => 'integer|min:1|max:1000',
            'cooldown_seconds' => 'integer|min:0',
            'database_config' => 'nullable|array' // For database triggers
        ]);

        DB::transaction(function () use ($workflow, $validated) {
            $trigger = $workflow->triggers()->create([
                'trigger_name' => $validated['trigger_name'],
                'trigger_type' => $validated['trigger_type'],
                'event_source' => $validated['event_source'],
                'event_action' => $validated['event_action'],
                'trigger_conditions' => $validated['trigger_conditions'],
                'field_mappings' => $validated['field_mappings'] ?? [],
                'priority' => $validated['priority'] ?? 100,
                'cooldown_seconds' => $validated['cooldown_seconds'] ?? 0,
                'is_active' => true
            ]);

            // Create database event trigger if needed
            if ($validated['trigger_type'] === 'database_event' && !empty($validated['database_config'])) {
                $trigger->databaseEventTrigger()->create([
                    'table_name' => $validated['database_config']['table_name'],
                    'column_filters' => $validated['database_config']['column_filters'] ?? null,
                    'value_conditions' => $validated['database_config']['value_conditions'] ?? null,
                    'operation' => $validated['event_action'] ?? 'ANY',
                    'capture_old_values' => $validated['database_config']['capture_old_values'] ?? false,
                    'capture_new_values' => $validated['database_config']['capture_new_values'] ?? true
                ]);
            }
        });

        return response()->json([
            'message' => 'Trigger created successfully',
            'trigger' => $trigger->load('databaseEventTrigger')
        ]);
    }

    public function validate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'trigger_conditions' => 'required|array',
            'test_data' => 'required|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $conditions = $request->input('trigger_conditions');
        $testData = $request->input('test_data');

        // Create a temporary trigger to test conditions
        $tempTrigger = new WorkflowTrigger();
        $tempTrigger->trigger_conditions = $conditions;

        $result = $tempTrigger->evaluateConditions($testData);

        return response()->json([
            'valid' => $result,
            'message' => $result ? 'Conditions match test data' : 'Conditions do not match test data'
        ]);
    }

    public function test(Request $request)
    {
        $validated = $request->validate([
            'trigger_id' => 'required|exists:workflow_triggers,id',
            'test_data' => 'required|array'
        ]);

        $trigger = WorkflowTrigger::findOrFail($validated['trigger_id']);
        
        // Simulate trigger event
        $eventLog = $trigger->eventLogs()->create([
            'trigger_payload' => $validated['test_data'],
            'status' => 'triggered'
        ]);

        $this->triggerService->processEvent($eventLog);

        return response()->json([
            'message' => 'Trigger test completed',
            'event_log' => $eventLog->fresh(),
            'execution' => $eventLog->workflowExecution
        ]);
    }

    public function update(Request $request, Workflow $workflow, WorkflowTrigger $trigger)
    {
        $this->authorize('update', $workflow);

        $validated = $request->validate([
            'is_active' => 'boolean',
            'trigger_conditions' => 'array',
            'field_mappings' => 'array',
            'priority' => 'integer|min:1|max:1000',
            'cooldown_seconds' => 'integer|min:0'
        ]);

        $trigger->update($validated);

        return response()->json([
            'message' => 'Trigger updated successfully',
            'trigger' => $trigger
        ]);
    }

    public function destroy(Workflow $workflow, WorkflowTrigger $trigger)
    {
        $this->authorize('update', $workflow);

        $trigger->delete();

        return response()->json([
            'message' => 'Trigger deleted successfully'
        ]);
    }
}