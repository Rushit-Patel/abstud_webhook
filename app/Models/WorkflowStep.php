<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkflowStep extends Model
{
    public const TYPE_ACTION = 'action';
    public const TYPE_CONDITION = 'condition';
    public const TYPE_DELAY = 'delay';
    public const TYPE_DATA_MAPPER = 'data_mapper';

    protected $fillable = [
        'workflow_id',
        'step_uid',
        'step_type',
        'config',
        'next_step_id',
        'true_branch_step_id',
        'false_branch_step_id',
        'error_handling',
        'field_mapping',
        'position',
        'is_active',
    ];

    protected $casts = [
        'config' => 'array',
        'error_handling' => 'array',
        'field_mapping' => 'array',
        'is_active' => 'boolean',
        'position' => 'integer',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function nextStep(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class, 'next_step_id');
    }

    public function trueBranch(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class, 'true_branch_step_id');
    }

    public function falseBranch(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class, 'false_branch_step_id');
    }

    public function stepRuns(): HasMany
    {
        return $this->hasMany(WorkflowStepRun::class);
    }

    public function getNextStepId($conditionResult = null): ?int
    {
        if ($this->step_type === self::TYPE_CONDITION) {
            return $conditionResult
                ? $this->true_branch_step_id
                : $this->false_branch_step_id;
        }

        return $this->next_step_id;
    }

    public function shouldRetry(): bool
    {
        if (!$this->error_handling) {
            return false;
        }

        $maxRetries = $this->error_handling['max_retries'] ?? 0;
        $currentRetries = $this->stepRuns()
            ->where('status', 'failed')
            ->count();

        return $currentRetries < $maxRetries;
    }
} 