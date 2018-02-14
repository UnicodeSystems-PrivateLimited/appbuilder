<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class Groups extends Model {

    protected $table = 'groups';
    protected $guarded = ["id"];

    const TABLE = 'groups';

    public static function getGroupByName(string $name) {
        return DB::table(self::TABLE )
                        ->where('name', $name)
                        ->first();
    }

}
