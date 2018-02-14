<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Models\TabFunctions\SocialUser;

class LoyaltyStampActivity extends Model {

    protected $table = 'tp_func_loyalty_stamp_activity';
    protected $guarded = ['id'];
    const TABLE = 'tp_func_loyalty_stamp_activity';


    public static function deleteActivity($itemId, $deviceId) {
        return self::where('item_id', $itemId)->where('device_id', $deviceId)->delete();
    }

     public static function getStampCount(int $item_id, int $deviceId) {
        return self::select('id')
            ->where('device_id', $deviceId)->where('item_id', $item_id)->get()->count();
    }
}