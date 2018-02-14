<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\CustomerPortal;

class UserProfileSettings extends Model
{

    protected $table = 'user_profile_settings';
    protected $guarded = ["id"];

    const TABLE = 'user_profile_settings';

    public static function getUserInfo(int $id, string $deviceUUID)
    {
        $pictureUploadURL = CustomerPortal\CustomerSettingController::getImageUploadURL();
        return self::select(DB::raw("`id`,`app_id`,`device_uuid`,`name`,`email`,`birth_day`,`birth_month`," . self::_getImageSelectString($pictureUploadURL, 'picture')))
          ->where('app_id', $id)
          ->where('device_uuid', $deviceUUID)
          ->first();
    }

    // public static function getAppPromoteConfigData($appId) {
    //     return TpAppsConfig::select(DB::raw("`id`, `app_share_config_data`, `config_data`,`created_at`"))
    //                     ->where('app_id', $appId)
    //                     ->first();
    // }

    private static function _getImageSelectString(string $url, string $colName): string
    {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$colName`";
    }
}
