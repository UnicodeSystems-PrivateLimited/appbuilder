<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Helpers\Helper;
use App\Http\Controllers\TabFunctions\ShoppingCartInventoryController;

class ShoppingCartItem extends Model {

    protected $table = 'tp_func_cart_items';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_cart_items';
    const IMAGE_TABLE = 'tp_func_cart_item_images';

    const STATUS_ENABLED = 1;
    const STATUS_DISABLED = 2;

    public static function getAll(int $tabID): array {
        $result = DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.category_id', 'main.name', 'main.status')
            ->join(ShoppingCartCategory::TABLE . ' as cat', 'cat.id', '=', 'main.category_id')
            ->where('cat.tab_id', $tabID)
            ->orderBy(DB::raw('(main.sort_order=0)'), 'ASC')
            ->orderBy('main.sort_order', 'ASC')
            ->orderBy('main.name', 'ASC')
            ->get();
        $returnArray = [];
        foreach ($result as $row) {
            $returnArray[$row->category_id][] = $row;
        }
        return $returnArray;
    }

    public static function deleteItem($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function updateMultiple(array $data, string $updateKey = 'id') {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                self::where($updateKey, $key)->update($value);
            }
        });
    }

    public static function getData(int $id) {
        return self::select('id', 'name', 'category_id', 'description', 'price', 'inventory', 'is_tax_exempted', 'status')
            ->where('id', $id)
            ->first();
    }

    public static function getCategoryItems(int $category_id) {
        $path = Helper::getStorageLocalDiskURL(ShoppingCartInventoryController::ITEM_IMAGES_UPLOAD_PATH);
        return DB::table(self::TABLE . ' as main')
        ->select(DB::raw("main.id, main.name, main.description, TRUNCATE(main.price, 2) as price, CONCAT('$path','/',func.image) as image"))
        ->leftJoin(self::IMAGE_TABLE . ' as func', function($join){
            $join->on('func.item_id', '=', 'main.id');
            $join->on('func.is_primary', '=', DB::raw('1'));
        })
        ->where('category_id', $category_id)
        ->where('main.status', self::STATUS_ENABLED)
        ->orderBy(DB::raw('(main.sort_order=0)'), 'ASC')
        ->orderBy('main.sort_order', 'ASC')
        ->get();
    }

}