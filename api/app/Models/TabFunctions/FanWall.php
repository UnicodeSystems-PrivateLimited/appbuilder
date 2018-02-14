<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;
use App\Models\TabFunctions\SocialUser;
use App\Models\TpAppsTabEntity;

class FanWall extends Model {

    protected $table = 'tp_func_fan_wall_tab';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_fan_wall_tab';

    public static function getComments(int $tabId) {
        return DB::table(self::TABLE . ' as main')
            ->select('main.id', DB::raw('COALESCE(user.name, userProfile.name) as name'), 'main.description', 'main.created_at')
            ->leftJoin(SocialUser::TABLE . ' as user', function ($join) {
                $join->on('main.user_id', '=', 'user.id')
                ->where('main.user_type', '<>', SocialUser::USER_TYPE_USER_PROFILE);
            })
            ->leftJoin(\App\Models\UserProfileSettings::TABLE . ' as userProfile', function ($join) {
                $join->on('main.user_id', '=', 'userProfile.id')
                ->where('main.user_type', '=', SocialUser::USER_TYPE_USER_PROFILE);
            })
            ->where('main.tab_id', $tabId)
            ->orderBy(DB::raw('(main.sort_order=0)'), 'ASC')
            ->orderBy('main.sort_order', 'ASC')
            ->orderBy(DB::raw('COALESCE(user.name, userProfile.name)'), 'ASC')
            ->get();
    }

    public static function getCommentData(int $id) {
        $userProfilePictureURL = \App\Http\Controllers\CustomerPortal\CustomerSettingController::getImageUploadURL();
        return DB::table(self::TABLE . ' as main')
            ->select('main.id', DB::raw('COALESCE(user.name, userProfile.name) as name'), DB::raw('COALESCE(user.picture, ' . self::getImageSelectString($userProfilePictureURL, 'userProfile.picture') . ') as picture'), 'main.description', 'main.created_at')
            ->leftJoin(SocialUser::TABLE . ' as user', function ($join) {
                $join->on('main.user_id', '=', 'user.id')
                ->where('main.user_type', '<>', SocialUser::USER_TYPE_USER_PROFILE);
            })
            ->leftJoin(\App\Models\UserProfileSettings::TABLE . ' as userProfile', function ($join) {
                $join->on('main.user_id', '=', 'userProfile.id')
                ->where('main.user_type', '=', SocialUser::USER_TYPE_USER_PROFILE);
            })
            ->where('main.id', $id)
            ->first();
    }

    public static function deleteComment($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function updateMultiple(array $data, string $updateKey = 'id') {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                self::where($updateKey, $key)->update($value);
            }
        });
    }

    public static function getCommentsForApp(int $tabId) {
        $userProfilePictureURL = \App\Http\Controllers\CustomerPortal\CustomerSettingController::getImageUploadURL();
        return DB::table(self::TABLE . ' as main')
            ->select('main.id', DB::raw('COALESCE(user.name, userProfile.name) as name'), DB::raw('COALESCE(user.picture, ' . self::getImageSelectString($userProfilePictureURL, 'userProfile.picture') . ') as picture'), 'main.description', 'main.created_at', DB::raw('COUNT(child.id) as no_of_replies'))
            ->leftJoin(self::TABLE . ' as child', function ($join) {
                $join->on('main.id', '=', 'child.parent_id')
                ->where('main.id', '!=', '`child`.`id`');
            })
            ->leftJoin(SocialUser::TABLE . ' as user', function ($join) {
                $join->on('main.user_id', '=', 'user.id')
                ->where('main.user_type', '<>', SocialUser::USER_TYPE_USER_PROFILE);
            })
            ->leftJoin(\App\Models\UserProfileSettings::TABLE . ' as userProfile', function ($join) {
                $join->on('main.user_id', '=', 'userProfile.id')
                ->where('main.user_type', '=', SocialUser::USER_TYPE_USER_PROFILE);
            })
            ->where('main.tab_id', $tabId)
            ->where('main.parent_id', NULL)
            ->orderBy('main.created_at', 'DESC')
            ->orderBy(DB::raw('COALESCE(user.name, userProfile.name)'), 'ASC')
            ->groupBy('main.id')
            ->get();
    }

    public static function getReplies(int $itemId) {
        $userProfilePictureURL = \App\Http\Controllers\CustomerPortal\CustomerSettingController::getImageUploadURL();
        return DB::table(self::TABLE . ' as main')
            ->select('main.id', DB::raw('COALESCE(user.name, userProfile.name) as name'), DB::raw('COALESCE(user.picture, ' . self::getImageSelectString($userProfilePictureURL, 'userProfile.picture') . ') as picture'), 'main.description', 'main.created_at')
            ->leftJoin(SocialUser::TABLE . ' as user', function ($join) {
                $join->on('main.user_id', '=', 'user.id')
                ->where('main.user_type', '<>', SocialUser::USER_TYPE_USER_PROFILE);
            })
            ->leftJoin(\App\Models\UserProfileSettings::TABLE . ' as userProfile', function ($join) {
                $join->on('main.user_id', '=', 'userProfile.id')
                ->where('main.user_type', '=', SocialUser::USER_TYPE_USER_PROFILE);
            })
            ->where('main.parent_id', $itemId)
            ->orderBy('main.created_at', 'DESC')
            ->orderBy(DB::raw('COALESCE(user.name, userProfile.name)'), 'ASC')
            ->get();
    }
    
    public static function getUserPostCount(int $userId, int $appId): int {
        return DB::table(self::TABLE . ' as main')
            ->join(TpAppsTabEntity::TABLE . ' as tab', 'main.tab_id', '=', 'tab.id')
            ->where('tab.app_id', $appId)
            ->where('main.user_id', $userId)
            ->where('main.user_type', '<>', SocialUser::USER_TYPE_USER_PROFILE)
            ->count();
    }

    private static function getImageSelectString(string $url, string $colName): string {
        return "IF($colName != '', (CONCAT('$url','/',$colName)) , NULL)";
    }

}
