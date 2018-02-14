<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class EmailFormFieldsVal extends Model {

    protected $table = 'tp_func_email_form_fields_val';
    protected $guarded = ['id'];

    public static function getData(int $id) {
        return self::select('id', 'form_id', 'value', 'created_at')
                        ->where('id', $id)
                        ->get();
    }

    public static function getFormEntries(int $formId) {
        return self::select('id', 'value')
                        ->where('form_id', $formId)
                        ->get();
    }

    /**
     * @param mixed $id
     */
    public static function deleteFormEntry($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function getYearData(int $formId, $year) {
        return $result = DB::SELECT(DB::raw("SELECT MONTH(`updated_at`) MONTH, COUNT(*) COUNT FROM tp_func_email_form_fields_val WHERE YEAR(`updated_at`)=$year AND`form_id` = $formId GROUP BY MONTH(`updated_at`)"));
    }

    public static function getYearDataForSubmittedData(int $formId, $year) {
        return $result = DB::SELECT(DB::raw("SELECT DATE(`updated_at`) DATE, COUNT(*) COUNT FROM tp_func_email_form_fields_val WHERE YEAR(`updated_at`)=$year AND`form_id` = $formId GROUP BY DATE(`updated_at`)"));
    }

    public static function getMonthData(int $formId, $year, $month) {
        return $result = DB::SELECT(DB::raw("SELECT DAY(`updated_at`) DAY, COUNT(*) COUNT FROM tp_func_email_form_fields_val WHERE YEAR(`updated_at`)=$year AND `form_id` = $formId AND MONTH(`updated_at`)=$month GROUP BY DAY(`updated_at`)"));
    }

    public static function getMonthDataForSubmittedData(int $formId, $year, $month) {
        return $result = DB::SELECT(DB::raw("SELECT DATE(`updated_at`) DATE, COUNT(*) COUNT FROM tp_func_email_form_fields_val WHERE YEAR(`updated_at`)=$year AND `form_id` = $formId AND MONTH(`updated_at`)=$month GROUP BY DATE(`updated_at`)"));
    }

    public static function getDayData(int $formId, $year, $month, $day) {
        return $result = DB::SELECT(DB::raw("SELECT HOUR(`updated_at`) HOUR, COUNT(*) COUNT FROM tp_func_email_form_fields_val WHERE YEAR(`updated_at`)=$year AND `form_id` = $formId AND MONTH(`updated_at`)=$month AND DAY(`updated_at`)=$day GROUP BY HOUR(`updated_at`) "));
    }

    public static function getFullDayData(int $formId, $year, $month, $day) {
        return $result = DB::SELECT(DB::raw("SELECT  COUNT(*) COUNT FROM tp_func_email_form_fields_val WHERE YEAR(`updated_at`)=$year AND `form_id` = $formId AND MONTH(`updated_at`)=$month AND DAY(`updated_at`)=$day GROUP BY DAY(`updated_at`) "));
    }

    public static function getBetweenTwoDatesData(int $formId, $start_date, $end_date) {
        return $result = DB::SELECT(DB::raw("SELECT DATE(`updated_at`) DATE, COUNT(*) COUNT FROM tp_func_email_form_fields_val WHERE (DATE(`created_at`) BETWEEN $start_date AND $end_date) AND `form_id` = $formId GROUP BY DATE(`updated_at`)"));
    }

    public static function getLastTwelveMonthData(int $formId) {
    return $result = DB::SELECT(DB::raw("SELECT DATE(`updated_at`) DATE, COUNT(*) COUNT FROM tp_func_email_form_fields_val WHERE (DATE(`created_at`) BETWEEN NOW() - INTERVAL 12 MONTH AND NOW()) AND `form_id` =  $formId GROUP BY MONTH(`updated_at`)"));
    }

    public static function getFormEntriesForSubmittedData(int $formId, $filters = [], $perPage = 20) {
        $query = self::select('id', 'value', 'created_at')
                ->where('form_id', $formId);
        if (!empty($filters['title'])) {
            $query->where('value', 'LIKE', '%' . str_replace('%', '\\%', $filters['title']) . '%');
        }
        return $query->orderBy('created_at', 'DESC')->paginate($perPage);
    }

}
