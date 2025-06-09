<?php

namespace App\Http\Controllers\Automation;

use App\Http\Controllers\Controller;
use App\Models\FacebookLeadForm;
use App\Models\Integration;
use App\Models\Workflow;
use App\Models\WorkflowExecution;
use App\Models\LeadField;
use App\Services\DataTableService;
use App\Services\WorkflowExecutionService;
use Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AutomationController extends Controller
{
    protected WorkflowExecutionService $executionService;

    public function __construct(WorkflowExecutionService $executionService)
    {
        $this->executionService = $executionService;
    }

    public function index()
    {
        $workflows = Workflow::with(['folder', 'steps'])
            ->byUser(Auth::id())
            ->latest()
            ->paginate(15);

        $recentExecutions = WorkflowExecution::with(['workflow'])
            ->whereHas('workflow', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->latest()
            ->limit(10)
            ->get();

        $stats = [
            'total_workflows' => Workflow::byUser(Auth::id())->count(),
            'active_workflows' => Workflow::byUser(Auth::id())->active()->count(),
            'total_executions_today' => WorkflowExecution::whereHas('workflow', function ($query) {
                $query->where('user_id', Auth::id());
            })->whereDate('created_at', today())->count(),
            'success_rate' => $this->calculateOverallSuccessRate()
        ];

        return Inertia::render('Automation/Index', [
            'workflows' => $workflows,
            'recentExecutions' => $recentExecutions,
            'stats' => $stats
        ]);
    }

    public function dashboard()
    {
        $userId = Auth::id();
        
        // Get workflow analytics
        $workflowStats = [
            'total' => Workflow::byUser($userId)->count(),
            'active' => Workflow::byUser($userId)->active()->count(),
            'executions_today' => WorkflowExecution::whereHas('workflow', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })->whereDate('created_at', today())->count(),
            'success_rate' => $this->calculateOverallSuccessRate()
        ];

        // Get recent activity
        $recentExecutions = WorkflowExecution::with(['workflow:id,name'])
            ->whereHas('workflow', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->latest()
            ->limit(5)
            ->get();

        // Get top performing workflows
        $topWorkflows = Workflow::byUser($userId)
            ->active()
            ->orderBy('success_rate', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'success_rate', 'total_runs']);

        return response()->json([
            'stats' => $workflowStats,
            'recent_executions' => $recentExecutions,
            'top_workflows' => $topWorkflows
        ]);
    }

    // Keep your existing methods for Facebook integration
    public function facebookPages()
    {
        $integration = Integration::where('user_id', Auth::id())
            ->where('type_id', '1')
            ->first();

        if (!$integration) {
            return response()->json(['error' => 'No Facebook integration found'], 404);
        }

        try {
            $meta = json_decode($integration->meta, true);
            
            if (!isset($meta['pages']) || !is_array($meta['pages'])) {
                return response()->json(['error' => 'No pages found in integration'], 404);
            }

            return response()->json([
                'data' => $meta['pages']
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to parse integration data'], 500);
        }
    }

    public function facebookForms(Request $request, $pageId)
    {
        $FacebookLeadForm = FacebookLeadForm::select([
            'form_name as name',
            'facebook_form_id as id'
        ])->where('facebook_page_id', $pageId)->get();

        if (!$FacebookLeadForm) {
            return response()->json(['error' => 'No Facebook Lead Form found'], 404);
        }

        try {
            return response()->json([
                'data' => $FacebookLeadForm
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to parse lead form data'], 500);
        }
    }

    public function facebookFormFields(Request $request)
    {
        $formId = $request->formId;
        $accessToken = $request->access_token;

        if (!$formId || !$accessToken) {
            return response()->json(['error' => 'Form ID and access token are required'], 400);
        }

        try {
            // Make request to Facebook Graph API to get form fields
            $response = Http::get("https://graph.facebook.com/v18.0/{$formId}", [
                'access_token' => $accessToken,
                'fields' => 'questions'
            ]);

            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to fetch form fields from Facebook'], $response->status());
            }

            $formData = $response->json();
            
            // Transform questions into fields format
            $fields = collect($formData['questions'] ?? [])
                ->map(function ($question) {
                    return [
                        'id' => $question['key'],
                        'name' => $question['label'],
                        'type' => $question['type']
                    ];
                })
                ->values()
                ->all();

            return response()->json($fields);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch form fields: ' . $e->getMessage()], 500);
        }
    }

    public function getLeadFields()
    {
        $fields = LeadField::where('is_active', true)
            ->orderBy('label')
            ->get(['id', 'name', 'label', 'type']);

        return response()->json($fields);
    }

    public function triggerWorkflow(Request $request, Workflow $workflow)
    {
        $this->authorize('execute', $workflow);

        $validated = $request->validate([
            'trigger_data' => 'required|array'
        ]);

        $execution = $this->executionService->execute(
            $workflow,
            $validated['trigger_data'],
            Auth::user()
        );

        return response()->json([
            'execution' => $execution,
            'message' => 'Workflow triggered successfully'
        ]);
    }

    private function calculateOverallSuccessRate(): float
    {
        $totalRuns = Workflow::byUser(Auth::id())->sum('total_runs');
        $successRuns = Workflow::byUser(Auth::id())->sum('success_runs');
        
        return $totalRuns > 0 ? round(($successRuns / $totalRuns) * 100, 2) : 0;
    }
}