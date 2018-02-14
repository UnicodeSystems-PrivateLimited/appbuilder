<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\MasterLoyalty;
use App\Models\TabFunctions\Loyalty;
use App\Models\TabFunctions\AdvancedLoyalty;
use App\Models\TabFunctions\AdvancedLoyaltyActivity;
use App\Models\TabFunctions\LoyaltyActivity;
use App\Models\TabFunctions\LoyaltyPerk;
use App\Models\TabFunctions\SocialUser;
use App\Models\TpAppsTabEntity;
use App\Models\TpAppsEntity;
use App\Models\TpRegisteredDevice;
use App\Models\TabFunctions\LoyaltyStampActivity;
use App\Helpers\Helper;

class LoyaltyController extends Controller {

    const THUMBNAIL_IMAGE_UPLOAD_PATH = 'app/public/functions/loyalty/thumbnail';
    const PERK_THUMBNAIL_IMAGE_UPLOAD_PATH = 'app/public/functions/loyalty/perk/thumbnail';
    const GAUGE_ICON_UPLOAD_PATH = 'app/public/functions/loyalty/gauge';
    const PHONE_HEADER_IMAGE_UPLOAD_PATH = 'app/public/functions/loyalty/phone';
    const TAB_HEADER_IMAGE_UPLOAD_PATH = 'app/public/functions/loyalty/tablet';

    private static function _getCommonValidationAdvanceLoyaltyRules(): array {
        return [
            'loyalty_title' => 'required|max:256',
            'secret_code' => 'required|max:256',
            'stamp_award_amount' => 'required|integer',
            'instruction' => 'required|max:256',
            'perk_unit_type' => 'required|max:256',
            'perk_unit' => 'required|integer',
            'push_accept_award' => 'required|max:256',
            'thumbnail' => 'mimes:jpeg,jpg,png|max:10000',
                // 'title' => 'required|max:256',
                // 'description' => 'required|max:256',
                // 'points' => 'required|integer'
        ];
    }

    private static function _getCommonValidationPerkRules(): array {
        return [
            'title' => 'required|max:256',
            'description' => 'required|max:256',
            'points' => 'required|integer'
        ];
    }

    private static function _getValidationPerkMessages() {
        return [];
    }

    private static function _getValidationAdvanceLoyaltyMessages() {
        return [];
    }

    private static function _getCommonValidationLoyaltyRules(): array {
        return [
            'reward_text' => 'required|max:256',
            'secret_code' => 'required|max:256',
            'tablet_header_image' => 'mimes:jpeg,jpg,png|max:10000',
            'thumbnail' => 'mimes:jpeg,jpg,png|max:10000'
        ];
    }

