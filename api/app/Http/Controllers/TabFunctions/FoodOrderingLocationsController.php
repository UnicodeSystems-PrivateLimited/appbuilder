<?php
namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\TabFunctions\FoodOrderingLocations;
use App\Models\TabFunctions\FoodOrderingLocationsHours;
use App\Models\TabFunctions\FoodOrderingServices;
use Exception;
use Illuminate\Support\Facades\Validator;

class FoodOrderingLocationsController extends Controller
{

    public function getLocationData(Request $request)
    {
        if (empty($request->tabID)) {
            throw new Exception('Tab ID not found.');
        }
        $result = parent::getSuccessResponse(NULL, [
            'foodLocationData' => FoodOrderingLocations::getData($request->tabID)
        ]);
        return response()->json($result);
    }

    public function getLocationHoursData(Request $request)
    {
        if (empty($request->id)) {
            throw new Exception('ID not found.');
        }
        $day_names = array('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
        $foodLocationHours = FoodOrderingLocationsHours::getData($request->id);
        foreach ($foodLocationHours as $f) {
            $i = 0;
            foreach ($day_names as $day) {
                $timeArr = array();
                $result = FoodOrderingLocationsHours::getHoursData($f['location_id'], $day);
                $j = 0;
                foreach ($result as $r) {
                    $start_time_hour = substr($r['start_time'], 0, 2);
                    $start_time_minute = substr($r['start_time'], 3, 2);
                    $end_time_hour = substr($r['end_time'], 0, 2);
                    $end_time_minute = substr($r['end_time'], 3, 2);
                    $timeArr[$j]['id'] = $r['id'];
                    $timeArr[$j]['start_time_hour'] = $start_time_hour;
                    $timeArr[$j]['start_time_minute'] = $start_time_minute;
                    $timeArr[$j]['end_time_hour'] = $end_time_hour;
                    $timeArr[$j]['end_time_minute'] = $end_time_minute;
                    $timeArr[$j]['option'] = 0;
                    $j++;
                }
                $foodLocationHours[$i]['timings'] = $timeArr;
                $i++;
            }
        }
        $result = parent::getSuccessResponse(NULL, [
            'foodLocationHours' => $foodLocationHours
        ]);
        return response()->json($result);
    }

    private static function getEmailValidation() : array
    {
        return [
            'email' => 'email|max:256'
        ];
    }

    public function saveLocationInfo(Request $request) : JsonResponse
    {
        $data = $request->all();
        if ($data['foodlocationInfo']['emails']) {
            $emailArray = explode(',', $data['foodlocationInfo']['emails']);
            foreach ($emailArray as $email) {
                $emaildata = [
                    'email' => trim($email)
                ];
                $emailvalidator = Validator::make($emaildata, self::getEmailValidation());
                if ($emailvalidator->fails()) {
                    throw new Exception('Please enter valid emails.');
                }
            }
        }
        $id = FoodOrderingLocations::updateOrCreate(['id' => $data['foodlocationInfo']['id'] ?? NULL], $data['foodlocationInfo'])->id;
        if ($id) {
            $location_id = $id;
            foreach ($data['foodLocationHours'] as $f) {
                foreach ($f['timings'] as $h) {
                    $start_time = $h['start_time_hour'] . ':' . $h['start_time_minute'].':00';
                    $end_time = $h['end_time_hour'] . ':' . $h['end_time_minute'].':00';
                    FoodOrderingLocationsHours::saveFoodLocationsHours($h['id'], $location_id, $f['day'], $start_time, $end_time, $f['status'], $h['option']);
                }
            }
        }
        $result = parent::getSuccessResponse('Locations options saved successfully.');
        return response()->json($result);
    }

    public function deleteFoodLocation(Request $request)
    {
        if (empty($request->ids)) {
            throw new Exception('ID(s) not found.');
        }
        FoodOrderingLocations::deleteFoodLocation($request->ids);
        $result = parent::getSuccessResponse('Food Location successfully deleted.');
        return response()->json($result);
    }

    public function getLocationList(Request $request)
    {
        if (empty($request->tabID)) {
            throw new Exception('Tab ID not found.');
        }
        $locationList = FoodOrderingLocations::getLocationList($request->tabID);
        $leadTimeData = FoodOrderingServices::getData($request->tabID);
        $lead_time = $leadTimeData['lead_time'];
        $currentTime = strtotime(date('Y-m-d H:i'));
        foreach ($locationList as $l) {
            if ($l->is_custom_timezone) {
                date_default_timezone_set($l->time_zone);
            } else {
                date_default_timezone_set('UTC');
            }
            $day = date('l');
            $time = date('H:i:s');
            $foodLocationHours = FoodOrderingLocationsHours::getLocationHoursData($l->id, $day);
            foreach ($foodLocationHours as $r) {
                $startTime = $r->start_time;
                $endTime = $r->end_time;
                $startTime = date('H:i:s', strtotime('-'.$lead_time.' minutes', strtotime($startTime)));
                if($time >= $startTime && $time <= $endTime) {
                    $is_open = 1;
                } else {
                    $is_open = 0;
                }
                $l->is_open = $is_open;
            }
        }
        $result = parent::getSuccessResponse(NULL, $locationList);
        return response()->json($result);
    }

    public function getLocationHoursList(Request $request)
    {
        if (empty($request->id)) {
            throw new Exception('ID not found.');
        }
        $foodLocationHours = FoodOrderingLocationsHours::getLocationHoursData($request->id);
        $result = parent::getSuccessResponse(NULL, $foodLocationHours);
        return response()->json($result);
    }

}