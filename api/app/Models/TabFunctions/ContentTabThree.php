<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\tabFunctions\ContentTabThreeController;
use Illuminate\Database\Eloquent\Collection;

class ContentTabThree extends Model {

    protected $table = 'tp_func_content_tab_3';
    protected $guarded = ['id'];
    
    const TABLE = 'tp_func_content_tab_3';
    
    public static function getCategoryList(int $id) {
        $thumbnailImageURL = ContentTabThreeController::getThumbnailImageUploadURL();        
        return self::select(DB::raw("`id`,`tab_id`, `section`, `name`,`status`,". self::_getImageSelectString($thumbnailImageURL, 'thumbnail')))
            ->where('tab_id', $id)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('name', 'ASC')
            ->get();
    }
    
        public static function getCategoryData(int $id) {
         $thumbnailImageURL = ContentTabThreeController::getThumbnailImageUploadURL();        
        return self::select(DB::raw("`id`,`tab_id`, `section`, `name`,`status`,". self::_getImageSelectString($thumbnailImageURL, 'thumbnail') .",created_at"))
            ->where('id', $id)
            ->first();
    }
    
    
    /**
     * @param mixed $id
     */
    public static function deleteContentTabThreeCategory($id) {
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
        $thumbnailImageURL = ContentTabThreeController::getThumbnailImageUploadURL();        
        $result = self::select(DB::raw("`id`,`tab_id`,  `status`, `section`, `name`,". self::_getImageSelectString($thumbnailImageURL, 'thumbnail')))
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