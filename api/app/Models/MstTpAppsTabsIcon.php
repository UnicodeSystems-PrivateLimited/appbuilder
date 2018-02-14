<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class MstTpAppsTabsIcon extends Model {

    const TYPE_BLACK = 1;
    const TYPE_WHITE = 2;
    const TYPE_COLOR = 3;
    const TYPE_PHOTOS = 4;
    const STATUS_ENABLED = 1;
    const STATUS_DISABLED = 2;

    protected $table = 'tp_apps_tabs_icon';
    protected $guarded = ["id"];

    public static function getIcons($type, $perPage = 8) {
        $path = url('/storage/app/public/icons/' . ($type === self::TYPE_COLOR ? 'color/' : ''));
        return self::where('type', $type)->select(DB::raw("id, name,type, CONCAT('$path','/',name) as src"))
        ->paginate($perPage);
    }

    public static function getColorIconsSection($type, $perPage = 8) {
        $path = url('/storage/app/public/icons/' . ($type === self::TYPE_COLOR ? 'color/' : ''));
        return self::where('type', $type)->select(DB::raw("id, name,type, CONCAT('$path','/',name) as src"))
        ->orderBy('id', 'DESC')->paginate($perPage);
    }
    
    public static function getPhotosIcons($type, $perPage = 8) {
        $path = url('/storage/app/public/icons/' . ($type === self::TYPE_PHOTOS ? 'photos/' : ''));
        return self::where('type', $type)->select(DB::raw("id, name,type, CONCAT('$path','/',name) as src"))
        ->paginate($perPage);
    }
    
    public static function getPhotosIconsSection($type, $perPage = 8) {
        $path = url('/storage/app/public/icons/' . ($type === self::TYPE_PHOTOS ? 'photos/' : ''));
        return self::where('type', $type)->select(DB::raw("id, name,type, CONCAT('$path','/',name) as src"))
        ->orderBy('id', 'DESC')->paginate($perPage);
    }

    public static function getTabIcons($type) {
        $path = url('/storage/app/public/icons/' . ($type === self::TYPE_COLOR ? 'color/' : ''));
        return self::where('type', $type)->select(DB::raw("id, name,type, CONCAT('$path','/',name) as src"))
            ->get();
    }

}