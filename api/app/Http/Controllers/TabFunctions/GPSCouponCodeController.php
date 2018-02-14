<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\GPSCouponCode;
use App\Models\TabFunctions\EventsTimeZone;
use App\Models\TabFunctions\ContactUs;
use App\Models\TabFunctions\SocialUser;
use App\Models\TabFunctions\GpsCouponActivity;
use App\Models\TpAppsTabEntity;
use App\Models\TpAppsEntity;
use App\Helpers\Helper;

class GPSCouponCodeController extends Controller {

    const PHONE_HEADER_IMAGE_UPLOAD_PATH = 'app/public/functions/gps-coupon-code/phone';
    const TAB_HEADER_IMAGE_UPLOAD_PATH = 'app/public/functions/gps-coupon-code/tablet';

    private static function _getCommonValidationRules(): array {
        return [
//           'phone_header_image' => 'required|mimes:jpeg,jpg,png|max:10000',
            'description' => 'required|max:256',
            'coupon_name' => 'required'
        ];
    }

    private static function _getValidationMessages() {
        return [];
    }

    /**
     * Load the GPS Coupon list
     */
    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $timeSettings = Helper::getAppTimeZone($request->tabId);
            $coupons = GPSCouponCode::getGPSCoupons($request->tabId);
            $data = [
                'itemData' => $coupons,
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
                'timezoneList' => EventsTimeZone::timezoneList($request->tabId),
                'contactList' => ContactUs::getLocationListByAppId(TpAppsTabEntity::find($request->tabId)->app_id),
                'timeSettings' => $timeSettings
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

    public function getItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = GPSCouponCode::getGPSCouponData($request->id);
            $data['activities'] = GpsCouponActivity::getActivities($request->id);
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
     * Get the GPS Coupons list
     */
    public function GPSCouponsList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('ID not found.');
            }
            $coupons = GPSCouponCode::getGPSCoupons($request->tabId);
            $result = [
                'success' => TRUE,
                'data' => $coupons
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
        $fileName = Helper::getMilliTimestamp() . '_gps_coupon_image.' . $extension;
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

    /**
     * Create and Save content for GPS Coupon Code
     */
    public function saveContent(Request $request) {
        try {
            $data = $request->all();
            $phone_header_image = $request->file('phone_header_image');
            $tablet_header_image = $request->file('tablet_header_image');

            $data['phone_header_image'] = $phone_header_image;
            $data['tablet_header_image'] = $tablet_header_image;

            if (($data['start_date'] == NULL) && ($data['end_date'] == NULL)) {
                $getCommonValidationRules = [
                    'description' => 'required|max:256',
                    'coupon_name' => 'required'
                ];
            } else {
                $getCommonValidationRules = [
                    'description' => 'required|max:256',
                    'end_date' => 'after_or_equal:start_date',
                    'coupon_name' => 'required'
                ];
            }

            Validator::extend('after_or_equal', function($attribute, $value, $parameters, $validator) {
                $param1 = array_get($validator->getData(), $parameters[0], null);
                return strtotime($value) >= strtotime($param1);
            });
            Validator::replacer('after_or_equal', function ($message, $attribute, $rule, $parameters) {
                return str_replace(':start_date', str_replace('_', ' ', $parameters[0]), $message);
            });

            //validation
            if ($request->id) {
                if ($data['phone_header_image'] == null && $data['is_header_required'] == 1) {
                    if ($request->phone_header_image_url == null) {
                        //phone_header_image also required
                        $validator = Validator::make($data, array_reverse(array_merge($getCommonValidationRules, ['phone_header_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'id' => 'required|integer'])), self::_getValidationMessages());
                    } else {
                        //phone_header_image available so not check it
                        $validator = Validator::make($data, array_reverse(array_merge($getCommonValidationRules, ['id' => 'required|integer', 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE])), self::_getValidationMessages());
                    }
                } else {
                    //phone_header_image available so not check it
                    $validator = Validator::make($data, array_reverse(array_merge($getCommonValidationRules, ['id' => 'required|integer', 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE])), self::_getValidationMessages());
                }
            } else {
                if ($data['is_header_required'] == 1) {
                    $validator = Validator::make($data, array_reverse(array_merge($getCommonValidationRules, ['phone_header_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tab_id' => 'required|integer'])), self::_getValidationMessages());
                } else {
                    $validator = Validator::make($data, array_reverse(array_merge($getCommonValidationRules, ['phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tab_id' => 'required|integer'])), self::_getValidationMessages());
                }
            }

            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }

            // Check if start date is null
            if ($data['start_date'] == NULL) {
                $data['start_date'] = NULL;
            }
            // Check if end date is null
            if ($data['end_date'] == NULL) {
                $data['end_date'] = NULL;
            }

            // Save phone header image
            if (!empty($phone_header_image)) {
                $data['phone_header_image'] = self::_uploadImage($phone_header_image, self::getPhoneHeaderImageUploadPath(), 640, 264);
            } else {
                unset($data['phone_header_image']);
            }
            unset($data['phone_header_image_url']);

            // Save tablet header image
            if (!empty($tablet_header_image)) {
                $data['tablet_header_image'] = self::_uploadImage($tablet_header_image, self::getTabletHeaderImageUploadPath(), 1536, 634);
            } else {
                unset($data['tablet_header_image']);
            }

            if ($request->id) {
                unset($data['activities']);
                GPSCouponCode::where('id', $request->id)->update($data);
                $dataGPSCouponCode = GPSCouponCode::getGPSCouponData($request->id);
                $result = [
                    'success' => TRUE,
                    'message' => ['GPS Coupon successfully edited.'],
                    'data' => $dataGPSCouponCode
                ];
            } else {
                $createdId = GPSCouponCode::create($data)->id;
                $dataGPSCouponCode = GPSCouponCode::getGPSCouponData($createdId);
                $result = [
                    'success' => TRUE,
                    'message' => ['GPS Coupon successfully added.'],
                    'data' => $dataGPSCouponCode
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
     * Delete GPS Coupon
     */
    public function deleteCoupon(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            GPSCouponCode::deleteGPSCoupon($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['GPS Coupon successfully deleted.'],
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
            GPSCouponCode::updateMultiple($sortData);
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
            GPSCouponCode::where('id', $request->id)->update([$request->imageType . '_image' => NULL]);
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

    public function appInit(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }

            $coupons = GPSCouponCode::getAppGPSCoupons($request->tabId);
            $currentTime = time();
            $couponList = array();
            foreach ($coupons as $cp) {
                $timezoneOffsetInSeconds = ($cp->offset ?? 0) * 3600;

                if ($cp->start_date == null && $cp->end_date) {
                    $endDateInUTC = strtotime($cp->end_date) - $timezoneOffsetInSeconds;
                    if ($endDateInUTC >= $currentTime) {
                        //Insert Coupon In List
                        array_push($couponList, $cp);
                    }
                } elseif ($cp->start_date && $cp->end_date == null) {
                    $startDateInUTC = strtotime($cp->start_date) - $timezoneOffsetInSeconds;
                    if ($startDateInUTC <= $currentTime) {
                        //Insert Coupon In List
                        array_push($couponList, $cp);
                    }
                } elseif ($cp->start_date && $cp->end_date) {
                    $startDateInUTC = strtotime($cp->start_date) - $timezoneOffsetInSeconds;
                    $endDateInUTC = strtotime($cp->end_date) - $timezoneOffsetInSeconds;
                    if ($startDateInUTC <= $currentTime && $endDateInUTC >= $currentTime) {
                        //Insert Coupon In List
                        array_push($couponList, $cp);
                    }
                } else {
                    //Insert Coupon In List
                    array_push($couponList, $cp);
                }
            }

            $data = [
                'itemData' => $couponList,
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

    public function getAppItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = [
                'itemData' => GPSCouponCode::getAppGPSCouponData($request->id),
                'activities' => GpsCouponActivity::getActivities($request->id),
                'contactList' => ContactUs::getLocationListByAppId(TpAppsTabEntity::find($request->tabId)->app_id),
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

    public function saveActivity(Request $request) {
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
            if ($data['type'] == 'check' && $target < $data['totalTarget']) {
                $data['action'] = 'Completed' . ' ' . $target . ' ' . 'check-in';
            } elseif ($data['type'] == 'check' && $target == $data['totalTarget']) {
                $data['action'] = 'Unlocked this coupon';
            } else {
                $data['action'] = 'Redeemed this coupon';
            }
            $activityData = [
                'user_id' => $userId,
                'item_id' => $data['item_id'],
                'active' => $data['active'],
                'action' => $data['action'],
                'target' => $data['target'],
                'user_type' => $data['social_media_type']
            ];
//            $couponData = [
//                'scan_count' => $data['target'],
//            ];
            unset($data['type']);
            unset($data['totalTarget']);
            $createdId = GpsCouponActivity::create($activityData)->id;
            $activity = GpsCouponActivity::getActivity($createdId);
//            GPSCouponCode::where('id', $data['item_id'])->update($couponData); 
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

    public function deleteActivity(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            GpsCouponActivity::deleteActivity($request->id);
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

    public function deleteScanCount(Request $request) {
        try {

            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            GPSCouponCode::where('id', $request->id)->update(['scan_count' => 0]);
            $result = [
                'success' => TRUE,
                'message' => ['Scan count successfully deleted.'],
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
