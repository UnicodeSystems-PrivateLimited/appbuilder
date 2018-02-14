<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class GalleryConfig extends Model {

    protected $table = 'tp_func_gallery_config';
    protected $guarded = ['id'];
    
   //get gallery configuration details for given tab_id and with default service selected
    public static function get_default_image_service(int $tab_id){
        return self::select('id','tab_id','is_default','gallery_type','settings','created_at')
            ->where('tab_id', $tab_id)
            ->where('is_default', 1)
            ->orderby('created_at', 'DESC')
            ->first();
    }
    
    //get gallery configuration details for given tab_id and gallery type
    public static function get_gallery_config($tab_id,$gallery_type){
        return self::select('id','tab_id','is_default','gallery_type','settings','created_at')
            ->where('tab_id', $tab_id)
            ->where('gallery_type', $gallery_type)
            ->orderby('created_at', 'DESC')
            ->first();
    }



}