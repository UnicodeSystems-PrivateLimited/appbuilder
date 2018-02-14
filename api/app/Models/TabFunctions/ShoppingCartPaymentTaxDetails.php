<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;

class ShoppingCartPaymentTaxDetails extends Model {

    protected $table = 'tp_func_cart_payment_tax_details';
    protected $guarded = ['id'];

    const TAX_METHOD_BY_RATE = 1;
    const TAX_METHOD_BY_FLAT = 2;

    public static function getTaxMethodOptions(): array {
        return [
            ['label' => 'By Rate', 'value' => self::TAX_METHOD_BY_RATE],
            ['label' => 'By Flat', 'value' => self::TAX_METHOD_BY_FLAT]
        ];
    }

    public static function getAllTaxDetails(int $paymentID) {
        return self::select('id', 'payment_id', 'tax_method', 'tax_name', 'tax_value')
            ->where('payment_id', $paymentID)
            ->get();
    }

    public static function deleteTax($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

}