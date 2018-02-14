<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Display\UserImages;
use App\Models\Display\LibraryImages;
use App\Http\Controllers\Apps\CreateController;
use DB;
use App\Http\Controllers\Display\BackgroundImagesController;

class TpAppsEntity extends Model {

    protected $table = 'tp_apps_entity';
    protected $guarded = ["id"];

    const TABLE = 'tp_apps_entity';
    const LIBRARY_TABLE = 'mst_library_images';

    public function user() {
        return $this->belongsTo('LaravelAcl\Authentication\Models\User', "created_by");
    }

    public static function getUserAppData($userEmail, $filters = [], $perPage = 10) {
        $iconURL = CreateController::getImageUploadURL();
        $query = TpAppsEntity::select(['id', 'app_name', 'app_code', 'code_version', 'created_at', 'apple_credit_used', DB::raw(self::_getImageSelectString($iconURL, 'icon_name'))]);
        //admin can access all apps, where condition for customer
        if (isset($userEmail) && $userEmail != "") {
            $query->where('username', '=', $userEmail);
            if ($filters['publish_status'] == 'AllApps') {
                if (!empty($filters['title'])) {
                    $query->Where(function($query) use ($filters) {
                        $query->orWhere('app_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        $query->orWhere('app_code', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('app_icon_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('username', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('client_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('code_version', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('label', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    });
                }
            } elseif ($filters['publish_status'] == 'Published') {
                $query->Where('apple_credit_used', '=', 1);
                if (!empty($filters['title'])) {
                    $query->Where(function($query) use ($filters) {
                        $query->orWhere('app_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        $query->orWhere('app_code', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('app_icon_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('username', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('client_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('code_version', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('label', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    });
                }
            } elseif (!empty($filters['title']) && ($filters['publish_status'] == 'UnPublished')) {
                $query->Where('apple_credit_used', '=', 0);
                if (!empty($filters['title'])) {
                    $query->Where(function($query) use ($filters) {
                        $query->orWhere('app_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        $query->orWhere('app_code', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('app_icon_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('username', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('client_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('code_version', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('label', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    });
                }
            }
        } else {
            //search by app_code, app_name, app_icon_name, username, client_name, code_version
            if ($filters['publish_status'] == 'AllApps') {
                if (!empty($filters['title'])) {
                    $query->where('app_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    $query->orWhere('app_code', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    // $query->orWhere('app_icon_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    // $query->orWhere('username', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    // $query->orWhere('client_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    // $query->orWhere('client_email', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    // $query->orWhere('code_version', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    // $query->orWhere('label', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                }
            } elseif ($filters['publish_status'] == 'Published') {
                $query->Where('apple_credit_used', '=', 1);
                if (!empty($filters['title'])) {
                    $query->Where(function($query) use ($filters) {
                        $query->orWhere('app_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        $query->orWhere('app_code', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('app_icon_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('username', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('client_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('code_version', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('label', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    });
                }
            } elseif ($filters['publish_status'] == 'UnPublished') {
                $query->Where('apple_credit_used', '=', 0);
                if (!empty($filters['title'])) {
                    $query->Where(function($query) use ($filters) {
                        $query->orWhere('app_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        $query->orWhere('app_code', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('app_icon_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('username', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('client_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('code_version', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                        // $query->orWhere('label', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    });
                }
            }
        }
        return $query->orderBy('created_at', 'DESC')->paginate($perPage);
    }

    public static function getAppData($appId) {
        $iconURL = CreateController::getImageUploadURL();
        $phoneSplashURL = CreateController::getPhoneSplashScreenUploadURL();
        $tabSplashURL = CreateController::getTabletSplashScreenUploadURL();
        $iphoneSplashURL = CreateController::getIphoneSplashScreenUploadURL();
        return TpAppsEntity::select(DB::raw("`id`, `app_name`, `app_code`, `code_version`, `created_at`, `apple_credit_used`,`app_icon_name`,`contact_email`,`contact_phone`,`client_name`,`client_email`,`client_phone`,`flag_phone_img`,`flag_tablet_img`,`flag_iphone_img`,`ios_app_store_url`,`ios_app_store_id`,`google_play_store_url`,`html5_mobile_website_url`,`home_screen_background_image`,`home_screen_tab_background_image`,`keywords`,`username`,`label`,`password`,`description`,`new_info`,`copyright`,`category`,`price`,`language`,`icon_name`,`disable_comment`,`audio_bg_play`, " . self::_getImageSelectString($iconURL, 'icon_name') . " ,`google_plus_id`," . self::_getImageSelectString($phoneSplashURL, 'phone_splash_screen') . "," . self::_getImageSelectString($tabSplashURL, 'tablet_splash_screen') . "," . self::_getImageSelectString($iphoneSplashURL, 'iphone_splash_screen') . ", `is_generating_screenshots`, `apple_user_name`, `apple_password`, `apple_dev_name`,`push_publish_email`,`android_app_version`,`ios_app_version`,`tab_slider_type`,`is_tab_modern_sliding`,`slider_type`,`is_modern_sliding`"))
                        ->where('id', $appId)
                        ->first();
    }

    private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$colName`";
    }

    public static function deleteApp($appId) {
        if (!is_array($appId)) {
            $appId = [$appId];
        }
        return TpAppsEntity::whereIn('id', $appId)->delete();
    }

    public static function getAllAppList() {
        return TpAppsEntity::select('id', 'app_name')->orderBy('created_at', 'DESC')->get();
    }

    public static function getAppDataForDisplay(int $appId) {
        $imageURL = BackgroundImagesController::getImageUploadURL();
        return DB::table(self::TABLE . ' as main')
                        ->select('main.*', DB::raw("CONCAT('$imageURL', '/', (IF(i.lib_img_id IS NULL, i.name, lib.name))) as background_img,CONCAT('$imageURL', '/', (IF(i1.lib_img_id IS NULL, i1.name, lib.name))) as tab_background_img"))
                        ->leftJoin(UserImages::TABLE . ' as i', 'main.home_screen_background_image', '=', 'i.id')
                        ->leftJoin(UserImages::TABLE . ' as i1', 'main.home_screen_tab_background_image', '=', 'i1.id')
                        ->leftJoin(self::LIBRARY_TABLE . ' as lib', 'i.lib_img_id', '=', 'lib.id')
                        ->where('main.id', $appId)
                        ->first();
    }

    public static function getAppId(string $appCode): int {
        $app = self::select('id')
                ->where('app_code', $appCode)
                ->first();
        return $app ? $app->id : false;
    }

//    public static function getAppBuildData(string $appCode) {
//        $iconURL = CreateController::getImageUploadURL();
//        $phoneSplashURL = CreateController::getPhoneSplashScreenUploadURL();
//        $tabSplashURL = CreateController::getTabletSplashScreenUploadURL();
//        $iphoneSplashURL = CreateController::getIphoneSplashScreenUploadURL();
//        return TpAppsEntity::select(DB::raw("id, app_name, app_code, code_version, created_at, apple_credit_used,app_icon_name,client_name,client_email,client_phone,ios_app_store_url,ios_app_store_id,google_play_store_url,html5_mobile_website_url,home_screen_background_image,keywords,username,label,password,description,new_info,copyright,category,price,language,icon_name,disable_comment,audio_bg_play, " . self::_getImageSelectString($iconURL, 'icon_name') . " ,google_plus_id," . self::_getImageSelectString($phoneSplashURL, 'phone_splash_screen') . "," . self::_getImageSelectString($tabSplashURL, 'tablet_splash_screen') . "," . self::_getImageSelectString($iphoneSplashURL, 'iphone_splash_screen') . ""))
//            ->where('app_code', $appCode)
//            ->first();
//    }

    public static function getAppBuildData(string $appCode) {
        $iconURL = CreateController::getImageUploadURL();
        $phoneSplashURL = CreateController::getPhoneSplashScreenUploadURL();
        $tabSplashURL = CreateController::getTabletSplashScreenUploadURL();
        $iphoneSplashURL = CreateController::getIphoneSplashScreenUploadURL();
        return TpAppsEntity::select(DB::raw("`id`, `app_name`, `app_code`, `code_version`, `created_at`, `apple_credit_used`,`app_icon_name`,`client_name`,`client_email`,`client_phone`,`ios_app_store_url`,`ios_app_store_id`,`google_play_store_url`,`html5_mobile_website_url`,`home_screen_background_image`,`keywords`,`username`,`label`,`password`,`description`,`new_info`,`copyright`,`category`,`price`,`language`,`icon_name`,`disable_comment`,`audio_bg_play`, " . self::_getImageSelectString($iconURL, 'icon_name') . " ,`google_plus_id`," . self::_getImageSelectString($phoneSplashURL, 'phone_splash_screen') . "," . self::_getImageSelectString($tabSplashURL, 'tablet_splash_screen') . "," . self::_getImageSelectString($iphoneSplashURL, 'iphone_splash_screen') . ""))
                        ->where('app_code', $appCode)
                        ->first();
    }

    public static function getAppIdByEmail(string $email): int {
        $app = self::select('id')
                ->where('client_email', $email)
                ->first();
        return $app ? $app->id : false;
    }

    public static function getuserByAppid($app_id) {
        return DB::table(self::TABLE . ' as item')
                        ->select(DB::raw("`users`.`id` as `userId`"))
                        ->join('users', 'users.email', '=', 'item.client_email')
                        ->where('item.id', $app_id)
                        ->first();
    }
    public static function getCustomerByAppid($app_id) {
        return DB::table(self::TABLE . ' as item')
                        ->select(DB::raw("`users`.`id` as `userId`"))
                        ->join('users', 'users.email', '=', 'item.username')
                        ->where('item.id', $app_id)
                        ->first();
    }

    public static function getAppName(int $id): string {
        $result = self::select('app_name')
                ->where('id', $id)
                ->first();
        return $result ? $result->app_name : '';
    }

    public static function updateFlagsForBgImages($app_id, $flags) {
        return DB::table(self::TABLE)
                        ->where('id', $app_id)
                        ->update($flags);
    }

    public static function updateData(array $data, string $value, string $key = 'id') {
        self::where($key, $value)
                ->update($data);
    }

    public static function getAppCode(int $id): string {
        $result = self::select('app_code')
                ->where('id', $id)
                ->first();
        return $result ? $result->app_code : '';
    }

    public static function getScreenshotGenerationStatus(int $id): int {
        $result = self::select('is_generating_screenshots')
                ->where('id', $id)
                ->first();
        return $result ? $result->is_generating_screenshots : 0;
    }

    public static function isGeneratingScreenshots(): bool {
        $result = self::select('is_generating_screenshots')
                ->where('is_generating_screenshots', 1)
                ->first();
        return $result ? TRUE : FALSE;
    }

    public static function getAppEmail(string $username): string {
        $app = self::select('client_email')
                ->where('username', $username)
                ->first();
        return $app ? $app->client_email : false;
    }

    public static function getFacebookAccessToken(int $id): string {
        $result = self::select('push_facebook_token')
                ->where('id', $id)
                ->first();
        return $result ? $result->push_facebook_token : '';
    }

    public static function getTwitterAccessTokenAndSecret(int $id): self {
        return self::select('push_twitter_token', 'push_twitter_secret')
                        ->where('id', $id)
                        ->first();
    }

    public static function getAllTableList() {
        return DB::select('SHOW TABLES');
    }

    public static function clearAllTablesData($tables) {
       
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        foreach ($tables as $table) {
            if ($table == 'client_permission') {
                 DB::statement('DELETE FROM `client_permission` WHERE `client_permission`.`app_id` != 0');
                 DB::statement('ALTER TABLE client_permission AUTO_INCREMENT = 2');
            } else {
                DB::table($table)->truncate();
            }
        }
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

}
