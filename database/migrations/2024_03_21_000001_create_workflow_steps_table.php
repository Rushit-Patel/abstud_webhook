<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained()->onDelete('cascade');
            $table->string('step_uid')->comment('Unique identifier for this step within its workflow');
            $table->string('step_type')->comment('action, condition, delay, data_mapper');
            $table->json('config')->comment('Step-specific configuration');
            $table->unsignedBigInteger('next_step_id')->nullable();
            $table->unsignedBigInteger('true_branch_step_id')->nullable();
            $table->unsignedBigInteger('false_branch_step_id')->nullable();
            $table->json('error_handling')->nullable()->comment('Step-specific error handling configuration');
            $table->json('field_mapping')->nullable()->comment('Field mapping configuration');
            $table->integer('position')->default(0)->comment('Step position for ordering');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('next_step_id')->references('id')->on('workflow_steps')->onDelete('set null');
            $table->foreign('true_branch_step_id')->references('id')->on('workflow_steps')->onDelete('set null');
            $table->foreign('false_branch_step_id')->references('id')->on('workflow_steps')->onDelete('set null');
            $table->unique(['workflow_id', 'step_uid']);
        });

        Schema::create('workflow_step_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained()->onDelete('cascade');
            $table->foreignId('workflow_step_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('pending');
            $table->json('input_data')->nullable();
            $table->json('output_data')->nullable();
            $table->text('error_message')->nullable();
            $table->json('error_details')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('workflow_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('pending');
            $table->json('trigger_data')->nullable();
            $table->json('context_data')->nullable();
            $table->text('error_message')->nullable();
            $table->json('error_details')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_step_runs');
        Schema::dropIfExists('workflow_runs');
        Schema::dropIfExists('workflow_steps');
    }
}; 