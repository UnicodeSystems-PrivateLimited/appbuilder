<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Models\TpAppsTabEntity;
use App\Models\TabFunctions\Content1;
use App\Models\TabFunctions\Content1Comments;
use App\Models\TabFunctions\ContentTabTwo;
use App\Models\TabFunctions\Content2Comments;
use App\Models\TabFunctions\ContentTabThree;
use App\Models\TabFunctions\ContentTabThreeItem;
use App\Models\TabFunctions\Content3Comments;
use App\Models\TabFunctions\ContactUs;
use App\Models\TabFunctions\ContactUsComments;
use App\Models\TabFunctions\EventsTab;
use App\Models\TabFunctions\EventsTabComments;
use App\Models\TabFunctions\AroundUs;
use App\Models\TabFunctions\AroundUsItem;
use App\Models\TabFunctions\AroundUsComments;
use App\Models\TabFunctions\SocialUserDeviceAssoc;
use App\Models\TabFunctions\MusicComments;
use App\Models\TabFunctions\Music;

class SocialUserDeviceAssoc extends Model {

    protected $table = 'social_user_device_assoc';
    protected $guarded = ['id'];

    const TABLE = 'social_user_device_assoc';
    const DEVICE_TABLE = 'tp_registered_devices';
    const SOCIAL_MEDIA_TABLE = 'social_media_user';
    const USER_TYPE_USER_PROFILE = 3;

