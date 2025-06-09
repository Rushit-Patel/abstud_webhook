<?php

namespace App\Console\Commands;

use App\Services\TriggerProcessingService;
use Illuminate\Console\Command;

class ProcessWorkflowTriggers extends Command
{
    protected $signature = 'workflow:process-triggers';
    protected $description = 'Process pending workflow triggers';

    public function handle(TriggerProcessingService $triggerService): int
    {
        $this->info('Processing workflow triggers...');
        
        $triggerService->processPendingTriggers();
        
        $this->info('Trigger processing completed.');
        
        return Command::SUCCESS;
    }
}