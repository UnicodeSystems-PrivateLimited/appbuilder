<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class FoodCategoryItemSizes extends Model {

    protected $table = 'food_category_item_sizes';
    protected $guarded = ['id'];
   
    
    public static function getItemSize(int $id) {
        return self::select(DB::raw("`id`,`item_id`,`size`,`price`,`created_at`"))
                        ->where('item_id', $id)
                        ->get();
    }

}
