<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Http\Controllers\tabFunctions\LoyaltyController;
use App\Helpers\Helper;

class LoyaltyPerk extends Model {

    protected $table = 'tp_func_loyalty_perk';
    protected $guarded = ['id']; 
       
     public static function perkList(int $loyaltyId) {
        $thumbnailURL = LoyaltyController::getPerkThumbnailUploadURL();
        $gaugeIconURL = LoyaltyController::getGuageIconUploadURL();
        return self::select('*',DB::raw(self::_getImageSelectString($thumbnailURL, 'perk_thumbnail') . "," . self::_getImageSelectString($gaugeIconURL, 'gauge_icon')))
            ->where('loyalty_id', $loyaltyId)
            ->get();
    }

     private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$colName`";
    }

}