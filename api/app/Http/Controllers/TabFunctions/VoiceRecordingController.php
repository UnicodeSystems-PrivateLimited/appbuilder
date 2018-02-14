<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use App\Models\TabFunctions\VoiceRecording;
use App\Models\TpAppsTabEntity;

class VoiceRecordingController extends Controller {


    private static function _getCommonValidationRules(): array {
        return [
            'email_id' => 'required|email',
            'description' => 'required|max:256'
        ];
    }

  

    private static function _getValidationMessages() {
        return [];
    }



    /**
     * Add/Edit Voice Recording for tab id
     */
    public function save(Request $request) {
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
            VoiceRecording::where('id', $request->id)->update($data);
            $dataRecording = VoiceRecording::getVoiceData($request->id);
                $result = [
                    'success' => TRUE,
                    'message' => ['Voice Recording information successfully edited.'],              
                    'data' => $dataRecording
                    ];
            } else {
            $createdId = VoiceRecording::create($data)->id;
            $dataRecording = VoiceRecording::getVoiceData($createdId);
                $result = [
                    'success' => TRUE,
                    'message' => ['Voice Recording information successfully added.'],
                    'data' => $dataRecording
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
     * Load the voice last recording data and tab data
     */
    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }

            $data = [
                'voiceData' => VoiceRecording::getLastVoiceData($request->tabId),
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
     * get the voice recording info
     */
    public function getItemData(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $result = [
                'success' => TRUE,
                'data' => VoiceRecording::getLastVoiceData($request->tabId)
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