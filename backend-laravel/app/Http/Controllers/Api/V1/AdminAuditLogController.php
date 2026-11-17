<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AdminAuditLogController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 25);
        abort_unless(in_array($perPage, [10, 25, 50, 100], true), 422, 'Unsupported page size.');

        $query = AuditLog::query()->with('user:id,first_name,last_name,email');
        if ($search = trim((string) $request->query('search', ''))) {
            $needle = mb_strtolower($search);
            $query->where(function ($builder) use ($needle) {
                $builder->whereRaw('LOWER(action) LIKE ?', ["%{$needle}%"])
                    ->orWhereRaw('LOWER(entity_type) LIKE ?', ["%{$needle}%"])
                    ->orWhereRaw('LOWER(ip_address) LIKE ?', ["%{$needle}%"])
                    ->orWhereHas('user', fn ($user) => $user
                        ->whereRaw('LOWER(first_name) LIKE ?', ["%{$needle}%"])
                        ->orWhereRaw('LOWER(last_name) LIKE ?', ["%{$needle}%"])
                        ->orWhereRaw('LOWER(email) LIKE ?', ["%{$needle}%"]));
            });
        }

        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc') === 'asc' ? 'asc' : 'desc';
        if (in_array($sort, ['id', 'action', 'entity_type', 'ip_address', 'created_at'], true)) {
            $query->orderBy($sort, $direction);
        }

        $logs = $query->paginate($perPage);
        $logs->getCollection()->transform(fn (AuditLog $log) => [
            'id' => $log->id,
            'user_name' => $log->user ? trim($log->user->first_name.' '.$log->user->last_name) : 'System',
            'user_email' => $log->user?->email,
            'action' => $log->action,
            'entity' => $log->entity_type ? class_basename($log->entity_type) : '—',
            'entity_id' => $log->entity_id,
            'ip_address' => $log->ip_address,
            'timestamp' => $log->created_at?->toISOString(),
        ]);

        return response()->json(['logs' => $logs]);
    }
}
