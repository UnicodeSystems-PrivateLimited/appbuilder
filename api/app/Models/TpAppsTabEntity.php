<?php

namespace App\Models;

use App\Http\Controllers\TabFunctions\ShoppingCartInventoryController;
use App\Models\TabFunctions\ShoppingCartDelivery;
use App\Models\TabFunctions\ShoppingCartPayment;
use App\Models\TabFunctions\ShoppingCartShippingCharges;
use App\Models\TabFunctions\ShoppingCartEmail;
use App\Models\TabFunctions\ShoppingCartCustomGuides;
use App\Models\TabFunctions\FoodOrderingServices;
use App\Models\TabFunctions\FoodOrderingPayment;
use App\Models\TabFunctions\FoodOrderingEmail;
use App\Models\TabFunctions\FoodOrderingCustomGuides;
use Illuminate\Database\Eloquent\Model;
use DB;

class TpAppsTabEntity extends Model {

    protected $table = 'tp_apps_tabs_entity';
    protected $guarded = ['id'];

    const STATUS_ENABLED = 1;
    const STATUS_DISABLED = 2;
    const ICON_TYPE_CUSTOM = 1;
    const ICON_TYPE_PREDEFINED = 2;
    const TABLE = 'tp_apps_tabs_entity';
    const TAB_FUNCTION_TABLE = 'mst_tp_tab_entity';
    const APPS_TABLE = 'tp_apps_entity';
    const IMAGE_TABLE = 'mst_user_images';
    const LIBRARY_TABLE = 'mst_library_images';
    const WEBSITE_TAB_FUNCTION_CODE = 'website_tab';
    const PDF_TAB_FUNCTION_CODE = 'pdf_tab';

    public static function getActiveInactiveTabs($appId = NULL, $all = NULL) {
        $iconPath = url('/storage/app/public/icons');
        $result = DB::table(self::TABLE . ' as main')
                ->select('main.id', 'main.title', 'func.tab_name as tab_func_name', 'main.icon_name', 'main.status', 'main.type', 'main.icon_type')
                ->join(self::TAB_FUNCTION_TABLE . ' as func', 'func.id', '=', 'main.tab_func_id')
                ->where('main.app_id', $appId)
                ->orderBy(DB::raw('(main.content_sort_order=0)'), 'ASC')
                ->orderBy('main.content_sort_order', 'ASC')
                ->orderBy('main.id', 'ASC')
                ->get();
        $returnArray = [
            'active' => [],
            'inactive' => [],
        ];
        if ($all) {
            return $result;
        } else {
            foreach ($result as $value) {
                $value->icon_src = $iconPath . '/' . $value->icon_name;
                $returnArray[$value->status == self::STATUS_ENABLED ? 'active' : 'inactive'][] = $value;
            }
            return $returnArray;
        }
    }

    public static function getAppTabInfo($tabId) {
        $path = url('/storage/app/public/icons');
        return DB::table(self::TABLE . ' as main')
                        ->select(DB::raw("main.id,main.app_id,main.title, main.icon_name, main.type,main.icon_type, main.tab_func_id, func.tab_name as tab_func_name, CONCAT('$path','/',main.icon_name) as src, main.status, main.settings"))
                        ->join(self::TAB_FUNCTION_TABLE . ' as func', 'func.id', '=', 'main.tab_func_id')
                        ->where('main.id', $tabId)
                        ->first();
    }

