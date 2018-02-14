<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class EmailMarketingValue extends Model {

    protected $table = 'tp_promote_email_marketing_value';
    protected $guarded = ['id'];

    const TABLE = 'tp_promote_email_marketing_value';

    public static function getUserEmailList($appId) {
        return self::select('id', 'app_id', 'email_id', 'created_at')
                        ->where('app_id', $appId)
                        ->get();
    }

    public static function deleteUserEmail($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function getNewUserEmailCount(int $appId, $download_date) {
      
        if ($download_date != null) {
            $result = DB::SELECT(DB::raw("SELECT COUNT(*) COUNT FROM tp_promote_email_marketing_value WHERE DATE(`created_at`) > '$download_date' AND `app_id` = $appId"));
            return $result[0]->COUNT;
        } else {
            $result = DB::SELECT(DB::raw("SELECT COUNT(*) COUNT FROM tp_promote_email_marketing_value WHERE `app_id` = $appId"));
            return $result[0]->COUNT;
        }
    }

}
