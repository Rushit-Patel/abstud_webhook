<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Workflow Executions
        Schema::create('workflow_executions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->foreignId('triggered_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->json('trigger_data')->nullable(); // original trigger payload
            $table->enum('status', ['pending', 'running', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->json('execution_context')->nullable(); // variables, intermediate results
            $table->integer('total_steps')->default(0);
            $table->integer('completed_steps')->default(0);
            $table->integer('execution_time_ms')->default(0);
            $table->string('execution_id')->unique(); // UUID for tracking
            $table->timestamps();
            
            $table->index(['workflow_id', 'status']);
            $table->index(['status', 'started_at']);
            $table->index(['created_at']);
            $table->index(['execution_id']);
        });

        // 2. Step Executions
        Schema::create('workflow_step_executions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('execution_id')->constrained('workflow_executions')->onDelete('cascade');
            $table->foreignId('step_id')->constrained('workflow_steps')->onDelete('cascade');
            $table->enum('status', ['pending', 'running', 'completed', 'failed', 'skipped'])->default('pending');
            $table->json('input_data')->nullable();
            $table->json('output_data')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('retry_count')->default(0);
            $table->integer('execution_time_ms')->default(0);
            $table->timestamps();
            
            $table->index(['execution_id', 'status']);
            $table->index(['step_id', 'status']);
            $table->index(['started_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_step_executions');
        Schema::dropIfExists('workflow_executions');
    }
};