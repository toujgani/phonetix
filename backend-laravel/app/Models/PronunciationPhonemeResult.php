<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PronunciationPhonemeResult extends Model
{
    protected $fillable = ['result_id', 'phoneme', 'ipa_symbol', 'score', 'status', 'suggestion', 'start_offset_ms', 'end_offset_ms'];
    protected $casts = ['score' => 'float'];
    public function result() { return $this->belongsTo(PronunciationResult::class, 'result_id'); }
}
