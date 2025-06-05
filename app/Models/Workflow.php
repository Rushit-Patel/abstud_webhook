<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
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

    public function trigger(): HasMany
    {
        return $this->hasMany(WorkflowTrigger::class);
    }

    public function getFirstStep(): ?WorkflowStep
    {
        return $this->steps()->orderBy('position')->first();
    }

    public function createVersion(): self
    {
        $newVersion = $this->replicate();
        $newVersion->version = ($this->version ?? 1) + 1;
        $newVersion->parent_workflow_id = $this->id;
        $newVersion->save();

        // Clone steps
        foreach ($this->steps as $step) {
            $newStep = $step->replicate();
            $newStep->workflow_id = $newVersion->id;
            $newStep->save();
        }

        return $newVersion;
    }

    public function getLatestRun(): ?WorkflowRun
    {
        return $this->runs()->latest()->first();
    }

    public function getSuccessRate(): float
    {
        $totalRuns = $this->runs()->count();
        if ($totalRuns === 0) {
            return 0;
        }

        $successfulRuns = $this->runs()
            ->where('status', WorkflowRun::STATUS_COMPLETED)
            ->count();

        return ($successfulRuns / $totalRuns) * 100;
    }

    public function getAverageRunTime(): ?float
    {
        return $this->runs()
            ->whereNotNull('completed_at')
            ->whereNotNull('started_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(SECOND, started_at, completed_at)) as avg_duration')
            ->value('avg_duration');
    }

    public function isRunning(): bool
    {
        return $this->runs()
            ->where('status', WorkflowRun::STATUS_RUNNING)
            ->exists();
    }
} 