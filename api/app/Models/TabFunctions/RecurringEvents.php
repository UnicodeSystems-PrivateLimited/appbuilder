<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Http\Controllers\tabFunctions\EventsTabController;


class RecurringEvents extends Model {

    protected $table = 'tp_func_recurring_events';
    protected $guarded = ['id'];

      /**
     * get recurring events list for tab
     */
    public static function recurringEventsList(int $tabId) {
        return self::select('id','name','m_lat','m_long','status','duration','start_time','end_date','repeat_date','day_of_week','sort_order','phone_header_image','tablet_header_image','timezone_id','description','imported_location','address_sec_1','address_sec_2','repeat_event')
            ->where('tab_id', $tabId)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('name', 'ASC')
            ->get();
    }

    public static function updateMultiple(array $data, string $updateKey = 'id') {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                self::where($updateKey, $key)->update($value);
            }
        });
    }

       public static function deleteRecurringEvents($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

      public static function getRecurringEventInfo(int $id) {
          $phoneImageURL = EventsTabController::getPhoneHeaderImageUploadURL();
          $tabletImageURL = EventsTabController::getTabletHeaderImageUploadURL();
          return self::select(DB::raw("`id`, `tab_id`,`is_header_required`, `start_time`,`end_date`,"  . self::_getImageSelectString($phoneImageURL, 'phone_header_image') . "," . self::_getImageSelectString($tabletImageURL, 'tablet_header_image') . ",`m_lat`,`address_sec_1`,`timezone_id`,`address_sec_2`,`m_long`,`imported_location`,`description`,`status`,`name`,`location_id`,`duration`,`repeat_date`,`day_of_week`,`repeat_event`"))

            ->where('id', $id)
            ->first();
    }

     private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$colName`";
    }

}