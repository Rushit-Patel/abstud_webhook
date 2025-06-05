<?php
 
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'raw_payload',
    ];

    protected $casts = [
        'raw_payload' => 'array',
    ];

    public function fieldValues()
    {
        return $this->hasMany(LeadFieldValue::class);
    }

    // Optional: get field values with field metadata
    public function valuesWithFields()
    {
        return $this->hasMany(LeadFieldValue::class)->with('field');
    }
}
