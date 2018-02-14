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
 * Description of LibraryImages
 *
 * @author Meera
 */
class LibraryImages extends Model {

    protected $table = 'mst_library_images';
    protected $guarded = ['id'];

    const TABLE = 'mst_library_images_category';
    const LIBRARYTABLE = 'mst_library_images';

    /**
     * get homescreen
     */
    public static function getLibraryImages() {
        return DB::table('mst_user_images as main')
                        ->select('main.id', 'main.name', 'main.category_id', 'main.created_at', 'main.updated_at', 'child.name as cat_name')
                        ->leftJoin(self::TABLE . ' as child', 'main.category_id', '=', self::TABLE . 'id')
                        ->get();
    }

    /* function to get all Library Images */

    public static function getAllLibraryImages() {
        $imagepath = url('/storage/app/public/display/user_images');
        return DB::table('mst_library_images as main')
                        ->select(DB::raw("main.id,main.category_id, main.created_at, main.updated_at, CONCAT('$imagepath','/',main.name ) as name,child.name as Categoryname "))
                        ->leftJoin(self::TABLE . ' as child', 'main.category_id', '=', 'child.id')
                        ->get();
    }

    /* Function to getimage by category */

    public static function getAllImageByCat(int $cat_id) {
        $imagepath = url('/storage/app/public/display/user_images');
        return DB::table('mst_library_images as main')
                        ->select(DB::raw("main.id,main.category_id, main.created_at, main.updated_at, CONCAT('$imagepath','/',main.name ) as name,child.name as Categoryname "))
                        ->leftJoin(self::TABLE . ' as child', 'main.category_id', '=', 'child.id')
                        ->where('main.category_id', $cat_id)
                        ->get();
    }

}
