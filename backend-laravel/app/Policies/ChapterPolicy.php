<?php

namespace App\Policies;

use App\Models\Chapter;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * ChapterPolicy
 *
 * Authorization policy for chapter publication and management actions.
 * Register in AuthServiceProvider:
 *   protected $policies = [
 *       Chapter::class => ChapterPolicy::class,
 *   ];
 */
class ChapterPolicy
{
    use HandlesAuthorization;

    /**
     * Super admins can do anything on any chapter.
     * This runs before all other methods.
     */
    public function before(User $user, string $ability): bool|null
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        return null; // Fall through to specific method checks
    }

    /**
     * Determine if the user can view the chapter.
     * All authenticated users can view chapters (access is filtered at the release layer).
     */
    public function view(User $user, Chapter $chapter): bool
    {
        return in_array($user->role, ['teacher', 'student']);
    }

    /**
     * Determine if the user can launch (publish) the chapter for a group.
     * Teachers may only launch chapters that belong to their own course.
     */
    public function launch(User $user, Chapter $chapter): bool
    {
        if ($user->role !== 'teacher') {
            return false;
        }

        // Teacher must own the course this chapter belongs to
        return $chapter->course?->teacher_id === $user->id;
    }

    /**
     * Determine if the user can lock the chapter for a group.
     * Same authorization as launching.
     */
    public function lock(User $user, Chapter $chapter): bool
    {
        return $this->launch($user, $chapter);
    }

    /**
     * Determine if the user can schedule a future release for a group.
     * Same authorization as launching.
     */
    public function schedule(User $user, Chapter $chapter): bool
    {
        return $this->launch($user, $chapter);
    }

    /**
     * Determine if the user can create a new chapter.
     * Teachers can create chapters in their own courses; admins can create anywhere.
     */
    public function create(User $user): bool
    {
        return $user->role === 'teacher';
    }

    /**
     * Determine if the user can update the chapter metadata.
     */
    public function update(User $user, Chapter $chapter): bool
    {
        return $this->launch($user, $chapter);
    }

    /**
     * Determine if the user can delete the chapter.
     * Only admins (via `before`) or the owning teacher.
     */
    public function delete(User $user, Chapter $chapter): bool
    {
        return $chapter->course?->teacher_id === $user->id;
    }
}
