<?php

namespace App\Http\Controllers\TabFunctions;

use App\Helpers\Country;
use App\Helpers\Currency;
use App\Http\Controllers\Controller;
use App\Models\TabFunctions\FoodOrderingServices;
use App\Models\TabFunctions\FoodOrderingPayment;
use App\Models\TabFunctions\FoodOrderingPaymentTaxDetails;
use App\Models\TabFunctions\FoodOrderingEmail;
use App\Models\TabFunctions\FoodOrderingCustomGuides;
use App\Models\TabFunctions\FoodOrderingLocations;
use App\Models\TabFunctions\FoodOrderingLocationsHours;
use App\Models\TabFunctions\EventsTimeZone;
use App\Models\TabFunctions\FoodOrderingMenuCategory;
use App\Models\TabFunctions\FoodOrderingMenuItems;
use App\Models\TabFunctions\FoodOrderingMenuOptionTypeItems;
use App\Models\TabFunctions\FoodOrderingMenuItemSize;
use App\Models\TpAppsTabEntity;
use App\Models\TabFunctions\ContactUs;
use App\Models\TabFunctions\FoodOrders;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use App\Models\MstTpTabEntity;
use Illuminate\Pagination\Paginator;
use Mail;
use App\Models\TpLogActivity;

class FoodOrderingController extends Controller
{

    const PAYMENT_GATEWAY_CREDENTIAL_FIELDS = [
        FoodOrderingPayment::PAYMENT_GATEWAY_AUTHORIZE_NET => ['api_login_id', 'transaction_key'],
        FoodOrderingPayment::PAYMENT_GATEWAY_PAYPAL => ['api_username', 'api_password', 'signature'],
        FoodOrderingPayment::PAYMENT_GATEWAY_STRIPE => ['api_secret_key']
    ];

    public function init(Request $request)
    {
        if (empty($request->tabID)) {
            throw new Exception('Tab ID not found.');
        }
        $payment = FoodOrderingPayment::getData($request->tabID);
        $payment->payment_gateway_credentials = json_decode($payment->payment_gateway_credentials);
        $foodEmailData = FoodOrderingEmail::getFoodEmail($request->tabID);
        $foodlocationInfoData = FoodOrderingLocations::getData($request->tabID);
        $result = parent::getSuccessResponse(null, [
            'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabID),
            'timeZoneList' => EventsTimeZone::timezoneList(),
            'currencyOptions' => Currency::getCurrencyOptions(),
            'paymentGatewayOptions' => FoodOrderingPayment::getPaymentGatewayOptions(),
            'payment' => $payment,
            'foodlocationInfoData' => $foodlocationInfoData,
            'taxMethodOptions' => FoodOrderingPaymentTaxDetails::getTaxMethodOptions(),
            'taxAmountList' => FoodOrderingPaymentTaxDetails::getAllTaxDetails($request->tabID),
            'currencySymbolList' => Currency::CURRENCY_SYMBOL_LIST,
            'countryList' => Country::COUNTRY_LIST,
            'contactList' => ContactUs::getLocationListByAppId(TpAppsTabEntity::find($request->tabID)->app_id),
            'services' => FoodOrderingServices::getData($request->tabID),
            'foodConfirmation' => $foodEmailData[0] ?? [],
            'foodAdminreceipt' => $foodEmailData[1] ?? [],
            'foodCustomGuides' => FoodOrderingCustomGuides::getFoodCustomeGuides($request->tabID) ?? [],
            'categoryList' => FoodOrderingMenuCategory::getAll($request->tabID),
            'itemList' => FoodOrderingMenuItems::getAll($request->tabID),
        ]);
        return response()->json($result);
    }

    public function saveSettings(Request $request)
    {
        if (empty($request->tabID)) {
            throw new Exception('Tab ID not found.');
        }
        if (empty($request->start_order_button)) {
            throw new Exception('Order Button not found.');
        }
        $settings = $request->only('start_order_button', 'category_view_display', 'order_service_type', 'url_2', 'url_3', 'url_4', 'url_5', 'url_6', 'url_7', 'url_8');
        $validator = Validator::make($settings, [
            'url_2' => 'url',
            'url_3' => 'url',
            'url_4' => 'url',
            'url_5' => 'url',
            'url_6' => 'url',
            'url_7' => 'url',
            'url_8' => 'url',
        ], [
            'url' => 'Enter Valid URL.'
        ]);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        if ($settings['order_service_type'] != 1) {
            $url = 'url_' . $settings['order_service_type'];
            if (!empty($settings[$url])) {
                $settings['iframe_' . $settings['order_service_type']] = $this->canOpenInIframe($settings[$url]);
            } else {
                $settings['iframe_' . $settings['order_service_type']] = false;
            }
        }
        TpAppsTabEntity::updateSettings($settings, $request->tabID);
        $result = parent::getSuccessResponse('Settings updated successfully.');
        return response()->json($result);
    }

