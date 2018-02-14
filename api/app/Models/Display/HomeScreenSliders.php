<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace App\Models\Display;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;
use App\Http\Controllers\Display\BackgroundImagesController;

/**
 * Description of HomeScreenSliders
 *
 * @author unicode
 */
class HomeScreenSliders extends Model {

    protected $table = 'mst_home_screen_sliders'; //slider_no,image_id,app_id
    protected $guarded = ['id'];

    const TABLE = 'mst_home_screen_sliders';
    const USER_IMAGES = 'mst_user_images';
    const LIBRARY_IMAGES = 'mst_library_images';
    const APP_ENTITY = 'tp_apps_entity';

    /**
     * get homescreen
     */
    public static function getAppSliders(int $app_id) {
        $mageURL = BackgroundImagesController::getImageUploadURL();
        return DB::table('mst_home_screen_sliders as main')
                        ->select(DB::raw("`main`.`id`,`main`.`slider_no`,`main`.`image_id`,`main`.`tab_image_id`,`main`.`app_id`,`apptbl`.`slider_type`,`main`.`created_at`,`main`.`updated_at`, `main`.`linked_tab_id`, CONCAT('$mageURL', '/', (IF(child.lib_img_id IS NULL, child.name, grandchild.name))) as image_name, CONCAT('$mageURL', '/', (IF(child1.lib_img_id IS NULL, child1.name, grandchild.name))) as tab_image_name"))
                        ->leftJoin(self::USER_IMAGES . ' as child', 'main.image_id', '=', 'child.id')
                        ->leftJoin(self::USER_IMAGES . ' as child1', 'main.tab_image_id', '=', 'child1.id')
                        ->leftJoin(self::LIBRARY_IMAGES . ' as grandchild', 'child.lib_img_id', '=', 'grandchild.id')
                        ->leftJoin(self::APP_ENTITY . ' as apptbl', 'main.app_id', '=', 'apptbl.id')
                        ->where('main.app_id', $app_id)
                        ->orderBy('slider_no', 'asc')
                        ->get();
    }

    public static function updateAppEntity(int $appid, int $is_modern_sliding, $slider_type = 0, int $sd_image_type) {
        if ($sd_image_type == 1) {
            $sdModernSliding = 'is_modern_sliding';
            $sdType = 'slider_type';
        } else if ($sd_image_type == 2) {
            $sdModernSliding = 'is_tab_modern_sliding';
            $sdType = 'tab_slider_type';
        }
        $data = [
            $sdModernSliding => $is_modern_sliding,
        ];
        if ($slider_type) {

            $data = array_merge($data, array($sdType => $slider_type));
        }
        DB::table(self::APP_ENTITY)->where('id', $appid)
                ->update($data);
    }

    public static function saveSliderImages(int $app_id, int $images_id, $sliders, int $sd_image_type) {
        $data_array = [];
        if ($sd_image_type == 1) {
            $sdImage = 'image_id';
        } else if ($sd_image_type == 2) {
            $sdImage = 'tab_image_id';
        }
        for ($i = 0; $i < count($sliders); $i++) {

            $exist = self::selectSliderImage($app_id, $sliders[$i]);
            if ($exist && $exist->id) {
                self::updateSliderImages($app_id, $images_id, $sdImage, [$sliders[$i]]);
            } else {
                $data = array('app_id' => $app_id, 'slider_no' => $sliders[$i], $sdImage => $images_id);
                array_push($data_array, $data);
            }
        }
        if (count($data_array)) {
            self::insert($data_array);
        }
    }

    public static function updateSliderImages(int $app_id, int $images_id, $sdImage, $sliders) {
        for ($i = 0; $i < count($sliders); $i++) {
            self::where('app_id', $app_id)
                    ->where('slider_no', $sliders[$i])
                    ->update([$sdImage => $images_id]);
        }
    }

    public static function selectSliderImage(int $app_id, $slider_no) {

        return self::where('app_id', $app_id)
                        ->where('slider_no', $slider_no)
                        ->get()
                        ->first();
    }

    public static function deleteSliderImage(int $app_id, int $slider_no, int $sd_image_type) {
        if ($sd_image_type == 1) {
            $sdImage = 'image_id';
        } else if ($sd_image_type == 2) {
            $sdImage = 'tab_image_id';
        }
        return self::where('app_id', $app_id)
                        ->where('slider_no', $slider_no)
                        ->update([$sdImage => 0]);
    }

    public static function updateSlidersImageAfterDeleteImages(int $app_id, $images) {
        for ($i = 0; $i < count($images); $i++) {
            $imgId = $images[$i];
            return self::where('app_id', $app_id)
                            ->where('image_id', $imgId)
                            ->delete();
        }
    }

}
