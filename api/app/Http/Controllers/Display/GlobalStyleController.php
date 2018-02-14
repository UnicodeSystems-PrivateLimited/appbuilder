<?php

namespace App\Http\Controllers\Display;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use App\Helpers\Helper;
use App\Models\TpAppsTabEntity;
use App\Models\MstFormFieldTypes;
use App\Models\Display\GlobalStyle;
use App\Models\Display\GlobalHeaderBackgroundImages;
use App\Models\Display\GlobalColorTheme;
use App\Models\Display\GlobalFontFamily;
use App\Models\Display\IndividualTabSettings;
use App\Models\MstTpAppsTabsIcon;
use App\Models\TpAppsEntity;
use Intervention\Image\Facades\Image;

class GlobalStyleController extends Controller {

    const GLOBAL_HEADER_IMAGE_FOLDER_NAME = 'app/public/display/global_header_bg_imgs';
    const HEADER_BACKGROUND_PREDEFINED = 1;
    const HEADER_BACKGROUND_CUSTOM = 2;

    public function init(Request $request) {
        try {
            if (empty($request->app_id)) {
                throw new Exception('App Id not found.');
            }
            $globalStyle = GlobalStyle::getGlobalStyle($request->app_id);
            if (!empty($globalStyle)) {
                $globalStyle->header = $globalStyle->header ? json_decode($globalStyle->header) : NULL;
                $globalStyle->lists = $globalStyle->lists ? json_decode($globalStyle->lists) : NULL;
                $globalStyle->fonts = $globalStyle->fonts ? json_decode($globalStyle->fonts) : NULL;
                $globalStyle->features = $globalStyle->features ? json_decode($globalStyle->features) : NULL;
                $globalStyle->individual_tabs = $globalStyle->individual_tabs ? json_decode($globalStyle->individual_tabs) : NULL;
                $globalStyle->blur_effect = $globalStyle->blur_effect ? json_decode($globalStyle->blur_effect) : NULL;
            } else {
                $globalStyle = NULL;
            }
            $tabData = TpAppsTabEntity::getAppTabsForContent($request->app_id);
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
                } else {
                    $settings = NULL;
                }
            }
            $data = [
                'globalStyle' => $globalStyle,
                'appData' => TpAppsEntity::getAppDataForDisplay($request->app_id),
                'app_tabs_data' => $tabData,
                'image_list' => GlobalHeaderBackgroundImages::getGlobalHeaderBgImage($request->app_id),
                'color_theme' => GlobalColorTheme::getColorThemeList(),
                'font_list' => GlobalFontFamily::getFontList(),
                'black_icon' => MstTpAppsTabsIcon::getTabIcons(MstTpAppsTabsIcon::TYPE_BLACK),
                'white_icon' => MstTpAppsTabsIcon::getTabIcons(MstTpAppsTabsIcon::TYPE_WHITE),
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

    public function save(Request $request) {
        try {
            $data = $request->all();
            $rules = $request->id ? ['id' => 'required|integer'] : ['app_id' => 'required|integer'];

            if (empty($request->app_id)) {
                throw new Exception('App Id not found');
            }

            $data['header'] = !empty($data['header']) ? json_encode($data['header']) : NULL;
            $data['fonts'] = !empty($data['fonts']) ? json_encode($data['fonts']) : NULL;
            $data['lists'] = !empty($data['lists']) ? json_encode($data['lists']) : NULL;
            $data['features'] = !empty($data['features']) ? json_encode($data['features']) : NULL;
            $data['individual_tabs'] = !empty($data['individual_tabs']) ? json_encode($data['individual_tabs']) : NULL;
            $data['blur_effect'] = !empty($data['blur_effect']) ? json_encode($data['blur_effect']) : NULL;

            if ($request->id) {
                GlobalStyle::where('id', $request->id)->update($data);
            } else {
                GlobalStyle::create($data);
            }
            $result = [
                'success' => TRUE,
                'message' => ['Global Style saved successfully'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public static function getImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::GLOBAL_HEADER_IMAGE_FOLDER_NAME);
    }

    public static function getImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::GLOBAL_HEADER_IMAGE_FOLDER_NAME);
    }

    public function getGlobalHeaderBgImages(Request $request) {
        try {
            if (empty($request->app_id)) {
                throw new Exception('App Id Not Found.');
            }
            $image_list = GlobalHeaderBackgroundImages::getGlobalHeaderBgImage($request->app_id);

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

    public function deleteGlobalHeaderBgImage(Request $request) {
        try {

            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            GlobalHeaderBackgroundImages::where('id', $request->id)->delete();
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

    public function uploadGlobalHeaderBgImg(Request $request) {
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
            $data['type'] = self::HEADER_BACKGROUND_CUSTOM;
            $createdImgId = GlobalHeaderBackgroundImages::create($data)->id;
            $app = GlobalStyle::where('app_id', $data['app_id'])->first();
            if (!empty($app)) {
                if (empty(json_decode($app->header))) {
                    $globalHeaderSettings = [
                        'background_color' => '#000',
                        'text_color' => '#000',
                        'shadow' => '#000',
                        'background_opacity' => '0',
                        'background_img' => $createdImgId
                    ];
                } else {
                    $globalHeaderSettings = json_decode($app->header, TRUE);
                    $globalHeaderSettings['background_img'] = $createdImgId;
                }
                $app->header = json_encode($globalHeaderSettings);
                $app->save();
            } else {
                GlobalStyle::create([
                    'header' => json_encode([
                        'background_color' => '#000',
                        'text_color' => '#000',
                        'shadow' => '#000',
                        'background_opacity' => '0',
                        'background_img' => $createdImgId
                    ])
                ]);
            }
            $result = [
                'success' => TRUE,
                'message' => ['Header Background image saved'],
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
        $uploadPath = storage_path(self::GLOBAL_HEADER_IMAGE_FOLDER_NAME);
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_header_background.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->resize(640, 88)
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

//get single theme data
    public function getSingleThemeData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = GlobalColorTheme::getSingleColorTheme($request->id);
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

    //get single font data
    public function getSingleFontData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = GlobalFontFamily::getSingleFont($request->id);
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

    public function saveIndividualTabAppearance(Request $request) {
        try {
            $data = $request->all();

            if (empty($request->tab_id)) {
                throw new Exception('Tab Id not found');
            }
            $data['buttons'] = !empty($data['buttons']) ? json_encode($data['buttons']) : NULL;
            $data['header'] = !empty($data['header']) ? json_encode($data['header']) : NULL;
            $data['icon_color'] = !empty($data['icon_color']) ? json_encode($data['icon_color']) : NULL;
            $data['color'] = !empty($data['color']) ? json_encode($data['color']) : NULL;
            $app = IndividualTabSettings::where('tab_id', $data['tab_id'])->first();

            if (!empty($app)) {
                IndividualTabSettings::where('tab_id', $request->tab_id)->update($data);
            } else {
                IndividualTabSettings::create($data);
            }
            $result = [
                'success' => TRUE,
                'message' => ['Individual Tab Settings saved successfully'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

      public function deleteSettings(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('TabID not found.');
            }
            IndividualTabSettings::deleteSettings($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Settings successfully deleted.'],
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
