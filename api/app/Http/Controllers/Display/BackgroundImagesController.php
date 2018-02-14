<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace App\Http\Controllers\Display;

use App\Models\TpAppsTabEntity;
use App\Models\TpAppsEntity;
use App\Models\Display\UserImages;
use App\Models\Display\LibraryImages;
use App\Models\Display\LibraryImagesCategory;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App;
use Illuminate\Support\Facades\Validator;
use Exception;
use Intervention\Image\Facades\Image;
use App\Helpers\Helper;
use App\Models\Display\HomeScreenSliders;

class BackgroundImagesController extends Controller {

    protected $authenticator;

    const USER_IMAGE_FOLDER_NAME = 'app/public/display/user_images';

    public function __construct() {
        $this->authenticator = App::make('authenticator');
    }

    private static function _getValidationMessages() {
        return [];
    }

    public function init(Request $request) {
        try {
            if (empty($request->app_id)) {
                throw new Exception('App ID not found.');
            }
            $data = [
                'user_images_list' => UserImages::getUserImages($request->app_id),
                'library_images_category_list' => LibraryImagesCategory::getLibraryImagesCategory(),
                'app_data' => TpAppsEntity::getAppData($request->app_id),
                'app_tabs_data' => TpAppsTabEntity::getAppTabsForContent($request->app_id),
                'home_screen_sliders' => HomeScreenSliders::getAppSliders($request->app_id),
            ];
            $result = [
                'success' => TRUE,
                'data' => $data
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function uploadUserImage(Request $request) {
        try {
            $data = $request->all();
            $width = $request->width ? $request->width : 640;
            $height = $request->height ? $request->height : 1008;
            $image = $request->file('name');
            $rules = ['name' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()->unique()));
            }
            if (!empty($image)) {
                $data['name'] = self::_uploadImage($image, self::getImageUploadPath(), $width, $height);
            } else {
                unset($data['name']);
            }

            if ($request->id) {
                $returnData = UserImages::where('id', $request->id)->update($data);
                $result = [
                    'success' => TRUE,
                    'data' => $returnData,
                    'message' => ['Image was successfully updated.'],];
            } else {

                $returnData = UserImages::getImage(UserImages::create($data)->id);
                $result = [
                    'success' => TRUE,
                    'data' => $returnData,
                    'message' => ['Image was successfully uploaded.'],
                ];
            }
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    private static function _uploadImage($image, string $uploadPath, $width = null, $height = null): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_user_image.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->resize($width, $height)
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    public static function getImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::USER_IMAGE_FOLDER_NAME);
    }

    public static function getImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::USER_IMAGE_FOLDER_NAME);
    }

    /* function to get all Library Images */

    public function getLibraryImage() {
        try {
            $data = [
                'library_images_list' => LibraryImages::getAllLibraryImages(),
            ];
            $result = [
                'success' => TRUE,
                'data' => $data
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    /* Function to getimage by category */

    public function getAllImageByCat(Request $request) {
        try {
            if (empty($request->cat_id)) {
                throw new Exception('Category ID not found.');
            }
            $data = [
                'category_image_list' => LibraryImages::getAllImageByCat($request->cat_id),
            ];
            $result = [
                'success' => TRUE,
                'data' => $data
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    /* Function to update Background Images */

    public function updateBckGroundImage(Request $request) {

        try {
            if (empty($request->appId)) {
                throw new Exception('App id not found.');
            }
            if (empty($request->imgId)) {
                throw new Exception('Image id not found.');
            }
            if (empty($request->bgImageType)) { //for phone =>1, tablet=>2 
                throw new Exception('Background Image type not found.');
            }

            UserImages::updateAppEntity($request->appId, $request->imgId, $request->bgImageType);
            $data = [
                'app_data' => TpAppsEntity::getAppData($request->appId),
            ];
            $result = [
                'success' => TRUE,
                'data' => $data,
                'message' => ['Background image updated successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    /* Function to Insert bulk Library Images */

    public function importLibraryImages(Request $request) {
        try {
            if (empty($request->input('lib_images_id'))) {
                throw new Exception('Library Image id not passing.');
            }
            if (empty($request->input('app_id'))) {
                throw new Exception('App id not passing.');
            }
            $lib_images_id = explode(",", $request->input('lib_images_id'));
            $ids = UserImages::importLibraryImages($lib_images_id, $request->input('app_id'));
            $imported_images = UserImages::getImportedLibraryImages($ids, $request->input('app_id'));

            $data = ["imported_images" => $imported_images];

            $result = [
                'success' => TRUE,
                'data' => $data,
                'message' => ['Library Images inserted successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    /* Function to Remove Home Background Image */

    public function removeHomeBckImage(Request $request) {

        try {
            if (empty($request->id)) {
                throw new Exception('App Id not found.');
            }
            if (empty($request->bgImageType)) { //for phone =>1, tablet=>2 
                throw new Exception('Background Image type not found.');
            }

            UserImages::removeHomeBckImage($request->id, $request->bgImageType);
            $data = [
                'app_data' => TpAppsEntity::getAppData($request->id),
            ];

            $result = [
                'success' => TRUE,
                'data' => $data,
                'message' => ['Background image removed successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function saveSliderImages(Request $request) {
        try {
            if (empty($request->appId)) {
                throw new Exception('App id not found.');
            }
            if (empty($request->sdImageType)) { //for phone =>1, tablet=>2 
                throw new Exception('Slide Image type not found.');
            }
//            if (empty($request->userImageId)) {
//                throw new Exception('Image id not found.');
//            }
//            if (empty($request->sliderNo)) {
//                throw new Exception('Slider no found.');
//            }

            HomeScreenSliders::updateAppEntity($request->appId, $request->isModernSliding, $request->sliderType, $request->sdImageType);
            if ($request->userImageId && $request->sliderNo) {
                $sliders = explode(',', $request->sliderNo);
                HomeScreenSliders::saveSliderImages($request->appId, $request->userImageId, $sliders, $request->sdImageType);
            }
            $data = [
                'app_data' => TpAppsEntity::getAppData($request->appId),
                'home_screen_sliders' => HomeScreenSliders::getAppSliders($request->appId),
            ];
            $result = [
                'success' => TRUE,
                'data' => $data,
                'message' => ['Slider image updated successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function saveTabsBackgroundImages(Request $request) {
        try {
            if (empty($request->appId)) {
                throw new Exception('App id not found.');
            }
            if (empty($request->userImageId)) {
                throw new Exception('Image id not found.');
            }
            if (empty($request->bgImageType)) { //for phone =>1, tablet=>2 //iphone=>3
                throw new Exception('Background Image type not found.');
            }
            if (empty($request->tabsId)) {
                throw new Exception('Tab id not found.');
            }
            $bg_image_type = $request->bgImageType;

            $tabs = explode(',', $request->tabsId);
            UserImages::updateTabBckImage($request->appId, $request->userImageId, $tabs, $bg_image_type);
            $data = [
                'app_data' => TpAppsEntity::getAppData($request->appId),
                'app_tabs_data' => TpAppsTabEntity::getAppTabsForContent($request->appId),
            ];
            $result = [
                'success' => TRUE,
                'data' => $data,
                'message' => ['Tab background image updated successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteTabBackgroundImage(Request $request) {
        try {
            if (empty($request->appId)) {
                throw new Exception('App id not found.');
            }
            if (empty($request->tabId)) {
                throw new Exception('Tab id not found.');
            }
            if (empty($request->bgImageType)) { //for phone =>1, tablet=>2 //iphone=>3
                throw new Exception('Background Image type not found.');
            }
            $bg_image_type = $request->bgImageType;

            $tabId = $request->tabId;
            UserImages::updateTabBckImage($request->appId, null, [$tabId], $bg_image_type);
            $data = [
                'app_tabs_data' => TpAppsTabEntity::getAppTabsForContent($request->appId),
            ];
            $result = [
                'success' => TRUE,
                'data' => $data,
                'message' => ['Tab background image deleted successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteSliderImage(Request $request) {
        try {
            if (empty($request->appId)) {
                throw new Exception('App id not found.');
            }
            if (empty($request->sliderNo)) {
                throw new Exception('Tab id not found.');
            }
            if (empty($request->sdImageType)) { //for phone =>1, tablet=>2 
                throw new Exception('Slide Image type not found.');
            }
            $sliderNo = $request->sliderNo;
            HomeScreenSliders::deleteSliderImage($request->appId, $sliderNo,$request->sdImageType);
            $data = [
                'home_screen_sliders' => HomeScreenSliders::getAppSliders($request->appId),
            ];
            $result = [
                'success' => TRUE,
                'data' => $data,
                'message' => ['Slider image deleted successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteUserImages(Request $request) {

        try {
            if (empty($request->appId)) {
                throw new Exception('App id not found.');
            }
            if (empty($request->imgIds)) {
                throw new Exception('Image id not found.');
            }
            if (empty($request->bgImageType)) { //for phone =>1, tablet=>2 //iphone=>3
                throw new Exception('Background Image type not found.');
            }
            $bg_image_type = $request->bgImageType;

            $images = explode(',', $request->imgIds);
            UserImages::deleteUserImages($images);
            UserImages::updateHomeBckImageAfterDeleteImages($request->appId, $images);
            UserImages::updateTabBckImageAfterDeleteImages($request->appId, $images, $bg_image_type);
            HomeScreenSliders::updateSlidersImageAfterDeleteImages($request->appId, $images);
            $data = [
                'user_images_list' => UserImages::getUserImages($request->appId),
                'app_data' => TpAppsEntity::getAppData($request->appId),
                'app_tabs_data' => TpAppsTabEntity::getAppTabsForContent($request->appId),
                'home_screen_sliders' => HomeScreenSliders::getAppSliders($request->appId),
            ];
            $result = [
                'success' => TRUE,
                'data' => $data,
                'message' => ['User image deleted successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getTabBackgroundImage(Request $request) {

        try {
            if (empty($request->tabId)) {
                throw new Exception('App id not found.');
            }
            $data = ['tab_data' => UserImages::getTabBackgroundImage($request->tabId)];
            $result = [
                'success' => TRUE,
                'data' => $data,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function saveTabBackgroundImageFlag(Request $request) {

        try {

            if (empty($request->appId)) {
                throw new Exception('App id not found.');
            }
            $id = $request->appId;
            $flag_phone_img = $request->flag_phone_img;
            $flag_tablet_img = $request->flag_tablet_img;
            $flag_iphone_img = $request->flag_iphone_img;
            $data = array('flag_phone_img' => $flag_phone_img, 'flag_tablet_img' => $flag_tablet_img, 'flag_iphone_img' => $flag_iphone_img);
            if (!isset($flag_phone_img)) {
                throw new Exception('Phone Flag not found.');
            }
            if (!isset($flag_tablet_img)) {
                throw new Exception('Tablet Flag not found.');
            }
            if (!isset($flag_iphone_img)) {
                throw new Exception('IPhone Flag not found.');
            }

            //update the flags for tab_id
            $flags = TpAppsEntity::updateFlagsForBgImages($id, $data);
            $result = [
                'success' => TRUE,
                'message' => 'Background Image mode has been updated',
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function saveSliderTabLink(Request $request) {
        try {
            if (empty($request->appID) || empty($request->slideNo) || empty($request->linkedTabID)) {
                throw new Exception('Invalid data provided.');
            }
            HomeScreenSliders::where('slider_no', $request->slideNo)
                ->where('app_id', $request->appID)
                ->update(['linked_tab_id' => $request->linkedTabID]);
            $result = [
                'success' => TRUE,
                'message' => 'Slider link saved successfully.',
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

}
