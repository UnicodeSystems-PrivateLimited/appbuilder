<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;

class FoodOrderingEmail extends Model
{

    protected $table = 'tp_func_food_emails';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_food_emails';

    public static function getFoodEmail(int $tab_id) {
        return $query = self::select('id', 'tab_id', 'admin_email', 'subject', 'type', 'template')
                        ->where('tab_id', $tab_id)
                        ->get();
    }

    public static function saveFoodOrderingEmail($id, $subject, $type, $template) {
        DB::table('tp_func_food_emails')->where('id', $id)->update([
            'subject' => $subject, 'type'=>$type, 'template'=>$template
        ]);
    }

    public static function saveFoodOrderingAdminEmail($id, $subject, $type, $template, $admin_email) {
        DB::table('tp_func_food_emails')->where('id', $id)->update([
            'admin_email' => $admin_email, 'subject' => $subject, 'type'=>$type, 'template'=>$template
        ]);
    }

}