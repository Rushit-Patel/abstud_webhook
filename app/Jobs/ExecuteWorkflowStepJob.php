<?php

namespace App\Jobs;

use App\Models\WorkflowExecution;
use App\Models\WorkflowStep;
use App\Services\WorkflowExecutionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ExecuteWorkflowStepJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public WorkflowExecution $execution,
        public WorkflowStep $step
    ) {}

    public function handle(WorkflowExecutionService $executionService): void
    {
        $executionService->executeStep($this->execution, $this->step);
    }
}