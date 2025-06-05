<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FacebookFormFieldMapping extends Model
{
    use HasFactory;

    protected $fillable = [
        'facebook_lead_form_id',
        'facebook_field_name',
        'lead_field_id',
    ];

    public function facebookForm()
    {
        return $this->belongsTo(FacebookLeadForm::class, 'facebook_lead_form_id');
    }

    public function leadField()
    {
        return $this->belongsTo(LeadField::class, 'lead_field_id');
    }
}
