<?php
// app/Models/Trigger.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Trigger extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'type',
        'config',
        'status',
        'is_template',
        'metadata',
    ];

    protected $casts = [
        'config' => 'array',
        'metadata' => 'array',
        'is_template' => 'boolean',
    ];

    protected $dates = [
        'deleted_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function workflows()
    {
        return $this->hasMany(Workflow::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeTemplates($query)
    {
        return $query->where('is_template', true);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Check if trigger is being used by any workflows
    public function isInUse()
    {
        return $this->workflows()->exists();
    }

    // Get formatted type name
    public function getFormattedTypeAttribute()
    {
        return ucwords(str_replace('_', ' ', $this->type));
    }

    // Get summary of configuration
    public function getConfigSummary()
    {
        if (!$this->config) {
            return 'Not configured';
        }

        switch ($this->type) {
            case 'webhook':
                return $this->config['url'] ?? 'No URL set';
            case 'schedule':
                return $this->config['cron'] ?? 'No schedule set';
            case 'event':
                return $this->config['event_type'] ?? 'No event type set';
            default:
                return 'Configured';
        }
    }
}