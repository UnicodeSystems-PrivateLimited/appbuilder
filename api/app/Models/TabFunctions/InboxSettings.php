<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class InboxSettings extends Model {

    protected $table = 'tp_func_inbox_settings';
    protected $guarded = ['id'];
    const TABLE = 'tp_func_inbox_settings';


    /**
     * get inbox settings for tab
     */
    public static function getInboxSettings(int $tabId) {
        return self::select('id','tab_id','hide_msg_tab','msg_center_shortcut','icon_location','icon_opacity','subscription_service')
            ->where('tab_id', $tabId)
            ->first();
    }
}