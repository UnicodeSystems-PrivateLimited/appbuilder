<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;

class ShoppingCartBlockedCountries extends Model
{

    protected $table = 'tp_func_cart_blocked_countries';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_cart_blocked_countries';

    public static function getAll(int $tabID) {
        return self::select('id', 'tab_id', 'country')
            ->where('tab_id', $tabID)
            ->get();
    }

    public static function deleteItem($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

}