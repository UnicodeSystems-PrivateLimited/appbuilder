<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;

class ShoppingCartShippingCharges extends Model
{

    protected $table = 'tp_func_cart_shipping_charges';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_cart_shipping_charges';

    public static function getAll(int $tabID) {
        return self::select('id', 'tab_id', 'country', 'price')
            ->where('tab_id', $tabID)
            ->get();
    }

    public static function deleteItem($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function countAll(int $tabID): int {
        return self::where('tab_id', $tabID)
            ->count();
    }

}