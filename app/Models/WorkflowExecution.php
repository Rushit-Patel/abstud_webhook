<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class WorkflowExecution extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id',
        'triggered_by_user_id',
        'trigger_data',
        'status',
        'started_at',
        'completed_at',
        'error_message',
        'execution_context',
        'total_steps',
        'completed_steps',
        'execution_time_ms',
        'execution_id'
    ];

    protected $casts = [
        'trigger_data' => 'array',
        'execution_context' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime'
    ];

    protected $attributes = [
        'status' => 'pending',
        'total_steps' => 0,
        'completed_steps' => 0,
        'execution_time_ms' => 0
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($execution) {
            if (empty($execution->execution_id)) {
                $execution->execution_id = Str::uuid();
            }
        });
    }

    // Relationships
    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function triggeredByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'triggered_by_user_id');
    }

    public function stepExecutions(): HasMany
    {
        return $this->hasMany(WorkflowStepExecution::class, 'execution_id');
    }

    public function leadExecutions(): HasMany
    {
        return $this->hasMany(LeadWorkflowExecution::class, 'execution_id');
    }

    // Scopes
    public function scopeRunning($query)
    {
        return $query->where('status', 'running');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    // Helper Methods
    public function start(): void
    {
        $this->update([
            'status' => 'running',
            'started_at' => now()
        ]);
    }

    public function complete(): void
    {
        $duration = $this->started_at ? now()->diffInMilliseconds($this->started_at) : 0;
        
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'execution_time_ms' => $duration
        ]);

        // Update workflow stats
        $this->workflow->increment('total_runs');
        $this->workflow->increment('success_runs');
        $this->workflow->updateStats();
    }

    public function fail(string $errorMessage): void
    {
        $duration = $this->started_at ? now()->diffInMilliseconds($this->started_at) : 0;
        
        $this->update([
            'status' => 'failed',
            'completed_at' => now(),
            'error_message' => $errorMessage,
            'execution_time_ms' => $duration
        ]);

        // Update workflow stats
        $this->workflow->increment('total_runs');
        $this->workflow->increment('failed_runs');
        $this->workflow->updateStats();
    }

    public function getProgressPercentage(): int
    {
        if ($this->total_steps === 0) return 0;
        return (int) round(($this->completed_steps / $this->total_steps) * 100);
    }
}