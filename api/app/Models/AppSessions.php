<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class AppSessions extends Model
{

    const APP_TYPE_LIVE = 1;
    const APP_TYPE_PREVIEW = 2;

    const PLATFORM_ANDROID = 1;
    const PLATFORM_IOS = 2;
    const PLATFORM_HTML5 = 3;

    protected $table = 'tp_app_sessions';
    protected $guarded = ['id'];

    public static function getAppSessionDetails(int $appID, int $deviceType, string $startDate, string $endDate, int $appType)
    {
        return self::select(DB::raw('COUNT(*) AS sessions'), DB::raw('AVG(session_time) AS avg_time'))
            ->where('app_id', $appID)
            ->where('app_type', $appType)
            ->where('platform', $deviceType)
            ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate])
            ->get();
    }

    public static function getAppSessionDatewise(int $appID, string $startDate, string $endDate, int $appType, bool $groupByMonth)
    {
        $query = self::select(DB::raw('COUNT(*) AS sessions'), DB::raw('DATE(created_at) AS createdDate'), 'platform')
            ->where('app_id', $appID)
            ->where('app_type', $appType)
            ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate]);

        if ($groupByMonth) {
            $query->groupBy(DB::raw('MONTH(created_at)'));
        } else {
            $query->groupBy(DB::raw('DATE(created_at)'));
        }

        return $query->groupBy('platform')->get();
    }

    public static function getAppSessionYearMonthwise(int $appID, string $startDate, string $endDate, int $appType)
    {
        return self::select(DB::raw('COUNT(*) AS sessions'), DB::raw('DATE(created_at) AS createdDate'), 'platform')
            ->where('app_id', $appID)
            ->where('app_type', $appType)
            ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate])
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->groupBy(DB::raw('YEAR(created_at)'))
            ->get();
    }

    public static function getCountryWiseSessions(int $appID, int $appType) {
        return self::select(DB::raw('COUNT(*) AS sessions'), 'country', 'country_code')
            ->where('app_id', $appID)
            ->where('app_type', $appType)
            ->where('country_code', '<>', 'NULL')
            ->orderBy('sessions', 'DESC')
            ->groupBy('country_code')
            ->get();
    }
}
