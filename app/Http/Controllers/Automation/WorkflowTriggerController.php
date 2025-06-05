<?php

namespace App\Http\Controllers\Automation;

use App\Http\Controllers\Controller;
use App\Models\WorkflowTrigger;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WorkflowTriggerController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'workflow_id' => 'required|exists:workflows,id',
            'trigger_name' => 'required|string|max:255',
            'trigger_type' => 'required|string|max:255',
            'page_id' => 'nullable|string|max:255',
            'page_name' => 'nullable|string|max:255',
            'form_ids' => 'nullable|array',
            'form_ids.*' => 'string',
            'filters' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $trigger = WorkflowTrigger::create($validated);

        return response()->json([
            'message' => 'Workflow trigger created successfully',
            'trigger' => $trigger
        ], 201);
    }

    public function update(Request $request, WorkflowTrigger $trigger): JsonResponse
    {
        $validated = $request->validate([
            'trigger_name' => 'sometimes|string|max:255',
            'trigger_type' => 'sometimes|string|max:255',
            'page_id' => 'nullable|string|max:255',
            'page_name' => 'nullable|string|max:255',
            'form_ids' => 'nullable|array',
            'form_ids.*' => 'string',
            'filters' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $trigger->update($validated);

        return response()->json([
            'message' => 'Workflow trigger updated successfully',
            'trigger' => $trigger
        ]);
    }
} 