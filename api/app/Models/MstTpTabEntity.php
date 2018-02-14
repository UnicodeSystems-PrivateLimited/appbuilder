<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class MstTpTabEntity extends Model {

    protected $table = 'mst_tp_tab_entity';
    protected $guarded = ["id"];

    const TABLE = 'mst_tp_tab_entity';

    public static function getAllTabs() {
        return self::orderBy('tab_name', 'ASC')
                        ->where('status', 1)
                        ->get(array('id', 'tab_name', 'tab_code'));
    }

    public static function getTabInfo($appId) {
        return self::where('id', $appId)
                        ->get();
    }

    public static function getMstTabId($tab_code) {
        return self::select(DB::raw("`id`"))
                        ->where('tab_code', $tab_code)
                        ->first();
    }

}