    public function savePayment(Request $request)
    {
        $data = $request->all();
        $rules = [
            'id' => 'required|integer',
            'tab_id' => 'integer',
            'currency' => 'required',
            'is_cash' => 'boolean',
            'is_card' => 'boolean'
        ];
        foreach (self::PAYMENT_GATEWAY_CREDENTIAL_FIELDS as $gateway => $fields) {
            foreach ($fields as $field) {
                $rules['payment_gateway_credentials.' . $field] = 'required_if:payment_gateway,' . $gateway;
            }
        }
        $gatewayCredentialAttributeNames = self::getGatewayAttributeNames();
        $validator = Validator::make($data, $rules, [
            'is_cash.boolean' => 'Invalid value provided for cash field.',
            'required_if' => 'The :attribute field is required'
        ]);
        $validator->setAttributeNames($gatewayCredentialAttributeNames);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        $data['payment_gateway_credentials'] = !empty($data['payment_gateway_credentials']) ? json_encode($data['payment_gateway_credentials']) : null;
        FoodOrderingPayment::where('id', $data['id'])->update($data);
        $result = parent::getSuccessResponse('Payment options saved successfully.');
        return response()->json($result);
    }

    private static function getGatewayAttributeNames() : array
    {
        $attributeNames = [];
        foreach (self::PAYMENT_GATEWAY_CREDENTIAL_FIELDS as $gateway => $fields) {
            foreach ($fields as $field) {
                $attributeNames['payment_gateway_credentials.' . $field] = str_replace('_', ' ', $field);
            }
        }
        return $attributeNames;
    }

    public function saveTaxDetails(Request $request)
    {
        $data = $request->all();
        Validator::extend('rate', function ($attribute, $value) use ($data) {
            if ($data['tax_method'] == FoodOrderingPaymentTaxDetails::TAX_METHOD_BY_RATE) {
                return $value <= 100;
            }
            return true;
        });
        $validator = Validator::make($data, [
            'id' => 'integer',
            'tab_id' => 'required|integer',
            'tax_name' => 'required|max:255',
            'tax_method' => 'required|integer',
            'tax_value' => 'required|numeric|rate|min:0|max:999999999999.99'
        ], [
            'tax_value.max' => 'The tax rate/value is too large.',
            'tax_value.rate' => 'Invalid tax rate (%)'
        ]);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        $id = FoodOrderingPaymentTaxDetails::updateOrCreate(['id' => $data['id'] ?? null], $data)->id;
        $result = parent::getSuccessResponse('Tax amount saved successfully.', ['id' => $id]);
        return response()->json($result);
    }

    public function deleteTaxDetails(Request $request)
    {
        if (empty($request->ids)) {
            throw new Exception('ID(s) not found.');
        }
        FoodOrderingPaymentTaxDetails::deleteTax($request->ids);
        $result = parent::getSuccessResponse('Tax amount(s) successfully deleted.');
        return response()->json($result);
    }

    public function getContactSingleData(Request $request)
    {
        if (empty($request->id)) {
            throw new Exception('ID not found.');
        }
        $data = ContactUs::getContactUsLocationEventsInfo($request->id);
        $data = [
            'contactList' => ContactUs::getContactUsLocationEventsInfo($request->id)
        ];

        $result = parent::getSuccessResponse(null, $data);
        return response()->json($result);
    }

    public function appInit(Request $request) : JsonResponse
    {
        $result = parent::getSuccessResponse(null, [
            'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabID),
            'services' => FoodOrderingServices::getData($request->tabID),
            'payment' => FoodOrderingPayment::getData($request->tabID),
            'taxAmountList' => FoodOrderingPaymentTaxDetails::getAllTaxDetails($request->tabID),
            'pastOrdersList' => !empty($request->deviceUUID) ? FoodOrders::getPastOrders($request->tabID, $request->deviceUUID) : []
        ]);
        return response()->json($result);
    }

    public function currencyItems() : JsonResponse
    {
        $result = parent::getSuccessResponse(null, [
            'currencySymbolList' => Currency::CURRENCY_SYMBOL_LIST
        ]);
        return response()->json($result);
    }

