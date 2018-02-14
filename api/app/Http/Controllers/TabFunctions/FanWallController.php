<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use App\Models\TabFunctions\FanWall;
use App\Models\TpAppsTabEntity;
use App\Models\TpAppsEntity;
use App\Helpers\Helper;
use App\Models\TabFunctions\SocialUser;

class FanWallController extends Controller {

    private static function _getCommonValidationRules(): array {
        return [
            'name' => 'max:256',
            'description' => 'required|max:256'
        ];
    }

    private static function _getValidationMessages() {
        return [];
    }

    /**
     * Load the comments and tab data
     */
    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }

            $data = [
                'comments' => FanWall::getComments($request->tabId),
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

    /**
     * Add/Edit Comment for tab id
     */
    public function save(Request $request) {
        try {
            $data = $request->all();

            $rules = $request->id ? ['id' => 'required|integer'] : ['tab_id' => 'required|integer'];
            $validator = Validator::make($data, array_merge(self::_getCommonValidationRules(), $rules), self::_getValidationMessages());
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
            $fanWallItemData = [
                'tab_id' => $data['tab_id'],
                'user_id' => $userId,
                'description' => $data['description'],
                'parent_id' => $data['parent_id'],
                'user_type' => $data['social_media_type']
            ];

            $createdId = FanWall::create($fanWallItemData)->id;
            $dataComment = FanWall::getCommentData($createdId);
            $result = [
                'success' => TRUE,
                'message' => ['Fan Wall Comment information successfully added.'],
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
     * get the voice recording info
     */
    public function getItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = [
                'commentData' => FanWall::getCommentData($request->id),
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
     * delete the fan wall comment
     */
    public function delete(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            FanWall::deleteComment($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Fan Wall comment successfully deleted.'],
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
     * sort the fan wall comments
     */
    public function sortFanWall(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            FanWall::updateMultiple($sortData);
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

    public function listItems(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }

            $result = [
                'success' => TRUE,
                'data' => FanWall::getCommentsForApp($request->tabId)
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function listReplies(Request $request) {
        try {
            if (empty($request->itemId)) {
                throw new Exception('Item ID not found.');
            }
            $result = [
                'success' => TRUE,
                'data' => FanWall::getReplies($request->itemId)
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
