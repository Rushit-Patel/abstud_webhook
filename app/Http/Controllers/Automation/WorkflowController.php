<?php
// app/Http/Controllers/Automation/WorkflowController.php

namespace App\Http\Controllers\Automation;

use App\Http\Controllers\Controller;
use App\Models\Workflow;
use App\Models\Trigger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class WorkflowController extends Controller
{
    /**
     * Display a listing of workflows.
     */
    public function index(Request $request)
    {
        $query = Workflow::where('user_id', Auth::id());

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by trigger type
        if ($request->has('trigger_type')) {
            $query->where('trigger_type', $request->trigger_type);
        }

        // Filter templates
        if ($request->has('templates')) {
            $query->where('is_template', $request->boolean('templates'));
        }

        $workflows = $query->with(['trigger', 'user'])
                          ->orderBy('updated_at', 'desc')
                          ->get();

        // Transform for legacy compatibility
        $workflows = $workflows->map(function($workflow) {
            $workflowData = $workflow->toArray();
            
            // Add legacy trigger format
            $effectiveTrigger = $workflow->getEffectiveTrigger();
            if ($effectiveTrigger) {
                $workflowData['trigger'] = [
                    'type' => $effectiveTrigger->type,
                    'config' => $effectiveTrigger->config ?? null,
                ];
                $workflowData['is_active'] = $workflow->status === 'active';
            }

            // Add legacy actions
            $workflowData['actions'] = $workflow->getLegacyActions();

            return $workflowData;
        });

        return response()->json($workflows);
    }

    /**
     * Store a newly created workflow.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'trigger_id' => 'nullable|exists:triggers,id',
            'trigger_type' => ['nullable', Rule::in(['webhook', 'schedule', 'manual', 'event', 'lead_created', 'form_submitted'])],
            'trigger_config' => 'nullable|array',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'draft'])],
            'is_template' => 'nullable|boolean',
            'metadata' => 'nullable|array',
            
            // Legacy fields for backward compatibility
            'trigger' => 'nullable|array',
            'actions' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        // Validate that trigger_id belongs to current user if provided
        if (isset($validated['trigger_id'])) {
            $trigger = Trigger::where('id', $validated['trigger_id'])
                             ->where('user_id', Auth::id())
                             ->first();
            if (!$trigger) {
                return response()->json(['message' => 'Invalid trigger selected'], 422);
            }
        }

        DB::beginTransaction();
        try {
            // Handle legacy trigger format
            if (isset($validated['trigger']) && !isset($validated['trigger_type']) && !isset($validated['trigger_id'])) {
                $validated['trigger_type'] = $validated['trigger']['type'] ?? null;
                $validated['trigger_config'] = $validated['trigger'];
            }

            // Handle legacy is_active
            if (isset($validated['is_active'])) {
                $validated['status'] = $validated['is_active'] ? 'active' : 'inactive';
            }

            $workflow = Workflow::create([
                'user_id' => Auth::id(),
                'trigger_id' => $validated['trigger_id'] ?? null,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'trigger_type' => $validated['trigger_type'] ?? null,
                'trigger_config' => $validated['trigger_config'] ?? null,
                'status' => $validated['status'] ?? 'draft',
                'version' => 1,
                'is_template' => $validated['is_template'] ?? false,
                'metadata' => $validated['metadata'] ?? [],
            ]);

            // Store legacy data
            if (isset($validated['trigger'])) {
                $workflow->setLegacyTrigger($validated['trigger']);
            }
            if (isset($validated['actions'])) {
                $workflow->setLegacyActions($validated['actions']);
            }

            DB::commit();

            // Load relationships and return
            $workflow->load(['trigger', 'user']);
            
            // Transform for legacy compatibility
            $workflowData = $workflow->toArray();
            $effectiveTrigger = $workflow->getEffectiveTrigger();
            if ($effectiveTrigger) {
                $workflowData['trigger'] = [
                    'type' => $effectiveTrigger->type,
                    'config' => $effectiveTrigger->config ?? null,
                ];
                $workflowData['is_active'] = $workflow->status === 'active';
            }
            $workflowData['actions'] = $workflow->getLegacyActions();

            return response()->json($workflowData, 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Failed to create workflow: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified workflow.
     */
    public function show(Workflow $workflow)
    {
        $this->authorize('view', $workflow);
        
        // Load relationships
        $workflow->load(['trigger', 'user']);
        
        // Transform for legacy compatibility
        $workflowData = $workflow->toArray();
        
        // Add effective trigger
        $effectiveTrigger = $workflow->getEffectiveTrigger();
        if ($effectiveTrigger) {
            $workflowData['trigger'] = [
                'type' => $effectiveTrigger->type,
                'config' => $effectiveTrigger->config ?? null,
            ];
            $workflowData['is_active'] = $workflow->status === 'active';
        }

        // Add legacy actions
        $workflowData['actions'] = $workflow->getLegacyActions();

        return response()->json($workflowData);
    }

    /**
     * Update the specified workflow.
     */
    public function update(Request $request, Workflow $workflow)
    {
        $this->authorize('update', $workflow);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'trigger_id' => 'nullable|exists:triggers,id',
            'trigger_type' => ['nullable', Rule::in(['webhook', 'schedule', 'manual', 'event', 'lead_created', 'form_submitted'])],
            'trigger_config' => 'nullable|array',
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'draft'])],
            'is_template' => 'sometimes|boolean',
            'metadata' => 'nullable|array',
            
            // Legacy fields
            'trigger' => 'nullable|array',
            'actions' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        // Validate trigger ownership if provided
        if (isset($validated['trigger_id']) && $validated['trigger_id']) {
            $trigger = Trigger::where('id', $validated['trigger_id'])
                             ->where('user_id', Auth::id())
                             ->first();
            if (!$trigger) {
                return response()->json(['message' => 'Invalid trigger selected'], 422);
            }
        }

        DB::beginTransaction();
        try {
            // Handle legacy format conversion
            if (isset($validated['trigger'])) {
                $validated['trigger_type'] = $validated['trigger']['type'] ?? $workflow->trigger_type;
                $validated['trigger_config'] = $validated['trigger'];
                // Clear trigger_id when using inline trigger
                $validated['trigger_id'] = null;
            }

            // Handle legacy is_active
            if (isset($validated['is_active'])) {
                $validated['status'] = $validated['is_active'] ? 'active' : 'inactive';
            }

            // Update workflow
            $workflow->update($validated);

            // Update legacy data
            if (isset($validated['trigger'])) {
                $workflow->setLegacyTrigger($validated['trigger']);
            }
            if (isset($validated['actions'])) {
                $workflow->setLegacyActions($validated['actions']);
            }

            DB::commit();

            // Load relationships and return
            $workflow->load(['trigger', 'user']);
            
            // Transform for legacy compatibility
            $workflowData = $workflow->fresh()->toArray();
            $effectiveTrigger = $workflow->getEffectiveTrigger();
            if ($effectiveTrigger) {
                $workflowData['trigger'] = [
                    'type' => $effectiveTrigger->type,
                    'config' => $effectiveTrigger->config ?? null,
                ];
                $workflowData['is_active'] = $workflow->status === 'active';
            }
            $workflowData['actions'] = $workflow->getLegacyActions();

            return response()->json($workflowData);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Failed to update workflow: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified workflow.
     */
    public function destroy(Workflow $workflow)
    {
        $this->authorize('delete', $workflow);
        
        $workflow->delete();

        return response()->json(['message' => 'Workflow deleted successfully']);
    }

    /**
     * Duplicate a workflow.
     */
    public function duplicate(Workflow $workflow)
    {
        $this->authorize('view', $workflow);

        DB::beginTransaction();
        try {
            $newWorkflow = $workflow->replicate();
            $newWorkflow->name = $workflow->name . ' (Copy)';
            $newWorkflow->status = 'draft';
            $newWorkflow->user_id = Auth::id();
            $newWorkflow->total_runs = 0;
            $newWorkflow->success_runs = 0;
            $newWorkflow->failed_runs = 0;
            $newWorkflow->success_rate = 0;
            $newWorkflow->average_execution_time_ms = 0;
            $newWorkflow->last_run_at = null;
            $newWorkflow->is_template = false;
            $newWorkflow->save();

            // Copy legacy data
            $newWorkflow->setLegacyActions($workflow->getLegacyActions());
            $newWorkflow->setLegacyTrigger($workflow->getLegacyTrigger());

            DB::commit();

            return response()->json($newWorkflow->load(['trigger', 'user']), 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Failed to duplicate workflow: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Toggle workflow status.
     */
    public function toggleStatus(Workflow $workflow)
    {
        $this->authorize('update', $workflow);

        $newStatus = $workflow->status === 'active' ? 'inactive' : 'active';
        $workflow->update(['status' => $newStatus]);

        return response()->json($workflow->fresh()->load(['trigger', 'user']));
    }

    /**
     * Attach a trigger to workflow.
     */
    public function attachTrigger(Request $request, Workflow $workflow)
    {
        $this->authorize('update', $workflow);

        $validated = $request->validate([
            'trigger_id' => 'required|exists:triggers,id',
        ]);

        // Validate trigger ownership
        $trigger = Trigger::where('id', $validated['trigger_id'])
                         ->where('user_id', Auth::id())
                         ->first();
        
        if (!$trigger) {
            return response()->json(['message' => 'Invalid trigger selected'], 422);
        }

        $workflow->update([
            'trigger_id' => $validated['trigger_id'],
            'trigger_type' => null, // Clear inline trigger
            'trigger_config' => null,
        ]);

        $workflow->load(['trigger', 'user']);

        return response()->json($workflow);
    }

    /**
     * Detach trigger from workflow.
     */
    public function detachTrigger(Workflow $workflow)
    {
        $this->authorize('update', $workflow);

        $workflow->update([
            'trigger_id' => null,
        ]);

        return response()->json($workflow->fresh()->load(['trigger', 'user']));
    }

    /**
     * Get workflows without triggers.
     */
    public function withoutTriggers()
    {
        $workflows = Workflow::forUser(Auth::id())
                           ->whereNull('trigger_id')
                           ->whereNull('trigger_type')
                           ->get();

        return response()->json($workflows);
    }

    /**
     * Get workflow templates.
     */
    public function templates()
    {
        $templates = Workflow::forUser(Auth::id())
                           ->templates()
                           ->with(['trigger'])
                           ->get();

        return response()->json($templates);
    }
}