<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Display\UserImages;
use App\Models\Display\LibraryImages;
use App\Http\Controllers\Apps\CreateController;
use App\Helpers\Helper;
use App\Models\TpAppsEntity;
use App\Models\AppPublishHistory;
use DB;

class TpAppPublish extends Model {

    protected $table = 'tp_app_publish';
    protected $guarded = ["id"];

    const TABLE = 'tp_app_publish';

    public static function getAllIpaTabletRequest($type, $filters = [], $perPage = 10) {
        $requestType = $type == 1 ? 0 : 1;
        $query = DB::table(TpAppPublish::TABLE . ' as main')
                ->select('main.id', 'main.app_id', 'main.email', 'main.tab_product', 'main.iphone_product', 'main.instruction', 'app.apple_user_name', 'app.apple_password', 'app.apple_dev_name', 'main.update_type', 'main.ipa_request_status', 'main.created_at', 'app.app_name', 'app.app_code')
                ->join(TpAppsEntity::TABLE . ' as app', 'app.id', '=', 'main.app_id')
                ->Where(function($query) {
                    $query->orWhere('tab_product', 1);
                    $query->orWhere('iphone_product', 1);
                })
                ->Where('ipa_request_status', $requestType)
                ->groupBy('main.app_id');
        if ($filters['updateTypes'] == 'All') {
            if (!empty($filters['title'])) {
                $query->Where(function($query) use ($filters) {
                    $query->orWhere('app.app_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    $query->orWhere('app.app_code', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    $query->orWhere('main.email', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                });
            }
        } else if ($filters['updateTypes'] == 'Itunes Update') {
            $query->where('update_type', 1);
            if (!empty($filters['title'])) {
                $query->Where(function($query) use ($filters) {
                    $query->orWhere('app.app_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    $query->orWhere('app.app_code', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    $query->orWhere('main.email', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                });
            }
        } else if ($filters['updateTypes'] == 'Expedited Update') {
            $query->where('update_type', 2);
            if (!empty($filters['title'])) {
                $query->Where(function($query) use ($filters) {
                    $query->orWhere('app.app_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    $query->orWhere('app.app_code', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    $query->orWhere('main.email', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                });
            }
        } else if ($filters['updateTypes'] == 'Standard App upload') {
            $query->where('update_type', 3);
            if (!empty($filters['title'])) {
                $query->Where(function($query) use ($filters) {
                    $query->orWhere('app.app_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    $query->orWhere('app.app_code', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    $query->orWhere('main.email', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                });
            }
        } else if ($filters['updateTypes'] == 'Expedited upload') {
            $query->where('update_type', 4);
            if (!empty($filters['title'])) {
                $query->Where(function($query) use ($filters) {
                    $query->orWhere('app.app_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    $query->orWhere('app.app_code', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    $query->orWhere('main.email', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                });
            }
        } else if ($filters['updateTypes'] == 'Tappit app review') {
            $query->where('update_type', 5);
            if (!empty($filters['title'])) {
                $query->Where(function($query) use ($filters) {
                    $query->orWhere('app.app_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    $query->orWhere('app.app_code', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    $query->orWhere('main.email', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                });
            }
        } else if ($filters['updateTypes'] == 'App Build Service') {
            $query->where('update_type', 6);
            if (!empty($filters['title'])) {
                $query->Where(function($query) use ($filters) {
                    $query->orWhere('app.app_name', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    $query->orWhere('app.app_code', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                    $query->orWhere('main.email', 'LIKE', '%' . str_replace('%', '\%', $filters['title']) . '%');
                });
            }
        }
        return $query->orderBy(DB::raw('IF (update_type=2 OR update_type=4,1,0)'), 'DESC')->paginate($perPage);
    }

    public static function getIpaRequestByAppId($appId) {
        return $result = DB::table(TpAppPublish::TABLE . ' as main')
                ->select('main.id', 'main.app_id', 'main.email', 'main.tab_product', 'main.iphone_product', 'main.instruction', 'app.apple_user_name', 'app.apple_password', 'app.apple_dev_name', 'main.update_type', 'main.ipa_request_status', 'main.created_at', 'main.ios_app_version', 'app.app_name', 'app.app_code')
                ->join(TpAppsEntity::TABLE . ' as app', 'app.id', '=', 'main.app_id')
                ->where('main.app_id', $appId)
                ->get();
    }

    public static function getAppPublishHistory($appId) {
        $app_publish_history = DB::table(AppPublishHistory::TABLE)
                ->select('id', 'app_id', 'email', 'android_product', 'tab_product', 'iphone_product', 'instruction', 'update_type', 'android_app_version', 'ios_app_version', 'ipa_request_status', 'created_at')
                ->Where(function($app_publish_history) {
                    $app_publish_history->orWhere('tab_product', 1);
                    $app_publish_history->orWhere('iphone_product', 1);
                })
                ->where('app_id', $appId);
        return $result = DB::table(TpAppPublish::TABLE)
                ->select('id', 'app_id', 'email', 'android_product', 'tab_product', 'iphone_product', 'instruction', 'update_type', 'android_app_version', 'ios_app_version', 'ipa_request_status', 'created_at')
                ->Where(function($result) {
                    $result->orWhere('tab_product', 1);
                    $result->orWhere('iphone_product', 1);
                })
                ->where('app_id', $appId)
                ->union($app_publish_history)
                ->get();
    }

}
