<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class NewsLetterUsers extends Model {

    protected $table = 'newsletter_users';
    protected $guarded = ['id'];

    const TABLE = 'newsletter_users';

    public static function getUsers($cat_id) {
        $query = NewsLetterUsers::select(DB::raw("`id`,`name`,`email`,`birthday`,`zip`,`country`,`category_id`"));
        if (isset($cat_id) && $cat_id != "") {
            $query->where('category_id', $cat_id);
        }
        return $query->get();
    }

    public static function getUsersByTabId($tab_id) {
        $query = NewsLetterUsers::select(DB::raw("`id`,`name`,`email`"));
        $query->where('tab_id', $tab_id);
        return $query->get();
    }
    public static function getUsersByTabIds($tab_id) {
        $query = NewsLetterUsers::select(DB::raw("`id`,`name`,`email`"));
        $query->whereIn('tab_id', $tab_id);
        return $query->get();
    }

    public static function getUsersByTabIdForSubmittedData($tab_id, $filters = [], $perPage = 20) {
        $query = DB::table(self::TABLE)
                ->select('id', 'name', 'email', 'birthday', 'zip', 'country', 'category_id','comments')
                ->whereIn('tab_id', $tab_id);
        if (!empty($filters['title'])) {
            $query->where('name', 'LIKE', '%' . str_replace('%', '\\%', $filters['title']) . '%');
            $query->orwhere('birthday', 'LIKE', '%' . str_replace('%', '\\%', $filters['title']) . '%');
            $query->orwhere('zip', 'LIKE', '%' . str_replace('%', '\\%', $filters['title']) . '%');
            $query->orwhere('country', 'LIKE', '%' . str_replace('%', '\\%', $filters['title']) . '%');
        }
        return $query->orderBy('created_at', 'DESC')->paginate($perPage);
    }
    
     public static function deleteUser($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

}
