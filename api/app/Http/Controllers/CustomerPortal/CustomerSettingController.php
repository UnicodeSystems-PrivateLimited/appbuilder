<?php

namespace App\Http\Controllers\CustomerPortal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\EventsTimeZone;
use App\Models\TpAppsConfig;
use App\Models\TpAppsTabEntity;
use App\Models\TabFunctions\MembershipUser;
use App\Models\TabFunctions\MembershipUserTemp;
use App\Models\TabFunctions\MembershipGroup;
use App\Models\UserProfileSettings;
use App\Helpers\Helper;
use URL;
use Illuminate;

class CustomerSettingController extends Controller
{
    const IMAGE_UPLOAD_PATH = 'app/public/user/profile';

    private static function _getCommonValidationRules(): array
    {
        return [
            'app_id' => 'required',
            'ios_url' => 'url',
            'android_url' => 'url',
            'terms_of_service_url' => 'required_if:terms_of_service,2|url',
            'privacy_policy_url' => 'required_if:privacy_policy,2|url',
//            'membership_username' => 'required_if:membership_type,2',
//            'membership_password' => 'required_if:membership_type,2'
        ];
    }

    /**
     * Init
     */
    public function init(Request $request)
    {
        try {
            if (!isset($request->appId) || empty($request->appId)) {
                throw new Exception('App ID not found.');
            }
            $appId = $request->appId;
            $settingData = TpAppsConfig::getAppConfigData($appId);
            $membershipData = TpAppsTabEntity::getMembershipTabInfoByAppId($appId);
            $groupList = [];
            $multipleUserList = [];
            $singleUserData = null;
            $guestUser = null;
            if ($membershipData) {
                $tabId = $membershipData->id;
                $groupList = MembershipGroup::getGroupList($tabId);
                $multipleUserList = MembershipUser::getUserList($tabId);
                $singleUserData = MembershipUser::getSingleUser($tabId, 2);
                $guestUser = MembershipUser:: getSingleUser($tabId, 1);
            }
            if (!empty($settingData)) {
                $settingData->config_data = json_decode($settingData->config_data, true);
                $settingData->app_screen_config_data = json_decode($settingData->app_screen_config_data, true);
            }
            $result = [
                'success' => true,
                'settingData' => $settingData,
                'membershipData' => $membershipData,
                'appTabs' => TpAppsTabEntity::getAppTabsForMembership($appId),
                'groupList' => $groupList,
                'multipleUserList' => $multipleUserList,
                'singleUserData' => $singleUserData,
                'guestUser' => $guestUser,
                'timezoneList' => EventsTimeZone::timezoneList()
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function saveAppConfig(Request $request)
    {
        try {
            $data['app_id'] = $request->app_id;
            $data['ios_url'] = $request->config_data['ios_url'];
            $data['android_url'] = $request->config_data['android_url'];
            $data['terms_of_service'] = $request->app_screen_config_data['terms_of_service'];
            $data['terms_of_service_url'] = $request->app_screen_config_data['terms_of_service_url'];
            $data['privacy_policy'] = $request->app_screen_config_data['privacy_policy'];
            $data['privacy_policy_url'] = $request->app_screen_config_data['privacy_policy_url'];
            $data['membership_login'] = $request->app_membership_settings_data['member_login'];
            $data['membership_type'] = $request->app_membership_settings_data['type'];
            $data['login_username'] = $request->single_member_login_details['user_name'];
            $data['login_password'] = $request->single_member_login_details['password'];


            $validator = Validator::make($data, self::_getCommonValidationRules());
            $validator->sometimes('login_username', 'required', function ($data) {
                return ($data['membership_type'] == 2 && $data['membership_login'] == true);
            });
            $validator->sometimes('login_password', 'required', function ($data) {
                return ($data['membership_type'] == 2 && $data['membership_login'] == true);
            });
            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()->unique()));
            }
            $membershipData = TpAppsTabEntity::getMembershipTabInfoByAppId($request->app_id);
            $appConfigData['app_id'] = $request->app_id;
            $appData = TpAppsConfig::where('app_id', $request->app_id)->first();
            if (empty($appData)) {
                $appConfigData['config_data'] = json_encode($request->config_data, JSON_NUMERIC_CHECK);
                $appConfigData['app_screen_config_data'] = json_encode($request->app_screen_config_data, JSON_NUMERIC_CHECK);
                TpAppsConfig::create($appConfigData);
            } else {
                $appConfigData['config_data'] = json_encode($request->config_data, JSON_NUMERIC_CHECK);
                $appConfigData['app_screen_config_data'] = json_encode($request->app_screen_config_data, JSON_NUMERIC_CHECK);
                TpAppsConfig::where('app_id', $request->app_id)->update($appConfigData);
            }

            //Membership Settings
            if ($membershipData) {
                $membershipSettings['settings'] = json_encode($request->app_membership_settings_data);
                TpAppsTabEntity::where('app_id', $request->app_id)->where('tab_func_id', 28)->update($membershipSettings);
                $tabId = $membershipData->id;
            } else {
                $membershipSettings['app_id'] = $request->app_id;
                $membershipSettings['tab_func_id'] = 28;
                $membershipSettings['title'] = 'Membership';
                $membershipSettings['sort_order'] = 0;
                $membershipSettings['content_sort_order'] = 0;
                $membershipSettings['icon_name'] = 'Absense';
                $membershipSettings['type'] = 2;
                $membershipSettings['status'] = 1;
                $membershipSettings['icon_type'] = 1;
                $membershipSettings['settings'] = json_encode($request->app_membership_settings_data, JSON_NUMERIC_CHECK);
                $id = TpAppsTabEntity::create($membershipSettings)->id;
                $tabId = $id;
            }

            //Save single user login detail when login type single selected
            if (($request->app_membership_settings_data['type'] == 2) && ($request->app_membership_settings_data['member_login'])) {
                //single user login
                $user_name = $request->single_member_login_details['user_name'];
                $password = $request->single_member_login_details['password'];
                $type = $request->app_membership_settings_data['type'];

                //check if username and password row exist in  tp_func_membership_user table for login_type field
                $user = MembershipUser:: getSingleUser($tabId, 2);

                $user_details = array('tab_id' => $tabId, 'user_name' => $user_name, 'password' => $password, 'login_type' => $type);

                if (!empty($user['id'])) {
                    // edit single user login
                    MembershipUser::where('id', $user['id'])->update($user_details);
                } else {
                    //add single user login
                    MembershipUser:: create($user_details);
                }
            }

            $result = [
                'success' => true,
                'message' => 'App setting successfully added.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    /**
     * Saves the image file and returns the saved file name.
     * @return string
     */
    private static function _uploadImage(Illuminate\Http\UploadedFile $image, string $uploadPath, $width, $height): string
    {
        $extension = $image->getClientOriginalExtension();
        $extension = $extension ?: 'jpg';
        $fileName = Helper::getMilliTimestamp() . '_user_profile_image.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
            ->resize($width, $height)
            ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    public static function getImageUploadPath(): string
    {
        return Helper::getUploadDirectoryPath(self::IMAGE_UPLOAD_PATH);
    }

    //upload url is used by model function while returning image from database
    public static function getImageUploadURL(): string
    {
        return Helper::getUploadDirectoryURL(self::IMAGE_UPLOAD_PATH);
    }

    public function saveUserSettings(Request $request)
    {
        try {
            $data = $request->all();
            if (!empty($request->picture)) {
                $image = $request->picture;
            }
            $validator = Validator::make($data, self::getUserProfileValidationRules(!empty($image) && $image instanceof Illuminate\Http\UploadedFile));

            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }

            // Save image
            if (!empty($image)) {
                if ($image instanceof Illuminate\Http\UploadedFile) {
                    $data['picture'] = self::_uploadImage($image, self::getImageUploadPath(), 140, 140);
                } else {
                    unset($data['picture']);
                }
            }

            if ($request->id) {
                UserProfileSettings::where('id', $request->id)->update($data);
                $result = [
                    'success' => true,
                    'message' => ['Profile successfully edited.'],
                ];
            } else {
                UserProfileSettings::create($data);
                $result = [
                    'success' => true,
                    'message' => ['Profile successfully added.'],
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

    public function getUserInfo(Request $request)
    {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            if (empty($request->deviceUUID)) {
                throw new Exception('Device UUID not found.');
            }
            $data = UserProfileSettings::getUserInfo($request->id, $request->deviceUUID);
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

    public function deleteUserImage(Request $request)
    {
        try {
            if ($request->imageType !== 'picture') {
                throw new Exception('Invalid URL');
            }
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }

            UserProfileSettings::where('app_id', $request->id)->update([$request->imageType => null]);

            $result = [
                'success' => true,
                'message' => ['Image successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function saveMembership(Request $request)
    {
        try {
            if (!isset($request->app_id) || empty($request->app_id)) {
                throw new Exception('App ID not found.');
            }

            $membershipData = TpAppsTabEntity::getMembershipTabInfoByAppId($request->app_id);
            //Membership Settings
            if ($membershipData) {
//                $membershipSettings['settings'] = json_encode($request->membsership_settings);
//                TpAppsTabEntity::where('app_id', $request->app_id)->where('tab_func_id', 28)->update($membershipSettings);
                $tabId = $membershipData->id;
            } else {
                $membershipSettings['app_id'] = $request->app_id;
                $membershipSettings['tab_func_id'] = 28;
                $membershipSettings['title'] = 'Membership';
                $membershipSettings['sort_order'] = 0;
                $membershipSettings['content_sort_order'] = 0;
                $membershipSettings['icon_name'] = 'Absense';
                $membershipSettings['type'] = 2;
                $membershipSettings['status'] = 1;
                $membershipSettings['icon_type'] = 1;
                $settings = $request->membsership_settings;
                $settings['member_login'] = false;
                $membershipSettings['settings'] = json_encode($settings);
                $id = TpAppsTabEntity::create($membershipSettings)->id;
                $tabId = $id;
            }

            $result = [
                'success' => true,
                'message' => 'App setting successfully added.',
                'data' => $tabId
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    private static function getUserProfileValidationRules(bool $validateForImage): array
    {
        $rules = [
            'app_id' => 'required|integer',
            'name' => 'max:256',
            'email' => 'email|max:256',
            'birth_month' => 'integer',
            'birth_day' => 'integer',
        ];

        if ($validateForImage) {
            $rules['picture'] = 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE;
        }

        return $rules;
    }
}
