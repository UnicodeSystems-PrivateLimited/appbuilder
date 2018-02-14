<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\ContactUs;
use App\Models\TabFunctions\ContactUsOpening;
use App\Models\TabFunctions\ContactUsComments;
use App\Models\TpAppsTabEntity;
use App\Models\TpAppsEntity;
use App\Models\TabFunctions\SocialUser;
use App\Helpers\Helper;

class ContactUsController extends Controller {

    const LEFT_IMAGE_UPLOAD_PATH = 'app/public/functions/contact-us/image/left';
    const RIGHT_IMAGE_UPLOAD_PATH = 'app/public/functions/contact-us/image/right';

    private static function _getCommonValidationRules(): array {
        return [
            'address_sec_1' => 'required|max:256',
            'address_sec_2' => 'required|max:256',
            'website' => 'max:256|url',
            'email_id' => 'required|email',
            'phone' => 'between:10,12',
            'left_image' => 'mimes:jpeg,jpg,png|max:10000',
            'right_image' => 'mimes:jpeg,jpg,png|max:10000',
            'm_lat' => "required_if:isMapDataSet,1",
            'm_long' => "required_if:isMapDataSet,1"
        ];
    }

    private static function _getCommonValidationRulesOpening(): array {
        return [
            'day_name' => 'required',
            'open_from' => 'required',
            'open_to' => 'required',
        ];
    }

    private static function _getValidationMessages() {
        return [
            'phone.between' => 'The phone number is invalid.',
            'm_lat.required_if' => 'The address is required.',
            'm_long.required_if' => 'The address is required.'
        ];
    }

    private static function _getValidationMessagesOpening() {
        return [];
    }

