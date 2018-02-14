<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class FoodCategoryItemOptions extends Model {

    protected $table = 'food_category_item_options';
    protected $guarded = ['id'];
    
    
    public static function getItemOption(int $id) {
        return self::select(DB::raw("`id`,`item_id`,`option_name`,`charges`,`created_at`"))
                        ->where('item_id', $id)
                        ->get();
    }

}
