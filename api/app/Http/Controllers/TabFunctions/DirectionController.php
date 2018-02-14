<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use App\Models\TabFunctions\Direction;
use App\Models\TpAppsTabEntity;

class DirectionController extends Controller {


    private static function _getCommonValidationRules(): array {
        return [
            'title' => 'required|max:256',
            'm_lat' => "required",
            'm_long' => "required"
        ];
    }
    private static function _getValidationMessages() {
        return [
            'm_lat.required' => 'The address is required.',
            'm_long.required' => 'The address is required.'
        ];
    }
    
     public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $data = [
                'listData' => Direction::directionList($request->tabId),
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
    
    
    
    /**
     * Add/Edit Direction for tab id
     */
    public function saveDirection(Request $request) {
        try {
            $data = $request->all();

            $rules = $request->id ? ['id' => 'required|integer'] : ['tab_id' => 'required|integer'];
            $validator = Validator::make($data,
                array_merge(self::_getCommonValidationRules(), $rules),
                self::_getValidationMessages());

            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()->unique()));
            }

            if ($request->id) {
                Direction::where('id', $request->id)->update($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Direction information successfully edited.'],              
                    ];
            } else {
                Direction::create($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Direction information successfully added.'],
                ];
            }
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    

    /**
     * Load the direction list
     */
    public function directionList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $data = Direction::directionList($request->tabId);
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

    /**
     * sort the direction list
     */
    public function sortDirection(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            Direction::updateMultiple($sortData);
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

    /**
     * delete the contact us info
     */
    public function deleteDirection(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            Direction::deleteDirection($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Direction information successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    /**
     * get the direction information
     */
    public function getItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = Direction::getDirectionInfo($request->id);
            $result = [
                'success' => TRUE,
                'data' => $data
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }


}
