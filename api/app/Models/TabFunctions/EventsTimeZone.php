<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Http\Controllers\tabFunctions\EventsTabController;


class EventsTimeZone extends Model
{

    protected $table = 'tp_func_event_timezone';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_event_timezone';

    /**
     * get contact us locations for tab
     */
    public static function timezoneList()
    {
        return self::select('id', 'name', 'offset', 'offset_name')
            ->get();
    }

    public static function timezone($id)
    {
        return self::select('id', 'name', 'time_zone', 'offset', 'offset_name')
            ->where('id', $id)
            ->first();
    }
}