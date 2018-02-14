<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\ContentTabTwo;
use App\Models\TabFunctions\Content2Comments;
use App\Models\TabFunctions\SocialUser;
use App\Models\TpAppsTabEntity;
use App\Models\TpAppsEntity;
use App\Models\Display\GlobalStyle;
use App\Helpers\Helper;

class ContentTabTwoController extends Controller {

    const THUMBNAIL_IMAGE_UPLOAD_PATH = 'app/public/functions/content-tab-2/thumbnail';
    const PHONE_HEADER_IMAGE_UPLOAD_PATH = 'app/public/functions/content-tab-2/phone';
    const TAB_HEADER_IMAGE_UPLOAD_PATH = 'app/public/functions/content-tab-2/tablet';

    private static function _getCommonValidationRules(): array {
        return [
            'background_color' => 'required',
            'text_color' => 'required',
            'name' => 'required|max:256',
            'tablet_header_image' => 'mimes:jpeg,jpg,png|max:10000',
            'thumbnail' => 'mimes:jpeg,jpg,png|max:10000'
        ];
    }

    private static function _getValidationMessages() {
        return [];
    }

    private static function _getCommonValidationRulesColors(): array {
        return [
            'background_color' => 'required',
            'text_color' => 'required'
        ];
    }

    private static function _getValidationMessagesColors() {
        return [];
    }

    private static function _getCommonValidationRulesComments(): array {
        return [
            'name' => 'required|max:256',
            'description' => 'required|max:256'
        ];
    }

    private static function _getValidationMessagesComments() {
        return [
        ];
    }

    /**
     * Load the contact tab 2 list, and tab data
     */
    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $style = GlobalStyle::getGlobalStyleFeatures(TpAppsTabEntity::find($request->tabId)->app_id);
            if (!empty($style)) {
                $style->features = $style->features ? json_decode($style->features) : NULL;
            } else {
                $style = NULL;
            }
            $data = [
                'itemData' => ContentTabTwo::getContentDataList($request->tabId),
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
                'style' => $style
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
     * Load the contact tab 2 single item data
     */
    public function getItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }

            $data = [
                'itemData' => ContentTabTwo::getContentData($request->id),
                'comments' => Content2Comments::getComments($request->id)
            ];
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

