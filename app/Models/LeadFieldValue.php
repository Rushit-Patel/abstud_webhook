<?php 
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LeadFieldValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'lead_field_id',
        'value',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function field()
    {
        return $this->belongsTo(LeadField::class, 'lead_field_id');
    }
}