    public function addOrder(Request $request) : JsonResponse
    {
        $data = $request->all();
        $validator = Validator::make($data, [
            'id' => 'integer',
            'tab_id' => 'required|integer',
            'location_id' => 'required|integer',
            'tip' => 'max:512',
            'type' => 'required|integer',
            'total_price' => 'required|numeric|min:0|max:999999999999',
            'total_charges' => 'required|numeric|min:0|max:999999999999',
            'payment_method' => 'required|integer',
            'contact' => 'required',
            'convenience_fee' => 'required|numeric|min:0|max:999999999999',
            'order_status' => 'required|integer',
            'paid_status' => 'required|integer',
            'datetime' => 'required',
            'items' => 'required',
            'contact.email' => 'email',
            'is_email_receipt' => 'required|boolean',
            'is_order_placed' => 'required|boolean',
            'delivery_charges' => 'numeric|min:0|max:999999999999',
            'free_delivery_amount' => 'numeric|min:0|max:999999999999',
            'convenience_fee_taxable' => 'required|boolean',
            'delivery_price_fee_taxable' => 'required|boolean'
        ]);
        if ($validator->fails()) {
            throw new Exception($validator->errors()->first());
        }

        $appIdDetails = TpAppsTabEntity::getAppIdDetails($request->tab_id);
        //Save Food Order Made Activity
        $activityData['app_id'] = $appIdDetails->app_id;
        $activityData['main_dashboard'] = 0;
        $activityData['app_dashboard'] = 1;
        $activityData['activity'] = "Order Made.";
        $activityData['activity_type'] = 4;

        $foodEmailData = FoodOrderingEmail::getFoodEmail($data['tab_id']);
        if (!empty($data['is_order_placed'])) {
            
            if ($data['is_email_receipt'] && !empty($data['contact']['email'])) {
                $userTemplate = $this->sendUserEmail($data);
            }
            if (isset($foodEmailData[1]['admin_email']) && $foodEmailData[1]['admin_email'] != '') {
                $adminTemplate = $this->sendAdminEmail($data);
            }
        }
        $contactEmail = $data['contact']['email'] ?? null;
        $data['tip'] = !empty($data['tip']) ? json_encode($data['tip']) : null;
        $data['tax_list'] = !empty($data['tax_list']) ? json_encode($data['tax_list']) : null;
        $data['contact'] = json_encode($data['contact']);
        $data['items'] = json_encode($data['items']);
        $id = FoodOrders::updateOrCreate(['id' => $data['id'] ?? null], $data)->id;
        if ($id && !empty($data['is_order_placed'])) {
            TpLogActivity:: create($activityData);
            $fromEmail = 'tappitmobapp@gmail.com';
            if ($data['is_email_receipt'] && !empty($contactEmail)) {
                $email = $contactEmail;
                $userSubject = $foodEmailData[0]['subject'];
                $userTemplate = str_replace('{ORDER_NO}', $id, $userTemplate);
                $userData = ['template' => $userTemplate, 'from_email' => $fromEmail, 'email' => $email, 'subject' => $userSubject];
                $userMail = Mail::send('emails.orderEmail', $userData, function ($message) use ($userData, $fromEmail) {
                    $message->from($fromEmail, 'Tappit');
                    $message->to($userData['email'])->subject($userData['subject']);
                });
            }
            if (isset($foodEmailData[1]['admin_email']) && $foodEmailData[1]['admin_email'] != '') {
                $adminEmail = $foodEmailData[1]['admin_email'];
                $adminSubject = $foodEmailData[1]['subject'];
                $adminTemplate = str_replace('{ORDER_NO}', $id, $adminTemplate);
                $adminData = ['template' => $adminTemplate, 'from_email' => $fromEmail, 'email' => $adminEmail, 'subject' => $adminSubject];
                $adminMail = Mail::send('emails.orderEmail', $adminData, function ($message) use ($adminData, $fromEmail) {
                    $message->from($fromEmail, 'Tappit');
                    $message->to($adminData['email'])->subject($adminData['subject']);
                });
            }
        }
        $result = parent::getSuccessResponse('Order saved successfully.', ['id' => $id]);
        return response()->json($result);
    }

