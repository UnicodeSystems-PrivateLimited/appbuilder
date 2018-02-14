<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Http\Controllers\Master\ClientPermissionController;


class ClientImages extends Model {

    protected $table = 'client_images';
    protected $guarded = ['id'];

    /**
     * get themes
     */
    public static function imagesList($type , $imageURL) {  
        return self::select('id', 'type','created_at', DB::raw(self::_getImageSelectString($imageURL, 'name') ))
                     ->where('type',$type)
                     ->get();
    }

    public static function imageItem($id) {
        return self::select('id', 'name')
                        ->where('id', $id)
                        ->first();
    }
    
    private static function _getImageSelectString(string $url, string $colName): string {
        return "IF(`$colName` != '', (CONCAT('$url','/',`$colName`)) , NULL) as `$colName`";
    }

}
