<?php
namespace App\Http\Controllers\TabFunctions;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use App\Models\TabFunctions\FoodOrderingMenuCategory;
use App\Models\TabFunctions\FoodOrderingMenuItems;
use App\Models\TabFunctions\FoodOrderingMenuItemSize;
use App\Models\TabFunctions\FoodOrderingMenuOptionType;
use App\Models\TabFunctions\FoodOrderingMenuOptionTypeItems;
use App\Models\TabFunctions\FoodOrderingLocationsItemHours;
use App\Models\TpAppsTabEntity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FoodOrderingMenuController extends Controller
{

    const CATEGORY_VIEW_DISPLAY_GRID = 1;
    const CATEGORY_VIEW_DISPLAY_LIST = 2;

    const CATEGORY_IMAGES_UPLOAD_PATH = 'functions/food/menu-category-images';
    const ITEM_IMAGES_UPLOAD_PATH = 'functions/food/menu-item-images';

    public function saveSettings(Request $request) : JsonResponse
    {
        $data = $request->all();
        $validator = Validator::make($data, [
            'tab_id' => 'required|integer',
            'category_view_display' => 'required|in:' . self::CATEGORY_VIEW_DISPLAY_GRID . ',' . self::CATEGORY_VIEW_DISPLAY_LIST
        ]);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        TpAppsTabEntity::updateSettings(['category_view_display' => $data['category_view_display']], $data['tab_id']);
        $result = parent::getSuccessResponse('Setting(s) updated successfully.');
        return response()->json($result);
    }

    public function saveCategory(Request $request) : JsonResponse
    {
        $data = $request->all();
        $validator = Validator::make($data, [
            'id' => 'integer',
            'tab_id' => 'required|integer',
            'name' => 'required|max:256',
            'image' => 'max:256',
            'image_url' => 'url|max:1024',
            'status' => 'in:' . FoodOrderingMenuCategory::STATUS_ENABLED . ',' . FoodOrderingMenuCategory::STATUS_DISABLED
        ], ['max' => 'The :attribute value is too large.']);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        $data['status'] = $data['status'] ?? FoodOrderingMenuCategory::STATUS_ENABLED;
        $id = FoodOrderingMenuCategory::updateOrCreate(['id' => $data['id'] ?? NULL], $data)->id;
        $result = parent::getSuccessResponse('Category saved successfully.', ['id' => $id]);
        return response()->json($result);
    }

    public function deleteMenu(Request $request) : JsonResponse
    {
        if (empty($request->categoryIDs) && empty($request->itemIDs)) {
            throw new Exception('ID(s) not found.');
        }
        if (!empty($request->categoryIDs)) {
            FoodOrderingMenuCategory::deleteItem($request->categoryIDs);
        }
        if (!empty($request->itemIDs)) {
            FoodOrderingMenuItems::deleteItem($request->itemIDs);
        }
        $result = parent::getSuccessResponse('Selected item(s) deleted successfully.');
        return response()->json($result);
    }

    public function addCategoryImages(Request $request) : JsonResponse
    {
        $result = $this->addImages($request, self::CATEGORY_IMAGES_UPLOAD_PATH, '_category_image', 750, 260);
        return response()->json($result);
    }

    public function addItemImages(Request $request) : JsonResponse
    {
        $result = $this->addImages($request, self::ITEM_IMAGES_UPLOAD_PATH, '_item_image');
        return response()->json($result);
    }

    private function addImages(Request $request, string $imagesUploadPath, string $fileNamePostfix, int $width = NULL, int $height = NULL) : array
    {
        $data = $request->all();
        $validator = Validator::make($data, [
            'app_id' => 'required|integer',
            'images' => 'required|array|max:10',
            'images.*' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE
        ], [
            'images.max' => 'You can not upload more than 10 images at once.',
            'images.*.max' => 'The :attribute size is too large.'
        ]);
        $attributeNames = [];
        for ($i = 0; $i < 10; $i++) {
            $attributeNames['images.' . $i] = 'image ' . ($i + 1);
        }
        $validator->setAttributeNames($attributeNames);
        if ($validator->fails()) {
            $messages = $validator->errors();
            if ($messages->has('images')) {
                $errors = json_encode(['images' => $messages->get('images')]);
            } else {
                $errors = $messages;
            }
            throw new Exception($errors);
        }
        $path = $imagesUploadPath . '/' . $data['app_id'];
        $fileData = [];
        foreach ($data['images'] as $key => $image) {
            $fileName = Helper::uploadImage($image, $path, $fileNamePostfix . $key, $width, $height);
            $fileData[] = [
                'name' => $data['app_id'] . '/' . $fileName,
                'url' => Helper::getStorageLocalDiskURL($path . '/' . $fileName)
            ];
        }
        return parent::getSuccessResponse('Image(s) uploaded successfully.', $fileData);
    }

    public function getCategoryImagesList(Request $request) : JsonResponse
    {
        if (!$request->appID) {
            throw new Exception('App ID not found');
        }
        $result = $this->getImageList(self::CATEGORY_IMAGES_UPLOAD_PATH, $request->appID);
        return response()->json($result);
    }

    public function getItemImagesList(Request $request) : JsonResponse
    {
        if (!$request->appID) {
            throw new Exception('App ID not found');
        }
        $result = $this->getImageList(self::ITEM_IMAGES_UPLOAD_PATH, $request->appID);
        return response()->json($result);
    }

    private function getImageList(string $imagesUploadPath, int $appID) : array
    {
        $appImagePaths = Storage::files($imagesUploadPath . '/' . $appID);
        $libraryImagePaths = Storage::files($imagesUploadPath . '/library');
        $data = ['app' => [], 'library' => []];
        for ($i = count($appImagePaths) - 1; $i >= 0; $i--) {
            $data['app'][] = [
                'url' => Helper::getStorageLocalDiskURL($appImagePaths[$i]),
                'name' => $appID . '/' . basename($appImagePaths[$i])
            ];
        }
        for ($i = count($libraryImagePaths) - 1; $i >= 0; $i--) {
            $data['library'][] = [
                'url' => Helper::getStorageLocalDiskURL($libraryImagePaths[$i]),
                'name' => $appID . '/' . basename($libraryImagePaths[$i])
            ];
        }
        return parent::getSuccessResponse(NULL, $data);
    }

    public function saveItem(Request $request) : JsonResponse
    {
        $data = $request->all();
        if (empty($data['item'])) {
            throw new Exception('Item data not found.');
        }
        $id = DB::transaction(function () use ($data) {
            $id = $this->saveItemEntity($data['item']);
            if (!empty($data['sizes'])) {
                $this->saveItemSizes($data['sizes'], $id);
            }
            if (!empty($data['options'])) {
                $this->saveItemOptions($data['options'], $id);
            }
            if (!empty($data['availabilityInfo'])) {
                $this->saveavailabilityInfo($data['availabilityInfo'], $id);
            }
            if (!empty($data['sizesToDelete'])) {
                FoodOrderingMenuItemSize::deleteItem($data['sizesToDelete']);
            }
            if (!empty($data['itemsOptionsToDelete'])) {
                FoodOrderingMenuOptionType::deleteItem($data['itemsOptionsToDelete']);
            }
            if (!empty($data['optionsToDelete'])) {
                FoodOrderingMenuOptionTypeItems::deleteItem($data['optionsToDelete']);
            }
            return $id;
        });
        $result = parent::getSuccessResponse('Item saved successfully.', ['id' => $id]);
        return response()->json($result);
    }

    private function saveItemEntity(array $data) : int
    {
        Validator::extendImplicit('sometimes_when_id_is_present', function ($attribute, $value) use ($data) {
            return isset($data[$attribute]) ? $value || $value == '0' : TRUE;
        });
        $validator = Validator::make($data, [
            'id' => 'integer',
            'category_id' => 'sometimes_when_id_is_present|required_without:id|integer|exists:' . FoodOrderingMenuCategory::TABLE . ',id',
            'name' => 'sometimes_when_id_is_present|required_without:id|max:256',
            'price' => 'sometimes_when_id_is_present|required_without:id|numeric|min:0|max:999999999999',
            'is_tax_exempted' => 'sometimes_when_id_is_present|required_without:id|boolean',
            'status' => 'in:' . FoodOrderingMenuItems::STATUS_ENABLED . ',' . FoodOrderingMenuItems::STATUS_DISABLED
        ], [
            'max' => 'The :attribute is too large.',
            'required_without' => 'The :attribute field is required.',
            'sometimes_when_id_is_present' => 'The :attribute field is required.'
        ]);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        $data['status'] = $data['status'] ?? FoodOrderingMenuItems::STATUS_ENABLED;
        return FoodOrderingMenuItems::updateOrCreate(['id' => $data['id'] ?? NULL], $data)->id;
    }

    private function saveItemSizes(array $data, int $itemID = NULL)
    {
        $validator = Validator::make($data, [
            '*.id' => 'integer',
            '*.item_id' => (!$itemID ? 'required|' : '') . 'integer|exists:' . FoodOrderingMenuItems::TABLE . ',id',
            '*.title' => 'required|max:256',
            '*.price' => 'required|numeric|min:0|max:999999999999',
        ], ['max' => 'The :attribute is too large.']);
        $attributeNames = [];
        $insertData = [];
        $updateData = [];
        foreach ($data as $key => $size) {
            $attributeNames["$key.title"] = 'size title ' . ($key + 1);
            $attributeNames["$key.price"] = 'size price ' . ($key + 1);
            $size['sort_order'] = $key + 1;
            // Add item ID to each size if it is explicitly provided.
            if ($itemID) {
                $size['item_id'] = $itemID;
            }
            if (empty($size['id'])) {
                $size['created_at'] = date('Y-m-d H:i:s');
                $size['updated_at'] = date('Y-m-d H:i:s');
                $insertData[] = $size;
            } else {
                $updateData[] = $size;
            }
        }
        $validator->setAttributeNames($attributeNames);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        if (!empty($insertData)) {
            FoodOrderingMenuItemSize::insert($insertData);
        }
        if (!empty($updateData)) {
            foreach ($updateData as $data) {
                FoodOrderingMenuItemSize::where('id', $data['id'])->update($data);
            }
        }
    }

    private function saveItemOptions(array $data, int $itemID = NULL)
    {
        $validator = Validator::make($data, [
            '*.id' => 'integer',
            //'*.item_id' => (!$itemID ? 'required|' : '') . 'integer|exists:' . FoodOrderingMenuOptionType::TABLE . ',id',
            '*.amount' => 'numeric|min:0|max:999999999999',
        ], ['max' => 'The :attribute is too large.']);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        foreach ($data as $key => $option) {
            $type_id = FoodOrderingMenuOptionType::saveItemOptionType($option['id'], $itemID, $option['title'], $option['status'], $option['is_required'] ? $option['is_required'] : 0, $option['amount'] ? $option['amount'] : 0, $key + 1);
            if($type_id) {
                foreach($option['options'] as $key => $o) {
                    if($o['title'] != '') {
                        FoodOrderingMenuOptionTypeItems::saveOptionTypeItems($o['id'], $type_id, $o['status'], $o['title'], $o['charges'], $o['is_allow_qty'], $o['max_qty'] == 'Unlimited' ? 0 : $o['max_qty'], $key + 1);
                    } 
                }
            }
        }
    }
    
    private function saveavailabilityInfo(array $data, int $itemID = NULL)
    {
        if(!empty($data['availability_type'])) {
            $availability_type = $data['availability_type'];
        } else {
            $availability_type = 0;
        }
        if(!empty($data['availability_type'])) {
            $location_id = implode($data['location_id'],',');
            $location_id = str_replace('0,','',$location_id);
            if($location_id || $availability_type != 0) {
                FoodOrderingMenuItems::updateAvailability($itemID, $location_id, $availability_type);
                if($availability_type == 2) {
                    foreach ($data['availableHours'] as $f) {
                        foreach ($f['timings'] as $h) {
                            $start_time = $h['start_time_hour'] . ':' . $h['start_time_minute'].':00';
                            $end_time = $h['end_time_hour'] . ':' . $h['end_time_minute'].':00';
                            FoodOrderingLocationsItemHours::saveFoodLocationsItemHours($h['id'], $itemID, $f['day'], $start_time, $end_time, $f['status']);
                        }
                    }
                }
            }
        }
    }

    private function saveItemImages(array $data, int $itemID = NULL)
    {
        $validator = Validator::make($data, [
            '*.id' => 'integer',
            '*.item_id' => (!$itemID ? 'required|' : '') . 'integer|exists:' . ShoppingCartItem::TABLE . ',id',
            '*.image' => 'required|max:256',
        ], ['*.image.max' => 'The :attribute name is too large.']);
        $insertData = [];
        $updateData = [];
        foreach ($data as $key => $image) {
            $image['is_primary'] = $key === 0 ? 1 : 0;
            $image['sort_order'] = $key + 1;
            // Add item ID to each option if it is explicitly provided.
            if ($itemID) {
                $image['item_id'] = $itemID;
            }
            unset($image['image_url']);
            if (empty($image['id'])) {
                $image['created_at'] = date('Y-m-d H:i:s');
                $image['updated_at'] = date('Y-m-d H:i:s');
                $insertData[] = $image;
            } else {
                $updateData[] = $image;
            }
        }
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        if (!empty($insertData)) {
            ShoppingCartItemImage::insert($insertData);
        }
        if (!empty($updateData)) {
            foreach ($updateData as $data) {
                ShoppingCartItemImage::where('id', $data['id'])->update($data);
            }
        }
    }

    public function sortCategoriesAndItems(Request $request) : JsonResponse
    {
        if (empty($request->categoryIDs) && empty($request->itemIDs)) {
            throw new Exception('No data found.');
        }
        if (!empty($request->categoryIDs)) {
            foreach ($request->categoryIDs as $index => $id) {
                $sortData[$id] = ['sort_order' => $index + 1];
            }
            FoodOrderingMenuCategory::updateMultiple($sortData);
        }
        $sortData = [];
        if (!empty($request->itemIDs)) {
            foreach ($request->itemIDs as $itemIDs) {
                foreach ($itemIDs as $index => $id) {
                    $sortData[$id] = ['sort_order' => $index + 1];
                }
            }
            FoodOrderingMenuItems::updateMultiple($sortData);
        }
        $result = parent::getSuccessResponse('Items order saved.');
        return response()->json($result);
    }
    
    public function sortOptionsTypeAndOptions(Request $request) : JsonResponse
    {
        print_r($request->all());
        // if (empty($request->categoryIDs) && empty($request->itemIDs)) {
        //     throw new Exception('No data found.');
        // }
        // if (!empty($request->categoryIDs)) {
        //     foreach ($request->categoryIDs as $index => $id) {
        //         $sortData[$id] = ['sort_order' => $index + 1];
        //     }
        //     FoodOrderingMenuCategory::updateMultiple($sortData);
        // }
        // $sortData = [];
        // if (!empty($request->itemIDs)) {
        //     foreach ($request->itemIDs as $itemIDs) {
        //         foreach ($itemIDs as $index => $id) {
        //             $sortData[$id] = ['sort_order' => $index + 1];
        //         }
        //     }
        //     FoodOrderingMenuItems::updateMultiple($sortData);
        // }
        // $result = parent::getSuccessResponse('Items order saved.');
        // return response()->json($result);
    }

    public function getItemDetails(Request $request) : JsonResponse
    {
        if (!is_numeric($request->id)) {
            throw new Exception('Invalid ID.');
        }
        $itemData = FoodOrderingMenuItems::getData($request->id);
        $menuOptionType = FoodOrderingMenuOptionType::getItemOptionsByItemID($request->id);
        $availabilityInfo = array();
        $availabalityData = FoodOrderingMenuItems::getAvailabilityData($request->id);
        $availabilityInfo['location_id'] = explode(',', $availabalityData['location_availability']);
        $availabilityInfo['availability_type'] = $availabalityData['availability_type'];
        $day_names = array('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
        $availabilityHours = FoodOrderingLocationsItemHours::getData($request->id);
        foreach ($availabilityHours as $f) {
            $i = 0;
            foreach ($day_names as $day) {
                $timeArr = array();
                $result = FoodOrderingLocationsItemHours::getItemHoursData($f['item_id'], $day);
                $j = 0;
                foreach ($result as $r) {
                    $start_time_hour = substr($r['start_time'], 0, 2);
                    $start_time_minute = substr($r['start_time'], 3, 2);
                    $end_time_hour = substr($r['end_time'], 0, 2);
                    $end_time_minute = substr($r['end_time'], 3, 2);
                    $timeArr[$j]['id'] = $r['id'];
                    $timeArr[$j]['start_time_hour'] = $start_time_hour;
                    $timeArr[$j]['start_time_minute'] = $start_time_minute;
                    $timeArr[$j]['end_time_hour'] = $end_time_hour;
                    $timeArr[$j]['end_time_minute'] = $end_time_minute;
                    $timeArr[$j]['option'] = 0;
                    $j++;
                }
                $availabilityHours[$i]['timings'] = $timeArr;
                $i++;
            }
        }
        $availabilityInfo['availableHours'] = $availabilityHours;
        foreach($menuOptionType as $m) {
            $menuOptions = FoodOrderingMenuOptionTypeItems::getOptionsItems($m['id']);
            $m->options = $menuOptions;
        }
        $result = parent::getSuccessResponse(NULL, [
            'item' => $itemData,
            'images' => FoodOrderingMenuItems::getImagesByItemID($itemData['category_id']),
            'sizes' => FoodOrderingMenuItemSize::getSizesByItemID($request->id),
            'options' => $menuOptionType,
            'availabilityInfo' => $availabilityInfo
        ]);
        return response()->json($result);
    }

    public function deleteCategoryImage(Request $request) : JsonResponse
    {
        if (empty($request->imageName)) {
            throw new Exception('Image name not found.');
        }
        if (FoodOrderingMenuCategory::isImageInUse($request->imageName)) {
            throw new Exception('Can\'t delete. Image is already in use.');
        }
        $imagePath = Storage::getAdapter()->getPathPrefix() . self::CATEGORY_IMAGES_UPLOAD_PATH . '/' . $request->imageName;
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
        $result = parent::getSuccessResponse('Image deleted successfully.');
        return response()->json($result);
    }

    public function deleteItemImage(Request $request) : JsonResponse
    {
        if (empty($request->imageName)) {
            throw new Exception('Image name not found.');
        }
        if (FoodOrderingMenuItems::isImageInUse($request->imageName)) {
            throw new Exception('Can\'t delete. Image is already in use.');
        }
        $imagePath = Storage::getAdapter()->getPathPrefix() . self::ITEM_IMAGES_UPLOAD_PATH . '/' . $request->imageName;
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
        $result = parent::getSuccessResponse('Image deleted successfully.');
        return response()->json($result);
    }

    public function inventoryItems(Request $request) {
        $result = parent::getSuccessResponse(NULL, [
            'categoryItems' => ShoppingCartItem::getCategoryItems($request->id)
        ]);
        return response()->json($result);
    }

    public function getCategoriesForApp(Request $request): JsonResponse {
        $result = parent::getSuccessResponse(NULL, [
            'categories' => FoodOrderingMenuCategory::getEnabledCategories($request->tabID, $request->locationID)
        ]);
        return response()->json($result);
    }

    public function getItemsForApp(Request $request): JsonResponse {
        $result = parent::getSuccessResponse(NULL, [
            'items' => FoodOrderingMenuItems::getItemsForApp($request->categoryID, $request->locationID)
        ]);
        return response()->json($result);
    }

    public function getItemDetailsForApp(Request $request): JsonResponse
    {
        if (!is_numeric($request->id)) {
            throw new Exception('Invalid ID.');
        }
        $result = parent::getSuccessResponse(NULL, [
            'item' => FoodOrderingMenuItems::getItemDetail($request->id),
            'sizes' => FoodOrderingMenuItemSize::getSizesByItemID($request->id),
            'optionTypes' => FoodOrderingMenuOptionType::getEnabledOptionTypes($request->id),
            'options' => FoodOrderingMenuOptionTypeItems::getEnabledOptionsByItemID($request->id),
        ]);
        return response()->json($result);
    }
    

}