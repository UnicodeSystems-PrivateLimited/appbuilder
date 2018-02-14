<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Models\TabFunctions\FoodOrderingMenuOptionType;

class FoodOrderingMenuOptionTypeItems extends Model
{

    protected $table = 'tp_func_food_menu_item_option';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_food_menu_item_option';

    const STATUS_ENABLED = 1;
    const STATUS_DISABLED = 2;

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

    public static function getOptionsItems(int $typeID) {
        return self::select('id', 'type_id', 'title', 'charges', 'status', 'is_allow_qty', 'max_qty')
            ->where('type_id', $typeID)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->get();
    }

    public static function saveOptionTypeItems($id = false, $type_id, $status, $title, $charges, $is_allow_qty, $max_qty, $sortOrder) {
        if($id !== false && $id != '') {
            DB::table(self::TABLE)->where('id', $id)->update([
                'type_id' => $type_id, 'title' => $title, 'status' => $status, 'charges'=>$charges, 'is_allow_qty'=>$is_allow_qty, 'max_qty'=>$max_qty, 'sort_order' => $sortOrder
            ]);
        } else {
            $data = ['type_id' => $type_id, 'title' => $title, 'charges'=>$charges, 'status' => $status, 'is_allow_qty'=>$is_allow_qty, 'max_qty'=>$max_qty, 'sort_order' => $sortOrder];
            self::create($data);
        }
    }

    public static function getEnabledOptionsByItemID(int $itemID): array {
        $result = DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.type_id', 'main.title', 'main.charges', 'main.is_allow_qty', 'main.max_qty','t.title as option_type_title')
            ->join(FoodOrderingMenuOptionType::TABLE . ' as t', 'main.type_id', '=', 't.id')
            ->where('t.item_id', $itemID)
            ->where('main.status', self::STATUS_ENABLED)
            ->get();
        $returnArr = [];
        foreach($result as $row) {
            $returnArr[$row->type_id][] = $row;
        }
        return $returnArr;
    }

}