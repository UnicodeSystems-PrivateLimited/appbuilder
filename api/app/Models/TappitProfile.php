<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TappitProfile extends Model
{
    protected $table='tappit_profile';
    protected $guarded = ["id"];
    const TABLE = 'tappit_profile';
    
    public function user()
    {
        return $this->belongsTo('LaravelAcl\Authentication\Models\User', "user_id");
    }
    
}
