<?php

namespace App\Services\Integrations;

use App\Models\FacebookFormFieldMapping;
use App\Models\FacebookLeadForm;
use App\Models\Integration;
use App\Models\IntegrationType;
use App\Models\Lead;
use App\Models\LeadField;
use App\Models\LeadFieldValue;
use App\Models\OauthToken;
use Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\DB;

class FacebookService
{
    protected $appId;
    protected $appSecret;
    protected $redirectUri;
    protected $graphUrl;

    public function __construct()
    {
        $this->appId = config('services.facebook.client_id');
        $this->appSecret = config('services.facebook.client_secret');
        $this->redirectUri = config('services.facebook.redirect');
        $this->graphUrl = 'https://graph.facebook.com/v18.0';
    }

    public function getFacebookRedirectUrl()
    {
        return Socialite::driver('facebook')
            ->scopes([
                'leads_retrieval',
                'pages_show_list',
                'pages_manage_ads',
                'pages_read_engagement',
                'pages_manage_metadata',
                'email',
                'business_management',
                'ads_management'
            ])
            ->redirect()
            ->getTargetUrl();
    }


    public function handleFacebookCallback(): bool
    {
        try {
            $facebookUser = Socialite::driver('facebook')->stateless()->user();
            $user = Auth::user();
            $token = $facebookUser->token;

            // Ensure integration type exists
            $integrationType = IntegrationType::firstOrCreate(
                ['slug' => 'facebook-lead'],
                ['name' => 'Facebook Lead', 'auth_config' => null]
            );

            // Create or update integration record
            $integration = Integration::updateOrCreate(
                [
                    'type_id' => $integrationType->id,
                    'user_id' => $user->id,
                    'name' => "FB: {$facebookUser->getName()}",
                ],
                [
                    'credentials' => json_encode([
                        'facebook_id' => $facebookUser->getId(),
                        'name' => $facebookUser->getName(),
                        'email' => $facebookUser->getEmail(),
                        'avatar' => $facebookUser->getAvatar(),
                    ]),
                    'is_active' => true,
                ]
            );

            // Store token
            OauthToken::updateOrCreate(
                ['integration_id' => $integration->id],
                [
                    'access_token' => $token,
                    'refresh_token' => $facebookUser->refreshToken ?? null,
                    'expires_at' => now()->addSeconds($facebookUser->expiresIn ?? 3600),
                    'scope' => implode(',', $facebookUser->approvedScopes ?? []),
                ]
            );

            // Fetch pages
            $pages = Http::get("{$this->graphUrl}/{$facebookUser->id}/accounts", [
                'access_token' => $token,
            ])->json('data');

            $meta = json_decode($integration->meta ?? '{}', true);
            $meta['pages'] = $pages;
            $integration->meta = json_encode($meta);
            $integration->save();

            return true;
        } catch (\Throwable $e) {
            Log::error('Facebook callback failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    public function getUserForms($pageId,string $PageToken)
    {
        $queryParams = [
            'access_token' => $PageToken,
            'fields' => 'leads_count,name,id,question_page_custom_headline,status,tracking_parameters,page_id,created_time,expired_leads_count,organic_leads_count,questions',
        ];
        $response = Http::get($this->graphUrl . '/'.$pageId.'/leadgen_forms', $queryParams);

        return $response->json();
    }

    public function verifyWebhook($hub_mode, $hub_verify_token, $hub_challenge)
    {
        $verifyToken = config('services.facebook.webhook_verify_token');

        if ($hub_mode === 'subscribe' && $hub_verify_token === $verifyToken) {
            return response($hub_challenge, 200);
        }

        return response('Forbidden', 403);
    }

    public function handleLeadWebhook($payload)
    {
        try {
            Log::info('Received Facebook Lead:', [$payload]);

            // Extract lead data
            $leadId = $payload['entry'][0]['changes'][0]['value']['leadgen_id'] ?? null;
            $pageId = $payload['entry'][0]['changes'][0]['value']['page_id'] ?? null;
            $formId = $payload['entry'][0]['changes'][0]['value']['form_id'] ?? null;

            if (!$leadId || !$pageId) {
                Log::error('Missing lead ID or page ID in webhook payload');
                return false;
            }
            $integration = Integration::whereRaw(
                'JSON_CONTAINS(
                    JSON_EXTRACT(JSON_UNQUOTE(meta), "$.pages[*].id"), 
                    ?
                )', ['"'.$pageId.'"']
            )
            ->first();

            if (!$integration) {
                Log::error("No integration found for page ID: {$pageId}");
                return false;
            }

            // Get the page token
            $pageToken = null;
            $meta = json_decode($integration->meta, true);
            foreach ($meta['pages'] as $page) {
                if ($page['id'] === $pageId) {
                    $pageToken = $page['access_token'];
                    break;
                }
            }

            if (!$pageToken) {
                Log::error("No page token found for page ID: {$pageId}");
                return false;
            }
            // Get lead details from Facebook
            $leadDetails = $this->getLeadDetails($leadId, $pageToken);
            if (!$leadDetails) {
                Log::error("Failed to fetch lead details for lead ID: {$leadId}");
                return false;
            }

            // Find the form mapping
            $formMapping = FacebookLeadForm::where('integration_id', $integration->id)
                ->where('facebook_form_id', $formId)
                ->where('facebook_page_id', $pageId)
                ->first();

            // Create a new lead record
            $lead = new Lead();
            $lead->raw_payload = json_encode([
                'webhook' => $payload,
                'lead_details' => $leadDetails,
            ]);
            $lead->save();

            // Process field mappings if available
            $fieldValues = [];
            
            if ($formMapping) {
                // Get all field mappings for this form
                $fieldMappings = FacebookFormFieldMapping::where('facebook_lead_form_id', $formMapping->id)
                    ->get()
                    ->keyBy('facebook_field_name');

                // Process each field from the lead data
                foreach ($leadDetails['field_data'] as $fieldData) {
                    $fbFieldName = $fieldData['name'];
                    $fbFieldValue = $fieldData['values'][0] ?? null;
                    
                    // Check if we have a mapping for this field
                    if (isset($fieldMappings[$fbFieldName])) {
                        $mapping = $fieldMappings[$fbFieldName];
                        
                        // Store the mapped field value
                        $fieldValues[] = [
                            'lead_id' => $lead->id,
                            'lead_field_id' => $mapping->lead_field_id,
                            'value' => $fbFieldValue,
                            'created_at' => now(),
                            'updated_at' => now()
                        ];
                    } else {
                        // For unmapped fields, try to find a matching field by name
                        $matchingField = LeadField::where('name', $fbFieldName)
                            ->orWhere('name', strtolower($fbFieldName))
                            ->orWhere('label', $fbFieldName)
                            ->first();
                        
                        if ($matchingField) {
                            $fieldValues[] = [
                                'lead_id' => $lead->id,
                                'lead_field_id' => $matchingField->id,
                                'value' => $fbFieldValue,
                                'created_at' => now(),
                                'updated_at' => now()
                            ];
                        } else {
                            // Log unmapped fields
                            Log::info("Unmapped field from Facebook: {$fbFieldName} = {$fbFieldValue}");
                        }
                    }
                }
                
                // Bulk insert field values
                if (!empty($fieldValues)) {
                    LeadFieldValue::insert($fieldValues);
                }
            } else {
                // If no form mapping exists, try to create generic field mappings for all fields
                Log::warning("No form mapping found for form ID: {$formId}. Creating generic mappings.");
                
                foreach ($leadDetails['field_data'] as $fieldData) {
                    $fbFieldName = $fieldData['name'];
                    $fbFieldValue = $fieldData['values'][0] ?? null;
                    
                    // Try to find a matching field by name
                    $matchingField = LeadField::where('name', $fbFieldName)
                        ->orWhere('name', strtolower($fbFieldName))
                        ->orWhere('label', $fbFieldName)
                        ->first();
                    
                    if ($matchingField) {
                        $fieldValues[] = [
                            'lead_id' => $lead->id,
                            'lead_field_id' => $matchingField->id,
                            'value' => $fbFieldValue,
                            'created_at' => now(),
                            'updated_at' => now()
                        ];
                    }
                }
                
                // Bulk insert field values
                if (!empty($fieldValues)) {
                    LeadFieldValue::insert($fieldValues);
                }
            }

            Log::info("Successfully processed Facebook lead: {$leadId}");
            return true;
        } catch (\Throwable $th) {
            Log::error('Error Handling Facebook Lead: ' . $th->getMessage(), [
                'exception' => $th,
                'payload' => $payload
            ]);
            return false;
        }
    }

    /**
     * Fetch lead details from Facebook Graph API
     * 
     * @param string $leadId
     * @param string $pageToken
     * @return array|null
     */
    public function getLeadDetails($leadId, $pageToken)
    {
        try {
            $response = Http::get("{$this->graphUrl}/{$leadId}", [
                'access_token' => $pageToken,
                'fields' => 'campaign_name,field_data,platform,created_time,ad_name',
            ]);
            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Failed to fetch lead details from Facebook', [
                'lead_id' => $leadId,
                'response' => $response->json()
            ]);
            
            return null;
        } catch (\Throwable $th) {
            Log::error('Exception when fetching lead details from Facebook', [
                'lead_id' => $leadId,
                'message' => $th->getMessage()
            ]);
            
            return null;
        }
    }
}
