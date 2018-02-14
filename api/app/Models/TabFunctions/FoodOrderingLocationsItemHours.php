<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;

class FoodOrderingLocationsItemHours extends Model {

    protected $table = 'tp_func_food_location_item_hours';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_food_location_item_hours';

    public static function getData(int $item_id) {
       return self::select('id', 'item_id', 'day', 'status')
            ->where('item_id', $item_id)
            ->orderBy('id')
            ->groupBy('day')
            ->get();
    }

    public static function getItemHoursData($item_id, $day) {
        return self::select('id', 'start_time', 'end_time')
            ->where('item_id', $item_id)
            ->where('day', $day)
            ->get();
    }

    public static function saveFoodLocationsItemHours($id = false, $item_id, $day, $start_time, $end_time, $status) {
        if(($id !== false && $id != '')) {
            DB::table(self::TABLE)->where('id', $id)->update([
                'item_id' => $item_id, 'day' => $day, 'start_time'=>$start_time, 'end_time'=>$end_time, 'status'=>$status
            ]);
        } else {
            self::create(['item_id' => $item_id, 'day' => $day, 'start_time'=>$start_time, 'end_time'=>$end_time, 'status'=>$status]);
        }
        return;
    }

    public static function getLocationHoursItemData(int $item_id, $day = false) {
        $query = self::select('id', 'item_id', 'day', 'status', 'start_time', 'end_time');
             $query->where('item_id', $item_id);
             if($day !== false) {
                $query->where('day', $day);
             }
             return $query->get();
     }

}