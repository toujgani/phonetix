<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    protected $table = 'groups';
    protected $guarded = [];

    public function semester() { return $this->belongsTo(Semester::class); }
    public function students() { return $this->belongsToMany(User::class, 'group_enrollments', 'group_id', 'student_id')->withPivot('status', 'enrolled_at'); }
}