    /**
     * Get the contact tab 2 list
     */
    public function contentTwoList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('ID not found.');
            }
            $data = ContentTabTwo::getContentDataList($request->tabId);
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

    /**
     * Saves the image file and returns the saved file name.
     * @return string
     */
    private static function _uploadImage($image, string $uploadPath, $width, $height): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_content_tab_2_image.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->resize($width, $height)
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    //phone header image
    public static function getPhoneHeaderImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::PHONE_HEADER_IMAGE_UPLOAD_PATH);
    }

    //upload url is used by model function while returning image from database
    public static function getPhoneHeaderImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::PHONE_HEADER_IMAGE_UPLOAD_PATH);
    }

    //tablet header image
    public static function getTabletHeaderImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::TAB_HEADER_IMAGE_UPLOAD_PATH);
    }

    //upload url is used by model function while returning image from database
    public static function getTabletHeaderImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::TAB_HEADER_IMAGE_UPLOAD_PATH);
    }

    //thumbnail image
    public static function getThumbNailImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::THUMBNAIL_IMAGE_UPLOAD_PATH);
    }

    //upload url is used by model function while returning image from database
    public static function getThumbNailImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::THUMBNAIL_IMAGE_UPLOAD_PATH);
    }

    /**
     * Create and Save content for content tab 2
     */
    public function saveContent(Request $request) {
        try {
            $data = $request->all();
            $routeName = \Request::route()->getName();

            $phone_header_image = $request->file('phone_header_image');
            $tablet_header_image = $request->file('tablet_header_image');
            $item_thumbnail_image = $request->file('thumbnail');
            $data['phone_header_image'] = $phone_header_image;
            $data['tablet_header_image'] = $tablet_header_image;
            $data['thumbnail'] = $item_thumbnail_image;


            if ($request->id) {
                if ($routeName == 'content-tab-2.update-colors') {
                    $validator = Validator::make($data, array_merge(self::_getCommonValidationRulesColors(), ['id' => 'required|integer']), self::_getValidationMessagesColors());
                } else if ($data['phone_header_image'] == null && $data['is_header_required'] == 1) {
                    if ($request->phone_header_image_url == null) {
                        $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRules(), ['phone_header_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'id' => 'required|integer'])), self::_getValidationMessages());
                    } else {
                        $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRules(), ['id' => 'required|integer', 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE])), self::_getValidationMessages());
                    }
                } else {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRules(), ['id' => 'required|integer', 'phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE])), self::_getValidationMessages());
                }
            } else {
                if ($data['is_header_required'] == 1) {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRules(), ['required|phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tab_id' => 'required|integer'])), self::_getValidationMessages());
                } else {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRules(), ['phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tab_id' => 'required|integer'])), self::_getValidationMessages());
                }
            }

            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            // Save phone header image
            if (!empty($phone_header_image)) {
                $data['phone_header_image'] = self::_uploadImage($phone_header_image, self::getPhoneHeaderImageUploadPath(), 640, 264);
            } else {
                if ($routeName != 'content-tab-2.update-colors') {
                    if ($data['phone_header_image'] == null && $data['is_header_required'] == 1) {
                        if ($request->phone_header_image_url == null) {
                            throw new Exception('Phone header image field is required.');
                        }
                    }
                }
                unset($data['phone_header_image']);
            }
            unset($data['phone_header_image_url']);

            // Save tablet header image
            if (!empty($tablet_header_image)) {
                $data['tablet_header_image'] = self::_uploadImage($tablet_header_image, self::getTabletHeaderImageUploadPath(), 1536, 1920);
            } else {
                unset($data['tablet_header_image']);
            }
            // Save item thumbnail image
            if (!empty($item_thumbnail_image)) {
                $data['thumbnail'] = self::_uploadImage($item_thumbnail_image, self::getThumbNailImageUploadPath(), 140, 140);
            } else {
                unset($data['thumbnail']);
            }

            if ($request->id) {
                ContentTabTwo::where('id', $request->id)->update($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Content Tab two information successfully edited.'],
                ];
            } else {
                if (empty($data['phone_header_image']) && $data['is_header_required'] == 1) {
                    throw new Exception('Phone Header Image cannot be empty.');
                }
                ContentTabTwo::create($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Contact Tab two information successfully added.'],
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

    /**
     * Delete content for content tab 2
     */
    public function deleteContent(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            ContentTabTwo::deleteContentTabTwo($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Content information for contact successfully deleted.'],
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
     * sort the contents
     */
    public function sortContent(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            ContentTabTwo::updateMultiple($sortData);
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

    public function deleteImage(Request $request) {
        try {
            if ($request->imageType !== 'phone_header' && $request->imageType !== 'tablet_header') {
                throw new Exception('Invalid URL');
            }
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            ContentTabTwo::where('id', $request->id)->update([$request->imageType . '_image' => NULL]);
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

    //delete thumbnail image
    public function deleteThumbnail(Request $request) {
        try {
            if ($request->imageType !== 'thumbnail') {
                throw new Exception('Invalid URL');
            }
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            ContentTabTwo::where('id', $request->id)->update([$request->imageType => NULL]);
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

    /**
     * Comments -------- Content tab 2

     * Add/Edit Comments for Content tab 2
     */
    public function saveComment(Request $request) {
        try {
            $data = $request->all();
            $rules = ['content_id' => 'required|integer', 'description' => 'required'];
            $validator = Validator :: make($data, $rules);
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
                'user_id' => $userId,
                'content_id' => $data['content_id'],
                'description' => $data['description'],
                'user_type' => $data['social_media_type']
            ];
            $createdId = Content2Comments::create($commentData)->id;
            $dataComment = Content2Comments::getComment($createdId);
            $result = [
                'success' => TRUE,
                'message' => ['Content Tab 2 Comment successfully added.'],
                'data' => $dataComment
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
     * Load the comments for content tab2
     */
    public function commentList(Request $request) {
        try {
            if (empty($request->eventId)) {
                throw new Exception('Content id not found.');
            }
            $comment_list = Content2Comments::getComments($request->content_id);
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
     * delete the comment for content tab2
     */
    public function deleteComment(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            Content2Comments::deleteComment($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Comment information for contentTab2 successfully deleted.'],
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
     * sort the comments
     */
    public function sortComments(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            Content2Comments::updateMultiple($sortData);
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

    public function getSectionWiseItemList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('ID not found.');
            }
            $data = ContentTabTwo::getSectionWiseList($request->tabId);
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