    public function sendUserEmail($data)
    {
        $currencySymbol = $this->getCurrencySymbol($data['tab_id']);
        $foodEmailData = FoodOrderingEmail::getFoodEmail($data['tab_id']);
        $foodCustomGuides = FoodOrderingCustomGuides::getFoodCustomeGuides($data['tab_id']);
        $email = $data['contact']['email'];
        if ($data['is_email_receipt']) {
            $template = $foodEmailData[0]['template'];
            if ($data['type'] == 1) {
                $type = $foodCustomGuides['digital_method'];
            } else if ($data['type'] == 2) {
                $type = $foodCustomGuides['pickup_method'];
            } else {
                $type = $foodCustomGuides['shipping_method'];
            }
            if ($data['payment_method'] == 1) {
                $payment_type = $foodCustomGuides['cash'];
            } else {
                $payment_type = $foodCustomGuides['card'];
            }
            $template = str_replace('{PLACE_TIME}', $data['datetime'] ?? '', $template);
            $template = str_replace('{ORDER_TYPE}', $type, $template);
            if (!empty($data['contact']['firstName'])) {
                $userName = $data['contact']['firstName'];
            }
            if (!empty($data['contact']['firstName'])) {
                $userName .= ' ' . $data['contact']['lastName'];
            }
            $template = str_replace('{DELIVERY_NAME}', $userName, $template);
            $template = str_replace('{DELIVERY_PHONE}', $data['contact']['phone'], $template);
            $template = str_replace('{DELIVERY_EMAIL}', $data['contact']['email'] ?? '', $template);
            $template = str_replace('{CHECKOUT_METHOD}', $payment_type, $template);
            $template = str_replace('{ORDER_TOTAL}', number_format($data['total_charges'], 2), $template);
            $template = str_replace('{TOTAL}', count($data['items']), $template);
            $template = str_replace('{ORDER_TIME}', $data['datetime'], $template);
            if (isset($data['contact']['addressLine'])) {
                $state = 'UP';
                $city = 'LKO';
                $template = str_replace('{ORDER_ADDRESS_1}', $data['contact']['addressLine'] ?? '', $template);
                $template = str_replace('{ORDER_ADDRESS_2}', $data['contact']['apartment'] ?? '', $template);
                $template = str_replace('{ORDER_CITY}', $data['contact']['zip'] ?? '', $template);
                $template = str_replace('{ORDER_STATE}', $city ?? '', $template);
                $template = str_replace('{ORDER_ZIP}', $state ?? '', $template);

                $template = str_replace('{DELIVERY_ADDRESS_1}', $data['contact']['addressLine'] ?? '', $template);
                $template = str_replace('{DELIVERY_ADDRESS_2}', $data['contact']['apartment'] ?? '', $template);
                $template = str_replace('{DELIVERY_ZIP}', $data['contact']['zip'] ?? '', $template);
                $template = str_replace('{DELIVERY_CITY}', $city ?? '', $template);
                $template = str_replace('{DELIVERY_STATE}', $state ?? '', $template);
            } else {
                $template = str_replace('{ORDER_ADDRESS_1}', '', $template);
                $template = str_replace('{ORDER_ADDRESS_2}', '', $template);
                $template = str_replace('{ORDER_CITY}', '', $template);
                $template = str_replace('{ORDER_STATE}', '', $template);
                $template = str_replace('{ORDER_ZIP}', '', $template);

                $template = str_replace('{DELIVERY_ADDRESS_1}', '', $template);
                $template = str_replace('{DELIVERY_ADDRESS_2}', '', $template);
                $template = str_replace('{DELIVERY_ZIP}', '', $template);
                $template = str_replace('{DELIVERY_CITY}', '', $template);
                $template = str_replace('{DELIVERY_STATE}', '', $template);
            }
            $item_template = $foodCustomGuides['order_items_list_template'];
            $order_details = '';
            $order_details_template = '';
            if (!empty($data['items'])) {
                foreach ($data['items'] as $item) {
                    $order_details = str_replace('{ORDER_NAME}', $item['item_name'], $item_template);
                    $order_details = str_replace('{CURRENCY}', $currencySymbol . ' ', $order_details);
                    $order_details = str_replace('{COST}', number_format($item['item_price'], 2), $order_details);
                    $order_details = str_replace('{QUANTITY}', $item['quantity'], $order_details);
                    $order_options_details = '';
                    if (!empty($item['options'])) {
                        foreach ($item['options'] as $option) {
                            $order_options_details .= $option['quantity'] . ' (x) ' . $option['option']['title'] . ' (' . $currencySymbol . ' ' . number_format($option['option']['charges'], 2) . ')<br />';
                        }
                    }
                    $order_details = str_replace('{OPTIONS}', $order_options_details, $order_details);
                    if (!empty($item['notes'])) {
                        $order_details = str_replace('{ORDER_NOTE}', $item['notes'], $order_details);
                    } else {
                        $order_details = str_replace('{ORDER_NOTE}', '', $order_details);
                    }
                    $order_details_template .= $order_details;
                }
            }
            $order_tax = '';
            if (!empty($data['tax_list'])) {
                foreach ($data['tax_list'] as $t) {
                    $amount = $t['amount'] ?? '';
                    $tax_name = $t['tax']['tax_name'] ?? '';
                    // $t['tax']['tax_value'] ?? '';
                    $order_tax .= $tax_name . ' ' . $currencySymbol . ' ' . number_format($amount, 2) . '<br />';
                }
            }
            $order_tax .= 'Convenience Fee ' . $currencySymbol . ' ' . number_format($data['convenience_fee'], 2) ?? '';
            $template = str_replace('{ORDEREDITEMS_LIST}', $order_details_template, $template);
            $template = str_replace('{TAX}', $order_tax, $template);
            return $template;
        } else {
            return true;
        }
    }

