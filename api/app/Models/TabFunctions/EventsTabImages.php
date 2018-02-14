<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\TabFunctions\EventsTabController;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class EventsTabImages extends Model {

    protected $table = 'tp_func_events_images';
    protected $guarded = ['id'];

     /**
     * get images for Gallery
     */
    public static function getImages(int $item_id){
        $imageURL = EventsTabController::getImageUploadURL();
        return self::select(DB::raw("`id`,`event_id`," . self::_getImageSelectString($imageURL, 'image') .",`caption`,`created_at`"))
            ->where('event_id', $item_id)
             ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('image', 'ASC')
            ->get();
    }
    
    /**
     * get description for a image
     */
    public static function getImageDescription(int $id){
        return self::select('id','event_id','image','caption','created_at')
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