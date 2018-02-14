<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use App\Models\TabFunctions\CallUs;
use App\Models\TpAppsTabEntity;

class CallUsController extends Controller {

    private static function _getCommonValidationRules(): array {
        return [
            'title' => 'required|max:256',
            'phone' => 'required|between:10,12'
        ];
    }

    private static function _getValidationMessages() {
        return [
            'phone.between' => 'The phone number is invalid.'
        ];
    }

    public function create(Request $request) {
        try {
            $data = $request->all();
            $validator = Validator::make($data, array_merge(self::_getCommonValidationRules(), ['tab_id' => 'required|integer']), self::_getValidationMessages());
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            CallUs::create($data);
            $result = [
                'success' => TRUE,
                'message' => ['Phone number successfully added.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getAllTabData(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $data = [
                'phone_numbers' => CallUs::getCallUsList($request->tabId),
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
            ];
            $result = [
                'success' => TRUE,
                'data' => $data
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getPhoneNumberList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $result = [
                'success' => TRUE,
                'data' => CallUs::getCallUsList($request->tabId)
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function sortItem(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            CallUs::updateMultiple($sortData);
            $result = [
                'success' => TRUE,
                'data' => 'Item order saved.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function edit(Request $request) {
        try {
            $data = $request->all();
            $validator = Validator::make($data, array_merge(self::_getCommonValidationRules(), ['id' => 'required|integer']), self::_getValidationMessages());
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            CallUs::where('id', $request->id)->update($data);
            $result = [
                'success' => TRUE,
                'message' => ['Phone number successfully edited.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function delete(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            CallUs::deleteCallUs($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Phone number successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = CallUs::getCallUsData($request->id);
            $result = [
                'success' => TRUE,
                'data' => $data
            ];
        } catch (\Throwable $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

}