    public function sendAdminEmail($data)
    {
        $currencySymbol = $this->getCurrencySymbol($data['tab_id']);
        $foodEmailData = FoodOrderingEmail::getFoodEmail($data['tab_id']);
        $foodCustomGuides = FoodOrderingCustomGuides::getFoodCustomeGuides($data['tab_id']);
        $fromEmail = 'tappitmobapp@gmail.com';
        if ($data['type'] == 1) {
            $type = $foodCustomGuides['digital_method'];
        } else if ($data['type'] == 2) {
            $type = $foodCustomGuides['pickup_method'];
        } else {
            $type = $foodCustomGuides['shipping_method'];
        }
        if ($data['payment_method'] == 1) {
            $payment_type = $foodCustomGuides['cash'];
        } else {
            $payment_type = $foodCustomGuides['card'];
        }
        $adminTemplate = $foodEmailData[1]['template'];
        $adminTemplate = str_replace('{PLACE_TIME}', $data['datetime'], $adminTemplate);
        $adminTemplate = str_replace('{ORDER_TYPE}', $type, $adminTemplate);
        if (!empty($data['contact']['firstName'])) {
            $userName = $data['contact']['firstName'];
        }
        if (!empty($data['contact']['firstName'])) {
            $userName .= ' ' . $data['contact']['lastName'];
        }
        $adminTemplate = str_replace('{DELIVERY_NAME}', $userName, $adminTemplate);
        $adminTemplate = str_replace('{DELIVERY_PHONE}', $data['contact']['phone'], $adminTemplate);
        $adminTemplate = str_replace('{DELIVERY_EMAIL}', $data['contact']['email'] ?? '', $adminTemplate);
        $adminTemplate = str_replace('{CHECKOUT_METHOD}', $payment_type, $adminTemplate);
        $adminTemplate = str_replace('{ORDER_TOTAL}', number_format($data['total_charges'], 2), $adminTemplate);
        $adminTemplate = str_replace('{TOTAL}', count($data['items']), $adminTemplate);
        $adminTemplate = str_replace('{ORDER_TIME}', $data['datetime'], $adminTemplate);
        if (isset($data['contact']['addressLine'])) {
            $state = 'UP';
            $city = 'LKO';
            $adminTemplate = str_replace('{ORDER_ADDRESS_1}', $data['contact']['addressLine'] ?? '', $adminTemplate);
            $adminTemplate = str_replace('{ORDER_ADDRESS_2}', $data['contact']['apartment'] ?? '', $adminTemplate);
            $adminTemplate = str_replace('{ORDER_CITY}', $data['contact']['zip'] ?? '', $adminTemplate);
            $adminTemplate = str_replace('{ORDER_STATE}', $city ?? '', $adminTemplate);
            $adminTemplate = str_replace('{ORDER_ZIP}', $state ?? '', $adminTemplate);

            $adminTemplate = str_replace('{DELIVERY_ADDRESS_1}', $data['contact']['addressLine'] ?? '', $adminTemplate);
            $adminTemplate = str_replace('{DELIVERY_ADDRESS_2}', $data['contact']['apartment'] ?? '', $adminTemplate);
            $adminTemplate = str_replace('{DELIVERY_ZIP}', $data['contact']['zip'] ?? '', $adminTemplate);
            $adminTemplate = str_replace('{DELIVERY_CITY}', $city ?? '', $adminTemplate);
            $adminTemplate = str_replace('{DELIVERY_STATE}', $state ?? '', $adminTemplate);
        } else {
            $adminTemplate = str_replace('{ORDER_ADDRESS_1}', '', $adminTemplate);
            $adminTemplate = str_replace('{ORDER_ADDRESS_2}', '', $adminTemplate);
            $adminTemplate = str_replace('{ORDER_CITY}', '', $adminTemplate);
            $adminTemplate = str_replace('{ORDER_STATE}', '', $adminTemplate);
            $adminTemplate = str_replace('{ORDER_ZIP}', '', $adminTemplate);

            $adminTemplate = str_replace('{DELIVERY_ADDRESS_1}', '', $adminTemplate);
            $adminTemplate = str_replace('{DELIVERY_ADDRESS_2}', '', $adminTemplate);
            $adminTemplate = str_replace('{DELIVERY_ZIP}', '', $adminTemplate);
            $adminTemplate = str_replace('{DELIVERY_CITY}', '', $adminTemplate);
            $adminTemplate = str_replace('{DELIVERY_STATE}', '', $adminTemplate);
        }
        $item_adminTemplate = $foodCustomGuides['order_items_list_template'];
        $order_details = '';
        $order_details_adminTemplate = '';
        if (!empty($data['items'])) {
            foreach ($data['items'] as $item) {
                $order_details = str_replace('{ORDER_NAME}', $item['item_name'], $item_adminTemplate);
                $order_details = str_replace('{CURRENCY}', $currencySymbol, $order_details);
                $order_details = str_replace('{COST}', number_format($item['item_price'], 2), $order_details);
                $order_details = str_replace('{QUANTITY}', $item['quantity'], $order_details);
                $order_options_details = '';
                if (!empty($item['options'])) {
                    foreach ($item['options'] as $option) {
                        $order_options_details .= $option['quantity'] . ' (x) ' . $option['option']['title'] . ' (' . $currencySymbol . ' ' . number_format($option['option']['charges'], 2) . ')<br />';
                    }
                }
                $order_details = str_replace('{OPTIONS}', $order_options_details, $order_details);
                if (!empty($item['notes'])) {
                    $order_details = str_replace('{ORDER_NOTE}', $item['notes'], $order_details);
                } else {
                    $order_details = str_replace('{ORDER_NOTE}', '', $order_details);
                }
                $order_details_adminTemplate .= $order_details;
            }
        }
            // echo $order_details_adminTemplate;
        $order_tax = '';
        if (!empty($data['tax_list'])) {
            foreach ($data['tax_list'] as $t) {
                $amount = $t['amount'] ?? '';
                $tax_name = $t['tax']['tax_name'] ?? '';
                    // $t['tax']['tax_value'] ?? '';
                $order_tax .= $tax_name . ' ' . $currencySymbol . ' ' . number_format($amount, 2) . '<br />';
            }
        }
        $order_tax .= 'Convenience Fee ' . $currencySymbol . ' ' . number_format($data['convenience_fee'], 2) ?? '';
        $adminTemplate = str_replace('{ORDEREDITEMS_LIST}', $order_details_adminTemplate, $adminTemplate);
        $adminTemplate = str_replace('{TAX}', $order_tax, $adminTemplate);
        return $adminTemplate;
    }

