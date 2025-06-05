<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FacebookLeadForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'integration_id',
        'facebook_form_id',
        'facebook_page_id',
        'form_name',
        'questions'
    ];

    /**
     * Relationship to the integration (e.g., Facebook account connection).
     */
    public function integration()
    {
        return $this->belongsTo(Integration::class);
    }

    /**
     * Field mappings from Facebook form to CRM lead fields.
     */
    public function fieldMappings()
    {
        return $this->hasMany(FacebookFormFieldMapping::class);
    }
}
