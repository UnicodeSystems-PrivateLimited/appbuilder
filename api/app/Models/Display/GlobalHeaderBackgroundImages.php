<?php

namespace App\Models\Display;

use Illuminate\Database\Eloquent\Model;
use App\Http\Controllers\Display\GlobalStyleController;
use DB;

class GlobalHeaderBackgroundImages extends Model {

    protected $table = 'mst_global_header_images';
    protected $guarded = ['id'];

    /**
     * get button background images
     */
    public static function getglobalHeaderBgImage(int $appId) {
        $imageURL = GlobalStyleController::getImageUploadURL();
        return self::select(DB::raw("`id`,`app_id`,`created_at`,`updated_at`,`type`," . self::_getImageSelectString($imageURL, 'name')))
                        ->whereRaw("(app_id IS NULL AND type=1) OR (app_id=$appId AND type=2)")
                        ->orderBy('id', 'DESC')
                        ->get();
    }

    private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$colName`";
    }
    
    public static function deleteGlobalHeaderBgImage($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function getImageURLsByID(array $ids) {
        $imageURL = GlobalStyleController::getImageUploadURL();
        return self::select(DB::raw(self::_getImageSelectString($imageURL, 'name')))
            ->whereIn('id', $ids)
            ->pluck('name')
            ->toArray();
    }

}
