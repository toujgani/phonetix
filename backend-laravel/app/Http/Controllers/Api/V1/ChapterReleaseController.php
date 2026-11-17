<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\ChapterRelease;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * ChapterReleaseController
 *
 * Manages group-specific chapter publication state.
 * All mutation endpoints require teacher or super_admin role.
 *
 * Routes:
 *   POST /api/v1/chapters/{chapter}/launch    — Publish chapter for a group
 *   POST /api/v1/chapters/{chapter}/lock      — Lock chapter for a group
 *   POST /api/v1/chapters/{chapter}/schedule  — Schedule future release
 *   GET  /api/v1/chapters/{chapter}/access    — Check student's group access
 */
class ChapterReleaseController extends Controller
{
    /**
     * POST /api/v1/chapters/{chapter}/launch
     *
     * Publish a chapter for a specific student group.
     * Notifies group students via queue (see ChapterLaunched event).
     * Logs the release with actor ID, chapter ID, group ID, and timestamp.
     */
    public function launch(Request $request, Chapter $chapter): JsonResponse
    {
        $this->authorize('launch', $chapter);

        $validated = $request->validate([
            'group_id' => ['required', 'integer', 'exists:student_groups,id'],
        ]);

        $release = DB::transaction(function () use ($chapter, $validated) {
            return ChapterRelease::updateOrCreate(
                [
                    'chapter_id' => $chapter->id,
                    'group_id'   => $validated['group_id'],
                ],
                [
                    'status'      => 'published',
                    'released_by' => Auth::id(),
                    'released_at' => now(),
                    // Clear any previous lock state
                    'locked_at'   => null,
                    'locked_by'   => null,
                    'lock_reason' => null,
                    // Clear scheduled state if manually launched
                    'scheduled_at' => null,
                ]
            );
        });

        Log::info('Chapter launched', [
            'chapter_id'  => $chapter->id,
            'chapter_title' => $chapter->title ?? 'N/A',
            'group_id'    => $validated['group_id'],
            'released_by' => Auth::id(),
            'released_at' => now()->toIso8601String(),
        ]);

        // TODO: dispatch(new ChapterLaunched($chapter, $validated['group_id'], Auth::user()));

        return response()->json([
            'success' => true,
            'message' => 'Chapter launched successfully for the group.',
            'data'    => $release->fresh(['chapter', 'group', 'releasedBy']),
        ], 200);
    }

    /**
     * POST /api/v1/chapters/{chapter}/lock
     *
     * Lock a chapter for a specific group.
     * Blocks new submissions/exercises while strictly preserving past student progress.
     */
    public function lock(Request $request, Chapter $chapter): JsonResponse
    {
        $this->authorize('lock', $chapter);

        $validated = $request->validate([
            'group_id'    => ['required', 'integer', 'exists:student_groups,id'],
            'lock_reason' => ['nullable', 'string', 'max:500'],
        ]);

        $release = DB::transaction(function () use ($chapter, $validated) {
            return ChapterRelease::updateOrCreate(
                [
                    'chapter_id' => $chapter->id,
                    'group_id'   => $validated['group_id'],
                ],
                [
                    'status'      => 'locked',
                    'locked_by'   => Auth::id(),
                    'locked_at'   => now(),
                    'lock_reason' => $validated['lock_reason'] ?? null,
                ]
            );
        });

        Log::info('Chapter locked', [
            'chapter_id'  => $chapter->id,
            'group_id'    => $validated['group_id'],
            'locked_by'   => Auth::id(),
            'lock_reason' => $validated['lock_reason'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Chapter locked. Past student progress is fully preserved.',
            'data'    => $release->fresh(),
        ], 200);
    }

    /**
     * POST /api/v1/chapters/{chapter}/schedule
     *
     * Schedule a future automatic release of a chapter for a specific group.
     * A queue job (ProcessScheduledChapterReleases) publishes at the scheduled time.
     */
    public function schedule(Request $request, Chapter $chapter): JsonResponse
    {
        $this->authorize('launch', $chapter);

        $validated = $request->validate([
            'group_id'     => ['required', 'integer', 'exists:student_groups,id'],
            'scheduled_at' => ['required', 'date', 'after:now'],
        ]);

        $scheduledAt = Carbon::parse($validated['scheduled_at']);

        $release = ChapterRelease::updateOrCreate(
            [
                'chapter_id' => $chapter->id,
                'group_id'   => $validated['group_id'],
            ],
            [
                'status'       => 'scheduled',
                'scheduled_at' => $scheduledAt,
                'released_by'  => Auth::id(),
                // Clear lock state when scheduling
                'locked_at'   => null,
                'locked_by'   => null,
                'lock_reason' => null,
            ]
        );

        Log::info('Chapter scheduled for release', [
            'chapter_id'   => $chapter->id,
            'group_id'     => $validated['group_id'],
            'scheduled_at' => $scheduledAt->toIso8601String(),
            'scheduled_by' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => sprintf(
                'Chapter scheduled for release on %s.',
                $scheduledAt->format('D, M j Y \a\t H:i T')
            ),
            'data' => $release->fresh(),
        ], 200);
    }

    /**
     * GET /api/v1/chapters/{chapter}/access
     *
     * Check whether the authenticated user's group has access to this chapter.
     * Teachers and admins always have access. Students must be in a released group.
     */
    public function checkAccess(Request $request, Chapter $chapter): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'authorized' => false,
                'reason'     => 'unauthenticated',
            ], 401);
        }

        // Teachers and super admins have unrestricted access
        if (in_array($user->role, ['teacher', 'super_admin'])) {
            return response()->json([
                'authorized' => true,
                'role'       => $user->role,
            ], 200);
        }

        // Reject accounts that are not active
        if ($user->status !== 'active') {
            return response()->json([
                'authorized' => false,
                'reason'     => 'account_' . $user->status,
                'message'    => 'Your account is not active. Please contact the registrar.',
            ], 403);
        }

        // Students: check their assigned group's release status for this chapter
        $groupId = $user->student_group_id ?? null;

        if (!$groupId) {
            return response()->json([
                'authorized' => false,
                'reason'     => 'no_group_assigned',
                'message'    => 'You have not been assigned to a student group yet.',
            ], 403);
        }

        /** @var ChapterRelease|null $release */
        $release = ChapterRelease::where('chapter_id', $chapter->id)
            ->where('group_id', $groupId)
            ->first();

        if (!$release || !$release->isPublished()) {
            $status = $release?->status ?? 'not_released';

            return response()->json([
                'authorized' => false,
                'reason'     => $status,
                'message'    => match ($status) {
                    'locked'       => 'This chapter has been locked by your professor. New submissions are not accepted.',
                    'scheduled'    => sprintf(
                        'This chapter is scheduled for release on %s.',
                        $release?->scheduled_at?->format('D, M j Y') ?? 'a future date'
                    ),
                    'draft'        => 'This chapter has not yet been released by your professor.',
                    default        => 'This chapter has not yet been released by your professor.',
                },
            ], 403);
        }

        return response()->json([
            'authorized'  => true,
            'released_at' => $release->released_at?->toIso8601String(),
            'group_id'    => $groupId,
        ], 200);
    }
}
