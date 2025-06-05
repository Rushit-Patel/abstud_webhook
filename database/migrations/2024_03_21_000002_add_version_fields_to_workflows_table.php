<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workflows', function (Blueprint $table) {
            $table->unsignedInteger('version')->default(1)->after('user_id');
            $table->foreignId('parent_workflow_id')->nullable()->after('version')
                ->references('id')->on('workflows')->onDelete('set null');
            $table->json('error_handling_config')->nullable()->after('actions');
        });
    }

    public function down(): void
    {
        Schema::table('workflows', function (Blueprint $table) {
            $table->dropForeign(['parent_workflow_id']);
            $table->dropColumn(['version', 'parent_workflow_id', 'error_handling_config']);
        });
    }
}; 