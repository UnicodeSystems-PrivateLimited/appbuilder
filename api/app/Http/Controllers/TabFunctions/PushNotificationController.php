<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Apps\AppController;
use App\Http\Controllers\Controller;
use Facebook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use LaravelAcl\Library\Exceptions\NotFoundException;
use App\Models\TabFunctions\Direction;
use App\Models\TabFunctions\EventsTimeZone;
use App\Models\TabFunctions\MembershipGroup;
use App\Models\PushNotification;
use App\Models\TpAppsTabEntity;
use App\Models\TabFunctions\InboxSettings;
use App\Models\TpRegisteredDevice;
use App\Models\TpAppsEntity;
use App\Models\TpAppsConfig;
use App\Helpers\Helper;
use DB;
use Abraham\TwitterOAuth\TwitterOAuth;
use App\Models\TpLogActivity;
use App\Models\TabFunctions\MembershipUser;
use App\Models\AppSessions;
use App\Models\FirebaseAppCredentials;
use App\Models\TabFunctions\ContactUs;

class PushNotificationController extends Controller
{

    const GOOGLE_API_KEY = 'AAAAuVZbWRY:APA91bF-C0wthMebV32x4Vv2E2TROwucauTL_bc6FteRFt6VqZWwfMnKieAa20wxULYfFZFuEtClIF745q0B_X5VlrW6oCbhNVHOpBZGuoffE9a9Sm_JQnUWKm7vrA4HJ9aP-z5_SXt_';
    const GCM_URL = 'https://android.googleapis.com/gcm/send';
    const GCM_SENDER_ID = 796017776918;

