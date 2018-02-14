<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;

class FoodOrderingPaymentTaxDetails extends Model {

    protected $table = 'tp_func_food_payment_tax_details';
    protected $guarded = ['id'];

    const TAX_METHOD_BY_RATE = 1;
    const TAX_METHOD_BY_FLAT = 2;

    public static function getTaxMethodOptions(): array {
        return [
            ['label' => 'By Rate', 'value' => self::TAX_METHOD_BY_RATE],
            ['label' => 'By Flat', 'value' => self::TAX_METHOD_BY_FLAT]
        ];
    }

    public static function getAllTaxDetails(int $tabID) {
        return self::select('id', 'tab_id', 'tax_method', 'tax_name', 'tax_value')
            ->where('tab_id', $tabID)
            ->get();
    }

    public static function deleteTax($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

}