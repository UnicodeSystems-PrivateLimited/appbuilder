<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;

class FoodOrderingServices extends Model
{

    protected $table = 'tp_func_food_services';
    protected $guarded = ['id'];

    public static function getData(int $tabID) {
        return self::select(
            'id',
            'tab_id',
            'dine_in',
            'take_out',
            'take_out_days',
            'delivery',
            'delivery_days',
            'delivery_address_validation',
            'delivery_radius',
            'delivery_radius_type',
            'delivery_minimum',
            'delivery_price_fee',
            'delivery_price_fee_taxable',
            'free_delivery_amount',
            'lead_time',
            'convenience_fee',
            'convenience_fee_taxable'
        )
            ->where('tab_id', $tabID)
            ->first();
    }

}