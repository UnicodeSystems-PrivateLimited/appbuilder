<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use App\Models\TpAppsTabEntity;
use App\Models\TabFunctions\SocialUser;
use App\Models\TpAppsEntity;
use App\Models\TabFunctions\FanWall;

/**
 * Description of SocialController
 *
 * @author unicode
 */
class SocialController extends Controller {

    public function saveSocialUser(Request $request) {
        try {
            $data = $request->all();
            $user = SocialUser::where('social_media_id', $data['social_media_id'])->where('social_media_type', $data['social_media_type'])->first();
            $appId = TpAppsEntity::getAppId($data['app_code']);
            if (!$appId) {
                throw new Exception("Invalid app code provided");
            }
            unset($data['app_code']);
            if ($user) {
                $data['app_id'] = $appId;
                SocialUser::where('social_media_id', $data['social_media_id'])->where('social_media_type', $data['social_media_type'])->update($data);
            } else {
                $data['app_id'] = $appId;
                SocialUser::create($data);
            }
            $result = [
                'success' => TRUE,
                'message' => ['Member successfully saved.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getUserData(Request $request) {
        try {
            if (empty($request->socialMediaId) || empty($request->socialMediaType) || empty($request->appCode)) {
                throw new Exception("Provided data incomplete");
            }

            $appId = TpAppsEntity::getAppId($request->appCode);

            if (!$appId) {
                throw new Exception("Invalid app code provided");
            }

            $user = SocialUser::where('social_media_id', $request->socialMediaId)->where('social_media_type', $request->socialMediaType)->first();
            $comments = [];
            $totalFanWallPosts = 0;

            if ($user) {
                $comments = SocialUser::getAllComments($user->id, $appId);
                $totalFanWallPosts = FanWall::getUserPostCount($user->id, $appId);
            }

            $result = [
                'success' => TRUE,
                'data' => [
                    'comments' => $comments,
                    'totalFanWallPosts' => $totalFanWallPosts,
                    'user' => $user,
                ]
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function init(Request $request) {
        try {
            if ($request->appId == 'null' || empty($request->appId)) {
                throw new Exception('App Id not found.');
            }
            $userList = SocialUser::userList($request->appId);
            $data = [
                'userList' => $userList,
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

    public function deleteUser(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            SocialUser::deleteUser($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['User information successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function updateSocialShareCount(Request $request) {
        try {
            if (empty($request->socialMediaId) || empty($request->socialMediaType) || empty($request->appCode)) {
                throw new Exception("Provided data incomplete");
            }
            $appId = TpAppsEntity::getAppId($request->appCode);

            if (!$appId) {
                throw new Exception("Invalid app code provided");
            }

            SocialUser::incrementShareCount($appId, $request->socialMediaId, $request->socialMediaType);
            $totalCount = SocialUser::getShareCount($appId, $request->socialMediaId, $request->socialMediaType);
            $result = [
                'success' => TRUE,
                'message' => ['updated Successfully'],
                'totalCount' => $totalCount,
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
