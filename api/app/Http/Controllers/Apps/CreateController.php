<?php

namespace App\Http\Controllers\Apps;

use App\User;
use App\Models\TappitProfile;
use App\Models\TpAppsEntity;
use App\Models\AppPublishLog;
use App\Models\TpRegisteredDevice;
use App\Models\Users;
use App\Models\UsersGroups;
use App\Models\TpAppsTabEntity;
use App\Models\TpAppScreenshot;
use App\Models\TpAppPublish;
use App\Models\Display\GlobalStyle;
use App\Models\Display\DisplaySettingsHomeScreen;
use App\Models\TabFunctions\AroundUs;
use App\Models\TabFunctions\Language;
use Mail;
use App\Http\Controllers\Controller;
use Illuminate\Http\{
    Request,
    UploadedFile
};
use Intervention\Image\Facades\Image;
use App\Helpers\Helper;
use LaravelAcl\Authentication\Validators\ReminderValidator;
use LaravelAcl\Authentication\Services\ReminderService;
use LaravelAcl\Authentication\Interfaces\AuthenticateInterface;
use LaravelAcl\Authentication\Validators\UserValidator;
use LaravelAcl\Library\Exceptions\NotFoundException;
use LaravelAcl\Authentication\Exceptions\AuthenticationErrorException;
use LaravelAcl\Authentication\Exceptions\PermissionException;
use View;
use URL;
use Redirect;
use App;
use DB;
use Config;
use Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Pagination\Paginator;
use Exception;
use Hash;
use App\Models\TpLogActivity;
use App\Models\FirebaseAppCredentials;

class CreateController extends Controller {

    const APP_ICON_UPLOAD_PATH = 'app/public/app/icon';
    const SCREENSHOT_UPLOAD_PATH = 'app/public/app/screen_shot';
    const PHONE_SPLASH_SCREEN_PATH = 'app/public/app/splash_screen/phone';
    const TAB_SPLASH_SCREEN_PATH = 'app/public/app/splash_screen/tablet';
    const IPHONE_SPLASH_SCREEN_PATH = 'app/public/app/splash_screen/iphone';
    const SCREENSHOT_WIDTHS = [NULL, 640, 640, 750, 1242, 1536];
    const SCREENSHOT_HEIGHTS = [NULL, 960, 1136, 1334, 2208, 2048];
    const APP_BUNDLE_ID = "com.{{appCode}}.tappit";
    const MASTER_TABLES = ['mst_tp_tab_entity', 'mst_sub_tab_icons', 'mst_color_theme', 'mst_library_images', 'mst_global_header_images', 'mst_font_family', 'mst_form_field_types', 'mst_home_screen_header_imgs', 'mst_home_screen_sliders', 'mst_library_images_category', 'client_language', 'client_permission_theme_color', 'country_code_iso', 'groups', 'migrations', 'password_resets', 'permission', 'tappit_profile', 'throttle', 'tp_apps_tabs_icon', 'tp_func_event_timezone', 'users', 'users_groups', 'user_profile'];

