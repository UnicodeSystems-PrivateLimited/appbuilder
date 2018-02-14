<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Helpers\Helper;
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

/**
 * Description of SocialUser
 *
 * @author unicode
 */
class SocialUser extends Model {

    protected $table = 'social_media_user';
    protected $guarded = ['id'];

    const TABLE = 'social_media_user';
    const USER_TYPE_FACEBOOK = 1;
    const USER_TYPE_TWITTER = 2;
    const USER_TYPE_USER_PROFILE = 3;

    public static function saveUserAndGetId(array $data, $device_uuid) {
        $user = self::where('social_media_id', $data['social_media_id'])->where('social_media_type', $data['social_media_type'])->first();
        if ($user) {
            SocialUser::where('social_media_id', $data['social_media_id'])->where('social_media_type', $data['social_media_type'])->update($data);
            self::saveSocialUserDeviceAssoc($data['app_id'], $device_uuid, $user->id, $data['social_media_type']);
            return $user->id;
        } else {
            $newUserId = SocialUser::create($data)->id;
            self::saveSocialUserDeviceAssoc($data['app_id'], $device_uuid, $newUserId, $data['social_media_type']);
            return $newUserId;
        }
    }

    public static function getAllComments(int $userId, int $appId) {
        $contentOneComments = DB::table(Content1Comments::TABLE . ' as main')
                ->select('main.id', 'user.name', 'user.picture', 'main.description as comment', 'main.created_at')
                ->join(self::TABLE . ' as user', 'main.user_id', '=', 'user.id')
                ->join(Content1::TABLE . ' as con1', 'main.content_id', '=', 'con1.id')
                ->join(TpAppsTabEntity::TABLE . ' as tab', 'con1.tab_id', '=', 'tab.id')
                ->where('tab.app_id', $appId)
                ->where('main.user_id', $userId)
                ->where('main.user_type', '<>', self::USER_TYPE_USER_PROFILE);

        $contentTwoComments = DB::table(Content2Comments::TABLE . ' as main')
                ->select('main.id', 'user.name', 'user.picture', 'main.description as comment', 'main.created_at')
                ->join(self::TABLE . ' as user', 'main.user_id', '=', 'user.id')
                ->join(ContentTabTwo::TABLE . ' as con2', 'main.content_id', '=', 'con2.id')
                ->join(TpAppsTabEntity::TABLE . ' as tab', 'con2.tab_id', '=', 'tab.id')
                ->where('tab.app_id', $appId)
                ->where('main.user_id', $userId)
                ->where('main.user_type', '<>', self::USER_TYPE_USER_PROFILE);

        $contentThreeComments = DB::table(Content3Comments::TABLE . ' as main')
                ->select('main.id', 'user.name', 'user.picture', 'main.description as comment', 'main.created_at')
                ->join(self::TABLE . ' as user', 'main.user_id', '=', 'user.id')
                ->join(ContentTabThreeItem::TABLE . ' as con3item', 'main.content_id', '=', 'con3item.id')
                ->join(ContentTabThree::TABLE . ' as con3', 'con3item.category_id', '=', 'con3.id')
                ->join(TpAppsTabEntity::TABLE . ' as tab', 'con3.tab_id', '=', 'tab.id')
                ->where('tab.app_id', $appId)
                ->where('main.user_id', $userId)
                ->where('main.user_type', '<>', self::USER_TYPE_USER_PROFILE);

        $contactUsComments = DB::table(ContactUsComments::TABLE . ' as main')
                ->select('main.id', 'user.name', 'user.picture', 'main.comment', 'main.created_at')
                ->join(self::TABLE . ' as user', 'main.user_id', '=', 'user.id')
                ->join(ContactUs::TABLE . ' as contact', 'main.contact_id', '=', 'contact.id')
                ->join(TpAppsTabEntity::TABLE . ' as tab', 'contact.tab_id', '=', 'tab.id')
                ->where('tab.app_id', $appId)
                ->where('main.user_id', $userId)
                ->where('main.user_type', '<>', self::USER_TYPE_USER_PROFILE);

        $aroundUsComments = DB::table(AroundUsComments::TABLE . ' as main')
                ->select('main.id', 'user.name', 'user.picture', 'main.description as comment', 'main.created_at')
                ->join(self::TABLE . ' as user', 'main.user_id', '=', 'user.id')
                ->join(AroundUsItem::TABLE . ' as arounditem', 'main.item_id', '=', 'arounditem.id')
                ->join(AroundUs::TABLE . ' as around', 'arounditem.around_us_id', '=', 'around.id')
                ->join(TpAppsTabEntity::TABLE . ' as tab', 'around.tab_id', '=', 'tab.id')
                ->where('tab.app_id', $appId)
                ->where('main.user_id', $userId)
                ->where('main.user_type', '<>', self::USER_TYPE_USER_PROFILE);

        $musicTabComments = DB::table(MusicComments::TABLE . ' as main')
                ->select('main.id', 'user.name', 'user.picture', 'main.description as comment', 'main.created_at')
                ->join(self::TABLE . ' as user', 'main.user_id', '=', 'user.id')
                ->join(Music::TABLE . ' as music', 'main.content_id', '=', 'music.id')
                ->join(TpAppsTabEntity::TABLE . ' as tab', 'music.tab_id', '=', 'tab.id')
                ->where('tab.app_id', $appId)
                ->where('main.user_id', $userId)
                ->where('main.user_type', '<>', self::USER_TYPE_USER_PROFILE);

        $eventsComments = DB::table(EventsTabComments::TABLE . ' as main')
                ->select('main.id', 'user.name', 'user.picture', 'main.comment', 'main.created_at')
                ->join(self::TABLE . ' as user', 'main.user_id', '=', 'user.id')
                ->join(EventsTab::TABLE . ' as event', 'main.event_id', '=', 'event.id')
                ->join(TpAppsTabEntity::TABLE . ' as tab', 'event.tab_id', '=', 'tab.id')
                ->where('tab.app_id', $appId)
                ->where('main.user_id', $userId)
                ->where('main.user_type', '<>', self::USER_TYPE_USER_PROFILE)
                ->union($contentOneComments)
                ->union($contentTwoComments)
                ->union($contentThreeComments)
                ->union($contactUsComments)
                ->union($aroundUsComments)
                ->union($musicTabComments)
                ->orderby('created_at', 'DESC')
                ->get();

        return $eventsComments;
    }

