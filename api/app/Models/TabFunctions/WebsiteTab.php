<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\TabFunctions\WebsiteTabController;
use Illuminate\Database\Eloquent\Collection;

class WebsiteTab extends Model {

    protected $table = 'tp_func_website_tab';
    protected $guarded = ['id'];

    public static function getWebsiteList(int $tabId) {
        $thumbnailURL = WebsiteTabController::getThumbnailURL();
        return self::select(DB::raw("`id`, `name`, `url`, `is_donation_request`, CONCAT('$thumbnailURL','/',`thumbnail`) as `thumbnail`, `is_printing_allowed`, `use_safari_webview`"))
            ->where('tab_id', $tabId)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('name', 'ASC')
            ->get();
    }

    public static function updateMultiple(array $data, string $updateKey = 'id') {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                self::where($updateKey, $key)->update($value);
            }
        });
    }

    /**
     * @param mixed $id
     */
    public static function deleteWebsites($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function getWebsiteData(int $id) {
        $thumbnailURL = WebsiteTabController::getThumbnailURL();
        return self::select(DB::raw("`id`, `name`, `url`, `is_donation_request`, `is_printing_allowed`, `use_safari_webview`,CONCAT('$thumbnailURL','/',`thumbnail`) as `thumbnail`"))
            ->where('id', $id)
            ->first();
    }

    public static function getFirstWebsiteData(int $tabId) {
        $thumbnailURL = WebsiteTabController::getThumbnailURL();
        return self::select(DB::raw("`id`, `name`, `url`, `is_donation_request`, `is_printing_allowed`, `use_safari_webview`,CONCAT('$thumbnailURL','/',`thumbnail`) as `thumbnail`"))
            ->where('tab_id', $tabId)
            ->first();
    }

    /**
     *
     * @param int $tabId Tab Id
     * @return type
     */
    public static function IsSingleEntry(int $tabId) {
        return self::select('id', 'tab_id', 'name', 'is_donation_request', 'use_safari_webview', 'is_printing_allowed')
            ->where('tab_id', $tabId)->get()->count();
    }

    public static function getDataForCloning(int $tabID) {
        return self::select('name', 'url', 'is_donation_request', 'is_printing_allowed', 'use_safari_webview', 'thumbnail', 'sort_order')
            ->where('tab_id', $tabID)
            ->get()
            ->toArray();
    }

}
