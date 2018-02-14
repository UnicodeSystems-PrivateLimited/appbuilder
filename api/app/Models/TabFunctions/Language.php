<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\tabFunctions\LanguageController;
use Illuminate\Database\Eloquent\Collection;

class Language extends Model {

    protected $table = 'tp_func_language';
    protected $guarded = ['id'];

    public static function getItemData(int $tabId) {
        $result = self::select(DB::raw("`id`,`content`,`created_at`"))
                ->where('tab_id', $tabId)
                ->first();
        if (!empty($result)) {
            $result->content = json_decode($result->content, true);
        }
        return $result;
    }

    public static function deleteLanguage(int $id, $languageIds) {
        if (!is_array($languageIds)) {
            $languageIds = [$languageIds];
        }
        $result = self::select(DB::raw("`content`"))
                ->where('id', $id)
                ->first();
        $result = json_decode($result->content, true);
        $size = count($result);
        for ($i = 0; $i < $size; ++$i) {
            if (array_search($result[$i]['id'], $languageIds) === false) {
                $result_final[] = $result[$i];
            }
        }
        $language_data['content'] = json_encode($result_final, JSON_NUMERIC_CHECK);
        self::where('id', $id)->update($language_data);
    }

}
