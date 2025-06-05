<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkflowRun extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_RUNNING = 'running';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'workflow_id',
        'status',
        'trigger_data',
        'context_data',
        'error_message',
        'error_details',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'trigger_data' => 'array',
        'context_data' => 'array',
        'error_details' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function stepRuns(): HasMany
    {
        return $this->hasMany(WorkflowStepRun::class);
    }

    public function markAsStarted(): void
    {
        $this->update([
            'status' => self::STATUS_RUNNING,
            'started_at' => now(),
        ]);
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }

    public function markAsFailed(string $message, array $details = []): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'error_message' => $message,
            'error_details' => $details,
            'completed_at' => now(),
        ]);
    }

    public function markAsCancelled(): void
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'completed_at' => now(),
        ]);
    }

    public function updateContext(array $data): void
    {
        $this->update([
            'context_data' => array_merge($this->context_data ?? [], $data),
        ]);
    }
} 