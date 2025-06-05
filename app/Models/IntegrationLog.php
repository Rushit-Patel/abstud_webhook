<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntegrationLog extends Model
{
    protected $fillable = ['integration_id', 'type', 'message', 'context'];

    protected $casts = [
        'context' => 'array',
    ];

    public function integration()
    {
        return $this->belongsTo(Integration::class);
    }
}