    public static function updateMultiple(array $data, $updateKey = 'id') {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                DB::table(self::TABLE)->where($updateKey, $key)->update($value);
            }
        });
    }

    public static function deleteAppTab($tabId) {
        if (!is_array($tabId)) {
            $tabId = [$tabId];
        }
        return DB::table(self::TABLE)->whereIn('id', $tabId)->delete();
    }

    public static function updateStatuses(array $ids, $status) {
        DB::table(self::TABLE)->whereIn('id', $ids)
                ->update([
                    'status' => $status,
                    'sort_order' => 0,
        ]);
    }

    public static function getTabsToCopy(array $ids) {
        return DB::table(self::TABLE . ' as main')
                        ->select('main.id', 'main.tab_func_id', 'main.title', 'main.sort_order', 'main.icon_name', 'main.type', 'main.status', 'func.tab_code as tab_func_code')
                        ->join(self::TAB_FUNCTION_TABLE . ' as func', 'func.id', '=', 'main.tab_func_id')
                        ->whereIn('main.id', $ids)
                        ->get();
    }

    public static function getAppTabsForContent($appId) {
        $iconPathUrl = url('/storage/app/public/icons');
        return DB::table(self::TABLE . ' as main')
                        ->select('main.id', 'main.title', 'main.icon_name', 'main.type', 'main.icon_type', 'main.tab_func_id', 'main.background_image', 'main.tablet_bg_img', 'main.iphone_bg_img', 'func.tab_code as tab_func_code', 'main.status', DB::raw("CONCAT('$iconPathUrl','/',main.icon_name) as icon_src"), 'main.settings')
                        ->join(self::TAB_FUNCTION_TABLE . ' as func', 'func.id', '=', 'main.tab_func_id')
                        ->where('main.app_id', $appId)
                        ->orderBy(DB::raw('(main.status=' . self::STATUS_ENABLED . ')'), 'DESC')
                        ->orderBy(DB::raw('(main.content_sort_order=0)'), 'ASC')
                        ->orderBy('main.content_sort_order', 'ASC')
                        ->orderBy('main.id', 'ASC')
                        ->get();
    }

    public static function getEnabledAppTabsForContent($appCodeOrId, $status = self::STATUS_ENABLED, bool $findByAppCode = TRUE) {
        $path = url('/storage/app/public/icons');
        $bgImagePath = url('/storage/app/public/display/user_images');
        $query = DB::table(self::TABLE . ' as main')
                ->select(DB::raw("main.id, main.title, main.type,main.icon_type, main.icon_name, main.settings, CONCAT('$bgImagePath', '/', (IF(image.lib_img_id IS NULL, image.name, lib.name))) as bgImage, func.tab_code as tab_func_code," . self::getTabletBackgroundSelector($bgImagePath) . "," . self::getIphone4BackgroundSelector($bgImagePath) . ", CONCAT('$path','/',main.icon_name) as icon_src"))
                ->join(self::TAB_FUNCTION_TABLE . ' as func', 'func.id', '=', 'main.tab_func_id')
                ->join(self::APPS_TABLE . ' as app', 'app.id', '=', 'main.app_id')
                ->leftJoin(self::IMAGE_TABLE . ' as image', 'image.id', '=', 'main.background_image')
                ->leftJoin(self::LIBRARY_TABLE . ' as lib', 'image.lib_img_id', '=', 'lib.id')
                ->leftJoin(self::IMAGE_TABLE . ' as tablet_bg_img', 'tablet_bg_img.id', '=', 'main.tablet_bg_img')
                ->leftJoin(self::LIBRARY_TABLE . ' as tablet_bg_lib', 'tablet_bg_img.lib_img_id', '=', 'tablet_bg_lib.id')
                ->leftJoin(self::IMAGE_TABLE . ' as iphone4_bg_img', 'iphone4_bg_img.id', '=', 'main.iphone_bg_img')
                ->leftJoin(self::LIBRARY_TABLE . ' as iphone4_bg_lib', 'iphone4_bg_img.lib_img_id', '=', 'iphone4_bg_lib.id');

        if ($findByAppCode) {
            $query->where('app.app_code', $appCodeOrId);
        } else {
            $query->where('main.app_id', $appCodeOrId);
        }

        return $query->where('main.status', $status)
                        ->orderBy(DB::raw('(main.content_sort_order=0)'), 'ASC')
                        ->orderBy('main.content_sort_order', 'ASC')
                        ->orderBy('main.id', 'ASC')
                        ->get();
    }

    public static function getAppTabsForMembership($appId) {
        return DB::table(self::TABLE . ' as main')
                        ->select(DB::raw("main.id, main.title"))
                        ->leftjoin(self::TAB_FUNCTION_TABLE . ' as func', 'main.tab_func_id', '=', 'func.id')
                        ->where('main.app_id', $appId)
                        ->where('main.status', 1)
                        ->where('func.tab_code', '<>', 'membership')
                        ->orderBy('title', 'ASC')
                        ->get();
    }

    public static function getAppDetails($tab_id) {
        return DB::table(self::TABLE . ' as main')
                        ->select('main.app_id', 'app.app_name')
                        ->join(self::APPS_TABLE . ' as app', 'app.id', '=', 'main.app_id')
                        ->where('main.id', $tab_id)
                        ->first();
    }

    public static function getAppTabDetail($app_id, $tab_func_id) {
        return DB::table(self::TABLE . ' as main')
                        ->select('main.id', 'main.app_id', 'main.tab_func_id', 'func.tab_code as tab_func_code')
                        ->join(self::TAB_FUNCTION_TABLE . ' as func', 'func.id', '=', 'main.tab_func_id')
                        ->where('app_id', $app_id)
                        ->where('tab_func_id', $tab_func_id)
                        ->first();
    }

    public static function getSettings($tab_id) {
        return DB::table(self::TABLE . ' as main')
                        ->select('main.settings')
                        ->where('main.id', $tab_id)
                        ->first();
    }

    public static function getAppTabs($app_id, $tab_func_id) {
        return self::select(DB::raw("`id`, `app_id`"))
                        ->where('app_id', $app_id)
                        ->where('tab_func_id', $tab_func_id)
                        ->get();
    }

    //get flag for phone,tablet,iphone
    public static function getBgImageFlags($tab_id) {
        return DB::table(self::TABLE . ' as main')
                        ->select('main.flag_phone_img', 'main.flag_tablet_img', 'main.flag_iphone_img')
                        ->where('main.id', $tab_id)
                        ->first();
    }

    public static function getTabletBackgroundSelector(string $path) {
        return "CONCAT('$path', '/', (IF(tablet_bg_img.lib_img_id IS NULL, tablet_bg_img.name, tablet_bg_lib.name))) as tablet_bg_img";
    }

    public static function getIphone4BackgroundSelector(string $path) {
        return "CONCAT('$path', '/', (IF(iphone4_bg_img.lib_img_id IS NULL, iphone4_bg_img.name, iphone4_bg_lib.name))) as iphone4_bg_img";
    }

    public static function getAppIdDetails($tab_id) {
        return self::select('id', 'app_id')
                        ->where('id', $tab_id)
                        ->first();
    }

    public static function getAppTabsForSubmittedData($app_id, $tab_func_id) {
        return self::select(DB::raw("`id`,`tab_func_id`"))
                        ->where('app_id', $app_id)
                        ->where('tab_func_id', $tab_func_id)
                        ->pluck('id')->toArray();
    }

    public static function getMembershipTabInfoByAppId($appId) {
        return DB::table(self::TABLE . ' as main')
                        ->select(DB::raw("main.id,main.app_id,main.title, main.icon_name, main.tab_func_id, func.tab_name as tab_func_name, main.status, main.settings"))
                        ->join(self::TAB_FUNCTION_TABLE . ' as func', 'func.id', '=', 'main.tab_func_id')
                        ->where('main.app_id', $appId)
                        ->where('main.tab_func_id', 28)
                        ->first();
    }

    public static function getAppTabsForEmailMarketting($appId) {
        return DB::table(self::TABLE . ' as main')
                        ->select(DB::raw("main.id as value, main.title as label"))
                        ->leftjoin(self::TAB_FUNCTION_TABLE . ' as func', 'main.tab_func_id', '=', 'func.id')
                        ->where('main.app_id', $appId)
                        ->where('main.status', 1)
                        ->where('func.tab_code', '<>', 'membership')
                        ->orderBy('title', 'ASC')
                        ->get();
    }

    public static function storeDefaultShoppingCartData(int $tabID) {
        $settings = [
            'go_back_prompt' => FALSE,
            'shipping_instruction' => FALSE,
            'category_view_display' => ShoppingCartInventoryController::CATEGORY_VIEW_DISPLAY_GRID
        ];

        $paymentData = [
            'tab_id' => $tabID,
            'currency' => 'USD',
            'payment_gateway' => FoodOrderingPayment::PAYMENT_GATEWAY_NONE,
            'is_cash' => 0,
        ];

        $deliveryData = [
            'tab_id' => $tabID,
            'is_pickup_method' => TRUE,
            'is_digital_method' => TRUE,
            'is_shipping_method' => TRUE,
            'shipping_minimum' => 0,
            'free_shipping_amount' => 0,
            'shipping_days' => 5,
            'is_shipping_fee_taxable' => FALSE,
            'is_delivery_address_validation' => TRUE
        ];

        $shippingCharge = [
            'tab_id' => $tabID,
            'country' => 1,
            'price' => 0
        ];

        //Qadir Work for cart creation//

        $cartConfirmationEmail = [
            'tab_id' => $tabID,
            'subject' => "New order has been placed.",
            'type' => 1,
            'template' => '<p><strong>Order Number:&nbsp;</strong>{ORDER_NO}</p><hr><p>{ORDEREDITEMS_LIST}{TAX}</p><hr><p><strong>Shipping Charges:&nbsp;</strong>{SHIPPING_CHARGES}</p><p><strong>Total :</strong> {ORDER_TOTAL}</p><p><strong>Items Total :</strong> {TOTAL}</p><p><strong>Order Created on :</strong> {ORDER_TIME}</p><p><strong>Shipping Address</strong>:</p><p>{SHIPPING_ADDRESS}</p><p><strong>Delivery type</strong>:{DELIVERY_TYPE}</p>',
        ];

        $cartAdminReceipt = [
            'tab_id' => $tabID,
            'subject' => "New order has been placed.",
            'type' => 2,
            'template' => '<p><strong>Order Number:&nbsp;</strong>{ORDER_NO}</p><hr><p>{ORDEREDITEMS_LIST}{TAX}</p><hr><p><strong>Shipping Charges:&nbsp;</strong>{SHIPPING_CHARGES}</p><p><strong>Total :</strong> {ORDER_TOTAL}</p><p><strong>Items Total :</strong> {TOTAL}</p><p><strong>Order Created on :</strong> {ORDER_TIME}</p><p><strong>Shipping Address</strong>:</p><p>{SHIPPING_ADDRESS}</p><p><strong>Delivery type</strong>:{DELIVERY_TYPE}</p>',
        ];

        $cartCustomGuides = [
            'tab_id' => $tabID,
            'shipping_method' => "Delivery",
            'pickup_method' => "Take Out",
            'digital_method' => "Dine In",
            'card' => "Card",
            'cash' => "Cash",
            'order_items_list_template' => '<p><strong>Details</strong> : {ORDER_NAME} ({CURRENCY}{COST})</p><p><strong>Options</strong> : {OPTIONS}</p><p><strong>Qty</strong> : {QUANTITY}</p><p><strong>Special Notes&nbsp;</strong>: {ORDER_NOTE}</p>',
        ];

        //Qadir Work for cart creation//

        DB::transaction(function () use ($tabID, $settings, $paymentData, $deliveryData, $shippingCharge, $cartConfirmationEmail, $cartAdminReceipt, $cartCustomGuides) {
            self::where('id', $tabID)->update(['settings' => json_encode($settings)]);
            ShoppingCartPayment::create($paymentData);
            ShoppingCartDelivery::create($deliveryData);
            ShoppingCartShippingCharges::create($shippingCharge);
            ShoppingCartEmail::create($cartConfirmationEmail);
            ShoppingCartEmail::create($cartAdminReceipt);
            ShoppingCartCustomGuides::create($cartCustomGuides);
        });
    }

    public static function storeDefaultFoodOrderingData(int $tabID) {
        $servicesData = [
            'tab_id' => $tabID,
            'dine_in' => TRUE,
            'take_out' => TRUE,
            'take_out_days' => 0,
            'delivery' => TRUE,
            'delivery_days' => 0,
            'delivery_address_validation' => TRUE,
            'delivery_radius' => 20,
            'delivery_radius_type' => 1,
            'delivery_minimum' => 10,
            'delivery_price_fee' => 0,
            'delivery_price_fee_taxable' => TRUE,
            'free_delivery_amount' => 100,
            'lead_time' => 30,
            'convenience_fee' => 0,
            'convenience_fee_taxable' => TRUE
        ];

        $settings = [
            'category_view_display' => 1,
            'start_order_button' => 'Order Now',
            'order_service_type' => 1,
            'url_2' => null,
            'url_3' => null,
            'url_4' => null,
            'url_5' => null,
            'url_6' => null,
            'url_7' => null,
            'url_8' => null,
        ];

        $paymentData = [
            'tab_id' => $tabID,
            'currency' => 'USD',
            'payment_gateway' => ShoppingCartPayment::PAYMENT_GATEWAY_NONE,
            'is_cash' => 1,
            'is_card' => 0
        ];

        $foodConfirmationEmail = [
            'tab_id' => $tabID,
            'subject' => "New order has been placed.",
            'type' => 1,
            'template' => '<p><strong>Order Number:&nbsp;</strong>{ORDER_NO}</p><p><strong>Place Time:&nbsp;</strong>{PLACE_TIME}</p><hr><p>{ORDEREDITEMS_LIST}{TAX}</p><hr><p><strong>Total :</strong> {ORDER_TOTAL}</p><p><strong>Items Total :</strong> {TOTAL}</p><p><strong>Paid :</strong> {CHECKOUT_METHOD}</p><p><strong>Order Created on :</strong> {ORDER_TIME}</p><p>{ORDER_ADDRESS_1} {ORDER_ADDRESS_2}</p><p>{ORDER_CITY} {ORDER_STATE} {ORDER_ZIP}</p><p><strong>Ordered for :</strong> {ORDER_TYPE}</p><p><strong>Contact Information :</strong></p><p>{DELIVERY_NAME}<br>{DELIVERY_PHONE}<br>{DELIVERY_EMAIL}<br>{DELIVERY_ADDRESS_1} {DELIVERY_ADDRESS_2}<br>{DELIVERY_CITY} {DELIVERY_STATE} {DELIVERY_ZIP}</p>',
        ];

        $foodAdminReceipt = [
            'tab_id' => $tabID,
            'subject' => "New order has been placed.",
            'type' => 2,
            'template' => '<p><strong>Order Number:&nbsp;</strong>{ORDER_NO}</p><p><strong>Place Time:&nbsp;</strong>{PLACE_TIME}</p><hr><p>{ORDEREDITEMS_LIST}{TAX}</p><hr><p><strong>Total :</strong> {ORDER_TOTAL}</p><p><strong>Items Total :</strong> {TOTAL}</p><p><strong>Paid :</strong> {CHECKOUT_METHOD}</p><p><strong>Order Created on :</strong> {ORDER_TIME}</p><p>{ORDER_ADDRESS_1} {ORDER_ADDRESS_2}</p><p>{ORDER_CITY} {ORDER_STATE} {ORDER_ZIP}</p><p><strong>Ordered for :</strong> {ORDER_TYPE}</p><p><strong>Contact Information :</strong></p><p>{DELIVERY_NAME}<br>{DELIVERY_PHONE}<br>{DELIVERY_EMAIL}<br>{DELIVERY_ADDRESS_1} {DELIVERY_ADDRESS_2}<br>{DELIVERY_CITY} {DELIVERY_STATE} {DELIVERY_ZIP}</p>',
        ];

        $foodCustomGuides = [
            'tab_id' => $tabID,
            'shipping_method' => "Delivery",
            'pickup_method' => "Take Out",
            'digital_method' => "Dine In",
            'card' => "Card",
            'cash' => "Cash",
            'order_items_list_template' => '<p><strong>Details</strong> : {ORDER_NAME} ({CURRENCY}{COST})</p><p><strong>Options</strong> : {OPTIONS}</p><p><strong>Qty</strong> : {QUANTITY}</p><p><strong>Special Notes&nbsp;</strong>: {ORDER_NOTE}</p>',
        ];

        DB::transaction(function () use ($tabID, $settings, $paymentData, $servicesData, $foodConfirmationEmail, $foodAdminReceipt, $foodCustomGuides) {
            self::where('id', $tabID)->update(['settings' => json_encode($settings)]);
            FoodOrderingServices::create($servicesData);
            FoodOrderingPayment::create($paymentData);
            FoodOrderingEmail::create($foodConfirmationEmail);
            FoodOrderingEmail::create($foodAdminReceipt);
            FoodOrderingCustomGuides::create($foodCustomGuides);
        });
    }

    public static function updateSettings(array $data, int $tabID) {
        $settings = self::getSettings($tabID);
        if (empty($settings)) {
            throw new \Exception('Tab ID doesn\'t exist');
        }
        $settings = json_decode($settings->settings, TRUE) ?? [];
        $data = array_merge($settings, $data);
        TpAppsTabEntity::where('id', $tabID)->update(['settings' => json_encode($data)]);
    }

    public static function getWebsiteAndPDFTabIDs(int $appID): array {
        $result = DB::table(self::TABLE . ' as main')
                ->join(self::TAB_FUNCTION_TABLE . ' as func', 'main.tab_func_id', '=', 'func.id')
                ->where('main.app_id', $appID)
                ->where('main.status', self::STATUS_ENABLED)
                ->where(function ($query) {
                    $query->where('func.tab_code', '=', self::WEBSITE_TAB_FUNCTION_CODE)
                    ->orWhere('func.tab_code', '=', self::PDF_TAB_FUNCTION_CODE);
                })
                ->pluck('main.id');
        return $result ?? [];
    }

    public static function getInboxTab(int $appID) {
        return DB::table(self::TABLE . ' as main')
                        ->select(DB::raw("main.id, main.title, main.type,main.icon_type, main.icon_name, main.settings, func.tab_code as tab_func_code"))
                        ->join(self::TAB_FUNCTION_TABLE . ' as func', 'func.id', '=', 'main.tab_func_id')
                        ->where('main.app_id', $appID)
                        ->where('func.tab_code', 'inbox')
                        ->where('main.status', self::STATUS_ENABLED)
                        ->first();
    }

    //Qadir Work Delete Color Icon Code Start//

    public static function checkIconExist($icon_name) {
        return $query = self::select('id')
                ->where('icon_name', 'like', $icon_name)
                ->first();
    }

    //Qadir Work Delete Color Icon Code End//

    public static function getAppTabsForTransactionsTab($app_id, $tab_func_id) {
        return self::select(DB::raw("`id`,`title`"))
                        ->where('app_id', $app_id)
                        ->where('tab_func_id', $tab_func_id)
                        ->get();
    }

}
