<?php

namespace App\Http\Controllers\Automation;

use App\Http\Controllers\Controller;
use App\Models\Workflow;
use App\Models\WorkflowFolder;
use App\Services\WorkflowExecutionService;
use App\Services\DataTableService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class WorkflowController extends Controller
{
    protected WorkflowExecutionService $executionService;
    protected DataTableService $dataTableService;

    public function __construct(
        WorkflowExecutionService $executionService,
        DataTableService $dataTableService
    ) {
        $this->executionService = $executionService;
        $this->dataTableService = $dataTableService;
    }

    public function index(Request $request)
    {
        $query = Workflow::with(['folder', 'steps'])
            ->byUser(Auth::id())
            ->latest();

        // Apply filters
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('folder_id')) {
            $query->where('folder_id', $request->folder_id);
        }

        $workflows = $query->paginate(15);

        $folders = WorkflowFolder::where('user_id', Auth::id())
            ->withCount('workflows')
            ->orderBy('sort_order')
            ->get();

        $stats = [
            'total' => Workflow::byUser(Auth::id())->count(),
            'active' => Workflow::byUser(Auth::id())->active()->count(),
            'templates' => Workflow::byUser(Auth::id())->templates()->count(),
            'total_executions_today' => DB::table('workflow_executions')
                ->join('workflows', 'workflow_executions.workflow_id', '=', 'workflows.id')
                ->where('workflows.user_id', Auth::id())
                ->whereDate('workflow_executions.created_at', today())
                ->count()
        ];

        return Inertia::render('Automation/Index', [
            'workflows' => $workflows,
            'folders' => $folders,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'folder_id'])
        ]);
    }

    public function create()
    {
        $folders = WorkflowFolder::where('user_id', Auth::id())
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Automation/WorkflowBuilder', [
            'workflow' => null,
            'folders' => $folders
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger' => 'required|array',
            'trigger.type' => 'required|string',
            'actions' => 'required|array|min:1',
            'is_active' => 'boolean',
            'folder_id' => 'nullable|exists:workflow_folders,id',
            'tags' => 'nullable|array'
        ]);

        DB::transaction(function () use ($validated) {
            $workflow = Workflow::create([
                'user_id' => Auth::id(),
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'trigger_type' => $validated['trigger']['type'],
                'trigger_config' => $validated['trigger'],
                'status' => $validated['is_active'] ? 'active' : 'draft',
                'folder_id' => $validated['folder_id'] ?? null,
                'metadata' => [
                    'tags' => $validated['tags'] ?? []
                ]
            ]);

            // Create workflow steps
            foreach ($validated['actions'] as $index => $action) {
                $workflow->steps()->create([
                    'step_type' => $action['type'],
                    'name' => $action['name'] ?? $action['type'],
                    'config' => $action,
                    'position' => $index + 1,
                    'enabled' => $action['enabled'] ?? true
                ]);
            }

            return $workflow;
        });

        return redirect()->route('automation.workflows.index')
            ->with('success', 'Workflow created successfully');
    }

    public function show(Workflow $workflow)
    {
        $this->authorize('view', $workflow);

        $workflow->load(['steps', 'executions' => function ($query) {
            $query->latest()->limit(10);
        }]);

        return Inertia::render('Automation/WorkflowDetail', [
            'workflow' => $workflow
        ]);
    }

    public function edit(Workflow $workflow)
    {
        $this->authorize('update', $workflow);

        $folders = WorkflowFolder::where('user_id', Auth::id())
            ->orderBy('sort_order')
            ->get();

        $workflow->load('steps');

        return Inertia::render('Automation/WorkflowBuilder', [
            'workflow' => $workflow,
            'folders' => $folders
        ]);
    }

    public function update(Request $request, Workflow $workflow)
    {
        $this->authorize('update', $workflow);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger' => 'required|array',
            'trigger.type' => 'required|string',
            'actions' => 'required|array|min:1',
            'is_active' => 'boolean',
            'folder_id' => 'nullable|exists:workflow_folders,id',
            'tags' => 'nullable|array'
        ]);

        DB::transaction(function () use ($workflow, $validated) {
            $workflow->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'trigger_type' => $validated['trigger']['type'],
                'trigger_config' => $validated['trigger'],
                'status' => $validated['is_active'] ? 'active' : 'draft',
                'folder_id' => $validated['folder_id'] ?? null,
                'metadata' => [
                    'tags' => $validated['tags'] ?? []
                ],
                'version' => $workflow->version + 1
            ]);

            // Remove existing steps and create new ones
            $workflow->steps()->delete();

            foreach ($validated['actions'] as $index => $action) {
                $workflow->steps()->create([
                    'step_type' => $action['type'],
                    'name' => $action['name'] ?? $action['type'],
                    'config' => $action,
                    'position' => $index + 1,
                    'enabled' => $action['enabled'] ?? true
                ]);
            }
        });

        return redirect()->route('automation.workflows.index')
            ->with('success', 'Workflow updated successfully');
    }

    public function destroy(Workflow $workflow)
    {
        $this->authorize('delete', $workflow);

        $workflow->delete();

        return redirect()->route('automation.workflows.index')
            ->with('success', 'Workflow deleted successfully');
    }

    public function execute(Request $request, Workflow $workflow)
    {
        $this->authorize('execute', $workflow);

        if (!$workflow->isExecutable()) {
            return response()->json([
                'error' => 'Workflow is not executable'
            ], 422);
        }

        $execution = $this->executionService->execute(
            $workflow,
            $request->input('trigger_data', []),
            Auth::user()
        );

        return response()->json([
            'execution' => $execution,
            'message' => 'Workflow execution started'
        ]);
    }

    public function duplicate(Workflow $workflow)
    {
        $this->authorize('view', $workflow);

        $newWorkflow = $workflow->duplicate();

        return redirect()->route('automation.workflows.edit', $newWorkflow)
            ->with('success', 'Workflow duplicated successfully');
    }

    public function toggle(Workflow $workflow)
    {
        $this->authorize('update', $workflow);

        $workflow->update([
            'status' => $workflow->status === 'active' ? 'inactive' : 'active'
        ]);

        return response()->json([
            'status' => $workflow->status,
            'message' => "Workflow {$workflow->status}"
        ]);
    }

    public function analytics(Workflow $workflow)
    {
        $this->authorize('view', $workflow);

        $metrics = $workflow->metrics()
            ->where('date', '>=', now()->subDays(30))
            ->orderBy('date')
            ->get();

        $recentExecutions = $workflow->executions()
            ->latest()
            ->limit(50)
            ->get(['status', 'execution_time_ms', 'created_at']);

        return response()->json([
            'metrics' => $metrics,
            'recent_executions' => $recentExecutions,
            'summary' => [
                'total_runs' => $workflow->total_runs,
                'success_rate' => $workflow->success_rate,
                'avg_execution_time' => $workflow->average_execution_time_ms,
                'last_run' => $workflow->last_run_at
            ]
        ]);
    }
}