<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\InboxSettings;
use App\Models\TabFunctions\InboxSubscription;

use App\Models\TpAppsTabEntity;
use App\Helpers\Helper;

class InboxTabController extends Controller {

    private static function _getCommonValidationRules(): array {
        return [            
            'hide_msg_tab' => 'max:256',
            'msg_center_shortcut' => 'max:256',
            'icon_location' => 'max:256',
            'icon_opacity' => 'max:256',
            'subscription_service' => 'max:256',
          
              ];
    }   

      private static function _getValidationMessages() {
        return [];
    }

     //Inbox item validation
    private static function _getCommonValidationRulesInboxItem(): array {
        return [            
            'subscription_name' => 'required|max:256',
           
        ];
    }    
    private static function _getValidationMessagesInboxItem() {
        return [
           
        ];
    }
 /**
     * Load the inbox tabData, settingsData, 
     */

      public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $subscriptionList = InboxSubscription::subscriptionList($request->tabId);

            $data = [
                'subscriptionList' => $subscriptionList,
                'settingsData' =>  InboxSettings::getInboxSettings($request->tabId),
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
     * Add/Edit settings for tab id
     */
    public function saveSettings(Request $request) {
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
                InboxSettings::where('id', $request->id)->update($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Inbox Settings information successfully edited.'],              
                    ];
            } else {
                InboxSettings::create($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Inbox Settings information successfully added.'],
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
     * Add/Edit Direction for tab id
     */
    public function saveSubscription(Request $request) {
        try {
            $data = $request->all();

            $rules = $request->id ? ['id' => 'required|integer'] : ['tab_id' => 'required|integer'];
            $validator = Validator::make($data,
                array_merge(self::_getCommonValidationRulesInboxItem(), $rules),
                self::_getValidationMessagesInboxItem());

            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()->unique()));
            }
            unset($data['subscribers']);
            if ($request->id) {
                InboxSubscription::where('id', $request->id)->update($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['InboxSubscription information successfully edited.'],              
                    ];
            } else {
                InboxSubscription::create($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['InboxSubscription information successfully added.'],
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
     * Load the subscription list
     */
    public function subscriptionList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $data = InboxSubscription::subscriptionList($request->tabId);
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
     * sort the Subscription items
     */
    public function sortSubscription(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            InboxSubscription::updateMultiple($sortData);
            $result = [
                'success' => TRUE,
                'data' => 'Subscription order saved.'
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
     * Delete item  for Subscription
     */
    public function deleteSubscription(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }            
            InboxSubscription::deleteSubscription($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Subscription information for Inbox id successfully deleted.'],
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
     * get the Subscription information by id
     */
    public function getSubscriptionData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = InboxSubscription::getSubscriptionInfo($request->id);
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