<?php

namespace App\Models\TabFunctions;

use App\Helpers\Helper;
use App\Http\Controllers\TabFunctions\ShoppingCartInventoryController;
use Illuminate\Database\Eloquent\Model;
use DB;

class ShoppingCartItemImage extends Model
{

    protected $table = 'tp_func_cart_item_images';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_cart_item_images';

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

    public static function getImagesByItemID(int $itemID) {
        $imageBaseURL = Helper::getStorageLocalDiskURL(ShoppingCartInventoryController::ITEM_IMAGES_UPLOAD_PATH);
        return self::select('id', 'item_id', 'image', 'is_primary', DB::raw("CONCAT('$imageBaseURL','/',`image`) as `image_url`"))
            ->where('item_id', $itemID)
            ->orderBy(DB::raw('(is_primary=1)'), 'DESC')
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->get();
    }

    public static function isImageInUse(string $imageName) : bool
    {
        $result = self::where('image', $imageName)
            ->value('id');
        return $result ? TRUE : FALSE;
    }

}