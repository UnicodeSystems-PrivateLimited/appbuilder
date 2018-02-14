<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class ContactUsOpening extends Model {

    protected $table = 'tp_func_contact_us_opening';
    protected $guarded = ['id'];
    
    /**
     * get contact us openings for contact
     */
    public static function getContactUsOpenings(int $contact_id) {
        return self::select('id','day_name','open_from','open_to')
            ->where('contact_id', $contact_id)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->get();
    }
    
    /**
     * get opening data
     */
    public static function getContactUsOpeningData(int $id){
        return self::select('id','day_name','open_from','open_to')
            ->where('id', $id)
            ->first();
    }

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

    /**
     * @param mixed $id
     */
    public static function deleteOpening($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }


}