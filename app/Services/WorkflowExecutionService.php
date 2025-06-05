<?php

namespace App\Services;

use App\Models\Workflow;
use App\Models\WorkflowRun;
use App\Models\WorkflowStep;
use App\Models\WorkflowStepRun;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class WorkflowExecutionService
{
    public function executeWorkflow(Workflow $workflow, array $triggerData): WorkflowRun
    {
        $run = WorkflowRun::create([
            'workflow_id' => $workflow->id,
            'status' => WorkflowRun::STATUS_PENDING,
            'trigger_data' => $triggerData,
        ]);

        try {
            $run->markAsStarted();
            
            $firstStep = $workflow->getFirstStep();
            if (!$firstStep) {
                throw new \Exception('Workflow has no steps');
            }

            $this->executeStep($firstStep, $run);
            
            $run->markAsCompleted();
        } catch (\Exception $e) {
            Log::error('Workflow execution failed', [
                'workflow_id' => $workflow->id,
                'run_id' => $run->id,
                'error' => $e->getMessage(),
            ]);

            $run->markAsFailed($e->getMessage());
        }

        return $run;
    }

    public function resumeWorkflowExecution(WorkflowStep $step, WorkflowRun $run, WorkflowStepRun $previousStepRun): void
    {
        try {
            $this->executeStep($step, $run, $previousStepRun);
        } catch (\Exception $e) {
            Log::error('Workflow resume failed', [
                'workflow_id' => $run->workflow_id,
                'run_id' => $run->id,
                'step_id' => $step->id,
                'error' => $e->getMessage(),
            ]);

            $run->markAsFailed("Failed to resume workflow: {$e->getMessage()}");
        }
    }

    protected function executeStep(WorkflowStep $step, WorkflowRun $run, ?WorkflowStepRun $previousStepRun = null): void
    {
        $stepRun = WorkflowStepRun::create([
            'workflow_id' => $run->workflow_id,
            'workflow_step_id' => $step->id,
            'status' => WorkflowStepRun::STATUS_PENDING,
            'input_data' => $this->prepareStepInput($step, $run, $previousStepRun),
        ]);

        try {
            $stepRun->markAsStarted();

            switch ($step->step_type) {
                case WorkflowStep::TYPE_ACTION:
                    $output = $this->executeAction($step, $stepRun);
                    break;

                case WorkflowStep::TYPE_CONDITION:
                    $output = $this->evaluateCondition($step, $stepRun);
                    break;

                case WorkflowStep::TYPE_DELAY:
                    $this->handleDelay($step, $stepRun);
                    return; // Delay handling is async

                case WorkflowStep::TYPE_DATA_MAPPER:
                    $output = $this->mapData($step, $stepRun);
                    break;

                default:
                    throw new \Exception("Unknown step type: {$step->step_type}");
            }

            $stepRun->markAsCompleted($output);

            // Update workflow context
            $run->updateContext([
                "step_{$step->step_uid}" => $output
            ]);

            // Get and execute next step
            $nextStepId = $step->getNextStepId($output['result'] ?? null);
            if ($nextStepId) {
                $nextStep = WorkflowStep::find($nextStepId);
                if ($nextStep) {
                    $this->executeStep($nextStep, $run, $stepRun);
                }
            }

        } catch (\Exception $e) {
            $this->handleStepError($step, $stepRun, $run, $e);
        }
    }

    protected function prepareStepInput(WorkflowStep $step, WorkflowRun $run, ?WorkflowStepRun $previousStepRun): array
    {
        $input = [
            'trigger_data' => $run->trigger_data,
            'context' => $run->context_data,
        ];

        if ($previousStepRun) {
            $input['previous_step'] = [
                'output' => $previousStepRun->output_data,
                'status' => $previousStepRun->status,
            ];
        }

        // Apply field mapping if configured
        if ($step->field_mapping) {
            $input = $this->applyFieldMapping($input, $step->field_mapping);
        }

        return $input;
    }

    protected function executeAction(WorkflowStep $step, WorkflowStepRun $stepRun): array
    {
        $actionType = $step->config['action_type'] ?? null;
        if (!$actionType) {
            throw new \Exception('Action type not specified');
        }

        // Execute the action based on type
        switch ($actionType) {
            case 'http_request':
                return $this->executeHttpRequest($step->config, $stepRun->input_data);

            case 'send_email':
                return $this->sendEmail($step->config, $stepRun->input_data);

            case 'update_crm':
                return $this->updateCRM($step->config, $stepRun->input_data);

            // Add more action types as needed

            default:
                throw new \Exception("Unknown action type: {$actionType}");
        }
    }

    protected function evaluateCondition(WorkflowStep $step, WorkflowStepRun $stepRun): array
    {
        $condition = $step->config['condition'] ?? null;
        if (!$condition) {
            throw new \Exception('Condition not specified');
        }

        $result = $this->evaluateConditionExpression($condition, $stepRun->input_data);

        return [
            'result' => $result,
            'condition' => $condition,
        ];
    }

    protected function handleDelay(WorkflowStep $step, WorkflowStepRun $stepRun): void
    {
        $delay = $step->config['delay'] ?? null;
        if (!$delay) {
            throw new \Exception('Delay not specified');
        }

        $stepRun->markAsDelayed();

        // Schedule the continuation of the workflow
        $resumeAt = $this->calculateResumeTime($delay);
        
        // You would implement your own job scheduling here
        // For example, using Laravel's built-in scheduling:
        // ResumeWorkflowJob::dispatch($stepRun)->delay($resumeAt);
    }

    protected function mapData(WorkflowStep $step, WorkflowStepRun $stepRun): array
    {
        $mapping = $step->config['mapping'] ?? null;
        if (!$mapping) {
            throw new \Exception('Data mapping not specified');
        }

        return $this->applyFieldMapping($stepRun->input_data, $mapping);
    }

    protected function handleStepError(WorkflowStep $step, WorkflowStepRun $stepRun, WorkflowRun $run, \Exception $error): void
    {
        $errorHandling = $step->error_handling ?? [];
        $maxRetries = $errorHandling['max_retries'] ?? 0;

        if ($stepRun->retry_count < $maxRetries) {
            $stepRun->incrementRetryCount();
            
            // Implement retry delay if specified
            $retryDelay = $errorHandling['retry_delay'] ?? 0;
            if ($retryDelay > 0) {
                sleep($retryDelay);
            }

            // Retry the step
            $this->executeStep($step, $run);
        } else {
            $stepRun->markAsFailed($error->getMessage());

            // Handle failure based on configuration
            $onError = $errorHandling['on_error'] ?? 'fail_workflow';
            switch ($onError) {
                case 'continue':
                    // Move to next step if exists
                    $nextStepId = $step->next_step_id;
                    if ($nextStepId) {
                        $nextStep = WorkflowStep::find($nextStepId);
                        if ($nextStep) {
                            $this->executeStep($nextStep, $run, $stepRun);
                        }
                    }
                    break;

                case 'fail_workflow':
                default:
                    $run->markAsFailed(
                        "Step {$step->step_uid} failed: {$error->getMessage()}",
                        ['step_id' => $step->id]
                    );
                    break;
            }
        }
    }

    protected function applyFieldMapping(array $input, array $mapping): array
    {
        $output = [];
        foreach ($mapping as $targetPath => $sourcePath) {
            $value = $this->getValueByPath($input, $sourcePath);
            $this->setValueByPath($output, $targetPath, $value);
        }
        return $output;
    }

    protected function getValueByPath(array $data, string $path)
    {
        $keys = explode('.', $path);
        $value = $data;
        foreach ($keys as $key) {
            if (!isset($value[$key])) {
                return null;
            }
            $value = $value[$key];
        }
        return $value;
    }

    protected function setValueByPath(array &$data, string $path, $value): void
    {
        $keys = explode('.', $path);
        $current = &$data;
        foreach ($keys as $key) {
            if (!isset($current[$key])) {
                $current[$key] = [];
            }
            $current = &$current[$key];
        }
        $current = $value;
    }

    protected function calculateResumeTime(array $delay): Carbon
    {
        $amount = $delay['amount'] ?? 1;
        $unit = $delay['unit'] ?? 'minutes';
        
        return now()->add($amount, $unit);
    }

    protected function evaluateConditionExpression(array $condition, array $context): bool
    {
        $operator = $condition['operator'] ?? null;
        $field = $condition['field'] ?? null;
        $value = $condition['value'] ?? null;

        if (!$operator || !$field) {
            throw new \Exception('Invalid condition configuration');
        }

        $fieldValue = $this->getValueByPath($context, $field);

        switch ($operator) {
            case 'equals':
                return $fieldValue == $value;
            case 'not_equals':
                return $fieldValue != $value;
            case 'greater_than':
                return $fieldValue > $value;
            case 'less_than':
                return $fieldValue < $value;
            case 'contains':
                return is_string($fieldValue) && str_contains($fieldValue, $value);
            case 'not_contains':
                return is_string($fieldValue) && !str_contains($fieldValue, $value);
            default:
                throw new \Exception("Unknown operator: {$operator}");
        }
    }

    // Implement these methods based on your needs
    protected function executeHttpRequest(array $config, array $input): array
    {
        // Implement HTTP request logic
        return [];
    }

    protected function sendEmail(array $config, array $input): array
    {
        // Implement email sending logic
        return [];
    }

    protected function updateCRM(array $config, array $input): array
    {
        // Implement CRM update logic
        return [];
    }
} 