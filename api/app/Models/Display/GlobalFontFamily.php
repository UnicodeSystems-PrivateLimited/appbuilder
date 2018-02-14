<?php

namespace App\Models\Display;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class GlobalFontFamily extends Model {

    protected $table = 'mst_font_family';
    protected $guarded = ['id'];

    public static function getFontList() {
        return self::select('id', 'label', 'value')
                        ->orderBy('label', 'ASC')
                        ->get();
    }

    public static function getSingleFont(int $id) {
        return self::select('id', 'label', 'value')
                        ->where('id', $id)
                        ->first();
    }

}
