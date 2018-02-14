<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use App\Helpers\Helper;
use App\Models\TabFunctions\PDFTab;
use App\Models\TpAppsTabEntity;

class PDFTabController extends Controller {

    private static function _getCommonValidationRules(): array {
        return [
            'name' => 'required|max:256',
            'section' => 'max:256',
            'url' => 'url',
            'pdf' => 'mimes:pdf',
        ];
    }

    public static function getPDFUploadURL(): string {
        return Helper::getUploadDirectoryURL(Helper::PDF_UPLOAD_PATH);
    }

    public function create(Request $request) {
        try {
            $data = $request->all();

            $pdf = $request->file('pdf');
            $data['pdf'] = $pdf;
            $validator = Validator::make($data, array_merge(self::_getCommonValidationRules(), ['tab_id' => 'required|integer']));
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            if (empty($pdf) && empty($data['url'])) {
                throw new Exception('PDF file not found.');
            }
            if (!empty($pdf)) {
                $data['file_name'] = self::_uploadPDF($pdf);
                $data['url'] = self::getPDFUploadURL() . '/' . $data['file_name'];
            } else {
                $urlExplode = explode('/', $data['url']);
                $fileName = end($urlExplode);
                $fileNameExplode = explode('.', $fileName);
                if (strtolower(end($fileNameExplode)) !== 'pdf') {
                    throw new Exception('Invalid PDF URL');
                }
                $data['file_name'] = $fileName;
            }
            unset($data['pdf']);

            PDFTab::create($data);
            $result = [
                'success' => TRUE,
                'message' => ['PDF successfully added.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function edit(Request $request) {
        try {
            $data = $request->all();

            $pdf = $request->file('pdf');
            $data['pdf'] = $pdf;
            $validator = Validator::make($data, array_merge(self::_getCommonValidationRules(), ['id' => 'required|integer']));
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            if (empty($pdf) && empty($data['url'])) {
                throw new Exception('PDF file not found.');
            }
            if (!empty($pdf)) {
                $data['file_name'] = self::_uploadPDF($pdf);
                $data['url'] = self::getPDFUploadURL() . '/' . $data['file_name'];
            } else {
                $urlExplode = explode('/', $data['url']);
                $fileName = end($urlExplode);
                $fileNameExplode = explode('.', $fileName);
                if (strtolower(end($fileNameExplode)) !== 'pdf') {
                    throw new Exception('Invalid PDF URL');
                }
                $data['file_name'] = $fileName;
            }
            unset($data['pdf']);

            PDFTab::where('id', $request->id)->update($data);
            $result = [
                'success' => TRUE,
                'message' => ['PDF successfully edited.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $result = [
                'success' => TRUE,
                'data' => PDFTab::getPdfFileList($request->tabId)
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getAllData(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $data = [
                'pdfList' => PDFTab::getPdfFileList($request->tabId),
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
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

    public function sortItem(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            PDFTab::updateMultiple($sortData);
            $result = [
                'success' => TRUE,
                'data' => 'Item order saved.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function delete(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            PDFTab::deleteMultiple($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Pdf successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = PDFTab::getItemData($request->id);
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

    /**
     * Saves the PDF file and returns the saved file name.
     *
     * @param \Illuminate\Http\UploadedFile|array $pdf
     * @return string
     */
    private static function _uploadPDF($pdf) {
        $extension = $pdf->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . "_pdf." . $extension;
        $uploadPath = self::getUploadPath();
        Helper::makeDirectory($uploadPath);
        $pdf->move($uploadPath, $fileName);
        return $fileName;
    }

    public static function getUploadPath(): string {
        return Helper::getUploadDirectoryPath(Helper::PDF_UPLOAD_PATH);
    }

    public function appInit(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $data = [
                'pdfList' => PDFTab::getSectionWisePdfList($request->tabId),
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
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
}
