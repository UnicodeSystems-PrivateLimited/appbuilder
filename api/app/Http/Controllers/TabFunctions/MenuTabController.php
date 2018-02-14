<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use App\Models\TabFunctions\Menu;
use App\Models\TabFunctions\MenuItem;
use App\Models\Display\GlobalStyle;
use App\Models\TpAppsTabEntity;

class MenuTabController extends Controller {
    
   //category validator
    private static function _getCommonValidationRules(): array {
        return [
            'name' => 'required|max:256',
            'section' => 'required|max:256',
            'status' => 'required|integer'
        ];
    }
    
    //category Item validator
    private static function _getCommonItemValidationRules(): array {
        return [
            'name' => 'required|max:256',
            'price' => 'numeric|min:0',
            'use_global_colors' => 'required|integer|min:0|max:1',
            'status' => 'required|integer',
        ];
//            'background_color' => 'required|max',
//            'background_color' => 'required|max',
    }
        private static function _getCommonItemValidationRulesNew(): array {
        return [
            'name' => 'required|max:256',
            'price' => 'numeric|min:0',
            'use_global_colors' => 'required|integer|min:0|max:1',
            'status' => 'required|integer',
        ];
//            'background_color' => 'required|max',
//            'background_color' => 'required|max',
    }
    
//    //Category Create 
    public function createCategory(Request $request) {
        try {
            $data = $request->all();
            $validator = Validator::make($data, array_merge(self::_getCommonValidationRules(), ['tab_id' => 'required|integer']));
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            Menu::create($data);
            $result = [
                'success' => TRUE,
                'message' => ['Menu Category successfully added.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }
    
  // Category Edit
    public function editCategory(Request $request) {
        try {
            $data = $request->all();
            $validator = Validator::make($data, array_merge(self::_getCommonValidationRules(), ['id' => 'required|integer']));
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            Menu::where('id', $request->id)->update($data);
            $result = [
                'success' => TRUE,
                'message' => ['Menu Category successfully edited.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    // Category All Tab Data
    public function getAllTabData(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $style = GlobalStyle::getGlobalStyleFeatures(TpAppsTabEntity::find($request->tabId)->app_id);
             if (!empty($style)) {
                $style->features = $style->features ? json_decode($style->features) : NULL;
            } else {
                $style = NULL;
            }
            $data = [
                'menu_category' => Menu::getMenuCategoryList($request->tabId),
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
                'style' => $style
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
//    //Category List
    public function getMenuCategoryList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $result = [
                'success' => TRUE,
                'data' => Menu::getMenuCategoryList($request->tabId)
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

 // Sort Category 
    public function sortCategory(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            Menu::updateCategoryMultiple($sortData);
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
//
//
//    // Category Delete
    public function deleteCategory(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            Menu::deleteMenuCategory($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Menu Category successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }
    
//    // Category Item Data
    public function getItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = Menu::getMenuCategoryData($request->id);
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
    
    
     public function getMenuCategoryItemList(Request $request) {
        try {
            if (empty($request->menuId)) {
                throw new Exception('Menu ID not found.');
            }
            $result = [
                'success' => TRUE,
                'data' => MenuItem::getMenuCategoryItemList($request->menuId,null)
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }
    
     public function sortMenuItem(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            MenuItem::updateMenuItemMultiple($sortData);
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

    
    public function deleteMenuItem(Request $request) {
         try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            MenuItem::deleteMenuItem($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Menu Item successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

     public function createMenuItem(Request $request) {
        try {
            $data = $request->all();
            $validator = Validator::make($data, array_merge(self::_getCommonItemValidationRules(), ['menu_id' => 'required|integer']));
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            if ($data['use_global_colors']==1 && empty($data['background_color']) && empty($data['text_color'])) {
                throw new Exception('Background Color and Text Color cannot be empty.');
            }
            MenuItem::create($data);
            $result = [
                'success' => TRUE,
                'message' => ['Menu Item successfully added.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }
    
    public function getMenuItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $result = [
                'success' => TRUE,
                'data' => MenuItem::getMenuItemData($request->id)
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }
    
    public function editMenuItem(Request $request) {
        try {
            
            $data = $request->all();

            if ($data['use_global_colors']==1 && empty($data['background_color']) && empty($data['text_color'])) {
                throw new Exception('Background Color and Text Color cannot be empty.');
            }
            
               $validator = Validator::make($data, array_merge(self::_getCommonItemValidationRules(), ['id' => 'required|integer']));
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            MenuItem::where('id', $request->id)->update($data);
            $result = [
                'success' => TRUE,
                'message' => ['Menu Category successfully edited.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }
    
    public function appInit(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $data = [
                'menu_category' => Menu::getSetionWiseMenuCategoryList($request->tabId),
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
    
    public function appMenuItemsInit(Request $request) {
        try {
            if (empty($request->menuId)) {
                throw new Exception('Menu ID not found.');
            }
            $data = [
                'menuItems' => MenuItem::getMenuCategoryItemList($request->menuId,$status = 1),
                'categoryName' => Menu::find($request->menuId)->name
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
 }



