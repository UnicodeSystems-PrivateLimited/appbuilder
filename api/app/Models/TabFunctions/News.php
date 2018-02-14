<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use App\Http\Controllers\tabFunctions\NewsController;
use Illuminate\Database\Eloquent\Collection;

class News extends Model {

    protected $table = 'tp_func_news';
    protected $guarded = ['id'];
    const TABLE = 'tp_func_news';

    //get details for given tab_id
    public static function get_Newstab_data($tab_id){
        return self::select('id','tab_id','google_keywords','twitter_keywords','facebook_keywords','show_news_home','created_at')
            ->where('tab_id', $tab_id)
            ->orderby('created_at', 'DESC')
            ->first();
    }
    
    //update show_news_home for tabs
    public static function updateHomeWidgetStatus(array $tab_ids, $show_news_home) {
        DB::table(self::TABLE)->whereIn('tab_id', $show_news_home)
        ->update([
                'show_news_home' => $show_news_home
            ]);
    }
    
    public static function getShowNewsHomeStatus($tab_id){
        return self::select('id','show_news_home')
            ->where('tab_id', $tab_id)
            ->first();
    }
}
