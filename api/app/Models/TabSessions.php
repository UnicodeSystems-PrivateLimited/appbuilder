<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\TpAppsTabEntity;
use DB;

class TabSessions extends Model {

    const APP_TYPE_LIVE = 1;
    const APP_TYPE_PREVIEW = 2;

    const PLATFORM_ANDROID = 1;
    const PLATFORM_IOS = 2;
    const PLATFORM_HTML5 = 3;

    const PLATFORM_LABEL = [
        self::PLATFORM_ANDROID => 'android',
        self::PLATFORM_IOS => 'ios',
        self::PLATFORM_HTML5 => 'html5',
    ];

    const TABLE = 'tp_tab_sessions';

    protected $table = 'tp_tab_sessions';
    protected $guarded = ['id'];

    public static function getTabSeeionsForUserActivity(int $appId) {
        $result = DB::table(self::TABLE . ' as main')
                ->select('main.tab_id', 'main.device_uuid', 'tab.title')
                ->join(TpAppsTabEntity::TABLE . ' as tab', 'main.tab_id', '=', 'tab.id')
                ->where('main.app_id', $appId)
                ->where('device_uuid', '<>', NULL)
                ->get();
        $sessions = [];
        foreach ($result as $key => $device) {
            if (isset($sessions[$device->device_uuid]) && isset($sessions[$device->device_uuid][$device->title])) {
                $sessions[$device->device_uuid][$device->title] = $sessions[$device->device_uuid][$device->title] + 1;
            } else {
                $sessions[$device->device_uuid][$device->title] = 1;
            }
        }
        return $sessions;
    }

    public static function getTabSessionsByDateRange(int $appID, int $appType, string $startDate, string $endDate) {
        return DB::table(self::TABLE . ' as main')
            ->select('tab.title as tab_name', DB::raw('COUNT(*) AS total_sessions'), self::getSessionSelectStatement(self::PLATFORM_ANDROID), self::getSessionSelectStatement(self::PLATFORM_IOS), self::getSessionSelectStatement(self::PLATFORM_HTML5))
            ->join(TpAppsTabEntity::TABLE . ' as tab', 'main.tab_id', '=', 'tab.id')
            ->where('main.app_id', $appID)
            ->where('app_type', $appType)
            ->whereBetween(DB::raw('DATE(main.created_at)'), [$startDate, $endDate])
            ->orderBy('total_sessions', 'DESC')
            ->groupBy('main.tab_id')
            ->get();
    }

    private static function getSessionSelectStatement(int $platform) {
        return DB::raw('SUM(IF(main.platform = ' . $platform . ', 1, 0)) as ' . self::PLATFORM_LABEL[$platform] . '_sessions');
    }

}
