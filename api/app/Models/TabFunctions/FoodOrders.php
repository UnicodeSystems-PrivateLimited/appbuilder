<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;

class FoodOrders extends Model
{

    protected $table = 'tp_func_food_orders';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_food_orders';
    const LOCATION_TABLE = 'tp_func_food_locations';

    const PAID_STATUS_UNPAID = 1;
    const PAID_STATUS_PAID = 2;

    public static function getData(int $tabID, $filters = [], $perPage = 20)
    {
        $query = DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.delivery_charges', 'main.free_delivery_amount', 'main.delivery_price_fee_taxable', 'main.convenience_fee_taxable', 'main.tab_id', 'main.is_order_placed', 'loc.address_section_1', 'loc.address_section_2', 'main.location_id', 'main.type', 'main.tip', 'main.total_price', 'main.tax_list', 'main.total_charges', 'main.payment_method', 'main.contact', 'main.convenience_fee', 'main.order_status', 'main.paid_status', 'main.datetime', 'main.items', 'main.shipping_instructions', 'main.is_email_receipt')
            ->leftJoin(self::LOCATION_TABLE . ' as loc', 'loc.id', '=', 'main.location_id')
            ->where('main.tab_id', $tabID)
            ->where('main.is_order_placed', 1);
        if (!empty($filters['title'])) {
            $query->Where(function ($query) use ($filters) {
                $query->orWhere('main.contact', 'LIKE', '%' . str_replace('%', '\\%', $filters['title']) . '%');
                $query->orWhere('main.items', 'LIKE', '%' . str_replace('%', '\\%', $filters['title']) . '%');
            });
        }
        if (!empty($filters['location']) && $filters['location'] != -1) {
            $query->where('main.location_id', $filters['location']);
        }
        if (!empty($filters['type']) && $filters['type'] != 4) {
            $query->where('main.type', $filters['type']);
        }
        if (!empty($filters['states']) && $filters['states'] != 4) {
            $query->where('main.order_status', $filters['states']);
        }
        if (!empty($filters['status']) && $filters['status'] != 3) {
            $query->where('main.paid_status', $filters['status']);
        }
        return $query->orderBy('main.datetime', 'DESC')->paginate($perPage);
    }

    public static function getPastOrders(int $tabID, string $deviceUUID)
    {
        return DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.tab_id', 'loc.address_section_1', 'loc.address_section_2', 'main.location_id', 'main.type', 'main.tip', 'main.total_price', 'main.tax_list', 'main.total_charges', 'main.payment_method', 'main.contact', 'main.convenience_fee', 'main.order_status', 'main.paid_status', 'main.datetime', 'main.items', 'main.shipping_instructions')
            ->leftJoin(self::LOCATION_TABLE . ' as loc', 'loc.id', '=', 'main.location_id')
            ->where('main.tab_id', $tabID)
            ->where('main.device_uuid', $deviceUUID)
            ->orderBy('main.created_at', 'DESC')
            ->get();
    }

    public static function saveOrderPaidAndPlacedStatus(int $orderID, bool $success)
    {
        FoodOrders::where('id', $orderID)->update([
            'paid_status' => $success ? self::PAID_STATUS_PAID : self::PAID_STATUS_UNPAID,
            'is_order_placed' => $success
        ]);
    }

    public static function getOrderData(int $id)
    {
        return DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.tab_id', 'loc.address_section_1', 'loc.address_section_2', 'main.location_id', 'main.type', 'main.tip', 'main.total_price', 'main.tax_list', 'main.total_charges', 'main.payment_method', 'main.contact', 'main.convenience_fee', 'main.order_status', 'main.paid_status', 'main.datetime', 'main.items', 'main.shipping_instructions', 'main.is_email_receipt')
            ->leftJoin(self::LOCATION_TABLE . ' as loc', 'loc.id', '=', 'main.location_id')
            ->where('main.id', $id)
            ->orderBy('datetime', 'DESC')
            ->get();
    }

    public static function deleteFoodOrder($id)
    {
//        print_r($id); exit;
        if (!is_array($id)) {
            $id = [$id];
        }
//        var_dump($id); exit;
        return self::whereIn('id', $id)->delete();
    }

    public static function getAllOrdersCount($tabId)
    {
        $query = DB::table(self::TABLE . ' as main')
            ->select(DB::raw('COUNT(main.id) as total_orders'), DB::raw(" sum(case when main.datetime > '" . date('Y-m-d') . "' then 1 else 0 end) as recent_orders"), DB::raw(" sum(case when main.datetime > '" . date('Y-m-d', strtotime(' +1 day')) . "' then 1 else 0 end) as future_orders"))
            ->where('main.tab_id', $tabId)
            ->where('main.is_order_placed', 1)
            ->first();
        return $query;
    }

    public static function getOrdersDataByTabId(int $tabID)
    {
        $query = DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.tab_id', 'main.is_order_placed', 'loc.address_section_1', 'loc.address_section_2', 'main.location_id', 'main.type', 'main.tip', 'main.total_price', 'main.tax_list', 'main.total_charges', 'main.payment_method', 'main.contact', 'main.convenience_fee', 'main.order_status', 'main.paid_status', 'main.datetime', 'main.items', 'main.shipping_instructions', 'main.created_at', 'p.first_name', 'p.last_name', 'p.email', 'p.phone', 'p.billing_address1', 'p.billing_address2', 'p.billing_city', 'p.billing_state', 'p.billing_zip', 'p.billing_country')
            ->leftJoin(self::LOCATION_TABLE . ' as loc', 'loc.id', '=', 'main.location_id')
            ->leftJoin(FoodOrderingCardPayment::TABLE . ' as p', 'p.order_id', '=', 'main.id')
            ->where('main.tab_id', $tabID)
            ->where('main.is_order_placed', 1)
            ->orderBy('main.datetime', 'DESC');
        return $query->get();
    }

    public static function getOrdersDataByOrderId($orderID)
    {
        $query = DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.tab_id', 'main.is_order_placed', 'loc.address_section_1', 'loc.address_section_2', 'main.location_id', 'main.type', 'main.tip', 'main.total_price', 'main.tax_list', 'main.total_charges', 'main.payment_method', 'main.contact', 'main.convenience_fee', 'main.order_status', 'main.paid_status', 'main.datetime', 'main.items', 'main.shipping_instructions', 'main.created_at', 'p.first_name', 'p.last_name', 'p.email', 'p.phone', 'p.billing_address1', 'p.billing_address2', 'p.billing_city', 'p.billing_state', 'p.billing_zip', 'p.billing_country')
            ->leftJoin(self::LOCATION_TABLE . ' as loc', 'loc.id', '=', 'main.location_id')
            ->leftJoin(FoodOrderingCardPayment::TABLE . ' as p', 'p.order_id', '=', 'main.id')
            ->whereIn('main.id', $orderID)
            ->where('main.is_order_placed', 1)
            ->orderBy('main.datetime', 'DESC');
        return $query->get();
    }
}
