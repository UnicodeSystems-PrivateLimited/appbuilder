<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\TabFunctions\AroundUsController;
use Illuminate\Database\Eloquent\Collection;

class AroundUsItem extends Model {

    protected $table = 'tp_func_around_us_items';
    protected $guarded = ['id'];
    
    const TABLE = 'tp_func_around_us_items';
    
     /**
     * Sorting
     */
    public static function updateMultiple(array $data, string $updateKey = 'id') {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                self::where($updateKey, $key)->update($value);
            }
        });
    }
    
    /**
     * get specific around us item info
     */
    public static function getItemData(int $id) {
        $imageURL = AroundUsController::getImageUploadURL();
             return DB::table(self::TABLE . ' as item')
            ->select(DB::raw("`item`.`id`,`item`.`around_us_id`,`tp_func_around_us`.`category_name` , `item`.`name`, `item`.`information`, `item`.`website`, `item`.`m_lat`, `item`.`m_long`, `item`.`distance_type`, `item`.`email_id`, `item`.`telephone`," . self::_getImageSelectString($imageURL, "item`.`image", "image") .", `tp_func_around_us`.`color`"))
             ->join('tp_func_around_us', 'tp_func_around_us.id', '=', 'item.around_us_id')
            ->where('item.id', $id)
            ->first();
    }
    /**
     * get all
     */
    public static function getAllItemData($tabId) {
        $imageURL = AroundUsController::getImageUploadURL();
                     return DB::table(self::TABLE . ' as item')
                     ->select(DB::raw("`item`.`id`,`item`.`around_us_id`,`tp_func_around_us`.`category_name` , `item`.`name`, `item`.`information`, `item`.`website`, `item`.`m_lat`, `item`.`m_long`, `item`.`distance_type`, `item`.`email_id`, `item`.`telephone`," . self::_getImageSelectString($imageURL, "item`.`image", "image") .", `tp_func_around_us`.`color`"))
                     ->join('tp_func_around_us', 'tp_func_around_us.id', '=', 'item.around_us_id')
                     ->where('tp_func_around_us.tab_id', $tabId)
                     ->orderBy(DB::raw('(item.sort_order=0)'), 'ASC')
                     ->orderBy('item.sort_order', 'ASC')
                     ->orderBy('item.name', 'ASC')
                     ->get();
    }

    /**
     * get item list
     */
    public static function getCategoryItemList(int $around_us_id) {
        $imageURL = AroundUsController::getImageUploadURL();
        return self::select(DB::raw("`id`, `name`,`information`,`website`,`email_id`,`m_lat`,`m_long`,`distance_type`, `email_id`,`telephone`," . self::_getImageSelectStringOrg($imageURL, 'image')))
            ->where('around_us_id', $around_us_id)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('name', 'ASC')
            ->get();
    }
    
    /**
     * @param mixed $id
     */
    public static function deleteAroundUsItem($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }
    
    private static function _getImageSelectString(string $url, string $colName, string $alias): string {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$alias`";
    }
    
    private static function _getImageSelectStringOrg(string $url, string $colName): string {
        return "IF(`$colName` = '' AND `$colName` IS NULL, NULL, (CONCAT('$url','/',`$colName`))) as `$colName`";
    }
    
}