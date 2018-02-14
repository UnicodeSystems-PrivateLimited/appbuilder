<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\tabFunctions\NewsLetterController;
use Illuminate\Database\Eloquent\Collection;

class NewsLetterSettings extends Model {

    protected $table = 'newsletter_settings';
    protected $guarded = ['id'];

    public static function getSettings(int $tabId) {
        $thumbnailImageURL = NewsLetterController::getImageUploadURL();
        return self::select(DB::raw("`id`,`description`,`prompt_action`,`automatic_upload`," . self::_getImageSelectString($thumbnailImageURL, 'image_file') . ",`mailchimp_account`,`iconnect_account`,`created_at`"))
                        ->where('tab_id', $tabId)
                        ->first();
    }

    public static function getSettingsByAppId(int $appId) {
        $thumbnailImageURL = NewsLetterController::getImageUploadURL();
        return self::select(DB::raw("`id`,`description`,`prompt_action`,`automatic_upload`," . self::_getImageSelectString($thumbnailImageURL, 'image_file') . ",`mailchimp_account`,`iconnect_account`,`created_at`"))
                        ->where('app_id', $appId)
                        ->first();
    }

    public static function getAutomaticUploadSettings(int $appId) {
        return self::select(DB::raw("`automatic_upload`"))
                        ->where('app_id', $appId)
                        ->first();
    }

    private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$colName`";
    }

}
