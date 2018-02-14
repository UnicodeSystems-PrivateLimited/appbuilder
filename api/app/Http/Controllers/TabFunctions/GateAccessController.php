<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\GateAccess;
use App\Models\TpAppsTabEntity;
use App\Helpers\Helper;

class GateAccessController extends Controller {

    const BANNER_IMAGE_UPLOAD_PATH = 'app/public/functions/gate-access/banner/image';

    private static function _getCommonValidationRules(): array {
        return [
            'email_id' => 'required|email',
        ];
    }
    private static function _getValidationMessages() {
        return [];
    }

   /**
     * Saves the image file and returns the saved file name.
     * @return string
     */
    private static function _uploadImage($image, string $uploadPath): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_contact_us_image.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->resize(288, 144)
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    public static function getImageImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::BANNER_IMAGE_UPLOAD_PATH);
    }

    /**
     * Load the contact us list, first list item for edit form
     */
    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }

            $data = [
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
            ];
            $result = [
                'success' => true,
                'data' => $data
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
     * Add/Edit Contact Us location info for tab id
     */
    public function save(Request $request) {
        try {
            $data = $request->all();
            $bannerImage = $request->file('banner_image');
            $data['banner_image'] = $bannerImage;
            $rules = $request->id ? ['id' => 'required|integer', 'banner_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE] : ['tab_id' => 'required|integer', 'banner_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE];
            $validator = Validator::make($data, array_merge(self::_getCommonValidationRules(), $rules), self::_getValidationMessages());

            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()->unique()));
            }

            if (!empty($bannerImage)) {
                $data['banner_image'] = self::_uploadImage($bannerImage, self::getImageImageUploadPath());
            } else {
                unset($data['banner_image']);
            }
            if ($request->id) {
                // ContactUs::where('id', $request->id)->update($data);
                $result = [
                    'success' => true,
                    'message' => ['Contact Us information successfully edited.'],];
            } else {
                // ContactUs::create($data);
                $result = [
                    'success' => true,
                    'message' => ['Contact Us information successfully added.'],
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
}
