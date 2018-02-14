<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use App\Helpers\Helper;
use App\Models\TabFunctions\FontFamilyTab;

class FontFamilyTabController extends Controller {

    public function getAllData(Request $request) {
        try {
            $result = [
                'success' => TRUE,
                'data' => FontFamilyTab::getFontFamilyList()
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }
}
