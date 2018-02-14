<?php

namespace App\Models;

use App\Helpers\Helper;
use App\Models\TabFunctions\InboxSubscription;
use App\Models\TabFunctions\MembershipUser;
use Illuminate\Database\Eloquent\Model;
use DB;

class TpRegisteredDevice extends Model {

    protected $table = 'tp_registered_devices';
    protected $guarded = ["id"];

    const TABLE = 'tp_registered_devices';
    const PLATFORM_BOTH = 0;
    const PLATFORM_ANDROID = 1;
    const PLATFORM_IOS = 2;

    public static function getRegisteredDevice($appId, $deviceUuid): int {
        $registeredDevice = self::select('id')
            ->where('app_id', $appId)
            ->where('device_uuid', $deviceUuid)
            ->first();
        return $registeredDevice ? $registeredDevice->id : 0;
    }

    public static function getDeviceTokens(array $data, int $platform, array $userGroupIDs = [], array $userIDs = [], array $subscriptionIDs = []): array {
        $selectArr = ['main.device_token', 'main.latitude', 'main.longitude', 'main.location_updated_at'];

        if (!empty($subscriptionIDs)) {
            $selectArr[] = DB::raw("GROUP_CONCAT(CONCAT(subs.subscription_id, ':', subs.is_subscribed)) as subscriptions");
        }

        $query = DB::table(self::TABLE . ' as main')
            ->select($selectArr)
            ->where('main.app_id', $data['app_id']);

        if (!empty($userGroupIDs) || !empty($userIDs)) {
            $query->join(MembershipUser::TABLE . ' as mu', 'main.member_id', '=', 'mu.id');
            $userIDs = $userIDs ?? [];
            $query->whereIn('main.member_id', $userIDs);
        }

        if (!empty($subscriptionIDs)) {
            $query->leftJoin(InboxSubscription::SUBSCRIBER . ' as subs', 'main.id', '=', 'subs.device_id');
            $query->groupBy('main.id');
        }

        if ($platform !== self::PLATFORM_BOTH) {
            $query->where('main.platform', $platform);
        }

        $result = $query->get();
        $tokens = [];

        if (!empty($subscriptionIDs)) {
            $result = self::getSubscribedDevices($result, $subscriptionIDs);
        }

        if ($data['audience'] == PushNotification::AUDIENCE_SPECIFIC_AREA_USERS && $data['location_type'] == PushNotification::LOCATION_TYPE_POINT) {
            $tokens = self::filterAccordingToLocation($result, $data);
        } else {
            foreach ($result as $row) {
                $tokens[] = $row->device_token;
            }
        }
        return $tokens;
    }

    private static function filterAccordingToLocation($result, array $data): array {
        $tokens = [];
        foreach ($result as $row) {
            if (!$row->latitude || !$row->longitude || !self::isRecentlyUpdated($row->location_updated_at)) {
                continue;
            }
            $distance = self::calculateDistance($row->latitude, $row->longitude, $data['m_lat'], $data['m_long'], $data['span_type']);
            if ($distance <= $data['span']) {
                $tokens[] = $row->device_token;
            }
        }
        return $tokens;
    }

    public static function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2, string $unit): float {
        $theta = $lon1 - $lon2;
        $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
        $dist = acos($dist);
        $dist = rad2deg($dist);
        $miles = $dist * 60 * 1.1515;

        return $unit == PushNotification::SPAN_TYPE_KILOMETERS ? ($miles * 1.609344) : $miles;
    }

    private static function isRecentlyUpdated($updateTime): bool {
        // 86400 seconds = 1 day
        return $updateTime && time() - strtotime($updateTime) <= 86400 ? TRUE : FALSE;
    }

    public static function getDeviceIdByUuid($deviceUuid): int {
        $registeredDevice = self::select('id')
            ->where('device_uuid', $deviceUuid)
            ->first();
        return $registeredDevice ? $registeredDevice->id : false;
    }

    public static function updateByAppIDAndDeviceUUID(array $data, int $appID, string $deviceUUID) {
        self::where('app_id', $appID)
            ->where('device_uuid', $deviceUUID)
            ->update($data);
    }

    public static function getDeviceData(int $appID, string $deviceUUID) {
        return self::select('id', 'device_token', 'platform', 'latitude', 'longitude', 'member_id')
            ->where('app_id', $appID)
            ->where('device_uuid', $deviceUUID)
            ->first();
    }

    private static function getSubscribedDevices(array $result, array $subscriptionIDs): array {
        foreach ($result as $key => $device) {
            $subscriptions = !empty($device->subscriptions) ? explode(',', $device->subscriptions) : [];
            if (empty($subscriptions)) {
                continue;
            }
            $subscriptionStatus = [];
            foreach ($subscriptions as $subscription) {
                $subscription = explode(':', $subscription);
                $subscriptionStatus[$subscription[0]] = $subscription[1] ?? 0;
            }
            $subscriptionStatusKeys = array_keys($subscriptionStatus);
            $intersection = array_intersect($subscriptionIDs, $subscriptionStatusKeys);
            if (empty($intersection)) {
                continue;
            }
            if (!empty(array_diff($subscriptionIDs, $subscriptionStatusKeys))) {
                continue;
            }
            $sendNotification = FALSE;
            foreach ($intersection as $value) {
                if ($subscriptionStatus[$value] == 1) {
                    $sendNotification = TRUE;
                }
            }
            if (!$sendNotification) {
                unset($result[$key]);
            }
        }
        return $result;
    }

    public static function isSubscribed(int $deviceID, array $subscriptionIDs): bool {
        $subscriptionStatus = DB::table(InboxSubscription::SUBSCRIBER)
            ->select('subscription_id', 'is_subscribed')
            ->where('device_id', $deviceID)
            ->get();

        if (!$subscriptionStatus) {
            return TRUE;
        }

        $storedSubscriptionIDs = array_column($subscriptionStatus, 'subscription_id');
        $intersection = array_intersect($subscriptionIDs, $storedSubscriptionIDs);
        if (empty($intersection)) {
            return TRUE;
        }
        if (!empty(array_diff($subscriptionIDs, $storedSubscriptionIDs))) {
            return TRUE;
        }

        $combinedSubscriptionStatus = array_combine($storedSubscriptionIDs, array_column($subscriptionStatus, 'is_subscribed'));
        $sendNotification = FALSE;
        foreach ($intersection as $value) {
            if ($combinedSubscriptionStatus[$value] == 1) {
                $sendNotification = TRUE;
            }
        }

        return $sendNotification ? TRUE : FALSE;
    }

    public static function incrementPushNotiCount(int $appID, string $deviceUUID) {
        TpRegisteredDevice::where('device_uuid', $deviceUUID)
            ->where('app_id', $appID)
            ->increment('push_noti_count');
    }

    public static function getAppDownloadCount(int $appID, int $deviceType, string $startDate = NULL, string $endDate = NULL): int {
        if ($startDate && $endDate) {
            $startDate = $startDate . ' 00:00:00';
            $endDate = $endDate . ' 23:59:59';
        }

        $query = self::select('id')
            ->where('app_id', $appID)
            ->where('platform', $deviceType);

        if($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        return $query->count();
    }

}
