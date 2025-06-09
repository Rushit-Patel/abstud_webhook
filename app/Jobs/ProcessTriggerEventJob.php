<?php

namespace App\Jobs;

use App\Models\TriggerEventLog;
use App\Services\TriggerProcessingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessTriggerEventJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public TriggerEventLog $eventLog
    ) {}

    public function handle(TriggerProcessingService $triggerService): void
    {
        $triggerService->processEvent($this->eventLog);
    }

    public function failed(\Throwable $exception): void
    {
        $this->eventLog->update([
            'status' => 'failed',
            'failure_reason' => $exception->getMessage()
        ]);
    }
}