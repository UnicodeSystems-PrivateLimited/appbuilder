<?php
namespace App\Http\Controllers\Apps;

use App\Helpers\Helper;
use Exception;
use App\Http\Controllers\Controller;
use Facebook;
use Illuminate\Http\Request;
use App\Models \{
    TpAppsEntity,
        TpRegisteredDevice,
        PushNotification
};
use View;
use App\Http\Controllers\TabFunctions\PushNotificationController;
use App\Models\TabFunctions\MembershipUser;
use App\Models\TpLogActivity;
use App\Models\TabFunctions\SocialUserDeviceAssoc;
use Illuminate\Pagination\Paginator;
use App\Models\FirebaseAppCredentials;
use Illuminate\Http\JsonResponse;
use App\Models\TabFunctions\FoodOrderingPayment;
use App\Models\TabFunctions\FoodOrders;
use Validator;
use DB;
use App\Models\TabFunctions\FoodOrderingCardPayment;
use App\Models\TabFunctions\FoodOrderingEmail;
use App\Http\Controllers\TabFunctions\FoodOrderingController;
use Mail;

class AppController extends Controller
{

    const NOTIFICATION_PLATFORM_KEYS = [
        TpRegisteredDevice::PLATFORM_ANDROID => 'android_type',
        TpRegisteredDevice::PLATFORM_IOS => 'iphone_type'
    ];
    const FACEBOOK_APP_ID = '1020349944740206';
    const FACEBOOK_APP_SECRET = '0f23e716f79c27f1599f1585e8c13f75';
    const FACEBOOK_APP_ACCESS_TOKEN = self::FACEBOOK_APP_ID . '|' . self::FACEBOOK_APP_SECRET;
    const TWITTER_CONSUMER_KEY = 'O4tnwBdOp3JsdFymaynyVx9TV';
    const TWITTER_CONSUMER_SECRET = 'ijgtEaN8Iyx0zl32weMStleFGxIvRHt2IgkpBX2KQTmXrEn1if';
    const SPREEDLY_ENDPOINTS = [
        'GATEWAY' => 'https://core.spreedly.com/v1/gateways.json',
        'PURCHASE' => 'https://core.spreedly.com/v1/gateways/<gateway_token>/purchase.json'
    ];
    const SPREEDLY_ENV_KEY = '3vfvsv1zZeMRAaOBO3ruw7NuPdW';
    const SPREEDLY_ACCESS_SECRET = 'CXKgp7KkSu9v4nwDsCVk4Pl1YsUa8FxS4FX1jfOixpJwEGUcbwtMaI3c3bCZDADw';

