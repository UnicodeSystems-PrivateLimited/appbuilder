<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class Direction extends Model {

    protected $table = 'tp_func_direction_tab';
    protected $guarded = ['id'];
    
    /**
     * get contact us locations for tab
     */
    public static function directionList(int $tabId) {
        return self::select('id','title','m_lat','m_long')
            ->where('tab_id', $tabId)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('title', 'ASC')
            ->get();
    }
    
    
    /**
     * get Direction Information
     */
    public static function getDirectionInfo(int $id) {
        return self::select('id','tab_id','title','m_lat','m_long','created_at')
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
    public static function deleteDirection($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }
    
    


}