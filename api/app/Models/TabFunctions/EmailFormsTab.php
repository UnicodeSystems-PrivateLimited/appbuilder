<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class EmailFormsTab extends Model
{

    protected $table = 'tp_func_email_forms_tab';
    protected $guarded = ['id'];

    const TABLE = 'tp_func_email_forms_tab';

    public static function formList(int $tabId) {
        return self::select('id', 'title')
            ->where('tab_id', $tabId)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
            ->orderBy('title', 'ASC')
            ->get();
    }

    public static function updateMultiple(array $data, string $updateKey = 'id') {
        DB::transaction(function () use ($data, $updateKey) {
            foreach ($data as $key => $value) {
                self::where($updateKey, $key)->update($value);
            }
        });
    }

    /**
     * @param mixed $id
     */
    public static function deleteForm($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function getFormInfo(int $id) {
        return self::select('id', 'tab_id', 'title', 'email', 'subject', 'description', 'success_msg', 'error_msg', 'submit_button_label', 'back_button_label', 'status')
            ->where('id', $id)
            ->first();
    }

    public static function getFirstFormInfo(int $tabId) {
        return self::select('id', 'tab_id', 'title', 'email', 'subject', 'description', 'success_msg', 'error_msg', 'submit_button_label', 'back_button_label', 'status')
            ->where('tab_id', $tabId)
            ->first();
    }

    /**
     *
     * @param int $tabId Tab Id
     * @return type
     */
    public static function IsSingleEntry(int $tabId) {
        return self::select('id')
            ->where('tab_id', $tabId)->get()->count();
    }

    public static function formListsForSubmittedData($tabIds) {
        return DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.title', DB::raw('COUNT(child.id) as total_entries'), DB::raw(" sum(case when child.created_at > '" . date('Y-m-d h:i:s', strtotime(' -2 day')) . "' then 1 else 0 end) as recent_entries"))
            ->leftJoin('tp_func_email_form_fields_val as child', function ($join) {
                $join->on('main.id', '=', 'child.form_id');
            })
            ->whereIn('main.tab_id', $tabIds)
            ->groupBy('main.id')
            ->orderBy(DB::raw('(main.sort_order=0)'), 'ASC')
            ->orderBy('main.sort_order', 'ASC')
            ->orderBy('main.title', 'ASC')
            ->get();
    }

    public static function getFormData(int $tabID): array {
        return DB::table(self::TABLE . ' as main')
            ->select('main.id', 'main.tab_id', 'main.email', 'main.subject', 'main.title', 'main.description', 'main.success_msg', 'main.error_msg', 'main.submit_button_label', 'main.back_button_label', 'main.status', 'main.sort_order', 'field.field_type_id', 'field.form_id', 'field.properties', 'field.sort_order as field_sort_order')
            ->join(EmailFormFields::TABLE . ' as field', 'main.id', '=', 'field.form_id')
            ->where('main.tab_id', $tabID)
            ->get();
    }

}
