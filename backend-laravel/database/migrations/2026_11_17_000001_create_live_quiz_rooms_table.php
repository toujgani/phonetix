<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('live_quiz_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('host_id')->constrained('users')->cascadeOnDelete();
            $table->string('pin', 6)->unique();
            $table->string('title');
            $table->jsonb('questions');
            $table->string('status')->default('lobby');
            $table->unsignedInteger('current_question')->default(0);
            $table->timestamp('question_started_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });

        Schema::create('live_quiz_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('live_quiz_rooms')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->jsonb('answers')->nullable();
            $table->unsignedInteger('score')->default(0);
            $table->timestamps();
            $table->unique(['room_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_quiz_participants');
        Schema::dropIfExists('live_quiz_rooms');
    }
};
