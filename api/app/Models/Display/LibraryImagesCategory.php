<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace App\Models\Display;
use Illuminate\Database\Eloquent\Model;
use DB;
/**
 * Description of LibraryImagesCategory
 *
 * @author Meera
 */
class LibraryImagesCategory extends Model {

    protected $table = 'mst_library_images_category';
    protected $guarded = ['id'];
    const TABLE = 'mst_library_images';

   /**
     * get homescreen
     */
    public static function getLibraryImagesCategory(){
         return self::select('id','name')
            ->get();
    }
}
