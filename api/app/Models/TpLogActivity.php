<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Http\Controllers\Apps\AppController;
use DB;

class TpLogActivity extends Model {

    protected $table = 'tp_log_activity';
    protected $guarded = ["id"];

    const TABLE = 'tp_log_activity';

    public static function getMainDashboardActivities($perPage = 10) {
        $query = self::select('id', 'app_id', 'activity', 'activity_type', 'created_at')
                ->where('main_dashboard', 1)
                ->where('activity_type', '!=', 1)
                ->orderby('created_at', 'DESC');
        return $query->paginate($perPage);
    }

    public static function getAppActivities($appId, $perPage = 10) {
        $query = self::select('id', 'app_id', 'activity', 'activity_type', 'created_at')
                ->where('app_dashboard', 1)
                ->where('app_id', $appId)
                ->orderby('created_at', 'DESC');
        return $query->paginate($perPage);
    }

}
