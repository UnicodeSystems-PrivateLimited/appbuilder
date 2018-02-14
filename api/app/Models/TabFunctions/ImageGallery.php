<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\TabFunctions\ImageGalleryController;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class ImageGallery extends Model {

    protected $table = 'tp_func_image_gallery';
    protected $guarded = ['id'];
    
    const TABLE = 'tp_func_gallery_images';
    
    /**
     * get contact us locations for tab
     */
    public static function getGalleryList(int $tabId) {
        $thumbURL = ImageGalleryController::getThumbnailUploadURL();
         $imageURL = ImageGalleryController::getImageUploadURL();
        return DB::table('tp_func_image_gallery as main')
            ->select('main.id', 'main.name', DB::raw(self::_getImageSelectString($thumbURL, 'thumbnail')), 'main.gallery_type', 'main.image_description', 'main.created_at', DB::raw('COUNT(child.id) as img_count'), DB::raw(self::_getImageSelectString($imageURL, 'image')))
            ->leftJoin(self::TABLE . ' as child', function ($join) {
                $join->on('main.id', '=', 'child.gallery_id');
            })
            ->where('main.tab_id', $tabId)
            ->groupBy('main.id')
            ->orderBy(DB::raw('(main.sort_order=0)'), 'ASC')
            ->orderBy('main.sort_order', 'ASC')
            ->orderBy('main.name', 'ASC')
            ->get();
    }
    
    
    /**
     * get specific gallery info
     */
    public static function getGalleryInfo(int $id) {
        $thumbURL = ImageGalleryController::getThumbnailUploadURL();
        return self::select(DB::raw("`id`, `name`," . self::_getImageSelectString($thumbURL, 'thumbnail') . ", `gallery_type`,`image_description`,`created_at`"))
            ->where('id', $id)
            ->first();
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

    /**
     * @param mixed $id
     */
    public static function deleteGallery($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }
    
    private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` = '' AND `$colName` IS NULL, NULL, (CONCAT('$url','/',`$colName`))) as `$colName`";
    }


}