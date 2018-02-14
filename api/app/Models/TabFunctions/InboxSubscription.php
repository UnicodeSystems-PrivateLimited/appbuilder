<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class InboxSubscription extends Model {

    protected $table = 'tp_func_inbox_subscription';
    protected $guarded = ['id'];
    const TABLE = 'tp_func_inbox_subscription';
    const SUBSCRIBER = 'tp_func_inbox_subscriber';

    
    /**
     * get subscriptionList for tab
     */
    public static function subscriptionList(int $tabId) {
        return DB::table(self::TABLE . ' as main')
            ->select('main.id','main.subscription_name',DB::raw('COUNT(subscriber.subscription_id) AS subscribers'))
            ->leftjoin(self::SUBSCRIBER . ' as subscriber', function ($join) {
                $join->on('subscriber.subscription_id', '=', 'main.id');
                $join->on('subscriber.is_subscribed', '=', DB::raw("'1'"));
            })
            ->where('main.tab_id', $tabId)
            ->groupBy('subscriber.subscription_id')
            ->groupBy('main.id')
            ->orderBy(DB::raw('(main.sort_order=0)'), 'ASC')
            ->orderBy('main.sort_order', 'ASC')
            ->orderBy('main.subscription_name', 'ASC')
            ->get();
    }

     /**
     * Sorting
     */
    public static function updateMultiple(array $data, string $updateKey = 'id') {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                self::where($updateKey, $key)->update($value);
            }
        });
    }
  /**
     *  deleteSubscription Information
     */

     public static function deleteSubscription($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

      /**
     * get subscription  Information
     */
    public static function getSubscriptionInfo(int $id) {
        return self::select('id','tab_id','subscription_name')
            ->where('id', $id)
            ->first();
    }
}
    