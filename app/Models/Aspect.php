<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aspect extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'aspect',
        'involved_planets',
        'aspect_type',
        'meaning',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
