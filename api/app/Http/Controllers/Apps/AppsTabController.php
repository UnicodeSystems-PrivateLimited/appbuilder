<?php
namespace App\Http\Controllers\Apps;

use App\Models\TpAppsTabEntity;
use App\Models\TpAppsEntity;
use App\Models\MstTpTabEntity;
use App\Models\TabFunctions\EmailFormsTab;
use App\Models\TabFunctions\ContactUs;
use App\Models\TabFunctions\WebsiteTab;
use App\Models\TabFunctions\PDFTab;
use App\Models\TabFunctions\AroundUs;
use App\Models\Display\DisplaySettingsHomeScreen;
use App\Models\Display\ButtonBackgroundImages;
use App\Models\Display\SubTabIcons;
use App\Models\Display\HomeScreenHeadersBgImgs;
use App\Models\Display\SubTabs;
use App\Models\Display\GlobalStyle;
use App\Models\Display\GlobalHeaderBackgroundImages;
use App\Models\Display\GlobalFontFamily;
use App\Models\Display\IndividualTabSettings;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App;
use Illuminate\Support\Facades\Validator;
use Exception;
use Intervention\Image\Facades\Image;
use App\Helpers\Helper;
use App\Models\Display\HomeScreenSliders;
use App\Models\TabFunctions\TabTitleLanguages;
use App\Models\TpAppsConfig;
use App\Models\TabFunctions\Language;
use App\Models\MstTpAppsTabsIcon;
use App\Models\FirebaseAppCredentials;
use App\Http\Controllers\TabFunctions\PushNotificationController;

class AppsTabController extends Controller
{

    protected $authenticator;

    const CUSTOM_ICON_FOLDER_NAME = 'custom/';
    const COLOR_ICON_FOLDER_NAME = 'color/';
    const PHOTO_ICON_FOLDER_NAME = 'photos/';

    public function __construct()
    {
        $this->authenticator = App::make('authenticator');
    }

    public function createAppsTab(Request $request)
    {
        try {
            $formData = $request->all();
            if (isset($formData['active'])) {
                unset($formData['active']);
            }
            $iconImage = $request->file('icon_image');
            $rules = [
                'app_id' => 'required|integer',
            ];
            $formData['icon_image'] = $iconImage;
            $formData['icon_type'] = $request->icon_type;
            $validator = Validator::make(
                $formData,
                // BE CAREFUL: If a key conflict arises, array_merge() will keep the value from the right
                // array, and ignore that from the left one.
                array_merge($this->_getCommonValidationRules(), $rules),
                $this->_getValidationMessages()
            );
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }

            if (!empty($iconImage)) {
                $formData['icon_name'] = self::_uploadIcon($iconImage);
                $formData['type'] = TpAppsTabEntity::ICON_TYPE_CUSTOM;
            }
            else {
                if (empty($formData['icon_name'])) {
                    // Neither predefined nor custom icon image is provided.
                    throw new Exception('Tab Icon not found.');
                }
                else {
                    if ($formData['icon_type'] == MstTpAppsTabsIcon::TYPE_COLOR) {
                        $formData['icon_name'] = self::COLOR_ICON_FOLDER_NAME . $formData['icon_name'];
                        $formData['type'] = TpAppsTabEntity::ICON_TYPE_CUSTOM;
                    } else if ($formData['icon_type'] == MstTpAppsTabsIcon::TYPE_PHOTOS) {
                        $formData['icon_name'] = self::PHOTO_ICON_FOLDER_NAME . $formData['icon_name'];
                        $formData['type'] = TpAppsTabEntity::ICON_TYPE_CUSTOM;
                    } else {
                        $formData['type'] = TpAppsTabEntity::ICON_TYPE_PREDEFINED;
                    }
                }
            }
            unset($formData['icon_image']);

            //check if membership tab exists
            $app_tab_detail = TpAppsTabEntity::getAppTabDetail($formData['app_id'], $formData['tab_func_id']);
            if (!empty($app_tab_detail) && $app_tab_detail->tab_func_code === 'membership') {
                throw new Exception('You are not allowed to add two or more Membership tabs.');
            }

            //check if inbox tab exists
            if (!empty($app_tab_detail) && $app_tab_detail->tab_func_code === 'inbox') {
                throw new Exception('You are not allowed to add two or more Inbox tabs.');
            }

            //check if Language tab exists
            if (!empty($app_tab_detail) && $app_tab_detail->tab_func_code === 'language') {
                throw new Exception('You are not allowed to add two or more Language tabs.');
            }


            $createdId = TpAppsTabEntity::create($formData)->id;
            $tabData = TpAppsTabEntity::getAppTabInfo($createdId);
            $tab_func_id = $tabData->tab_func_id;

            $tab_info = MstTpTabEntity::getTabInfo($tab_func_id);

            $tab_code = $tab_info[0]->tab_code;
            if ($tab_code == 'aroundus_tab') {
                //insert 3 records into around us table
                $category = array(
                    0 => array('category_name' => 'Category1', 'color' => '#f00', 'tab_id' => $createdId),
                    1 => array('category_name' => 'Category2', 'color' => '#0f0', 'tab_id' => $createdId),
                    2 => array('category_name' => 'Category3', 'color' => '#00f', 'tab_id' => $createdId)
                );
                foreach ($category as $data) {
                    AroundUs::create($data);
                }
            }
            if ($tab_code == 'language') {
                $languageData['tab_id'] = $createdId;
                $content = array(
                    0 => array('id' => 31, 'name' => 'English', 'code' => 'en')
                );
                $languageData['content'] = json_encode($content, JSON_NUMERIC_CHECK);
                Language::create($languageData);
            }

            if ($tab_code == 'shopping_cart') {
                TpAppsTabEntity::storeDefaultShoppingCartData($createdId);
            }

            if ($tab_code == 'food_ordering') {
                TpAppsTabEntity::storeDefaultFoodOrderingData($createdId);
            }

            $response = [
                'success' => TRUE,
                'tabData' => $tabData,
                'message' => ['Apps Tab successfully created.'],
            ];
        } catch (Exception $ex) {
            $response = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($response);
    }