    /**
     * get user List
     */
    public static function userList(int $appId) {
        $userProfilePictureURL = \App\Http\Controllers\CustomerPortal\CustomerSettingController::getImageUploadURL();
        $comment_count = DB::raw("(SELECT user_id, sum(comment) as comment from
       (SELECT user_id, count(*) as comment FROM tp_func_contact_us_comment as main JOIN tp_func_contact_us contact on main.contact_id = contact.id JOIN tp_apps_tabs_entity tab on contact.tab_id = tab.id WHERE  tab.app_id=$appId GROUP BY user_id
         UNION ALL SELECT user_id, count(*) as comment FROM tp_func_content_tab_1_comment as main JOIN tp_func_content_tab_1 con1 on main.content_id = con1.id JOIN tp_apps_tabs_entity tab on con1.tab_id = tab.id WHERE tab.app_id=$appId GROUP BY user_id 
         UNION ALL SELECT user_id, count(*) as comment FROM tp_func_content_tab_2_comment as main JOIN tp_func_content_tab_2 con2 on main.content_id = con2.id JOIN tp_apps_tabs_entity tab on con2.tab_id = tab.id WHERE  tab.app_id=$appId GROUP BY user_id
         UNION ALL SELECT user_id, count(*) as comment FROM tp_func_content_tab_3_comment as main JOIN tp_func_content_tab_3 con3 on main.content_id = con3.id JOIN tp_apps_tabs_entity tab on con3.tab_id = tab.id WHERE  tab.app_id=$appId GROUP BY user_id
         UNION ALL SELECT user_id, count(*) as comment FROM tp_func_around_us_item_comment as main JOIN tp_func_around_us_items arounditem on main.item_id = arounditem.id JOIN tp_func_around_us around on arounditem.around_us_id = around.id JOIN tp_apps_tabs_entity tab on around.tab_id = tab.id WHERE  tab.app_id=$appId GROUP BY user_id
         UNION ALL SELECT user_id, count(*) as comment FROM tp_func_music_comment as main JOIN tp_func_music music on main.content_id = music.id JOIN tp_apps_tabs_entity tab on music.tab_id = tab.id WHERE  tab.app_id=$appId GROUP BY user_id
         UNION ALL SELECT user_id, count(*) as comment FROM tp_func_events_comment as main JOIN tp_func_events_tab event on main.event_id = event.id JOIN tp_apps_tabs_entity tab on event.tab_id = tab.id WHERE  tab.app_id=$appId GROUP BY user_id
        ) as tbl group by user_id) cmt");
        $activity_count = DB::raw("(SELECT user_id, sum(activity) as activity from
       (SELECT user_id, count(*) as activity FROM tp_func_qr_code_activity as main JOIN tp_func_qr_code qr_code on main.item_id = qr_code.id JOIN tp_apps_tabs_entity tab on qr_code.tab_id = tab.id WHERE  (action='Redeemed this coupon' OR action='Unlocked this coupon') AND tab.app_id=$appId GROUP BY user_id
          UNION ALL SELECT user_id, count(*) as activity FROM tp_func_gps_code_activity as main JOIN tp_func_gps_code gps_code on main.item_id = gps_code.id JOIN tp_apps_tabs_entity tab on gps_code.tab_id = tab.id WHERE (action='Redeemed this coupon' OR action='Unlocked this coupon') AND tab.app_id=$appId GROUP BY user_id
          UNION ALL SELECT user_id, count(*) as activity FROM tp_func_loyalty_activity as main JOIN tp_func_loyalty_mst loyalty_mst on main.item_id = loyalty_mst.item_id JOIN tp_apps_tabs_entity tab on loyalty_mst.tab_id = tab.id WHERE  (action='Redeemed this loyalty' OR action='Unlocked this loyalty') AND tab.app_id=$appId AND loyalty_mst.is_advance=0 GROUP BY user_id    
          UNION ALL SELECT user_id, count(*) as activity FROM tp_func_loyalty_adv_activity as main JOIN tp_func_loyalty_mst loyalty_mst on main.item_id = loyalty_mst.item_id JOIN tp_apps_tabs_entity tab on loyalty_mst.tab_id = tab.id WHERE  main.action LIKE 'redeemed%' AND tab.app_id=$appId AND loyalty_mst.is_advance=1 GROUP BY user_id      
         ) as tbl group by user_id) acti");
        $fanWallCount = DB::raw("(SELECT user_id, count(*) as fanwall FROM tp_func_fan_wall_tab as main JOIN tp_apps_tabs_entity tab on main.tab_id = tab.id WHERE tab.app_id=$appId GROUP BY user_id) fntble");
        $pushNotiCount = DB::raw("(SELECT push_noti_count,device_uuid as duiid,platform FROM tp_registered_devices WHERE app_id=$appId) dviceble");
        $socialShareCount = DB::raw("(SELECT share_count,id as social_id,name,picture as social_profile_pic FROM social_media_user WHERE app_id=$appId) socialmediable");
        $userProfileSetting = DB::raw("(SELECT email,name as userProfilename," . self::getImageSelectString($userProfilePictureURL, 'picture') . ",app_id as apid,device_uuid as duuid FROM user_profile_settings WHERE app_id=$appId)cup");
        return $query = DB::table(self::TABLE . ' as user')
                ->select('id', 'social_user_id', 'device_uuid', 'app_id', 'social_media_type', 'created_at', 'comment', 'activity', 'fanwall', 'push_noti_count', 'platform', 'share_count', 'name', 'social_profile_pic', 'email', 'userProfilename', 'picture')
                ->leftJoin($comment_count, 'cmt.user_id', '=', 'user.social_user_id')
                ->leftJoin($activity_count, 'acti.user_id', '=', 'user.social_user_id')
                ->leftJoin($fanWallCount, 'fntble.user_id', '=', 'user.social_user_id')
                ->leftJoin($pushNotiCount, 'dviceble.duiid', '=', 'user.device_uuid')
                ->leftJoin($socialShareCount, 'socialmediable.social_id', '=', 'user.social_user_id')
                ->leftJoin($userProfileSetting, 'cup.duuid', '=', 'user.device_uuid')
                ->where('user.app_id', $appId)
                ->get();
    }

    public static function getDevicesUuids(int $appId) {
        return DB::SELECT(DB::raw("SELECT DISTINCT device_uuid FROM  social_user_device_assoc where app_id = $appId"));
    }

    public static function getAppUsers(int $appId) {
        return DB::table(self::TABLE . ' as main')
                        ->select('main.id', 'main.app_id', 'main.social_user_id', 'main.device_uuid', 'main.created_at', 'device.platform', 'su.name', 'su.picture')
                        ->join(self::DEVICE_TABLE . ' as device', function ($join) {
                            $join->on('main.device_uuid', '=', 'device.device_uuid')
                            ->on('main.app_id', '=', 'device.app_id');
                        })
                        ->join(self::SOCIAL_MEDIA_TABLE . ' as su', 'main.social_user_id', '=', 'su.id')
                        ->where('main.app_id', $appId)
                        ->get();
    }

    private static function getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$colName`";
    }

    public static function deleteUser($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('device_uuid', $id)->delete();
    }

}
