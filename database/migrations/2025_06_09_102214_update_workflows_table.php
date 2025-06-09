<?php
// database/migrations/2025_06_09_102214_update_workflows_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('workflows', function (Blueprint $table) {
            // Add foreign key to triggers table
            $table->foreignId('trigger_id')->nullable()->after('user_id')->constrained('triggers')->onDelete('set null');
            
            // Make trigger_type nullable
            $table->enum('trigger_type', ['webhook', 'schedule', 'manual', 'event', 'lead_created', 'form_submitted'])->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('workflows', function (Blueprint $table) {
            $table->dropForeign(['trigger_id']);
            $table->dropColumn('trigger_id');
            
            // Revert trigger_type to not nullable
            $table->enum('trigger_type', ['webhook', 'schedule', 'manual', 'event', 'lead_created', 'form_submitted'])->default('webhook')->change();
        });
    }
};