    public function foodOrdersInit(Request $request, $currentPage = 1, $perPage = 10)
    {
        if (empty($request->appId)) {
            throw new Exception('App ID not found.');
        }
        Paginator::currentPageResolver(function () use ($currentPage) {
            return $currentPage;
        });
        $appId = $request->appId;
        $mst_food_ordering_tab_id = MstTpTabEntity::getMstTabId('food_ordering');
        $foodOrderingTabIds = TpAppsTabEntity::getAppTabsForTransactionsTab($appId, $mst_food_ordering_tab_id->id);
        $result = parent::getSuccessResponse(null, [
            'success' => true,
            'tabData' => count($foodOrderingTabIds) > 0 ? self::getFoodOrderTabData($foodOrderingTabIds[0]->id, $request->search, $perPage) : [],
            'foodOrderingTabIds' => $foodOrderingTabIds,
            'foodOrderingLocation' => count($foodOrderingTabIds) > 0 ? FoodOrderingLocations::getLocationList($foodOrderingTabIds[0]->id) : [],
            'currencySymbol' => count($foodOrderingTabIds) > 0 ? self::getCurrencySymbol($foodOrderingTabIds[0]->id) : [],
            'orderCount' => count($foodOrderingTabIds) > 0 ? FoodOrders::getAllOrdersCount($foodOrderingTabIds[0]->id) : null,
        ]);
        return response()->json($result);
    }

    public static function getCurrencySymbol(int $tabId)
    {
        $currency_code = FoodOrderingPayment::getData($tabId)->currency;
        return Currency::getCurrencySymbol($currency_code);
    }

    public static function getFoodOrderTabData(int $tabId, $search, $perPage)
    {
        return FoodOrders::getData($tabId, $search, $perPage);
    }

    public function foodOrdersByTabId(Request $request, $currentPage = 1, $perPage = 10)
    {
        if (empty($request->tabId)) {
            throw new Exception('Tab ID not found.');
        }
        Paginator::currentPageResolver(function () use ($currentPage) {
            return $currentPage;
        });
        $result = parent::getSuccessResponse(null, [
            'success' => true,
            'tabData' => self::getFoodOrderTabData($request->tabId, $request->search, $perPage),
            'foodOrderingLocation' => FoodOrderingLocations::getLocationList($request->tabId),
            'currencySymbol' => self::getCurrencySymbol($request->tabId),
            'orderCount' => FoodOrders::getAllOrdersCount($request->tabId),
        ]);
        return response()->json($result);
    }

