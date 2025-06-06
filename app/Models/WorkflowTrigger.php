<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowTrigger extends Model
{
    // Trigger type constants
    public const TRIGGER_FACEBOOK_LEAD = 'facebook_lead_form';
    public const TRIGGER_WEBHOOK = 'webhook';
    public const TRIGGER_SCHEDULED = 'scheduled';
    public const TRIGGER_CRM_EVENT = 'crm_event';
    public const TRIGGER_EMAIL_EVENT = 'email_event';

    protected $fillable = [
        'workflow_id',
        'trigger_name',
        'trigger_type',
        'page_id',
        'page_name',
        'form_ids',
        'filters',
        'trigger_config',
        'is_active',
    ];

    protected $casts = [
        'form_ids' => 'array',
        'filters' => 'array',
        'trigger_config' => 'array',
        'is_active' => 'boolean',
    ];

    public static function getAvailableTriggerTypes(): array
    {
        return [
            self::TRIGGER_FACEBOOK_LEAD => 'Facebook Lead Form',
            self::TRIGGER_WEBHOOK => 'Webhook',
            self::TRIGGER_SCHEDULED => 'Scheduled',
            self::TRIGGER_CRM_EVENT => 'CRM Event',
            self::TRIGGER_EMAIL_EVENT => 'Email Event',
        ];
    }

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function shouldTrigger(array $payload): bool
    {
        if (!$this->is_active) {
            return false;
        }

        switch ($this->trigger_type) {
            case self::TRIGGER_FACEBOOK_LEAD:
                return $this->shouldTriggerForFacebookLead($payload);
            
            case self::TRIGGER_WEBHOOK:
                return $this->shouldTriggerForWebhook($payload);
                
            default:
                return true;
        }
    }

    private function shouldTriggerForFacebookLead(array $payload): bool
    {
        // Check if payload matches Facebook lead form criteria
        if (isset($payload['object']) && $payload['object'] !== 'page') {
            return false;
        }

        if (empty($payload['entry'])) {
            return false;
        }

        foreach ($payload['entry'] as $entry) {
            // Check page ID if specified
            if ($this->page_id && $entry['id'] !== $this->page_id) {
                continue;
            }

            // Check form IDs if specified
            if ($this->form_ids && !empty($entry['changes'])) {
                foreach ($entry['changes'] as $change) {
                    if (isset($change['value']['form_id']) && 
                        in_array($change['value']['form_id'], $this->form_ids)) {
                        return $this->applyFilters($payload);
                    }
                }
            } else {
                return $this->applyFilters($payload);
            }
        }

        return false;
    }

    private function shouldTriggerForWebhook(array $payload): bool
    {
        return $this->applyFilters($payload);
    }

    private function applyFilters(array $payload): bool
    {
        if (empty($this->filters)) {
            return true;
        }

        // Apply custom filters based on your requirements
        foreach ($this->filters as $filter) {
            if (!$this->evaluateFilter($filter, $payload)) {
                return false;
            }
        }

        return true;
    }

    private function evaluateFilter(array $filter, array $payload): bool
    {
        // Implement your filter logic here
        // Example: check if a field contains specific value
        $field = $filter['field'] ?? null;
        $operator = $filter['operator'] ?? 'equals';
        $value = $filter['value'] ?? null;

        if (!$field || $value === null) {
            return true;
        }

        $payloadValue = data_get($payload, $field);

        switch ($operator) {
            case 'equals':
                return $payloadValue == $value;
            case 'contains':
                return str_contains(strtolower($payloadValue), strtolower($value));
            case 'not_empty':
                return !empty($payloadValue);
            default:
                return true;
        }
    }
}