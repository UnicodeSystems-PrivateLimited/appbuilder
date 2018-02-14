<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;

class ShoppingCartDelivery extends Model
{

    protected $table = 'tp_func_cart_delivery';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_cart_delivery';

    public static function getData(int $tabID) {
        return self::select(
            'id',
            'tab_id',
            'is_pickup_method',
            'pickup_title',
            'pickup_confirmation_message',
            'is_digital_method',
            'digital_title',
            'is_shipping_method',
            'shipping_title',
            'shipping_minimum',
            'free_shipping_amount',
            'shipping_days',
            'is_shipping_fee_taxable',
            'is_delivery_address_validation'
        )
            ->where('tab_id', $tabID)
            ->first();
    }

}