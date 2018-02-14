<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;

class FoodOrderingMenuOptionType extends Model
{

    protected $table = 'tp_func_food_menu_item_option_type';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_food_menu_item_option_type';

    const STATUS_ENABLED = 1;
    const STATUS_DISABLED = 2;

    public static function getAll(int $tabID) {
        return self::select('id', 'item_id', 'title')
            ->where('tab_id', $tabID)
            ->get();
    }

    public static function deleteItem($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function getItemOptionsByItemID(int $itemID) {
        return self::select('id', 'item_id', 'title', 'amount', 'status', 'is_required')
            ->where('item_id', $itemID)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->get();
    }
    
    public static function saveItemOptionType($id = false, $item_id, $title, $status, $is_required, $amount, $sortOrder) {
        if($id !== false && $id != '') {
            DB::table(self::TABLE)->where('id', $id)->update([
                'item_id' => $item_id, 'title' => $title, 'status' => $status, 'is_required'=>$is_required, 'amount'=>$amount, 'sort_order' => $sortOrder
            ]);
        } else {
            $data = ['item_id' => $item_id, 'title' => $title, 'status' => $status, 'is_required'=>$is_required, 'amount'=>$amount, 'sort_order' => $sortOrder];
            $id = self::create($data)->id;
        }
        return $id;
    }

    public static function getEnabledOptionTypes(int $itemID) {
        return self::select('id', 'title', 'is_required', 'amount')
            ->where('item_id', $itemID)
            ->where('status', self::STATUS_ENABLED)
            ->get();
    }

}