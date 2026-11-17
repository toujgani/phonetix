<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g. "ENG-PHON-101"
            $table->string('title'); // e.g. "English Phonetics & Pronunciation Mastery"
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->unsignedSmallInteger('credits')->default(3);
            $table->text('description')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->unsignedSmallInteger('order_number')->default(1);
            $table->string('title');
            $table->text('description')->nullable();
            $table->jsonb('learning_objectives')->nullable();
            $table->boolean('is_locked')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('weeks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained('chapters')->cascadeOnDelete();
            $table->unsignedSmallInteger('week_number');
            $table->string('title');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('week_id')->constrained('weeks')->cascadeOnDelete();
            $table->foreignId('chapter_id')->constrained('chapters')->cascadeOnDelete();
            $table->unsignedSmallInteger('order_number')->default(1);
            $table->string('title');
            $table->longText('content_body')->nullable();
            $table->string('video_url')->nullable();
            $table->string('audio_url')->nullable();
            $table->unsignedSmallInteger('duration_minutes')->default(20);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        Schema::create('learning_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->string('title');
            $table->enum('file_type', ['pdf', 'docx', 'pptx', 'audio', 'video', 'image']);
            $table->string('file_path');
            $table->unsignedBigInteger('file_size_bytes')->default(0);
            $table->boolean('download_allowed')->default(true);
            $table->timestamps();
        });

        Schema::create('lesson_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('completed_at')->useCurrent();

            $table->unique(['lesson_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_completions');
        Schema::dropIfExists('learning_materials');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('weeks');
        Schema::dropIfExists('chapters');
        Schema::dropIfExists('courses');
    }
};
