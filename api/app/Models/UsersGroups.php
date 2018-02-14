<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class UsersGroups extends Model {

    protected $table = 'users_groups';
    protected $guarded = ["id"];
    const TABLE = 'users_groups';
    
    const ADMIN_GROUP_ID = 7;

}
