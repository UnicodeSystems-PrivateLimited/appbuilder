<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class TpAppsConfig extends Model {

    protected $table = 'tp_app_config';
    protected $guarded = ["id"];

    public static function getAppConfigData($appId) {
        return TpAppsConfig::select(DB::raw("`id`, `config_data`,`app_screen_config_data`,`app_share_config_data`, `email_marketing_config_data`,`created_at`"))
                        ->where('app_id', $appId)
                        ->first();
    }

    public static function getAppPromoteConfigData($appId) {
        return TpAppsConfig::select(DB::raw("`id`, `app_share_config_data`, `config_data`, `email_marketing_config_data`,`created_at`"))
                        ->where('app_id', $appId)
                        ->first();
    }

}
