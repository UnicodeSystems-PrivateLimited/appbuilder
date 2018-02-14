<?php
namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Models\TabFunctions\ShoppingCartItem;
use App\Helpers\Helper;
use App\Http\Controllers\TabFunctions\ShoppingCartInventoryController;

class ShoppingCartCategory extends Model
{

    protected $table = 'tp_func_cart_categories';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_cart_categories';

    const STATUS_ENABLED = 1;
    const STATUS_DISABLED = 2;

    public static function getAll(int $tabID)
    {
        return DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.tab_id', 'main.name', 'main.image', 'main.image_url', 'main.status')
            ->where('main.tab_id', $tabID)
            ->groupBy('main.id')
            ->orderBy(DB::raw('(main.sort_order=0)'), 'ASC')
            ->orderBy('main.sort_order', 'ASC')
            ->get();
    }

    public static function deleteItem($id)
    {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function updateMultiple(array $data, string $updateKey = 'id')
    {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                self::where($updateKey, $key)->update($value);
            }
        });
    }

    public static function isImageInUse(string $imageName) : bool
    {
        $result = self::where('image', $imageName)
            ->value('id');
        return $result ? TRUE : FALSE;
    }

    public static function getEnabledCategories(int $tabID): array
    {
        return DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.tab_id', 'main.name', self::getImage(), DB::raw('COUNT(item.id) as no_of_items'))
            ->leftJoin(ShoppingCartItem::TABLE . ' as item', function ($join) {
                $join->on('item.category_id', '=', 'main.id')
                     ->where('item.status', '=', self::STATUS_ENABLED);
            })
            ->where('main.tab_id', $tabID)
            ->where('main.status', self::STATUS_ENABLED)
            ->having(DB::raw('COUNT(item.id)'), '>', 0)
            ->groupBy('main.id')
            ->orderBy(DB::raw('(main.sort_order=0)'), 'ASC')
            ->orderBy('main.sort_order', 'ASC')
            ->get();
    }

    public static function getImage() {
        $imageBaseURL = Helper::getStorageLocalDiskURL(ShoppingCartInventoryController::CATEGORY_IMAGES_UPLOAD_PATH);
        return DB::raw("IF(main.image IS NOT NULL, CONCAT('$imageBaseURL','/',main.image), main.image_url) as image");
    }

}