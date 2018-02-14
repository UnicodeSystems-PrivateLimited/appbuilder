<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\TabFunctions\ShoppingCartEmail;
use App\Models\TabFunctions\ShoppingCartCustomGuides;
use Exception;
use Illuminate\Support\Facades\Validator;

class ShoppingCartEmailController extends Controller
{

    public function saveEmailCart(Request $request): JsonResponse {
        $data = $request->all();
        if (!$data['customerConfirmation']['template']) {
            throw new Exception('Custom Confirmation Content is required.');
        }
        if (!$data['adminReceipt']['template']) {
            throw new Exception('Admin Receipt Content is required.');
        }
        if (!$data['customGuides']['order_items_list_template']) {
            throw new Exception('Custom Guides Content is required.');
        }
        ShoppingCartEmail::saveShoppingCartEmail($data['customerConfirmation']['id'], $data['customerConfirmation']['subject'], $data['customerConfirmation']['type'], $data['customerConfirmation']['template']);
        ShoppingCartEmail::saveShoppingCartAdminEmail($data['adminReceipt']['id'], $data['adminReceipt']['subject'], $data['adminReceipt']['type'], $data['adminReceipt']['template'], $data['adminReceipt']['admin_email']);
        ShoppingCartCustomGuides::savecustomGuides($data['customGuides']['id'], $data['customGuides']['shipping_method'], $data['customGuides']['pickup_method'], $data['customGuides']['digital_method'], $data['customGuides']['card'], $data['customGuides']['cash'], $data['customGuides']['order_items_list_template']);
        $result = parent::getSuccessResponse('Email options saved successfully.');
        return response()->json($result);
    }
    
}