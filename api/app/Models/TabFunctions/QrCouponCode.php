<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\tabFunctions\QrCouponCodeController;
use Illuminate\Database\Eloquent\Collection;
use App\Models\TabFunctions\EventsTimeZone;

class QrCouponCode extends Model {

    protected $table = 'tp_func_qr_code';
    protected $guarded = ['id'];
    const TABLE = 'tp_func_qr_code';


    /**
     * get contact us locations for tab
     */
    
    public static function getQrCouponData(int $id) {
        $phoneImageURL = QrCouponCodeController::getPhoneHeaderImageUploadURL();
        $tabletImageURL = QrCouponCodeController::getTabletHeaderImageUploadURL();
        return self::select(DB::raw("`id`,"  . self::_getImageSelectString($phoneImageURL, 'phone_header_image') . "," . self::_getImageSelectString($tabletImageURL, 'tablet_header_image') . ",`coupon_name`,`qr_code`,`coupon_reuse`,`start_date`,`is_header_required`,`end_date`,`timezone_id`,`check_in_target`,`hours_before_checkin`,`coupon_status`,`description`,`sort_order`,`created_at`"))
            ->where('id', $id)
            ->first();
    }

    
    public static function getQrCoupons(int $id) {
        $phoneImageURL = QrCouponCodeController::getPhoneHeaderImageUploadURL();
        $tabletImageURL = QrCouponCodeController::getTabletHeaderImageUploadURL();
        return self::select(DB::raw("`id`,"  . self::_getImageSelectString($phoneImageURL, 'phone_header_image') . "," . self::_getImageSelectString($tabletImageURL, 'tablet_header_image') . ",`coupon_name`,`qr_code`,`coupon_reuse`,`timezone_id`,`check_in_target`,`start_date`,`end_date`,`hours_before_checkin`,`coupon_status`,`description`,`sort_order`,`created_at`"))
            ->where('tab_id', $id)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('coupon_name', 'ASC')
            ->get();
    }
    
    public static function getAppQrCoupons(int $id) {
        $phoneImageURL = QrCouponCodeController::getPhoneHeaderImageUploadURL();
        $tabletImageURL = QrCouponCodeController::getTabletHeaderImageUploadURL();
        return DB::table(self::TABLE . ' as main')
            ->select('main.id', DB::raw(self::_getImageSelectString($phoneImageURL, 'phone_header_image')), DB::raw(self::_getImageSelectString($tabletImageURL, 'tablet_header_image')),'main.coupon_name','main.qr_code','main.coupon_reuse','main.timezone_id','main.check_in_target','main.start_date','main.end_date','main.hours_before_checkin','main.coupon_status','main.description','main.sort_order','main.created_at','tz.offset')
            ->leftJoin(EventsTimeZone::TABLE . ' as tz', 'main.timezone_id', '=', 'tz.id')
            ->where('main.tab_id', $id)
            ->where('main.coupon_status', 1)
            ->orderBy(DB::raw('(main.sort_order=0)'), 'ASC')
            ->orderBy('main.sort_order', 'ASC')
            ->orderBy('main.coupon_name', 'ASC')
            ->get();
    }
    
    
    /**
     * @param mixed $id
     */
    public static function deleteQRCoupon($id) {
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
    
    


}