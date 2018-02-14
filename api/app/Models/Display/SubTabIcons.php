<?php

namespace App\Models\Display;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

use App\Helpers\Helper;

class SubTabIcons extends Model {

    protected $table = 'mst_sub_tab_icons';
    protected $guarded = ['id'];

    public static function getAllIcons() {
    	$imgURL = url('/storage/app/public/display/subtabs_icons');
    	return self::select('id', 'name', DB::raw("CONCAT('$imgURL', '/', name) as src"))
    		->get();
    }

}