    private static function _getValidationLoyaltyMessages() {
        return [
            'reward_text' => 'Reward text is required.'
        ];
    }

    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }

            $data = [
                'loyaltylist' => MasterLoyalty::loyaltyList($request->tabId),
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

    public function appInit(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            if (empty($request->appId)) {
                throw new Exception('App ID not found.');
            }
            if (empty($request->deviceUuid)) {
                throw new Exception('Device UUID not found.');
            }
            $device_id = TpRegisteredDevice::getRegisteredDevice($request->appId, $request->deviceUuid);
            $data = [
                'loyaltylist' => MasterLoyalty::appLoyaltyList($request->tabId, $device_id),
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

    public function sortList(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            MasterLoyalty::updateMultiple($sortData);
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

    public function deleteItem(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            if (!isset($request->is_advance)) {
                throw new Exception('Loyalty type not found.');
            }
            $is_advance = $request->is_advance;
            $item_id = $request->id;
            //if is_advance 1 delete from tp_func_loyalty_advanced plus delete from tp_func_loyalty_mst
            MasterLoyalty::deleteLoyaltyData($is_advance, $item_id);
            if ($is_advance == 0) {
                Loyalty::deleteLoyalty($item_id);
            } else {
                AdvancedLoyalty::deleteLoyalty($item_id);
            }
            //if is_advance 0 delete from tp_func_loyalty +plus+ delete from tp_func_loyalty_mst
            //item_id is id in both tp_func_loyalty_advanced and tp_func_loyalty
//            MasterLoyalty::deleteLoyalty($request->id);
//            Loyalty::deleteLoyalty($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Item information successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteAdvancedItem(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            MasterLoyalty::deleteLoyalty($request->id);
            AdvancedLoyalty::deleteLoyalty($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Item information successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = MasterLoyalty::getLoyaltyInfo($request->id);
            $data->activities = LoyaltyActivity::getActivities($request->id);
            $result = [
                'success' => TRUE,
                'data' => $data,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function getAdvItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = MasterLoyalty::getAdvLoyaltyInfo($request->id);
            $data->activities = AdvancedLoyaltyActivity::getActivities($request->id);
            $data->activitiesByUser = AdvancedLoyaltyActivity::getActivitiesByUser($request->id);
            $result = [
                'success' => TRUE,
                'data' => $data,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function getPerkList(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = LoyaltyPerk::perkList($request->id);
            $result = [
                'success' => TRUE,
                'data' => $data,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public static function getPhoneHeaderImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::PHONE_HEADER_IMAGE_UPLOAD_PATH);
    }

    public static function getPhoneHeaderImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::PHONE_HEADER_IMAGE_UPLOAD_PATH);
    }

    public static function getTabletHeaderImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::TAB_HEADER_IMAGE_UPLOAD_PATH);
    }

    public static function getTabletHeaderImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::TAB_HEADER_IMAGE_UPLOAD_PATH);
    }

    public static function getThumbnailImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::THUMBNAIL_IMAGE_UPLOAD_PATH);
    }

    public static function getThumbnailImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::THUMBNAIL_IMAGE_UPLOAD_PATH);
    }

    public static function getPerkThumbnailUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::PERK_THUMBNAIL_IMAGE_UPLOAD_PATH);
    }

    public static function getPerkThumbnailUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::PERK_THUMBNAIL_IMAGE_UPLOAD_PATH);
    }

    public static function getGuageIconUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::GAUGE_ICON_UPLOAD_PATH);
    }

    public static function getGuageIconUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::GAUGE_ICON_UPLOAD_PATH);
    }

    /**
     * Saves the image file and returns the saved file name.
     * @return string
     */
    private static function _uploadImage($image, string $uploadPath, $width, $height): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_loyalty_image.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->resize($width, $height)
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    public function saveLoyalty(Request $request) {
        try {
            $data = $request->all();

            $phone_header_image = $request->file('phone_header_image');
            $tablet_header_image = $request->file('tablet_header_image');
            $thumbnail = $request->file('thumbnail');
            $data['phone_header_image'] = $phone_header_image;
            $data['tablet_header_image'] = $tablet_header_image;
            $data['thumbnail'] = $thumbnail;

            if ($request->id) {
                if ($request->phone_header_image == null && $request->is_header_required == 1) {
                    if ($request->phone_header_image_url == null) {
                        $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationLoyaltyRules(), ['phone_header_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'id' => 'required|integer'])), self::_getValidationLoyaltyMessages());
                    } else {
                        $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationLoyaltyRules(), ['id' => 'required|integer', 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE])), self::_getValidationLoyaltyMessages());
                    }
                } else {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationLoyaltyRules(), ['id' => 'required|integer', 'phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE])), self::_getValidationLoyaltyMessages());
                }
            } else {
                if ($data['is_header_required'] == 1) {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationLoyaltyRules(), ['phone_header_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tab_id' => 'required|integer'])), self::_getValidationLoyaltyMessages());
                } else {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationLoyaltyRules(), ['phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'thumbnail' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tab_id' => 'required|integer'])), self::_getValidationLoyaltyMessages());
                }
            }

            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }



            $mstData['secret_code'] = $data['secret_code'];
            $mstData['tab_id'] = $request->tab_id;
            $mstData['is_advance'] = $data['is_advance'];
            $loyData['reward_text'] = $data['reward_text'];
            $loyData['square_count'] = $data['square_count'];
            $loyData['issue_freebie_loyalty'] = $data['issue_freebie_loyalty'];
            $loyData['freebie_text'] = $data['freebie_text'];
            $loyData['view_type'] = $data['view_type'];
            $loyData['gauge_display'] = $data['gauge_display'];
            $loyData['is_header_required'] = $data['is_header_required'];


            // Save phone header image
            if (!empty($phone_header_image)) {
                $data['phone_header_image'] = self::_uploadImage($phone_header_image, self::getPhoneHeaderImageUploadPath(), 640, 264);
                $loyData['phone_header_image'] = $data['phone_header_image'];
            } else {
                if ($data['phone_header_image'] == null && $data['is_header_required']) {
                    if ($request->phone_header_image_url == null) {
                        throw new Exception('Phone header image field is required.');
                    }
                }
                unset($data['phone_header_image']);
            }
            unset($data['phone_header_image_url']);

            // Save tablet header image
            if (!empty($tablet_header_image)) {
                $data['tablet_header_image'] = self::_uploadImage($tablet_header_image, self::getTabletHeaderImageUploadPath(), 1536, 1920);
                $loyData['tablet_header_image'] = $data['tablet_header_image'];
            } else {
                unset($data['tablet_header_image']);
            }

            if (!empty($thumbnail)) {
                $data['thumbnail'] = self::_uploadImage($thumbnail, self::getThumbnailImageUploadPath(), 140, 140);
                $mstData['thumbnail'] = $data['thumbnail'];
            } else {
                unset($data['thumbnail']);
            }

            if ($request->id) {
                Loyalty::where('id', $request->id)->update($loyData);
                MasterLoyalty::where('item_id', $request->id)->where('is_advance', $data['is_advance'])->update($mstData);
                $result = [
                    'success' => TRUE,
                    'message' => [' Loyalty Tab  information successfully edited.'],
                ];
            } else {
                if (empty($data['phone_header_image']) && $data['is_header_required'] == 1) {
                    throw new Exception('Phone Header Image cannot be empty.');
                }

                $createdId = Loyalty::create($loyData)->id;
                $mstData['item_id'] = $createdId;
                MasterLoyalty::create($mstData);
                $result = [
                    'success' => TRUE,
                    'message' => [' Loyalty Tab  information successfully added.'],
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

    public function saveAdvancedLoyalty(Request $request) {
        try {
            $data = $request->all();
            $perkData = [];
            $rules = $request->id ? ['id' => 'required|integer'] : ['tab_id' => 'required|integer'];
            $thumbnail = $request->file('thumbnail');
            $data['thumbnail'] = $thumbnail;
            $mstData['secret_code'] = $request->secret_code;
            $mstData['tab_id'] = $request->tab_id;
            $mstData['is_advance'] = 1;
            $advData['loyalty_title'] = $request->loyalty_title;
            $advData['stamp_award_amount'] = $request->stamp_award_amount;
            $advData['instruction'] = $request->instruction;
            $advData['perk_unit_type'] = $request->perk_unit_type;
            $advData['perk_unit'] = $request->perk_unit;
            $advData['no_of_perks'] = $request->no_of_perks;
            $advData['earn_credit'] = $request->earn_credit;
            $advData['push_accept_award'] = $request->push_accept_award;
            $perkData = $request->perkData;

            $validator = Validator::make($data, array_merge(self::_getCommonValidationAdvanceLoyaltyRules(), $rules), self::_getValidationAdvanceLoyaltyMessages());

            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }

            if (!empty($thumbnail)) {
                $data['thumbnail'] = self::_uploadImage($thumbnail, self::getThumbnailImageUploadPath(), 140, 140);
                $mstData['thumbnail'] = $data['thumbnail'];
            } else {
                unset($data['thumbnail']);
            }

            if (isset($perkData) && !empty($perkData)) {
                foreach ($perkData as $key => $value) {
                    $perk_thumbnail = $value['perk_thumbnail'];
                    if (!empty($perk_thumbnail) && is_object($perk_thumbnail)) {
                        $perk_thumbnail = self::_uploadImage($perk_thumbnail, self::getPerkThumbnailUploadPath(), 140, 140);
                        $perkData[$key]['perk_thumbnail'] = $perk_thumbnail;
                    } else {
                        unset($perkData[$key]['perk_thumbnail']);
                    }

                    $gauge_icon = $value['gauge_icon'];
                    if (!empty($gauge_icon) && is_object($gauge_icon)) {
                        $gauge_icon = self::_uploadImage($gauge_icon, self::getGuageIconUploadPath(), 140, 140);
                        $perkData[$key]['gauge_icon'] = $gauge_icon;
                    } else {
                        unset($perkData[$key]['gauge_icon']);
                    }
                }
            }

            if ($request->id) {
                AdvancedLoyalty::where('id', $request->id)->update($advData);
                MasterLoyalty::where('item_id', $request->id)->where('is_advance', 1)->update($mstData);
                foreach ($perkData as $key => $value) {
                    if (isset($value['id'])) {
                        $id = $value['id'];
                        $value['reuse_perk'] = $value['reuse_perk'] == 'true' ? 1 : 0;
                        LoyaltyPerk::where('id', $id)->where('loyalty_id', $request->id)->update($value);
                    } else {
                        $value['loyalty_id'] = $request->id;
                        $value['reuse_perk'] = $value['reuse_perk'] == 'true' ? 1 : 0;
                        LoyaltyPerk::create($value);
                    }
                }
                $result = [
                    'success' => TRUE,
                    'message' => [' Advanced Loyalty information successfully edited.'],
                ];
            } else {
                $createdId = AdvancedLoyalty::create($advData)->id;
                $mstData['item_id'] = $createdId;
                MasterLoyalty::create($mstData);
                foreach ($perkData as $key => $value) {
                    $value['loyalty_id'] = $createdId;
                    $value['reuse_perk'] = $value['reuse_perk'] == 'true' ? 1 : 0;
                    LoyaltyPerk::create($value);
                }

                $result = [
                    'success' => TRUE,
                    'message' => [' Advanced Loyalty information successfully added.'],
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

    public function deleteLoyaltyImage(Request $request) {
        try {
            if ($request->imageType !== 'phone_header' && $request->imageType !== 'tablet_header' && $request->imageType !== 'thumbnail') {
                throw new Exception('Invalid URL');
            }
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            if ($request->imageType == 'phone_header' || $request->imageType == 'tablet_header') {
                Loyalty::where('id', $request->id)->update([$request->imageType . '_image' => NULL]);
            } else {
                MasterLoyalty::where('item_id', $request->id)->where('is_advance', 0)->update([$request->imageType => NULL]);
            }
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

    public function deleteAdvLoyaltyImage(Request $request) {
        try {
            if ($request->imageType !== 'thumbnail') {
                throw new Exception('Invalid URL');
            }
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }

            MasterLoyalty::where('item_id', $request->id)->where('is_advance', 1)->update([$request->imageType => NULL]);

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

    public function deletePerkImage(Request $request) {
        try {
            if ($request->imageType !== 'perk_thumbnail' && $request->imageType !== 'gauge_icon') {
                throw new Exception('Invalid URL');
            }
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            LoyaltyPerk::where('id', $request->id)->update([$request->imageType => NULL]);
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

    public function deleteAdvancedActivity(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            AdvancedLoyaltyActivity::deleteActivity($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Activity successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteActivity(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            LoyaltyActivity::deleteActivity($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Activity successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getAppItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            if (empty($request->appId)) {
                throw new Exception('AppID not found.');
            }
            if (empty($request->deviceUuid)) {
                throw new Exception('Device UUID not found.');
            }
            $device_id = TpRegisteredDevice::getRegisteredDevice($request->appId, $request->deviceUuid);
            $data['itemData'] = MasterLoyalty::getAppItemData($request->id, $device_id);
            $data['stampCount'] = LoyaltyStampActivity::getStampCount($request->id, $device_id);
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

    public function getLoyaltyActivity(Request $request) {
        try {
            if (empty($request->item_id)) {
                throw new Exception('Item ID not found.');
            }
            $data = LoyaltyActivity::getActivities($request->item_id);
            $result = [
                'success' => TRUE,
                'data' => $data,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function getAdvLoyaltyActivity(Request $request) {
        try {
            if (empty($request->item_id)) {
                throw new Exception('Item ID not found.');
            }
            $data = AdvancedLoyaltyActivity::getActivities($request->item_id);
            $result = [
                'success' => TRUE,
                'data' => $data,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function saveLoyaltyActivity(Request $request) {
        try {
            $data = $request->all();
            $rules = ['item_id' => 'required|integer'];
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
            $target = $data['target'];
            if ($data['type'] == 'stamp' && $target < $data['totalTarget']) {
                $data['action'] = 'Completed' . ' ' . $target . ' ' . 'stamp';
            } elseif ($data['type'] == 'stamp' && $target == $data['totalTarget']) {
                $data['action'] = 'Unlocked this loyalty';
            } else {
                $data['action'] = 'Redeemed this loyalty';
            }
            $activityData = [
                'user_id' => $userId,
                'item_id' => $data['item_id'],
                'active' => $data['active'],
                'action' => $data['action'],
                'target' => $data['target'],
                'user_type' => $data['social_media_type']
            ];
//            $count = MasterLoyalty::select('stamp_count')->where('item_id', $data['item_id'])->where('is_advance' , 0)->first(); 
//            $stampData = [
//                'stamp_count' => $count->stamp_count + 1,
//            ];
            unset($data['type']);
            unset($data['totalTarget']);
            $createdId = LoyaltyActivity::create($activityData)->id;
//            MasterLoyalty::where('item_id', $data['item_id'])->where('is_advance' , 0)->update($stampData); 
            $activity = LoyaltyActivity::getActivity($createdId);
            $result = [
                'success' => TRUE,
                'message' => ['Activity successfully posted.'],
                'data' => $activity
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function saveAdvLoyaltyActivity(Request $request) {
        try {
            $data = $request->all();
            $rules = ['item_id' => 'required|integer'];
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
            $count = MasterLoyalty::select('stamp_count')->where('item_id', $data['item_id'])->where('is_advance', 1)->first();
            $stampData = [
                'stamp_count' => $count->stamp_count + $data['stamp_award_amount'],
            ];
            $activityData = [
                'user_id' => $userId,
                'item_id' => $data['item_id'],
                'action' => 'completed a stamp. Now at' . ' ' . $stampData['stamp_count'] . ' ' . $data['perk_unit_type'],
                'user_type' => $data['social_media_type']
            ];
            unset($data['stamp_award_amount']);
            unset($data['perk_unit_type']);
            unset($data['points']);
            unset($data['perk_title']);
            $createdId = AdvancedLoyaltyActivity::create($activityData)->id;
            $activity = AdvancedLoyaltyActivity::getActivity($createdId);
            MasterLoyalty::where('item_id', $data['item_id'])->where('is_advance', 1)->update($stampData);
            $result = [
                'success' => TRUE,
                'message' => ['Activity successfully posted.'],
                'data' => $activity
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteStampCount(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            MasterLoyalty::where('id', $request->id)->where('is_advance', 0)->update(['stamp_count' => 0]);
            $result = [
                'success' => TRUE,
                'message' => ['Stamp count successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function onPerkRedeem(Request $request) {
        try {
            $data = $request->all();
            $rules = ['item_id' => 'required|integer'];
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
            $count = MasterLoyalty::select('stamp_count')->where('item_id', $data['item_id'])->where('is_advance', 1)->first();
            if ($count->stamp_count < $data['points']) {
                throw new Exception('You need more points to redeem this perk');
            } else {
                $stampData = [
                    'stamp_count' => $count->stamp_count - $data['points'],
                ];
            }
            $perkData = [
                'user_id' => $userId,
                'item_id' => $data['item_id'],
                'action' => 'redeemed a' . ' ' . $data['perk_title'] . ' ' . $stampData['stamp_count'] . ' ' . $data['perk_unit_type'] . ' ' . 'remaining',
                'user_type' => $data['social_media_type']
            ];
            unset($data['points']);
            unset($data['perk_unit_type']);
            unset($data['perk_title']);
            unset($data['stamp_award_amount']);
            $createdId = AdvancedLoyaltyActivity::create($perkData)->id;
            $activity = AdvancedLoyaltyActivity::getActivity($createdId);
            MasterLoyalty::where('item_id', $data['item_id'])->where('is_advance', 1)->update($stampData);
            $result = [
                'success' => TRUE,
                'message' => ['Successfully posted.'],
                'data' => $activity
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function insertLoyaltyStampActivity(Request $request) {
        try {
            $data = $request->all();
            $data['device_id'] = TpRegisteredDevice::getRegisteredDevice($data['appId'], $data['deviceUuid']);
            unset($data['appId']);
            unset($data['deviceUuid']);
            $data['stamp_count'] = 1;
            $createdId = LoyaltyStampActivity::create($data)->id;
            $stampcount = LoyaltyStampActivity::getStampCount($data['item_id'], $data['device_id']);
            $result = [
                'success' => TRUE,
                'message' => ['Activity successfully posted.'],
                'data' => $stampcount
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function clearLoyaltyStampActivity(Request $request) {
        try {
            $data = $request->all();
            $data['device_id'] = TpRegisteredDevice::getRegisteredDevice($data['appId'], $data['deviceUuid']);
            $x = LoyaltyStampActivity::deleteActivity($data['item_id'], $data['device_id']);
            $result = [
                'success' => TRUE,
                'message' => ['Activity cleared.'],
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
