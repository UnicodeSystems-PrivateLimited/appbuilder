<?php

namespace App\Http\Controllers\CustomerPortal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TpAppsTabEntity;
use App\Models\TpAppsConfig;
use App\Models\TabFunctions\EmailFormsTab;
use App\Models\TabFunctions\EmailFormFieldsVal;
use App\Models\TabFunctions\EmailFormFields;
use App\Models\TabFunctions\NewsLetterUsers;
use App\Models\TabFunctions\NewsLetterCategories;
use App\Models\TabFunctions\NewsLetterSettings;
use App\Helpers\Helper;
use Illuminate\Pagination\Paginator;
use App\Models\MstTpTabEntity;
use URL;
use PDF;

class CustomerSubmittedDataController extends Controller {

    /**
     * Init 
     */
    public function init(Request $request) {
        try {
            if (empty($request->appId)) {
                throw new Exception('App ID not found.');
            }
            $appId = $request->appId;
            $mst_mailingList_id = MstTpTabEntity::getMstTabId('mailing_list');
            $mst_emailform_id = MstTpTabEntity::getMstTabId('email_forms');
            $emailTabIds = TpAppsTabEntity::getAppTabsForSubmittedData($appId, $mst_emailform_id->id);
            $mailingTabIds = TpAppsTabEntity::getAppTabsForSubmittedData($appId, $mst_mailingList_id->id);
            $emailFormData = !empty($emailTabIds) ? EmailFormsTab::formListsForSubmittedData($emailTabIds) : [];
            $result = [
                'success' => TRUE,
                'emailFormData' => $emailFormData,
                'mailingTabIds' => $mailingTabIds,
                'emailTabIds' => $emailTabIds
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function listEmailFormEntriesForSubmittedData(Request $request, $currentPage = 1, $perPage = 20) {
        try {
            if (empty($request->formId)) {
                throw new Exception('Form ID not found.');
            }
            $formId = $request->formId;
            Paginator::currentPageResolver(function () use ($currentPage) {
                return $currentPage;
            });
            $formFields = EmailFormFields::getFormFields($formId);
            $fieldType = EmailFormFields:: select('id', 'field_type_id')->where('form_id', $formId)->get();
            $formdata = EmailFormFieldsVal::getFormEntriesForSubmittedData($formId, $request->search, $perPage);
            $fieldValues = [];
            $formFieldType = [];
            foreach ($fieldType as $field) {
                $formFieldType[$field->id] = $field->field_type_id;
            }
            foreach ($formdata as $entries) {
                $entryVals = json_decode($entries['value']);
                $fieldValueArr = ['_id' => $entries['id']];
                $fieldValueArr['created_at'] = date($entries['created_at']);
                foreach ($entryVals as $key => $val) {
                    $fieldValueArr['data'][$key] = ['id' => $key, 'value' => $val];
                }
                $fieldValues[] = $fieldValueArr;
            }
            foreach ($formFields as $k => $v) {
                $v->properties = json_decode($v->properties);
            }
            $finalfieldValuesArray = [];
            foreach ($fieldValues as $k => $value) {
                $timestamp = strtotime($value['created_at']);
                $date = date('d-m-Y', $timestamp);
                $finalfieldValuesArray[$date][] = $value;
            }
            $data = array(
                'header' => $formFields,
                'entries' => $finalfieldValuesArray,
                'field_type' => $formFieldType,
                'formdata' => $formdata
            );
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

    public function downloadPdf(Request $request) {
        try {
            if (empty($request->formId)) {
                throw new Exception('ID not found.');
            }
            $form_id = $request->formId;
            //get form attributes from tp_func_email_form_fields
            $form_fields = EmailFormFields :: getFormFields($form_id);
            foreach ($form_fields as $value) {
                $value->properties = json_decode($value->properties);
//                $nameValues[] = $properties->label;
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
            $singleTable = "";
            foreach ($fieldValues as $key => $entry) {
                $content = "";
                foreach ($form_fields as $field) {
                    if (isset($entry[$field->id])) {
                        $content = $content . "<tr><td width='200px'>" . $field->properties->label . "</td><td width='500px'>" . $entry[$field->id] . "</td></tr>";
                    }
                }
                if ($key == 0) {
                    $singleTable = $singleTable . "<div><table autosize='1.6' border='1' cellpadding='10'>" . $content . "</table></div>";
                } else {
                    $singleTable = $singleTable . "<div><pagebreak><table autosize='1.6' border='1' cellpadding='10'>" . $content . "</table></div>";  
                }
            }
            $header = array($form_fields);
            $dataArray = array_merge($header, $fieldValues);
            $pdf = PDF::Make();
            $pdf->SetTitle('Form Submissions');
            $pdf->SetDirectionality('ltr');
            $content = "<html><head><title>Form Submission</title></head><body>" . $singleTable . "</body></html>";
            $pdf->WriteHTML($content);
            return $pdf->Download('data.pdf');
        } catch (Exception $ex) {
            echo $ex->getMessage();
        }
    }

    public function getDayData(Request $request) {
        try {
            if (empty($request->formId)) {
                throw new Exception('ID not found.');
            }
            $data = EmailFormFieldsVal::getFullDayData($request->formId, $request->year, $request->month, $request->day);
            $dayData = 0;
            foreach ($data as $val) {
                $dayData = $dayData + $val->COUNT;
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

    public function getMonthData(Request $request) {
        try {
            if (empty($request->formId)) {
                throw new Exception('ID not found.');
            }
            $data = EmailFormFieldsVal::getMonthDataForSubmittedData($request->formId, $request->year, $request->month);
            $monthData = [];
            foreach ($data as $val) {
                $monthData[$val->DATE] = $val->COUNT;
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

    public function getYearData(Request $request) {
        try {
            if (empty($request->formId)) {
                throw new Exception('ID not found.');
            }
            $data = EmailFormFieldsVal::getYearDataForSubmittedData($request->formId, $request->year);
            $yearData = [];
            foreach ($data as $val) {
                $yearData[$val->DATE] = $val->COUNT;
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

    public function getBetweenTwoDateData(Request $request) {
        try {
            if (empty($request->formId)) {
                throw new Exception('ID not found.');
            }
            $data = EmailFormFieldsVal::getBetweenTwoDatesData($request->formId, $request->start_date, $request->end_date);
            $betweenTwoDayData = [];
            foreach ($data as $val) {
                $betweenTwoDayData[$val->DATE] = $val->COUNT;
            }

            $result = [
                'success' => TRUE,
                'data' => $betweenTwoDayData
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function listMailingListForSubmittedData(Request $request, $currentPage = 1, $perPage = 20) {
        try {
            if (empty($request->appId)) {
                throw new Exception('Form ID not found.');
            }
            $appId = $request->appId;
            Paginator::currentPageResolver(function () use ($currentPage) {
                return $currentPage;
            });
            $mst_mailingList_id = MstTpTabEntity::getMstTabId('mailing_list');
            $mailingTabIds = TpAppsTabEntity::getAppTabsForSubmittedData($appId, $mst_mailingList_id->id);
            $usersData = NewsLetterUsers::getUsersByTabIdForSubmittedData($mailingTabIds, $request->search, $perPage);
            $mailData = $usersData;
            foreach ($mailData as $key => $value) {
                $categoryName = NewsLetterCategories::getCategoryName(json_decode($value->category_id, true));
                $usersData[$key]->subscription = $categoryName;
            }
            $newsLetterSetting = NewsLetterSettings::getAutomaticUploadSettings($appId);
            $result = [
                'success' => TRUE,
                'data' => $usersData,
                'newsLetterSetting' => $newsLetterSetting
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function deleteUser(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            NewsLetterUsers::deleteUser($request->id);
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

    public function downloadCsvEmailList(Request $request) {
        try {
            if (empty($request->appId)) {
                throw new Exception('ID not found.');
            }
            $mst_mailingList_id = MstTpTabEntity::getMstTabId('mailing_list');
            $mailingTabIds = TpAppsTabEntity::getAppTabsForSubmittedData($request->appId, $mst_mailingList_id->id);
            $nameValues = array('name', 'email', 'birthday', 'zip', 'country');
            $data = NewsLetterCategories::getCategoryListForSubmittedData($mailingTabIds);

            $category = array();
            foreach ($data as $key => $value) {
                $category[$key]['id'] = $value['id'];
                $category[$key]['name'] = $value['name'];
                $nameValues[] = $value['name'];
                $catIdValues[] = $value['id'];
            }

            //get the category name associated with tab_id and append them in $nameValues array below
            $user = NewsLetterUsers :: getUsers($cat_id = "");
            if (isset($user) && !empty($user)) {
                foreach ($user as $key => $value) {
                    $newsUser[$key]['name'] = $value['name'];
                    $newsUser[$key]['email'] = $value['email'];
                    $newsUser[$key]['birthday'] = $value['birthday'];
                    $newsUser[$key]['zip'] = $value['zip'];
                    if (isset($value['country']) && $value['country'] != 0) {
                        $country = CountryCodeIso :: country($id);
                    } else {
                        $country = "";
                    }
                    $newsUser[$key]['country'] = $country;

                    $cat_id = $value['category_id'];
                    foreach ($catIdValues as $cat) {
                        if ($cat_id == $cat) {
                            $newsUser[$key][$cat] = 'Y';
                        } else {
                            $newsUser[$key][$cat] = 'N';
                        }
                    }
                }

                $header = array($nameValues);
                $dataArray = array_merge($header, $newsUser);
                $output_file_name = 'newsLetterUsers.csv';
                $delimiter = ',';
                $csv = self :: convert_to_csv($dataArray, $output_file_name, $delimiter);
            }
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

}
