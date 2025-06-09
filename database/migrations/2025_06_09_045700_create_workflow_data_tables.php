<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Data Transformations (for mapping between systems)
        Schema::create('data_transformations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('source_schema'); // expected input structure
            $table->json('target_schema'); // expected output structure
            $table->json('transformation_rules'); // mapping and transformation logic
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['name']);
            $table->index(['is_active']);
        });

        // 2. Workflow Variables (for dynamic data storage)
        Schema::create('workflow_variables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->foreignId('execution_id')->nullable()->constrained('workflow_executions')->onDelete('cascade');
            $table->string('variable_name');
            $table->json('variable_value');
            $table->enum('variable_type', ['string', 'number', 'boolean', 'object', 'array'])->default('string');
            $table->boolean('is_encrypted')->default(false);
            $table->timestamps();
            
            $table->index(['workflow_id', 'variable_name']);
            $table->index(['execution_id', 'variable_name']);
            $table->unique(['workflow_id', 'execution_id', 'variable_name'], 'workflow_execution_variable_unique');
        });

        // 3. Enhanced Integration Actions
        Schema::create('integration_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('integration_type_id')->constrained('integration_types')->onDelete('cascade');
            $table->string('action_name');
            $table->text('description')->nullable();
            $table->json('action_config'); // API endpoints, required fields, etc.
            $table->json('input_schema')->nullable(); // validation schema for inputs
            $table->json('output_schema')->nullable(); // expected output structure
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique(['integration_type_id', 'action_name']);
            $table->index(['is_active']);
        });

        // 4. Workflow Folders/Categories
        Schema::create('workflow_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color', 7)->default('#3B82F6'); // hex color
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index(['user_id', 'sort_order']);
        });

        // Add folder_id to workflows table
        Schema::table('workflows', function (Blueprint $table) {
            $table->foreignId('folder_id')->nullable()->after('metadata')->constrained('workflow_folders')->onDelete('set null');
            $table->index(['folder_id']);
        });
    }

    public function down(): void
    {
        Schema::table('workflows', function (Blueprint $table) {
            $table->dropForeign(['folder_id']);
            $table->dropColumn('folder_id');
        });
        
        Schema::dropIfExists('workflow_folders');
        Schema::dropIfExists('integration_actions');
        Schema::dropIfExists('workflow_variables');
        Schema::dropIfExists('data_transformations');
    }
};