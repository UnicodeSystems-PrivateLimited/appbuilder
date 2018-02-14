<?php

namespace App\Http\Controllers\Display;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use App\Helpers\Helper;
use App\Models\TpAppsTabEntity;
use App\Models\MstFormFieldTypes;
use App\Models\Display\DisplaySettingsHomeScreen;
use App\Models\Display\ButtonBackgroundImages;
use App\Models\Display\SubTabIcons;
use App\Models\Display\HomeScreenHeadersBgImgs;
use App\Models\Display\SubTabs;
use App\Models\TpAppsEntity;
use Intervention\Image\Facades\Image;
use App\Models\Display\IndividualTabSettings;

class DisplaySettingsController extends Controller {

    const BUTTON_IMAGE_FOLDER_NAME = 'app/public/display/button_background_imgs';
    const BUTTON_BACKGROUND_PREDEFINED = 1;
    const BUTTON_BACKGROUND_CUSTOM = 2;
    const HOME_HEADER_IMAGE_FOLDER_NAME = 'app/public/display/home_header_bg_imgs';
    const HOME_HEADER_BACKGROUND_PREDEFINED = 1;
    const HOME_HEADER_BACKGROUND_CUSTOM = 2;
    const SUBTAB_ICON_FOLDER_NAME = 'app/public/display/subtabs_icons';

