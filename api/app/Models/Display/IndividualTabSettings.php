<?php

namespace App\Models\Display;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class IndividualTabSettings extends Model {

    protected $table = 'global_style_individual_tab';
    protected $guarded = ['id'];

    const APPS_TABS_TABLE = 'tp_apps_tabs_entity';

    public static function getIndividualTabSettings(int $tab_id) {
        return self::select('id','tab_id', 'buttons', 'icon_color', 'header', 'color')
                        ->where('tab_id', $tab_id)
                        ->first();
    }

    public static function getTabSettingsByTabIds(array $tab_id) {
        $result = self::select('id', 'tab_id', 'buttons', 'icon_color', 'header', 'color')
                ->whereIn('tab_id', $tab_id)
                ->get();
        $returnArray = [];
        foreach ($result as $value) {
            $returnArray[$value->tab_id] = $value;
        }
        return $returnArray;
    }

     public static function deleteSettings($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('tab_id', $id)->delete();
    }

}
