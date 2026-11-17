<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voice_recordings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('storage_path');
            $table->unsignedInteger('duration_ms')->default(0);
            $table->unsignedInteger('sample_rate')->default(16000);
            $table->unsignedBigInteger('file_size_bytes')->default(0);
            $table->string('audio_format', 10)->default('wav');
            $table->timestamp('consent_acknowledged_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('pronunciation_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->string('target_text'); // e.g. "Think"
            $table->string('ipa_transcription'); // e.g. "/θɪŋk/"
            $table->string('audio_sample_url')->nullable();
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->text('phonetic_explanation')->nullable();
            $table->jsonb('target_phonemes')->nullable(); // e.g. ["θ", "ɪ", "ŋ", "k"]
            $table->timestamps();
        });

        Schema::create('pronunciation_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exercise_id')->constrained('pronunciation_exercises')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('voice_recording_id')->constrained('voice_recordings')->cascadeOnDelete();
            $table->unsignedSmallInteger('attempt_number')->default(1);
            $table->timestamps();
        });

        Schema::create('pronunciation_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('pronunciation_attempts')->cascadeOnDelete();
            $table->decimal('overall_score', 5, 2);
            $table->decimal('accuracy_score', 5, 2);
            $table->decimal('fluency_score', 5, 2);
            $table->decimal('completeness_score', 5, 2);
            $table->decimal('prosody_score', 5, 2)->nullable();
            $table->string('assessed_by_provider')->default('azure_ai_speech');
            $table->jsonb('raw_provider_response')->nullable();
            $table->text('actionable_feedback')->nullable();
            $table->timestamps();
        });

        Schema::create('pronunciation_phoneme_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('result_id')->constrained('pronunciation_results')->cascadeOnDelete();
            $table->string('phoneme', 10);
            $table->string('ipa_symbol', 10);
            $table->decimal('score', 5, 2);
            $table->enum('status', ['correct', 'acceptable', 'needs_improvement', 'omitted'])->default('acceptable');
            $table->text('suggestion')->nullable();
            $table->unsignedInteger('start_offset_ms')->nullable();
            $table->unsignedInteger('end_offset_ms')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->enum('cefr_level', ['A1', 'A2', 'B1', 'B2', 'C1'])->default('B1');
            $table->string('topic');
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->text('summary')->nullable();
            $table->enum('status', ['active', 'completed'])->default('active');
            $table->timestamps();
        });

        Schema::create('ai_conversation_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('ai_conversations')->cascadeOnDelete();
            $table->enum('sender_role', ['student', 'ai_tutor']);
            $table->text('content');
            $table->string('audio_url')->nullable();
            $table->jsonb('grammar_feedback')->nullable();
            $table->jsonb('pronunciation_notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_conversation_messages');
        Schema::dropIfExists('ai_conversations');
        Schema::dropIfExists('pronunciation_phoneme_results');
        Schema::dropIfExists('pronunciation_results');
        Schema::dropIfExists('pronunciation_attempts');
        Schema::dropIfExists('pronunciation_exercises');
        Schema::dropIfExists('voice_recordings');
    }
};
