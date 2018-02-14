<?php

namespace App\Http\Controllers\CustomerPortal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\EventsTimeZone;
use App\Models\TabFunctions\EmailMarketingValue;
use App\Models\TabFunctions\NewsLetterUsers;
use App\Models\TabFunctions\NewsLetterCategories;
use App\Models\TabFunctions\NewsLetterSettings;
use App\Models\TpAppsEntity;
use App\Models\TpAppsTabEntity;
use App\Models\TpAppsConfig;
use App\Helpers\Helper;
use App\Models\TpAppScreenshot;
use App\Models\TabSessions;
use App\Models\PromoteImages;
use App\Models\TabFunctions\ContactUs;
use App\Models\TabFunctions\SocialUserDeviceAssoc;
use URL;
use PDF;

class CustomerPromoteController extends Controller {

    /**
     * Init
     */
    const PROMOTE_IMAGES_UPLOAD_PATH = 'app/public/functions/promote/background/images';

    //Promote bg images upload Path
    public static function getPromoteImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::PROMOTE_IMAGES_UPLOAD_PATH);
    }

    //Promote bg images URL
    public static function getPromoteImageUploadUrl(): string {
        return Helper::getUploadDirectoryURL(self::PROMOTE_IMAGES_UPLOAD_PATH);
    }

    private static function _uploadImage($image, string $uploadPath, $width, $height): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_promoteSection_image.png';
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
            ->resize($width, $height)
            ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    public function init(Request $request) {
        try {
            if (!isset($request->appId) || empty($request->appId)) {
                throw new Exception('App ID not found.');
            }
            $appId = $request->appId;
            $promoteSettingData = TpAppsConfig::getAppPromoteConfigData($appId);
            if (!empty($promoteSettingData)) {
                $promoteSettingData->config_data = json_decode($promoteSettingData->config_data, true);
                $promoteSettingData->app_share_config_data = json_decode($promoteSettingData->app_share_config_data, true);
                $promoteSettingData->email_marketing_config_data = json_decode($promoteSettingData->email_marketing_config_data, true);
            }
            $emailMarkettingNewUser = 0;
            if (empty($promoteSettingData->email_marketing_config_data)) {
                $emailMarkettingNewUser = EmailMarketingValue::getNewUserEmailCount($appId, null);
            } else {
                $emailMarkettingNewUser = EmailMarketingValue::getNewUserEmailCount($appId, $promoteSettingData->email_marketing_config_data['lastDownLoadDate']);
            }
            $result = [
                'success' => TRUE,
                'appData' => TpAppsEntity::getAppDataForDisplay($appId),
                'appPromoteConfigData' => $promoteSettingData,
                'appIphoneFourScreenShot' => TpAppScreenshot::getScreenshot($request->appId, 1),
                'uploadedImages' => PromoteImages::getImages($appId),
                'contactList' => ContactUs::getLocationListByAppId($appId),
                'emailMarketingUserList' => EmailMarketingValue::getUserEmailList($appId),
                'emailMarketingTabList' => TpAppsTabEntity::getAppTabsForEmailMarketting($appId),
                'emailMarkettingNewUser' => $emailMarkettingNewUser
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function downloadQr(Request $request) {
        try {
            if (empty($request->url)) {
                throw new Exception('QR Code not found.');
            }
            $code = $request->url;
            $url = 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=' . $code . '&choe=UTF-8';
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

    public function save(Request $request) {
        if (empty($request->app_id)) {
            throw new Exception('App Id not found.');
        }
        $appData = TpAppsConfig::where('app_id', $request->app_id)->first();

        if (!empty($request->app_share_setting['description']) && strlen($request->app_share_setting['description']) > 650) {
            throw new Exception('Promote flyer description is too large.');
        }

        if (empty($appData)) {
            $promoteConfigData['app_id'] = $request->app_id;
            $promoteConfigData['app_share_config_data'] = json_encode($request->app_share_setting, JSON_NUMERIC_CHECK);
            $promoteConfigData['email_marketing_config_data'] = json_encode($request->emailMarketing, JSON_NUMERIC_CHECK);
            TpAppsConfig::create($promoteConfigData);
        } else {
            $promoteConfigData['app_share_config_data'] = json_encode($request->app_share_setting, JSON_NUMERIC_CHECK);
            $promoteConfigData['email_marketing_config_data'] = json_encode($request->emailMarketing, JSON_NUMERIC_CHECK);
            TpAppsConfig::where('app_id', $request->app_id)->update($promoteConfigData);
        }
        $result = parent::getSuccessResponse('Promote setting successfully added.');
        return response()->json($result);
    }

    public function getPdf(Request $request) {
        try {
            if (empty($request->appCode)) {
                throw new Exception('App Code not found.');
            }
            if (empty($request->appId)) {
                throw new Exception('App ID not found.');
            }
            $baseURL = $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['SERVER_NAME'] . '/';
            $appId = $request->appId;
            $appCode = $request->appCode;
            $appData = TpAppsEntity::getAppData($appId);
            $promoteSettingData = TpAppsConfig::getAppPromoteConfigData($appId);
            $location = '';
            $email_logo = URL::asset('resources/assets/images/email/email.svg');
            $location_logo = URL::asset('resources/assets/images/email/location.svg');
            $phone_logo = URL::asset('resources/assets/images/email/phone.svg');

            if (!empty($promoteSettingData)) {
                $promoteSettingData->config_data = json_decode($promoteSettingData->config_data, true);
                $promoteSettingData->app_share_config_data = json_decode($promoteSettingData->app_share_config_data, true);
            }
            if ($promoteSettingData->app_share_config_data && $promoteSettingData->app_share_config_data['location']) {
                $locationDetails = ContactUs::getContactUsLocationInfo($promoteSettingData->app_share_config_data['location']);
                $location = $locationDetails['address_sec_1'] . $locationDetails['address_sec_2'];
            }
            $bgImageHtml = "<div style=' text-align: center; height:390px'>
                    <img style='width:95%;height:390px' src='" . $promoteSettingData->app_share_config_data['promote_bg_image'] . "'/>
                </div> ";
            $client_address_html = "";
            if (!empty($promoteSettingData->app_share_config_data['location_show'])) {
                $client_address_html = "<div style='width:100%;float:left;color: #fff;'>
                       <div style='float:left; width: 28px;'><img style='width:20px;height=20px;' src=" . $location_logo . "></div> <div style=\"display: inline-block;vertical-align: top;float:left; padding-left: 2px; margin-top: -1px;\">" . $location . "</div>
                    </div>";
            }
            $client_email_html = "";
            if (!empty($promoteSettingData->app_share_config_data['email_show'])) {
                $client_email_html = "<div style='width:100%;float:left;color: #fff; padding: 6px 0px; '>
                      <div style='float:left; width: 28px; display: inline-block;vertical-align: top;'> <img style='width:20px;height=20px;' src=" . $email_logo . "></div> 
                      <div style=\"display: inline-block;vertical-align: top; padding-left: 2px; margin-top: -1px; float:left\">" . $appData->client_email . "</div>
                    </div>";
            }
            $client_phone_html = "";
            if ($appData->client_phone && !empty($promoteSettingData->app_share_config_data['phone_show'])) {
                $client_phone_html = "<div style='width:100%;float:left;color: #fff'>
                      <div style='float:left; width: 28px; display: inline-block;vertical-align: top;'>  <img style='width:20px;height=20px;' src=" . $phone_logo . "></div> <div style=\"display: inline-block;vertical-align: top;float:left; padding-left: 2px; margin-top: -1px;\">" . $appData->client_phone . "</div>
                    </div>";
            }
            $ios_url = 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=' . $promoteSettingData->config_data['ios_url'] . '&choe=UTF-8';
            $android_url = 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=' . $promoteSettingData->config_data['android_url'] . '&choe=UTF-8';
            $mobile_url = 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=' . $baseURL . 'ion/?app_code=' . $appCode . '&choe=UTF-8';
            $pdf = PDF::Make();
            $pdf->SetTitle('Promote');
            $pdf->SetDirectionality('ltr');
            $content = "<!DOCTYPE html>
<!--
To change this license header, choose License Headers in Project Properties.
To change this template file, choose Tools | Templates
and open the template in the editor.
-->
<html>
<head>
<link rel='stylesheet' src='" . Helper::getStorageLocalDiskURL('promote-pdf-style.css') . "'/>
</head>
    <body>
    <div style='position:relative; margin: 0;background-image:url(" . $promoteSettingData->app_share_config_data['promote_bg_image'] . ");background-size:cover; padding: 0px; margin-right: -1px;'>
        <div style='display:block;position: absolute;width:100% ;height:100%;background: rgba(72, 72, 72, 0.86);' >
           
            <div style='width:60.44%; padding:80px 30px 30px; display:inline-block;float:left;color: #fff;vertical-align: middle;margin-top:70px;'>  
               <div style='width: 100%;display:inline-block;padding-top:20px;float:left;vertical-align: middle;position:relative;'>
              <div style=\" max-height: 386px; width:228px; float:left; position:relative; background: url('" . $baseURL . 'assets/img/simulator.png' . "') no-repeat; background-size:100% 100%; padding:52px 7px 58px 7px; \">" . $bgImageHtml . " </div>   
                <div style='width: 46%; padding-left: 20px;display:inline-block;float:left;color: #fff;vertical-align: middle;margin-top:30px;'>  

                <div>
                    <h2 style='color: #fff;font-size: 20px;padding-left: 2px; '>" . $appData->app_name . "</h2>
                </div>
                <div>"
                    . $client_address_html . $client_email_html . $client_phone_html . "
                </div>
                    <div style='width:100%;float:left;color: #fff; padding: 6px 0px;'>
                        <p style='font-size: 12px;'>" . ($promoteSettingData->app_share_config_data['description'] ?? '') . "</p>
                    </div>
                </div>
                </div>
            </div>
            
                
            <div style='background: #fff; height:660px; float:right; padding:50px 20px;display:block;width:30%; margin-top:-2px;position:relative; right:-8px;  '>
                    <div style='width:100%; padding:30px 0; display:inline-block;float:left;'>
                        <div style='width:40%;display:inline-block;float:left; vertical-align: middle'>
                            <img  style='max-width:100%;max-height:100%' src='" . $ios_url . "'/>
                        </div>  
                        <div style='width:48%;display:inline-block; text-align:center;float:left;vertical-align: middle;padding-top:20px'>
                           <div style='display: block; color: #333; font-size: 15px; clear: both; text-align: center;'>
                            <img src='" . $baseURL . 'assets/img/qr_iphone.png' . "'/> </div>
                             <div style='display: block; color: #333; font-size: 15px; clear: both; padding-top: 12px;'>iOS App</div>
                        </div>
                            
                    </div>
                    <div style='width:100%; padding:30px 0; display:inline-block;float: left;'>
                        <div style='width:40%;display:inline-block;float:left;vertical-align: middle'>
                            <img style='max-width:100%;max-height:100%' src='" . $android_url . "'/>
                        </div> 
                        <div style='width:48%;display:inline-block; text-align:center;float:left;vertical-align: middle;padding-top:20px'>
                           <div style='display: block; color: #333; font-size: 15px; clear: both; text-align: center;'>
                            <img src='" . $baseURL . 'assets/img/qr_android.png' . "'/> </div>
                            <div style='display: block; color: #333; font-size: 15px; clear: both; text-align: center;  padding-top: 12px;'>Android App</div>
                        </div>
                       
                    </div>
                    <div style='width:100%; padding:30px 0; display:inline-block;float:left;'>
                     <div style='width:40%;height:10px;display:inline-block;float:left;vertical-align: middle'>
                            <img style='max-width:100%;max-height:100%' src='" . $mobile_url . "'/>
                        </div> 
                        <div style='width:48%;display:inline-block; text-align:center;float:left;vertical-align: middle;padding-top:20px'>
                          <div style='display: block; color: #333; font-size: 15px; clear: both; text-align: center;'>  <img src='" . $baseURL . 'assets/img/qr_other.png' . "'/> 
                          </div>
                             <div style='display: block; color: #333; font-size: 15px; clear: both;  padding-top: 12px;'>HTML5 App</div>
                        </div>
                       
                    </div>
                </div>
        </div>

    </body>
    </div>
</html>";
            $pdf->WriteHTML($content, 2, false, false);
            return $pdf->Download('qr.pdf');
        } catch (Exception $ex) {
            echo $ex->getMessage();
        }
    }

    public function uploadPromoteImage(Request $request) {
        try {
            if (empty($request->appId)) {
                throw new Exception('App ID not found.');
            }
            if (empty($request->file('image'))) {
                throw new Exception('Image is required.');
            }
            $imageData = $request->all();
            $imageRules = ['image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE];
            $imageValidator = Validator::make($imageData, $imageRules);
            if ($imageValidator->fails()) {
                throw new Exception(json_encode($imageValidator->errors()));
            }
            $image = self::_uploadImage($imageData['image'], self::getPromoteImageUploadPath(), 640, 960);
            $promoteImageData['app_id'] = $request->appId;
            $promoteImageData['bg_Image'] = $image;
            $imageId = PromoteImages::create($promoteImageData)->id;
            $uploadedImage = self::getPromoteImageUploadUrl() . '/' . $image;
            $result = [
                'success' => TRUE,
                'message' => 'image successfully Added.',
                'id' => $imageId,
                'image' => $uploadedImage
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deletePromoteImage(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            if (empty($request->type)) {
                throw new Exception('type not found');
            }
            $type = $request->type;
            if ($type == 1) {
                $imageData = PromoteImages::where('id', $request->id)->first();
                $promoteData = TpAppsConfig::getAppPromoteConfigData($imageData->app_id);
                $app_config_data = json_decode($promoteData->app_share_config_data, true);
                $app_config_data['promote_bg_image'] = null;
                $updated_app_config_data['app_share_config_data'] = json_encode($app_config_data, JSON_NUMERIC_CHECK);
                TpAppsConfig::where('app_id', $imageData->app_id)->update($updated_app_config_data);
            }
            PromoteImages::where('id', $request->id)->delete();
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

    public function downloadBgImage(Request $request) {
        try {
            if (empty($request->url)) {
                throw new Exception('Image Url not found.');
            }
            $url = $request->url;
            $keys = parse_url($url); // parse the url
            $path = explode("/", $keys['path']); // splitting the path
            $last = end($path);
            $ext = substr($last, strrpos($last, '.') + 1);
            if ($ext == 'jpg') {
                $content_type = 'application/jpg';
                $file_name = 'custom.jpg';
            } else {
                $content_type = 'application/png';
                $file_name = 'custom.png';
            }
            header('Content-Description: File Transfer');
            header('Content-Type:' . $content_type);
            header('Content-Disposition: attachment; filename=' . $file_name);
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

//    public function getTabList(Request $request) {
//        try {
//            if (empty($request->appId)) {
//                throw new Exception('App ID not found.');
//            }
//            $appId = $request->appId;
//            $tabList = TpAppsTabEntity::getAppTabsForEmailMarketting($appId);
//            $result = [
//                'success' => TRUE,
//                'tabList' => $tabList,
//            ];
//        } catch (Exception $ex) {
//            $result = [
//                'success' => FALSE,
//                'message' => $ex->getMessage()
//            ];
//        }
//        return response()->json($result);
//    }

    public function saveUserEmail(Request $request) {
        try {
            if (empty($request->appCode)) {
                throw new Exception('App Code not found.');
            }
            $email_id = $request->emailId;
            $app_id = TpAppsEntity::select('id')->where('app_code', $request->appCode)->first();
            $emailMarketingData = EmailMarketingValue::where('email_id', $email_id)->first();
            $emailMarketing['app_id'] = $app_id->id;
            $emailMarketing['email_id'] = $email_id;
            if (empty($emailMarketingData)) {
                EmailMarketingValue::create($emailMarketing);
            }
            $result = [
                'success' => TRUE,
                'message' => 'email saved successfully',
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
     * delete user email
     */
    public function deleteUserEmail(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            EmailMarketingValue::deleteUserEmail($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['EmailId successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function uploadUsersMailChimpEmailMarketing(Request $request) {
        try {
            $data = $request->all();
            if (empty($request->appId)) {
                throw new Exception('ID not found.');
            }
            $rules = ['appId' => 'required|integer', 'apiKey' => 'required', 'listId' => 'required'];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $apiKey = $request->apiKey;
            $listId = $request->listId;
            //save mail chimp account details into newsletter settings table            
            $account = array('apiKey' => $apiKey, 'listId' => $listId);
            $mailchimpData = array('mailchimp_account' => json_encode($account));
            $newLetterSetting = NewsLetterSettings::where('app_id', $request->appId)->first();
            if (empty($newLetterSetting)) {
                $settingData['app_id'] = $request->appId;
                $settingData['tab_id'] = $request->tabId;
                $settingData['mailchimp_account'] = json_encode($account);
                NewsLetterSettings::create($settingData);
            } else {
                NewsLetterSettings::where('app_id', $request->appId)->update($mailchimpData);
            }

            $usersInfo = EmailMarketingValue:: getUserEmailList($request->appId);
            if (isset($usersInfo) && !empty($usersInfo)) {
                foreach ($usersInfo as $key => $val) {
                    $userDetail[$key]['email'] = $val['email_id'];
                    $userDetail[$key]['status'] = 'subscribed';
                }
            }

            foreach ($userDetail as $user) {
                $response = self:: syncMailchimp($user, $apiKey, $listId);
            }

            $result = [
                'success' => TRUE,
                'message' => 'User Contacts uploaded to Mail Chimp List Successfuly',
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function syncMailchimp($data, $apiKey, $listId) {
        // $apiKey = '0e443d61262623d83d23e857ea91ec89-us15';
        // $listId = 'b9395c52c3';
        // $webId = '62647';

        $memberId = md5(strtolower($data['email']));
        $dataCenter = substr($apiKey, strpos($apiKey, '-') + 1);
        $url = 'https://' . $dataCenter . '.api.mailchimp.com/3.0/lists/' . $listId . '/members/' . $memberId;

        $json = json_encode([
            'email_address' => $data['email'],
            'status' => $data['status'], // "subscribed","unsubscribed","cleaned","pending"
        ]);

        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_USERPWD, 'user:' . $apiKey);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $json);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return $result;
    }

    public function downloadCsvMarketingList(Request $request) {
        try {
            if (empty($request->appId)) {
                throw new Exception('ID not found.');
            }
            $promoteSettingData = TpAppsConfig::getAppPromoteConfigData($request->appId);
            if (!empty($promoteSettingData)) {
                $promoteSettingData->email_marketing_config_data = json_decode($promoteSettingData->email_marketing_config_data, true);
                if (empty($promoteSettingData->email_marketing_config_data)) {
                    $emailMarketingData['CollectEmailButton'] = true;
                    $emailMarketingData['emailMarketingButton'] = true;
                    $emailMarketingData['promptText'] = "Please enter your email address to receive free coupons and rewards.";
                    $emailMarketingData['lastDownLoadDate'] = date('Y-m-d');
                    $promoteConfigData['email_marketing_config_data'] = json_encode($emailMarketingData, JSON_NUMERIC_CHECK);
                    TpAppsConfig::where('app_id', $request->appId)->update($promoteConfigData);
                } else {
                    if (isset($promoteSettingData['email_marketing_config_data']['CollectEmailButton']))
                        $emailMarketingData['CollectEmailButton'] = $promoteSettingData['email_marketing_config_data']['CollectEmailButton'];
                    if (isset($promoteSettingData['email_marketing_config_data']['emailMarketingButton']))
                        $emailMarketingData['emailMarketingButton'] = $promoteSettingData['email_marketing_config_data']['emailMarketingButton'];

                    $emailMarketingData['selectedTabs'] = !isset($promoteSettingData['email_marketing_config_data']['selectedTabs']) ? [] : $promoteSettingData['email_marketing_config_data']['selectedTabs'];
                    if (isset($promoteSettingData['email_marketing_config_data']['selectedPromptFrequency']))
                        $emailMarketingData['selectedPromptFrequency'] = $promoteSettingData['email_marketing_config_data']['selectedPromptFrequency'];
                    if (isset($promoteSettingData['email_marketing_config_data']['promptText']))
                        $emailMarketingData['promptText'] = $promoteSettingData['email_marketing_config_data']['promptText'];
                    $emailMarketingData['lastDownLoadDate'] = date('Y-m-d');
                    $promoteConfigData['email_marketing_config_data'] = json_encode($emailMarketingData, JSON_NUMERIC_CHECK);
                    TpAppsConfig::where('app_id', $request->appId)->update($promoteConfigData);
                }
            } else {
                $promoteConfigData['app_id'] = $request->appId;
                $emailMarketingData['lastDownLoadDate'] = date('Y-m-d');
                $emailMarketingData['CollectEmailButton'] = true;
                $emailMarketingData['emailMarketingButton'] = true;
                $emailMarketingData['promptText'] = "Please enter your email address to receive free coupons and rewards.";
                $promoteConfigData['email_marketing_config_data'] = json_encode($emailMarketingData, JSON_NUMERIC_CHECK);
                TpAppsConfig::create($promoteConfigData);
            }
            $nameValues = array('Date', 'Email');
            //get the category name associated with tab_id and append them in $nameValues array below
            $user = EmailMarketingValue:: getUserEmailList($request->appId);
            if (isset($user) && !empty($user)) {
                $newsUser = [];
                foreach ($user as $key => $value) {
                    $newsUser[$key]['Date'] = $value['created_at'];
                    $newsUser[$key]['email'] = $value['email_id'];
                }

                $header = array($nameValues);
                $dataArray = array_merge($header, $newsUser);
                $output_file_name = 'AppUserEmails.csv';
                $delimiter = ',';
                $csv = self:: convert_to_csv($dataArray, $output_file_name, $delimiter);
            }
        } catch (Exception $ex) {
            echo $ex->getMessage();
        }
    }

    public function convert_to_csv($input_array, $output_file_name, $delimiter) {
        $temp_memory = fopen('php://memory', 'w');
        // loop through the array
        foreach ($input_array as $line) {
            // use the default csv handler
            fputcsv($temp_memory, $line, $delimiter);
        }

        fseek($temp_memory, 0);
        // modify the header to be CSV format
        header('Content-Type: application/csv');
        header('Content-Disposition: attachement; filename="' . $output_file_name . '";');
        // output the file to be downloaded
        fpassthru($temp_memory);
    }

    public function getUserActivityInit(Request $request) {
        try {
            if (empty($request->appId)) {
                throw new Exception('ID not found.');
            }
            $appId = $request->appId;
            $devices_uuid = SocialUserDeviceAssoc::getDevicesUuids($appId);
            $users = SocialUserDeviceAssoc::userList($appId);
            $userList = [];
            foreach ($devices_uuid as $device) {
                foreach ($users as $user) {
                    if ($device->device_uuid == $user->device_uuid) {
                        $userList[$device->device_uuid]['user'] [] = $user;
                    }
                }
            }
            $tabSessions = TabSessions::getTabSeeionsForUserActivity($appId);
            foreach ($userList as $key => $user) {
                $userList[$key]['feature_activity'][] = $tabSessions[$key];
            }
            $result = [
                'success' => TRUE,
                'userList' => $userList,
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
     * delete user on the basis of devices
     */
    public function deleteDevicesBasisUsers(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            SocialUserDeviceAssoc::deleteUser($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['User successfully deleted.'],
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
