<?php
namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;

class FoodOrderingLocations extends Model
{

    protected $table = 'tp_func_food_locations';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_food_locations';

    public static function getData(int $tabID)
    {
        return self::select('id', 'tab_id', 'is_custom_timezone', 'timezone_id', 'is_imported_locations', 'imported_location_id', 'address_section_1', 'address_section_2', 'latitude', 'longitude', 'distance_type', 'emails')
            ->where('tab_id', $tabID)
            ->get();
    }

    public static function deleteFoodLocation($id)
    {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function getLocationList(int $tabID)
    {
        return DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.tab_id', 'main.is_custom_timezone', 'main.timezone_id', 'main.address_section_1', 'main.address_section_2', 'main.latitude', 'main.longitude', 'main.distance_type', 'tz.time_zone')
            ->leftJoin(EventsTimeZone::TABLE . ' as tz', 'main.timezone_id', '=', 'tz.id')
            ->where('tab_id', $tabID)
            ->get();
    }

}