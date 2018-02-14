<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class AppPublishLog extends Model {

    protected $table = 'tp_app_publish_log';
    protected $guarded = ['id'];

    public static function getAppPublishLog(int $appId) {
        return self::select('app_id', 'status', 'app_publish_version', 'created_at')
                        ->where('app_id', $appId)
                        ->get();
    }

}
