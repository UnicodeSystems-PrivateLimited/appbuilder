<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class FoodOrderLocations extends Model {

    protected $table = 'food_ordering_locations';
    protected $guarded = ['id'];

    /**
     * Sorting
     */
    public static function updateMultiple(array $data, string $updateKey = 'id') {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                self::where($updateKey, $key)->update($value);
            }
        });
    }

    public static function getLocationList(int $tab_id) {       
        return self::select(DB::raw("`id`,`tab_id`,`website`,`timezone`,`email_id`,`telephone`,`week_days_slots`,`address_sec_1`,`address_sec_2`,`m_lat`,`m_long`,`distance_type`,`created_at`")) 
            ->where('tab_id', $tab_id)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->get();
    }
    
    public static function getItemData(int $id) {
        return self::select(DB::raw("`id`,`tab_id`,`website`,`timezone`,`email_id`,`telephone`,`week_days_slots`,`address_sec_1`,`address_sec_2`,`m_lat`,`m_long`,`distance_type`,`created_at`"))    
                        ->where('id', $id)
                        ->first();
    }
    
   
}
