<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\tabFunctions\GPSCouponCodeController;
use Illuminate\Database\Eloquent\Collection;
use App\Models\TabFunctions\ContactUs;
use App\Models\TabFunctions\EventsTimeZone;


class GPSCouponCode extends Model {

    protected $table = 'tp_func_gps_code';
    protected $guarded = ['id'];
    const TABLE = 'tp_func_gps_code';

    /**
     * get contact us locations for tab
     */
    
    public static function getGPSCouponData(int $id) {
        $phoneImageURL = GPSCouponCodeController::getPhoneHeaderImageUploadURL();
        $tabletImageURL = GPSCouponCodeController::getTabletHeaderImageUploadURL();
        return self::select(DB::raw("`id`,"  . self::_getImageSelectString($phoneImageURL, 'phone_header_image') . "," . self::_getImageSelectString($tabletImageURL, 'tablet_header_image') . ",`coupon_name`,`location_id`,`is_header_required`,`radius`,`radius_unit`,`start_date`,`end_date`,`coupon_reuse`,`timezone_id`,`check_in_target`,`hours_before_checkin`,`coupon_status`,`description`,`sort_order`,`created_at`"))
            ->where('id', $id)
            ->first();
    }

    
    public static function getGPSCoupons(int $id) {
        $phoneImageURL = GPSCouponCodeController::getPhoneHeaderImageUploadURL();
        $tabletImageURL = GPSCouponCodeController::getTabletHeaderImageUploadURL();
        return self::select(DB::raw("`id`,"  . self::_getImageSelectString($phoneImageURL, 'phone_header_image') . "," . self::_getImageSelectString($tabletImageURL, 'tablet_header_image') . ",`coupon_name`,`location_id`,`radius`,`radius_unit`,`start_date`,`end_date`,`coupon_reuse`,`timezone_id`,`check_in_target`,`hours_before_checkin`,`coupon_status`,`description`,`sort_order`,`created_at`"))
            ->where('tab_id', $id)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('coupon_name', 'ASC')
            ->get();
    }
    
    
    /**
     * @param mixed $id
     */
    public static function deleteGPSCoupon($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
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
    
    private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$colName`";
    }
    
     public static function getAppGPSCoupons(int $id) {
        $phoneImageURL = GPSCouponCodeController::getPhoneHeaderImageUploadURL();
        $tabletImageURL = GPSCouponCodeController::getTabletHeaderImageUploadURL();
        return DB::table(self::TABLE . ' as main')
                        ->select('main.id',DB::raw(self::_getImageSelectString($phoneImageURL, 'phone_header_image')),DB::raw(self::_getImageSelectString($tabletImageURL, 'tablet_header_image')),'main.coupon_name','main.location_id','main.radius','con.m_lat','con.m_long','main.radius_unit','main.start_date','main.end_date','main.coupon_reuse','main.timezone_id','main.check_in_target','main.hours_before_checkin','main.coupon_status','main.scan_count','main.description','main.created_at','tz.offset')
                        ->leftJoin(ContactUs::TABLE . ' as con', 'main.location_id', '=', 'con.id')
                        ->leftJoin(EventsTimeZone::TABLE . ' as tz', 'main.timezone_id', '=', 'tz.id')
                        ->where('main.tab_id', $id)
                        ->where('coupon_status', 1)
                        // ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
                        // ->orderBy('main.sort_order', 'ASC')
                        // ->orderBy('main.coupon_name', 'ASC')
                        ->get();



    }

    public static function getAppGPSCouponData(int $id) {
        $phoneImageURL = GPSCouponCodeController::getPhoneHeaderImageUploadURL();
        $tabletImageURL = GPSCouponCodeController::getTabletHeaderImageUploadURL();
            return DB::table(self::TABLE . ' as main')
                        ->select('main.id',DB::raw(self::_getImageSelectString($phoneImageURL, 'phone_header_image')),DB::raw(self::_getImageSelectString($tabletImageURL, 'tablet_header_image')),'main.coupon_name','main.location_id','main.radius','con.m_lat','con.m_long','main.radius_unit','main.start_date','main.end_date','main.coupon_reuse','main.timezone_id','main.check_in_target','main.hours_before_checkin','main.coupon_status','main.scan_count','main.description','main.created_at')
                        ->leftJoin(ContactUs::TABLE . ' as con', 'main.location_id', '=', 'con.id')
                        ->where('main.id', $id)
                        ->first();
    }


}