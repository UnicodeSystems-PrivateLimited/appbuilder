<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Helpers\Helper;
use App\Models\TpAppsTabEntity;
use App\Models\MstFormFieldTypes;
use App\Models\TabFunctions\EmailFormsTab;
use App\Models\TabFunctions\EmailFormFields;
use App\Models\TabFunctions\EmailFormFieldsVal;
//use Illuminate\Support\Facades\Paginator;
use Illuminate\Pagination\Paginator;
use Mail;

class EmailFormsTabController extends Controller {

    const UPLOAD_PATH = 'app/public/functions/email-forms-tab';

    private static function getCommonValidationRules(): array {
        return [
            'title' => 'required|max:256',
            'success_msg' => 'required',
            'success_msg' => 'required',
            'submit_button_label' => 'required|max:256',
            'back_button_label' => 'required|max:256',
            'subject' => 'max:1024'
        ];
    }

    private static function getEmailValidation(): array {
        return [
            'email' => 'email|max:256'
        ];
    }

    private static function getValidationMessages(): array {
        return [
            'email.required' => 'The Send To field is required.',
        ];
    }

    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $data = [
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
                'fieldTypes' => MstFormFieldTypes::select('id', 'name')->get(),
                'formList' => EmailFormsTab::formList($request->tabId),
            ];
            $result = [
                'success' => TRUE,
                'data' => $data
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function save(Request $request) {
        try {
            $data = $request->all();
            if (empty($data['form']) || empty($data['fields'])) {
                throw new Exception('Invalid data found');
            }
            $formId = !empty($data['form']['id']) ? $data['form']['id'] : NULL;

            $rules = $formId ? ['id' => 'integer'] : ['tab_id' => 'required|integer'];
            $validator = Validator::make($data['form'], array_merge(self::getCommonValidationRules(), $rules, self::getValidationMessages()));
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $emailArray = explode(',', $data['form']['email']);
            foreach ($emailArray as $email) {
                $emaildata = [
                    'email' => trim($email)
                ];
                $emailvalidator = Validator::make($emaildata, self::getEmailValidation());
                if ($emailvalidator->fails()) {
                    throw new Exception('Please enter valid emails.');
                }
            }
            if ($formId) {
                EmailFormsTab::where('id', $data['form']['id'])->update($data['form']);
            } else {
                $formId = EmailFormsTab::create($data['form'])->id;
            }

            $i = 1;
            foreach ($data['fields'] as $field) {
                if (!empty($field['id'])) {
                    $formField = EmailFormFields::find($field['id']);
                } else {
                    // New form field
                    $formField = new EmailFormFields();
                    $formField->form_id = $formId;
                    $formField->field_type_id = $field['field_type_id'];
                }
                $formField->properties = json_encode($field['properties']);
                $formField->sort_order = $i++;
                $formField->save();
            }
            if (!empty($data['deletedField'])) {
                EmailFormFields::deleteFields($data['deletedField']);
            }


            $result = [
                'success' => TRUE,
                'data' => ['insertedId' => $formId],
                'message' => ['Email Form saved successfully']
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function sortForms(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs Not Found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            EmailFormsTab::updateMultiple($sortData);
            $result = [
                'success' => TRUE,
                'message' => 'Item order saved.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function formsList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $data = EmailFormsTab::formList($request->tabId);
            $result = [
                'success' => TRUE,
                'data' => $data
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteForm(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            EmailFormsTab::deleteForm($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Form deleted successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getFormData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = [
                'form' => EmailFormsTab::getFormInfo($request->id),
                'fields' => EmailFormFields::getFields($request->id),
            ];
            foreach ($data['fields'] as $key => $field) {
                $data['fields'][$key]->properties = json_decode($field->properties);
            }
            $result = [
                'success' => TRUE,
                'data' => $data
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function getYearData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = EmailFormFieldsVal::getYearData($request->id, $request->year);
            $yearData = array();
            foreach ($data as $val) {
                $yearData[$val->MONTH] = $val->COUNT;
            }
            $result = [
                'success' => TRUE,
                'data' => $yearData
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function getMonthData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = EmailFormFieldsVal::getMonthData($request->id, $request->year, $request->month);
            $monthData = array();
            foreach ($data as $val) {
                $monthData[$val->DAY] = $val->COUNT;
            }

            $result = [
                'success' => TRUE,
                'data' => $monthData
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function getDayData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }

            $data = EmailFormFieldsVal::getDayData($request->id, $request->year, $request->month, $request->day);

            $dayData = array();
            foreach ($data as $val) {
                $dayData[$val->HOUR] = $val->COUNT;
            }

            $result = [
                'success' => TRUE,
                'data' => $dayData
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function deleteFormField(Request $request) {
        // drop rows of table tp_func_email_form_fields with ids
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            EmailFormFields::deleteFields($request->id);

            $result = [
                'success' => TRUE,
                'message' => ['Form Fields deleted successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function saveEmailFormEntries(Request $request) {
        try {
            if (empty($request->form_id)) {
                throw new Exception('Form ID not found.');
            }
            $data = $request->all();

            $form_id = $data['form_id'];
            unset($data['form_id']);

            $jsonData = json_encode($data);

            $formData['form_id'] = $form_id;
            $formData['value'] = $jsonData;

            $createdId = EmailFormFieldsVal::create($formData)->id;
            $data = EmailFormFieldsVal :: getData($createdId);
            $result = [
                'success' => TRUE,
                'data' => $data
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function listEmailFormEntries(Request $request) {
        try {
            if (empty($request->form_id)) {
                throw new Exception('Form ID not found.');
            }
            $form_id = $request->form_id;
            // Get form attributes from tp_func_email_form_fields
            $formFields = EmailFormFields::getFormFields($form_id);
            $fieldType = EmailFormFields:: select('id', 'field_type_id')->where('form_id', $request->form_id)->get();
            $result = EmailFormFieldsVal::getFormEntries($form_id);
            $fieldValues = [];
            $formFieldType = [];

            foreach ($fieldType as $field) {
                $formFieldType[$field->id] = $field->field_type_id;
            }
            foreach ($result as $entries) {
                $entryVals = json_decode($entries['value']);
                $fieldValueArr = ['_id' => $entries['id']];
                foreach ($entryVals as $key => $val) {
                    $fieldValueArr['data'][$key] = ['id' => $key, 'value' => $val];
                }
                $fieldValues[] = $fieldValueArr;
            }
            foreach ($formFields as $k => $v) {
                $v->properties = json_decode($v->properties);
            }
            $data = array(
                'header' => $formFields,
                'entries' => $fieldValues,
                'field_type' => $formFieldType
            );
            $result = [
                'success' => TRUE,
                'data' => $data
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    //delete form entries
    public function deleteFormEntries(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            EmailFormFieldsVal::deleteFormEntry($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Form entry deleted successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function downloadCSV(Request $request) {
        try {
            if (empty($request->formId)) {
                throw new Exception('ID not found.');
            }
            $form_id = $request->formId;
            //get form attributes from tp_func_email_form_fields
            $form_fields = EmailFormFields :: getFormFields($form_id);
            foreach ($form_fields as $value) {
                $properties = json_decode($value->properties);
                $nameValues[] = $properties->label;
            }
            $records = EmailFormFieldsVal :: getFormEntries($form_id);
            $fieldValues = [];
            foreach ($records as $entries) {
                $valArr = (array) json_decode($entries['value']);
                $newArray = [];
                foreach ($valArr as $key => $value) {
                    //check if form field exists in email form field table
                    $fields_data = EmailFormFields::if_field_exist($key);
                    if ($fields_data) {
                        $type = is_object($value);
                        if ($type === true) {
                            $val = (array) $value;
                            $fields_data = EmailFormFields::getFieldLabel($key);
                            $field_id = $fields_data['field_type_id'];
                            if ($field_id == 4) { // for checkboxes                             
                                $cbox_arr = [];
                                $arr = $value;
                                foreach ($arr as $key_cbox => $val_cbox) {
                                    if ($val_cbox == "true") {
                                        $cbox_arr[] = $key_cbox;
                                    }
                                }
                                $value = implode(',', $cbox_arr);
                            } else {
                                $value = implode(' ', $val);
                            }
                        }
                        $newArray[$key] = $value;
                    }
                }
                $fieldValues[] = $newArray;
            }
            $header = array($nameValues);
            $dataArray = array_merge($header, $fieldValues);
            $output_file_name = 'entries.csv';
            $delimiter = ',';
            $csv = self :: convert_to_csv($dataArray, $output_file_name, $delimiter);
        } catch (Exception $ex) {
            echo $ex->getMessage();
        }
    }

    public function convert_to_csv($input_array, $output_file_name, $delimiter) {
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

    public function emailFormsList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $data = EmailFormsTab::formList($request->tabId);
            $result = [
                'success' => TRUE,
                'data' => $data
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    private static function _uploadFile($file, string $uploadPath): string {
        $extension = $file->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_email_form.' . $extension;
        Helper::makeDirectory($uploadPath);
        if ($extension == 'jpg' || $extension == 'jpeg' || $extension == 'png' || $extension == 'bmp') {
            Image::make($file->getRealPath())
                    ->save($uploadPath . '/' . $fileName);
        } else { //for pdf, xlx,doc
            $file->move($uploadPath, $fileName);
        }
        return $fileName;
    }

    //upload directory path
    public static function getUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::UPLOAD_PATH);
    }

    //upload url is used by model function while returning file from database
    public static function getUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::UPLOAD_PATH);
    }

    public function saveEmailFormData(Request $request) {
        try {
            if (empty($request->form_id)) {
                throw new Exception('Form ID not found.');
            }
            $data = $request->all();
            $form_id = $data['form_id'];
            $form_data = EmailFormsTab::getFormInfo($form_id);
            $email = $form_data['email'];
            $subject = $form_data['subject'];
            $fields_data = $data['form_values'];
            $uploadedFilePath = [];
            $sorted_field = EmailFormFields::getFieldsId($form_id);
            
            foreach ($fields_data as $key => $value) {
                $fields_details = EmailFormFields::getFieldLabel($key);
                $field_id = $fields_details['id'];
                $field_type = $fields_details['field_type_id'];
                $properties = json_decode($fields_details['properties']);
                $label = $properties->label;
                $fields[$field_id]['label'] = $label;
                $fields[$field_id]['value'] = $value;
                $fields[$field_id]['field_type'] = $field_type;
            }
            
            $formEmpty = TRUE;
            foreach ($fields as $key => $item) {
                if ($item['field_type'] == 7 || $item['field_type'] == 10) {  //7 Name, 10 Phone
                    $fields[$key]['value'] = implode(' ', $item['value']);
                    foreach ($item['value'] as $val) {
                        if ($val != '') {
                            $formEmpty = FALSE;
                        }
                    }
                } else if ($item['field_type'] == 4) { //checkboxes                  
                    $cbox_arr = [];
                    $arr = $item['value'];
                    foreach ($arr as $key_cbox => $val_cbox) {
                        if ($val_cbox == "true") {
                            $cbox_arr[] = $key_cbox;
                            $formEmpty = FALSE;
                        }
                    }
                    if (!empty($cbox_arr)) {
                        $checkbox_checked = implode(',', $cbox_arr);
                    } else {
                        $checkbox_checked = "Checkbox not selected";
                    }

                    $fields[$key]['value'] = $checkbox_checked;
                } else if ($item['field_type'] == 16) { //file type 
                    $id = $key;
                    $email_form_file = $fields[$key]['value'];
                    if (!empty($email_form_file)) {
                        $file = self::_uploadFile($email_form_file[0], self::getUploadPath());
                        $fields[$key]['value'] = $file;
                        $fields[$key]['label'] = 'file';
                        //for db insertion
                        $data['form_values'][$id] = $file;

                        //file path to attach in email
                        $uploadFileLocation = self::getUploadPath();
                        $uploadedFilePath[] = $uploadFileLocation . '/' . $file;
                        $formEmpty = FALSE;
                    }
                } else if ($item['field_type'] == 11) { // Address type
                    foreach ($item['value'] as $val) {
                        if ($val != '') {
                            $formEmpty = FALSE;
                        }
                    }
                } else {
                    if ($item['field_type'] != 8 && $item['field_type'] != 9 && $fields[$key]['value'] != '') {
                        $formEmpty = FALSE;
                    }
                }
            }
            if ($formEmpty) {
                throw new Exception('Form is empty.');
            }

            $formData['form_id'] = $data['form_id'];
            $formData['value'] = json_encode($data['form_values']);

            $createdId = EmailFormFieldsVal::create($formData)->id;
            //send email if there is insertion
            if ($createdId != "" && $email != "") {
                $emailIds = explode(',', $email);
                $emails = [];
                foreach ($emailIds as $emailId) {
                    array_push($emails, trim($emailId));
                }
                $data = ['name' => 'User', 'email' => $emails, 'subject' => $subject, 'fields' => $fields, 'sorted_field' => $sorted_field];
                $mail = Mail::send('emails.emailFormValues', $data, function ($message) use ($data, $uploadedFilePath) {
                            $message->from('tappitmobapp@gmail.com', 'Tappit');
                            $message->to($data['email'])->subject($data['subject']);
                            if (!empty($uploadedFilePath)) {
                                foreach ($uploadedFilePath as $filePath) {
                                    $message->attach($filePath);
                                }
                            }
                        });
            }
            $result = [
                'success' => TRUE,
                'data' => $data,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function saveFileFormData(Request $request) {
        try {
            $data = $request->all();
            print_r($data);
            exit;
            $a = $request->file('file_value');
            $result = [
                'success' => TRUE,
                'data' => $data,
                'fileval' => $a
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    //download email form file
    public function emailFormDownload(Request $request) {
        try {
            $input_file = $request->formField;
            $uploadPath = self :: getUploadPath();
            $path = self :: getUploadURL();

            $file = $path . '/' . $input_file;
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));

            $filePath = $uploadPath . '/' . $input_file;

            if (file_exists($filePath) && ($extension == 'csv' || $extension == 'png' || $extension == 'jpeg' || $extension == 'jpg' || $extension == 'pdf' || $extension == 'doc' || $extension == 'docx' || $extension == 'xlsx')) {
                $csv = self :: download_file($file);
            } else {
                throw new Exception('File not found.');
            }

            $result = [
                'success' => TRUE
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function download_file($filename) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename=' . basename($filename));
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        ob_clean();
        flush();
        readfile($filename);
        exit;
    }

    public function getLastTwelveMonthData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = EmailFormFieldsVal::getLastTwelveMonthData($request->id);
            $totalData = array();
            foreach ($data as $val) {
                $totalData[$val->DATE] = $val->COUNT;
            }
            $result = [
                'success' => TRUE,
                'data' => $totalData
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

}
