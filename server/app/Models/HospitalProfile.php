<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HospitalProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'hospital_name',
        'logo',
        'email',
        'phone',
        'website',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'registration_number',
        'tax_number',
        'contact_person',
        'contact_person_phone',
        'footer_text',
        'terms_conditions',
    ];
}
