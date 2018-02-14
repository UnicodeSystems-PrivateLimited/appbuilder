<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace App\Models\Display;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\Display\BackgroundImagesController;

/**
 * Description of UserImages
 *
 * @author Meera
 */
class UserImages extends Model {

    protected $table = 'mst_user_images';
    protected $guarded = ['id'];

    const TABLE = 'mst_user_images';
    const LIBRARY_TABLE = 'mst_library_images';
    const appEntity = 'tp_apps_entity';
    const APP_ENTITY_TABLE = 'tp_apps_entity';

    /**
     * get homescreen
     */
    public static function getUserImages(int $app_id) {
        $mageURL = BackgroundImagesController::getImageUploadURL();
        return DB::table('mst_user_images as main')
                        ->select(DB::raw("`main`.`id`,`main`.`app_id`,`main`.`created_at`,`main`.`updated_at`, CONCAT('$mageURL', '/', (IF(main.lib_img_id IS NULL, main.name, child.name))) as name"))
                        ->leftJoin(self::LIBRARY_TABLE . ' as child', 'main.lib_img_id', '=', 'child.id')
                        ->where('app_id', $app_id)
                        ->get();
    }

    public static function getImage(int $id) {
        $mageURL = BackgroundImagesController::getImageUploadURL();
        return self::select(DB::raw("`id`,`app_id`,`created_at`,`updated_at`," . self::_getImageSelectString($mageURL, 'name')))
                        ->where('id', $id)
                        ->get();
    }

    private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$colName`";
    }

    public static function getImportedLibraryImages($images_id, int $app_id) {
        $mageURL = BackgroundImagesController::getImageUploadURL();
        return DB::table('mst_user_images as main')
                        ->select(DB::raw("`main`.`id`,`main`.`app_id`,`main`.`lib_img_id`,`main`.`created_at`,`main`.`updated_at`, CONCAT('$mageURL', '/', (IF(main.lib_img_id IS NULL, main.name, child.name))) as name"))
                        ->leftJoin(self::LIBRARY_TABLE . ' as child', 'main.lib_img_id', '=', 'child.id')
                        ->where('app_id', $app_id)
                        ->whereIn('main.id', $images_id)
                        ->get();
    }

    public static function importLibraryImages($lib_images_id, int $app_id) {
        $id_array = [];

        for ($i = 0; $i < count($lib_images_id); $i++) {
            $data = array('app_id' => $app_id, 'lib_img_id' => $lib_images_id[$i]);

            $id = self::create($data)->id;
            array_push($id_array, $id);
        }
        return $id_array;
    }

    /* Function to Update Background Images */

    public static function updateAppEntity(int $appid, int $imgid, int $bg_image_type) {
        if ($bg_image_type == 1) {
            $bgImage = 'home_screen_background_image';
        } else if ($bg_image_type == 2) {
            $bgImage = 'home_screen_tab_background_image';
        }

        DB::table(self::APP_ENTITY_TABLE)->where('id', $appid)
                ->update([
                    $bgImage => $imgid,
        ]);
    }

    /* Function to Delete App Entity Data */

    public static function removeHomeBckImage(int $id, int $bg_image_type) {
        if ($bg_image_type == 1) {
            $bgImage = 'home_screen_background_image';
        } else if ($bg_image_type == 2) {
            $bgImage = 'home_screen_tab_background_image';
        }
        DB::table(self::APP_ENTITY_TABLE)->where('id', $id)
                ->update([
                    $bgImage => 0,
        ]);
    }

    /* Function to Update Tabs Background Images */

    public static function updateTabBckImage($appId, $imgId, $tabs, $bg_image_type) {
        if ($bg_image_type == 1) {
            $bgImage = 'background_image';
        } else if ($bg_image_type == 2) {
            $bgImage = 'tablet_bg_img';
        } else {
            $bgImage = 'iphone_bg_img';
        }
        for ($i = 0; $i < count($tabs); $i++) {
            DB::table('tp_apps_tabs_entity')
                    ->where('app_id', $appId)
                    ->where('id', $tabs[$i])
                    ->update([$bgImage => $imgId]);
        }
    }

    public static function deleteUserImages($images) {
        return self::whereIn('id', $images)
                        ->delete();
    }

    public static function updateHomeBckImageAfterDeleteImages(int $appId, $images) {
        for ($i = 0; $i < count($images); $i++) {
            $imgId = $images[$i];
            DB::table(self::APP_ENTITY_TABLE)
                    ->where('id', $appId)
                    ->where('home_screen_background_image', $imgId)
                    ->update([
                        'home_screen_background_image' => 0,
            ]);
        }
    }

    public static function updateTabBckImageAfterDeleteImages($appId, $images, $bg_image_type) {
        if ($bg_image_type == 1) {
            $bgImage = 'background_image';
        } else if ($bg_image_type == 2) {
            $bgImage = 'tablet_bg_img';
        } else {
            $bgImage = 'iphone_bg_img';
        }

        for ($i = 0; $i < count($images); $i++) {
            $imgId = $images[$i];
            DB::table('tp_apps_tabs_entity')
                    ->where('app_id', $appId)
                    ->where($bgImage, $imgId)
                    ->update([$bgImage => null]);
        }
    }

    public static function getTabBackgroundImage(int $id) {
        $mageURL = BackgroundImagesController::getImageUploadURL();
        return DB::table('tp_apps_tabs_entity as main')
                        ->select(DB::raw("`main`.`id`,`main`.`app_id`,`main`.`title`,`main`.`created_at`,`main`.`updated_at`, CONCAT('$mageURL', '/', (IF(child.lib_img_id IS NULL, child.name, grandchild.name))) as background_image , CONCAT('$mageURL', '/', (IF(child1.lib_img_id IS NULL, child1.name, grandchild1.name))) as tablet_bg_img , CONCAT('$mageURL', '/', (IF(child2.lib_img_id IS NULL, child2.name, grandchild2.name))) as iphone_bg_img"))
                        ->leftJoin(self::TABLE . ' as child', 'main.background_image', '=', 'child.id')
                        ->leftJoin(self::LIBRARY_TABLE . ' as grandchild', 'child.lib_img_id', '=', 'grandchild.id')
                        ->leftJoin(self::TABLE . ' as child1', 'main.tablet_bg_img', '=', 'child1.id')
                        ->leftJoin(self::LIBRARY_TABLE . ' as grandchild1', 'child1.lib_img_id', '=', 'grandchild1.id')
                        ->leftJoin(self::TABLE . ' as child2', 'main.iphone_bg_img', '=', 'child2.id')
                        ->leftJoin(self::LIBRARY_TABLE . ' as grandchild2', 'child2.lib_img_id', '=', 'grandchild2.id')
                        ->where('main.id', $id)
                        ->first();
    }

}
