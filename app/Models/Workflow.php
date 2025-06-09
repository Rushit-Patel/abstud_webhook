<?php
// app/Models/Workflow.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Workflow extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'trigger_id',
        'name',
        'description',
        'trigger_type',
        'trigger_config',
        'status',
        'version',
        'is_template',
        'metadata',
        'last_run_at',
        'total_runs',
        'success_runs',
        'failed_runs',
        'success_rate',
        'average_execution_time_ms',
    ];

    protected $casts = [
        'trigger_config' => 'array',
        'metadata' => 'array',
        'is_template' => 'boolean',
        'last_run_at' => 'datetime',
        'success_rate' => 'decimal:2',
    ];

    protected $dates = [
        'last_run_at',
        'deleted_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function trigger()
    {
        return $this->belongsTo(Trigger::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByTriggerType($query, $type)
    {
        return $query->where('trigger_type', $type);
    }

    public function scopeTemplates($query)
    {
        return $query->where('is_template', true);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Check if workflow has a trigger (either attached or inline)
    public function hasTrigger()
    {
        return $this->trigger_id || $this->trigger_type;
    }

    // Get effective trigger (either from relationship or inline)
    public function getEffectiveTrigger()
    {
        if ($this->trigger) {
            return $this->trigger;
        }

        if ($this->trigger_type) {
            return (object) [
                'id' => null,
                'type' => $this->trigger_type,
                'config' => $this->trigger_config,
                'name' => ucwords(str_replace('_', ' ', $this->trigger_type)),
                'description' => 'Inline trigger',
            ];
        }

        return null;
    }

    // Get legacy actions from metadata
    public function getLegacyActions()
    {
        return $this->metadata['legacy_actions'] ?? [];
    }

    // Set legacy actions in metadata
    public function setLegacyActions($actions)
    {
        $metadata = $this->metadata ?? [];
        $metadata['legacy_actions'] = $actions;
        $this->metadata = $metadata;
        $this->save();
    }

    // Get legacy trigger from metadata
    public function getLegacyTrigger()
    {
        return $this->metadata['legacy_trigger'] ?? null;
    }

    // Set legacy trigger in metadata
    public function setLegacyTrigger($trigger)
    {
        $metadata = $this->metadata ?? [];
        $metadata['legacy_trigger'] = $trigger;
        $this->metadata = $metadata;
        $this->save();
    }

    // Calculate success rate
    public function updateSuccessRate()
    {
        if ($this->total_runs > 0) {
            $this->success_rate = ($this->success_runs / $this->total_runs) * 100;
        } else {
            $this->success_rate = 0;
        }
        $this->save();
    }

    // Get formatted status
    public function getFormattedStatusAttribute()
    {
        return ucfirst($this->status);
    }
}