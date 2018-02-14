<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\tabFunctions\ContentTabTwoController;
use Illuminate\Database\Eloquent\Collection;

class ContentTabTwo extends Model {

    protected $table = 'tp_func_content_tab_2';
    protected $guarded = ['id'];
    
    const TABLE = 'tp_func_content_tab_2';
    
    public static function getContentDataList(int $id) {
        $thumbnailURL = ContentTabTwoController::getThumbNailImageUploadURL();
        return self::select(DB::raw("`id`,`section`,`name`,`use_global_colors`,`background_color`,`text_color`,`status`,`description`," . self::_getImageSelectString($thumbnailURL, 'thumbnail')))
            ->where('tab_id', $id)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('name', 'ASC')
            ->get();
    }
    
    public static function getContentData(int $id) {
        $phoneImageURL = ContentTabTwoController::getPhoneHeaderImageUploadURL();
        $tabletImageURL = ContentTabTwoController::getTabletHeaderImageUploadURL();
        $thumbnailImageURL = ContentTabTwoController::getThumbNailImageUploadURL();
        return self::select(DB::raw("`id`, `use_global_colors`, `background_color`,`text_color`," . self::_getImageSelectString($phoneImageURL, 'phone_header_image') . "," . self::_getImageSelectString($tabletImageURL, 'tablet_header_image') .",`section`,`name`,`status`,`add_header_and_comment`," . self::_getImageSelectString($thumbnailImageURL, 'thumbnail') .",`description`,`is_header_required`"))
            ->where('id', $id)
            ->first();
    }
    
    /**
     * @param mixed $id
     */
    public static function deleteContentTabTwo($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }
    
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
    
    private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$colName`";
    }

    public static function getSectionWiseList(int $id) {
        $thumbnailURL = ContentTabTwoController::getThumbNailImageUploadURL();
        $result = self::select(DB::raw("`id`,`section`,`status`,`name`,`use_global_colors`,`background_color`,`text_color`,`description`," . self::_getImageSelectString($thumbnailURL, 'thumbnail')))
            ->where('tab_id', $id)
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