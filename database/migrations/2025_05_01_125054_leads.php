<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lead_fields', function (Blueprint $table) {
            $table->id();
            $table->string('name'); 
            $table->string('label');
            $table->string('type'); 
            $table->json('options')->nullable();
            $table->json('settings')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });        

        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->json('raw_payload');
            $table->timestamps();
            $table->softDeletes();
        });
        
        Schema::create('lead_field_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->onDelete('cascade');
            $table->foreignId('lead_field_id')->constrained()->onDelete('cascade');
            $table->text('value')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
        
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_field_values');
        Schema::dropIfExists('leads');
        Schema::dropIfExists('lead_fields');
    }
};
