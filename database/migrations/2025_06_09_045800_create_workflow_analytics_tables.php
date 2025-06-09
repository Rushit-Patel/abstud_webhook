<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Performance Metrics (Daily aggregation)
        Schema::create('workflow_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->date('date');
            $table->integer('total_executions')->default(0);
            $table->integer('successful_executions')->default(0);
            $table->integer('failed_executions')->default(0);
            $table->integer('avg_execution_time_ms')->default(0);
            $table->bigInteger('total_execution_time_ms')->default(0);
            $table->integer('peak_executions_per_hour')->default(0);
            $table->timestamps();
            
            $table->unique(['workflow_id', 'date']);
            $table->index(['date']);
            $table->index(['workflow_id', 'date']);
        });

        // 2. Audit Trail
        Schema::create('workflow_audit_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->nullable()->constrained('workflows')->onDelete('set null');
            $table->foreignId('execution_id')->nullable()->constrained('workflow_executions')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('action', ['created', 'updated', 'deleted', 'executed', 'cancelled', 'failed', 'activated', 'deactivated']);
            $table->json('details')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            
            $table->index(['workflow_id', 'action']);
            $table->index(['created_at']);
            $table->index(['user_id', 'action']);
        });

        // 3. Error Tracking
        Schema::create('workflow_errors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->foreignId('execution_id')->nullable()->constrained('workflow_executions')->onDelete('cascade');
            $table->foreignId('step_id')->nullable()->constrained('workflow_steps')->onDelete('cascade');
            $table->string('error_type'); // validation, execution, timeout, etc.
            $table->string('error_code')->nullable();
            $table->text('error_message');
            $table->json('error_context')->nullable(); // stack trace, input data, etc.
            $table->boolean('is_resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
            
            $table->index(['workflow_id', 'error_type']);
            $table->index(['is_resolved']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_errors');
        Schema::dropIfExists('workflow_audit_log');
        Schema::dropIfExists('workflow_metrics');
    }
};