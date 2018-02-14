<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Display\UserImages;
use App\Models\Display\LibraryImages;
use App\Http\Controllers\Apps\CreateController;
use App\Helpers\Helper;
use DB;

class TpAppScreenshot extends Model
{

    protected $table = 'tp_app_screenshot';
    protected $guarded = ["id"];

    public static function getScreenshot(int $appId, $type)
    {
        $imageURL = CreateController::getScreenshotUploadURL();
        return self::select(DB::raw("`id`,`app_id`,`type`," . self::_getImageSelectString($imageURL, 'screen_shot_1') . " , " . self::_getImageSelectString($imageURL, 'screen_shot_2') . "," . self::_getImageSelectString($imageURL, 'screen_shot_3') . "," . self::_getImageSelectString($imageURL, 'screen_shot_4') . "," . self::_getImageSelectString($imageURL, 'screen_shot_5') . ""))
            ->where('app_id', $appId)
            ->where('type', $type)
            ->first();
    }

    private static function _getImageSelectString(string $url, string $colName): string
    {
        return "IF(`$colName` = '' AND `$colName` IS NULL, NULL, (CONCAT('$url','/',`$colName`))) as `$colName`";
    }

    public static function getAllScreenshots(int $appId)
    {
        return self::select('type', 'screen_shot_1', 'screen_shot_2', 'screen_shot_3', 'screen_shot_4', 'screen_shot_5')
            ->where('app_id', $appId)
            ->get();
    }

    public static function getScreenshotNamesForSpecificType(int $appId, int $type)
    {
        return self::select('screen_shot_1', 'screen_shot_2', 'screen_shot_3', 'screen_shot_4', 'screen_shot_5')
            ->where('app_id', $appId)
            ->where('type', $type)
            ->first();
    }

    public static function updateByAppIDAndType(array $data, int $appId, int $type) {
        self::where('app_id', $appId)
            ->where('type', $type)
            ->update($data);
    }
}
