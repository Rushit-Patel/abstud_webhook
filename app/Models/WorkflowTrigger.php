<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class WorkflowTrigger extends Model
{
    protected $fillable = [
        'workflow_id',
        'trigger_name',
        'trigger_type',
        'event_source',
        'event_action',
        'trigger_conditions',
        'field_mappings',
        'priority',
        'is_active',
        'cooldown_seconds',
        'last_triggered_at'
    ];

    protected $casts = [
        'trigger_conditions' => 'array',
        'field_mappings' => 'array',
        'is_active' => 'boolean',
        'last_triggered_at' => 'datetime'
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function databaseEventTrigger(): HasOne
    {
        return $this->hasOne(DatabaseEventTrigger::class, 'trigger_id');
    }

    public function eventLogs(): HasMany
    {
        return $this->hasMany(TriggerEventLog::class, 'trigger_id');
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(TriggerMetric::class, 'trigger_id');
    }

    // Check if trigger conditions are met
    public function evaluateConditions(array $eventData): bool
    {
        if (empty($this->trigger_conditions)) {
            return true;
        }

        return $this->matchesConditions($eventData, $this->trigger_conditions);
    }

    private function matchesConditions(array $data, array $conditions): bool
    {
        foreach ($conditions as $condition) {
            $field = $condition['field'] ?? null;
            $operator = $condition['operator'] ?? 'equals';
            $value = $condition['value'] ?? null;

            if (!$field) continue;

            $actualValue = data_get($data, $field);

            switch ($operator) {
                case 'equals':
                    if ($actualValue != $value) return false;
                    break;
                case 'not_equals':
                    if ($actualValue == $value) return false;
                    break;
                case 'contains':
                    if (!str_contains(strtolower($actualValue), strtolower($value))) return false;
                    break;
                case 'starts_with':
                    if (!str_starts_with(strtolower($actualValue), strtolower($value))) return false;
                    break;
                case 'greater_than':
                    if (!($actualValue > $value)) return false;
                    break;
                case 'less_than':
                    if (!($actualValue < $value)) return false;
                    break;
                case 'is_empty':
                    if (!empty($actualValue)) return false;
                    break;
                case 'is_not_empty':
                    if (empty($actualValue)) return false;
                    break;
            }
        }

        return true;
    }

    public function canTrigger(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->cooldown_seconds > 0 && $this->last_triggered_at) {
            $secondsSinceLastTrigger = now()->diffInSeconds($this->last_triggered_at);
            if ($secondsSinceLastTrigger < $this->cooldown_seconds) {
                return false;
            }
        }

        return true;
    }
}