    public function getAppList(Request $request, $currentPage = 1, $perPage = 10) {
        try {
            $authentication = App::make('authenticator');
            $user = $authentication->getLoggedUser();
            $response = [
                "success" => true,
            ];
            if ($user && $user->id) {
                Paginator::currentPageResolver(function () use ($currentPage) {
                    return $currentPage;
                });
                //if logged user is admin he can view all apps
                $user_permissions = Users:: user_group($user->id);
                $userType = $user_permissions[0]->userType;
                if (!empty($userType) && ($userType == 'superadmin' || $userType == 'admin')) {
                    $user_email = "";
                } else {
                    $user_email = $user->email;
                }
                $list = TpAppsEntity::getUserAppData($user_email, $request->search, $perPage, $userType);
                $response['data'] = $list;
            } else {
                throw new NotFoundException('Invalid Request');
            }
        } catch (NotFoundException $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function createNewApp(Request $request) {
        try {
            $authentication = App::make('authenticator');
            $user = $authentication->getLoggedUser();
            $response = [
                "success" => true,
            ];
            if ($user && $user->id) {
                $rules = array(
                    'app_name' => 'Required|unique:tp_apps_entity|Min:3|Max:80',
                    'app_code' => 'Required|unique:tp_apps_entity|Min:3|Max:80|regex:/[?!\pL\-]+/',
                    'app_icon_name' => 'Required',
                    'password' => 'Required|AlphaNum|Between:4,255',
                    'username' => 'Required|unique:tp_apps_entity|Min:4|Max:80|AlphaDash',
                    'client_name' => 'Required',
                    'client_email' => 'Required|Between:3,255|Email',
                    'client_phone' => 'Between:10,12',
                    'label' => 'Between:3,255|Alpha',
                    'ios_app_store_url' => 'Between:3,255|Url',
                    'ios_app_store_id' => 'Between:3,100',
                    'google_play_store_url' => 'Between:3,255|Url',
                    'html5_mobile_website_url' => 'Between:3,255|Url',
                );
                $globalSettings['header'] = json_encode([
                    'background_color' => "#000",
                    'background_opacity' => 100,
                    'text_color' => "#fff",
                    'shadow' => "#000",
                    'background_img' => 'null',
                ]);

                $globalSettings['lists'] = json_encode([
                    'section_bar' => "#000",
                    'section_text' => "#fff",
                    'row_bar' => "#000",
                    'row_text' => "#fff",
                    'even_row_bar' => "#000",
                    'even_row_text' => "#fff",
                ]);
                $globalSettings['features'] = json_encode([
                    'button_text' => "#fff",
                    'button_image' => "#000",
                    'feature_text' => "#000",
                    'background_color' => "#fff",
                ]);
                $globalSettings['fonts'] = json_encode([
                    'font_id' => 1,
                ]);

                $homeSettings['layout'] = json_encode([
                    'show_status_bar' => '1',
                    'home_layout' => 3,
                    'traditional_position' => 2,
                    'traditional_rows' => 1,
                    'traditional_tab_number' => 4,
                ]);
                $homeSettings['icon_color'] = json_encode([
                    'show_icon' => '1',
                    'icon_color' => null,
                    'enable_color' => '0',
                ]);
                $homeSettings['buttons'] = json_encode([
                    'background_tint' => "#fff",
                    'show_text' => '1',
                    'text_color' => "#000",
                    'background_img' => 'null',
                    'background_opacity' => 100,
                ]);
                $homeSettings['header'] = json_encode([
                    'background_tint' => "#000",
                    'background_opacity' => 100,
                    'background_img' => 'null',
                ]);
                $homeSettings['extra_buttons'] = json_encode([
                    'call_us' => "1",
                    'direction' => "1",
                    'tell_friend' => "1",
                ]);

                $validator = Validator::make($request->all(), $rules);
                if ($validator->fails()) {
                    throw new NotFoundException($validator->errors());
                } else {
                    $data = $request->all();
                    $data['created_by'] = $user->id;
                    $appId = TpAppsEntity::create($data)->id;
                    $created_at = date('Y-m-d h:i:s');
                    //create users table entry
//                    $password = Hash :: make($data['password']); 
                    $password = bcrypt($data['password']);

                    //CHECK IF client_email exists in table "users"
//                    $customer_email_exist = Users :: isCustomerByEmail($data['client_email']);
//                    if (!$customer_email_exist) {
                    //create entry to users table
                    $user_details = ['email' => $data['username'], 'password' => $password, 'permissions' => '', 'activated' => 1, 'banned' => 0, 'activation_code' => '', 'activated_at' => '', 'last_login' => '', 'persist_code' => '', 'reset_password_code' => '', 'protected' => '', 'created_at' => $created_at, 'updated_at' => $created_at];
                    $userId = Users::create($user_details)->id;

                    //create users_groups table entry
                    $user_group_details = ['user_id' => $userId, 'group_id' => 4];
                    UsersGroups::create($user_group_details);

                    if (isset($data['client_phone'])) {
                        $phone = $data['client_phone'];
                    } else {
                        $phone = '';
                    }
                    //create entry to tappit_profile
                    $user_profile = ['user_id' => $userId, 'code' => '', 'vat' => '', 'first_name' => $data['client_name'], 'last_name' => '', 'phone' => $phone, 'state' => '', 'city' => '', 'avatar' => '', 'country' => '', 'zip' => '', 'address' => '', 'created_at' => $created_at, 'updated_at' => $created_at];
                    TappitProfile:: create($user_profile);
//                    }

                    $globalSettings['app_id'] = $appId;
                    $homeSettings['app_id'] = $appId;
                    GlobalStyle::create($globalSettings);
                    DisplaySettingsHomeScreen::create($homeSettings);

                    //Save App Create Activity
                    $activityData['app_id'] = $appId;
                    $activityData['main_dashboard'] = 0;
                    $activityData['app_dashboard'] = 1;
                    $activityData['activity'] = "Hello And Welcome! We're so happy you created an application with Tappit.";
                    $activityData['activity_type'] = 2;

                    TpLogActivity:: create($activityData);

                    $response['message'][] = 'Apps Saved Successfully';
                }
            } else {
                throw new NotFoundException('Invalid Request');
            }
        } catch (NotFoundException $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function updateAppInfo(Request $request) {
        try {
            $authentication = App::make('authenticator');
            $user = $authentication->getLoggedUser();
            $response = [
                "success" => true,
            ];
            if ($user && $user->id) {
                $formData = $request->all();
                $formData['id'] = $request->id;
                $rules = array(
                    'id' => 'Required',
                    'app_name' => 'Required|unique:tp_apps_entity,app_name,' . $request->id . '|Min:3|Max:80',
                    'app_code' => 'Required|unique:tp_apps_entity,app_code,' . $request->id . '|Min:3|Max:80',
                    'app_icon_name' => 'Required',
                    'password' => 'Required|AlphaNum|Between:4,255',
                    'username' => 'Required|unique:tp_apps_entity,username,' . $request->id . '|Min:4|Max:80|AlphaDash',
                    'client_name' => 'Required',
                    'contact_email' => 'Email',
                    'contact_phone' => 'Between:10,12',
                    'client_email' => 'Required|Between:3,255|Email',
                    'client_phone' => 'Between:10,12',
                    'label' => 'Between:3,255|Alpha',
                    'ios_app_store_url' => 'Between:3,255|Url',
                    'ios_app_store_id' => 'Between:3,100',
                    'google_play_store_url' => 'Between:3,255|Url',
                    'html5_mobile_website_url' => 'Between:3,255|Url',
                );
                $validator = Validator::make($formData, $rules);
                if ($validator->fails()) {
                    throw new NotFoundException($validator->errors());
                } else {
                    unset($formData['icon_name']);
                    unset($formData['phone_splash_screen']);
                    unset($formData['tablet_splash_screen']);
                    unset($formData['iphone_splash_screen']);
                    $formData['created_by'] = $user->id;

                    //update users table entry
                    $created_at = date('Y-m-d h:i:s');
                    $user = TpAppsEntity:: getCustomerByAppid($request->id);
                    if (isset($user->userId)) {
                        $password = bcrypt($formData['password']);
                        $user_details = ['email' => $formData['username'], 'password' => $password, 'updated_at' => $created_at];
                        Users::where('id', $user->userId)->update($user_details);
                        //update tappit_profile
                        $user_profile = ['first_name' => $formData['client_name'], 'updated_at' => $created_at];
                        if (isset($formData['client_phone'])) {
                            $user_profile['phone'] = $formData['client_phone'];
                        }
                        TappitProfile::where('user_id', $user->userId)->update($user_profile);
                    }
                    TpAppsEntity::where('id', $request->id)->update($formData);

                    $response['message'][] = 'Apps Saved Successfully';
                }
            } else {
                throw new NotFoundException('Invalid Request');
            }
        } catch (NotFoundException $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function getAppInfo(Request $request) {
        try {
            $authentication = App::make('authenticator');
            $user = $authentication->getLoggedUser();
            $response = [
                "success" => true,
            ];
            if ($user && $user->id) {
                $list = TpAppsEntity::getAppData($request->id);
                $response['data'] = $list;
                $response['appBundleId'] = self::APP_BUNDLE_ID;
            } else {
                throw new NotFoundException('Invalid Request');
            }
        } catch (NotFoundException $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function getSelectAppList() {
        try {
            $response = [
                "success" => true,
            ];
            $list = TpAppsEntity::
            orderBy('app_name', 'ASC')
                ->get(array('app_name', 'app_code'));
            $response['data'] = $list;
        } catch (NotFoundException $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function createDuplicateApp(Request $request) {
        try {
            $response = [
                "success" => true,
            ];
            $formData = $request->all();
            $formData['id'] = $request->id;
            $rules = array(
                'source_app_id' => 'Required',
                'app_name' => 'Required|unique:tp_apps_entity|Min:3|Max:80',
                'app_code' => 'Required|unique:tp_apps_entity|Min:3|Max:80',
                'password' => 'Required|AlphaNum|Between:4,255',
                'username' => 'Required|unique:tp_apps_entity|Min:4|Max:80|AlphaDash',
            );
            $validator = Validator::make($formData, $rules);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            } else {
                $authentication = App::make('authenticator');
                $user = $authentication->getLoggedUser();
                $formData['created_by'] = $user->id;
                $sourceData = TpAppsEntity::getAppData($formData['source_app_id']);
                $finalData = $sourceData->toArray();
                $pathArray = explode('/', $finalData['icon_name']);
                $icon_name = end($pathArray);
                $finalData['icon_name'] = $icon_name;
                $finalData['app_name'] = $formData['app_name'];
                $finalData['app_code'] = $formData['app_code'];
                $finalData['password'] = $formData['password'];
                $finalData['username'] = $formData['username'];
                $finalData['source_app_id'] = $formData['source_app_id'];
                $finalData['created_at'] = date('Y-m-d H:i:s');
                $finalData['updated_at'] = null;

                //save customer detail
                $password = bcrypt($formData['password']);
                $created_at = date('Y-m-d h:i:s');
                $user_details = ['email' => $formData['username'], 'password' => $password, 'permissions' => '', 'activated' => 1, 'banned' => 0, 'activation_code' => '', 'activated_at' => '', 'last_login' => '', 'persist_code' => '', 'reset_password_code' => '', 'protected' => '', 'created_at' => $created_at, 'updated_at' => $created_at];
                $userId = Users::create($user_details)->id;
                //create users_groups table entry
                $user_group_details = ['user_id' => $userId, 'group_id' => 4];
                UsersGroups::create($user_group_details);
                if (isset($finalData['client_phone'])) {
                    $phone = $finalData['client_phone'];
                } else {
                    $phone = '';
                }
                //create entry to tappit_profile
                $user_profile = ['user_id' => $userId, 'code' => '', 'vat' => '', 'first_name' => $finalData['client_name'], 'last_name' => '', 'phone' => $phone, 'state' => '', 'city' => '', 'avatar' => '', 'country' => '', 'zip' => '', 'address' => '', 'created_at' => $created_at, 'updated_at' => $created_at];
                TappitProfile:: create($user_profile);
                $createdAppId = TpAppsEntity::create($finalData)->id;
                DB::transaction(function () use ($formData, $finalData, $createdAppId) {
                    $this->_createAppAndCopyTabs($formData, $finalData, $createdAppId);
                });

                $response['message'][] = 'Apps Saved Successfully';
                $response['appId'] = $createdAppId;
            }
        } catch (Exception $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function _createAppAndCopyTabs(array $formData, array $appData, int $createdAppId) {
        $globalSettings = (array)GlobalStyle::getAppGlobalStyleForCopy($appData['source_app_id']);
        $homeSettings = (array)DisplaySettingsHomeScreen::getAppSettingsForCopy($appData['source_app_id']);
        $globalSettings['app_id'] = $createdAppId;
        $homeSettings['app_id'] = $createdAppId;
        GlobalStyle::create($globalSettings);
        DisplaySettingsHomeScreen::create($homeSettings);

        // Copying of App Tabs
        if (!empty($formData['app_tab_ids'])) {
            $tabsToCopy = TpAppsTabEntity::getTabsToCopy($formData['app_tab_ids']);

            $appTabData = [];
            $languageTabData = [];
            $aroundusTabData = [];
            foreach ($tabsToCopy as $tabToCopy) {
                if ($tabToCopy->tab_func_code === 'aroundus_tab') {
                    $aroundusTabData[] = [
                        'app_id' => $createdAppId,
                        'tab_func_id' => $tabToCopy->tab_func_id,
                        'title' => $tabToCopy->title,
                        'sort_order' => $tabToCopy->sort_order,
                        'icon_name' => $tabToCopy->icon_name,
                        'type' => $tabToCopy->type,
                        'status' => $tabToCopy->status,
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => null,
                    ];
                } else if ($tabToCopy->tab_func_code === 'language') {
                    $languageTabData = [
                        'app_id' => $createdAppId,
                        'tab_func_id' => $tabToCopy->tab_func_id,
                        'title' => $tabToCopy->title,
                        'sort_order' => $tabToCopy->sort_order,
                        'icon_name' => $tabToCopy->icon_name,
                        'type' => $tabToCopy->type,
                        'status' => $tabToCopy->status,
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => null,
                    ];
                } else {
                    $appTabData = [
                        'app_id' => $createdAppId,
                        'tab_func_id' => $tabToCopy->tab_func_id,
                        'title' => $tabToCopy->title,
                        'sort_order' => $tabToCopy->sort_order,
                        'icon_name' => $tabToCopy->icon_name,
                        'type' => $tabToCopy->type,
                        'status' => $tabToCopy->status,
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => null,
                    ];
                    $createdTabID = TpAppsTabEntity::create($appTabData)->id;

                    // Copy data of tabs to clone app.
                    $this->copyTabData($tabToCopy->tab_func_code, $createdTabID, $tabToCopy->id);
                }
            }
            if (!empty($aroundusTabData)) {
                //insert 3 records into around us table
                foreach ($aroundusTabData as $aroundData) {
                    $aroundTabId = TpAppsTabEntity::create($aroundData)->id;
                    $category = array(
                        0 => array('category_name' => 'Category1', 'color' => '#f00', 'tab_id' => $aroundTabId),
                        1 => array('category_name' => 'Category2', 'color' => '#0f0', 'tab_id' => $aroundTabId),
                        2 => array('category_name' => 'Category3', 'color' => '#00f', 'tab_id' => $aroundTabId)
                    );
                    foreach ($category as $data) {
                        AroundUs::create($data);
                    }
                }
            }
            if (!empty($languageTabData)) {
                $languageTabId = TpAppsTabEntity::create($languageTabData)->id;
                $languageData['tab_id'] = $languageTabId;
                $content = array(
                    0 => array('id' => 31, 'name' => 'English', 'code' => 'en')
                );
                $languageData['content'] = json_encode($content, JSON_NUMERIC_CHECK);
                Language::create($languageData);
            }
        }
    }

    public function deleteApp(Request $request) {
        try {
            $response = [
                "success" => true,
            ];
            $rules = array(
                'id' => 'Required'
            );
            $formData['id'] = $request->id;
            $validator = Validator::make($formData, $rules);
            if ($validator->fails()) {
                throw new NotFoundException($validator->errors());
            } else {
                $row = TpAppsEntity::deleteApp($request->id);
                if (!$row) {
                    throw new NotFoundException('Nothing to delete.');
                } else {
                    $response['message'][] = 'Apps Deleted Successfully';
                }
            }
        } catch (NotFoundException $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function getAllAppList() {
        try {
            $result = [
                'success' => true,
                'data' => TpAppsEntity::getAllAppList(),
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public static function getImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::APP_ICON_UPLOAD_PATH);
    }

    public static function getImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::APP_ICON_UPLOAD_PATH);
    }

    public static function getScreenshotUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::SCREENSHOT_UPLOAD_PATH);
    }

    public static function getScreenshotUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::SCREENSHOT_UPLOAD_PATH);
    }

    public static function getPhoneSplashScreenUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::PHONE_SPLASH_SCREEN_PATH);
    }

    public static function getPhoneSplashScreenUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::PHONE_SPLASH_SCREEN_PATH);
    }

    public static function getTabletSplashScreenUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::TAB_SPLASH_SCREEN_PATH);
    }

    public static function getTabletSplashScreenUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::TAB_SPLASH_SCREEN_PATH);
    }

