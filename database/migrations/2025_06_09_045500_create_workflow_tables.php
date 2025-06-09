<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Workflow Definitions
        Schema::create('workflows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('trigger_type', ['webhook', 'schedule', 'manual', 'event', 'lead_created', 'form_submitted'])->default('webhook');
            $table->json('trigger_config')->nullable(); // webhook URLs, cron expressions, etc.
            $table->enum('status', ['active', 'inactive', 'draft'])->default('draft');
            $table->integer('version')->default(1);
            $table->boolean('is_template')->default(false);
            $table->json('metadata')->nullable(); // tags, categories, etc.
            $table->timestamp('last_run_at')->nullable();
            $table->integer('total_runs')->default(0);
            $table->integer('success_runs')->default(0);
            $table->integer('failed_runs')->default(0);
            $table->decimal('success_rate', 5, 2)->default(0);
            $table->integer('average_execution_time_ms')->default(0);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['user_id', 'status']);
            $table->index(['trigger_type']);
            $table->index(['status', 'last_run_at']);
            $table->index(['is_template']);
        });

        // 2. Workflow Steps/Actions
        Schema::create('workflow_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->enum('step_type', ['action', 'condition', 'delay', 'webhook', 'email', 'integration', 'send_whatsapp', 'add_tag', 'remove_tag'])->default('action');
            $table->string('name');
            $table->json('config'); // step-specific configuration
            $table->integer('position'); // order in workflow
            $table->foreignId('parent_step_id')->nullable()->constrained('workflow_steps')->onDelete('cascade');
            $table->json('conditions')->nullable(); // when this step should execute
            $table->integer('timeout_seconds')->default(300);
            $table->integer('retry_count')->default(0);
            $table->boolean('enabled')->default(true);
            $table->timestamps();
            
            $table->index(['workflow_id', 'position']);
            $table->index(['step_type']);
            $table->index(['enabled']);
            $table->unique(['workflow_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_steps');
        Schema::dropIfExists('workflows');
    }
};