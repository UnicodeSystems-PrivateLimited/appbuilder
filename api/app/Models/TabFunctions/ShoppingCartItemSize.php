<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;

class ShoppingCartItemSize extends Model
{

    protected $table = 'tp_func_cart_item_sizes';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_cart_item_sizes';

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

    public static function getSizesByItemID(int $itemID) {
        return self::select('id', 'item_id', 'title', 'price')
            ->where('item_id', $itemID)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('title', 'ASC')
            ->get();
    }

}