<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class MembershipUserTemp extends Model {

    protected $table = 'tp_func_membership_temp_user';
    protected $guarded = ['id'];
    const TABLE = 'tp_func_membership_temp_user';    
    
    /**
     * get specific user info
     */
    public static function getItemData($id) {
        return self::select(DB::raw("`id`,`tab_id`,`email`,`group_id`,`created_at`"))
            ->where('id', $id)
            ->first();
    }
    
    
    
    /**
     * get  user  details for email
     */
    public static function getUserByEmail($email){
       return self::select(DB::raw("`id`,`tab_id`,`email`,`group_id`,`created_at`"))
            ->where('email', $email)
            ->first(); 
    }
    
    /**
     * delete user
     */
    
    public static function deleteUser($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }
    
}