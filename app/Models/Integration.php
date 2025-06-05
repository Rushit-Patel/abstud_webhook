<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Integration extends Model
{
    use SoftDeletes;

    protected $fillable = ['type_id', 'user_id', 'name', 'credentials', 'meta', 'is_active'];

    protected $casts = [
        'credentials' => 'array',
        'meta' => 'array',
        'is_active' => 'boolean',
    ];

    public function type()
    {
        return $this->belongsTo(IntegrationType::class, 'type_id');
    }

    public function oauthToken()
    {
        return $this->hasOne(OauthToken::class);
    }

    public function webhookEndpoints()
    {
        return $this->hasMany(WebhookEndpoint::class);
    }

    public function logs()
    {
        return $this->hasMany(IntegrationLog::class);
    }
}
