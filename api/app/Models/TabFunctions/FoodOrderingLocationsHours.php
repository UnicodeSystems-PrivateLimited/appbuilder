<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;

class FoodOrderingLocationsHours extends Model {

    protected $table = 'tp_func_food_location_hours';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_food_location_hours';

    public static function getData(int $location_id) {
       return self::select('id', 'location_id', 'day', 'status')
            ->where('location_id', $location_id)
            ->orderBy('id')
            ->groupBy('day')
            ->get();
    }

    public static function getHoursData($location_id, $day) {
        return self::select('id', 'start_time', 'end_time')
            ->where('location_id', $location_id)
            ->where('day', $day)
            ->get();
    }

    public static function saveFoodLocationsHours($id = false, $location_id, $day, $start_time, $end_time, $status, $option) {
        if(($id !== false && $id != '') && ($option == 0)) {
            DB::table('tp_func_food_location_hours')->where('id', $id)->update([
                'location_id' => $location_id, 'day' => $day, 'start_time'=>$start_time, 'end_time'=>$end_time, 'status'=>$status
            ]);
        } else {
            self::create(['location_id' => $location_id, 'day' => $day, 'start_time'=>$start_time, 'end_time'=>$end_time, 'status'=>$status]);
        }
        return;
    }

    public static function getLocationHoursData(int $location_id, $day = false) {
        $query = self::select('id', 'location_id', 'day', 'status', 'start_time', 'end_time');
             $query->where('location_id', $location_id);
             if($day !== false) {
                $query->where('day', $day);
             }
             return $query->get();
     }

}