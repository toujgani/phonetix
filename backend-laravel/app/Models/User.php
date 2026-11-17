<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'institutional_id',
        'first_name',
        'last_name',
        'email',
        'personal_email',
        'phone',
        'password',
        'role',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'avatar_url',
        'preferred_language',
        'preferences',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'last_login_at' => 'datetime',
        'preferences' => 'array',
        'password' => 'hashed',
    ];

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function groups()
    {
        return $this->belongsToMany(Group::class, 'group_enrollments', 'student_id', 'group_id')
            ->withPivot('status', 'enrolled_at');
    }

    public function pronunciationAttempts()
    {
        return $this->hasMany(PronunciationAttempt::class, 'student_id');
    }

    public function voiceRecordings()
    {
        return $this->hasMany(VoiceRecording::class, 'user_id');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class, 'user_id');
    }
}
