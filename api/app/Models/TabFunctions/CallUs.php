<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class CallUs extends Model {

    protected $table = 'tp_func_call_us';
    protected $guarded = ['id'];

    public static function getCallUsList(int $tabId) {
        return self::select(DB::raw("`id`, `title`, `phone`"))
            ->where('tab_id', $tabId)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('title', 'ASC')
            ->get();
    }

    public static function updateMultiple(array $data, string $updateKey = 'id') {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                self::where($updateKey, $key)->update($value);
            }
        });
    }

    /**
     * @param mixed $id
     */
    public static function deleteCallUs($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function getCallUsData(int $id) {
        return self::select(DB::raw("`id`, `title`, `phone`"))
            ->where('id', $id)
            ->first();
    }

}
