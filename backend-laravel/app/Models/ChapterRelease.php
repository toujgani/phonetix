<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

/**
 * ChapterRelease
 *
 * Records the publication state of a Chapter for a specific StudentGroup.
 * Supports professor-controlled, group-isolated chapter releases.
 *
 * @property int         $id
 * @property int         $chapter_id
 * @property int         $group_id
 * @property string      $status         draft|scheduled|published|locked
 * @property int|null    $released_by
 * @property \Carbon\Carbon|null $released_at
 * @property \Carbon\Carbon|null $scheduled_at
 * @property int|null    $locked_by
 * @property \Carbon\Carbon|null $locked_at
 * @property string|null $lock_reason
 */
class ChapterRelease extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'chapter_id',
        'group_id',
        'status',
        'released_by',
        'released_at',
        'scheduled_at',
        'locked_by',
        'locked_at',
        'lock_reason',
    ];

    protected $casts = [
        'released_at'  => 'datetime',
        'scheduled_at' => 'datetime',
        'locked_at'    => 'datetime',
    ];

    // ─── Relationships ───────────────────────────────────────────────────────

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(StudentGroup::class, 'group_id');
    }

    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by');
    }

    public function lockedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'locked_by');
    }

    // ─── Status Helpers ──────────────────────────────────────────────────────

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isLocked(): bool
    {
        return $this->status === 'locked';
    }

    /**
     * Whether a student can currently access this chapter.
     * Only 'published' status grants student access.
     */
    public function isAccessible(): bool
    {
        return $this->status === 'published';
    }

    // ─── Scopes ─────────────────────────────────────────────────────────────

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopeLocked(Builder $query): Builder
    {
        return $query->where('status', 'locked');
    }

    public function scopeScheduled(Builder $query): Builder
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeForGroup(Builder $query, int $groupId): Builder
    {
        return $query->where('group_id', $groupId);
    }

    public function scopeForChapter(Builder $query, int $chapterId): Builder
    {
        return $query->where('chapter_id', $chapterId);
    }
}
