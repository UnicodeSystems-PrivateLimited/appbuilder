<?php

namespace App\Models\Display;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Http\Controllers\tabFunctions\DisplaySettingsController;
use App\Helpers\Helper;

class DisplaySettingsHomeScreen extends Model {

    protected $table = 'display_settings_home_screen';
    protected $guarded = ['id'];

    const TABLE = 'display_settings_home_screen';

    /**
     * get homescreen
     */
    public static function getSettings(int $app_id) {
        return self::select('id', 'layout', 'extra_buttons', 'subtabs', 'header', 'buttons', 'icon_color')
                        ->where('app_id', $app_id)
                        ->first();
    }

    public static function getAppSettingsForCopy(int $app_id) {
        return DB::table(self::TABLE)
                        ->select('layout', 'extra_buttons', 'subtabs', 'header', 'buttons', 'icon_color')
                        ->where('app_id', $app_id)
                        ->first();
    }

}
