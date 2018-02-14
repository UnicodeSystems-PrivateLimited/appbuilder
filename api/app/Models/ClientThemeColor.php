<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class ClientThemeColor extends Model {

    protected $table = 'client_permission_theme_color';
    protected $guarded = ['id'];

    /**
     * get themes
     */
    public static function themeList() {
        return self::select('id as value', 'theme as label')
                        ->get();
    }

    public static function themeListWithData() {
      $result= self::select('id', 'theme', 'theme_bg_color1', 'theme_bg_color2', 'theme_bg_color3')
                        ->get();
        foreach ($result as $res) {
            $returnArray[$res->id]= $res;
        }
         return $returnArray;
    }

    public static function theme($id) {
        return self::select('id', 'theme')
                        ->where('id', $id)
                        ->first();
    }

}
