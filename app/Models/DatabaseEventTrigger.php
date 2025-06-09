<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DatabaseEventTrigger extends Model
{
    protected $fillable = [
        'trigger_id',
        'table_name',
        'column_filters',
        'value_conditions',
        'operation',
        'capture_old_values',
        'capture_new_values'
    ];

    protected $casts = [
        'column_filters' => 'array',
        'value_conditions' => 'array',
        'capture_old_values' => 'boolean',
        'capture_new_values' => 'boolean'
    ];

    public function trigger(): BelongsTo
    {
        return $this->belongsTo(WorkflowTrigger::class, 'trigger_id');
    }
}