    public function init(Request $request) {
        try {
            if (empty($request->app_id)) {
                throw new Exception('App ID not found.');
            }
            if (!empty($request->app_id)) {
                $settings = DisplaySettingsHomeScreen::getSettings($request->app_id);
            }
            if (!empty($settings)) {
                $settings->layout = $settings->layout ? json_decode($settings->layout) : NULL;
                $settings->extra_buttons = $settings->extra_buttons ? json_decode($settings->extra_buttons) : NULL;
                $settings->subtabs = $settings->subtabs ? json_decode($settings->subtabs) : NULL;
                $settings->header = $settings->header ? json_decode($settings->header) : NULL;
                $settings->buttons = $settings->buttons ? json_decode($settings->buttons) : NULL;
                $settings->icon_color = $settings->icon_color ? json_decode($settings->icon_color) : NULL;
            } else {
                $settings = NULL;
            }

            $tabData = TpAppsTabEntity::getAppTabsForContent($request->app_id);
            $tabIds = [];

            foreach ($tabData as $tabs) {
                $tabIds[] = $tabs->id;
            }

            $individualSettings = IndividualTabSettings::getTabSettingsByTabIds($tabIds);

            foreach ($individualSettings as $tabSettings) {
                if (!empty($tabSettings)) {
                    $tabSettings->buttons = $tabSettings->buttons ? json_decode($tabSettings->buttons) : NULL;
                    $tabSettings->header = $tabSettings->header ? json_decode($tabSettings->header) : NULL;
                    $tabSettings->icon_color = $tabSettings->icon_color ? json_decode($tabSettings->icon_color) : NULL;
                    $tabSettings->color = $tabSettings->color ? json_decode($tabSettings->color) : NULL;
                } else {
                    $tabSettings = NULL;
                }
            }
            $data = [
                'settings' => $settings,
                'appData' => TpAppsEntity::getAppDataForDisplay($request->app_id),
                'image_list' => ButtonBackgroundImages::getButtonBackgroundImage($request->app_id),
                'subTabIcons' => SubTabIcons::getAllIcons(),
                'header_image_list' => HomeScreenHeadersBgImgs::getHomeHeaderBgImage($request->app_id),
                'subTabs' => SubTabs::getSubTabList($request->app_id),
                'individualSettings' => $individualSettings
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

    public function saveSettings(Request $request) {
        try {
            $data = $request->all();
            $rules = $request->id ? ['id' => 'required|integer'] : ['app_id' => 'required|integer'];

            if (empty($request->app_id)) {
                throw new Exception('AppID not found.');
            }

            $data['layout'] = !empty($data['layout']) ? json_encode($data['layout']) : NULL;
            $data['extra_buttons'] = !empty($data['extra_buttons']) ? json_encode($data['extra_buttons']) : NULL;
            $data['subtabs'] = !empty($data['subtabs']) ? json_encode($data['subtabs']) : NULL;
            $data['header'] = !empty($data['header']) ? json_encode($data['header']) : NULL;
            $data['buttons'] = !empty($data['buttons']) ? json_encode($data['buttons']) : NULL;
            $data['icon_color'] = !empty($data['icon_color']) ? json_encode($data['icon_color']) : NULL;

            if ($request->id) {
                DisplaySettingsHomeScreen::where('id', $request->id)->update($data);
            } else {
                DisplaySettingsHomeScreen::create($data);
            }
            $result = [
                'success' => TRUE,
                'message' => ['Settings successfully saved.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

//***********************BUTTON BACKGROUND IMAGES***********************************
    public function uploadButtonBackgroundImg(Request $request) {
        try {
            $data = $request->all();
            if (empty($data['app_id'])) {
                throw new Exception('AppID not found.');
            }
            $data['name'] = $request->file('name');
            $rules = [
                'name' => 'required|mimes:jpeg,jpg,png'
            ];
            $validationMessages = [
                'name.mimes' => "Invalid image",
                'name.required' => "Image not found"
            ];
            $validator = Validator::make($data, $rules, $validationMessages);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $data['name'] = self::uploadImage($data['name']);
            $data['type'] = self::BUTTON_BACKGROUND_CUSTOM;
            $createdImgId = ButtonBackgroundImages::create($data)->id;
            $app = DisplaySettingsHomeScreen::where('app_id', $data['app_id'])->first();
            if (!empty($app)) {
                if (empty(json_decode($app->buttons))) {
                    $buttonSettings = [
                        'background_tint' => '#fff',
                        'show_text' => true,
                        'text_color' => '#000',
                        'background_img' => $createdImgId
                    ];
                } else {
                    $buttonSettings = json_decode($app->buttons, TRUE);
                    $buttonSettings['background_img'] = $createdImgId;
                }
                $app->buttons = json_encode($buttonSettings);
                $app->save();
            } else {
                DisplaySettingsHomeScreen::create([
                    'buttons' => json_encode([
                        'background_tint' => '#fff',
                        'show_text' => true,
                        'text_color' => '#000',
                        'background_img' => $createdImgId
                    ])
                ]);
            }
            $result = [
                'success' => TRUE,
                'message' => ['Background image saved'],
                'createdImgId' => $createdImgId
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    private static function uploadImage($image): string {
        $uploadPath = storage_path(self::BUTTON_IMAGE_FOLDER_NAME);
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_button_background.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->resize(126, 126)
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    public static function getImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::BUTTON_IMAGE_FOLDER_NAME);
    }

    public static function getImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::BUTTON_IMAGE_FOLDER_NAME);
    }

    public function getButtonBackgroundImages(Request $request) {
        try {
            if (empty($request->app_id)) {
                throw new Exception('App Id Not Found.');
            }
            $image_list = ButtonBackgroundImages::getButtonBackgroundImage($request->app_id);

            $result = [
                'success' => TRUE,
                'data' => $image_list
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteButtonBgImage(Request $request) {
        try {

            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            ButtonBackgroundImages::where('id', $request->id)->delete();
            $result = [
                'success' => TRUE,
                'message' => ['Image successfully deleted'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

//*****************************HEADER BACKGROUND IMAGES*************************************

    public function uploadHeaderBackgroundImg(Request $request) {
        try {
            $data = $request->all();
            if (empty($data['app_id'])) {
                throw new Exception('AppID not found.');
            }
            $data['name'] = $request->file('name');
            $rules = [
                'name' => 'required|mimes:jpeg,jpg,png'
            ];
            $validationMessages = [
                'name.mimes' => "Invalid image",
                'name.required' => "Image not found"
            ];
            $validator = Validator::make($data, $rules, $validationMessages);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $data['name'] = self::uploadHeaderImage($data['name']);
            $data['type'] = self::HOME_HEADER_BACKGROUND_CUSTOM;
            $createdImgId = HomeScreenHeadersBgImgs::create($data)->id;
            $app = DisplaySettingsHomeScreen::where('app_id', $data['app_id'])->first();
            if (!empty($app)) {
                if (empty(json_decode($app->header))) {
                    $headerSettings = [
                        'background_tint' => '#000',
                        'background_opacity' => '0',
                        'background_img' => $createdImgId
                    ];
                } else {
                    $headerSettings = json_decode($app->header, TRUE);
                    $headerSettings['background_img'] = $createdImgId;
                }
                $app->header = json_encode($headerSettings);
                $app->save();
            } else {
                DisplaySettingsHomeScreen::create([
                    'header' => json_encode([
                        'background_tint' => '#000',
                        'background_opacity' => '0',
                        'background_img' => $createdImgId
                    ])
                ]);
            }
            $result = [
                'success' => TRUE,
                'message' => ['Home Background image saved'],
                'createdImgId' => $createdImgId
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    private static function uploadHeaderImage($image): string {
        $uploadPath = storage_path(self::HOME_HEADER_IMAGE_FOLDER_NAME);
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_headers_background.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->resize(640, 88)
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    public static function getHeaderImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::HOME_HEADER_IMAGE_FOLDER_NAME);
    }

    public static function getHeaderImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::HOME_HEADER_IMAGE_FOLDER_NAME);
    }

    public function getHeaderBackgroundImages(Request $request) {
        try {
            if (empty($request->app_id)) {
                throw new Exception('App Id Not Found.');
            }
            $header_image_list = HomeScreenHeadersBgImgs::getHomeHeaderBgImage($request->app_id);

            $result = [
                'success' => TRUE,
                'data' => $header_image_list
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteHeaderBgImage(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            HomeScreenHeadersBgImgs::where('id', $request->id)->delete();
            $result = [
                'success' => TRUE,
                'message' => ['Image successfully deleted'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function saveSubTabs(Request $request) {
        try {
            $formData = $request->all();
            $iconImage = $request->file('icon_image');
            $formData['icon_image'] = $iconImage;
            $validator = Validator::make($formData, [
                        'id' => 'integer',
                        'app_id' => 'required|integer',
                        'title' => 'required|max:256',
                        'text_color' => 'required',
                        'text_color_shadow' => 'required',
                        'tab_id' => 'integer',
                        'active' => 'required',
                        'homescreen_only' => 'required',
                        'icon_image' => 'mimes:jpeg,jpg,png',
                        'sort_order' => 'required|integer',
                        'external_url' => 'url'
            ]);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            if (empty($formData['tab_id']) && empty($formData['external_url'])) {
                throw new Exception('Please select a tab or enter external link URL.');
            }
            if ($request->id) {
                // Edit mode
                if (!empty($iconImage)) {
                    $formData['icon_name'] = self::uploadSubtabIcon($iconImage);
                } else {
                    if (empty($formData['icon_name']) || filter_var($formData['icon_name'], FILTER_VALIDATE_URL)) {
                        // If the icon_name key is given, but it has no value, or it is a URL(which is actually a bug). Then there's
                        // no need to update it.
                        unset($formData['icon_name']);
                    }
                }
                unset($formData['icon_image']);
                $subTabId = $request->id;
                SubTabs::where('id', $request->id)->update($formData);
            } else {
                if (!empty($iconImage)) {
                    $formData['icon_name'] = self::uploadSubtabIcon($iconImage);
                } else {
                    if (empty($formData['icon_name'])) {
                        // Neither predefined nor custom icon image is provided.
                        throw new Exception('Icon image not found.');
                    }
                }
                unset($formData['icon_image']);
                $subTabId = SubTabs::create($formData)->id;
            }
            $result = [
                'success' => TRUE,
                'subTabId' => $subTabId,
                'message' => ['Sub Tab saved successfully']
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    private static function uploadSubtabIcon($image): string {
        $uploadPath = storage_path(self::SUBTAB_ICON_FOLDER_NAME);
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_subtab_icon.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->resize(256, 256)
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    public function getSubTabList(Request $request) {
        try {
            if (empty($request->app_id)) {
                throw new Exception('App Id Not Found.');
            }
            $result = [
                'success' => TRUE,
                'data' => SubTabs::getSubTabList($request->app_id)
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getSubTab(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('Id Not Found.');
            }
            $result = [
                'success' => TRUE,
                'data' => SubTabs::getSubTab($request->id)
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function sortSubTabs(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            foreach ($request->ids as $key => $id) {
                $sortData[$id] = ['sort_order' => $key];
            }
            SubTabs::updateMultiple($sortData);
            $result = [
                'success' => TRUE,
                'data' => 'Item order saved.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteSubTab(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('Id Not Found.');
            }
            SubTabs::where('id', $request->id)->delete();
            $result = [
                'success' => TRUE,
                'data' => 'Sub Tab successfully deleted.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    //appDisplay->settings->global Style->individual tab->Appearance
    public function getIndividualTabSettings(Request $request) {
        try {
            if (empty($request->tab_id)) {
                throw new Exception('ID not found.');
            }
            $data = IndividualTabSettings::getIndividualTabSettings($request->tab_id);
            if (!empty($data)) {
                $data->buttons = $data->buttons ? json_decode($data->buttons) : NULL;
                $data->header = $data->header ? json_decode($data->header) : NULL;
                $data->icon_color = $data->icon_color ? json_decode($data->icon_color) : NULL;
                $data->color = $data->color ? json_decode($data->color) : NULL;
            } else {
                $data = NULL;
            }
            $result = [
                'success' => TRUE,
                'data' => $data
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

}
