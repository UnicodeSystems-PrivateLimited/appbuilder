<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\TabFunctions\ImageGalleryController;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class GalleryImages extends Model {

    protected $table = 'tp_func_gallery_images';
    protected $guarded = ['id'];
    
    /**
     * get images for Gallery
     */
    public static function getImages(int $gallery_id){
        $imageURL = ImageGalleryController::getImageUploadURL();
        return self::select(DB::raw("`id`,`gallery_id`," . self::_getImageSelectString($imageURL, 'image') .",`description`,`created_at`"))
            ->where('gallery_id', $gallery_id)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->get();
    }
    
    /**
     * get description for a image
     */
    public static function getImageDescription(int $id){
        return self::select('id','gallery_id','image','description','created_at')
            ->where('id', $id)
            ->first();
    }
    /**
     * @param mixed $id
     */
    public static function deleteImage($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }
    
    private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` = '' AND `$colName` IS NULL, NULL, (CONCAT('$url','/',`$colName`))) as `$colName`";
    }
    
    public static function getGalleryPhotos(int $gallery_id){
        $returnArray = [];
        $imageURL = ImageGalleryController::getImageUploadURL();
        $result = self::select(DB::raw("`id`,`gallery_id`," . self::_getImageSelectString($imageURL, 'image') .",`description`,`created_at`"))
            ->where('gallery_id', $gallery_id)
            ->get();
        $i = 1;
        $j = 0;
        foreach ($result as $res){
            if($i%3 == 0) {
                $returnArray[$j][] = $res;
                $j++;
            } else {
                $returnArray[$j][] = $res;
            }
            $i++;
        }
        return $returnArray;
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

}