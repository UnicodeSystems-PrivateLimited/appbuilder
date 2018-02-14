<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class ClientLanguage extends Model {

    protected $table = 'client_language';
    protected $guarded = ['id'];

    /**
     * get themes
     */
    public static function languageList() {
        return self::select('id as value', 'client_language as label')
                        ->get();
    }

    public static function languageListForLanguageTab($languageData) {
        $ids = [];
        if (!empty($languageData)) {
            $result = $languageData->content;
            $size = count($result);
            for ($i = 0; $i < $size; ++$i) {
                $ids[$i] = $result[$i]['id'];
            }
        }
        return self::select('id', 'client_language as name', 'language_code as code')
                        ->whereNotIn('id', $ids)
                        ->get();
    }

    public static function languageItem($id) {
        return self::select('id', 'client_language')
                        ->where('id', $id)
                        ->first();
    }

}
