<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Enhanced Trigger Definitions
        Schema::create('workflow_triggers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->string('trigger_name');
            $table->enum('trigger_type', [
                'database_event',    // INSERT, UPDATE, DELETE on specific tables
                'webhook',           // External HTTP webhook
                'schedule',          // Cron-based
                'manual',           // User-initiated
                'api_event',        // Internal API events
                'field_condition',  // Lead field value changes
                'integration_event' // Third-party integration events
            ]);
            $table->string('event_source')->nullable(); // table name, webhook endpoint, etc.
            $table->enum('event_action', ['INSERT', 'UPDATE', 'DELETE', 'SELECT', 'ANY'])->nullable();
            $table->json('trigger_conditions'); // Detailed conditions for triggering
            $table->json('field_mappings')->nullable(); // Map trigger data to workflow variables
            $table->integer('priority')->default(100); // Execution priority (lower = higher priority)
            $table->boolean('is_active')->default(true);
            $table->integer('cooldown_seconds')->default(0); // Prevent rapid re-triggering
            $table->timestamp('last_triggered_at')->nullable();
            $table->timestamps();
            
            $table->index(['workflow_id', 'trigger_type']);
            $table->index(['event_source', 'event_action']);
            $table->index(['is_active', 'priority']);
            $table->index(['last_triggered_at']);
        });

        // 2. Database Event Listeners
        Schema::create('database_event_triggers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trigger_id')->constrained('workflow_triggers')->onDelete('cascade');
            $table->string('table_name');
            $table->json('column_filters')->nullable(); // Specific columns to watch
            $table->json('value_conditions')->nullable(); // Conditions on column values
            $table->enum('operation', ['INSERT', 'UPDATE', 'DELETE']);
            $table->boolean('capture_old_values')->default(false);
            $table->boolean('capture_new_values')->default(true);
            $table->timestamps();
            
            $table->index(['table_name', 'operation']);
            $table->index(['trigger_id']);
        });

        // 3. Trigger Event Log
        Schema::create('trigger_event_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trigger_id')->constrained('workflow_triggers')->onDelete('cascade');
            $table->foreignId('workflow_execution_id')->nullable()->constrained('workflow_executions')->onDelete('set null');
            $table->json('trigger_payload'); // Complete event data
            $table->enum('status', ['triggered', 'processed', 'failed', 'ignored']);
            $table->text('failure_reason')->nullable();
            $table->integer('processing_time_ms')->default(0);
            $table->timestamps();
            
            $table->index(['trigger_id', 'status']);
            $table->index(['created_at']);
            $table->index(['workflow_execution_id']);
        });

        // 4. Trigger Performance Metrics
        Schema::create('trigger_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trigger_id')->constrained('workflow_triggers')->onDelete('cascade');
            $table->date('date');
            $table->integer('total_events')->default(0);
            $table->integer('successful_triggers')->default(0);
            $table->integer('failed_triggers')->default(0);
            $table->integer('ignored_triggers')->default(0);
            $table->integer('avg_processing_time_ms')->default(0);
            $table->timestamps();
            
            $table->unique(['trigger_id', 'date']);
            $table->index(['date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trigger_metrics');
        Schema::dropIfExists('trigger_event_log');
        Schema::dropIfExists('database_event_triggers');
        Schema::dropIfExists('workflow_triggers');
    }
};