    public function init(Request $request)
    {
        try {
            if (empty($request->appId)) {
                throw new Exception('AppId not found');
            }
            $androidCount = TpRegisteredDevice::getAppDownloadCount($request->appId, AppSessions::PLATFORM_ANDROID);
            $iphoneCount = TpRegisteredDevice::getAppDownloadCount($request->appId, AppSessions::PLATFORM_IOS);
            $detail = TpAppsConfig::getAppConfigData($request->appId);
            if (!empty($detail)) {
                $config = $detail->config_data;
                $config_arr = json_decode($config, true);
            } else {
                $config_arr = null;
            }

            $app = TpAppsEntity::find($request->appId);
            if (empty($app)) {
                throw new Exception('Invalid app id provided');
            }
            $isFacebookTokenAvailable = false;
            $isTwitterTokenAvailable = false;

            if (!empty($app->push_facebook_token)) {
                if (!self::isFBAccessTokenExpired($app->push_facebook_token)) {
                    $isFacebookTokenAvailable = true;
                } else {
                    TpAppsEntity::updateData(['push_facebook_token' => null], $request->appId);
                }
            }

            if (!empty($app->push_twitter_token) && !empty($app->push_twitter_secret)) {
                $isTwitterTokenAvailable = true;
            }

            $data = [
                'timezoneList' => EventsTimeZone::timezoneList(),
                'userGroups' => PushNotification::userGroupList($request->appId),
                'usersList' => PushNotification::getAllUser($request->appId),
                'settings' => PushNotification::inboxSettings($request->appId),
                'subscriptionList' => PushNotification::subscriptionList($request->appId),
                'androidCount' => $androidCount,
                'iphoneCount' => $iphoneCount,
                'timeSettings' => $config_arr,
                'isFacebookTokenAvailable' => $isFacebookTokenAvailable,
                'isTwitterTokenAvailable' => $isTwitterTokenAvailable
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

    public function ionInit(Request $request)
    {
        try {
            $username = !empty($request->memberUsername) ? $request->memberUsername : null;
            $memberID = 0;
            if ($username) {
                $memberID = MembershipUser::getIDByUsernameAndAppID($username, $request->appId);
            }
            $deviceID = TpRegisteredDevice::getRegisteredDevice($request->appId, $request->deviceUUID);
            $data = [
                'notiList' => PushNotification::ionNotiList($request->appId, $deviceID, $memberID),
                'settings' => PushNotification::inboxSettings($request->appId),
                'subscriptionList' => PushNotification::subscriptionList($request->appId),
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

    public function save(Request $request)
    {
        try {
            $data = $request->all();
            if (empty($request->app_id)) {
                throw new Exception('AppId not found');
            }
            $validator = Validator::make(['website_url' => $data['website_url']], [
                'website_url' => 'Between:3,255|Url',
            ]);
            if (!empty($data['user_group_id'])) {
                $data['user_group_id'] = json_encode($data['user_group_id']);
            } else {
                $data['user_group_id'] = null;
            }
            if (!empty($data['user_id'])) {
                $data['user_id'] = json_encode($data['user_id']);
            } else {
                $data['user_id'] = null;
            }
            if (!empty($data['subscription_id'])) {
                $data['subscription_id'] = json_encode($data['subscription_id']);
            } else {
                $data['subscription_id'] = null;
            }

            if ($validator->fails()) {
                throw new NotFoundException($validator->errors());
            }
            if ($data['location_type'] == 2 && $data['active'] == null) {
                throw new Exception('You should specify the date/time when push message is inactive.');
            } elseif ($data['send_now'] == 0 && $data['send_on_date'] == null) {
                throw new Exception('You should specify the date/time when push message is sent.');
            } else {
                unset($data['active_date']);
                unset($data['active_time']);
                unset($data['send_date']);
                unset($data['send_time']);
                unset($data['send_on']);
                PushNotification::create($data);
                $result = [
                    'success' => true,
                    'message' => ['Notification sent successfully.'],
                ];

                if ($data['send_now'] && !($data['audience'] == PushNotification::AUDIENCE_SPECIFIC_AREA_USERS && $data['location_type'] == PushNotification::LOCATION_TYPE_GEOFENCE)) {
                    $this->sendPushNotification($data);
                }
            }
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function sendPushNotification(array $data)
    {
        $platform = null;
        $androidTokens = [];
        $iosTokens = [];
        if (!empty($data['android_type']) && !empty($data['iphone_type'])) {
            $platform = TpRegisteredDevice::PLATFORM_BOTH;
        } elseif (!empty($data['android_type'])) {
            $platform = TpRegisteredDevice::PLATFORM_ANDROID;
        } elseif (!empty($data['iphone_type'])) {
            $platform = TpRegisteredDevice::PLATFORM_IOS;
        } elseif (empty($data['facebook_type']) && empty($data['twitter_type'])) {
            throw new Exception('No target platform selected.');
        }

        if ($platform === TpRegisteredDevice::PLATFORM_BOTH || $platform) { // Platform should not be null
            if (!empty($data['android_type'])) {
                $androidTokens = TpRegisteredDevice::getDeviceTokens(
                    $data, TpRegisteredDevice::PLATFORM_ANDROID, !empty($data['user_group_id']) ? json_decode($data['user_group_id']) : [], !empty($data['user_id']) ? json_decode($data['user_id']) : [], !empty($data['subscription_id']) ? json_decode($data['subscription_id']) : []
                );
            }

            if (!empty($data['iphone_type'])) {
                $iosTokens = TpRegisteredDevice::getDeviceTokens(
                    $data, TpRegisteredDevice::PLATFORM_IOS, !empty($data['user_group_id']) ? json_decode($data['user_group_id']) : [], !empty($data['user_id']) ? json_decode($data['user_id']) : [], !empty($data['subscription_id']) ? json_decode($data['subscription_id']) : []
                );
            }
        }

        if (!empty($data['facebook_type'])) {
            try {
                self::postFacebookMessage($data['message'], $data['app_id']);
            } catch (Exception $ex) {
                if (empty($data['android_type']) && empty($data['iphone_type']) && empty($data['twitter_type'])) {
                    throw new Exception('Push notification sending failed. Please try again');
                }
            }
        }

        if (!empty($data['twitter_type'])) {
            try {
                self::postTwitterMessage($data['message'], $data['app_id']);
            } catch (Exception $ex) {
                if (empty($data['android_type']) && empty($data['iphone_type']) && empty($data['facebook_type'])) {
                    throw new Exception('Push notification sending failed. Please try again');
                }
            }
        }

        if (empty($androidTokens) && empty($iosTokens)) {
            if (empty($data['facebook_type']) && empty($data['twitter_type'])) {
                throw new Exception('No devices found to send notifications to.');
            } else {
                return;
            }
        }
        
        $fields = [
            'registration_ids' => [],
            'content_available' => true,
            'priority' => 'high',
            'data' => [
                'type' => 'inbox',
                'content_type' => $data['content_type'] ?? 0,
                'tab_id' => $data['tab_id'] ?? null,
                'website_url' => $data['website_url'] ?? null,
            ],
        ];

        $notification = [
            'title' => TpAppsEntity::getAppName($data['app_id']),
            'body' => $data['message'] ?? null
        ];

        if ($data['audience'] == PushNotification::AUDIENCE_SPECIFIC_AREA_USERS) {
            // The message should not last for long if location type is Point or Geofence.
            $fields['time_to_live'] = 30;
        } elseif (!empty($data['active'])) {
            // The maximum value of time to live can only be 4 weeks
            $maxTimeToLive = 86400 * 7 * 4;
            $expectedTimeToLive = strtotime($data['active']) - time();
            $fields['time_to_live'] = $expectedTimeToLive <= $maxTimeToLive ? $expectedTimeToLive : $maxTimeToLive;
        }

        $serverKey = FirebaseAppCredentials::getServerKey($data['app_id']) ?? self::GOOGLE_API_KEY;
        $androidStatus = true;
        $iosStatus = true;
        if (!empty($data['android_type']) && !empty($androidTokens)) {
            $androidStatus = $this->sendRequestToGCM($androidTokens, $fields, $notification, TpRegisteredDevice::PLATFORM_ANDROID, $serverKey);
        }
        if (!empty($data['iphone_type']) && !empty($iosTokens)) {
            $iosStatus = $this->sendRequestToGCM($iosTokens, $fields, $notification, TpRegisteredDevice::PLATFORM_IOS, $serverKey);
        }

        if (!$androidStatus && !$iosStatus) {
            throw new Exception('Push notification sending failed. Please try again.');
        } else if (!$androidStatus) {
            throw new Exception('Push notification sending failed for android. Please try again.');
        } else if (!$iosStatus) {
            throw new Exception('Push notification sending failed for iOS. Please try again.');
        }
        
        //Save App Notification Sent Activity
        self::saveNotificationActivity($data['app_id']);
    }

    public function getUserByGroupId(Request $request)
    {
        try {
            if (empty($request->appId)) {
                throw new Exception('AppId not found');
            }
            $data = [
                'users' => PushNotification::getUserGroupId($request->appId, $request->groupId),
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

    public function subscriptionInit(Request $request)
    {
        try {
            if (empty($request->appId)) {
                throw new Exception('AppId not found');
            }
            if (empty($request->deviceUuid)) {
                throw new Exception('Device UUID not found');
            }
            $data = [
                // 'notiList' => PushNotification::ionNotiList($request->appId),
                // 'settings' => PushNotification::inboxSettings($request->appId),
                'subscriptionList' => PushNotification::subscriptionList($request->appId),
                'subscriberStatusList' => PushNotification::subscriberStatusList($request->deviceUuid)
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

    public function saveSubscribeStatus(Request $request)
    {
        try {
            if (empty($request->appId)) {
                throw new Exception('App Id not found');
            }
            if (empty($request->deviceUuid)) {
                throw new Exception('Device UUID not found');
            }
            if (empty($request->subscriptionState)) {
                throw new Exception('Subscription state not found');
            }
            $data1 = $request->all();
            $deviceId = TpRegisteredDevice::getRegisteredDevice($request->appId, $request->deviceUuid);

            if ($deviceId) {
                $subscriptionState = $request->subscriptionState;
                $insertData = array();
//                print_r($subscriptionState);die;
                foreach ($subscriptionState as $key => $value) {
                    if (isset($value)) {
                        $subscriber = PushNotification::getSubscriberStatus($deviceId, $key);
                        if (!empty($subscriber)) {
                            $updateData['is_subscribed'] = $value;
                            $d = PushNotification::updateSubscriberStatus($updateData, $subscriber[0]->id);
                        } else {
                            $pushData['subscription_id'] = $key;
                            $pushData['device_id'] = $deviceId;
                            $pushData['is_subscribed'] = $value;
                            $insertData[] = $pushData;
                        }
                    }
                }
                if (!empty($insertData)) {
                    PushNotification:: saveSubscriberStatus($insertData);
                }

                $result = [
                    'success' => true,
                    'message' => 'Successfully saved.',
                ];
            } else {
                throw new Exception('Server error occured');
            }
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteNoti(Request $request)
    {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            PushNotification::deleteNoti($request->id);
            $result = [
                'success' => true,
                'message' => ['Noti  successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getHistory(Request $request)
    {
        try {
            if (empty($request->appId)) {
                throw new Exception('APPID not found.');
            }
            $sentNotiList = PushNotification::sentMsgList($request->appId);
            $scheduledNotiList = PushNotification::scheduledMsgList($request->appId);
            $data = [
                'sentNotiList' => $sentNotiList,
                'sentMsg' => $sentNotiList->count(),
                'scheduledNotiList' => $scheduledNotiList,
                'scheduleMsg' => $scheduledNotiList->count(),
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

    public function sendScheduledPushNotification()
    {
        try {
            date_default_timezone_set('UTC');
            $notifications = PushNotification::getRemainingScheduledNotifications();
            $currentTime = strtotime(date('Y-m-d H:i'));
            $errorMessages = '';
            foreach ($notifications as $notification) {
                $timezoneOffsetInSeconds = ($notification->timezoneOffset ?? 0) * 3600;
                $sendOnDateInUTC = strtotime($notification->send_on_date) - $timezoneOffsetInSeconds;
                if ($currentTime == $sendOnDateInUTC) {
                    try {
                        $this->sendPushNotification((array)$notification);
                    } catch (Exception $ex) {
                        $errorMessages .= $ex->getMessage() . PHP_EOL;
                    }
                    PushNotification::updateById(['is_scheduled_notification_sent' => 1], $notification->id);
                }
            }
            if ($errorMessages) {
                echo '[' . date('Y-m-d H:i:s') . ']: ' . $errorMessages . PHP_EOL;
            } else {
                echo '[' . date('Y-m-d H:i:s') . ']: Success' . PHP_EOL;
            }
        } catch (Exception $ex) {
            echo $ex->getMessage();
        }
    }

    private static function isFBAccessTokenExpired(string $accessToken): bool
    {
        $fb = new Facebook\Facebook();
        try {
            $response = $fb->get('/debug_token?input_token=' . $accessToken . '&access_token=' . AppController::FACEBOOK_APP_ACCESS_TOKEN);
        } catch (Facebook\Exceptions\FacebookResponseException $e) {
            AppController::writeFacebookLog('Graph returned an error: ' . $e->getMessage());
        } catch (Facebook\Exceptions\FacebookSDKException $e) {
            AppController::writeFacebookLog('Facebook SDK returned an error: ' . $e->getMessage());
        }
        $response = $response->getDecodedBody();
        return empty($response['data']['is_valid']);
    }

    private static function postFacebookMessage(string $message, int $appID)
    {
        $fb = new Facebook\Facebook([
            'app_id' => AppController::FACEBOOK_APP_ID,
            'app_secret' => AppController::FACEBOOK_APP_SECRET,
            'default_graph_version' => 'v2.2',
        ]);
        try {
            $fb->post('/me/feed', ['message' => $message], TpAppsEntity::getFacebookAccessToken($appID));
        } catch (Facebook\Exceptions\FacebookResponseException $e) {
            AppController::writeFacebookLog('Graph returned an error: ' . $e->getMessage());
            throw $e;
        } catch (Facebook\Exceptions\FacebookSDKException $e) {
            AppController::writeFacebookLog('Facebook SDK returned an error: ' . $e->getMessage());
            throw $e;
        }
    }

    private static function postTwitterMessage(string $message, int $appID)
    {
        $tokenAndSecret = TpAppsEntity::getTwitterAccessTokenAndSecret($appID);
        try {
            $connection = new TwitterOAuth(
                AppController::TWITTER_CONSUMER_KEY,
                AppController::TWITTER_CONSUMER_SECRET,
                $tokenAndSecret->push_twitter_token,
                $tokenAndSecret->push_twitter_secret
            );
            $response = $connection->post('statuses/update', ['status' => $message]);
            if (!empty($response->errors)) {
                throw new Exception(print_r($response, true));
            }
        } catch (Exception $ex) {
            AppController::writeTwitterLog($ex->getMessage());
            throw $ex;
        }
    }
    public function saveNotificationActivity($appId)
    {
        //Save App Notification Sent Activity
        $activityData['app_id'] = $appId;
        $activityData['main_dashboard'] = 0;
        $activityData['app_dashboard'] = 1;
        $activityData['activity'] = "You have sent a push notification";
        $activityData['activity_type'] = 2;
        TpLogActivity:: create($activityData);
    }

    private function sendRequestToGCM(array $tokens, array $fields, array $notification, int $platform, string $serverKey): bool
    {
        $fields['registration_ids'] = $tokens;
        switch ($platform) {
            case TpRegisteredDevice::PLATFORM_ANDROID:
                $fields['data'] = array_merge($fields['data'], $notification);
                break;
            case TpRegisteredDevice::PLATFORM_IOS:
                $fields['notification'] = $notification;
                break;
        }

        $headers = [
            'Authorization:key=' . $serverKey,
            'Content-Type: application/json'
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, self::GCM_URL);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));

        $result = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);
        
        if ($err || !json_decode($result)->success) {
            return false;
        }
        return true;
    }

    public function getLocatedAppUsers(Request $request) {
        try {
            if (empty($request->app_id)) {
                throw new Exception('APPID not found.');
            }
            $data = $request->all();
            $result = [
                'success' => true,
                'data' => [
                    'androidCount' => count(TpRegisteredDevice::getDeviceTokens($data, TpRegisteredDevice::PLATFORM_ANDROID)),
                    'iphoneCount' => count(TpRegisteredDevice::getDeviceTokens($data, TpRegisteredDevice::PLATFORM_IOS))
                ]
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    } 
    
    public function getLocationsByAppId(Request $request) {
        try {
            if (empty($request->app_id)) {
                throw new Exception('APPID not found.');
            }
           
            $result = [
                'success' => true,
                'data' => [
                    'contactList' => ContactUs::getLocationListByAppId($request->app_id),
                ]
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
