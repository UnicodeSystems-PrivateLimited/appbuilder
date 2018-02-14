<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AppSessions;
use App\Models\TpRegisteredDevice;
use App\Models\TabSessions;
use Illuminate\Support\Facades\Validator;
use App\Helpers\Country;
use \Datetime;
use \DatePeriod;
use \DateInterval;

class AnalyticsController extends Controller
{

    public function init(Request $request)
    {
        try {
            if (empty($request->app_id)) {
                throw new \Exception("App ID not found.");
            }
            if (empty($request->start_date)) {
                throw new \Exception("Start date not found.");
            }
            if (empty($request->end_date)) {
                throw new \Exception("End date not found.");
            }
            if (empty($request->app_type)) {
                throw new \Exception("App type not found.");
            }

            $begin = new DateTime($request->start_date);
            $end = new DateTime(date("Y-m-d", strtotime("+1 day", strtotime($request->end_date))));
            $intervalDays = $begin->diff($end)->days;
            $intervalSpec = $intervalDays > 31 ? 'P1M' : 'P1D';
            $daterange = new DatePeriod($begin, new DateInterval($intervalSpec), $end);

            $androidSessionDetails = AppSessions::getAppSessionDetails($request->app_id, AppSessions::PLATFORM_ANDROID, $request->start_date, $request->end_date, $request->app_type);
            $iosSessionDetails = AppSessions::getAppSessionDetails($request->app_id, AppSessions::PLATFORM_IOS, $request->start_date, $request->end_date, $request->app_type);
            $html5SessionDetails = AppSessions::getAppSessionDetails($request->app_id, AppSessions::PLATFORM_HTML5, $request->start_date, $request->end_date, $request->app_type);
            $tempSessionData = AppSessions::getAppSessionDatewise($request->app_id, $request->start_date, $request->end_date, $request->app_type, $intervalDays > 30 ? true : false);

            if ($request->app_type == AppSessions::APP_TYPE_LIVE) {
                $data['android_app_downloads'] = TpRegisteredDevice::getAppDownloadCount($request->app_id, AppSessions::PLATFORM_ANDROID, $request->start_date, $request->end_date);
                $data['ios_app_downloads'] = TpRegisteredDevice::getAppDownloadCount($request->app_id, AppSessions::PLATFORM_IOS, $request->start_date, $request->end_date);
            }

            $androidSessionData = [];
            $tempAndroidSessionData = [];
            $iosSessionData = [];
            $tempIosSessionData = [];
            $html5SessionData = [];
            $tempHtml5SessionData = [];

            foreach ($tempSessionData as $val) {
                $dateKey = $intervalDays > 31 ? date('Y-m', strtotime($val->createdDate)) : $val->createdDate;
                if ($val->platform == AppSessions::PLATFORM_ANDROID) {
                    $tempAndroidSessionData[$dateKey] = $val->sessions;
                } elseif ($val->platform == AppSessions::PLATFORM_IOS) {
                    $tempIosSessionData[$dateKey] = $val->sessions;
                } else {
                    $tempHtml5SessionData[$dateKey] = $val->sessions;
                }
            }

            foreach ($daterange as $date) {
                $dateKey = $date->format($intervalDays > 31 ? "Y-m" : "Y-m-d");
                $androidSessionData[$dateKey] = array_key_exists($dateKey, $tempAndroidSessionData) ? $tempAndroidSessionData[$dateKey] : 0;
                $iosSessionData[$dateKey] = array_key_exists($dateKey, $tempIosSessionData) ? $tempIosSessionData[$dateKey] : 0;
                $html5SessionData[$dateKey] = array_key_exists($dateKey, $tempHtml5SessionData) ? $tempHtml5SessionData[$dateKey] : 0;
            }

            $data['android_sessions'] = $androidSessionDetails[0]['sessions'];
            $data['ios_sessions'] = $iosSessionDetails[0]['sessions'];
            $data['html5_sessions'] = $html5SessionDetails[0]['sessions'];
            $data['android_avg_time'] = round($androidSessionDetails[0]['avg_time'], 1);
            $data['ios_avg_time'] = round($iosSessionDetails[0]['avg_time'], 1);
            $data['html5_avg_time'] = round($html5SessionDetails[0]['avg_time'], 1);
            $data['android_sessions_data'] = $androidSessionData;
            $data['ios_sessions_data'] = $iosSessionData;
            $data['html5_sessions_data'] = $html5SessionData;
            $data['country_sessions'] = AppSessions::getCountryWiseSessions($request->app_id, $request->app_type);
            $data['tab_sessions'] = TabSessions::getTabSessionsByDateRange($request->app_id, $request->app_type, $request->start_date, $request->end_date);

            $result = [
                'success' => true,
                'data' => $data
            ];
        } catch (\Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function saveAppSession(Request $request)
    {
        try {
            $data = $request->all();
            $validator = Validator::make($data, self::getAppSessionValidationRules());
            if ($validator->fails()) {
                throw new \Exception($validator->errors());
            }
            if (!empty($data['country_code']) && empty($data['country'])) {
                $data['country'] = Country::getName($data['country_code']);
            }
            if (!empty($request->id)) {
                AppSessions::where('id', $request->id)->update($data);
                $sessionID = $request->id;
            } else {
                $sessionID = AppSessions::create($data)->id;
            }
            $result = [
                'success' => true,
                'message' => 'App session saved.',
                'data' => ['sessionID' => $sessionID]
            ];
        } catch (\Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    private static function getAppSessionValidationRules(): array
    {
        return [
            'id' => 'integer',
            'app_id' => 'integer',
            'app_type' => 'integer',
            'platform' => 'integer',
            'country' => 'max:128',
            'country_code' => 'max:2'
        ];
    }

    public function saveTabSession(Request $request)
    {
        try {
            $data = $request->all();
            $validator = Validator::make($data, self::getTabSessionValidationRules());
            if ($validator->fails()) {
                throw new \Exception($validator->errors());
            }
            TabSessions::create($data);
            $result = [
                'success' => true,
                'message' => 'Tab session saved.'
            ];
        } catch (\Exception $ex) {
            $result = [
                'success' => false,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    private static function getTabSessionValidationRules(): array
    {
        return [
            'app_id' => 'required|integer',
            'tab_id' => 'required|integer',
            'app_type' => 'required|integer',
            'platform' => 'required|integer',
            'device_uuid' => 'max:256'
        ];
    }
}
