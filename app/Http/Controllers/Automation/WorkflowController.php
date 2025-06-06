<?php

namespace App\Http\Controllers\Automation;

use App\Http\Controllers\Controller;
use App\Models\Workflow;
use App\Models\WorkflowTrigger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WorkflowController extends Controller
{
    public function create()
    {
        return Inertia::render('Automation/WorkflowBuilder', [
            'workflow' => null,
            'availableTriggers' => WorkflowTrigger::getAvailableTriggerTypes(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
            'trigger' => 'required|array',
            'trigger.type' => 'required|string',
            'trigger.config' => 'nullable|array',
            'actions' => 'required|array',
        ]);

        DB::beginTransaction();
        
        try {
            // Create the main workflow
            $workflow = Workflow::create([
                'user_id' => Auth::id(),
                'name' => $validated['name'],
                'is_active' => $validated['is_active'] ?? true,
                'trigger' => $validated['trigger'],
                'actions' => $validated['actions'],
            ]);

            // Create the trigger entry
            $this->createWorkflowTrigger($workflow, $validated['trigger']);

            DB::commit();

            return response()->json([
                'message' => 'Workflow created successfully',
                'workflow' => $workflow->load('trigger'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'message' => 'Failed to create workflow',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Workflow $workflow)
    {
        // Ensure user owns the workflow
        if ($workflow->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
            'trigger' => 'required|array',
            'trigger.type' => 'required|string',
            'trigger.config' => 'nullable|array',
            'actions' => 'required|array',
        ]);

        DB::beginTransaction();
        
        try {
            // Update the main workflow
            $workflow->update([
                'name' => $validated['name'],
                'is_active' => $validated['is_active'] ?? $workflow->is_active,
                'trigger' => $validated['trigger'],
                'actions' => $validated['actions'],
            ]);

            // Update or create the trigger entry
            $this->updateWorkflowTrigger($workflow, $validated['trigger']);

            DB::commit();

            return response()->json([
                'message' => 'Workflow updated successfully',
                'workflow' => $workflow->load('trigger'),
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'message' => 'Failed to update workflow',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function createWorkflowTrigger(Workflow $workflow, array $triggerData)
    {
        $triggerConfig = $this->prepareTriggerConfig($triggerData);
        
        WorkflowTrigger::create([
            'workflow_id' => $workflow->id,
            'trigger_name' => $triggerConfig['trigger_name'],
            'trigger_type' => $triggerData['type'],
            'page_id' => $triggerConfig['page_id'] ?? null,
            'page_name' => $triggerConfig['page_name'] ?? null,
            'form_ids' => $triggerConfig['form_ids'] ?? null,
            'filters' => $triggerConfig['filters'] ?? null,
            'trigger_config' => $triggerData['config'] ?? null,
            'is_active' => true,
        ]);
    }

    private function updateWorkflowTrigger(Workflow $workflow, array $triggerData)
    {
        $triggerConfig = $this->prepareTriggerConfig($triggerData);
        
        $workflow->trigger()->updateOrCreate(
            ['workflow_id' => $workflow->id],
            [
                'trigger_name' => $triggerConfig['trigger_name'],
                'trigger_type' => $triggerData['type'],
                'page_id' => $triggerConfig['page_id'] ?? null,
                'page_name' => $triggerConfig['page_name'] ?? null,
                'form_ids' => $triggerConfig['form_ids'] ?? null,
                'filters' => $triggerConfig['filters'] ?? null,
                'trigger_config' => $triggerData['config'] ?? null,
                'is_active' => true,
            ]
        );
    }

    private function prepareTriggerConfig(array $triggerData): array
    {
        switch ($triggerData['type']) {
            case WorkflowTrigger::TRIGGER_FACEBOOK_LEAD:
                return $this->prepareFacebookTriggerConfig($triggerData);
            
            case WorkflowTrigger::TRIGGER_WEBHOOK:
                return $this->prepareWebhookTriggerConfig($triggerData);
                
            default:
                return [
                    'trigger_name' => $triggerData['name'] ?? ucfirst(str_replace('_', ' ', $triggerData['type'])),
                ];
        }
    }

    private function prepareFacebookTriggerConfig(array $triggerData): array
    {
        $config = $triggerData['config'] ?? [];
        
        return [
            'trigger_name' => $config['name'] ?? 'Facebook Lead Form Trigger',
            'page_id' => $config['page_id'] ?? null,
            'page_name' => $config['page_name'] ?? null,
            'form_ids' => isset($config['form_ids']) ? (array) $config['form_ids'] : null,
            'filters' => $config['filters'] ?? null,
        ];
    }

    private function prepareWebhookTriggerConfig(array $triggerData): array
    {
        $config = $triggerData['config'] ?? [];
        
        return [
            'trigger_name' => $config['name'] ?? 'Webhook Trigger',
            'filters' => $config['filters'] ?? null,
        ];
    }
}