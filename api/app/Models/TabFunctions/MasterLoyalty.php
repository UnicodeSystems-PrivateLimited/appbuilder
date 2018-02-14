<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Models\TabFunctions\Loyalty;
use App\Models\TabFunctions\AdvancedLoyalty;
use App\Models\TabFunctions\ContactUs;
use App\Helpers\Helper;
use App\Http\Controllers\tabFunctions\LoyaltyController;

class MasterLoyalty extends Model {

    protected $table = 'tp_func_loyalty_mst';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_loyalty_mst';

    public static function loyaltyList($tabId) {
        $imagePath = url('/storage/app/public/functions/loyalty/thumbnail');
        return $result = DB::table(self::TABLE . ' as main')
                ->select('main.id', 'main.tab_id', 'main.item_id', 'main.is_advance', 'main.secret_code', 'main.created_at', 'loyal.reward_text','loyal.is_header_required','main.stamp_count', 'loyal.square_count', DB::raw("CONCAT('$imagePath','/',main.thumbnail) as thumbnail"), 'adv.loyalty_title', 'adv.no_of_perks','adv.perk_unit_type')
                ->leftJoin(Loyalty::TABLE . ' as loyal', function ($join) {
                    $join->on('main.item_id', '=', 'loyal.id')
                    ->where('main.is_advance', '=', '0');
                })
                ->leftJoin(AdvancedLoyalty::TABLE . ' as adv', function ($join) {
                    $join->on('main.item_id', '=', 'adv.id')
                    ->where('main.is_advance', '=', '1');
                })
                ->where('main.tab_id', $tabId)
                ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
                ->orderBy('main.sort_order', 'ASC')
                ->orderBy('main.item_id', 'ASC')
                ->get();
    }
    
    public static function appLoyaltyList($tabId, $deviceId) {
        $imagePath = url('/storage/app/public/functions/loyalty/thumbnail');
        return $result = DB::table(self::TABLE . ' as main')
                ->select('main.id', 'main.tab_id', 'main.item_id', 'main.is_advance', 'main.secret_code', 'main.created_at', 'loyal.reward_text','main.stamp_count', 'loyal.square_count', DB::raw("CONCAT('$imagePath','/',main.thumbnail) as thumbnail"), 'adv.loyalty_title', 'adv.no_of_perks','adv.perk_unit_type', DB::raw("COUNT(stamp_act.stamp_count) AS scount"))
                ->leftJoin(Loyalty::TABLE . ' as loyal', function ($join) {
                    $join->on('main.item_id', '=', 'loyal.id')
                    ->where('main.is_advance', '=', '0');
                })
                ->leftJoin(AdvancedLoyalty::TABLE . ' as adv', function ($join) {
                    $join->on('main.item_id', '=', 'adv.id')
                    ->where('main.is_advance', '=', '1');
                })
                ->leftJoin(LoyaltyStampActivity::TABLE . ' as stamp_act', function ($join)  use($deviceId){
                    $join->on('main.id', '=', 'stamp_act.item_id')
                    ->where('stamp_act.device_id', '=', $deviceId);
                })
                ->where('main.tab_id', $tabId)
                ->groupBy('main.id')
                ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
                ->orderBy('main.sort_order', 'ASC')
                ->orderBy('main.item_id', 'ASC')
                ->get();
    }

    private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$colName`";
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
    public static function deleteLoyalty($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('item_id', $id)->delete();
    }

    public static function getLoyaltyInfo(int $id) {
        $phoneImageURL = LoyaltyController::getPhoneHeaderImageUploadURL();
        $tabletImageURL = LoyaltyController::getTabletHeaderImageUploadURL();
        $thumbnailImageURL = LoyaltyController::getThumbnailImageUploadURL();
        return $result = DB::table(Loyalty::TABLE . ' as main')
                ->select('main.*', 'mst.*', DB::raw(self::_getImageSelectString($phoneImageURL, 'phone_header_image') . "," . self::_getImageSelectString($tabletImageURL, 'tablet_header_image') . "," . self::_getImageSelectString($thumbnailImageURL, 'thumbnail')))
                ->leftJoin(self::TABLE . ' as mst', function ($join) {
                    $join->on('main.id', '=', 'mst.item_id')
                    ->where('mst.is_advance', '=', '0');
                })
                ->where('main.id', $id)
                ->first();
    }

    public static function getAdvLoyaltyInfo(int $id) {
        $thumbnailImageURL = LoyaltyController::getThumbnailImageUploadURL();
        return $result = DB::table(AdvancedLoyalty::TABLE . ' as main')
                ->select('main.*', 'mst.*', DB::raw(self::_getImageSelectString($thumbnailImageURL, 'thumbnail')))
                ->leftJoin(self::TABLE . ' as mst', function ($join) {
                    $join->on('main.id', '=', 'mst.item_id')
                    ->where('mst.is_advance', '=', '1');
                })
                ->where('main.id', $id)
                ->first();
    }
    
    public static function deleteLoyaltyData($is_advance,$item_id) {        
        return self::where('is_advance', $is_advance)
                    ->where('item_id', $item_id)
                    ->delete();
    }

    public static function getAppItemData(int $id){
        $phoneImageURL = LoyaltyController::getPhoneHeaderImageUploadURL();
         return $result = DB::table(self::TABLE . ' as main')
                ->select('main.secret_code', 'main.item_id','main.is_advance','main.stamp_count', DB::raw(self::_getImageSelectString($phoneImageURL, 'phone_header_image')) , 'loy.reward_text','loy.square_count','adv.loyalty_title','adv.perk_unit_type','adv.stamp_award_amount','adv.perk_unit','adv.instruction','main.stamp_count')
                 ->leftJoin(Loyalty::TABLE . ' as loy', 'loy.id', '=', 'main.item_id')
                 ->leftJoin(AdvancedLoyalty::TABLE . ' as adv', 'adv.id', '=', 'main.item_id')
                 ->where('main.id', $id)
                 ->first();
    }

}
