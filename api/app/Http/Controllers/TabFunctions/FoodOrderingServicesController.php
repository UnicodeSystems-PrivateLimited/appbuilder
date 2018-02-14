<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use App\Models\TabFunctions\FoodOrderingServices;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\Validator;

class FoodOrderingServicesController extends Controller
{

    public function save(Request $request): JsonResponse {
        $data = $request->all();
        $validator = Validator::make($data, [
            'id' => 'required|integer',
            'delivery_radius' => 'required|numeric|min:0|max:999999999999.99',
            'delivery_minimum' => 'required|numeric|min:0|max:999999999999.99',
            'delivery_price_fee' => 'required|numeric|min:0|max:999999999999.99',
            'free_delivery_amount' => 'required|numeric|min:0|max:999999999999.99',
            'lead_time' => 'required|numeric|min:0|max:999999999999.99',
            'convenience_fee' => 'numeric|min:0|max:999999999999.99'
        ], []);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        FoodOrderingServices::where('id', $data['id'])->update($data);
        $result = parent::getSuccessResponse('Services options saved successfully.');
        return response()->json($result);
    }

}