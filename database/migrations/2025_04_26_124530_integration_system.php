<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. integration_types
        Schema::create('integration_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->json('auth_config')->nullable();
            $table->timestamps();
        });

        // 2. integrations
        Schema::create('integrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('type_id')->constrained('integration_types')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->json('credentials')->nullable();
            $table->json('meta')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. oauth_tokens
        Schema::create('oauth_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('integration_id')->constrained('integrations')->onDelete('cascade');
            $table->text('access_token');
            $table->text('refresh_token')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('scope')->nullable();
            $table->timestamps();
        });

        // 4. webhook_endpoints
        Schema::create('webhook_endpoints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('integration_id')->constrained('integrations')->onDelete('cascade');
            $table->string('identifier');
            $table->string('target_url');
            $table->string('event_type');
            $table->string('secret');
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
        });

        // 5. integration_logs
        Schema::create('integration_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('integration_id')->constrained('integrations')->onDelete('cascade');
            $table->enum('type', ['success', 'error', 'warning']);
            $table->text('message');
            $table->json('context')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_logs');
        Schema::dropIfExists('webhook_endpoints');
        Schema::dropIfExists('oauth_tokens');
        Schema::dropIfExists('integrations');
        Schema::dropIfExists('integration_types');
    }
};
