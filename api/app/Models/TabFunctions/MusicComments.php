<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Models\TabFunctions\SocialUser;

class MusicComments extends Model {

    protected $table = 'tp_func_music_comment';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_music_comment';

    /**
     * get comments for music tab
     */
    public static function getComments(int $content_id) {
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
            ->where('main.content_id', $content_id)
            ->orderby('main.created_at', 'DESC')
            ->get();
    }

    public static function getComment(int $id) {
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
            ->get();
    }

    private static function getImageSelectString(string $url, string $colName): string {
        return "IF($colName != '', (CONCAT('$url','/',$colName)) , NULL)";
    }

}
