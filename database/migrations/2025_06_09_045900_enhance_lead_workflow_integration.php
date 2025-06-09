<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Lead Workflow Triggers
        Schema::create('lead_workflow_triggers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->foreignId('lead_field_id')->nullable()->constrained('lead_fields')->onDelete('cascade');
            $table->enum('trigger_event', ['lead_created', 'field_updated', 'field_equals', 'field_contains', 'field_changed']);
            $table->json('trigger_conditions')->nullable(); // specific field values, patterns, etc.
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['workflow_id', 'trigger_event']);
            $table->index(['lead_field_id', 'trigger_event']);
        });

        // 2. Lead Workflow Executions (linking leads to workflow executions)
        Schema::create('lead_workflow_executions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('leads')->onDelete('cascade');
            $table->foreignId('execution_id')->constrained('workflow_executions')->onDelete('cascade');
            $table->json('lead_snapshot')->nullable(); // lead data at time of execution
            $table->timestamps();
            
            $table->unique(['lead_id', 'execution_id']);
            $table->index(['lead_id']);
            $table->index(['execution_id']);
        });

        // 3. Add workflow tracking to leads table
        Schema::table('leads', function (Blueprint $table) {
            $table->json('workflow_history')->nullable()->after('raw_payload'); // track which workflows have processed this lead
            $table->timestamp('last_workflow_run')->nullable()->after('workflow_history');
        });

        // 4. Scheduled Workflow Runs
        Schema::create('scheduled_workflow_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->string('cron_expression');
            $table->timestamp('next_run_at');
            $table->timestamp('last_run_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('run_config')->nullable(); // additional configuration for scheduled runs
            $table->timestamps();
            
            $table->index(['next_run_at', 'is_active']);
            $table->index(['workflow_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scheduled_workflow_runs');
        
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn(['workflow_history', 'last_workflow_run']);
        });
        
        Schema::dropIfExists('lead_workflow_executions');
        Schema::dropIfExists('lead_workflow_triggers');
    }
};