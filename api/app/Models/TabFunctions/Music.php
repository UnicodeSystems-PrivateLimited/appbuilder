<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\tabFunctions\MusicController;
use Illuminate\Database\Eloquent\Collection;

class Music extends Model {

    protected $table = 'tp_func_music';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_music';

    const TAPSTABLE = 'tp_apps_tabs_entity';
    const MSTTABSTABLE = 'mst_tp_tab_entity';

    public static function getTrackList(int $tabId, $type) {
        $trackURL = MusicController::getTrackUploadURL();
        $thumbnailImageURL = MusicController::getThumbNailImageUploadURL();
        if ($type) {
            $fieldfordevice = ($type == 1) ? 'is_for_android' : 'is_for_android';
            return self::select(DB::raw("`id`," . self::_getImageSelectString($trackURL, 'track_file') . ",`track_url`,`artist`,`title`,`album`,`is_for_android`,`is_active_iphone`,`purchase_url`,`description`," . self::_getImageSelectString($thumbnailImageURL, 'art_file') . ",`art_url`,`created_at`"))
                            ->where('tab_id', $tabId)
                            ->where($fieldfordevice, 1)
                            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
                            ->orderBy('sort_order', 'ASC')
                            ->orderBy('title', 'ASC')
                            ->get();
        } else {
            return self::select(DB::raw("`id`," . self::_getImageSelectString($trackURL, 'track_file') . ",`track_url`,`artist`,`title`,`album`,`is_for_android`,`is_active_iphone`,`purchase_url`,`description`," . self::_getImageSelectString($thumbnailImageURL, 'art_file') . ",`art_url`,`created_at`"))
                            ->where('tab_id', $tabId)
                            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
                            ->orderBy('sort_order', 'ASC')
                            ->orderBy('title', 'ASC')
                            ->get();
        }
    }

    public static function getTrackData(int $id) {
        $trackURL = MusicController::getTrackUploadURL();
        $thumbnailImageURL = MusicController::getThumbNailImageUploadURL();
        return self::select(DB::raw("`id`," . self::_getImageSelectString($trackURL, 'track_file') . ",`track_url`,`artist`,`title`,`album`,`is_for_android`,`is_active_iphone`,`purchase_url`,`description`," . self::_getImageSelectString($thumbnailImageURL, 'art_file') . ",`art_url`,`created_at`"))
                        ->where('id', $id)
                        ->first();
    }

    /**
     * @param mixed $id
     */
    public static function deleteTrack($id) {
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

    //used for ionic for music list based on album

    public static function getAlbumWiseMusicTrackList(int $tabId, $type): array {
        $trackURL = MusicController::getTrackUploadURL();
        $thumbnailImageURL = MusicController::getThumbNailImageUploadURL();
        $returnArray = [];
        if ($type) {
            $fieldfordevice = ($type == 1) ? 'is_for_android' : 'is_for_android';
            $result = self::select(DB::raw("`id`, `album`, `art_file`,`art_url`,`artist`,`created_at`,`description`,`is_active_iphone`,`is_for_android`,`purchase_url`,`title`,`track_file`,`track_url`," . self::_getImageSelectString($trackURL, 'track_file') . "," . self::_getImageSelectString($thumbnailImageURL, 'art_file') . ""))
                    ->where('tab_id', $tabId)
                    ->where($fieldfordevice, 1)
                    ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
                    ->orderBy('sort_order', 'ASC')
                    ->orderBy('album', 'ASC')
                    ->get();
        } else {
            $result = self::select(DB::raw("`id`, `album`, `art_file`,`art_url`,`artist`,`created_at`,`description`,`is_active_iphone`,`is_for_android`,`purchase_url`,`title`,`track_file`,`track_url`," . self::_getImageSelectString($trackURL, 'track_file') . "," . self::_getImageSelectString($thumbnailImageURL, 'art_file') . ""))
                    ->where('tab_id', $tabId)
                    ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
                    ->orderBy('sort_order', 'ASC')
                    ->orderBy('album', 'ASC')
                    ->get();
        }
        foreach ($result as $res) {
            $returnArray[$res->album][] = $res;
        }
        return $returnArray;
    }

    //check home screen weight setting

    public static function updateSettings($tabId, $appId) {
        $results = DB::table(self::TAPSTABLE . ' as main')
                ->select('main.id', 'main.settings')
                ->leftJoin(self::MSTTABSTABLE . ' as master', 'main.tab_func_id', '=', 'master.id')
                ->where('main.id', '<>', $tabId)
                ->where('main.app_id', $appId)
                ->where('master.tab_code', 'music')
                ->get();
        foreach ($results as $res) {
            if (!empty($res->settings)) {
                $settings = json_decode($res->settings);
                if ($settings->home_screen_widget) {
                    $settings->home_screen_widget = false;
                    DB::table(self::TAPSTABLE)
                            ->where('id', $res->id)
                            ->update(['settings' => json_encode($settings)]);
                }
            }
        }
    }

}
