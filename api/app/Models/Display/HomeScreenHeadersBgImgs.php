<?php

namespace App\Models\Display;

use Illuminate\Database\Eloquent\Model;
use App\Http\Controllers\Display\DisplaySettingsController;
use DB;

class HomeScreenHeadersBgImgs extends Model {

    protected $table = 'mst_home_screen_header_imgs';
    protected $guarded = ['id'];

    /**
     * get button background images
     */
    public static function getHomeHeaderBgImage(int $appId) {
        $imageURL = DisplaySettingsController::getHeaderImageUploadURL();
        return self::select(DB::raw("`id`,`app_id`,`created_at`,`updated_at`,`type`," . self::_getImageSelectString($imageURL, 'name')))
                        ->whereRaw("(app_id IS NULL AND type=1) OR (app_id=$appId AND type=2)")
                        ->orderBy('id', 'DESC')
                        ->get();
    }

    private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$colName`";
    }
    
    public static function deleteHomeHeaderBgImage($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

}