    public function getAppTabs(Request $request)
    {
        try {
            if (empty($request->id)) {
                throw new Exception('App ID not found.');
            }
            $all = (isset($request->all) ? $request->all : NULL);
            $tabData = TpAppsTabEntity::getActiveInactiveTabs($request->id, $all);
            $response = [
                'success' => TRUE,
                'data' => $tabData,
            ];
        } catch (Exception $ex) {
            $response = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($response);
    }

    public function getAppTabInfo(Request $request)
    {
        try {
            if (empty($request->id)) {
                throw new Exception('App ID not found.');
            }
            $tabData = TpAppsTabEntity::getAppTabInfo($request->id);
            $response = [
                'success' => TRUE,
                'data' => $tabData,
            ];
        } catch (Exception $ex) {
            $response = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($response);
    }

    public function updateAppsTab(Request $request)
    {
        try {
            $formData = $request->all();
            if (isset($formData['active'])) {
                unset($formData['active']);
            }

            $tabModel = TpAppsTabEntity::find($request->id);
            if ($tabModel->tab_func_id != $request->tab_func_id) {
                throw new Exception('Sorry. Cannot change tab function.');
            }
            $iconImage = $request->file('icon_image');
            $rules = [
                'id' => 'required|integer',
            ];
            $formData['icon_image'] = $iconImage;
            $validator = Validator::make(
                $formData,
                // BE CAREFUL: If a key conflict arises, array_merge() will keep the value from the right
                // array, and ignore that from the left one.
                array_merge($this->_getCommonValidationRules(), $rules),
                $this->_getValidationMessages()
            );
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }

            if (!empty($iconImage)) {
                $formData['icon_name'] = self::_uploadIcon($iconImage);
                $formData['type'] = TpAppsTabEntity::ICON_TYPE_CUSTOM;
            }
            else {
//                if (empty($formData['icon_name'])) {
//                    // If the icon_name key is given, but it has no value. Then there's
//                    // no need to update it.
//                    unset($formData['icon_name']);
//                } else {
//                    $formData['type'] = TpAppsTabEntity::ICON_TYPE_PREDEFINED;
//                }
                if ($formData['is_color_icon_update']) {
                    $formData['icon_name'] = self::COLOR_ICON_FOLDER_NAME . $formData['icon_name'];
                    $formData['type'] = TpAppsTabEntity::ICON_TYPE_CUSTOM;
                }
                if ($formData['is_photo_icon_update']) {
                    $formData['icon_name'] = self::PHOTO_ICON_FOLDER_NAME . $formData['icon_name'];
                    $formData['type'] = TpAppsTabEntity::ICON_TYPE_CUSTOM;
                }
            }
            unset($formData['icon_image']);
            unset($formData['is_color_icon_update']);
            unset($formData['is_photo_icon_update']);

            TpAppsTabEntity::where('id', $request->id)->update($formData);
            $response = [
                'success' => TRUE,
                'message' => ['Apps Tab successfully updated.'],
            ];
        } catch (Exception $ex) {
            $response = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($response);
    }

    /**
     * Sorts and updates the statuses of App Tabs
     *
     * @param Request $request
     */
    public function sortAppTabs(Request $request)
    {
        try {
            $formData = $request->all();
            if (empty($formData['activeTabs']) && empty($formData['inactiveTabs'])) {
                throw new Exception('Either of active tabs or inactive tabs should be provided.');
            }
            $activeUpdateData = [];
            $inactiveUpdateData = [];
            $i = 1;
            foreach ($formData['activeTabs'] as $tabId) {
                $activeUpdateData[$tabId] = ['status' => TpAppsTabEntity::STATUS_ENABLED, 'content_sort_order' => $i++];
            }
            $i = 1;
            foreach ($formData['inactiveTabs'] as $tabId) {
                $inactiveUpdateData[$tabId] = ['status' => TpAppsTabEntity::STATUS_DISABLED, 'content_sort_order' => $i++];
            }

            // '+' operator is used to merge the 2 arrays because array_merge() would
            // reorder the keys in numerical order. And keeping the original keys is
            // necessary here.
            TpAppsTabEntity::updateMultiple($activeUpdateData + $inactiveUpdateData);
            $result = [
                'success' => TRUE,
                'message' => ['Apps Tab updated successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteTabs(Request $request)
    {
        try {
            if (empty($request->id)) {
                throw new Exception('Nothing to delete.');
            }
            else {
                TpAppsTabEntity::deleteAppTab($request->id);
                $result = [
                    'success' => TRUE,
                    'message' => ['Apps Tab deleted successfully.'],
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

    public function changeStatus(Request $request)
    {
        try {
            if (empty($request->ids)) {
                throw new Exception('Ids not found.');
            }
            if (empty($request->status)) {
                throw new Exception('Status not found.');
            }
            if ($request->status != TpAppsTabEntity::STATUS_ENABLED && $request->status != TpAppsTabEntity::STATUS_DISABLED) {
                throw new Exception('Status not valid.');
            }
            TpAppsTabEntity::updateStatuses($request->ids, $request->status);
            $result = [
                'success' => TRUE,
                'message' => ['Apps Tab updated successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getAppTabsForContent(Request $request)
    {
        try {
            if (empty($request->id)) {
                throw new Exception('App ID not found.');
            }
            $tabData = TpAppsTabEntity::getAppTabsForContent($request->id);
            $response = [
                'success' => TRUE,
                'data' => $tabData,
            ];
        } catch (Exception $ex) {
            $response = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($response);
    }

    public function appGetway(Request $request)
    {
        try {
            if (empty($request->tabId) && empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            if (empty($request->tabCode) && empty($request->tabCode)) {
                throw new Exception('Tab Code not found.');
            }
            $res = [];
            switch ($request->tabCode) {
                case 'contact_us' :
                    $count = ContactUs::IsSingleEntry($request->tabId);
                    if ($count === 1) {
                        $res = ContactUs::getFirstContactUsLocationInfo($request->tabId);
                    }
                    break;
                case 'email_forms' :
                    $count = EmailFormsTab::IsSingleEntry($request->tabId);
                    $titleFieldName = 'title';
                    if ($count === 1) {
                        $res = EmailFormsTab::getFirstFormInfo($request->tabId);
                    }
                    break;
                case 'website_tab' :
                    $count = WebsiteTab::IsSingleEntry($request->tabId);
                    $titleFieldName = 'name';
                    if ($count === 1) {
                        $res = WebsiteTab::getFirstWebsiteData($request->tabId);
                        $isPrintingAllowed = 'is_printing_allowed';
                        $url = 'url';
                    }
                    break;
                case 'pdf_tab' :
                    $count = PDFTab::IsSingleEntry($request->tabId);
                    $titleFieldName = 'name';
                    if ($count === 1) {
                        $res = PDFTab::getFirstItemData($request->tabId);
                        $isPrintingAllowed = 'is_printing_allowed';
                        $url = 'url';
                    }
                    break;
            }
            if (!empty($res)) {
                $data = [
                    'is_single_entry' => TRUE, 'id' => $res['id'],
                    'title' => isset($titleFieldName) ? $res[$titleFieldName] : null,
                    'is_printing_allowed' => isset($isPrintingAllowed) ? $res[$isPrintingAllowed] : null,
                    'url' => isset($url) ? $res[$url] : null
                ];

                if (isset($res->is_donation_request)) {
                    $data['is_donation_request'] = $res->is_donation_request;
                }

                if (isset($res->use_safari_webview)) {
                    $data['use_safari_webview'] = $res->use_safari_webview;
                }
            }
            else {
                $data = ['is_single_entry' => FALSE];
            }

            $response = [
                'success' => TRUE,
                'data' => $data,
            ];
        } catch (Exception $ex) {
            $response = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($response);
    }

    public function appIonicInit(Request $request)
    {
        try {
            if (empty($request->appCode) && empty($request->appId)) {
                throw new Exception('App Code/ID not found.');
            }
            $app_id = TpAppsEntity::select('id')->where('app_code', $request->appCode)->first();

            if (!empty($app_id)) {
                $app_id->id;
            }
            else {
                throw new Exception('App Code/ID not found.');
            }

            $tabData = TpAppsTabEntity::getEnabledAppTabsForContent(empty($request->appCode) ? $request->appId : $request->appCode, TpAppsTabEntity::STATUS_ENABLED, empty($request->appCode) ? FALSE : TRUE);
            $homeScreenSettings = DisplaySettingsHomeScreen::getSettings($app_id->id);
            $homeScreenSliders = HomeScreenSliders::getAppSliders($app_id->id);
            if (!empty($homeScreenSettings)) {
                $homeScreenSettings->layout = $homeScreenSettings->layout ? json_decode($homeScreenSettings->layout) : NULL;
                $homeScreenSettings->extra_buttons = $homeScreenSettings->extra_buttons ? json_decode($homeScreenSettings->extra_buttons) : NULL;
                $homeScreenSettings->subtabs = $homeScreenSettings->subtabs ? json_decode($homeScreenSettings->subtabs) : NULL;
                $homeScreenSettings->header = $homeScreenSettings->header ? json_decode($homeScreenSettings->header) : NULL;
                $homeScreenSettings->buttons = $homeScreenSettings->buttons ? json_decode($homeScreenSettings->buttons) : NULL;
                $homeScreenSettings->icon_color = $homeScreenSettings->icon_color ? json_decode($homeScreenSettings->icon_color) : NULL;
            }
            else {
                $homeScreenSettings = NULL;
            }

            $globalStyleSettings = GlobalStyle::getGlobalStyle($app_id->id);

            if (!empty($globalStyleSettings)) {
                $globalStyleSettings->header = $globalStyleSettings->header ? json_decode($globalStyleSettings->header) : NULL;
                $globalStyleSettings->lists = $globalStyleSettings->lists ? json_decode($globalStyleSettings->lists) : NULL;
                $globalStyleSettings->fonts = $globalStyleSettings->fonts ? json_decode($globalStyleSettings->fonts) : NULL;
                $globalStyleSettings->features = $globalStyleSettings->features ? json_decode($globalStyleSettings->features) : NULL;
                $globalStyleSettings->individual_tabs = $globalStyleSettings->individual_tabs ? json_decode($globalStyleSettings->individual_tabs) : NULL;
                $globalStyleSettings->blur_effect = $globalStyleSettings->blur_effect ? json_decode($globalStyleSettings->blur_effect) : NULL;
            }
            else {
                $globalStyleSettings = NULL;
            }

            $tabIds = [];
            foreach ($tabData as $tabs) {
                $tabIds[] = $tabs->id;
            }

            $individualSettings = IndividualTabSettings::getTabSettingsByTabIds($tabIds);

            foreach ($individualSettings as $settings) {
                if (!empty($settings)) {
                    $settings->buttons = $settings->buttons ? json_decode($settings->buttons) : NULL;
                    $settings->header = $settings->header ? json_decode($settings->header) : NULL;
                    $settings->icon_color = $settings->icon_color ? json_decode($settings->icon_color) : NULL;
                    $settings->color = $settings->color ? json_decode($settings->color) : NULL;
                }
                else {
                    $settings = NULL;
                }
            }
            $detail = TpAppsConfig::getAppConfigData($app_id->id);
            if (!empty($detail)) {
                $config = $detail->config_data;
                $app_share_config_data = $detail->app_share_config_data;
                $app_screen_config_data = $detail->app_screen_config_data;
                $app_email_marketing_config_data = $detail->email_marketing_config_data;
                $config_arr = $config ? json_decode($config, true) : null;
                $app_share_config_data_arr = $app_share_config_data ? json_decode($app_share_config_data, true) : null;
                $app_screen_config_data_arr = $app_screen_config_data ? json_decode($app_screen_config_data, true) : null;
                $app_email_marketing_config_data_arr = $app_email_marketing_config_data ? json_decode($app_email_marketing_config_data, true) : null;
            }
            else {
                $config_arr = null;
                $app_share_config_data_arr = null;
                $app_screen_config_data_arr = null;
                $app_email_marketing_config_data_arr = null;
            }

            $data = [
                'tabData' => $tabData,
                'appData' => TpAppsEntity::getAppDataForDisplay($app_id->id),
                'timeSettings' => $config_arr,
                'appShareConfigData' => $app_share_config_data_arr,
                'appScreenConfigData' => $app_screen_config_data_arr,
                'appEmailMarketingConfigData' => $app_email_marketing_config_data_arr,
                'homeScreenSettings' => $homeScreenSettings,
                'homeScreenSliders' => $homeScreenSliders,
                'home_buttons_images' => ButtonBackgroundImages::getButtonBackgroundImage($app_id->id),
                'home_header_image' => HomeScreenHeadersBgImgs::getHomeHeaderBgImage($app_id->id),
                'subTabIcons' => SubTabIcons::getAllIcons(),
                'subTabs' => SubTabs::getSubTabList($app_id->id),
                'globalStyleSettings' => $globalStyleSettings,
                'global_image_header' => GlobalHeaderBackgroundImages::getGlobalHeaderBgImage($app_id->id),
                'individualSettings' => $individualSettings,
                'font_list' => GlobalFontFamily::getFontList(),
                'contactData' => ContactUs::getLocationListByAppId($app_id->id),
                'appLanguageData' => TabTitleLanguages::getAppLanguageData($app_id->id),
                'gcmSenderID' => FirebaseAppCredentials::getSenderID($app_id->id) ?? PushNotificationController::GCM_SENDER_ID,
                'inboxTabSettings' => $this->getInboxTabSettings($app_id->id)
            ];
            $response = [
                'success' => TRUE,
                'data' => $data,
            ];
        } catch (Exception $ex) {
            $response = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($response);
    }

    public function getEnabledTabs(Request $request)
    {
        try {
            if (empty($request->appCode) && empty($request->appId)) {
                throw new Exception('App Code/ID not found.');
            }
            $tabData = TpAppsTabEntity::getEnabledAppTabsForContent(empty($request->appCode) ? $request->appId : $request->appCode, TpAppsTabEntity::STATUS_ENABLED, empty($request->appCode) ? FALSE : TRUE);

            $data = [
                'tabData' => $tabData,
            ];
            $response = [
                'success' => TRUE,
                'data' => $data,
            ];
        } catch (Exception $ex) {
            $response = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($response);
    }

    private function _getValidationMessages()
    {
        return [
            'tab_func_id.required' => 'Tab Function is required.',
            'tab_func_id.integer' => 'Tab Function is not valid.',
        ];
    }

    private function _getCommonValidationRules()
    {
        return [
            'tab_func_id' => 'required|integer',
            'title' => 'required|max:256',
            'status' => 'required|integer',
            'icon_image' => 'mimes:jpeg,jpg,png',
        ];
    }

    public function sortAppTabsForContent(Request $request)
    {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['content_sort_order' => $i++];
            }
            TpAppsTabEntity::updateMultiple($sortData);
            $result = [
                'success' => TRUE,
                'data' => 'Tab order saved.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    private static function _uploadIcon($iconImage) : string
    {
        $destinationPath = storage_path('app/public/icons/custom');
        $extension = $iconImage->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . "_custom_icon." . $extension;
        Helper::makeDirectory($destinationPath);
        Image::make($iconImage->getRealPath())
            ->resize(64, 64, function ($constraint) {
            $constraint->aspectRatio();
        })
            ->save($destinationPath . '/' . $fileName);
        return self::CUSTOM_ICON_FOLDER_NAME . $fileName;
    }

    public function translation(Request $request)
    {
        try {
            if (empty($request->title) && empty($request->tabType) && empty($request->tabId) && empty($request->appId)) {
                throw new Exception('data is missing.');
            }
            self::translateTabTitle($request->title, $request->tabType, $request->tabId, $request->appId);
            $result = [
                'success' => TRUE,
                'data' => 'Tab Languages saved.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getAppTabTranslation(Request $request)
    {
        try {
            if (empty($request->id)) {
                throw new Exception('appId not found.');
            }
            $appTabs = TpAppsTabEntity::getActiveInactiveTabs($request->id, true);
            foreach ($appTabs as $appTab) {
                self::translateTabTitle($appTab->title, 'tab_translation', $appTab->id, $request->id);
            }
            $result = [
                'success' => TRUE,
                'data' => 'Tab Languages saved.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public static function translateTabTitle($title, $filedname, $tabId, $appId)
    {
        $languages = array('es', 'pt', 'ar', 'bn', 'hi', 'pt', 'ru');
        $data['en'][$tabId] = $title;
        $title = urlencode($title);
        foreach ($languages as $value) {
            $url = 'https://translation.googleapis.com/language/translate/v2?key=AIzaSyAzWvyoDIu9_eddLAY3HJsRWQ50rAbJUlg&source=en&target=' . $value . '&q=' . $title;
            $translatedData = self::curl_call($url);
            $translatedData = json_decode($translatedData, true);
            $data[$value][$tabId] = $translatedData['data']['translations'][0]['translatedText'];
        }
        $appData = TabTitleLanguages::where('app_id', $appId)->first();
        if (empty($appData)) {
            $language_data['app_id'] = $appId;
            $language_data[$filedname] = json_encode($data, JSON_UNESCAPED_UNICODE);
            TabTitleLanguages::create($language_data);
        }
        else {
            $appTranslation = json_decode($appData->$filedname, true);
            if (empty($appTranslation)) {
                $language_data[$filedname] = json_encode($data, JSON_UNESCAPED_UNICODE);
            }
            else {
                foreach ($appTranslation as $key => $value) {
                    if (!in_array($data[$key][$tabId], $appTranslation[$key])) {
                        $appTranslation[$key][$tabId] = $data[$key][$tabId];
                    }
                }
                $language_data[$filedname] = json_encode($appTranslation, JSON_UNESCAPED_UNICODE);
            }
            TabTitleLanguages::where('app_id', $appId)->update($language_data);
        }
    }

    public static function curl_call($url)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
        $data = curl_exec($ch);
        curl_close($ch);
        return $data;
    }

    public function getAppData(Request $request)
    {
        try {
            if (empty($request->appCode) && empty($request->appId)) {
                throw new Exception('App Code/ID not found.');
            }
            $app_id = TpAppsEntity::select('id')->where('app_code', $request->appCode)->first();

            if (!empty($app_id)) {
                $app_id->id;
            }
            else {
                throw new Exception('App Code/ID not found.');
            }
            $detail = TpAppsConfig::getAppConfigData($app_id->id);
            if (!empty($detail)) {
                $config = $detail->config_data;
                $config_arr = json_decode($config, true);
            }
            else {
                $config_arr = null;
            }

            $data = [
                'appData' => TpAppsEntity::getAppDataForDisplay($app_id->id),
                'timeSettings' => $config_arr
            ];
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

    private function getInboxTabSettings(int $appID) : array
    {
        $tabData = TpAppsTabEntity::getInboxTab($appID);
        $returnArr = [];
        if ($tabData) {
            $returnArr['data'] = $tabData;
            $returnArr['settings'] = \App\Models\TabFunctions\InboxSettings::getInboxSettings($tabData->id);
        }
        return $returnArr;
    }

}
