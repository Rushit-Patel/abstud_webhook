<?php
// database/migrations/2025_06_09_102213_create_triggers_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('triggers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['webhook', 'schedule', 'manual', 'event', 'lead_created', 'form_submitted']);
            $table->json('config')->nullable();
            $table->enum('status', ['active', 'inactive', 'draft'])->default('draft');
            $table->boolean('is_template')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['user_id', 'status']);
            $table->index(['type']);
            $table->index(['status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('triggers');
    }
};