    public function getPastOrders(Request $request) : JsonResponse
    {
        $result = parent::getSuccessResponse(null, [
            'pastOrdersList' => FoodOrders::getPastOrders($request->tabID, $request->deviceUUID)
        ]);
        return response()->json($result);
    }
    public function getCategories(Request $request) : JsonResponse
    {
        $result = parent::getSuccessResponse(null, [
            'success' => true,
            'menuCategory' => FoodOrderingMenuCategory::getEnabledCategories($request->tabID)
        ]);
        return response()->json($result);
    }

    public function getItems(Request $request) : JsonResponse
    {
        $result = parent::getSuccessResponse(null, [
            'success' => true,
            'menuItems' => FoodOrderingMenuItems::getEnabledItems($request->tabID)
        ]);
        return response()->json($result);
    }

    public function getItemDetails(Request $request) : JsonResponse
    {
        $result = parent::getSuccessResponse(null, [
            'success' => true,
            'options' => FoodOrderingMenuOptionTypeItems::getEnabledOptionsByItemID($request->itemId),
            'sizes' => FoodOrderingMenuItemSize::getSizesByItemID($request->itemId)
        ]);
        return response()->json($result);
    }

    public function canOpenInIframe(string $url) : bool
    {
        $headers = get_headers($url, 1);
        return empty($headers['X-Frame-Options']);
    }

    public function foodOrderDelete(Request $request)
    {
        if (empty($request->id)) {
            throw new Exception("id not found");
        }
        FoodOrders::deleteFoodOrder($request->id);
        $result = parent::getSuccessResponse(null, [
            'success' => true,
            'message' => ['Food order successfully deleted.'],
        ]);
        return response()->json($result);
    }

    public function downloadCSV(Request $request)
    {
        if (empty($request->type)) {
            throw new Exception('Export type not found.');
        }
        if (empty($request->tabId)) {
            throw new Exception('Tab ID not found.');
        }
        $currency = html_entity_decode(self::getCurrencySymbol($request->tabId));
        $nameValues = ['id', 'totals', 'address', 'order_type', 'order_state', 'customer_name', 'specific_instructions', 'placed_on', 'due_on', 'paid status', 'billing - address1', 'billing - address2', 'billing - city', 'billing - state', 'billing - country', 'billing - email', 'billing - first_name', 'billing - last_name', 'billing - phone', 'items'];
        if ($request->type == 1) {
            //Export All orders
            $records = FoodOrders::getOrdersDataByTabId($request->tabId);
            $fieldValues = $this->createCSVData($records, $currency);
        } else {
            //Export seleted orders
            if (empty($request->ids)) {
                throw new Exception('Order ID not found.');
            }
            $records = FoodOrders::getOrdersDataByOrderId(explode(",", $request->ids));
            $fieldValues = $this->createCSVData($records, $currency);
        }

        $header = array($nameValues);
        $dataArray = array_merge($header, $fieldValues);
        // print_r($dataArray);
        // exit;
        $output_file_name = 'formdata.csv';
        $delimiter = ',';
        $csv = self::convert_to_csv($dataArray, $output_file_name, $delimiter);
    }

    public function formattedDate($date)
    {
        $dt = date_create($date);
        $dayofweek = date('w', strtotime($date));
        $weeks = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return $placedOn = $weeks[$dayofweek] . ', ' . date_format($dt, "m-d-Y H:i:s");
    }

