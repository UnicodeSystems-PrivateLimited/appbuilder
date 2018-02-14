<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class MenuItem extends Model {

    protected $table = 'tp_func_menu_item';
    protected $guarded = ['id'];


    public static function getMenuCategoryItemList(int $menuId , $status){
        $query = MenuItem::select(DB::raw("`id`, `name`, `description`,`price`,`status`"))
                ->where('menu_id', $menuId);
                if ($status != NULL) {
                    $query->where('status', $status);
                }
                $query->orderBy(DB::raw('(sort_order=0)'), 'ASC');
                $query->orderBy('sort_order', 'ASC');
                $query->orderBy('name', 'ASC');
        return $query->get();
    }

    public static function updateMenuItemMultiple(array $data, string $updateKey = 'id') {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                self::where($updateKey, $key)->update($value);
            }
        });
    }

    public static function deleteMenuItem($id) {

        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function getMenuCategoryData(int $id) {
        return self::select(DB::raw("`id`, `name`, `section`,`status`"))
            ->where('id', $id)
            ->first();
    }
    public static function getMenuItemData(int $id){
        return self::select('id', 'name', 'description', 'price', 'status', 'background_color', 'text_color', 'use_global_colors')
            ->where('id', $id)
            ->first();
    }

}
