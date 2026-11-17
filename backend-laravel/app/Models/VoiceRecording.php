<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VoiceRecording extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'storage_path',
        'duration_ms',
        'sample_rate',
        'file_size_bytes',
        'audio_format',
        'consent_acknowledged_at',
    ];

    protected $casts = [
        'consent_acknowledged_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
