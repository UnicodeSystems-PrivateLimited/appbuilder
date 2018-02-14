<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Models\UsersGroups;
use App\Models\TappitProfile;
use App\Helpers\Helper;

class Users extends Model {

    protected $table = 'users';
    protected $guarded = ["id"];

    const TABLE = 'users';
    const TABLE_GROUP = 'groups';
    const TABLE_USER_GROUP = 'users_groups';
    const CUSTOMER_GROUP = 'customer';
    const DEVELOPER_GROUP = 'developer';

    public static function user_group($uid) {
        return DB::table(self::TABLE . ' as item')
                        ->select(DB::raw("`item`.`id`,`item`.`email`, `item`.`permissions`,`groups`.`name` as `userType`"))
                        ->leftjoin(self::TABLE_USER_GROUP, 'users_groups.user_id', '=', 'item.id')
                        ->leftjoin(self::TABLE_GROUP, 'groups.id', '=', 'users_groups.group_id')
                        ->where('item.id', $uid)
                        ->get();
    }

    public static function isCustomer($uId) {
        $data = DB::table(self::TABLE . ' as u')
                ->select(DB::raw("`u`.`id`"))
                ->leftjoin(self::TABLE_USER_GROUP . ' as ug', 'ug.user_id', '=', 'u.id')
                ->leftjoin(self::TABLE_GROUP . ' as g', 'g.id', '=', 'ug.group_id')
                ->where('u.id', $uId)
                ->where('g.name', self::CUSTOMER_GROUP)
                ->first();
        if (is_object($data)) {
            return true;
        } else {
            return false;
        }
    }

    public static function isDeveloper($uId) {
        $data = DB::table(self::TABLE . ' as u')
                ->select(DB::raw("`u`.`id`"))
                ->leftjoin(self::TABLE_USER_GROUP . ' as ug', 'ug.user_id', '=', 'u.id')
                ->leftjoin(self::TABLE_GROUP . ' as g', 'g.id', '=', 'ug.group_id')
                ->where('u.id', $uId)
                ->where('g.name', self::DEVELOPER_GROUP)
                ->first();
        if (is_object($data)) {
            return true;
        } else {
            return false;
        }
    }

    public static function isCustomerByEmail($uEmail) {
        $data = DB::table(self::TABLE . ' as u')
                ->select(DB::raw("`u`.`id`"))
                ->leftjoin(self::TABLE_USER_GROUP . ' as ug', 'ug.user_id', '=', 'u.id')
                ->leftjoin(self::TABLE_GROUP . ' as g', 'g.id', '=', 'ug.group_id')
                ->where('u.email', $uEmail)
                ->where('g.name', self::CUSTOMER_GROUP)
                ->first();
        if (is_object($data)) {
            return true;
        } else {
            return false;
        }
    }

    public static function isDeveloperByEmail($uEmail) {
        $data = DB::table(self::TABLE . ' as u')
                ->select(DB::raw("`u`.`id`"))
                ->leftjoin(self::TABLE_USER_GROUP . ' as ug', 'ug.user_id', '=', 'u.id')
                ->leftjoin(self::TABLE_GROUP . ' as g', 'g.id', '=', 'ug.group_id')
                ->where('u.email', $uEmail)
                ->where('g.name', self::DEVELOPER_GROUP)
                ->first();
        if (is_object($data)) {
            return true;
        } else {
            return false;
        }
    }

    public static function getAdminUsers(array $filters) {
        $avatarURL = Helper::getUploadDirectoryURL('app/user/image');
        $query = DB::table(self::TABLE . ' as main')
                ->select('main.id', 'main.email', 'tp.first_name', 'tp.last_name', 'main.activated', 'main.last_login', DB::raw(self::getAvatarSelectString($avatarURL)))
                ->join(UsersGroups::TABLE . ' as ug', 'ug.user_id', '=', 'main.id')
                ->join(TappitProfile::TABLE . ' as tp', 'tp.user_id', '=', 'main.id')
                ->where('ug.group_id', UsersGroups::ADMIN_GROUP_ID);

        if (isset($filters['activated']) && $filters['activated'] !== '') {
            $query->where('main.activated', $filters['activated']);
        }
        if (!empty($filters['user'])) {
            $query->where(function ($query) use ($filters) {
                $query->where(DB::raw('CONCAT(tp.first_name," ",tp.last_name)'), 'like', '%' . $filters['user'] . '%')
                        ->orWhere('main.email', 'like', '%' . $filters['user'] . '%');
            });
        }

        if (!empty($filters['sortType']) && !empty($filters['sortFor'])) {
            if ($filters['sortFor'] === 'name') {
                $query->orderBy(DB::raw('CONCAT(tp.first_name," ",tp.last_name)'), $filters['sortType']);
            } else {
                $query->orderBy(DB::raw('main.' . $filters['sortFor']), $filters['sortType']);
            }
        }

        $query->orderBy('main.id', 'DESC');
        return $query->paginate($filters['perPage'] ?? 10);
    }

    private static function getAvatarSelectString($url) {
        return "IF(`tp`.`avatar` = '' OR (`tp`.`avatar` IS NULL), NULL, (CONCAT('$url','/',`tp`.`avatar`))) as `avatar`";
    }

    public static function getUserDetail(int $id) {
        return DB::table(self::TABLE . ' as main')
                        ->select('main.id', 'main.email', 'tp.first_name', 'tp.last_name', 'main.activated')
                        ->join(UsersGroups::TABLE . ' as ug', 'ug.user_id', '=', 'main.id')
                        ->join(TappitProfile::TABLE . ' as tp', 'tp.user_id', '=', 'main.id')
                        ->where('main.id', $id)
                        ->first();
    }

}
