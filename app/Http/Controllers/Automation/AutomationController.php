<?php

namespace App\Http\Controllers\Automation;

use App\Http\Controllers\Controller;
use App\Models\FacebookLeadForm;
use App\Models\Integration;
use App\Models\Workflow;
use App\Services\DataTableService;
use Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AutomationController extends Controller
{
    public function index()
    {
        return Inertia::render('Automation/Index', [
            'workflows' => []
        ]);
    }

    public function workflows(Request $request)
    {
        $workflows = Workflow::query()
            ->where('user_id', Auth::id());
            
        $dataTable = new DataTableService($workflows);
        $result = $dataTable->setDefaultSort('id', 'desc')
            ->process($request);

        return response()->json($result);
    }

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

    public function facebookForms(Request $request,$pageId)
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

    public function store()
    {
        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'required|boolean',
            'trigger' => 'required|array',
            'actions' => 'required|array',
        ]);

        $workflow = Workflow::create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Workflow created successfully',
            'workflow' => $workflow
        ]);
    }

    public function update(Workflow $workflow)
    {
        if ($workflow->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'required|boolean',
            'trigger' => 'required|array',
            'actions' => 'required|array',
        ]);

        $workflow->update($validated);

        return response()->json([
            'message' => 'Workflow updated successfully',
            'workflow' => $workflow
        ]);
    }

    public function destroy(Workflow $workflow)
    {
        if ($workflow->user_id !== Auth::id()) {
            abort(403);
        }
        
        $workflow->delete();
        return response()->json([
            'message' => 'Workflow deleted successfully'
        ]);
    }

    public function pipelines()
    {
        $user = Auth::user();
        $integration = Integration::where('user_id', $user->id)
            ->where('type_id','1')
            ->first();
        $integrationMeta = json_decode($integration->meta,true) ; 
        $pages = [];
        foreach ($integrationMeta['pages'] as $page) {
            $pages[] = [
                'id' => $page['id'],
                'name' => $page['name'],
            ];
        }
        return response()->json($pages);
    }

    public function whatsappTemplates()
    {
        $user = Auth::user();
        $integration = Integration::where('user_id', $user->id)
            ->where('type_id','1')
            ->first();
        $integrationMeta = json_decode($integration->meta,true) ; 
        $pages = [];
        foreach ($integrationMeta['pages'] as $page) {
            $pages[] = [
                'id' => $page['id'],
                'name' => $page['name'],
            ];
        }
        return response()->json($pages);
    }
}