<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class AdvancedLoyalty extends Model {

    protected $table = 'tp_func_loyalty_advanced';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_loyalty_advanced';

    public static function deleteLoyalty($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

}
