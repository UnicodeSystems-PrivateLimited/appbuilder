<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use App\Models\TabFunctions\ShoppingCartBlockedCountries;
use App\Models\TabFunctions\ShoppingCartDelivery;
use App\Models\TabFunctions\ShoppingCartShippingCharges;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\Validator;

class ShoppingCartDeliveryController extends Controller
{

    public function save(Request $request): JsonResponse {
        $data = $request->all();
        $validator = Validator::make($data, [
            'id' => 'required|integer',
            'tab_id' => 'integer',
            'is_pickup_method' => 'required|boolean',
            'pickup_title' => 'max:256',
            'is_digital_method' => 'required|boolean',
            'digital_title' => 'max:256',
            'is_shipping_method' => 'required|boolean',
            'shipping_title' => 'max:256',
            'shipping_minimum' => 'required_if:is_shipping_method,1|numeric|min:0|max:999999999999.99',
            'free_shipping_amount' => 'required_if:is_shipping_method,1|numeric|min:0|max:999999999999.99',
            'shipping_days' => 'required_if:is_shipping_method,1|integer|min:0|max:999',
            'is_shipping_fee_taxable' => 'required|boolean',
            'is_delivery_address_validation' => 'required|boolean'
        ], [
            'shipping_days.max' => 'The shipping days value is too large.',
            'max' => 'The :attribute is too large.',
            'required_if' => 'The :attribute field is required.'
        ]);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        ShoppingCartDelivery::where('id', $data['id'])->update($data);
        $result = parent::getSuccessResponse('Delivery options saved successfully.');
        return response()->json($result);
    }

    public function saveShippingCharge(Request $request): JsonResponse {
        $data = $request->all();
        $validator = Validator::make($data, [
            'id' => 'integer',
            'tab_id' => 'required|integer',
            'country' => 'required|max:2|unique:' . ShoppingCartShippingCharges::TABLE . ',country,' . ($data['id'] ?? NULL) . ',id,tab_id,' . $data['tab_id'],
            'price' => 'required|numeric|min:0|max:999999999999.99',
        ], [
            'price.max' => 'The price is too large.',
        ]);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        $id = ShoppingCartShippingCharges::updateOrCreate(['id' => $data['id'] ?? NULL], $data)->id;
        $result = parent::getSuccessResponse('Shipping charge saved successfully.', ['id' => $id]);
        return response()->json($result);
    }

    public function deleteShippingCharges(Request $request): JsonResponse {
        if (empty($request->ids)) {
            throw new Exception('ID(s) not found.');
        }
        if (empty ($request->tabID)) {
            throw new Exception('Tab ID not found');
        }
        if (count($request->ids) >= ShoppingCartShippingCharges::countAll($request->tabID)) {
            throw new Exception('Could not delete. Atleast 1 default shipping charge is required.');
        }
        ShoppingCartShippingCharges::deleteItem($request->ids);
        $result = parent::getSuccessResponse('Shipping charge(s) successfully deleted.');
        return response()->json($result);
    }

    public function saveBlockedCountry(Request $request): JsonResponse {
        $data = $request->all();
        $validator = Validator::make($data, [
            'id' => 'integer',
            'tab_id' => 'required|integer',
            'country' => 'required|max:2|unique:' . ShoppingCartBlockedCountries::TABLE . ',country,' . ($data['id'] ?? NULL) . ',id,tab_id,' . $data['tab_id'],
        ]);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        $id = ShoppingCartBlockedCountries::updateOrCreate(['id' => $data['id'] ?? NULL], $data)->id;
        $result = parent::getSuccessResponse('Blocked country saved successfully.', ['id' => $id]);
        return response()->json($result);
    }

    public function deleteBlockedCountries(Request $request): JsonResponse {
        if (empty($request->ids)) {
            throw new Exception('ID(s) not found.');
        }
        ShoppingCartBlockedCountries::deleteItem($request->ids);
        $result = parent::getSuccessResponse('Blocked ' . (count($request->ids) === 1 ? 'country' : 'countries') . ' successfully deleted.');
        return response()->json($result);
    }

}