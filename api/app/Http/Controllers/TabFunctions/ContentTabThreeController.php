<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\ContentTabThree;
use App\Models\TabFunctions\ContentTabThreeItem;
use App\Models\TabFunctions\Content3Comments;
use App\Models\TabFunctions\SocialUser;
use App\Models\TpAppsTabEntity;
use App\Models\TpAppsEntity;
use App\Models\Display\GlobalStyle;
use App\Helpers\Helper;

class ContentTabThreeController extends Controller {

    const THUMBNAIL_IMAGE_UPLOAD_PATH = 'app/public/functions/content-tab-3/thumbnail';
    const PHONE_HEADER_IMAGE_UPLOAD_PATH = 'app/public/functions/content-tab-3/item/phone';
    const TAB_HEADER_IMAGE_UPLOAD_PATH = 'app/public/functions/content-tab-3/item/tablet';
    const ITEM_THUMBNAIL_IMAGE_UPLOAD_PATH = 'app/public/functions/content-tab-3/item/thumbnail';
    const CKEDITOR_IMAGE_UPLOAD_PATH = 'app/public/functions/ckeditor/images';

    //category validation
    private static function _getCommonValidationRules(): array {
        return [
            'name' => 'required|max:256',
            'thumbnail' => 'mimes:jpeg,jpg,png|max:10000'
        ];
    }

    private static function _getValidationMessages() {
        return [];
    }

    //category item validation
    private static function _getCommonValidationRulesCategoryItem(): array {
        return [
            'name' => 'required|max:256',
            'tablet_header_image' => 'mimes:jpeg,jpg,png|max:10000',
            'thumbnail' => 'mimes:jpeg,jpg,png|max:10000'
        ];
    }

    private static function _getValidationMessagesCategoryItem() {
        return [];
    }

    //comment validation for content tab 3
    private static function _getCommonValidationRulesComments(): array {
        return [
            'name' => 'max:256',
            'description' => 'required|max:256'
        ];
    }