    public static function getImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(Helper::IMAGE_UPLOAD_PATH);
    }

    /**
     * Add/Edit Contact Us location info for tab id
     */
    public function save(Request $request) {
        try {
            $data = $request->all();
            $leftImage = $request->file('left_image');
            $rightImage = $request->file('right_image');
            $data['left_image'] = $leftImage;
            $data['right_image'] = $rightImage;
            if ($request->id) {
                if (($request->right_image == null || $request->left_image == null)&& $request->is_left_right_image_enabled == 1) {
                    $rules = $request->id ? ['id' => 'required|integer', 'left_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'right_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE] : ['tab_id' => 'required|integer', 'left_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'right_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE];
                } else {
                    $rules = $request->id ? ['id' => 'required|integer', 'left_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'right_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE] : ['tab_id' => 'required|integer', 'left_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'right_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE];
                }
            } else {
                if ($data['is_left_right_image_enabled'] == 1) {
                    $rules = $request->id ? ['id' => 'required|integer', 'left_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'right_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE] : ['tab_id' => 'required|integer', 'left_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'right_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE];
                } else {
                    $rules = $request->id ? ['id' => 'required|integer', 'left_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'right_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE] : ['tab_id' => 'required|integer', 'left_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'right_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE];
                }
            }


            $validator = Validator::make($data, array_merge(self::_getCommonValidationRules(), $rules), self::_getValidationMessages());

            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()->unique()));
            }

            if (!empty($leftImage)) {
                $data['left_image'] = self::_uploadImage($leftImage, self::getLeftImageUploadPath());
            } else {
                unset($data['left_image']);
            }

            if (!empty($rightImage)) {
                $data['right_image'] = self::_uploadImage($rightImage, self::getRightImageUploadPath());
            } else {
                unset($data['right_image']);
            }

            // Unset field isMapDataSet from form data. The variable is set if the map is clicked.
            unset($data['isMapDataSet']);

            if ($request->id) {
                ContactUs::where('id', $request->id)->update($data);
                $result = [
                    'success' => true,
                    'message' => ['Contact Us information successfully edited.'],];
            } else {
                ContactUs::create($data);
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

    /**
     * Load the contact us list, first list item for edit form
     */
    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $location_list = ContactUs::getContactUsLocationList($request->tabId);

            $data = [
                'location_list' => ContactUs::getContactUsLocationList($request->tabId),
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
            ];
            if (!$location_list->isEmpty()) {
                $data['item_data'] = ContactUs::getContactUsLocationInfo($location_list[0]->id); //get first contact us location info for the tab id
                $data['comments'] = ContactUsComments::getContactUsComments($location_list[0]->id);
            }
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
     * Load the contact us list
     */
    public function listLocations(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $data = ContactUs::getContactUsLocationList($request->tabId);
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
     * sort the contact us list
     */
    public function sortItem(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            ContactUs::updateMultiple($sortData);
            $result = [
                'success' => true,
                'data' => 'Item order saved.'
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
     * delete the contact us info
     */
    public function delete(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            ContactUs::deleteContactUs($request->id);
            $result = [
                'success' => true,
                'message' => ['Contact Us information successfully deleted.'],
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
     * get the contact us info
     */
    public function getItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = [
                'locationData' => ContactUs::getContactUsLocationInfo($request->id),
                'comments' => ContactUsComments::getContactUsComments($request->id),
                'openingTimes' => ContactUsOpening::getContactUsOpenings($request->id)
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

    public static function getLeftImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::LEFT_IMAGE_UPLOAD_PATH);
    }

    public static function getRightImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::RIGHT_IMAGE_UPLOAD_PATH);
    }

    public static function getLeftImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::LEFT_IMAGE_UPLOAD_PATH);
    }

    public static function getRightImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::RIGHT_IMAGE_UPLOAD_PATH);
    }

    public function deleteImage(Request $request) {
        try {
            if ($request->imageType !== 'left' && $request->imageType !== 'right') {
                throw new Exception('Invalid URL');
            }
            if (empty($request->locationId)) {
                throw new Exception('Location ID not found');
            }
            ContactUs::where('id', $request->locationId)->update([$request->imageType . '_image' => null]);
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

    //opening functions

    /**
     * get all openings for the contact
     */
    public function openingList(Request $request) {
        try {
            if (empty($request->contact_id)) {
                throw new Exception('ID not found.');
            }
            $data = ContactUsOpening::getContactUsOpenings($request->contact_id);
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

    /**
     * get the opening data
     */
    public function getOpeningData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = ContactUsOpening::getContactUsOpeningData($request->id);
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

    /**
     * Create/Edit Opening for Contact id
     */
    public function saveOpening(Request $request) {
        try {
            $data = $request->all();
            if ($request->id) {
                $validator = Validator::make($data, array_merge(self::_getCommonValidationRulesOpening(), ['id' => 'required|integer']), self::_getValidationMessagesOpening());
            } else {
                $validator = Validator::make($data, array_merge(self::_getCommonValidationRulesOpening(), ['contact_id' => 'required|integer']), self::_getValidationMessagesOpening());
            }

            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }

            if ($request->id) {
                ContactUsOpening::where('id', $request->id)->update($data);
                $result = [
                    'success' => true,
                    'message' => ['Opening information successfully edited.'],
                ];
            } else {
                ContactUsOpening::create($data);
                $result = [
                    'success' => true,
                    'message' => ['Opening data for Contact Us successfully added.'],
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

    /**
     * delete the opening info
     */
    public function deleteOpening(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            ContactUsOpening::deleteOpening($request->id);
            $result = [
                'success' => true,
                'message' => ['Opening information successfully deleted.'],
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
     * sort the Opening Info
     */
    public function sortOpening(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            ContactUsOpening::updateMultiple($sortData);
            $result = [
                'success' => true,
                'data' => 'Opening Times order saved.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    //Contact us Comments data

    /**
     * Load the comment and comment count for contact us.
     */
    public function commentList(Request $request) {
        try {
            if (empty($request->contact_id)) {
                throw new Exception('contact id not found.');
            }
            $comment_list = ContactUsComments::getContactUsComments($request->contact_id);
            if ($comment_list) {
                $comment_list_count = count($comment_list);
            } else {
                $comment_list_count = 0;
            }
            $data = [
                'comment_list' => $comment_list,
                'comment_count' => $comment_list_count,
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
     * delete the comment for contact
     */
    public function deleteComment(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            ContactUsComments::deleteComment($request->id);
            $result = [
                'success' => true,
                'message' => ['Comment information for contact successfully deleted.'],
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
     * Add/Edit Comment for contact id
     */
    public function saveComment(Request $request) {
        try {
            $data = $request->all();
            $rules = ['contact_id' => 'required|integer', 'comment' => 'required'];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()->unique()));
            }
            $appId = TpAppsEntity::getAppId($data['app_code']);
            if (!$appId) {
                throw new Exception("Invalid app code provided");
            }

            if ($data['social_media_type'] != SocialUser::USER_TYPE_USER_PROFILE) {
                $socialUserData = [
                    'social_media_id' => $data['social_media_id'],
                    'social_media_type' => $data['social_media_type'],
                    'name' => $data['name'],
                    'picture' => $data['picture'],
                    'app_id' => $appId,
                ];
                $userId = SocialUser::saveUserAndGetId($socialUserData, $data['device_uuid']);
            } else {
                $userId = $data['social_media_id'];
            }

            $commentData = [
                'contact_id' => $data['contact_id'],
                'comment' => $data['comment'],
                'user_id' => $userId,
                'user_type' => $data['social_media_type']
            ];
            $createdId = ContactUsComments::create($commentData)->id;
            $dataComment = ContactUsComments::getContactUsComment($createdId);
            $result = [
                'success' => true,
                'message' => ['Contact Us Comment successfully added.'],
                'data' => $dataComment
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

}
