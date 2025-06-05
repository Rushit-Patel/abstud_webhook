<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowTrigger extends Model
{
    // Add trigger type constants
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
        'is_active',
        'trigger_config', // New field for type-specific settings
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
} 