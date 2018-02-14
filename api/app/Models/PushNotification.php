<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\TabFunctions\MembershipGroup;
use App\Models\TabFunctions\MembershipUser;
use App\Models\TabFunctions\InboxSettings;
use App\Models\TabFunctions\InboxSubscription;
use App\Models\TabFunctions\EventsTimeZone;
use DB;

class PushNotification extends Model
{

    protected $table = 'tp_push_notification';
    protected $guarded = ["id"];

    const TABLE = 'tp_push_notification';

    const AUDIENCE_ALL_USERS = 1;
    const AUDIENCE_SPECIFIC_AREA_USERS = 2;

    const LOCATION_TYPE_POINT = 1;
    const LOCATION_TYPE_GEOFENCE = 2;

    const SPAN_TYPE_KILOMETERS = 'Km';
    const SPAN_TYPE_MILES = 'miles';

    public static function userGroupList($appId)
    {
        return $userGroup = DB::table(MembershipGroup::TABLE . ' as main')
            ->select('main.id', 'main.group_name', 'main.tab_id', 'main.tabs_access')
            ->join(TpAppsTabEntity::TABLE . ' as tab', 'main.tab_id', '=', 'tab.id')
            ->where('tab.app_id', $appId)
            ->orderBy('main.id', 'DESC')
            ->get();
    }

    public static function getUserGroupId($appId, $groupId)
    {
        return $userGroup = DB::table(MembershipUser::TABLE . ' as main')
            ->select('main.id', 'main.user_name')
            ->join(TpAppsTabEntity::TABLE . ' as tab', 'main.tab_id', '=', 'tab.id')
            ->where('tab.app_id', $appId)
            ->whereIn('main.group_id', explode(',', $groupId))
            ->get();
    }

    public static function getAllUser($appId)
    {
        return $userGroup = DB::table(MembershipUser::TABLE . ' as main')
            ->select('main.id', 'main.user_name', 'main.group_id')
            ->join(TpAppsTabEntity::TABLE . ' as tab', 'main.tab_id', '=', 'tab.id')
            ->where('tab.app_id', $appId)
            ->where('main.login_type', 3)
            ->orderBy('main.user_name', 'ASC')
            ->get();
    }

    public static function inboxSettings($appId)
    {
        return $settings = DB::table(InboxSettings::TABLE . ' as main')
            ->select('main.*')
            ->join(TpAppsTabEntity::TABLE . ' as tab', 'main.tab_id', '=', 'tab.id')
            ->where('tab.app_id', $appId)
            ->first();
    }

    public static function subscriptionList($appId)
    {
        return $subsList = DB::table(InboxSubscription::TABLE . ' as main')
            ->select('main.id', 'main.subscription_name', 'main.tab_id')
            ->join(TpAppsTabEntity::TABLE . ' as tab', 'main.tab_id', '=', 'tab.id')
            ->where('tab.app_id', $appId)
            ->orderBy(DB::raw('(main.sort_order=0)'), 'ASC')
            ->orderBy('main.sort_order', 'ASC')
            ->orderBy('main.subscription_name', 'ASC')
            ->get();
    }

    public static function sentMsgList(int $appId)
    {
        return self::select('message', 'created_at', 'id')
            ->where('app_id', $appId)
            ->where('send_now', 1)
            ->where('created_at', '<', DB::raw('NOW()'))
            ->get();
    }

    public static function scheduledMsgList(int $appId)
    {
        return self::select('message', 'send_on_date', 'id')
            ->where('app_id', $appId)
            ->where('send_now', 0)
            ->where('send_on_date', '>=', DB::raw('NOW()'))
            ->get();
    }

    public static function allNotiList(int $appId)
    {
        return self::select('*')
            ->where('app_id', $appId)
            ->get();
    }