    public static function userList(int $appId) {
        return $result = DB::SELECT(DB::raw("SELECT * FROM  social_media_user as user LEFT JOIN (SELECT user_id, sum(comment) as comment from
       (SELECT user_id, count(*) as comment FROM tp_func_contact_us_comment WHERE user_type != " . self::USER_TYPE_USER_PROFILE . " GROUP BY user_id
        UNION  SELECT user_id, count(*) as comment FROM tp_func_content_tab_1_comment WHERE user_type != " . self::USER_TYPE_USER_PROFILE . " GROUP BY user_id
        UNION SELECT user_id, count(*) as comment FROM tp_func_content_tab_2_comment WHERE user_type != " . self::USER_TYPE_USER_PROFILE . " GROUP BY user_id
        UNION  SELECT user_id, count(*) as comment FROM tp_func_content_tab_3_comment WHERE user_type != " . self::USER_TYPE_USER_PROFILE . " GROUP BY user_id
        UNION  SELECT user_id, count(*) as comment FROM tp_func_around_us_item_comment WHERE user_type != " . self::USER_TYPE_USER_PROFILE . " GROUP BY user_id
        UNION  SELECT user_id, count(*) as comment FROM tp_func_events_comment WHERE user_type != " . self::USER_TYPE_USER_PROFILE . " GROUP BY user_id) as tbl group by user_id) cmt on cmt.user_id = user.id 
        LEFT JOIN (SELECT user_id, count(*) as fanwall FROM tp_func_fan_wall_tab WHERE user_type != " . self::USER_TYPE_USER_PROFILE . " GROUP BY user_id) tble on tble.user_id=user.id where user.app_id = $appId"));
    }

    public static function deleteUser($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function incrementShareCount(int $appId, int $socialMediaId, int $socialMediaType) {
        SocialUser::where('social_media_id', $socialMediaId)
                ->where('social_media_type', $socialMediaType)
                ->where('app_id', $appId)
                ->increment('share_count');
    }

    public static function getShareCount(int $appId, int $socialMediaId, int $socialMediaType) {
        $result = SocialUser::select('share_count')
                ->where('social_media_id', $socialMediaId)
                ->where('social_media_type', $socialMediaType)
                ->where('app_id', $appId)
                ->first();
        return $result ? $result->share_count : NULL;
    }

    public static function saveSocialUserDeviceAssoc($app_id, $device_uuid, $social_user_id, $social_media_type) {
        $social_user_device_info = DB::table(SocialUserDeviceAssoc::TABLE)
                ->where('app_id', $app_id)
                ->where('social_media_type', $social_media_type)
                ->where('device_uuid', $device_uuid)
                ->first();
        if (!$social_user_device_info) {
            $data['app_id'] = $app_id;
            $data['social_user_id'] = $social_user_id;
            $data['device_uuid'] = $device_uuid;
            $data['social_media_type'] = $social_media_type;
            SocialUserDeviceAssoc::create($data);
        } else {
            $data['social_user_id'] = $social_user_id;
            SocialUserDeviceAssoc::where('app_id', $app_id)->where('social_media_type', $social_media_type)->where('device_uuid', $device_uuid)->update($data);
        }
    }

}
