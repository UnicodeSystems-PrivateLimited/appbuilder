<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Models\TpAppsTabEntity;

class MembershipUser extends Model
{

    protected $table = 'tp_func_membership_user';
    protected $guarded = ['id'];
    const TABLE = 'tp_func_membership_user';

    /**
     * get specific user info
     */
    public static function getItemData($id)
    {
        return self::select(DB::raw("`id`,`tab_id`,`user_name`,`email`, `password`,`group_id`,`tabs_access`,`created_at`"))
            ->where('id', $id)
            ->first();
    }

    /**
     * get user list
     */
    public static function getUserList($tab_id)
    {
        return DB::table(self::TABLE . ' as item')
            ->select(DB::raw("`item`.`id`, `item`.`user_name`,`tp_func_membership_groups`.`group_name`,`tp_func_membership_groups`.`group_color`"))
            ->leftjoin('tp_func_membership_groups', 'tp_func_membership_groups.id', '=', 'item.group_id')
            ->where('item.tab_id', $tab_id)
            ->where('item.login_type', 3)
            ->orderBy('item.user_name', 'ASC')
            ->get();
    }

    /**
     * get single user login details for tab_id
     */
    public static function getSingleUser($tab_id, $login_type)
    {
        return self::select(DB::raw("`id`,`tab_id`,`user_name`, `password`,`tabs_access`,`email`,`group_id`,`tabs_access`,`created_at`"))
            ->where('tab_id', $tab_id)
            ->where('login_type', $login_type)
            ->first();
    }

    /**
     * get  user  details for email
     */
    public static function getUserByEmail($email)
    {
        return self::select(DB::raw("`id`,`tab_id`,`email`,`group_id`,`created_at`"))
            ->where('email', $email)
            ->first();
    }

    /**
     * delete user
     */

    public static function deleteUser($id)
    {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function updateUserByGroup($groupId)
    {
        if (!is_array($groupId)) {
            $groupId = [$groupId];
        }

        $data['group_id'] = 0;
        return self::whereIn('group_id', $groupId)->update($data);
    }

    public static function loginCheck($userName, $password, $appId, $loginType)
    {
        return DB::table(self::TABLE . ' as user')
            ->select(DB::raw("`user`.`id`, `user`.`tab_id`, `user`.`user_name`, `user`.`email`, `user`.`group_id`, `user`.`tabs_access`, `group`.`tabs_access` as group_tabs_access"))
            ->leftjoin('tp_func_membership_groups as group', 'group.id', '=', 'user.group_id')
            ->leftjoin('tp_apps_tabs_entity as tabs', 'tabs.id', '=', 'user.tab_id')
            ->where('user.user_name', $userName)
            ->where('user.password', $password)
            ->where('user.login_type', $loginType)
            ->where('tabs.app_id', $appId)
            ->get();
    }

    public static function guestLoginCheck($appId, $loginType)
    {
        return DB::table(self::TABLE . ' as user')
            ->select(DB::raw("`user`.`id`, `user`.`tab_id`, `user`.`user_name`, `user`.`email`, `user`.`group_id`, `user`.`tabs_access`, `group`.`tabs_access` as group_tabs_access"))
            ->leftjoin('tp_func_membership_groups as group', 'group.id', '=', 'user.group_id')
            ->leftjoin('tp_apps_tabs_entity as tabs', 'tabs.id', '=', 'user.tab_id')
            ->where('user.login_type', $loginType)
            ->where('tabs.app_id', $appId)
            ->get();
    }

    public static function getID(string $userName): int
    {
        $result = self::select('id')
            ->where('user_name', $userName)
            ->first();

        return $result ? $result->id : 0;
    }

    public static function getIDByUsernameAndAppID(string $username, int $appID): int {
        $result = DB::table(self::TABLE . ' as main')
            ->select('main.id')
            ->join(TpAppsTabEntity::TABLE . ' as tab', 'main.tab_id', '=',  'tab.id')
            ->where('main.user_name', $username)
            ->where('tab.app_id', $appID)
            ->first();
        return $result ? $result->id : 0;
    }

}