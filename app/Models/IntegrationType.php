<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntegrationType extends Model
{
    protected $fillable = ['name', 'slug', 'auth_config'];

    protected $casts = [
        'auth_config' => 'array',
    ];

    public function integrations()
    {
        return $this->hasMany(Integration::class, 'type_id');
    }
}