<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OauthToken extends Model
{
    protected $fillable = ['integration_id', 'access_token', 'refresh_token', 'expires_at', 'scope'];

    protected $dates = ['expires_at'];

    public function integration()
    {
        return $this->belongsTo(Integration::class);
    }
}