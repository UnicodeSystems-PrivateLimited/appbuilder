<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class AroundUs extends Model {

    protected $table = 'tp_func_around_us';
    protected $guarded = ['id'];
    const TABLE = 'tp_func_around_us';

    
    /**
     * get around us categories for tab
     */
    public static function getAroundUsCategoryList(int $tabId) {
        return self::select('id','tab_id','category_name','color')
            ->where('tab_id', $tabId)
            ->get();
    }
    
    
    /**
     * get specific around us info
     */
    public static function getAroundUsCategoryInfo(int $id) {
        return self::select('id','tab_id','category_name','color','created_at')
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
    
    
    
    

}