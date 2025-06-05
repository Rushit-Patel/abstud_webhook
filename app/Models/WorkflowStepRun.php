<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowStepRun extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_RUNNING = 'running';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';
    public const STATUS_SKIPPED = 'skipped';
    public const STATUS_DELAYED = 'delayed';

    protected $fillable = [
        'workflow_id',
        'workflow_step_id',
        'status',
        'input_data',
        'output_data',
        'error_message',
        'error_details',
        'retry_count',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'input_data' => 'array',
        'output_data' => 'array',
        'error_details' => 'array',
        'retry_count' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function step(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class, 'workflow_step_id');
    }

    public function markAsStarted(): void
    {
        $this->update([
            'status' => self::STATUS_RUNNING,
            'started_at' => now(),
        ]);
    }

    public function markAsCompleted(array $output = []): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'output_data' => $output,
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

    public function markAsSkipped(): void
    {
        $this->update([
            'status' => self::STATUS_SKIPPED,
            'completed_at' => now(),
        ]);
    }

    public function markAsDelayed(): void
    {
        $this->update([
            'status' => self::STATUS_DELAYED,
        ]);
    }

    public function incrementRetryCount(): void
    {
        $this->increment('retry_count');
    }
} 