    public function saveLocation(Request $request)
    {
        try {
            // file_put_contents('/var/www/html/tappit/test.txt', print_r($request->all(), TRUE), FILE_APPEND);
            if (empty($request->appCode) || empty($request->deviceUUID)) {
                throw new Exception('App Code and Device UUID are required.');
            }

            if (!$appID = TpAppsEntity::getAppId($request->appCode)) {
                throw new Exception('Invalid app code provided.');
            }

            if (!$location = $request->all()[0] ?? null) {
                throw new Exception('Location data not found.');
            }

            TpRegisteredDevice::updateByAppIDAndDeviceUUID([
                'latitude' => $location['latitude'],
                'longitude' => $location['longitude'],
                'location_updated_at' => date('Y-m-d H:i:s')
            ], $appID, $request->deviceUUID);

            $deviceData = TpRegisteredDevice::getDeviceData($appID, $request->deviceUUID);

            $geofenceNotifications = PushNotification::getActiveGeofenceNotifications($appID);
            foreach ($geofenceNotifications as $data) {
                $this->sendPushNotification($data, $deviceData);
            }

            $result = [
                'success' => true,
                'message' => 'Current location saved',
            ];
        } catch (Exception $e) {
            $result = [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
        // file_put_contents('/var/www/html/tappit/test.txt', print_r($result, TRUE) . $request->appCode, FILE_APPEND);
        return response()->json($result);
    }

    public function sendPushNotification($data, $deviceData)
    {
        if (!$data->{self::NOTIFICATION_PLATFORM_KEYS[$deviceData->platform]}) {
            return;
        }

        // User/User Group checks
        if ((!empty($data->user_id) || !empty($data->user_group_id)) && !empty($deviceData->member_id)) {
            if (!self::canSendToUserOrUserGroup(
                json_decode($data->user_id, true) ?? [],
                json_decode($data->user_group_id, true) ?? [],
                $deviceData->member_id
            )) {
                return;
            }
        }

        // Subscription checks
        if (!empty($data->subscription_id) && !TpRegisteredDevice::isSubscribed($deviceData->id, json_decode($data->subscription_id, true) ?? [])) {
            return;
        }

        $distance = TpRegisteredDevice::calculateDistance(
            $deviceData->latitude,
            $deviceData->longitude,
            $data->m_lat,
            $data->m_long,
            $data->span_type
        );
        if ($distance > $data->span || PushNotification::isGeofenceNotificationAlreadySent($deviceData->id, $data->id)) {
            return;
        }

        $url = 'https://android.googleapis.com/gcm/send';
        $fields = [
            'registration_ids' => [$deviceData->device_token],
            'content_available' => true,
            'priority' => 'high',
            'data' => [
                'title' => TpAppsEntity::getAppName($data->app_id),
                'body' => $data->message ?? null,
                'type' => 'inbox',
                'content_type' => $data->content_type ?? 0,
                'tab_id' => $data->tab_id ?? null,
                'website_url' => $data->website_url ?? null,
            ],
            'notification' => [
                'title' => TpAppsEntity::getAppName($data->app_id),
                'body' => $data->message ?? null
            ]
        ];

        $headers = [
            'Authorization:key=' . FirebaseAppCredentials::getServerKey($data->app_id) ?? PushNotificationController::GOOGLE_API_KEY,
            'Content-Type: application/json'
        ];
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));

        $result = curl_exec($ch);
        $err = curl_error($ch);
        if (!$err && json_decode($result)->success) {
            PushNotification::updateSentDeviceIDsForGeofence($deviceData->id, $data->id);
            //Save App Notification Sent Activity
            PushNotificationController::saveNotificationActivity($data->app_id);
        }

        curl_close($ch);
    }

