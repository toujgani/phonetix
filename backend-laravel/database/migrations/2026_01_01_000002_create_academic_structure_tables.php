<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g. "2026-2027"
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_current')->default(false);
            $table->timestamps();
        });

        Schema::create('semesters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained('academic_years')->cascadeOnDelete();
            $table->string('name'); // e.g. "Semester 1", "Fall 2026"
            $table->unsignedTinyInteger('semester_number')->default(1);
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();
        });

        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('head_name')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->enum('degree_level', ['undergraduate', 'postgraduate', 'diploma'])->default('undergraduate');
            $table->timestamps();
        });

        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
            $table->foreignId('semester_id')->constrained('semesters')->cascadeOnDelete();
            $table->string('name'); // e.g. "G1", "Phonetics Cohort A"
            $table->unsignedSmallInteger('capacity')->default(35);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('group_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['active', 'transferred', 'completed'])->default('active');
            $table->timestamp('enrolled_at')->useCurrent();

            $table->unique(['group_id', 'student_id']);
        });

        Schema::create('teacher_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->unsignedBigInteger('course_id');
            $table->boolean('is_primary')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_assignments');
        Schema::dropIfExists('group_enrollments');
        Schema::dropIfExists('groups');
        Schema::dropIfExists('programs');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('semesters');
        Schema::dropIfExists('academic_years');
    }
};
