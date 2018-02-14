<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Http\Controllers\tabFunctions\EventsTabController;

class EventsTab extends Model {

    protected $table = 'tp_func_events_tab';
    protected $guarded = ['id'];
    
    const TABLE = 'tp_func_events_tab';

    const SORT_BY_DATETIME = 1;
    const SORT_BY_MANUAL = 2;

    /**
     * get around us categories for tab
     */
    // public static function getEventsTabEventList(int $tabId) {
    //     return self::select('id','tab_id','phone_header_image','tablet_header_image','event_start_date','event_end_date','timezone_id','name','status','description','imported_location','address_sec_1','address_sec_2','m_lat','m_long')
    //         ->where('tab_id', $tabId)
    //          ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
    //         ->orderBy('sort_order', 'ASC')
    //         ->orderBy('name', 'ASC')
    //         ->get();
    // }

    public static function getEventsTabEventList(int $tabId, int $sortBy = self::SORT_BY_DATETIME) {
        $query = EventsTab::select('id', 'tab_id', 'sort_order', 'phone_header_image', 'tablet_header_image', 'event_start_date', 'event_end_date', 'timezone_id', 'name', 'status', 'description', 'imported_location', 'address_sec_1', 'address_sec_2', 'm_lat', 'm_long')
                ->where('tab_id', $tabId);
        if ($sortBy === self::SORT_BY_MANUAL) {
            $query->orderBy(DB::raw('(sort_order=0)'), 'ASC');
            $query->orderBy('sort_order', 'ASC');
        } else {
            $query->orderBy('event_start_date', 'ASC');
        }
        $query->orderBy('name', 'ASC');
        return $query->get();
    }

    public static function updateMultiple(array $data, string $updateKey = 'id') {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                self::where($updateKey, $key)->update($value);
            }
        });
    }

    public static function deleteEvents($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    /**
     * get single event  Information
     */
    public static function getEventInfo(int $id) {
        $phoneImageURL = EventsTabController::getPhoneHeaderImageUploadURL();
        $tabletImageURL = EventsTabController::getTabletHeaderImageUploadURL();
        return self::select(DB::raw("`id`, `tab_id`, `event_start_date`,`is_header_required`,`event_end_date`," . self::_getImageSelectString($phoneImageURL, 'phone_header_image') . "," . self::_getImageSelectString($tabletImageURL, 'tablet_header_image') . ",`m_lat`,`address_sec_1`,`timezone_id`,`address_sec_2`,`m_long`,`imported_location`,`description`,`status`,`name`,`location_id`"))
                        ->where('id', $id)
                        ->first();
    }

    private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$colName`";
    }

    public static function getUpcomingEventList(int $tabId) {
        return self::select('id', 'tab_id', 'event_start_date','event_end_date', 'name','status')
                        ->where('tab_id', $tabId)
                        // ->where('event_start_date', '>=', DB::raw('NOW()'))
                        ->where('status', 1)
                        ->orderBy('event_start_date', 'ASC')
                        ->get();
    }

    public static function getPastEventList(int $tabId) {
        return self::select('id', 'tab_id', 'event_start_date','event_end_date', 'name','status')
                        ->where('tab_id', $tabId)
                        // ->where('event_start_date', '<', DB::raw('NOW()'))
                        ->where('status', 1)
                        ->orderBy('event_start_date', 'ASC')
                        ->get();
    }
    
    public static function getsingleRecurringEventList(int $tabId, int $recurring_event_id ) {
         return self ::select('id', 'event_start_date')
                ->where('tab_id', $tabId)
                ->where('recurring_event_id', $recurring_event_id)
                ->orderBy('event_start_date', 'ASC')
                ->get();
    }

}
