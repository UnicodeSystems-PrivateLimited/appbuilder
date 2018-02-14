<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\tabFunctions\ContentTabThreeController;
use Illuminate\Database\Eloquent\Collection;

class ContentTabThreeItem extends Model {

    protected $table = 'tp_func_content_tab_3_item';
    protected $guarded = ['id'];
    
    const TABLE = 'tp_func_content_tab_3_item';
    
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
    
    
    //contact tab 3 category item list
    public static function getCategoryItemList(int $categoryId) {
        $thumbnailImageURL = ContentTabThreeController::getItemThumbNailImageUploadURL();        
        return self::select(DB::raw("`id`, `name`,`status`," .   self::_getImageSelectString($thumbnailImageURL, 'thumbnail') ))
            ->where('category_id', $categoryId)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('name', 'ASC')
            ->get();
    }
    
    /**
     * @param mixed $id
     */
    public static function deleteContentTabThreeCategoryItem($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }
    
    /**
     * get single item
     */
    public static function getContentData(int $id) {
        $phoneImageURL = ContentTabThreeController::getPhoneHeaderImageUploadURL();
        $tabletImageURL = ContentTabThreeController::getTabletHeaderImageUploadURL();
        $thumbnailImageURL = ContentTabThreeController::getItemThumbNailImageUploadURL();
        return self::select(DB::raw("`id`, `use_global_colors`, `background_color`,`text_color`," . self::_getImageSelectString($phoneImageURL, 'phone_header_image') . "," . self::_getImageSelectString($tabletImageURL, 'tablet_header_image') .",`section`,`name`,`status`,`add_header_and_comment`,`is_header_required`," . self::_getImageSelectString($thumbnailImageURL, 'thumbnail') .",`description`,`created_at`"))
            ->where('id', $id)
            ->first();
    }
    
        private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$colName`";
    }
    
   //get section wise category item list
    public static function getSectionWiseCategoryItemList(int $categoryId) {
        $thumbnailImageURL = ContentTabThreeController::getItemThumbNailImageUploadURL();        
        $result= self::select(DB::raw("`id`, `name`,`status`,`section`,`category_id`," .   self::_getImageSelectString($thumbnailImageURL, 'thumbnail') ))
            ->where('category_id', $categoryId)
            ->where('status', 1)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('name', 'ASC')
            ->get();
               $returnArray=[];
              foreach ($result as $res){
                if (empty($res->section)) {
                    $returnArray['__noSection'][] = $res;
                } else {
                    $returnArray[$res->section][] = $res;
                }
            }
            return $returnArray;
    } 
}