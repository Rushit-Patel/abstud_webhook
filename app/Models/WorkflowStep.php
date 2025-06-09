<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkflowStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id',
        'step_type',
        'name',
        'config',
        'position',
        'parent_step_id',
        'conditions',
        'timeout_seconds',
        'retry_count',
        'enabled'
    ];

    protected $casts = [
        'config' => 'array',
        'conditions' => 'array',
        'enabled' => 'boolean'
    ];

    protected $attributes = [
        'timeout_seconds' => 300,
        'retry_count' => 0,
        'enabled' => true
    ];

    // Relationships
    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function parentStep(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class, 'parent_step_id');
    }

    public function childSteps(): HasMany
    {
        return $this->hasMany(WorkflowStep::class, 'parent_step_id');
    }

    public function executions(): HasMany
    {
        return $this->hasMany(WorkflowStepExecution::class, 'step_id');
    }

    // Scopes
    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('step_type', $type);
    }

    // Helper Methods
    public function getNextStep(): ?self
    {
        return $this->workflow->steps()
            ->where('position', '>', $this->position)
            ->orderBy('position')
            ->first();
    }

    public function validate(): array
    {
        $errors = [];

        switch ($this->step_type) {
            case 'email':
                if (empty($this->config['subject']) || empty($this->config['body'])) {
                    $errors[] = 'Email steps require subject and body';
                }
                break;
            case 'webhook':
                if (empty($this->config['url'])) {
                    $errors[] = 'Webhook steps require a URL';
                }
                break;
            case 'delay':
                if (empty($this->config['duration']) || empty($this->config['unit'])) {
                    $errors[] = 'Delay steps require duration and unit';
                }
                break;
        }

        return $errors;
    }
}