    public static function getIphoneSplashScreenUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::IPHONE_SPLASH_SCREEN_PATH);
    }

    public static function getIphoneSplashScreenUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::IPHONE_SPLASH_SCREEN_PATH);
    }

    public function saveAppIcon(Request $request) {
        try {
            $data = $request->all();
            $icon_name = $request->file('icon_name');
            $data['icon_name'] = $icon_name;

            if (empty($request->id)) {
                throw new Exception('App Id not found');
            }
            $rules = ['icon_name' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()->unique()));
            }


            // Save image
            if (!empty($data['icon_name'])) {
                $data['icon_name'] = self::_uploadImage($icon_name, self::getImageUploadPath(), 1024, 1024);
            } else {
                throw new Exception('App Icon is required');
            }

            if ($request->id) {
                TpAppsEntity::where('id', $request->id)->update($data);
                $result = [
                    'success' => true,
                    'message' => ['Image successfully added.'],
                ];
            }
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    private static function _uploadImage($image, string $uploadPath, $width, $height): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_app_icon.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
            ->resize($width, $height)
            ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    public function deleteIcon(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('App ID not found');
            }
            TpAppsEntity::where('id', $request->id)->update([$request->icon_name . 'icon_name' => null]);
            $result = [
                'success' => true,
                'message' => ['image successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function getScreenshots(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('APP ID/Type not found.');
            }
            $data = [
                'appIphoneFourScreenShot' => TpAppScreenshot::getScreenshot($request->id, 1),
                'appIphoneFiveScreenShot' => TpAppScreenshot::getScreenshot($request->id, 2),
                'appIphoneSixScreenShot' => TpAppScreenshot::getScreenshot($request->id, 3),
                'appIphoneSixPlusScreenShot' => TpAppScreenshot::getScreenshot($request->id, 4),
                'appTabletScreenShot' => TpAppScreenshot::getScreenshot($request->id, 5)
            ];
            $result = [
                'success' => true,
                'data' => $data
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function saveScreenshot(Request $request) {
        try {
            $data = $request->all();
            if (empty($request->app_id)) {
                throw new Exception('AppID not found.');
            }
            $screen_shot_1 = $request->file('screen_shot_1');
            $data['screen_shot_1'] = $screen_shot_1;
            $screen_shot_2 = $request->file('screen_shot_2');
            $data['screen_shot_2'] = $screen_shot_2;
            $screen_shot_3 = $request->file('screen_shot_3');
            $data['screen_shot_3'] = $screen_shot_3;
            $screen_shot_4 = $request->file('screen_shot_4');
            $data['screen_shot_4'] = $screen_shot_4;
            $screen_shot_5 = $request->file('screen_shot_5');
            $data['screen_shot_5'] = $screen_shot_5;
            $rules = [
                'screen_shot_1' => 'mimes:jpeg,jpg,png',
                'screen_shot_2' => 'mimes:jpeg,jpg,png',
                'screen_shot_3' => 'mimes:jpeg,jpg,png',
                'screen_shot_4' => 'mimes:jpeg,jpg,png',
                'screen_shot_5' => 'mimes:jpeg,jpg,png'
            ];
            $validationMessages = [
                'screen_shot_1.mimes' => "Invalid image",
                'screen_shot_2.mimes' => "Invalid image",
                'screen_shot_3.mimes' => "Invalid image",
                'screen_shot_4.mimes' => "Invalid image",
                'screen_shot_5.mimes' => "Invalid image",
            ];
            $validator = Validator::make($data, $rules, $validationMessages);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }

            for ($i = 1; $i <= 5; $i++) {
                if (!empty($data['screen_shot_' . $i])) {
                    $data['screen_shot_' . $i] = self::_uploadImage($data['screen_shot_' . $i], self::getScreenshotUploadPath(), self::SCREENSHOT_WIDTHS[$request->type], self::SCREENSHOT_HEIGHTS[$request->type]);
                } else {
                    unset($data['screen_shot_' . $i]);
                }
            }

            $data['type'] = $request->type;
            $data['app_id'] = $request->app_id;
            $screen = TpAppScreenshot::where('app_id', $data['app_id'])->where('type', $data['type'])->first();
            if ($screen) {
                TpAppScreenshot::where('app_id', $request->app_id)->where('type', $request->type)->update($data);
                $result = [
                    'success' => true,
                    'message' => ['ScreenShot image saved.']
                ];
            } else {
                TpAppScreenshot::create($data);
                $result = [
                    'success' => true,
                    'message' => ['ScreenShot image added.']
                ];
            }
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function saveSplashScreen(Request $request) {
        try {
            $data = $request->all();
            $phone_splash_screen = $request->file('phone_splash_screen');
            $data['phone_splash_screen'] = $phone_splash_screen;
            $tablet_splash_screen = $request->file('tablet_splash_screen');
            $data['tablet_splash_screen'] = $tablet_splash_screen;
            $iphone_splash_screen = $request->file('iphone_splash_screen');
            $data['iphone_splash_screen'] = $iphone_splash_screen;
            if (empty($request->id)) {
                throw new Exception('App Id not found');
            }

            // Save image
            if (!empty($phone_splash_screen)) {
                $data['phone_splash_screen'] = self::_uploadImage($phone_splash_screen, self::getPhoneSplashScreenUploadPath(), 640, 1136);
            } else {
                unset($data['phone_splash_screen']);
            }
            if (!empty($tablet_splash_screen)) {
                $data['tablet_splash_screen'] = self::_uploadImage($tablet_splash_screen, self::getTabletSplashScreenUploadPath(), 1536, 2048);
            } else {
                unset($data['tablet_splash_screen']);
            }
            if (!empty($iphone_splash_screen)) {
                $data['iphone_splash_screen'] = self::_uploadImage($iphone_splash_screen, self::getIphoneSplashScreenUploadPath(), 640, 1136);
            } else {
                unset($data['iphone_splash_screen']);
            }

            if ($request->id) {
                TpAppsEntity::where('id', $request->id)->update($data);
                $result = [
                    'success' => true,
                    'message' => ['Splash Screen successfully added.'],
                ];
            }
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteSplashImage(Request $request) {
        try {
            if ($request->imageType !== 'phone' && $request->imageType !== 'tablet' && $request->imageType !== 'iphone') {
                throw new Exception('Invalid URL');
            }
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            TpAppsEntity::where('id', $request->id)->update([$request->imageType . '_splash_screen' => null]);
            $result = [
                'success' => true,
                'message' => ['Splash Image successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function deleteScreenShot(Request $request) {
        try {
            if ($request->imageType !== '1' && $request->imageType !== '2' && $request->imageType !== '3' && $request->imageType !== '4' && $request->imageType !== '5') {
                throw new Exception('Invalid URL');
            }
            if (empty($request->appId)) {
                throw new Exception('ID not found');
            }
            TpAppScreenshot::where('app_id', $request->appId)->where('type', $request->imageType)->update([$request->imageName => null]);
            $result = [
                'success' => true,
                'message' => ['Screen Shot successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function appPublish(Request $request) {
        try {
            $data = $request->all();
            $product_option = array();
            $product_options_msg = '';
            $count = 0;
            $publish = TpAppPublish::where('app_id', $data['app_id'])->first();
            $appData = TpAppsEntity::where('id', $data['app_id'])->first();
            $validator = Validator::make(['email' => $data['email'], 'instruction' => $data['instruction'], 'app_id' => $data['app_id']], [
                'email' => 'Required|Email',
                'instruction' => 'Required',
                'app_id' => 'Required',
            ]);
            if (!empty($data['iphone_product']) || !empty($data['tab_product'])) {
                exec('/usr/local/itms/bin/iTMSTransporter -m lookupMetadata -u ' . $data['apple_user_name'] . ' -p ' . $data['apple_password'] . ' -vendor_id tappit_prev_app -destination /Applications/XAMPP/xamppfiles/htdocs/tap > /Applications/XAMPP/xamppfiles/htdocs/tap/error.log');
                $file = '/Applications/XAMPP/xamppfiles/htdocs/tap/error.log';
                $searchfor = 'Your Apple ID or password was entered incorrectly. (-20101)';
                // $searchforText = 'This Apple ID has been locked for security reasons. Visit iForgot to reset your account (https://iforgot.apple.com). (-20209)';
                $searchforText = 'Error';
                header('Content-Type: text/plain');
                $contents = file_get_contents($file);
                $pattern1 = preg_quote($searchfor, '/');
                $pattern1 = "/^.*$pattern1.*\$/m";
                $pattern2 = preg_quote($searchforText, '/');
                $pattern2 = "/^.*$pattern2.*\$/m";
                if (preg_match_all($pattern1, $contents, $matches)) {
                    $count++;
                }
                if (preg_match_all($pattern2, $contents, $matches)) {
                    $count++;
                }
            }

            if ($validator->fails()) {
                throw new NotFoundException($validator->errors());
            } else if (empty($data['android_product']) && empty($data['tab_product']) && empty($data['iphone_product'])) {
                throw new Exception('Please select one product type.');
            } else if (!empty($data['android_product']) && empty($appData->phone_splash_screen)) {
                throw new Exception('Please upload phone splash screen.');
            } else if (!empty($data['iphone_product']) && empty($appData->iphone_splash_screen)) {
                throw new Exception('Please upload iphone splash screen.');
            } else if (empty($appData['icon_name'])) {
                throw new Exception('App icon is required.');
            } else if ((!empty($data['iphone_product']) || !empty($data['tab_product'])) && $data['update_type'] == NULL) {
                throw new Exception('Please Select atleast one update option.');
            } else if ($count == 1) {
                throw new Exception('Your Apple ID or password was entered incorrectly.');
            } else {

                // Get versions number for each app
                $androidAppVersion = !empty($appData['android_app_version']) ? self::getNewVersion($appData['android_app_version']) : '1.0.0';
                $iosAppVersion = !empty($appData['ios_app_version']) ? self::getNewVersion($appData['ios_app_version']) : '1.0.0';

                if (!empty($data['android_product'])) {
                    $appPublishData['android_app_version'] = $androidAppVersion;
                    $apple_credit['android_app_version'] = $androidAppVersion;
                }
                if (!empty($data['iphone_product']) || !empty($data['tab_product'])) {
                    $appPublishData['ios_app_version'] = $iosAppVersion;
                    $appPublishData['ipa_request_status'] = 0;
                    $apple_credit['ios_app_version'] = $iosAppVersion;
                }

                // create app publish data
                if (empty($publish)) {
                    $appPublishData['app_id'] = $data['app_id'];
                    $appPublishData['android_product'] = $data['android_product'];
                    $appPublishData['tab_product'] = $data['tab_product'];
                    $appPublishData['iphone_product'] = $data['iphone_product'];
                    $appPublishData['update_type'] = $data['update_type'];
                    $appPublishData['instruction'] = $data['instruction'];
                    $appPublishData['email'] = $data['email'];
                    TpAppPublish::create($appPublishData);
                } else {
                    $appPublishData['android_product'] = $data['android_product'] ? $data['android_product'] : $publish['android_product'];
                    $appPublishData['tab_product'] = $data['tab_product'] ? $data['tab_product'] : $publish['tab_product'];
                    $appPublishData['iphone_product'] = $data['iphone_product'] ? $data['iphone_product'] : $publish['iphone_product'];
                    $appPublishData['update_type'] = $data['update_type'] ? $data['update_type'] : $publish['update_type'];
                    $appPublishData['instruction'] = $data['instruction'] ? $data['instruction'] : $publish['instruction'];
                    $appPublishData['email'] = $data['email'] ? $data['email'] : $publish['email'];
                    TpAppPublish::where('app_id', $data['app_id'])->update($appPublishData);
                }


                if (!empty($data['iphone_product']) || !empty($data['tab_product'])) {
                    //Make Apple Credit true
                    $apple_credit['apple_credit_used'] = 1;
                    $apple_credit['apple_user_name'] = $data['apple_user_name'];
                    $apple_credit['apple_password'] = $data['apple_password'];
                    $apple_credit['apple_dev_name'] = $data['apple_dev_name'];
                    $apple_credit['push_publish_email'] = $data['email'];
                    TpAppsEntity::where('id', $data['app_id'])->update($apple_credit);

                    //send email to client_email
                    $email = $data['email'];
                    $name = $appData['client_name'];
                    $app_name = $appData['app_name'];
                    $subject = 'Standard App Upload Request Recieved';
                    $processDays = $data['update_type'] == 1 ? '3-5 Business Days for Upload' : $data['update_type'] == 2 ? '1-2 Business Days for upload' : $data['update_type'] == 3 ? '3-5 Business Days for Upload' : $data['update_type'] == 4 ? '1-2 Business Days for upload' : $data['update_type'] == 5 ? '48 Hours for Review' : '5-15 Business Days for Completion';
                    $emailData = ['name' => $name, 'email' => $email, 'subject' => $subject, 'app_name' => $app_name, 'processDays' => $processDays];
                    $mail = Mail::send('emails.appUploadRequest', $emailData, function ($message) use ($emailData) {
                        $message->from('tappitmobapp@gmail.com', 'Tappit');
                        $message->to($emailData['email'])->subject($emailData['subject']);
                    });
                } else {
                    TpAppsEntity::where('id', $data['app_id'])->update($apple_credit);
                }


                //Get App Data
                $appData = TpAppsEntity::getAppData($data['app_id']);
                $appName = $appData['app_name'];
                $appCode = $appData['app_code'];

                if (!empty($data['android_product'])) {
                    array_push($product_option, 'Android');
                }
                if (!empty($data['iphone_product'])) {
                    array_push($product_option, 'iPhone');
                }
                if (!empty($data['tab_product'])) {
                    array_push($product_option, 'Tablet');
                }
                foreach ($product_option as $key => $val) {
                    if ($key == 0) {
                        $product_options_msg = $product_options_msg . $val;
                    } else {
                        $product_options_msg = $product_options_msg . ' and ' . $val;
                    }
                }
                //Save App Publish activity
                $activityData['app_id'] = $data['app_id'];
                $activityData['main_dashboard'] = 1;
                $activityData['app_dashboard'] = 1;
                $activityData['activity'] = 'Successfully published ' . $appName . ' [' . $appCode . '] for ' . $product_options_msg;
                $activityData['activity_type'] = 3;

                TpLogActivity:: create($activityData);
                $result = [
                    'success' => true,
                    'message' => ['Your Request is sent successfully.'],
                ];
                if (!empty($data['android_product'])) {
                    $this->sendAppBuildCURLRequest($data['app_id'], $data['email']);
                }
            }
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getPublishData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('AppID not found');
            }
            $publish = TpAppPublish::where('app_id', $request->id)->first();
            $result = [
                'success' => TRUE,
                'data' => $publish
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function getAppBuildData(Request $request) {
        if (empty($request->appId)) {
            throw new Exception('App ID not found.');
        }
        $imageDownloadURLs = [];
        $websiteTabIDs = TpAppsTabEntity::getWebsiteAndPDFTabIDs($request->appId);
        if ($websiteTabIDs) {
            $globalSettings = GlobalStyle::getGlobalStyle($request->appId);
            $globalSettings = json_decode($globalSettings->header);
            if (!empty($globalSettings->background_img) && $globalSettings->background_img != 'null') {
                $globalImageURL = App\Models\Display\GlobalHeaderBackgroundImages::getImageURLsByID([$globalSettings->background_img]);
                if (!empty($globalImageURL)) {
                    $imageDownloadURLs = $globalImageURL;
                }
            }
            $individualSettings = App\Models\Display\IndividualTabSettings::getTabSettingsByTabIds($websiteTabIDs);
            if (!empty($individualSettings)) {
                $backgroungImageIDs = [];
                foreach ($individualSettings as $setting) {
                    $setting = json_decode($setting->header);
                    if (!empty($setting->background_img) && $setting->background_img != 'null') {
                        $backgroungImageIDs[] = $setting->background_img;
                    }
                }
                $individualImageURLs = App\Models\Display\GlobalHeaderBackgroundImages::getImageURLsByID($backgroungImageIDs);
                $imageDownloadURLs = array_merge($imageDownloadURLs, $individualImageURLs);
            }
        }
        $result = parent::getSuccessResponse(NULL, TpAppsEntity::getAppData($request->appId));
        $result['imagesToDownload'] = $imageDownloadURLs;
        return response()->json($result);
    }

    public function sendAppBuildCURLRequest(string $appId, string $toEmail) {
        $baseURL = $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['SERVER_NAME'] . '/';
        $url = $baseURL . 'ion_src/build.php?app_id=' . $appId . '&email=' . urlencode($toEmail);
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 3,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'GET'
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);
        $errNo = curl_errno($curl);

        curl_close($curl);
        if ($err) {
            if ($errNo !== 28) {
                throw new Exception('Request failed. Please try again later.');
            }
        } else {
            $response = json_decode($response);
            if (!$response->success) {
                throw new Exception('Request failed. Please try again later.');
            }
        }
    }

    public function registerDevice(Request $request) {
        try {
            $rules = array(
                'app_code' => 'Required',
                'platform' => 'Required',
                'device_token' => 'Required',
                'device_uuid' => 'Required',
            );

            $validator = Validator::make($request->all(), $rules);
            if ($validator->fails()) {
                throw new NotFoundException($validator->errors());
            } else {
                $data = $request->all();
                //Get app_id from app_code
                $data['app_id'] = TpAppsEntity::getAppId($request->app_code);
                if ($data['app_id']) {
                    unset($data['app_code']);

                    $registeredDevice = TpRegisteredDevice::getRegisteredDevice($data['app_id'], $request->device_uuid);
                    if ($registeredDevice) {
                        TpRegisteredDevice::where('id', $registeredDevice)->update($data);
                    } else {
                        TpRegisteredDevice::create($data);
                    }

                    $result = [
                        'success' => true,
                        'message' => 'Device registered/updated successfully.'
                    ];
                } else {
                    throw new Exception('AppCode not valid.');
                }
            }
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function generateScreenshots(Request $request) {
        try {
            if (empty($request->appId)) {
                throw new Exception('App ID not found.');
            }
            $screenshots = TpAppScreenshot::getAllScreenshots($request->appId);

            $failureData = [];

            foreach ($screenshots as $value) {
                $emptyCount = 0;
                for ($i = 1; $i <= 5; $i++) {
                    if (empty($value->{'screen_shot_' . $i})) {
                        $emptyCount++;
                    }
                }
                if ($emptyCount < 3) {
                    $failureData[] = ['type' => $value->type, 'imagesToDelete' => 3 - $emptyCount];
                }
            }
            if (!empty($failureData)) {
                $result = [
                    'success' => FALSE,
                    'data' => $failureData
                ];
            } else {
                if (TpAppsEntity::isGeneratingScreenshots()) {
                    throw new Exception('Server is busy. Please try again after a few minutes.');
                }
                TpAppsEntity::updateData(['is_generating_screenshots' => 1], $request->appId);
                self::sendScreenshotGenerationRequest(TpAppsEntity::getAppCode($request->appId));
                $result = [
                    'success' => TRUE,
                    'message' => 'Screenshots are being generated. Please check back after a few minutes.',
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

    public static function sendScreenshotGenerationRequest(string $appCode) {
        $baseURL = $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['SERVER_NAME'] . '/';
        $url = $baseURL . 'ion_src_ios/screenshot.php?appcode=' . $appCode;
        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 2,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'GET'
        ]);

        curl_exec($curl);
        $err = curl_error($curl);
        $errNo = curl_errno($curl);
        curl_close($curl);
        if ($err && $errNo !== 28) {
            throw new Exception('Screenshot generation failed. Please try again later.');
        }
    }

    public function saveAutoScreenshot(Request $request) {
        try {
            if (empty($request->appCode) || empty($request->type)) {
                throw new Exception('App Code and Type are required.');
            }
            if (!$appID = TpAppsEntity::getAppId($request->appCode)) {
                throw new Exception('Invalid app code provided.');
            }
            if (empty($request->screenshots)) {
                throw new Exception('Screenshots not found.');
            }

            $screenshotsRowExists = TRUE;
            $savedScreenshots = TpAppScreenshot::getScreenshotNamesForSpecificType($appID, $request->type);
            if ($savedScreenshots) {
                $savedScreenshots = $savedScreenshots->toArray();
            } else {
                $screenshotsRowExists = FALSE;
                $savedScreenshots = [];
                for ($i = 1; $i <= 5; $i++) {
                    $savedScreenshots['screen_shot_' . $i] = NULL;
                }
            }

            foreach ($request->screenshots as $screenshot) {
                foreach ($savedScreenshots as $key => $savedScreenshot) {
                    // Upload new screenshot if there is a place empty for it in the saved screenshots.
                    if (!$savedScreenshot) {
                        $savedScreenshots[$key] = self::uploadScreenshot(
                            $screenshot, self::getScreenshotUploadPath(), self::SCREENSHOT_WIDTHS[$request->type], self::SCREENSHOT_HEIGHTS[$request->type]
                        );
                        break;
                    }
                }
            }

            if ($screenshotsRowExists) {
                TpAppScreenshot::updateByAppIDAndType($savedScreenshots, $appID, $request->type);
            } else {
                TpAppScreenshot::create(array_merge(['app_id' => $appID, 'type' => $request->type], $savedScreenshots));
            }

            $result = [
                'success' => TRUE,
                'message' => 'Screenshots successfully saved.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    private static function uploadScreenshot(UploadedFile $image, string $uploadPath, $width, $height): string {
        $extension = $image->getClientOriginalExtension();
        $extension = $extension ? $extension : 'jpg'; // For freaking blobs.
        $fileName = Helper::getMilliTimestamp() . '_app_icon.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
            ->resize($width, $height)
            ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    public function terminateScreenshotGeneration(Request $request) {
        try {
            if (empty($request->appCode)) {
                throw new Exception('App Code not found.');
            }
            TpAppsEntity::updateData(['is_generating_screenshots' => 0], $request->appCode, 'app_code');
            $result = [
                'success' => TRUE,
                'message' => 'Screenshot generation terminated for appcode: ' . $request->appCode . '.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function getScreenshotGenerationStatus(Request $request) {
        try {
            if (empty($request->appId)) {
                throw new Exception('App ID not found.');
            }
            $result['success'] = TRUE;
            $result['data']['is_generating_screenshots'] = TpAppsEntity::getScreenshotGenerationStatus($request->appId);
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function increasePushNotiCount(Request $request) {
        try {
            $rules = array(
                'app_code' => 'Required',
                'device_uuid' => 'Required',
            );

            $validator = Validator::make($request->all(), $rules);
            if ($validator->fails()) {
                throw new NotFoundException($validator->errors());
            } else {
                $data = $request->all();
                //Get app_id from app_code
                $data['app_id'] = TpAppsEntity::getAppId($request->app_code);
                if ($data['app_id']) {
                    unset($data['app_code']);
                    TpRegisteredDevice::incrementPushNotiCount($data['app_id'], $request->device_uuid);
                    $result = [
                        'success' => true,
                        'message' => 'push_noti count incremented  successfully.'
                    ];
                } else {
                    throw new Exception('AppCode not valid.');
                }
            }
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getAllIpaTabletRequest(Request $request, $currentPage = 1, $perPage = 10) {
        try {

            Paginator::currentPageResolver(function () use ($currentPage) {
                return $currentPage;
            });
            $result = [
                'success' => TRUE,
                'requestedAppList' => TpAppPublish::getAllIpaTabletRequest($request->type, $request->search, $perPage),
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function downloadScreenShotImages(Request $request) {
        try {
            if (empty($request->appId)) {
                throw new Exception('ID not found.');
            }
            $appId = $request->appId;
            $appcode = TpAppsEntity::getAppCode($appId);
            $appScreenShots = TpAppScreenshot::getAllScreenshots($appId);
            $zipper = new \Chumper\Zipper\Zipper;
            if (file_exists('storage/app/public/app/' . $appcode . '.zip')) {
                unlink('storage/app/public/app/' . $appcode . '.zip');
            }
            foreach ($appScreenShots as $key => $appScreenShot) {
                if ($appScreenShot->type == 1) {
                    $folder_name = 'Iphone 4';
                } else if ($appScreenShot->type == 2) {
                    $folder_name = 'Iphone 5';
                } else if ($appScreenShot->type == 3) {
                    $folder_name = 'Iphone 6';
                } else if ($appScreenShot->type == 4) {
                    $folder_name = 'Iphone 6 Plus';
                } else {
                    $folder_name = 'Tablet';
                }
                if ($appScreenShot->screen_shot_1) {
                    $zipper->make('storage/app/public/app/' . $appcode . '.zip')->folder($folder_name)->add('storage/app/public/app/screen_shot/' . $appScreenShot->screen_shot_1);
                }
                if ($appScreenShot->screen_shot_2) {
                    $zipper->make('storage/app/public/app/' . $appcode . '.zip')->folder($folder_name)->add('storage/app/public/app/screen_shot/' . $appScreenShot->screen_shot_2);
                }
                if ($appScreenShot->screen_shot_3) {
                    $zipper->make('storage/app/public/app/' . $appcode . '.zip')->folder($folder_name)->add('storage/app/public/app/screen_shot/' . $appScreenShot->screen_shot_3);
                }
                if ($appScreenShot->screen_shot_4) {
                    $zipper->make('storage/app/public/app/' . $appcode . '.zip')->folder($folder_name)->add('storage/app/public/app/screen_shot/' . $appScreenShot->screen_shot_4);
                }
                if ($appScreenShot->screen_shot_5) {
                    $zipper->make('storage/app/public/app/' . $appcode . '.zip')->folder($folder_name)->add('storage/app/public/app/screen_shot/' . $appScreenShot->screen_shot_5);
                }
            }
            $zipper->close();
            return response()->download('storage/app/public/app/' . $appcode . '.zip');
        } catch (Exception $ex) {
            echo $ex->getMessage();
        }
    }

    public function updateAppPublishInfo(Request $request) {
        try {
            $authentication = App::make('authenticator');
            $user = $authentication->getLoggedUser();
            $count = 0;
            $response = [
                "success" => true,
            ];
            if ($user && $user->id) {
                $formData = $request->all();
                $formData['id'] = $request->id;
                $rules = array(
                    'id' => 'Required',
                    'apple_user_name' => 'Required',
                    'apple_dev_name' => 'Required',
                    'apple_password' => 'Required',
                    'push_publish_email' => 'Required',
                );

                $validator = Validator::make($formData, $rules);
                if (!empty($formData['apple_user_name']) && !empty($formData['apple_password'])) {
                    exec('/usr/local/itms/bin/iTMSTransporter -m lookupMetadata -u ' . $formData['apple_user_name'] . ' -p ' . $formData['apple_password'] . ' -vendor_id tappit_prev_app -destination /Applications/XAMPP/xamppfiles/htdocs/tap > /Applications/XAMPP/xamppfiles/htdocs/tap/error.log');
                    $file = '/Applications/XAMPP/xamppfiles/htdocs/tap/error.log';
                    $searchfor = 'Your Apple ID or password was entered incorrectly. (-20101)';
                    $searchforText = 'This Apple ID has been locked for security reasons. Visit iForgot to reset your account (https://iforgot.apple.com). (-20209)';
                    header('Content-Type: text/plain');
                    $contents = file_get_contents($file);
                    $pattern1 = preg_quote($searchfor, '/');
                    $pattern1 = "/^.*$pattern1.*\$/m";
                    $pattern2 = preg_quote($searchforText, '/');
                    $pattern2 = "/^.*$pattern2.*\$/m";
                    if (preg_match_all($pattern1, $contents, $matches)) {
                        $count++;
                    }
                    if (preg_match_all($pattern2, $contents, $matches)) {
                        $count++;
                    }
                }
                if ($validator->fails()) {
                    throw new NotFoundException($validator->errors());
                } else if (count == 1) {
                    throw new Exception('Your Apple ID or password was entered incorrectly.');
                } else {
                    TpAppsEntity::where('id', $request->id)->update($formData);
                    $response['message'][] = 'Apps PushInfo Updated Successfully';
                }
            } else {
                throw new NotFoundException('Invalid Request');
            }
        } catch (NotFoundException $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function getAppPublishLog(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            $appId = $request->id;
            $appPublishLog = AppPublishLog::getAppPublishLog($appId);
            $result = [
                'success' => true,
                'appPublishLog' => $appPublishLog,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function cleanDatabase(Request $request) {
        try {

            $dbName = Config::get('database.connections.mysql.database');
            $dbName = 'Tables_in_' . $dbName;
            $tables = TpAppsEntity::getAllTableList();
            $trancateTables = [];
            foreach ($tables as $key => $table) {
                if (!in_array($table->$dbName, self::MASTER_TABLES)) {
                    array_push($trancateTables, $table->$dbName);
                }
            }
            TpAppsEntity::clearAllTablesData($trancateTables);
            $result = [
                'success' => true,
                'appPublishLog' => 'success',
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public static function getNewVersion(string $currentVersion): string {
        $versionAraay = explode('.', $currentVersion);
        if ($versionAraay[2] == 9) {
            $versionAraay[2] = 0;
            if ($versionAraay[1] == 9) {
                $versionAraay[1] = 0;
                $versionAraay[0] = $versionAraay[0] + 1;
            } else {
                $versionAraay[1] = $versionAraay[1] + 1;
            }
        } else {
            $versionAraay[2] = $versionAraay[2] + 1;
        }
        $updatedVersion = implode('.', $versionAraay);
        return $updatedVersion;
    }

    public function markDoneIpaRequest(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $appPublishData['ipa_request_status'] = 1;
            TpAppPublish::where('id', $request->id)->update($appPublishData);
            $result = [
                'success' => TRUE,
                'message' => 'Mark as done successfully.',
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function sendQueryResponseEmail(Request $request) {
        try {
            if (empty($request->client_email)) {
                throw new Exception('email id not found.');
            }
            if (empty($request->email_body)) {
                throw new Exception('email body not found.');
            }
            if (empty($request->subject)) {
                throw new Exception('email subject not found.');
            }
            $data = $request->all();
            $emailType = $data['email_type'] == 1 ? 'Query' : 'Response';
            $email = $data['client_email'];
            $app_name = $data['app_name'];
            $subject = $emailType . '-' . $data['subject'];
            $body = $data['email_body'];
            $emailData = ['email' => $email, 'subject' => $subject, 'app_name' => $app_name, 'body' => $body];
            $mail = Mail::send('emails.appIpaRequestQuery', $emailData, function ($message) use ($emailData) {
                $message->from('tappitmobapp@gmail.com', 'Tappit');
                $message->to($emailData['email'])->subject($emailData['subject']);
            });

            $result = [
                'success' => TRUE,
                'message' => 'Mail send successfully.',
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getRequestByAppId(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('Id not found');
            }
            $requestData = TpAppPublish::getIpaRequestByAppId($request->id);
            $result = [
                'success' => TRUE,
                'requestData' => $requestData,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getAppPublishistoryByAppId(Request $request) {
        try {
            if (empty($request->app_id)) {
                throw new Exception('AppId not found');
            }
            $data = TpAppPublish::getAppPublishHistory($request->app_id);
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

    public function prepareAppForIOS(Request $request) {
        try {
            if (empty($request->app_id)) {
                throw new Exception('AppId not found');
            }
            if(!empty($request->app_id)) {
                $serverKeyData = FirebaseAppCredentials::getAppServerKey($request->app_id);
                if(!$serverKeyData) {
                    throw new Exception('Please fill push notification credentials before preparing app.');
                }
            }
            $baseURL = $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['SERVER_NAME'] . '/';
            $url = $baseURL . 'ios_build/ios_build.php?app_id=' . $request->app_id;
            $curl = curl_init();

            curl_setopt_array($curl, array(
                CURLOPT_URL => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => "",
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 300,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'GET'
            ));

            $response = curl_exec($curl);
            $err = curl_error($curl);

            curl_close($curl);
            if ($err) {
                throw new Exception('Request failed. Please try again later.');
            }
            $response = json_decode($response);
            if (!$response->success) {
                throw new Exception($response->message);
            }
            $result = [
                'success' => TRUE,
                'message' => 'App prepared successfully'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    private function copyTabData(string $tabFuncCode, int $createdTabID, int $copiedTabID) {
        switch ($tabFuncCode) {
            case 'email_forms':
                $this->copyEmailFormsTabData($createdTabID, $copiedTabID);
                break;
            case 'website_tab':
                $this->copyWebsiteTabData($createdTabID, $copiedTabID);
                break;
        }
    }

    private function copyEmailFormsTabData(int $createdTabID, int $copiedTabID) {
        $forms = App\Models\TabFunctions\EmailFormsTab::getFormData($copiedTabID);
        $copiedFormID = NULL;
        $fieldInsertData = [];
        foreach ($forms as $form) {
            if ($copiedFormID !== $form->id) {
                $formInsertData = (array)$form;
                $formInsertData['tab_id'] = $createdTabID;
                // Remove 'id' and fields data keys form from form insert data
                $removeKeys = ['id', 'field_type_id', 'form_id', 'properties', 'field_sort_order'];
                foreach ($removeKeys as $key) {
                    unset($formInsertData[$key]);
                }
                $createdFormId = App\Models\TabFunctions\EmailFormsTab::create($formInsertData)->id;
                $copiedFormID = $form->id;
            }
            $fieldInsertData[] = [
                'form_id' => $createdFormId,
                'field_type_id' => $form->field_type_id,
                'properties' => $form->properties,
                'sort_order' => $form->field_sort_order,
            ];
        }
        if (!empty($fieldInsertData)) {
            App\Models\TabFunctions\EmailFormFields::insert($fieldInsertData);
        }
    }

    private function copyWebsiteTabData(int $createdTabID, int $copiedTabID) {
        $websites = App\Models\TabFunctions\WebsiteTab::getDataForCloning($copiedTabID);
        $insertData = [];
        foreach ($websites as $website) {
            $website['tab_id'] = $createdTabID;
            $insertData[] = $website;
        }
        if (!empty($insertData)) {
            App\Models\TabFunctions\WebsiteTab::insert($insertData);
        }
    }

}
