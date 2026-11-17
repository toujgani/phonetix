<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('type'); // sound_recognition, minimal_pairs, ipa_challenge, etc.
            $table->enum('difficulty', ['easy', 'medium', 'hard', 'custom'])->default('medium');
            $table->unsignedSmallInteger('time_limit_seconds')->default(60);
            $table->unsignedSmallInteger('passing_score')->default(70);
            $table->text('description')->nullable();
            $table->jsonb('rules_json')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        Schema::create('game_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('games')->cascadeOnDelete();
            $table->text('prompt_text');
            $table->string('audio_prompt_url')->nullable();
            $table->jsonb('options_json'); // array of options
            $table->jsonb('correct_answer_json');
            $table->text('explanation')->nullable();
            $table->unsignedSmallInteger('points')->default(10);
            $table->timestamps();
        });

        Schema::create('game_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('games')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedSmallInteger('score')->default(0);
            $table->boolean('is_passed')->default(false);
            $table->unsignedSmallInteger('time_spent_seconds')->default(0);
            $table->jsonb('answers_json')->nullable();
            $table->timestamps();
        });

        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->timestamp('due_date');
            $table->unsignedSmallInteger('max_score')->default(100);
            $table->jsonb('target_groups')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('voice_recording_id')->nullable()->constrained('voice_recordings')->nullOnDelete();
            $table->text('text_submission')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->text('teacher_feedback')->nullable();
            $table->foreignId('graded_by')->nullable()->references('id')->on('users');
            $table->timestamp('graded_at')->nullable();
            $table->timestamps();
        });

        Schema::create('examinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('title');
            $table->unsignedSmallInteger('duration_minutes')->default(45);
            $table->unsignedSmallInteger('passing_score')->default(60);
            $table->boolean('randomize_questions')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });

        Schema::create('examination_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examination_id')->constrained('examinations')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('score', 5, 2)->nullable();
            $table->boolean('is_graded')->default(false);
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('submitted_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examination_attempts');
        Schema::dropIfExists('examinations');
        Schema::dropIfExists('assignment_submissions');
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('game_attempts');
        Schema::dropIfExists('game_questions');
        Schema::dropIfExists('games');
    }
};
