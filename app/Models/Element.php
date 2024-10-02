<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Element extends Model
{
     use HasFactory;

    protected $fillable = [
        'user_id',
        'element_name',
        'description',
        'element_type',
        'meaning',
    ];

    /**
     * Relación con el usuario.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
