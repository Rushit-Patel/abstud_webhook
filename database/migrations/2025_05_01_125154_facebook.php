<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
 
    public function up(): void
    {
        Schema::create('facebook_lead_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('integration_id')->constrained('integrations')->onDelete('cascade');
            $table->string('facebook_form_id');
            $table->string('facebook_page_id');
            $table->string('form_name');
            $table->json('questions');
            $table->timestamps();
            $table->unique(['integration_id', 'facebook_form_id']);
        });

        Schema::create('facebook_form_field_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facebook_lead_form_id')->constrained()->onDelete('cascade');
            $table->string('facebook_field_name');
            $table->foreignId('lead_field_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->unique(['facebook_lead_form_id', 'facebook_field_name'], 'form_field_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facebook_lead_forms');
        Schema::dropIfExists('facebook_form_field_mappings');
    }
};
