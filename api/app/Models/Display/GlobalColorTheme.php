<?php

namespace App\Models\Display;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

use App\Helpers\Helper;

class GlobalColorTheme extends Model {

    protected $table = 'mst_color_theme';
    protected $guarded = ['id'];


public static function getColorThemeList() {
        return self::select('id','name','section_bar','section_text','row_bar','row_text','even_row_bar','even_row_text')
            ->get();
    }
    
 public static function getSingleColorTheme(int $id){
        return self::select('id','name','section_bar','section_text','row_bar','row_text','even_row_bar','even_row_text')
            ->where('id',$id)
            ->first();
    }
}