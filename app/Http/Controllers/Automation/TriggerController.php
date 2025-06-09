<?php
// app/Http/Controllers/Automation/TriggerController.php

namespace App\Http\Controllers\Automation;

use App\Http\Controllers\Controller;
use App\Models\Trigger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class TriggerController extends Controller
{
    /**
     * Display a listing of triggers.
     */
    public function index(Request $request)
    {
        $query = Trigger::where('user_id', Auth::id());

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by name or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter templates
        if ($request->has('templates')) {
            $query->where('is_template', $request->boolean('templates'));
        }

        $triggers = $query->orderBy('updated_at', 'desc')
                         ->withCount('workflows')
                         ->get();

        return response()->json($triggers);
    }

    /**
     * Store a newly created trigger.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => ['required', Rule::in(['webhook', 'schedule', 'manual', 'event', 'lead_created', 'form_submitted'])],
            'config' => 'nullable|array',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'draft'])],
            'is_template' => 'nullable|boolean',
            'metadata' => 'nullable|array',
        ]);

        $trigger = Trigger::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'config' => $validated['config'] ?? null,
            'status' => $validated['status'] ?? 'draft',
            'is_template' => $validated['is_template'] ?? false,
            'metadata' => $validated['metadata'] ?? null,
        ]);

        return response()->json($trigger->load('user'), 201);
    }

    /**
     * Display the specified trigger.
     */
    public function show(Trigger $trigger)
    {
        $this->authorize('view', $trigger);
        
        return response()->json($trigger->load(['user', 'workflows']));
    }

    /**
     * Update the specified trigger.
     */
    public function update(Request $request, Trigger $trigger)
    {
        $this->authorize('update', $trigger);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => ['sometimes', Rule::in(['webhook', 'schedule', 'manual', 'event', 'lead_created', 'form_submitted'])],
            'config' => 'nullable|array',
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'draft'])],
            'is_template' => 'sometimes|boolean',
            'metadata' => 'nullable|array',
        ]);

        $trigger->update($validated);

        return response()->json($trigger->fresh()->load('user'));
    }

    /**
     * Remove the specified trigger.
     */
    public function destroy(Trigger $trigger)
    {
        $this->authorize('delete', $trigger);
        
        // Check if trigger is being used
        if ($trigger->isInUse()) {
            return response()->json([
                'message' => 'Cannot delete trigger. It is currently being used by workflows.',
                'workflows_count' => $trigger->workflows()->count()
            ], 422);
        }
        
        $trigger->delete();

        return response()->json(['message' => 'Trigger deleted successfully']);
    }

    /**
     * Duplicate a trigger.
     */
    public function duplicate(Trigger $trigger)
    {
        $this->authorize('view', $trigger);

        $newTrigger = $trigger->replicate();
        $newTrigger->name = $trigger->name . ' (Copy)';
        $newTrigger->status = 'draft';
        $newTrigger->user_id = Auth::id();
        $newTrigger->is_template = false;
        $newTrigger->save();

        return response()->json($newTrigger->load('user'), 201);
    }

    /**
     * Toggle trigger status.
     */
    public function toggleStatus(Trigger $trigger)
    {
        $this->authorize('update', $trigger);

        $newStatus = $trigger->status === 'active' ? 'inactive' : 'active';
        $trigger->update(['status' => $newStatus]);

        return response()->json($trigger->fresh());
    }

    /**
     * Get triggers by type.
     */
    public function byType($type)
    {
        $triggers = Trigger::forUser(Auth::id())
                          ->byType($type)
                          ->active()
                          ->get();

        return response()->json($triggers);
    }

    /**
     * Get trigger templates.
     */
    public function templates()
    {
        $templates = Trigger::forUser(Auth::id())
                           ->templates()
                           ->get();

        return response()->json($templates);
    }
}