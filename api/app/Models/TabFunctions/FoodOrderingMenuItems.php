<?php
namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Helpers\Helper;
use App\Http\Controllers\TabFunctions\FoodOrderingController;
use Illuminate\Database\Eloquent\Collection;
use App\Models\TabFunctions\FoodOrderingMenuCategory;
use App\Http\Controllers\TabFunctions\FoodOrderingMenuController;

class FoodOrderingMenuItems extends Model
{

    protected $table = 'tp_func_food_menu_items';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_food_menu_items';

    const STATUS_ENABLED = 1;
    const STATUS_DISABLED = 2;

    public static function getAll(int $tabID) : array
    {
        $result = DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.category_id', 'main.name', 'main.price', 'main.is_tax_exempted', 'main.status')
            ->join(FoodOrderingMenuCategory::TABLE . ' as cat', 'cat.id', '=', 'main.category_id')
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

    public static function getData(int $id)
    {
        return self::select('id', 'name', 'category_id', 'description', 'price', 'is_tax_exempted', 'status')
            ->where('id', $id)
            ->first();
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

    public static function getImagesByItemID(int $categoryId)
    {
        $imageBaseURL = Helper::getStorageLocalDiskURL(FoodOrderingMenuController::ITEM_IMAGES_UPLOAD_PATH);
        return self::select('id', 'name', 'category_id', 'description', 'price', 'is_tax_exempted', DB::raw("CONCAT('$imageBaseURL','/',`image`) as `image_url`, 'status'"))
            ->where('category_id', $categoryId)
            ->orderBy('sort_order', 'ASC')
            ->get();
    }

    public static function isImageInUse(string $imageName) : bool
    {
        $result = self::where('image', $imageName)
            ->value('id');
        return $result ? true : false;
    }

    public static function getItemsForApp(int $categoryID, int $locationID)
    {
        return DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.name', 'main.description', DB::raw('TRUNCATE(main.price, 2) as price'), self::getImage('main.'))
            ->where('main.category_id', $categoryID)
            ->where(function ($query) use ($locationID) {
                $query->whereNull('main.location_availability')
                    ->orWhereRaw('FIND_IN_SET(?, main.location_availability)', [$locationID]);
            })
            ->get();
    }

    public static function getImage(string $fieldPrefix = '')
    {
        $imageBaseURL = Helper::getStorageLocalDiskURL(FoodOrderingMenuController::ITEM_IMAGES_UPLOAD_PATH);
        return DB::raw("IF(${fieldPrefix}image IS NOT NULL, CONCAT('$imageBaseURL','/',${fieldPrefix}image), ${fieldPrefix}image_url) as image");
    }

    public static function getItemDetail(int $id)
    {
        return self::select('id', 'name', 'category_id', 'description', 'price', 'is_tax_exempted', self::getImage())
            ->where('id', $id)
            ->first();
    }

    public static function updateAvailability($itemID, $location_availability, $availability_type)
    {
        DB::table(self::TABLE)->where('id', $itemID)->update([
            'location_availability' => $location_availability, 'availability_type' => $availability_type
        ]);
    }

    public static function getAvailabilityData($id)
    {
        return self::select('location_availability', 'availability_type')
            ->where('id', $id)
            ->first();
    }

    public static function getEnabledItems(int $tabID) : array
    {
        $result = DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.category_id', 'main.name', 'main.price', 'main.is_tax_exempted', 'main.status', self::getImage('main.'))
            ->join(FoodOrderingMenuCategory::TABLE . ' as cat', 'cat.id', '=', 'main.category_id')
            ->where('cat.tab_id', $tabID)
            ->where('main.status', self::STATUS_ENABLED)
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
}
