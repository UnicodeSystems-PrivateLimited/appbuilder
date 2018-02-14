<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class Menu extends Model {

    protected $table = 'tp_func_menu_tab';
    protected $guarded = ['id'];

    public static function getMenuCategoryList(int $tabId): Collection {
        return self::select(DB::raw("`id`, `name`, `section`,`status`"))
            ->where('tab_id', $tabId)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('name', 'ASC')
            ->get();
    }

    public static function updateCategoryMultiple(array $data, string $updateKey = 'id') {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                self::where($updateKey, $key)->update($value);
            }
        });
    }

    /**
     * @param mixed $id
     */
    public static function deleteMenuCategory($id) {
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
//for ionic to to display active categories
    public static function getSetionWiseMenuCategoryList(int $tabId): array {
        $returnArray = [];
        $result = self::select(DB::raw("`id`, `name`, `section`,`status`"))
            ->where('tab_id', $tabId)
            ->where('status', 1)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('name', 'ASC')
            ->get();
        foreach ($result as $res){
            $returnArray[$res->section][] = $res;
        }
        return $returnArray;
    }
}
