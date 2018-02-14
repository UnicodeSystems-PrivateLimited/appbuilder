<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class EmailFormFields extends Model {

    protected $table = 'tp_func_email_form_fields';
    protected $guarded = ['id'];
    const TABLE = 'tp_func_email_form_fields';

    public static function getFields(int $formId) {
    	return self::select('id', 'field_type_id', 'form_id', 'properties')
    		->where('form_id', $formId)
            ->orderBy(DB::raw('(sort_order=0)'), 'ASC')
            ->orderBy('sort_order', 'ASC')
    		->get();
    }
    
    public static function getFormFieldsId(int $formId) {
        return self::select(array('id'))
                     ->where('form_id', $formId)
                     ->get();
    }    
    
    public static function getFormFields(int $formId) {
        return    DB::table(self::TABLE . ' as emailFormField')
                     ->select('emailFormField.id','mst_form_field_types.name','emailFormField.properties')       
//                     ->select('mst_form_field_types.id','mst_form_field_types.name')       
                     ->join('mst_form_field_types', 'mst_form_field_types.id', '=', 'emailFormField.field_type_id')
                     ->where('emailFormField.form_id', $formId)
//                     ->orderBy(DB::raw('(emailFormField.sort_order=0)'), 'ASC')
//                     ->orderBy('emailFormField.sort_order', 'ASC')
                     ->get();
    }           
    //get field label and id
    public static function getFieldLabel($id){
        return self::select('id', 'field_type_id','properties')
    		->where('id', $id)
    		->first();
    }
    
    public static function if_field_exist($id){
        return self::select('id')
    		->where('id', $id)
    		->first();
    }
    
    //get field  id
    public static function getId($formId,$fieldTypeId){
        return self::select('id')
    		->where('form_id', $formId)
                ->where('field_type_id', $fieldTypeId)
    		->first();
    }
    
    public static function deleteFields($id){
        if (!is_array($id)) {
            $id = [$id];
        }
       return self::whereIn('id', $id)->delete();
    }
    
    public static function getFieldsId(int $formId) {
    	return self::select('id', 'field_type_id')
            ->where('form_id', $formId)
            ->orderBy('sort_order', 'ASC')
            ->get();
    }

}