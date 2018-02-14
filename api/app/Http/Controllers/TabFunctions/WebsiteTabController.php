<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use App\Models\TpAppsTabEntity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use App\Helpers\Helper;
use App\Models\TabFunctions\WebsiteTab;
use Intervention\Image\Facades\Image;

class WebsiteTabController extends Controller {

    private function _getCommonValidationRules(): array {
        return [
            'name' => 'required|max:256',
            'url' => 'required|url',
            'thumbnail' => 'mimes:jpeg,jpg,png',
        ];
    }

    public static function getThumbnailPath(): string {
        return storage_path('app/public/functions/website-tab');
    }

    public static function getThumbnailURL(): string {
        return url('/storage/app/public/functions/website-tab');
    }

    public function createWebsite(Request $request) {
        try {
            $data = $request->all();

            $thumbnail = $request->file('thumbnail');
            $data['thumbnail'] = $thumbnail;
            $validator = Validator::make($data, array_merge($this->_getCommonValidationRules(), ['tab_id' => 'required|integer']));
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }

            $i = 0;
            if (isset($data['is_donation_request']) && $data['is_donation_request']) {
                $i++;
            }
            if (isset($data['is_printing_allowed']) && $data['is_printing_allowed']) {
                $i++;
            }
            if (isset($data['use_safari_webview']) && $data['use_safari_webview']) {
                $i++;
            }
            if ($i !== 0 && $i > 1) {
                throw new Exception("Only one of 'is_donation_request', 'is_printing_allowed' and 'use_safari_webview' should be true.");
            }

            if (!empty($thumbnail)) {
                $data['thumbnail'] = self::_uploadThumbnail($thumbnail);
            }

            WebsiteTab::create($data);
            $result = [
                'success' => TRUE,
                'message' => ['Web View successfully added.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getWebsiteList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $result = [
                'success' => TRUE,
                'data' => WebsiteTab::getWebsiteList($request->tabId),
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getWebsiteTabData(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $data = [
                'websites' => WebsiteTab::getWebsiteList($request->tabId),
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
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

    public function sortWebsites(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            WebsiteTab::updateMultiple($sortData);
            $result = [
                'success' => TRUE,
                'data' => 'Website order saved.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function editWebsite(Request $request) {
        try {
            $data = $request->all();

            $thumbnail = $request->file('thumbnail');
            $data['thumbnail'] = $thumbnail;
            $validator = Validator::make($data, array_merge($this->_getCommonValidationRules(), ['id' => 'required|integer']));
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }

            $i = 0;
            if (isset($data['is_donation_request']) && $data['is_donation_request']) {
                $i++;
            }
            if (isset($data['is_printing_allowed']) && $data['is_printing_allowed']) {
                $i++;
            }
            if (isset($data['use_safari_webview']) && $data['use_safari_webview']) {
                $i++;
            }
            if ($i !== 0 && $i > 1) {
                throw new Exception("Only one of 'is_donation_request', 'is_printing_allowed' and 'use_safari_webview' should be true.");
            }

            if (!empty($thumbnail)) {
                $data['thumbnail'] = self::_uploadThumbnail($thumbnail);
            } else {
                unset($data['thumbnail']);
            }

            WebsiteTab::where('id', $request->id)->update($data);
            $result = [
                'success' => TRUE,
                'message' => ['Web View successfully edited.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteWebsites(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            WebsiteTab::deleteWebsites($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Website successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getWebsiteData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = WebsiteTab::getWebsiteData($request->id);
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

    private static function _uploadThumbnail($thumbnail): string {
        $extension = $thumbnail->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . "_thumbnail." . $extension;
        $thumbnailPath = self::getThumbnailPath();
        Helper::makeDirectory($thumbnailPath);
        Image::make($thumbnail->getRealPath())
            ->resize(140, 140, function ($constraint) {
                $constraint->aspectRatio();
            })
            ->save($thumbnailPath . '/' . $fileName);
        return $fileName;
    }

    public function deleteThumbnail(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            WebsiteTab::where('id', $request->id)
                ->update(['thumbnail' => NULL]);
            $result = [
                'success' => TRUE,
                'message' => ['Thumbnail successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function saveSettings(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            if (!isset($request->show_nav_bar)) {
                throw new Exception('No settings data found.');
            }
            $settings = [
                'show_nav_bar' => $request->show_nav_bar
            ];
            TpAppsTabEntity::where('id', $request->tabId)->update(['settings' => json_encode($settings)]);
            $result = [
                'success' => TRUE,
                'message' => ['Settings successfully updated.'],
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
