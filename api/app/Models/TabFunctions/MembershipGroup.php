<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class MembershipGroup extends Model {

    protected $table = 'tp_func_membership_groups';
    protected $guarded = ['id'];   
    const TABLE = 'tp_func_membership_groups';

    
    /**
     * get specific user info
     */
    public static function getItemData($id) {
        return self::select(DB::raw("`id`,`tab_id`,`group_name`,`group_color`,`tabs_access`,`created_at`"))
            ->where('id', $id)
            ->first();
    }
    
    
    /**
     * get group list
     */
    public static function getGroupList($id) {
        return DB::table('tp_func_membership_groups as main')
            ->select('main.id','main.tab_id','main.group_name','main.group_color','main.tabs_access',DB::raw('COUNT(child.id) as user_count'))
            ->leftJoin('tp_func_membership_user as child', function ($join) {
                $join->on('main.id', '=', 'child.group_id');
            })
            ->where('main.tab_id', $id)
            ->groupBy('main.id')
            ->orderBy('main.id', 'DESC')
            ->get();
    } 
    
     /**
     * delete group
     */
    
    public static function deleteGroup($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }
        
}