    public static function ionNotiList(int $appId, int $deviceID, int $memberID)
    {
        $bgImagePath = url('/storage/app/public/display/user_images');
        
        $deviceIDCountInSubscription = DB::table(InboxSubscription::SUBSCRIBER)
            ->where('device_id', $deviceID)
            ->count();
            
        $result = DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.app_id', 'main.tab_id', 'main.message', 'main.created_at', 'main.website_url', 'main.android_type', 'main.iphone_type', 'masterTab.tab_code as tab_func_code', DB::raw("CONCAT('$bgImagePath','/',image.name) as bgImage"), 'tab.title', 'main.audience', 'main.location_type', 'main.span', 'main.m_lat', 'main.m_long', 'main.span_type')
            ->leftJoin(TpAppsTabEntity::TABLE . ' as tab', 'main.tab_id', '=', 'tab.id')
            ->leftJoin(MstTpTabEntity::TABLE . ' as masterTab', 'masterTab.id', '=', 'tab.tab_func_id')
            ->leftJoin(TpAppsTabEntity::IMAGE_TABLE . ' as image', 'image.id', '=', 'tab.background_image')
            ->where('main.app_id', $appId)
            ->where(function ($query) {
                $query->where('main.android_type', 1)
                    ->orWhere('main.iphone_type', 1);
            })
            ->where(function ($query) use ($deviceIDCountInSubscription, $deviceID) {
                $query->whereNull('main.subscription_id')
                    ->orWhere(DB::raw($deviceIDCountInSubscription), 0)
                    ->orWhere(DB::raw(0), '<', function ($query) use ($deviceID) {
                        $query->select(DB::raw('COUNT(*)'))
                            ->from(InboxSubscription::SUBSCRIBER . ' as sub')
                            ->where('sub.device_id', $deviceID)
                            ->where('is_subscribed', 1)
                            ->where(DB::raw("FIND_IN_SET(sub.subscription_id, REPLACE(REPLACE(main.subscription_id, '[', ''), ']', ''))"), '<>', 0);
                    });
            })
            ->where(function ($query) {
                $query->where('send_now', 1)
                    ->orWhere('is_scheduled_notification_sent', 1);
            })
            ->where(function ($query) use ($deviceID) {
                $query->where(function ($query) {
                    $query->where('main.audience', '<>', self::AUDIENCE_SPECIFIC_AREA_USERS)
                        ->orWhere('main.location_type', '<>', self::LOCATION_TYPE_GEOFENCE);
                })
                ->orWhere(DB::raw("FIND_IN_SET($deviceID, main.sent_device_ids)"), '<>', 0);
            });

        if ($memberID) {
            $result->where(function ($query) use ($memberID) {
                $query->whereNull('main.user_id')
                    ->orWhere(DB::raw("FIND_IN_SET($memberID, REPLACE(REPLACE(main.user_id, '[', ''), ']', ''))"), '<>', 0);
            });
        }
        return $result->get();
    }

    public static function deleteNoti($id)
    {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function subscriberStatusList($deviceUuid)
    {
        return $subsList = DB::table('tp_func_inbox_subscriber as main')
            ->select('main.subscription_id', 'main.is_subscribed')
            ->leftjoin('tp_registered_devices as devices', 'devices.id', '=', 'main.device_id')
            ->where('devices.device_uuid', $deviceUuid)
            ->get();
    }

    public static function getSubscriberStatus($deviceId, $subscriptionId)
    {
        return $subsList = DB::table('tp_func_inbox_subscriber as main')
            ->select('main.id')
            ->where('main.device_id', $deviceId)
            ->where('main.subscription_id', $subscriptionId)
            ->get();
    }

    public static function saveSubscriberStatus($pushData)
    {
        DB::table('tp_func_inbox_subscriber')->insert($pushData);
    }

    public static function updateSubscriberStatus($pushData, $id)
    {
        return DB::table('tp_func_inbox_subscriber')->where('id', $id)->update($pushData);
    }

    public static function getActiveGeofenceNotifications(int $appID)
    {
        return self::where('app_id', $appID)
            ->where('audience', self::AUDIENCE_SPECIFIC_AREA_USERS)
            ->where('location_type', self::LOCATION_TYPE_GEOFENCE)
            ->where('active', '>=', date('Y-m-d H:i:s'))
            ->get();
    }

    public static function updateSentDeviceIDsForGeofence(int $deviceId, int $id)
    {
        $row = self::select('sent_device_ids')
            ->where('id', $id)
            ->first();

        if (!$row) {
            throw new Exception("This notification id doesn't exist");
        }

        if ($row->sent_device_ids) {
            $sentDeviceIDs = explode(',', $row->sent_device_ids);
            $sentDeviceIDs[] = $deviceId;
            $sentDeviceIDs = implode(',', $sentDeviceIDs);
        } else {
            $sentDeviceIDs = $deviceId;
        }

        self::updateById(['sent_device_ids' => $sentDeviceIDs], $id);
    }

    public static function updateById(array $data, int $id)
    {
        self::where('id', $id)->update($data);
    }

    public static function isGeofenceNotificationAlreadySent(int $deviceId, int $id): bool
    {
        $row = self::select('sent_device_ids')
            ->where('id', $id)
            ->whereRaw('FIND_IN_SET(?, sent_device_ids)', [$deviceId])
            ->first();

        return $row && $row->sent_device_ids ? true : false;
    }

    public static function getRemainingScheduledNotifications()
    {
        return DB::table(self::TABLE . ' as main')
            ->select('main.*', 'tz.offset as timezoneOffset')
            ->join(EventsTimeZone::TABLE . ' as tz', 'main.timezone_id', '=', 'tz.id')
            ->where('main.send_now', 0)
            ->where('main.is_scheduled_notification_sent', 0)
            ->get();
    }
}
