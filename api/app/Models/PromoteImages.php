<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Http\Controllers\CustomerPortal\CustomerPromoteController;

class PromoteImages extends Model {

    protected $table = 'tp_app_promote_bg_images';
    protected $guarded = ['id'];

    /**
     * get themes
     */
    public static function getImages(int $appId) {
        $imageUrl = CustomerPromoteController::getPromoteImageUploadUrl();
        return self::select(DB::raw("`id`," . self::_getImageSelectString($imageUrl, 'bg_image') . ""))
                        ->where('app_id', $appId)
                        ->get();
    }

    private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` = '' AND `$colName` IS NULL, NULL, (CONCAT('$url','/',`$colName`))) as `$colName`";
    }

}
