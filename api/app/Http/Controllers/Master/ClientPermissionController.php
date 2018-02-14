<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\ClientPermission;
use App\Models\ClientThemeColor;
use App\Models\ClientLanguage;
use App\Models\ClientImages;
use App\Helpers\Helper;
use URL;

class ClientPermissionController extends Controller {

    const THEME_LOGO_UPLOAD_PATH = 'app/public/functions/client_permission/theme';
    const PREVIEW_BG_IMAGE_UPLOAD_PATH = 'app/public/functions/client_permission/preview';
    const PREVIEW_PLAY_IMAGE_UPLOAD_PATH = 'app/public/functions/client_permission/preview';
    const PREVIEW_LOAD_IMAGE_UPLOAD_PATH = 'app/public/functions/client_permission/preview';
    const LOGIN_LOGO_UPLOAD_PATH = 'app/public/functions/client_permission/login';
    const LOGIN_BG_UPLOAD_PATH = 'app/public/functions/client_permission/login';

    //Theme logo upload Path
    public static function getThemeLogoImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::THEME_LOGO_UPLOAD_PATH);
    }

    //Theme logo URL
    public static function getThemeLogoImageUploadUrl(): string {
        return Helper::getUploadDirectoryURL(self::THEME_LOGO_UPLOAD_PATH);
    }

    //Preview BG Image Upload Path
    public static function getPreviewBgImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::PREVIEW_BG_IMAGE_UPLOAD_PATH);
    }

    //Preview BG Image URL
    public static function getPreviewBgImageUploadUrl(): string {
        return Helper::getUploadDirectoryURL(self::PREVIEW_BG_IMAGE_UPLOAD_PATH);
    }

    //Preview Play Image Upload Path
    public static function getPreviewPlayImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::PREVIEW_PLAY_IMAGE_UPLOAD_PATH);
    }

    //Preview Play Image URL
    public static function getPreviewPlayImageUploadUrl(): string {
        return Helper::getUploadDirectoryURL(self::PREVIEW_PLAY_IMAGE_UPLOAD_PATH);
    }

    //Preview Load Image Upload Path
    public static function getPreviewLoadImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::PREVIEW_LOAD_IMAGE_UPLOAD_PATH);
    }

    //Preview Load Image URL
    public static function getPreviewLoadImageUploadUrl(): string {
        return Helper::getUploadDirectoryURL(self::PREVIEW_LOAD_IMAGE_UPLOAD_PATH);
    }

    //Login Logo Image Upload Path
    public static function getLoginLogoImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::LOGIN_LOGO_UPLOAD_PATH);
    }

    //Login Logo Image URL
    public static function getLoginLogoImageUploadUrl(): string {
        return Helper::getUploadDirectoryURL(self::LOGIN_LOGO_UPLOAD_PATH);
    }

    //Login BG Image Upload Path
    public static function getLoginBgImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::LOGIN_BG_UPLOAD_PATH);
    }

    //Login BG Image URL
    public static function getLoginBgImageUploadUrl(): string {
        return Helper::getUploadDirectoryURL(self::LOGIN_BG_UPLOAD_PATH);
    }

    private static function _getCommonValidationHeaderLinkRules(): array {
        return [
            'label' => 'required',
            'link' => 'required'
        ];
    }

    private static function _getValidationHeaderLinkMessages() {
        return [];
    }

    private static function _getCommonValidationFooterLinkRules(): array {
        return [
            'label' => 'required'
        ];
    }

    private static function _getValidationFooterLinkMessages() {
        return [];
    }

    /**
     * Init 
     */
    public function init(Request $request) {
        try {
            if (empty($request->appId)) {
//                throw new Exception('App ID not found.');
            }

            if ($request->appId == 0) {
                $row = ClientPermission :: get_data_by_app_id($request->appId);
                $default_id = $row->id;
                if (isset($default_id)) {
                    $client_cms_data = ClientPermission :: get_settings_data($default_id, $scope = 'global');
                } else {
                    throw new Exception('App ID not found.');
                }
            } else {
                $client_cms_data = ClientPermission :: get_settings_data($request->appId, $scope = 'app');
            }

            // default client permission data for theme,header,steps,previewer,footer



            if (isset($client_cms_data) && !empty($client_cms_data)) {
                $id = $client_cms_data['id'];
                $settings = $client_cms_data['settings'];
                $settings_data = json_decode($settings, true);

                if (isset($id)) {
                    $theme_logo = $settings_data['theme']['theme_logo'];
                    if (isset($theme_logo) && $theme_logo != "") {
                        $theme_logo_url1 = self :: getThemeLogoImageUploadUrl();
                        $settings_data['theme']['theme_logo'] = $theme_logo_url1 . '/' . $theme_logo;
                    } else {
                        $pathtofile = URL::asset('resources/assets/images/email/logo.png');
                        $settings_data['theme']['theme_logo'] = $pathtofile;
                    }

                    $prev_bg_image = $settings_data['previewer']['prev_bg_image'];
                    if (isset($prev_bg_image) && $prev_bg_image != "") {
                        $prev_bg_url1 = self :: getPreviewBgImageUploadUrl();
                        $settings_data['previewer']['prev_bg_image'] = $prev_bg_url1 . '/' . $prev_bg_image;
                    }

                    $prev_play_image = $settings_data['previewer']['prev_play_image'];
                    if (isset($prev_play_image) && $prev_play_image != "") {
                        $prev_play_url1 = self :: getPreviewPlayImageUploadUrl();
                        $settings_data['previewer']['prev_play_image'] = $prev_play_url1 . '/' . $prev_play_image;
                    }

                    $prev_loading_image = $settings_data['previewer']['prev_load_image'];
                    if (isset($prev_loading_image) && $prev_loading_image != "") {
                        $prev_load_url1 = self :: getPreviewLoadImageUploadUrl();
                        $settings_data['previewer']['prev_load_image'] = $prev_load_url1 . '/' . $prev_loading_image;
                    }

                    $login_logo_image = $settings_data['login_page']['login_logo'];
                    if (isset($login_logo_image) && $login_logo_image != "") {
                        $login_logo_url1 = self :: getLoginLogoImageUploadUrl();
                        $settings_data['login_page']['login_logo'] = $login_logo_url1 . '/' . $login_logo_image;
                    }

                    $login_bg_image = $settings_data['login_page']['login_bg_image'];
                    if (isset($login_bg_image) && $login_bg_image != "") {
                        $login_bg_url1 = self :: getLoginBgImageUploadUrl();
                        $settings_data['login_page']['login_bg_image'] = $login_bg_url1 . '/' . $login_bg_image;
                    }
                }
                if ($settings_data['theme']['theme_default_settings'] == 1) {
                    $cms_settings = self :: defaultCmsSettings();
                    $settings_data = $cms_settings;
                    $login_logo = $settings_data['login_page']['login_logo'];
                    if (!isset($login_logo) || $login_logo == "") {
                        $pathtofile = URL::asset('resources/assets/images/email/logo.png');
                        $settings_data['login_page']['login_logo'] = $pathtofile;
                    }

                    $theme_logo = $settings_data['theme']['theme_logo'];
                    if (!isset($theme_logo) || $theme_logo == "") {
                        $pathtofile = URL::asset('resources/assets/images/email/logo.png');
                        $settings_data['theme']['theme_logo'] = $pathtofile;
                    }
                }
            }

            $result = [
                'success' => TRUE,
                'data' => $settings_data
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    /**
     * Create and Save Theme
     */
    public function saveClientPermission(Request $request) {
        try {
            $data = $request->all();
            // default client permission data for theme,header,steps,previewer,footer

            $cms_settings = self :: defaultCmsSettings();

            $client_permission = $request->client_permission;

            if (isset($client_permission) && !empty($client_permission)) {
                $permission_data = $client_permission;
            } else {
                $permission_data = $cms_settings;
            }



            if (isset($permission_data)) {

                if (!isset($permission_data['theme']['theme_page_title']) || $permission_data['theme']['theme_page_title'] == "") {
                    $field_required['theme_page_title'] = ['theme page title is required'];
                }
                if (!isset($permission_data['footer']['footer_copyright_html']) || $permission_data['footer']['footer_copyright_html'] == "") {
                    $field_required['footer_copyright_html'] = ['footer copyright title is required'];
                }
                if (!isset($permission_data['login_page']['login_bg_image']) && empty($request->file('login_bg_image'))) {
                    $field_required['login_bg_image'] = ['login bg image is required'];
                }
                if ($permission_data['steps']['steps_functionality'] == 0 && $permission_data['steps']['steps_content'] == 0 && $permission_data['steps']['steps_appearance'] == 0 && $permission_data['steps']['steps_publish'] == 0) {
                    $field_required['steps'] = ['You have to select at least one step.'];
                }
            }



            $login_bg_image = $request->file('login_bg_image');
            if (!empty($login_bg_image)) {
                $extension = $login_bg_image->getClientOriginalExtension();
                if ($extension != 'png' && $extension != 'jpg' && $extension != 'jpeg') {
                    $field_required['login_bg_image_type'] = ['Please upload png|jpg|jpeg type image for Login Background image'];
                }
                $imageSize = $login_bg_image->getMaxFilesize();
                if ($imageSize <= MAX_FILE_UPLOAD_SIZE * 1024) {
                    $field_required['login_bg_image_size'] = ['The login bg image may not be greater than 10mb.'];
                }
            }
            if (isset($field_required)) { //fields are empty or not valid
                throw new Exception(json_encode($field_required));
            }

            //login BG image
            if (!empty($login_bg_image)) { //only png 350 by 350
                $login_bg_image1 = self::_uploadImage($login_bg_image, self::getLoginBgImageUploadPath());
                $permission_data['login_page']['login_bg_image'] = $login_bg_image1;
            }

            //check if data exist for app_id
            //if exists then update the corresponding details otherwise create 
            $app_id = $request->appId;
            if ($request->appId == 0) {
                $row = ClientPermission :: get_data_by_app_id($request->appId);
                $default_id = $row->id;
                if (isset($default_id)) {
                    $client_cms_data = ClientPermission :: get_settings_data($default_id, $scope = 'global');
                } else {
                    throw new Exception('App ID not found.');
                }
            } else {
                $client_cms_data = ClientPermission :: get_settings_data($request->appId, $scope = 'app');
            }
            $data_settings['app_id'] = $app_id;
            if (isset($client_cms_data)) {
                $id = $client_cms_data['id'];
                $data_settings['settings'] = json_encode($permission_data, JSON_NUMERIC_CHECK);
                ClientPermission::where('id', $id)->update($data_settings);
            } else {
                $data_settings['settings'] = json_encode($permission_data, JSON_NUMERIC_CHECK);
                ClientPermission::create($data_settings);
            }


            $result = [
                'success' => TRUE,
                'message' => 'Client Permissions saved successfully'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    /**
     * Saves the image file and returns the saved file name.
     * @return string
     */
    private static function _uploadImage($image, string $uploadPath, $width = 0, $height = 0): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_client_perm.' . $extension;
        Helper::makeDirectory($uploadPath);
        if (($width == 0) && ($height == 0)) {
            Image::make($image->getRealPath())
                    ->save($uploadPath . '/' . $fileName);
        } else {
            Image::make($image->getRealPath())
                    ->resize($width, $height, function ($constraint) {
                        $constraint->aspectRatio();
                    })
                    ->save($uploadPath . '/' . $fileName);
        }
        return $fileName;
    }

    private static function _uploadThemeLogoImage($image, string $uploadPath, $width, $height): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_client_perm.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->resize($width, $height, function ($constraint) {
                    $constraint->aspectRatio();
                })
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    /**
     * Add/Edit Header Navigation
     */
    public function headerNavigationSave(Request $request) {
        try {
            $data = $request->all();
            $validator = Validator::make($data, self::_getCommonValidationHeaderLinkRules(), self::_getValidationHeaderLinkMessages());
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $index = $request->index; //if index is there -- edit else add

            $label = $request->label;
            $link = $request->link;
            $action = $request->action;
            $class = $request->class;
            $template = $request->template;
            $navigation = array(
                'label' => $label,
                'link' => $link,
                'action' => $action,
                'class' => $class,
                'template' => $template
            );

            $client_cms_data = ClientPermission :: get_settings_data();
            if (isset($client_cms_data)) {
                $id = $client_cms_data['id'];
                $settings = $client_cms_data['settings'];
                $settings_data = json_decode($settings, true);


                if (isset($index)) {
                    $settings_data['header']['navigation'][$index] = $navigation;
                } else {
                    array_push($settings_data['header']['navigation'], $navigation);
                }

                $encoded = json_encode($settings_data);
                $data_settings['settings'] = $encoded;
                ClientPermission::where('id', $id)->update($data_settings);
            }
            $result = [
                'success' => TRUE,
                'message' => 'Header Navigation Saved successfully',
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    /**
     * Add/Edit Footer Navigation
     */
    public function footerNavigationSave(Request $request) {
        try {
            $data = $request->all();
            $validator = Validator::make($data, self::_getCommonValidationFooterLinkRules(), self::_getValidationFooterLinkMessages());
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $index = $request->index; //if index is there -- edit else add 0 or 1 or 2 
            $index_column = $request->column; // specifies for column1 or column2
            if (!isset($index_column)) {
                throw new Exception('Specify the column on which edit or to be add navigation');
            }


            $label = $request->label;
            $link = $request->link;
            $action = $request->action;
            $class = $request->class;
            $navigation = array(
                'label' => $label,
                'link' => $link,
                'action' => $action,
                'class' => $class
            );

            $client_cms_data = ClientPermission :: get_settings_data();
            if (isset($client_cms_data)) {
                $id = $client_cms_data['id'];
                $settings = $client_cms_data['settings'];
                $settings_data = json_decode($settings, true);
                if (isset($index)) {
                    $settings_data['footer'][$index_column][$index] = $navigation;
                } else {
                    array_push($settings_data['footer'][$index_column], $navigation);
                }
                $encoded = json_encode($settings_data);
                $data_settings['settings'] = $encoded;
                ClientPermission::where('id', $id)->update($data_settings);
            }

            $result = [
                'success' => TRUE,
                'message' => 'Footer Navigation Saved successfully',
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    /**
     * Delete Header Navigation
     */
    public function headerNavigationDelete(Request $request) {
        try {
            $index = $request->index; //delete navigation by array index
            if (!isset($index) || $index == "") {
                throw new Exception("Header navigation index is required");
            }
            $client_cms_data = ClientPermission :: get_settings_data();
            if (isset($client_cms_data)) {
                $id = $client_cms_data['id'];
                $settings = $client_cms_data['settings'];
                $settings_data = json_decode($settings, true);
                if (isset($index)) {
                    unset($settings_data['header']['navigation'][$index]);
                }
                $encoded = json_encode($settings_data);
                $data_settings['settings'] = $encoded;
                ClientPermission::where('id', $id)->update($data_settings);
            }

            $result = [
                'success' => TRUE,
                'message' => 'Header Navigation Deleted successfully',
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    /**
     * Delete Header Navigation
     */
    public function footerNavigationDelete(Request $request) {
        try {
            $index = $request->index; // 0 or 1 or 2 
            $index_column = $request->columnType; // specifies for column1 or column2
            if (!isset($index) || !isset($index_column)) {
                throw new Exception("Footer Column navigation index is required");
            }
            $client_cms_data = ClientPermission :: get_settings_data();
            if (isset($client_cms_data)) {
                $id = $client_cms_data['id'];
                $settings = $client_cms_data['settings'];
                $settings_data = json_decode($settings, true);
                if (isset($index) && isset($index_column)) {
                    unset($settings_data['footer'][$index_column][$index]);
                }
                $encoded = json_encode($settings_data);
                $data_settings['settings'] = $encoded;
                ClientPermission::where('id', $id)->update($data_settings);
            }
            $result = [
                'success' => TRUE,
                'message' => 'Header Navigation Deleted successfully',
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    /**
     * Get Theme Header BG color for header BG color 1, BG color2, BG Color3
     */
    public function ThemeList(Request $request) {
        try {
            $data = [
                'themes' => ClientThemeColor::themeList(),
                'themes_data' => ClientThemeColor::themeListWithData()
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

    /**
     * Get languages for preview section
     */
    public function ClientLanguages(Request $request) {
        try {
            $data = [
                'languages' => ClientLanguage::languageList()
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

    /**
     * Get images 
     */
    public function ClientImages(Request $request) {
        try {
            $type = $request->type;
            if (!isset($type)) {
                throw new Exception("Specify section type of images");
            }
            //theme logo image
            if ($type == 1) {
                $imageURL = self :: getThemeLogoImageUploadUrl();
            }
            //preview bg image
            if ($type == 2) { //only png 320 by 568
                $imageURL = self :: getPreviewBgImageUploadUrl();
            }
            //preview play image
            if ($type == 3) { //only png 139 by 139
                $imageURL = self :: getPreviewPlayImageUploadUrl();
            }
            //preview load image
            if ($type == 4) { //only png 139 by 145
                $imageURL = self :: getPreviewLoadImageUploadUrl();
            }
            //login logo image
            if ($type == 5) { //only png 350 by 350
                $imageURL = self :: getLoginLogoImageUploadUrl();
            }

            $data = [
                'images' => ClientImages::imagesList($type, $imageURL)
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

    /**
     * upload image 
     */
    public function uploadClientImage(Request $request) {
        try {
            $data1 = $request->all();
            $type = $request->type;
            if (!isset($type)) {
                throw new Exception("Specify section type of images");
            }
            $image_file = $request->file('image_file');
            $data = array('type' => $type);
            $rules = ['image_file' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE];
            $validator = Validator::make($data1, $rules);
            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()->unique()));
            }

            //check for png extension as well
            if (!empty($image_file)) {
                $extension = $image_file->getClientOriginalExtension();
//                if ($extension != 'png') {
//                    throw new Exception("Please upload png type image");
//                }
            } else {
                throw new Exception("Please upload image");
            }
            //theme logo image
            if ($type == 1 && !empty($image_file)) { //only png 337 by 107
                $image1 = self::_uploadThemeLogoImage($image_file, self::getThemeLogoImageUploadPath(), 337, 107);
                $img_url = self :: getThemeLogoImageUploadUrl();
            }

            //preview bg image
            if ($type == 2 && !empty($image_file)) { //only png 320 by 568
                $image1 = self::_uploadImage($image_file, self::getPreviewBgImageUploadPath(), 320, 568);
                $img_url = self :: getPreviewBgImageUploadUrl();
            }

            //preview play image
            if ($type == 3 && !empty($image_file)) { //only png 139 by 139
                $image1 = self::_uploadImage($image_file, self::getPreviewPlayImageUploadPath(), 139, 139);
                $img_url = self :: getPreviewPlayImageUploadUrl();
            }

            //preview load image
            if ($type == 4 && !empty($image_file)) { //only png 139 by 145
                $image1 = self::_uploadImage($image_file, self::getPreviewLoadImageUploadPath(), 139, 145);
                $img_url = self :: getPreviewLoadImageUploadUrl();
            }

            //login logo image
            if ($type == 5 && !empty($image_file)) { //only png 350 by 350
                $image1 = self::_uploadImage($image_file, self::getLoginLogoImageUploadPath());
                $img_url = self :: getLoginLogoImageUploadUrl();
            }
            //login BG image
//            if ($type == 6 && !empty($image_file)) { //only png 350 by 350
//                $image1 = self::_uploadImage($image_file, self::getLoginBgImageUploadPath(), 350, 350);
//                $img_url = self :: getLoginBgImageUploadUrl();
//            }   

            if (isset($type) && !empty($image_file)) {
                $data['name'] = $image1;
                $createdId = ClientImages :: create($data)->id;
            }

            $url = $img_url . '/' . $image1;
            $uploaded_image = array('image' => $image1, 'imageUrl' => $url, 'id' => $createdId);
            $result = [
                'success' => TRUE,
                'data' => $uploaded_image
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteImage(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            ClientImages::where('id', $request->id)->delete();
            $result = [
                'success' => TRUE,
                'message' => ['Image successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function updateCmsImages(Request $request) {
        try {
            if (empty($request->appId)) {
//                throw new Exception('App Id not found');
            }
            if (empty($request->image)) {
                throw new Exception('Image name not found');
            }
            if (empty($request->type)) {
                throw new Exception('Image type not found');
            }
            $clientPermissionData = ClientPermission::get_data_by_app_id($request->appId);
            $settingData = json_decode($clientPermissionData->settings, true);
            if ($request->type == 1) {
                $settingData['theme']['theme_logo'] = $request->image;
            } else if ($request->type == 2) {
                $settingData['previewer']['prev_bg_image'] = $request->image;
            } else if ($request->type == 3) {
                $settingData['previewer']['prev_play_image'] = $request->image;
            } else if ($request->type == 4) {
                $settingData['previewer']['prev_load_image'] = $request->image;
            } else if ($request->type == 5) {
                $settingData['login_page']['login_logo'] = $request->image;
            }

            $data_settings['settings'] = json_encode($settingData, JSON_NUMERIC_CHECK);
            ClientPermission::where('id', $clientPermissionData->id)->update($data_settings);
            $result = [
                'success' => TRUE,
                'message' => ['Image successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function removeLoginBgImage(Request $request) {
        try {
            if (empty($request->appId)) {
//                throw new Exception('App Id not found');
            }

            $clientPermissionData = ClientPermission::get_data_by_app_id($request->appId);
            $settingData = json_decode($clientPermissionData->settings, true);
            $settingData['login_page']['login_bg_image'] = null;
            $data_settings['settings'] = json_encode($settingData, JSON_NUMERIC_CHECK);
            ClientPermission::where('id', $clientPermissionData->id)->update($data_settings);
            $result = [
                'success' => TRUE,
                'message' => ['Image successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function updateDefaultCmsSettings(Request $request) {
        try {

            if ($request->appId) {
                $appId = $request->appId;
            } else {
                $appId = 0;
            }
            $cms_data = ClientPermission::get_data_by_app_id($appId = 0);
            $cms_data_setting = json_decode($cms_data->settings, true);
            if ($cms_data_setting['theme']['theme_default_settings'] == 1) {
                $cms_data_setting['theme']['theme_default_settings'] = 0;
            } else {
                $cms_data_setting['theme']['theme_default_settings'] = 1;
            }
            $data_settings['settings'] = json_encode($cms_data_setting, JSON_NUMERIC_CHECK);
            ClientPermission::where('app_id', $appId)->update($data_settings);
            $result = [
                'success' => TRUE,
                'message' => ['Setting updated successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function defaultCmsSettings() {
        $cms_settings = array(
            'theme' => array(
                'theme_default_settings' => 1,
                'theme_logo' => '',
                'theme_page_title' => 'Tappit Technology',
                'theme_type' => '1',
                'theme_header_bg_color1' => '#808080',
                'theme_header_bg_color2' => '#FFFFFF',
                'theme_header_bg_color3' => '#0000ff',
            ),
            'header' => array(
                'header_link_color' => '#000000',
                'header_start_over' => 0,
                'navigation' => array(
                    0 => array(
                        'label' => "Analytics",
                        'link' => "stats_dashboard.php",
                        'action' => "1",
                        'class' => ""
                    ),
                    1 => array(
                        'label' => "Messages",
                        'link' => "message_dashboard.php",
                        'action' => "2",
                        'class' => ""
                    ),
                    2 => array(
                        'label' => "Account",
                        'link' => "account_dashboard.php",
                        'action' => "3",
                        'class' => ""
                    ),
                    3 => array(
                        'label' => "QR Codes",
                        'link' => "account_dashboard.php",
                        'action' => "1",
                        'class' => ""
                    ),
                    4 => array(
                        'label' => "Work Order",
                        'link' => "account_dashboard.php",
                        'action' => "4",
                        'class' => ""
                    ),
                )
            ),
            'steps' => array(
                'steps_functionality' => 1,
                'steps_content' => 1,
                'steps_appearance' => 1,
                'steps_publish' => 1,
                'steps_preview_tool' => 1,
                'steps_app_code_widget' => 1,
            ),
            'previewer' => array(
                'prev_language' => 2,
                'prev_bg_image' => '',
                'prev_play_image' => '',
                'prev_load_image' => ''
            ),
            'footer' => array(
                'footer_copyright_html' => 'Copyright. TappITtechnology Platform 2016. All Rights Reserved',
                'footer_bg_color' => '#000000',
                'footer_menu_header_color' => '#FFFFFF',
                'footer_menu_link_color' => '#808080',
                'navigationCol1' => array(
                    0 => array(
                        'label' => "Manage Your Mobile Apps",
                        'link' => "",
                        'action' => "1",
                        'class' => ""
                    )
                ),
                'navigationCol2' => array(
                    0 => array(
                        'label' => "Account Settings",
                        'link' => "",
                        'action' => "2",
                        'class' => ""
                    )
                )
            ),
            'login_page' => array(
                'login_logo' => '',
                'login_bg_color' => '#FFFFFF',
                'text_color_login' => '#000000',
                'login_bg_repeat' => 1,
                'login_bg_image' => '',
                'login_custom_html' => '',
                'login_use_custom' => 0
            )
        );
        $login_logo = $cms_settings['login_page']['login_logo'];
        if (!isset($login_logo) || $login_logo == "") {
            $pathtofile = URL::asset('resources/assets/images/email/logo.png');
            $cms_settings['login_page']['login_logo'] = $pathtofile;
        }

        $theme_logo = $cms_settings['theme']['theme_logo'];
        if (!isset($theme_logo) || $theme_logo == "") {
            $pathtofile = URL::asset('resources/assets/images/email/logo.png');
            $cms_settings['theme']['theme_logo'] = $pathtofile;
        }

        return $cms_settings;
    }

}
