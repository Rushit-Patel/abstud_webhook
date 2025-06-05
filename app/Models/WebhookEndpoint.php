<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebhookEndpoint extends Model
{
    protected $fillable = ['integration_id', 'identifier', 'target_url', 'event_type', 'secret', 'is_verified'];

    protected $casts = [
        'is_verified' => 'boolean',
    ];

    public function integration()
    {
        return $this->belongsTo(Integration::class);
    }
}

