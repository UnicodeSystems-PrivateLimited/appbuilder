<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class CountryCodeIso extends Model {

     protected $table = 'country_code_iso';
    protected $guarded = ['id'];


  /**
     * get iso codes for countries
     */
    public static function countryListISO() {
        return self::select('id as value','name as label')
              ->get();
    }
    
    public static function country($id){
        return self::select('id','name','code')
            ->where('id',$id)
            ->first();
    }
    
}