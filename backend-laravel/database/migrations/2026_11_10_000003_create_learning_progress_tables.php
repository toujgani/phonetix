<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title', 160);
            $table->string('target_phoneme', 12)->nullable();
            $table->unsignedSmallInteger('target_practices')->default(10);
            $table->unsignedSmallInteger('completed_practices')->default(0);
            $table->date('due_date')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->timestamps();
            $table->index(['user_id', 'is_completed', 'due_date']);
        });

        Schema::create('learning_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('badge_key', 80);
            $table->string('title', 120);
            $table->text('description');
            $table->timestamp('earned_at');
            $table->unique(['user_id', 'badge_key']);
        });

        Schema::table('pronunciation_attempts', function (Blueprint $table) {
            $table->index(['student_id', 'created_at']);
            $table->index(['exercise_id', 'created_at']);
        });
        Schema::table('assignment_submissions', function (Blueprint $table) {
            $table->index(['assignment_id', 'student_id']);
            $table->index(['graded_at', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('assignment_submissions', function (Blueprint $table) { $table->dropIndex(['assignment_id', 'student_id']); $table->dropIndex(['graded_at', 'created_at']); });
        Schema::table('pronunciation_attempts', function (Blueprint $table) { $table->dropIndex(['student_id', 'created_at']); $table->dropIndex(['exercise_id', 'created_at']); });
        Schema::dropIfExists('learning_badges');
        Schema::dropIfExists('learning_goals');
    }
};
