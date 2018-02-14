<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\QrCouponCode;
use App\Models\TabFunctions\EventsTimeZone;
use App\Models\TabFunctions\QrCouponsActivity;
use App\Models\TabFunctions\SocialUser;
use App\Models\TpAppsTabEntity;
use App\Models\TpAppsEntity;
use App\Helpers\Helper;

class QrCouponCodeController extends Controller {

    const PHONE_HEADER_IMAGE_UPLOAD_PATH = 'app/public/functions/qr-coupon-code/phone';
    const TAB_HEADER_IMAGE_UPLOAD_PATH = 'app/public/functions/qr-coupon-code/tablet';

    private static function _getCommonValidationRules(): array {
        return [
            'coupon_name' => 'required',
            'qr_code' => 'required',
            'description' => 'required|max:256'
        ];
    }

    private static function _getValidationMessages() {
        return [];
    }

    /**
     * Load the QR Coupon list
     */
    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }

            $coupons = QrCouponCode::getQrCoupons($request->tabId);
            $timeSettings = Helper::getAppTimeZone($request->tabId);
            // $qr_coupons = self :: qr_coupon_code($coupons);
            $data = [
                'itemData' => $coupons,
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
                'timezoneList' => EventsTimeZone::timezoneList($request->tabId),
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

    public function qr_coupon_code($coupons) {
        try {
            foreach ($coupons as $value) {
                $coupon_code = $value['qr_code'];
                if ($coupon_code != "") {
                    $qr_code = self :: qrCode($coupon_code);
                    $value['qr_coupon_code'] = $qr_code;
                }
            }
        } catch (Exception $ex) {
            $coupons = [];
        }
        return $coupons;
    }

    public function getItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = QrCouponCode::getQrCouponData($request->id);
            $data['activities'] = QrCouponsActivity::getActivities($request->id);
            $coupon_code = $data['qr_code'];
            if ($coupon_code != "") {
                $qr_code = self :: qrCode($coupon_code);
                $data['qr_coupon_code'] = $qr_code;
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

    public function qrCode($code) {
        $encoded = urlencode($code);
        $url = 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=' . $encoded . '&choe=UTF-8';
        return $url;
    }

    /**
     * Get the QR Coupons list
     */
    public function QrCouponsList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('ID not found.');
            }
            $coupons = QrCouponCode::getQrCoupons($request->tabId);
            // $qr_coupons = self :: qr_coupon_code($coupons);
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
        $fileName = Helper::getMilliTimestamp() . '_qr_coupon_image.' . $extension;
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
     * Create and Save content for QR Coupon Code
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

            if ($request->id) {
                if ($request->phone_header_image == null && $data['is_header_required'] == 1) {
                    if ($request->phone_header_image_url == null) {
                        $validator = Validator::make($data, array_reverse(array_merge($getCommonValidationRules, ['phone_header_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE,'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'id' => 'required|integer'])), self::_getValidationMessages());
                    } else {
                        $validator = Validator::make($data, array_reverse(array_merge($getCommonValidationRules, ['id' => 'required|integer','tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE])), self::_getValidationMessages());
                    }
                } else {
                    $validator = Validator::make($data, array_reverse(array_merge($getCommonValidationRules, ['id' => 'required|integer','phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE,'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE])), self::_getValidationMessages());
                }
            } else {
                if ($data['is_header_required'] == 1) {
                    $validator = Validator::make($data, array_reverse(array_merge($getCommonValidationRules, ['phone_header_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE,'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tab_id' => 'required|integer'])), self::_getValidationMessages());
                } else {
                    $validator = Validator::make($data, array_reverse(array_merge($getCommonValidationRules, ['phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE,'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tab_id' => 'required|integer'])), self::_getValidationMessages());
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
            if ($data['hours_before_checkin'] != NULL || !empty($data['hours_before_checkin'])) {
                $data['hours_before_checkin'] = round($data['hours_before_checkin']);
            }
            // Save phone header image

            if (!empty($phone_header_image)) {
                $data['phone_header_image'] = self::_uploadImage($phone_header_image, self::getPhoneHeaderImageUploadPath(), 640, 264);
            } else {
                if ($data['phone_header_image'] == null && $data['is_header_required'] == 1) {
                    if ($request->phone_header_image_url == null) {
                        throw new Exception('Phone header image field is required.');
                    }
                }
                unset($data['phone_header_image']);
            }
            unset($data['phone_header_image_url']);

            // Save tablet header image

            if (!empty($tablet_header_image)) {
                $data['tablet_header_image'] = self::_uploadImage($tablet_header_image, self::getTabletHeaderImageUploadPath(), 1536, 634);
            } else {
                unset($data['tablet_header_image']);
            }


            if (isset($data['qr_coupon_code'])) {
                unset($data['qr_coupon_code']);
            }
            if ($request->id) {
                unset($data['activities']);
                QrCouponCode::where('id', $request->id)->update($data);
                $dataQrCouponCode = QrCouponCode::getQrCouponData($request->id);
                $result = [
                    'success' => TRUE,
                    'message' => ['QR Coupon Code successfully edited.'],
                    'data' => $dataQrCouponCode
                ];
            } else {
                $createdId = QrCouponCode::create($data)->id;
                $dataQrCouponCode = QrCouponCode::getQrCouponData($createdId);
                $result = [
                    'success' => TRUE,
                    'message' => ['QR Coupon Code successfully added.'],
                    'data' => $dataQrCouponCode
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
     * Delete QR Coupon
     */
    public function deleteCoupon(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            QrCouponCode::deleteQRCoupon($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['QR Coupon successfully deleted.'],
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
            QrCouponCode::updateMultiple($sortData);
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
            QrCouponCode::where('id', $request->id)->update([$request->imageType . '_image' => NULL]);
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

    public function downloadCoupon(Request $request) {
        try {
            if (empty($request->code)) {
                throw new Exception('QR Code not found.');
            }
            $code = $request->code;
            $encoded = urlencode($code);
            $url = 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=' . $encoded . '&choe=UTF-8';
            header('Content-Description: File Transfer');
            header('Content-Type: application/png');
            header('Content-Disposition: attachment; filename=qrCode.png');
            header('Content-Transfer-Encoding: binary');
            header('Expires: 0');
            header('Cache-Control: public'); //for i.e.
            header('Pragma: public');
            ob_clean();
            flush();
            readfile($url);
            exit;
        } catch (Exception $ex) {
            echo $ex->getMessage();
        }
    }

    /**
     * Create QR Coupon Codes
     */
    public function qRCodes(Request $request) {
        try {
            $data = $request->all();

            if (empty($request->urls)) {
                throw new Exception('Urls not found.');
            }
            $qrCodes = [];
            foreach ($request->urls as $url) {
                $qrCodes[] = self :: qrCode($url);
            }
            $result = [
                'success' => TRUE,
                'message' => ['QR Coupon Code successfully generated.'],
                'data' => $qrCodes
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    //ionic 

    public function appInit(Request $request) {
        try {
            date_default_timezone_set('UTC');
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $coupons = QrCouponCode::getAppQrCoupons($request->tabId);
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
                'itemData' => QrCouponCode::getQrCouponData($request->id),
                'activities' => QrCouponsActivity::getActivities($request->id),
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

    public function deleteActivity(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            QrCouponsActivity::deleteActivity($request->id);
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
            if ($data['type'] == 'scan' && $target < $data['totalTarget']) {
                $data['action'] = 'Completed' . ' ' . $target . ' ' . 'scan';
            } elseif ($data['type'] == 'scan' && $target == $data['totalTarget']) {
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
            // $couponData = [
            //     'scan_count' => $data['target'] + 1,
            // ];
            unset($data['type']);
            unset($data['totalTarget']);
            $createdId = QrCouponsActivity::create($activityData)->id;
            $activity = QrCouponsActivity::getActivity($createdId);
            // QrCouponCode::where('id', $data['item_id'])->update($couponData); 
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

    public function viewQRByCode(Request $request) {
        try {
            if (empty($request->code)) {
                throw new Exception('QR Code not found.');
            }
            $qrImg = self :: qrCode($request->code);
            $result = [
                'success' => TRUE,
                'data' => $qrImg
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    //  public function deleteScanCount(Request $request) {
    //     try {
    //         if (empty($request->id)) {
    //             throw new Exception('ID not found');
    //         }
    //         QrCouponCode::where('id', $request->id)->update(['scan_count' => 0]);
    //         $result = [
    //             'success' => TRUE,
    //             'message' => ['Scan count successfully deleted.'],
    //         ];
    //     } catch (Exception $ex) {
    //         $result = [
    //             'success' => FALSE,
    //             'message' => $ex->getMessage()
    //         ];
    //     }
    //     return response()->json($result);
    // }
}
