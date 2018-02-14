<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\tabFunctions\ContentTab1Controller;
use Illuminate\Database\Eloquent\Collection;

class Content1 extends Model {

    protected $table = 'tp_func_content_tab_1';
    protected $guarded = ['id'];
    
    const TABLE = 'tp_func_content_tab_1';
    
    /**
     * get contact us locations for tab
     */
    
    public static function getContentData(int $id) {
        $phoneImageURL = ContentTab1Controller::getPhoneHeaderImageUploadURL();
        $tabletImageURL = ContentTab1Controller::getTabletHeaderImageUploadURL();
        return self::select(DB::raw("`id`, `use_global_colors`, `background_color`,`text_color`,"  . self::_getImageSelectString($phoneImageURL, 'phone_header_image') . "," . self::_getImageSelectString($tabletImageURL, 'tablet_header_image') . ",`add_header_and_comment`,`description`,`is_header_required`"))
            ->where('id', $id)
            ->first();
    }
       public static function getTabContentData(int $id) {
        $phoneImageURL = ContentTab1Controller::getPhoneHeaderImageUploadURL();
        $tabletImageURL = ContentTab1Controller::getTabletHeaderImageUploadURL();
        return self::select(DB::raw("`id`, `use_global_colors`, `background_color`,`text_color`,"  . self::_getImageSelectString($phoneImageURL, 'phone_header_image') . "," . self::_getImageSelectString($tabletImageURL, 'tablet_header_image') . ",`add_header_and_comment`,`description`,`is_header_required`"))
            ->where('tab_id', $id)
            ->first();
    }
    
    public static function getContentDataList(int $id) {
        return self::select('id','use_global_colors','background_color','text_color','description')
            ->where('tab_id', $id)
            ->get();
    }
    
    
    /**
     * @param mixed $id
     */
    public static function deleteContentTabOne($id) {
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
    
    


}