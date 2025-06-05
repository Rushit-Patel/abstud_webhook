<?php

namespace App\Jobs;

use App\Models\WorkflowStepRun;
use App\Services\WorkflowExecutionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ResumeWorkflowJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private WorkflowStepRun $stepRun;

    public function __construct(WorkflowStepRun $stepRun)
    {
        $this->stepRun = $stepRun;
    }

    public function handle(WorkflowExecutionService $executionService): void
    {
        $workflow = $this->stepRun->workflow;
        $step = $this->stepRun->step;
        $run = $this->stepRun->workflowRun;

        if (!$workflow || !$step || !$run) {
            return;
        }

        // Mark the delayed step as completed
        $this->stepRun->markAsCompleted();

        // Get and execute the next step
        $nextStepId = $step->next_step_id;
        if ($nextStepId) {
            $nextStep = $workflow->steps()->find($nextStepId);
            if ($nextStep) {
                // Call the public method to resume workflow execution
                $executionService->resumeWorkflowExecution($nextStep, $run, $this->stepRun);
            }
        }
    }

    public function failed(\Throwable $exception): void
    {
        $this->stepRun->markAsFailed($exception->getMessage());
        $this->stepRun->workflow?->runs()?->latest()?->first()?->markAsFailed(
            "Delayed step {$this->stepRun->step->step_uid} failed: {$exception->getMessage()}"
        );
    }
} 