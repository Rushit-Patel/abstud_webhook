<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Workflow extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'is_active',
        'trigger',
        'actions',
        'user_id',
        'version',
        'parent_workflow_id',
        'error_handling_config',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'trigger' => 'array',
        'actions' => 'array',
        'error_handling_config' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trigger(): HasOne
    {
        return $this->hasOne(WorkflowTrigger::class);
    }

    public function steps(): HasMany
    {
        return $this->hasMany(WorkflowStep::class)->orderBy('position');
    }

    public function runs(): HasMany
    {
        return $this->hasMany(WorkflowRun::class);
    }

    public function stepRuns(): HasMany
    {
        return $this->hasMany(WorkflowStepRun::class);
    }

    public function getFirstStep(): ?WorkflowStep
    {
        return $this->steps()->orderBy('position')->first();
    }

    public function isTriggeredBy(array $payload): bool
    {
        $trigger = $this->trigger;
        
        if (!$trigger || !$this->is_active) {
            return false;
        }

        return $trigger->shouldTrigger($payload);
    }
}