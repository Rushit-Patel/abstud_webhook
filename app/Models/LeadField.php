<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LeadField extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'label',
        'type',
        'options',
        'settings',
        'is_active',
    ];

    protected $casts = [
        'options' => 'array',
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    public function values()
    {
        return $this->hasMany(LeadFieldValue::class);
    }

    public function facebookMappings()
    {
        return $this->hasMany(FacebookFormFieldMapping::class, 'lead_field_id');
    }

}
