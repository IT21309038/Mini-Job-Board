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
        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->id();

            // The user that the token belongs to
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // Hash of the token
            $table->string('token_hash', 128)->unique();

            $table->string('user_agent')->nullable();

            // IPV6 compatibility
            $table->string('ip_address', 45)->nullable();

            $table->timestamp('expires_at');
            $table->timestamp('revoked_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refresh_tokens_tabl');
    }
};
