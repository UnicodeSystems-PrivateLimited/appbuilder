<?php

namespace App\Models\Display;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class GlobalStyle extends Model {

    protected $table = 'display_settings_global_style';
    protected $guarded = ['id'];

    const TABLE = 'display_settings_global_style';

    /**
     * get global style
     */
    public static function getGlobalStyle(int $app_id) {
        return self::select('id', 'features', 'blur_effect', 'individual_tabs', 'header', 'fonts', 'lists')
                        ->where('app_id', $app_id)
                        ->first();
    }

    public static function getAppGlobalStyleForCopy(int $app_id) {
        return DB::table(self::TABLE)
                        ->select('features', 'blur_effect', 'individual_tabs', 'header', 'fonts', 'lists')
                        ->where('app_id', $app_id)
                        ->first();
    }

    public static function getGlobalStyleFeatures(int $app_id) {
        return self::select('features')
                        ->where('app_id', $app_id)
                        ->first();
    }

}