    public function saveDeviceMember(Request $request)
    {
        try {
            if (!$request->userName || !$request->deviceUUID || !$request->appCode) {
                throw new Exception("Username/Device UUID/App Code not found.");
            }
            if (!$appID = TpAppsEntity::getAppId($request->appCode)) {
                throw new Exception('Invalid app code provided.');
            }
            if (!$memberID = MembershipUser::getID($request->userName)) {
                throw new Exception('Provided username doesn\'t exist.');
            }

            TpRegisteredDevice::updateByAppIDAndDeviceUUID(['member_id' => $memberID], $appID, $request->deviceUUID);
            $result = [
                'success' => true,
                'message' => 'Device member saved',
            ];
        } catch (Exception $e) {
            $result = [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function clearDeviceMember(Request $request)
    {
        try {
            if (!$request->deviceUUID || !$request->appCode) {
                throw new Exception("Username/Device UUID/App Code not found.");
            }
            if (!$appID = TpAppsEntity::getAppId($request->appCode)) {
                throw new Exception('Invalid app code provided.');
            }

            TpRegisteredDevice::updateByAppIDAndDeviceUUID(['member_id' => null], $appID, $request->deviceUUID);
            $result = [
                'success' => true,
                'message' => 'Device member cleared',
            ];
        } catch (Exception $e) {
            $result = [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
        return response()->json($result);
    }

    public static function canSendToUserOrUserGroup(array $userIDs, array $userGroupIDs, int $deviceMemberID) : bool
    {
        if (in_array($deviceMemberID, $userIDs)) {
            return true;
        }
        $deviceMember = MembershipUser::find($deviceMemberID);
        if (in_array($deviceMember->group_id, $userGroupIDs)) {
            return true;
        }
        return false;
    }

    public function saveFacebookTokenForPushNotifications(Request $request)
    {
        try {
            if (!$request->appID || !$request->accessToken) {
                throw new Exception("App ID/Access Token not found.");
            }
            $fb = new Facebook\Facebook();
            $response = $fb->get('/oauth/access_token?grant_type=fb_exchange_token&client_id=' . self::FACEBOOK_APP_ID . '&client_secret=' . self::FACEBOOK_APP_SECRET . '&fb_exchange_token=' . $request->accessToken, $request->accessToken);
            $response = $response->getDecodedBody();
            TpAppsEntity::updateData(['push_facebook_token' => $response['access_token']], $request->appID);
            $result = [
                'success' => true,
                'message' => 'Facebook token saved',
            ];
        } catch (Exception $e) {
            $result = [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
        return response()->json($result);
    }

    public static function getLogsPath() : string
    {
        return Helper::getUploadDirectoryPath('logs');
    }

    public static function writeFacebookLog(string $log)
    {
        $log = '[' . date('Y-m-d H:i:s') . '] ' . $log . PHP_EOL;
        file_put_contents(self::getLogsPath() . '/facebook.log', $log, FILE_APPEND);
    }

    public static function writeTwitterLog(string $log)
    {
        $log = '[' . date('Y-m-d H:i:s') . '] ' . $log . PHP_EOL;
        file_put_contents(self::getLogsPath() . '/twitter.log', $log, FILE_APPEND);
    }

    public function deleteFacebookToken(Request $request)
    {
        try {
            if (empty($request->appID)) {
                throw new Exception("App ID not found.");
            }
            TpAppsEntity::updateData(['push_facebook_token' => null], $request->appID);
            $result = [
                'success' => true,
                'message' => 'Facebook token deleted',
            ];
        } catch (Exception $e) {
            $result = [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function saveTwitterTokenAndSecret(Request $request)
    {
        try {
            if (!$request->appID || !$request->accessToken || !$request->secret) {
                throw new Exception("App ID/Access Token/Secret not found.");
            }
            TpAppsEntity::updateData([
                'push_twitter_token' => $request->accessToken,
                'push_twitter_secret' => $request->secret
            ], $request->appID);
            $result = [
                'success' => true,
                'message' => 'Twitter token and secret saved',
            ];
        } catch (Exception $e) {
            $result = [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function deleteTwitterTokenAndSecret(Request $request)
    {
        try {
            if (empty($request->appID)) {
                throw new Exception("App ID not found.");
            }
            TpAppsEntity::updateData([
                'push_twitter_token' => null,
                'push_twitter_secret' => null
            ], $request->appID);
            $result = [
                'success' => true,
                'message' => 'Twitter token and secrets deleted',
            ];
        } catch (Exception $e) {
            $result = [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function saveAppLaunchActivity(Request $request)
    {
        try {
            if (empty($request->appId)) {
                throw new Exception("App ID not found.");
            }
            $appData = TpAppsEntity::getAppData($request->appId);
            $appName = $appData['app_name'];
            $appCode = $appData['app_code'];

            $activityData['app_id'] = $request->appId;
            $activityData['main_dashboard'] = 1;
            $activityData['app_dashboard'] = 0;
            $activityData['activity'] = $appName . ' [' . $appCode . '] logged in on';
            $activityData['activity_type'] = 1;

            TpLogActivity::create($activityData);
            $result = [
                'success' => true,
                'message' => ['Launch app activity saved successfully'],
            ];
        } catch (Exception $e) {
            $result = [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function getActivityList(Request $request, $currentPage = 1, $perPage = 10)
    {
        try {
//            $data = [
//                'activities' => TpLogActivity::getMainDashboardActivities()
//            ];
            Paginator::currentPageResolver(function () use ($currentPage) {
                return $currentPage;
            });
            $result = [
                'success' => true,
                'data' => TpLogActivity::getMainDashboardActivities($perPage)
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getAppActivityList(Request $request, $currentPage = 1, $perPage = 10)
    {
        try {
//            $data = [
//                'activities' => TpLogActivity::getAppActivities()
//            ];
            Paginator::currentPageResolver(function () use ($currentPage) {
                return $currentPage;
            });
            $result = [
                'success' => true,
                'data' => TpLogActivity::getAppActivities($request->appId, $perPage),
                'topUser' => SocialUserDeviceAssoc::getAppUsers($request->appId)
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getServerId(Request $request)
    {
        $result = parent::getSuccessResponse(null, [
            'list' => FirebaseAppCredentials::getServerId(),
            'appkeydata' => FirebaseAppCredentials::getAppServerKey($request->app_id)
        ]);
        return response()->json($result);
    }

    public function saveServerKey(Request $request)
    {
        if (empty($request->server_key)) {
            throw new Exception('Server key is required.');
        } else if (empty($request->sender_id)) {
            throw new Exception('Sender Id is required.');
        } else {
            $id = FirebaseAppCredentials::saveServerKeyData($request->id, $request->app_id, $request->server_key, $request->sender_id);
        }
        $result = parent::getSuccessResponse('Push notification credentials saved.', ['id' => $id]);
        return response()->json($result);
    }

    public function getPaymentForm(Request $request)
    {
        return View::make('payment.payment-form')->with([
            'appCode' => $request->appCode,
            'language' => $request->language,
            'desc' => $request->desc,
            'total_price' => $request->total_price
        ]);
    }

    public function onSpreedlyPaymentMethodAdd()
    {
        return response('Processing ...');
    }

    public function makePayment(Request $request) : JsonResponse
    {
        $validator = $validator = Validator::make($request->all(), [
            'order_id' => 'required|integer',
            'tab_id' => 'required|integer',
            'app_code' => 'required',
            'first_name' => 'required',
            'last_name' => 'required',
            'phone' => 'required',
            'email' => 'email',
            'total_charges' => 'required|numeric',
            'payment_method_token' => 'required'
        ]);
        if ($validator->fails()) {
            throw new Exception($validator->errors()->first());
        }
        $paymentData = FoodOrderingPayment::getData($request->tab_id);
        $gatewayCreds = json_decode($paymentData->payment_gateway_credentials);
        
        $response = $this->sendSpreedlyRequest(
            $this->getGatewayRequestData($paymentData->payment_gateway, $gatewayCreds),
            self::SPREEDLY_ENDPOINTS['GATEWAY']
        );
        if (!empty($response->errors)) {
            throw new Exception('Payment processing failed.');
        }
        $gatewayToken = $response->gateway->token;
        
        $appID = TpAppsEntity::getAppId($request->app_code);
        $purchaseRequestData = ['transaction' => [
            'payment_method_token' => $request->payment_method_token,
            // Amount should be multiplied by 100 because Spreedly accepts amount in cents, not Dollars.
            'amount' => $request->total_charges * 100,
            'currency_code' => $paymentData->currency
            ]];
        
        //Save Food Order Made Activity
        $activityData['app_id'] = $appID;
        $activityData['main_dashboard'] = 0;
        $activityData['app_dashboard'] = 1;
        $activityData['activity'] = "Order Made.";
        $activityData['activity_type'] = 4;
            
        $purchaseResponse = DB::transaction(function () use ($request, $purchaseRequestData, $gatewayToken, $activityData) {
            FoodOrders::saveOrderPaidAndPlacedStatus($request->order_id, true);
            TpLogActivity:: create($activityData);
            $purchaseResponse = $this->sendSpreedlyRequest($purchaseRequestData, str_replace('<gateway_token>', $gatewayToken, self::SPREEDLY_ENDPOINTS['PURCHASE']));
            if (!empty($purchaseResponse->errors) || empty($purchaseResponse->transaction->succeeded)) {
                throw new Exception('Payment failed.');
            }
            return $purchaseResponse;
        });
        
        
        $this->savePaymentInsertData($appID, $request->except('app_code'), $purchaseResponse);
        
        $this->sendEmailReceipt($request);
        
        $result = parent::getSuccessResponse('Payment successful.');
        return response()->json($result);
    }
    
    private function getGatewayRequestData(int $paymentGateway, $gatewayCreds) : array
    {
        switch ($paymentGateway) {
            case FoodOrderingPayment::PAYMENT_GATEWAY_AUTHORIZE_NET:
            $gateway = [
                'gateway_type' => FoodOrderingPayment::AUTHORIZE_NET_KEY,
                    'login' => $gatewayCreds->api_login_id ?? null,
                    'password' => $gatewayCreds->transaction_key ?? null
                ];
                break;
            case FoodOrderingPayment::PAYMENT_GATEWAY_PAYPAL:
                $gateway = [
                    'gateway_type' => FoodOrderingPayment::PAYPAL_KEY,
                    'login' => $gatewayCreds->api_secret_key ?? null
                ];
                break;
            case FoodOrderingPayment::PAYMENT_GATEWAY_STRIPE:
                $gateway = [
                    'gateway_type' => FoodOrderingPayment::STRIPE_KEY,
                    'mode' => 'signature',
                    'login' => $gatewayCreds->api_username ?? null,
                    'password' => $gatewayCreds->api_password ?? null,
                    'signature' => $gatewayCreds->signature ?? null
                ];
                break;
            default:
                throw new Exception('No payment gateway found.');
        }
        // TODO: Remove the next line when spreedly is subscribed and production gateways are active.
        $gateway = ['gateway_type' => 'test'];

        return ['gateway' => $gateway];
    }

    private function savePaymentInsertData(int $appID, array $paymentInsertData, $purchaseResponse)
    {
        $paymentInsertData['app_id'] = $appID;
        $paymentInsertData['token'] = $purchaseResponse->transaction->token ?? '';
        $paymentInsertData['gateway_type'] = $purchaseResponse->transaction->gateway_type ?? '';
        $paymentInsertData['billing_address1'] = $purchaseResponse->transaction->payment_method->address1 ?? '';
        $paymentInsertData['billing_address2'] = $purchaseResponse->transaction->payment_method->address2 ?? '';
        $paymentInsertData['billing_city'] = $purchaseResponse->transaction->payment_method->city ?? '';
        $paymentInsertData['billing_state'] = $purchaseResponse->transaction->payment_method->state ?? '';
        $paymentInsertData['billing_zip'] = $purchaseResponse->transaction->payment_method->zip ?? '';
        $paymentInsertData['billing_country'] = $purchaseResponse->transaction->payment_method->country ?? '';
        FoodOrderingCardPayment::create($paymentInsertData);
    }

    private function sendSpreedlyRequest(array $data, string $endPoint)
    {
        $ch = curl_init($endPoint);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERPWD, self::SPREEDLY_ENV_KEY . ':' . self::SPREEDLY_ACCESS_SECRET);
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return json_decode($result);
    }

    private function sendEmailReceipt(Request $request) {
        $q = new FoodOrderingController();
        $foodEmailData = FoodOrderingEmail::getFoodEmail($request->tab_id);
        $orderData = FoodOrders::getOrderData($request->order_id);
        $orderData = json_decode(json_encode($orderData[0]), True);
        $fromEmail = 'tappitmobapp@gmail.com';
        if(!empty($orderData)) {
            $orderData['tax_list'] = json_decode($orderData['tax_list']);
            $orderData['contact'] = json_decode($orderData['contact']);
            $orderData['items'] = json_decode($orderData['items']);
            $orderData['tax_list'] = json_decode(json_encode($orderData['tax_list']), True);
            $orderData['contact'] = json_decode(json_encode($orderData['contact']), True);
            $orderData['items'] = json_decode(json_encode($orderData['items']), True);
            if($orderData['is_email_receipt'] && !empty($orderData['contact']['email'])) {
                $userTemplate = $q->sendUserEmail($orderData);
                $userTemplate = str_replace('{ORDER_NO}',$request->order_id, $userTemplate);
                $email = $orderData['contact']['email'];
                $userSubject = $foodEmailData[0]['subject'];
                $userData = ['template' => $userTemplate, 'from_email' => $fromEmail, 'email' => $email, 'subject' => $userSubject];
                $userMail = Mail::send('emails.orderEmail', $userData, function ($message) use ($userData, $fromEmail) {
                    $message->from($fromEmail, 'Tappit');
                    $message->to($userData['email'])->subject($userData['subject']);
                });
            }
            if(isset($foodEmailData[1]['admin_email']) && $foodEmailData[1]['admin_email'] != '') {
                $adminTemplate = $q->sendAdminEmail($orderData);
                $adminTemplate = str_replace('{ORDER_NO}',$request->order_id, $adminTemplate);
                $adminEmail = $foodEmailData[1]['admin_email'];
                $adminSubject = $foodEmailData[1]['subject'];
                $adminData = ['template' => $adminTemplate, 'from_email' => $fromEmail, 'email' => $adminEmail, 'subject' => $adminSubject];
                $adminMail = Mail::send('emails.orderEmail', $adminData, function ($message) use ($adminData, $fromEmail) {
                    $message->from($fromEmail, 'Tappit');
                    $message->to($adminData['email'])->subject($adminData['subject']);
                });
            }
        }
    }

}