    private static function _getValidationMessagesComments() {
        return [
        ];
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
                'listData' => ContentTabThree::getCategoryList($request->tabId),
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
     * Get the contact tab 3 list
     */
    public function categoryList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('ID not found.');
            }
            $data = ContentTabThree::getCategoryList($request->tabId);
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
        $fileName = Helper::getMilliTimestamp() . '_contenttab_3_thumbimage.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->resize($width, $height)
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    public static function getThumbnailImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::THUMBNAIL_IMAGE_UPLOAD_PATH);
    }

    //upload url is used by model function while returning image from database
    public static function getThumbnailImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::THUMBNAIL_IMAGE_UPLOAD_PATH);
    }

    //upload url is used by model function while returning image from database
    public static function getCkEditorImageUploadUrl(): string {
        return Helper::getUploadDirectoryURL(self::CKEDITOR_IMAGE_UPLOAD_PATH);
    }

    //ck editor image
    public static function getCkEditorImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::CKEDITOR_IMAGE_UPLOAD_PATH);
    }

    /**
     * Create and Save content for content tab 3
     */
    public function saveContent(Request $request) {
        try {
            $data = $request->all();

            $imageThumbnail = $request->file('thumbnail');
            $data['thumbnail'] = $imageThumbnail;

            $rules = $request->id ? ['id' => 'required|integer', 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE] : ['tab_id' => 'required|integer', 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE];
            $validator = Validator::make($data, array_merge(self::_getCommonValidationRules(), $rules), self::_getValidationMessages());

            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }

            // Save thumbnail

            if (!empty($imageThumbnail)) {
                $data['thumbnail'] = self::_uploadImage($imageThumbnail, self::getThumbnailImageUploadPath(), 140, 140);
            } else {
                unset($data['thumbnail']);
            }

            if ($request->id) {
                ContentTabThree::where('id', $request->id)->update($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Content Tab three information successfully edited.'],
                ];
            } else {
                ContentTabThree::create($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Contact Tab three information successfully added.'],
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
     * Delete category content for content tab 3
     */
    public function deleteCategory(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            ContentTabThree::deleteContentTabThreeCategory($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Category information for contact tab 3 successfully deleted.'],
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
    public function sortCategory(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            ContentTabThree::updateMultiple($sortData);
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

    //delete thumbnail image
    public function deleteThumbnail(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            ContentTabThree::where('id', $request->id)->update(['thumbnail' => NULL]);
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
     * Load the content tab 3 single item data
     */
    public function getCategoryData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }

            $data = [
                'categoryData' => ContentTabThree::getCategoryData($request->id)
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

    //Content Tab 3 Category Items

    /**
     * Saves the image file and returns the saved file name.
     * @return string
     */
    private static function _uploadImage_content_tab_3($image, string $uploadPath, $width, $height): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_content_tab_3_image.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->resize($width, $height)
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    /**
     * Saves the image for ckEditor returns the saved file name.
     * @return string
     */
    private static function _uploadImage_ck_editor($image, string $uploadPath): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_ck_editor_image.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
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
    public static function getItemThumbNailImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::ITEM_THUMBNAIL_IMAGE_UPLOAD_PATH);
    }

    //upload url is used by model function while returning image from database
    public static function getItemThumbNailImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::ITEM_THUMBNAIL_IMAGE_UPLOAD_PATH);
    }

    /**
     * Create and Save item for content tab 3 Category
     */
    public function saveCategoryItem(Request $request) {
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
                if ($routeName == 'content-tab-3.update-colors') {
                    $validator = Validator::make($data, array_merge(self::_getCommonValidationRulesColors(), ['id' => 'required|integer']), self::_getValidationMessagesColors());
                } else if ($data['phone_header_image'] == null && $data['is_header_required'] == 1) {
                    if ($request->phone_header_image_url == null) {
                        $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRulesCategoryItem(), ['phone_header_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'id' => 'required|integer'])), self::_getValidationMessages());
                    } else {
                        $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRulesCategoryItem(), ['id' => 'required|integer', 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE])), self::_getValidationMessagesCategoryItem());
                    }
                } else {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRulesCategoryItem(), ['id' => 'required|integer', 'phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE])), self::_getValidationMessagesCategoryItem());
                }
            } else {
                if($data['is_header_required'] == 1) {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRulesCategoryItem(), ['phone_header_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'category_id' => 'required|integer'])), self::_getValidationMessagesCategoryItem());
                } else {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRulesCategoryItem(), ['phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'category_id' => 'required|integer'])), self::_getValidationMessagesCategoryItem());
                }
            }

            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }

            // Save phone header image            
            if (!empty($phone_header_image)) {
                $data['phone_header_image'] = self::_uploadImage_content_tab_3($phone_header_image, self::getPhoneHeaderImageUploadPath(), 640, 264);
            } else {
                if ($routeName != 'content-tab-3.update-colors') {
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
                $data['tablet_header_image'] = self::_uploadImage_content_tab_3($tablet_header_image, self::getTabletHeaderImageUploadPath(), 1536, 634);
            } else {
                unset($data['tablet_header_image']);
            }
            // Save item thumbnail image            
            if (!empty($item_thumbnail_image)) {
                $data['thumbnail'] = self::_uploadImage_content_tab_3($item_thumbnail_image, self::getItemThumbNailImageUploadPath(), 140, 140);
            } else {
                unset($data['thumbnail']);
            }

            if ($request->id) {
                ContentTabThreeItem::where('id', $request->id)->update($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Content Tab three Category item successfully edited.'],
                ];
            } else {
                ContentTabThreeItem::create($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Contact Tab three Category item successfully added.'],
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
     * Get the contact tab 3 category item list
     */
    public function categoryItemList(Request $request) {
        try {
            if (empty($request->categoryId)) {
                throw new Exception('Category Id not found.');
            }
            $data = ContentTabThreeItem::getCategoryItemList($request->categoryId);
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
     * Delete category item  for content tab 3
     */
    public function deleteCategoryItem(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            ContentTabThreeItem::deleteContentTabThreeCategoryItem($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Item information for category id successfully deleted.'],
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
     * sort the Category items
     */
    public function sortCategoryItem(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            ContentTabThreeItem::updateMultiple($sortData);
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
            if (empty($request->itemId)) {
                throw new Exception('Item ID not found');
            }
            ContentTabThreeItem::where('id', $request->itemId)->update([$request->imageType . '_image' => NULL]);
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

    //delete thumbnail content tab 3 item
    public function deleteThumbnailContentTab3Item(Request $request) {
        try {
            if (empty($request->itemId)) {
                throw new Exception('Item ID not found');
            }
            ContentTabThreeItem::where('id', $request->itemId)->update(['thumbnail' => NULL]);
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
     * Load the content tab 3 single item data
     */
    public function getItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }

            $data = [
                'itemData' => ContentTabThreeItem::getContentData($request->id),
                'comments' => Content3Comments::getComments($request->id)
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
     * Comments -------- Content tab 3

     * Add/Edit Comments for Content tab 3
     */
    public function saveComment(Request $request) {
        try {
            $data = $request->all();
            if ($request->id) {
                $validator = Validator::make($data, array_merge(self::_getCommonValidationRulesComments(), ['id' => 'required|integer']), self::_getValidationMessagesComments());
            } else {
                $validator = Validator::make($data, array_merge(self::_getCommonValidationRulesComments(), ['content_id' => 'required|integer']), self::_getValidationMessagesComments());
            }

            if ($validator->fails()) {
                throw new Exception($validator->errors());
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
            $createdId = Content3Comments::create($commentData)->id;
            $dataComment = Content3Comments::getComment($createdId);
            $result = [
                'success' => TRUE,
                'message' => ['ContentTab3 comment successfully added.'],
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
     * Load the comments for content tab3
     */
    public function commentList(Request $request) {
        try {
            if (empty($request->content_id)) {
                throw new Exception('content id not found.');
            }

            $data = Content3Comments::getComments($request->content_id);
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
     * delete the comment for content tab3
     */
    public function deleteComment(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            Content3Comments::deleteComment($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Comment information for contentTab3 successfully deleted.'],
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
            Content3Comments::updateMultiple($sortData);
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

    /**
     * Get Section wise category list
     */
    public function getSectionWiseCategoryList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('ID not found.');
            }
            $data = ContentTabThree::getSectionWiseList($request->tabId);
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
     * Get section wise category item list
     */
    public function getSectionWiseCategoryItemList(Request $request) {
        try {
            if (empty($request->categoryId)) {
                throw new Exception('Category Id not found.');
            }
            $data = ContentTabThreeItem::getSectionWiseCategoryItemList($request->categoryId);
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

    public function uploadCkEditorImage(Request $request) {
        try {
            $funcNum = $request->CKEditorFuncNum;
            $imagename = self::_uploadImage_ck_editor($request->upload, self::getCkEditorImageUploadPath(), 640, 264);
            $imageURL = self :: getCkEditorImageUploadUrl();
            $url = $imageURL . '/' . $imagename;
            $message = 'File uploaded successfully.';
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
            return response()->json($result);
            ;
        }
        echo "<script type='text/javascript'>window.parent.CKEDITOR.tools.callFunction($funcNum, '$url', '$message');</script>";
    }

}
