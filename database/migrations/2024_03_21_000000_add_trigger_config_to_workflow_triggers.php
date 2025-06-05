<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workflow_triggers', function (Blueprint $table) {
            $table->json('trigger_config')->nullable()->after('filters');
        });
    }

    public function down(): void
    {
        Schema::table('workflow_triggers', function (Blueprint $table) {
            $table->dropColumn('trigger_config');
        });
    }
}; 