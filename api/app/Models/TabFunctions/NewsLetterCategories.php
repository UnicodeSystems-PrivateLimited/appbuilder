<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class NewsLetterCategories extends Model {

    protected $table = 'newsletter_categories';
    protected $guarded = ['id'];

    /**
     * @param mixed $id
     */
    public static function deleteCategory($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    /**
     * Sorting
     */
    public static function updateMultiple(array $data, string $updateKey = 'id') {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                self::where($updateKey, $key)->update($value);
            }
        });
    }

    public static function getCategoryList(int $tab_id) {
        return self::select(DB::raw("`id`,`name`,`created_at`,`tab_id`"))
                        ->where('tab_id', $tab_id)
                        ->orderBy('name', 'ASC')
                        ->get();
    }

    public static function getCategoryListForSubmittedData($tab_id) {
        return self::select(DB::raw("`id`,`name`,`created_at`,`tab_id`"))
                        ->whereIn('tab_id', $tab_id)
                        ->orderBy('name', 'ASC')
                        ->get();
    }

    public static function getCategoryData(int $id) {
        return self::select(DB::raw("`id`,`name`,`created_at`,`tab_id`"))
                        ->where('id', $id)
                        ->first();
    }

    public static function getCategoryName($ids) {
        return self::select(DB::raw("`id`,`name`"))
                        ->whereIn('id', $ids)
                        ->get();
    }

}
