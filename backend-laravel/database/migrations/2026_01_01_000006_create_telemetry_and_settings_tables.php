<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vocabulary_items', function (Blueprint $table) {
            $table->id();
            $table->string('word')->unique();
            $table->string('ipa_transcription');
            $table->string('part_of_speech')->nullable();
            $table->string('audio_url')->nullable();
            $table->text('definition');
            $table->text('example_sentence')->nullable();
            $table->jsonb('phonetic_breakdown')->nullable();
            $table->timestamps();
        });

        Schema::create('student_vocabulary', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('vocabulary_item_id')->constrained('vocabulary_items')->cascadeOnDelete();
            $table->text('personal_notes')->nullable();
            $table->enum('mastery_level', ['learning', 'familiar', 'mastered'])->default('learning');
            $table->timestamp('last_practiced_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'vocabulary_item_id']);
        });

        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('badge_code')->unique();
            $table->string('title');
            $table->text('description');
            $table->string('icon_url')->nullable();
            $table->string('criteria_type'); // exercises_completed, perfect_score, streak_days
            $table->unsignedInteger('criteria_threshold');
            $table->timestamps();
        });

        Schema::create('student_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('achievement_id')->constrained('achievements')->cascadeOnDelete();
            $table->timestamp('awarded_at')->useCurrent();

            $table->unique(['student_id', 'achievement_id']);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type'); // approval, assignment_due, exam_graded, announcement
            $table->string('title');
            $table->text('message');
            $table->string('action_url')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('category')->default('general');
            $table->boolean('is_encrypted')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('student_achievements');
        Schema::dropIfExists('achievements');
        Schema::dropIfExists('student_vocabulary');
        Schema::dropIfExists('vocabulary_items');
    }
};
