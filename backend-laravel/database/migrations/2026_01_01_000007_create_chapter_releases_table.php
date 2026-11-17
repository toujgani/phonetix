<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates the chapter_releases table for group-specific chapter publication state management.
     * Supports statuses: draft, scheduled, published, locked.
     * Each (chapter_id, group_id) pair is unique — one release record per chapter per group.
     */
    public function up(): void
    {
        Schema::create('chapter_releases', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('chapter_id');
            $table->unsignedBigInteger('group_id');

            // Current publication status for this chapter-group pair
            $table->enum('status', ['draft', 'scheduled', 'published', 'locked'])->default('draft');

            // Launch tracking
            $table->unsignedBigInteger('released_by')->nullable()->comment('User ID of professor who launched');
            $table->timestamp('released_at')->nullable()->comment('Exact timestamp of launch');

            // Schedule tracking
            $table->timestamp('scheduled_at')->nullable()->comment('Scheduled future launch datetime');

            // Lock tracking (preserves past student progress)
            $table->unsignedBigInteger('locked_by')->nullable()->comment('User ID who locked the chapter');
            $table->timestamp('locked_at')->nullable()->comment('Timestamp of lock action');
            $table->text('lock_reason')->nullable()->comment('Optional professor note for locking');

            $table->timestamps();
            $table->softDeletes();

            // Unique constraint: one release record per chapter per group
            $table->unique(['chapter_id', 'group_id'], 'chapter_releases_chapter_group_unique');

            // Performance indexes
            $table->index(['chapter_id', 'status'], 'chapter_releases_chapter_status_idx');
            $table->index(['group_id', 'status'], 'chapter_releases_group_status_idx');
            $table->index('scheduled_at', 'chapter_releases_scheduled_at_idx');
            $table->index('status', 'chapter_releases_status_idx');

            // Foreign key constraints
            $table->foreign('chapter_id')
                ->references('id')->on('chapters')
                ->onDelete('cascade');

            $table->foreign('group_id')
                ->references('id')->on('groups')
                ->onDelete('cascade');

            $table->foreign('released_by')
                ->references('id')->on('users')
                ->onDelete('set null');

            $table->foreign('locked_by')
                ->references('id')->on('users')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chapter_releases');
    }
};
