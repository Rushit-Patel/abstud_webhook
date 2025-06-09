<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Workflow Templates
        Schema::create('workflow_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->json('template_data'); // complete workflow configuration
            $table->string('category')->default('general');
            $table->json('tags')->nullable();
            $table->boolean('is_public')->default(false);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->integer('usage_count')->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('rating_count')->default(0);
            $table->timestamps();
            
            $table->index(['category', 'is_public']);
            $table->index(['is_public', 'rating']);
            $table->index(['created_by']);
        });

        // 2. Template Usage Tracking
        Schema::create('workflow_template_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('workflow_templates')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['template_id', 'user_id']);
            $table->index(['user_id', 'created_at']);
        });

        // 3. Template Ratings
        Schema::create('workflow_template_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('workflow_templates')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('rating'); // 1-5 stars
            $table->text('review')->nullable();
            $table->timestamps();
            
            $table->unique(['template_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_template_ratings');
        Schema::dropIfExists('workflow_template_usage');
        Schema::dropIfExists('workflow_templates');
    }
};