    public function createCSVData($records, $currency)
    {
        foreach ($records as $rec) {
            $contact = json_decode($rec->contact);
            $items = json_decode($rec->items);
            $itm = '';
            $specialInstruction = '';
            foreach ($items as $item) {
                $itm = $itm . ' ' . $item->quantity . ' - ' . $item->item_name;

                //If size exists
                if (property_exists($item, 'size')) {
                    $itm = $itm . ' (' . $item->size->title . ') ' . $currency . $item->size->price . ', ';
                } else {
                    $itm = $itm . ' ' . $currency . $item->item_price . ', ';
                }

                //If options exists
                if (property_exists($item, 'options')) {
                    foreach ($item->options as $option) {
                        $itm = $itm . $option->quantity . ' - ' . $option->option->title . ' - ' . $currency . $option->option->charges . ', ';
                    }
                }

                //If Notes for item exists
                if (property_exists($item, 'notes')) {
                    $specialInstruction = $specialInstruction . '[' . $item->item_name . ']' . $item->notes . ', ';
                }
            }

            //Include Tip if present
            if (!empty($rec->tip)) {
                $tip = json_decode($rec->tip);
                $tipPercent = property_exists($tip, 'percent') ? $tip->percent : '';
                $tipAmount = property_exists($tip, 'amount') ? $tip->amount : '';
                if (!empty($tipPercent) && !empty($tipAmount)) {
                    $itm = $itm . 'Tip (%' . $tipPercent . ') - ' . $currency . $tipAmount . ', ';
                }
            }
            //Include Tax if present
            if (!empty($rec->tax_list)) {
                $taxList = json_decode($rec->tax_list);
                foreach ($taxList as $tax) {
                    if ($tax->amount != 0) {
                        $itm = $itm . ' - ' . $tax->tax->tax_name . ' - ' . $currency . $tax->amount . ', ';
                    }
                }
            }
            
            //Include convenience_fee if present
            if (!empty($rec->convenience_fee)) {
                $itm = $itm . ' - Convenience Fee - ' . $currency . $rec->convenience_fee . ', ';
            }
            $itm = rtrim($itm, ", ");
            $specialInstruction = rtrim($specialInstruction, ", ");

            $orderType = $rec->type == 1 ? 'Dine-In' : $rec->type == 2 ? 'Takeout' : 'Delivery';
            $orderState = $rec->order_status == 1 ? 'Cancelled' : $rec->order_status == 2 ? 'Unserved' : 'Served';
            $placedOn = $this->formattedDate($rec->created_at);
            $dueOn = $this->formattedDate($rec->datetime);
            $paidStatus = $rec->paid_status == 1 ? 'Unpaid' : 'Paid';
            $fieldValues[] = [
                $rec->id,
                $rec->total_charges,
                $rec->address_section_1 . ' ' . $rec->address_section_2,
                $orderType,
                $orderState,
                $contact->firstName . ' ' . $contact->lastName,
                $specialInstruction,
                $placedOn,
                $dueOn,
                $paidStatus,
                $rec->billing_address1,
                $rec->billing_address2,
                $rec->billing_city,
                $rec->billing_state,
                $rec->billing_country,
                $rec->email,
                $rec->first_name,
                $rec->last_name,
                $rec->phone,
                $itm
            ];
        }
        return $fieldValues;
    }

    public function convert_to_csv($input_array, $output_file_name, $delimiter)
    {
        $temp_memory = fopen('php://memory', 'w');
        // loop through the array
        foreach ($input_array as $line) {
            // use the default csv handler
            fputcsv($temp_memory, $line, $delimiter);
        }

        fseek($temp_memory, 0);
        // modify the header to be CSV format
        header('Content-Type: application/csv');
        header('Content-Disposition: attachement; filename="' . $output_file_name . '";');
        // output the file to be downloaded
        fpassthru($temp_memory);
    }
    public function editFoodOrder(Request $request) : JsonResponse
    {
        $data = $request->all();

        $validator = Validator::make($data, [
            'id' => 'integer',
            'tab_id' => 'required|integer',
            'location_id' => 'required|integer',
            'tip' => 'max:512',
            'type' => 'required|integer',
            'total_price' => 'required|numeric|min:0|max:999999999999',
            'total_charges' => 'required|numeric|min:0|max:999999999999',
            'payment_method' => 'required|integer',
            'contact' => 'required',
            'convenience_fee' => 'required|numeric|min:0|max:999999999999',
            'order_status' => 'required|integer',
            'paid_status' => 'required|integer',
            'datetime' => 'required',
            'items' => 'required',
            'contact.email' => 'email',
            'is_email_receipt' => 'required|boolean',
            'is_order_placed' => 'required|boolean',
            'delivery_charges' => 'numeric|min:0|max:999999999999',
            'free_delivery_amount' => 'numeric|min:0|max:999999999999',
            'convenience_fee_taxable' => 'required|boolean',
            'delivery_price_fee_taxable' => 'required|boolean'
        ]);
        if ($validator->fails()) {
            throw new Exception($validator->errors()->first());
        }

        $location = [];
        $location['id'] = $data['location_id'];
        $location['address_section_1'] = $data['address_section_1'];
        $location['address_section_2'] = $data['address_section_2'];
        unset($data['address_section_1']);
        unset($data['address_section_2']);
        if (empty($location['id'])) {
            FoodOrderingLocations::where('id', $location['id'])->update($location);
        }
        $data['tip'] = !empty($data['tip']) ? json_encode($data['tip']) : null;
        $data['tax_list'] = !empty($data['tax_list']) ? json_encode($data['tax_list']) : null;
        $data['contact'] = !empty($data['contact']) ? json_encode($data['contact']) : null;
        $data['items'] = !empty($data['items']) ? json_encode($data['items']) : null;
        FoodOrders::where('id', $data['id'])->update($data);
        $result = parent::getSuccessResponse('Order saved successfully.');
        return response()->json($result);
    }

}
