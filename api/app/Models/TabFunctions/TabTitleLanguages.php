<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class TabTitleLanguages extends Model {

    protected $table = 'tab_title_languages';
    protected $guarded = ['id'];

    public static function getAppLanguageData($appId) {
        $result = self::select(DB::raw("`tab_translation`,`sub_tab_translation`"))
                ->where('app_id', $appId)
                ->first();
        if (!empty($result)) {
            $result->tab_translation = json_decode($result->tab_translation, true);
            $result->sub_tab_translation = json_decode($result->sub_tab_translation, true);
        }
        return $result;
    }

}
