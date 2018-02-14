<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class ClientPermission extends Model {

    protected $table = 'client_permission';
    protected $guarded = ['id'];
    const TABLE = 'client_permission';

    //get settings 
    public static function get_settings_data($id,$scope){
        $query =  ClientPermission::select('id','settings','created_at');                
                if (isset($scope) && $scope == "global") {
                $query->where('id', $id);
                }else{
                $query->where('app_id',$id);   
                }
               return $query->first();
    }
    
    
    //get settings data item
    public static function get_settings_dataItem($id){
        return self::select('id','settings','created_at')
                ->where('id',$id)
                ->first();
    }
    
    public static function get_data_by_app_id($id){
        return self::select('id','settings','created_at')
                ->where('app_id',$id)
                ->first();
    }
    
}
