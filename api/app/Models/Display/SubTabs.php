<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace App\Models\Display;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;
use App\Models\TpAppsTabEntity;
use App\Models\MstTpTabEntity;

/**
 * Description of SubTabs
 *
 * @author unicode
 */
class SubTabs extends Model
{

    protected $table = 'display_settings_subtabs';
    protected $guarded = ['id'];

    const TABLE = 'display_settings_subtabs';

    public static function getSubTabList(int $appId): array
    {
        $imgURL = url('/storage/app/public/display/subtabs_icons');
        $bgImagePath = url('/storage/app/public/display/user_images');
        $result = DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.title as title', DB::raw("CONCAT('$imgURL', '/', main.icon_name) as icon_name"), 'tab.title as tab_title', 'main.tab_id', DB::raw("CONCAT('$bgImagePath','/',image.name) as bgImage"), DB::raw("CONCAT('$bgImagePath','/',tablet_bg_img.name) as tablet_bg_img"), DB::raw("CONCAT('$bgImagePath','/',iphone4_bg_img.name) as iphone4_bg_img"), 'te.tab_code as tab_func_code', 'main.text_color', 'main.text_color_shadow', 'main.sort_order', 'external_url')
            ->leftJoin(TpAppsTabEntity::TABLE . ' as tab', 'main.tab_id', '=', 'tab.id')
            ->leftJoin(MstTpTabEntity::TABLE . ' as te', 'tab.tab_func_id', '=', 'te.id')
            ->leftJoin(TpAppsTabEntity::IMAGE_TABLE . ' as image', 'image.id', '=', 'tab.background_image')
            ->leftJoin(TpAppsTabEntity::IMAGE_TABLE . ' as tablet_bg_img', 'tablet_bg_img.id', '=', 'tab.tablet_bg_img')
            ->leftJoin(TpAppsTabEntity::IMAGE_TABLE . ' as iphone4_bg_img', 'iphone4_bg_img.id', '=', 'tab.iphone_bg_img')
            ->where('main.app_id', $appId)
            ->orderBy('main.sort_order', 'ASC')
            ->get();

        $returnArray = [];
        foreach ($result as $value) {
            $returnArray[$value->sort_order] = $value;
        }
        for ($i = 0; $i < 12; $i ++) {
            if (empty($returnArray[$i])) {
                $returnArray[$i] = new \stdClass(); // Storing empty object if there's no data.
            }
        }
        return $returnArray;
    }

    public static function getSubTab(int $id)
    {
        $imgURL = url('/storage/app/public/display/subtabs_icons');
        return self::select('id', 'app_id', 'title', 'text_color', 'text_color_shadow', 'tab_id', 'active', 'homescreen_only', DB::raw("CONCAT('$imgURL', '/', icon_name) as icon_name"), 'sort_order', 'external_url')
                        ->where('id', $id)
                        ->first();
    }

    public static function updateMultiple(array $data, string $updateKey = 'id')
    {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                self::where($updateKey, $key)->update($value);
            }
        });
    }
}
