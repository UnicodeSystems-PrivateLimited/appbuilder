<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;

class ShoppingCartPayment extends Model {

    protected $table = 'tp_func_cart_payment';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_cart_payment';

    const PAYMENT_GATEWAY_NONE = 0;
    const PAYMENT_GATEWAY_AUTHORIZE_NET = 1;
    const PAYMENT_GATEWAY_PAYPAL = 2;
    const PAYMENT_GATEWAY_STRIPE = 3;

    public static function getPaymentGatewayOptions(): array {
        return [
            ['label' => 'No Mobile Payment Selected', 'value' => self::PAYMENT_GATEWAY_NONE],
            ['label' => 'Authorize.Net', 'value' => self::PAYMENT_GATEWAY_AUTHORIZE_NET],
            ['label' => 'PayPal', 'value' => self::PAYMENT_GATEWAY_PAYPAL],
            ['label' => 'stripe', 'value' => self::PAYMENT_GATEWAY_STRIPE]
        ];
    }

    public static function getData(int $tabID) {
        return self::select('id', 'tab_id', 'currency', 'payment_gateway', 'payment_gateway_credentials', 'is_cash')
            ->where('tab_id', $tabID)
            ->first();
    }

}