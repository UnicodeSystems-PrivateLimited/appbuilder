<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;

class ShoppingCartCustomGuides extends Model
{

    protected $table = 'tp_func_cart_emails_custom_guides';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_cart_emails_custom_guides';  

    public static function getCartCustomeGuides(int $tab_id) {
        return $query = self::select('id', 'tab_id', 'shipping_method', 'pickup_method', 'digital_method', 'card', 'cash', 'order_items_list_template')
                        ->where('tab_id', $tab_id)
                        ->first();
    }
    
    public static function savecustomGuides($id, $shipping_method, $pickup_method, $digital_method, $card, $cash, $order_items_list_template) {
        DB::table('tp_func_cart_emails_custom_guides')->where('id', $id)->update([
            'shipping_method' => $shipping_method, 'pickup_method' => $pickup_method, 'digital_method'=>$digital_method, 'card'=>$card, 'cash'=>$cash, 'order_items_list_template'=>$order_items_list_template
        ]);
    }

}