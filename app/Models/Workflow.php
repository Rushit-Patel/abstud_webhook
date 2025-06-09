<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Workflow extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'trigger_type',
        'trigger_config',
        'status',
        'version',
        'is_template',
        'metadata',
        'folder_id',
        'last_run_at',
        'total_runs',
        'success_runs',
        'failed_runs',
        'success_rate',
        'average_execution_time_ms'
    ];

    protected $casts = [
        'trigger_config' => 'array',
        'metadata' => 'array',
        'is_template' => 'boolean',
        'last_run_at' => 'datetime',
        'success_rate' => 'decimal:2'
    ];

    protected $attributes = [
        'status' => 'draft',
        'version' => 1,
        'total_runs' => 0,
        'success_runs' => 0,
        'failed_runs' => 0,
        'success_rate' => 0.00,
        'average_execution_time_ms' => 0
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(WorkflowFolder::class, 'folder_id');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(WorkflowStep::class)->orderBy('position');
    }

    public function executions(): HasMany
    {
        return $this->hasMany(WorkflowExecution::class);
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(WorkflowMetric::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(WorkflowAuditLog::class);
    }

    public function errors(): HasMany
    {
        return $this->hasMany(WorkflowError::class);
    }

    public function variables(): HasMany
    {
        return $this->hasMany(WorkflowVariable::class);
    }

    public function leadTriggers(): HasMany
    {
        return $this->hasMany(LeadWorkflowTrigger::class);
    }

    public function scheduledRuns(): HasMany
    {
        return $this->hasMany(ScheduledWorkflowRun::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeTemplates($query)
    {
        return $query->where('is_template', true);
    }

    // Accessors & Mutators
    public function successRate(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->total_runs === 0) return 0;
                return round(($this->success_runs / $this->total_runs) * 100, 2);
            }
        );
    }

    // Helper Methods
    public function updateStats(): void
    {
        $this->update([
            'success_rate' => $this->successRate,
            'last_run_at' => $this->executions()->latest()->first()?->started_at
        ]);
    }

    public function isExecutable(): bool
    {
        return $this->status === 'active' && $this->steps()->count() > 0;
    }

    public function duplicate(string $newName = null): self
    {
        $newWorkflow = $this->replicate();
        $newWorkflow->name = $newName ?? $this->name . ' (Copy)';
        $newWorkflow->status = 'draft';
        $newWorkflow->is_template = false;
        $newWorkflow->total_runs = 0;
        $newWorkflow->success_runs = 0;
        $newWorkflow->failed_runs = 0;
        $newWorkflow->last_run_at = null;
        $newWorkflow->save();

        // Duplicate steps
        foreach ($this->steps as $step) {
            $newStep = $step->replicate();
            $newStep->workflow_id = $newWorkflow->id;
            $newStep->save();
        }

        return $newWorkflow;
    }
}