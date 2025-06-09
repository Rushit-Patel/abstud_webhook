<?php

namespace App\Http\Controllers\Automation;

use App\Http\Controllers\Controller;
use App\Models\Workflow;
use App\Models\WorkflowTrigger;
use App\Models\DatabaseEventTrigger;
use App\Services\TriggerProcessingService;
use App\Services\TriggerRegistrationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class WorkflowTriggerController extends Controller
{
    public function __construct(
        private TriggerProcessingService $triggerService,
        private TriggerRegistrationService $registrationService
    ) {}

    public function store(Request $request, Workflow $workflow)
    {
        $this->authorize('update', $workflow);

        $validated = $request->validate([
            'trigger_name' => 'required|string|max:255',
            'trigger_type' => 'required|in:database_event,webhook,schedule,manual,api_event,field_condition,integration_event,facebook_lead_form,create_new_lead,update_lead_status,inbound_webhook',
            'event_source' => 'nullable|string',
            'event_action' => 'nullable|in:INSERT,UPDATE,DELETE,SELECT,ANY',
            'trigger_conditions' => 'required|array',
            'field_mappings' => 'nullable|array',
            'priority' => 'integer|min:1|max:1000',
            'cooldown_seconds' => 'integer|min:0',
            'database_config' => 'nullable|array',
            'config' => 'nullable|array' // For frontend trigger configuration
        ]);

        try {
            DB::transaction(function () use ($workflow, $validated) {
                // Map frontend trigger types to backend types
                $triggerTypeMapping = [
                    'create_new_lead' => 'api_event',
                    'update_lead_status' => 'field_condition',
                    'facebook_lead_form' => 'integration_event',
                    'inbound_webhook' => 'webhook'
                ];

                $backendTriggerType = $triggerTypeMapping[$validated['trigger_type']] ?? $validated['trigger_type'];

                // Build trigger conditions based on frontend config
                $triggerConditions = $this->buildTriggerConditions($validated['trigger_type'], $validated['config'] ?? [], $validated['trigger_conditions']);

                $trigger = $workflow->triggers()->create([
                    'trigger_name' => $validated['trigger_name'],
                    'trigger_type' => $backendTriggerType,
                    'event_source' => $this->getEventSource($validated['trigger_type'], $validated['config'] ?? []),
                    'event_action' => $this->getEventAction($validated['trigger_type'], $validated['config'] ?? []),
                    'trigger_conditions' => $triggerConditions,
                    'field_mappings' => $validated['field_mappings'] ?? [],
                    'priority' => $validated['priority'] ?? 100,
                    'cooldown_seconds' => $validated['cooldown_seconds'] ?? 0,
                    'is_active' => true
                ]);

                // Create database event trigger if needed
                if ($backendTriggerType === 'database_event' && !empty($validated['database_config'])) {
                    $trigger->databaseEventTrigger()->create([
                        'table_name' => $validated['database_config']['table_name'],
                        'column_filters' => $validated['database_config']['column_filters'] ?? null,
                        'value_conditions' => $validated['database_config']['value_conditions'] ?? null,
                        'operation' => $validated['event_action'] ?? 'ANY',
                        'capture_old_values' => $validated['database_config']['capture_old_values'] ?? false,
                        'capture_new_values' => $validated['database_config']['capture_new_values'] ?? true
                    ]);
                }

                // Register trigger with automation system
                $this->registrationService->registerTrigger($trigger, $validated['config'] ?? []);
            });

            return response()->json([
                'message' => 'Trigger created and linked to workflow successfully',
                'trigger' => $trigger->load('databaseEventTrigger'),
                'webhook_url' => $this->generateWebhookUrl($trigger)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create trigger',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function buildTriggerConditions(string $triggerType, array $config, array $existingConditions): array
    {
        switch ($triggerType) {
            case 'update_lead_status':
                return [
                    'conditions' => [
                        [
                            'field' => 'status',
                            'operator' => $config['includeAnyStatus'] ? 'not_empty' : 'equals',
                            'value' => $config['includeAnyStatus'] ? null : $config['toStatus'],
                            'from_value' => $config['includeAnyStatus'] ? null : $config['fromStatus']
                        ]
                    ],
                    'logic' => 'AND'
                ];

            case 'facebook_lead_form':
                return [
                    'conditions' => [
                        [
                            'field' => 'source',
                            'operator' => 'equals',
                            'value' => 'facebook'
                        ],
                        [
                            'field' => 'form_id',
                            'operator' => 'in',
                            'value' => $config['formIds'] ?? []
                        ]
                    ],
                    'logic' => 'AND'
                ];

            case 'inbound_webhook':
                return [
                    'conditions' => [
                        [
                            'field' => 'webhook_verified',
                            'operator' => 'equals',
                            'value' => true
                        ]
                    ],
                    'logic' => 'AND'
                ];

            case 'create_new_lead':
                return [
                    'conditions' => [
                        [
                            'field' => 'event_type',
                            'operator' => 'equals',
                            'value' => 'lead_created'
                        ]
                    ],
                    'logic' => 'AND'
                ];

            default:
                return $existingConditions;
        }
    }

    private function getEventSource(string $triggerType, array $config): ?string
    {
        switch ($triggerType) {
            case 'update_lead_status':
                return 'leads';
            case 'facebook_lead_form':
                return 'facebook_integration';
            case 'inbound_webhook':
                return 'webhook_endpoint';
            case 'create_new_lead':
                return 'lead_system';
            default:
                return null;
        }
    }

    private function getEventAction(string $triggerType, array $config): ?string
    {
        switch ($triggerType) {
            case 'update_lead_status':
                return 'UPDATE';
            case 'facebook_lead_form':
                return 'INSERT';
            case 'inbound_webhook':
                return 'INSERT';
            case 'create_new_lead':
                return 'INSERT';
            default:
                return null;
        }
    }

    private function generateWebhookUrl(WorkflowTrigger $trigger): ?string
    {
        if ($trigger->trigger_type === 'webhook') {
            return route('webhooks.receive', ['trigger' => $trigger->id]);
        }
        return null;
    }

    // ... rest of existing methods (validate, test, update, destroy)
}