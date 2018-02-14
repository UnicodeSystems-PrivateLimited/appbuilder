<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\TabFunctions\ContactUsController;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;
use App\Models\TpAppsTabEntity;

class ContactUs extends Model {

    protected $table = 'tp_func_contact_us';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_contact_us';

    /**
     * get contact us locations for tab
     */
    public static function getContactUsLocationList(int $tabId) {
        return self::select('id', 'address_sec_1', 'address_sec_2', 'm_lat', 'm_long', 'm_distance_type')
                        ->where('tab_id', $tabId)
                        ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
                        ->orderBy('sort_order', 'ASC')
                        ->get();
    }

    /**
     * get specific location info for selected location
     */
    public static function getContactUsLocationInfo(int $id) {
        $leftImageURL = ContactUsController::getLeftImageUploadURL();
        $rightImageURL = ContactUsController::getRightImageUploadURL();
        return self::select(DB::raw("`id`, `address_sec_1`, `address_sec_2`,`website`, `email_id`, `telephone`, `m_lat`,`m_long`,`m_distance_type`,`is_left_right_image_enabled`," . self::_getImageSelectString($leftImageURL, 'left_image') . "," . self::_getImageSelectString($rightImageURL, 'right_image')))
                        ->where('id', $id)
                        ->first();
    }

    public static function getFirstContactUsLocationInfo(int $tabId) {
        $leftImageURL = ContactUsController::getLeftImageUploadURL();
        $rightImageURL = ContactUsController::getRightImageUploadURL();
        return self::select(DB::raw("`id`, `address_sec_1`, `address_sec_2`,`website`, `email_id`, `telephone`, `m_lat`,`m_long`,`m_distance_type`," . self::_getImageSelectString($leftImageURL, 'left_image') . "," . self::_getImageSelectString($rightImageURL, 'right_image')))
                        ->where('tab_id', $tabId)
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
    public static function deleteContactUs($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` = '' AND `$colName` IS NULL, NULL, (CONCAT('$url','/',`$colName`))) as `$colName`";
    }

    public static function getLocationListByAppId(int $appId) {
        return DB::table(self::TABLE . ' as main')
                        ->select('main.id', 'main.address_sec_1', 'main.address_sec_2', 'main.m_lat', 'main.m_long', 'main.telephone')
                        ->join(TpAppsTabEntity::TABLE . ' as t', 't.id', '=', 'main.tab_id')
                        ->where('t.app_id', $appId)
                        ->get();
    }

    /**
     * get specific location info for selected location for event tab
     */
    public static function getContactUsLocationEventsInfo(int $id) {
        return self::select(DB::raw("`id`, `address_sec_1`, `address_sec_2`, `m_lat`,`m_long`"))
                        ->where('id', $id)
                        ->first();
    }

    /**
     * 
     * @param int $tabId Tab Id
     * @return type
     */
    public static function IsSingleEntry(int $tabId) {
        return self::select('id', 'tab_id')
                        ->where('tab_id', $tabId)->get()->count();
    }

}
