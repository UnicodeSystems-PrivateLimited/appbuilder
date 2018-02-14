<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class PDFTab extends Model {

    protected $table = 'tp_func_pdf_tab';
    protected $guarded = ['id'];

    public static function getPdfFileList(int $tabId) {
        return self::select(DB::raw("`id`, `name`, `section`, `is_printing_allowed`,`url`,`file_name`"))
                        ->where('tab_id', $tabId)
                        ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
                        ->orderBy('sort_order', 'ASC')
                        ->orderBy('name', 'ASC')
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
    public static function deleteMultiple($id) {
        if (!is_array($id)) {
            $id = [$id];
        }
        return self::whereIn('id', $id)->delete();
    }

    public static function getItemData(int $id) {
        return self::select(DB::raw("`id`, `name`, `section`,`url`,`file_name`, is_printing_allowed"))
                        ->where('id', $id)
                        ->first();
    }
    public static function getFirstItemData(int $tabId) {
        return self::select(DB::raw("`id`, `name`, `section`,`url`,`file_name`, is_printing_allowed"))
                       ->where('tab_id', $tabId)
                        ->first();
    }

    public static function getSectionWisePdfList(int $tabId): array {
        $returnArray = [];
        $result = self::select(DB::raw("`id`, `name`, `section`, `is_printing_allowed`,`url`,`file_name`"))
                ->where('tab_id', $tabId)
                ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
                ->orderBy('sort_order', 'ASC')
                ->orderBy('name', 'ASC')
                ->get();
        foreach ($result as $res) {
            if (empty($res->section)) {
                $returnArray['__noSection'][] = $res;
            } else {
                $returnArray[$res->section][] = $res;
            }
        }
        return $returnArray;
    }

    /**
     * 
     * @param int $tabId Tab Id
     * @return type
     */
    public static function IsSingleEntry(int $tabId) {
        return self::select('id', 'tab_id', 'name')
                        ->where('tab_id', $tabId)->get()->count();
    }

}
