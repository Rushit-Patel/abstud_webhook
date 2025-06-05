<?php

namespace App\Http\Controllers\Settings\Integrations;

use App\Models\FacebookFormFieldMapping;
use App\Models\FacebookLeadForm;
use App\Models\Integration;
use App\Models\LeadField;
use App\Services\DataTableService;
use App\Services\Integrations\FacebookService;
use Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Log;

class FacebookController extends Controller
{
    protected $facebookService;

    public function __construct(FacebookService $facebookService)
    {
        $this->facebookService = $facebookService;
    }

    public function redirectToFacebook(): RedirectResponse
    {
        $redirectUrl = $this->facebookService->getFacebookRedirectUrl();
        return redirect($redirectUrl);
    }
    public function handleFacebookCallback()
    {
        $success = $this->facebookService->handleFacebookCallback();
    
        if ($success) {
            return redirect()->route('integrations.index')->with('success', 'Facebook account connected successfully.');
        } else {
            return redirect()->route('integrations.index')->with('error', 'Failed to connect Facebook account.');
        }
    }

    public function verificationWebhooks(Request $request)
    {

        $hub_mode = $request->hub_mode;
        $hub_verify_token = $request->hub_verify_token;
        $hub_challenge = $request->hub_challenge;
        
        return $this->facebookService->verifyWebhook($hub_mode, $hub_verify_token, $hub_challenge);
    }

    public function handleLeadWebhook(Request $request)
    {
        // dd($request);
        return $this->facebookService->handleLeadWebhook($request);
    }

    public function datatable(Request $request) 
    {
        
        $leadForm = FacebookLeadForm::query();
        $leadForm = $leadForm->withCount('fieldMappings');
        
        $dataTable = new DataTableService($leadForm);

        $leadForm = $dataTable->setDefaultSort('id', 'asc')
            ->process($request);
        return response()->json($leadForm);
    } 

    public function fetchForms()
    {
        $integrationFacebook = Integration::where('user_id', Auth::id())
                                ->where('type_id', '1')
                                ->first();
    
        if (!$integrationFacebook) {
            return response()->json(['error' => 'Facebook integration not found.'], 404);
        }
    
        $facebookMetaArray = json_decode($integrationFacebook->meta, true);
        $facebookPages = $facebookMetaArray['pages'] ?? [];
    
        foreach ($facebookPages as $page) {
            $response = $this->facebookService->getUserForms($page['id'], $page['access_token']);
            $forms = $response['data'] ?? [];
        
            if (!empty($forms)) {
                foreach ($forms as $form) {
                    FacebookLeadForm::updateOrCreate(
                        [
                            'integration_id'   => $integrationFacebook->id,
                            'facebook_form_id' => $form['id'],
                        ],
                        [
                            'facebook_page_id' => $page['id'],
                            'form_name'        => $form['name'],
                            'questions'        => json_encode($form['questions'] ?? []),
                        ]
                    );
                }
            }
        }
    
        return response()->json(['success' => true, 'message' => 'Forms fetched successfully.']);
    }

     public function getLeadFields()
    {
        try {
            $leadFields = LeadField::where('is_active', true)
                ->select('id', 'name', 'label', 'type')
                ->get();

            return response()->json([
                'success' => true,
                'lead_fields' => $leadFields
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching lead fields: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch lead fields'
            ], 500);
        }
    }

    /**
     * Get existing mappings for a specific form
     */
    public function getFormMappings(Request $request)
    {
        try {
            $request->validate([
                'form_id' => 'required|string'
            ]);

            $form = FacebookLeadForm::where('facebook_form_id', $request->form_id)->first();
            
            if (!$form) {
                return response()->json([
                    'success' => false,
                    'message' => 'Form not found'
                ], 404);
            }

            $mappings = FacebookFormFieldMapping::where('facebook_lead_form_id', $form->id)
                ->with('leadField:id,name,label')
                ->get()
                ->map(function ($mapping) {
                    return [
                        'facebook_field_name' => $mapping->facebook_field_name,
                        'lead_field_id' => $mapping->lead_field_id
                    ];
                });

            return response()->json([
                'success' => true,
                'mappings' => $mappings
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching form mappings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch mappings'
            ], 500);
        }
    }

    /**
     * Save field mappings for a form
     */
    public function saveMappings(Request $request)
    {
        try {
            $validated = $request->validate([
                'form_id' => 'required|string',
                'mappings' => 'required|array',
                'mappings.*.facebook_field_name' => 'required|string',
                'mappings.*.lead_field_id' => 'required|integer'
            ]);

            DB::beginTransaction();

            $form = FacebookLeadForm::where('facebook_form_id', $validated['form_id'])->first();
            
            if (!$form) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Form not found'
                ], 404);
            }

            // Delete existing mappings
            FacebookFormFieldMapping::where('facebook_lead_form_id', $form->id)->delete();

            // Create new mappings
            foreach ($validated['mappings'] as $mapping) {
                FacebookFormFieldMapping::create([
                    'facebook_lead_form_id' => $form->id,
                    'facebook_field_name' => $mapping['facebook_field_name'],
                    'lead_field_id' => $mapping['lead_field_id']
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mappings saved successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saving mappings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to save mappings: ' . $e->getMessage()
            ], 500);
        }
    }
    
}