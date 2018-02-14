<?php

namespace App\Http\Controllers\Apps;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Exception;
use Illuminate\Support\Facades\Storage;

class EditorUploadController extends Controller {

    const EDITOR_UPLOAD_DIRECTORY = 'app/public/editor';

    public function upload(Request $request) {
        try {
            $mimes = NULL;
            $uploadDirectoryPostfix = '';
            switch ($request->uploadType) {
                case 'image':
                    if (empty($request->appID) || !is_numeric($request->appID)) {
                        throw new Exception('App ID not found.');
                    }
                    $uploadDirectoryPostfix = '/' . $request->appID;
                    $mimes = 'mimes:jpeg,jpg,png,gif,svg';
                    break;
                case 'video':
                    $mimes = 'mimes:mp4,webm,ogg';
                    break;
                case 'file':
                    $mimes = 'mimes:doc,docx,html,htm,odt,pdf,xls,xlsx,ods,ppt,pptx,txt';
                    break;
                default:
                    throw new Exception('Invalid upload type.');
            };
            $this->validate(
                $request,
                ['file' => 'required|max:' . MAX_FILE_UPLOAD_SIZE . '|' . $mimes],
                ['file.max' => 'The file may not be greater than ' . MAX_FILE_UPLOAD_SIZE / 1024 . ' MB.']
            );
            $uploadDirectory = self:: EDITOR_UPLOAD_DIRECTORY . '/' . $request->uploadType . 's' . $uploadDirectoryPostfix;
            $fileName = self::uploadFile($request->file, storage_path($uploadDirectory), $request->uploadType);
            $result = ['link' => url('storage/' . $uploadDirectory . '/' . $fileName)];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
                'errors' => session('errors') ? session('errors')->all() : NULL
            ];
        }
        return response()->json($result);
    }

    public function loadImages(Request $request) {
        try {
            if (empty($request->appID) || !is_numeric($request->appID)) {
                throw new Exception('App ID not found.');
            }
            $imagePaths = Storage::disk('public')->files('editor/images/' . $request->appID);
            $result = [];
            foreach($imagePaths as $path) {
                $result[] = ['url' => url('storage/app/public/' . $path)];
            }
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    private static function uploadFile(UploadedFile $file, string $uploadPath, string $uploadType = 'file') {
        $extension = $file->getClientOriginalExtension();
        $fileName = $uploadType . '_' . Helper::getMilliTimestamp() . '.' . $extension;
        Helper::makeDirectory($uploadPath);
        $file->move($uploadPath, $fileName);
        return $fileName;
    }

}