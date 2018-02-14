<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;


class FontFamilyTab extends Model {

    protected $table = 'mst_font_family';
    protected $guarded = ['id'];

    public static function getFontFamilyList(){
        return self::select( 'id', 'label', 'value', 'created_at', 'updated_at')
                ->get();
    }
}
