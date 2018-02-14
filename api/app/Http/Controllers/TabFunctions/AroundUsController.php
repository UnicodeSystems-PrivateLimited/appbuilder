<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\AroundUs;
use App\Models\TabFunctions\AroundUsItem;
use App\Models\TabFunctions\AroundUsComments;
use App\Models\TpAppsTabEntity;
use App\Models\TpAppsEntity;
use App\Models\TabFunctions\SocialUser;
use App\Helpers\Helper;

class AroundUsController extends Controller {
    
    const IMAGE_UPLOAD_PATH = 'app/public/functions/around-us';
    //category validation
    private static function _getCommonValidationRules(): array {
        return [            
            'category_name' => 'required|max:256',
            'color' => 'required|max:256',
        ];
    }    
    private static function _getValidationMessages() {
        return [];
    }
    
    //Around Us item validation
    private static function _getCommonValidationRulesAroundUsItem(): array {
        return [            
            'name' => 'required|max:256',
            'website' => 'max:256|url',
            'email_id' => 'email',
            'telephone' => 'numeric',
            'image' => 'mimes:jpeg,jpg,png|max:10000',
            'm_lat' => "required_if:isMapDataSet,1",
            'm_long' => "required_if:isMapDataSet,1"
        ];
    }    
    private static function _getValidationMessagesAroundUsItem() {
        return [
            'telephone' => 'The telephone number is invalid.',
            'm_lat.required_if' => 'The address is required.',
            'm_long.required_if' => 'The address is required.'
        ];
    }
    
    //comment validation for Around Us
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
     * Load the around us tabData, categoryData, itemData
     */
    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $category_list = AroundUs::getAroundUsCategoryList($request->tabId);

            $data = [
                'categoryData' => $category_list,
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
            ];
            if(!$category_list->isEmpty()) {
                $data['itemData'] = AroundUsItem::getAllItemData($request->tabId);
            }    
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
     * EDIT Category for Around Us
     */
    public function saveCategory(Request $request) {
        try {
            $category = $request->all();            
            if(!empty($category)){
            foreach($category as $value){
                $valueArr[$value['id']] = ['category_name' => $value['category_name'],'color' => $value['color']];
            }
            }
            
            $catRules = array(
            'category_name' => 'required|max:256',
            'color'    => 'required'
            );
            if(!empty($category)){
            foreach($category as $value)
            {
                $categ = array('category_name' => $value['category_name'],'color' => $value['color']);
                $categValidator = Validator::make($categ, $catRules);
                if ($categValidator->fails()) {
                 throw new Exception(json_encode($categValidator->errors()));
                }
            }
            } 

            AroundUs::updateMultiple($valueArr);            
            $result = [
                'success' => TRUE,
                'message' => ['Around Us information successfully edited.'],
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
     * Saves the image file and returns the saved file name.
     * @return string
     */
    private static function _uploadImage($image, string $uploadPath , $width, $height): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_around_us_image.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->resize($width, $height)
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }
    
    public static function getImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::IMAGE_UPLOAD_PATH);
    }
    
    //upload url is used by model function while returning image from database
    public static function getImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::IMAGE_UPLOAD_PATH);
    }
    
    //Around Us -- Items
     /**
     * Create and Save item for around_us_id
     */
    
    public function saveItem(Request $request) {
        try {
            $data = $request->all();
            $image = $request->file('image');
            $data['image'] = $image;
            
            if($request->id){
            $validator = Validator::make($data, array_merge(self::_getCommonValidationRulesAroundUsItem(), ['id' => 'required|integer','around_us_id' => 'required|integer','image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE]), self::_getValidationMessagesAroundUsItem());
            }
            else{
            $validator = Validator::make($data, array_merge(self::_getCommonValidationRulesAroundUsItem(), ['around_us_id' => 'required|integer','image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE]), self::_getValidationMessagesAroundUsItem());    
            }
            
            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()->unique()));
            }  
            
            // Save image            
            if (!empty($image)) {
                $data['image'] = self::_uploadImage($image, self::getImageUploadPath(),140,140);
            }else{
                unset($data['image']);
            }
            
            //unset field isMapDataSet from form data. The variable is set if the map is clicked.
            unset($data['isMapDataSet']);
            unset($data['category_name']);
            unset($data['color']);
            
            if($request->id){
            AroundUsItem::where('id', $request->id)->update($data);  
            $result = [
                'success' => TRUE,
                'message' => ['Around Us item successfully edited.'],
            ];
            }else{
            AroundUsItem::create($data);  
            $result = [
                'success' => TRUE,
                'message' => ['Around Us item successfully added.'],
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
     * Get the items of category
     */
    public function itemList(Request $request) {
        try {
            if (empty($request->aroundUsId)) {
                throw new Exception('Around Us Id not found.');
            }
            $data = AroundUsItem::getCategoryItemList($request->aroundUsId);
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
     * Delete item  for Around Us
     */
    public function deleteItem(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }            
            AroundUsItem::deleteAroundUsItem($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Item information for around us id successfully deleted.'],
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
     * sort the Around Us items
     */
    public function sortAroundUsItem(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            AroundUsItem::updateMultiple($sortData);
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
     * get the around us item data
     */
    public function getItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = AroundUsItem::getItemData($request->id);
            $data = [
                'itemData' => AroundUsItem::getItemData($request->id)
            ];            
            if (!empty($data['itemData']->id)) {                
                $data['comments'] = AroundUsComments::getComments($request->id);
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
    
    //delete thumbnail image
    public function deleteThumbnail(Request $request) {
        try {
            if (empty($request->itemId)) {
                throw new Exception('Item ID not found');
            }
            AroundUsItem::where('id', $request->itemId)->update(['image'  => NULL]);
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
       * Comments -------- Around Us
       
       * Add/Edit Comments
       */
    public function saveComment(Request $request) {
       try {
            $data = $request->all();
            $rules = ['item_id' => 'required|integer', 'description' => 'required'];
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
                $userId = SocialUser::saveUserAndGetId($socialUserData,$data['device_uuid']);
            } else {
                $userId = $data['social_media_id'];
            }
            $commentData = [
                'item_id' => $data['item_id'],
                'description' => $data['description'],
                'user_id' => $userId,
                'user_type' => $data['social_media_type']
            ];
            $createdId = AroundUsComments::create($commentData)->id;
            $dataComment = AroundUsComments::getComment($createdId);
            $result = [
                'success' => TRUE,
                'message' => ['Around Us Comment successfully added.'],
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
     * Load the comments for around us id
     */
    public function commentList(Request $request) {
         try {
            if (empty($request->contact_id)) {
                throw new Exception('contact id not found.');
            }
            $comment_list = AroundUsComments::getComments($request->itemId);
            if ($comment_list) {
                $comment_list_count = count($comment_list);
            } else {
                $comment_list_count = 0;
            }
            $data = [
                'comments' => $comment_list,
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
     * delete the comment
     */
    public function deleteComment(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            AroundUsComments::deleteComment($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Comment information for Around Us Item successfully deleted.'],
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
            AroundUsComments::updateMultiple($sortData);
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

}