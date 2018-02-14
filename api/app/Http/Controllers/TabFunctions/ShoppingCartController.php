<?php

namespace App\Http\Controllers\TabFunctions;

use App\Helpers\Country;
use App\Helpers\Currency;
use App\Http\Controllers\Controller;
use App\Models\TabFunctions\ShoppingCartBlockedCountries;
use App\Models\TabFunctions\ShoppingCartCategory;
use App\Models\TabFunctions\ShoppingCartDelivery;
use App\Models\TabFunctions\ShoppingCartItem;
use App\Models\TabFunctions\ShoppingCartPayment;
use App\Models\TabFunctions\ShoppingCartPaymentTaxDetails;
use App\Models\TabFunctions\ShoppingCartShippingCharges;
use App\Models\TpAppsTabEntity;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\Validator;
use App\Models\TabFunctions\ShoppingCartEmail;
use App\Models\TabFunctions\ShoppingCartCustomGuides;

class ShoppingCartController extends Controller
{

    const PAYMENT_GATEWAY_CREDENTIAL_FIELDS = [
        ShoppingCartPayment::PAYMENT_GATEWAY_AUTHORIZE_NET => ['api_login_id', 'transaction_key'],
        ShoppingCartPayment::PAYMENT_GATEWAY_PAYPAL => ['api_username', 'api_password', 'signature'],
        ShoppingCartPayment::PAYMENT_GATEWAY_STRIPE => ['api_secret_key']
    ];

    public function init(Request $request) {
        if (empty($request->tabID)) {
            throw new Exception('Tab ID not found.');
        }
        $payment = ShoppingCartPayment::getData($request->tabID);
        $payment->payment_gateway_credentials = json_decode($payment->payment_gateway_credentials);
        $cartEmailData = ShoppingCartEmail::getCartEmail($request->tabID);
        $result = parent::getSuccessResponse(NULL, [
            'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabID),
            'currencyOptions' => Currency::getCurrencyOptions(),
            'paymentGatewayOptions' => ShoppingCartPayment::getPaymentGatewayOptions(),
            'payment' => $payment,
            'taxMethodOptions' => ShoppingCartPaymentTaxDetails::getTaxMethodOptions(),
            'taxAmountList' => ShoppingCartPaymentTaxDetails::getAllTaxDetails($payment->id),
            'currencySymbolList' => Currency::CURRENCY_SYMBOL_LIST,
            'delivery' => ShoppingCartDelivery::getData($request->tabID),
            'shippingCharges' => ShoppingCartShippingCharges::getAll($request->tabID),
            'blockedCountries' => ShoppingCartBlockedCountries::getAll($request->tabID),
            'countryList' => Country::COUNTRY_LIST,
            'categoryList' => ShoppingCartCategory::getAll($request->tabID),
            'itemList' => ShoppingCartItem::getAll($request->tabID),
            'cartConfirmation' => $cartEmailData[0] ?? [],
            'cartAdminreceipt' => $cartEmailData[1] ?? [],
            'cartCustomGuides' => ShoppingCartCustomGuides::getCartCustomeGuides($request->tabID) ?? []
        ]);
        return response()->json($result);
    }

    public function saveSettings(Request $request) {
        if (empty($request->tabID)) {
            throw new Exception('Tab ID not found.');
        }
        $settings = $request->only('go_back_prompt', 'shipping_instruction');
        if (isset($settings['go_back_prompt']) && is_bool($settings['go_back_prompt']) && isset($settings['shipping_instruction']) && is_bool($settings['shipping_instruction'])) {
            TpAppsTabEntity::updateSettings($settings, $request->tabID);
        } else {
            throw new Exception('Invalid data found');
        }
        $result = parent::getSuccessResponse('Settings updated successfully.');
        return response()->json($result);
    }

    public function savePayment(Request $request) {
        $data = $request->all();
        $rules = [
            'id' => 'required|integer',
            'tab_id' => 'integer',
            'currency' => 'required',
            'is_cash' => 'boolean'
        ];
        foreach (self::PAYMENT_GATEWAY_CREDENTIAL_FIELDS as $gateway => $fields) {
            foreach ($fields as $field) {
                $rules['payment_gateway_credentials.' . $field] = 'required_if:payment_gateway,' . $gateway;
            }
        }
        $gatewayCredentialAttributeNames = self::getGatewayAttributeNames();
        $validator = Validator::make($data, $rules, [
            'is_cash.boolean' => 'Invalid value provided for cash field.',
            'required_if' => 'The :attribute field is required'
        ]);
        $validator->setAttributeNames($gatewayCredentialAttributeNames);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        $data['payment_gateway_credentials'] = !empty($data['payment_gateway_credentials']) ? json_encode($data['payment_gateway_credentials']) : NULL;
        ShoppingCartPayment::where('id', $data['id'])->update($data);
        $result = parent::getSuccessResponse('Payment options saved successfully.');
        return response()->json($result);
    }

    private static function getGatewayAttributeNames(): array {
        $attributeNames = [];
        foreach (self::PAYMENT_GATEWAY_CREDENTIAL_FIELDS as $gateway => $fields) {
            foreach ($fields as $field) {
                $attributeNames['payment_gateway_credentials.' . $field] = str_replace('_', ' ', $field);
            }
        }
        return $attributeNames;
    }

    public function saveTaxDetails(Request $request) {
        $data = $request->all();
        Validator::extend('rate', function ($attribute, $value) use ($data) {
            if ($data['tax_method'] == ShoppingCartPaymentTaxDetails::TAX_METHOD_BY_RATE) {
                return $value <= 100;
            }
            return TRUE;
        });
        $validator = Validator::make($data, [
            'id' => 'integer',
            'payment_id' => 'required_without:id|integer',
            'tax_name' => 'required|max:255',
            'tax_method' => 'required|integer',
            'tax_value' => 'required|numeric|rate|min:0|max:999999999999.99'
        ], [
            'tax_value.max' => 'The tax rate/value is too large.',
            'tax_value.rate' => 'Invalid tax rate (%)'
        ]);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        $id = ShoppingCartPaymentTaxDetails::updateOrCreate(['id' => $data['id'] ?? NULL], $data)->id;
        $result = parent::getSuccessResponse('Tax amount saved successfully.', ['id' => $id]);
        return response()->json($result);
    }

    public function deleteTaxDetails(Request $request) {
        if (empty($request->ids)) {
            throw new Exception('ID(s) not found.');
        }
        ShoppingCartPaymentTaxDetails::deleteTax($request->ids);
        $result = parent::getSuccessResponse('Tax amount(s) successfully deleted.');
        return response()->json($result);
    }

    public function appInit(Request $request) {
        $result = parent::getSuccessResponse(NULL, [
            'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabID),
            'categories' => ShoppingCartCategory::getEnabledCategories($request->tabID),
            'payment' => ShoppingCartPayment::getData($request->tabID)
        ]);
        return response()->json($result);
    }

    public function currencyItems() {
        $result = parent::getSuccessResponse(NULL, [
            'currencySymbolList' => Currency::CURRENCY_SYMBOL_LIST
        ]);
        return response()->json($result);
    }

}