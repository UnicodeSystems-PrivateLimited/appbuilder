<?php
namespace App\Http\Controllers\Master;

use App\User;
use App\Models\MstTpAppsTabsIcon;
use App\Models\TpAppsTabEntity;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Helpers\Helper;
use LaravelAcl\Authentication\Validators\ReminderValidator;
use LaravelAcl\Authentication\Services\ReminderService;
use LaravelAcl\Authentication\Interfaces\AuthenticateInterface;
use LaravelAcl\Authentication\Validators\UserValidator;
use LaravelAcl\Library\Exceptions\NotFoundException;
use LaravelAcl\Authentication\Exceptions\AuthenticationErrorException;
use LaravelAcl\Authentication\Exceptions\PermissionException;
use View,
    URL,
    Redirect,
    App,
    DB,
    Config,
    Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Pagination\Paginator;
use Exception;

class IconController extends Controller
{

    public function getBlackIcons($currentPage = 1)
    {
        try {
            $response = [
                "success" => true,
            ];
            $perPage = 12;
            Paginator::currentPageResolver(function () use ($currentPage) {
                return $currentPage;
            });
            $list = MstTpAppsTabsIcon::getIcons(MstTpAppsTabsIcon::TYPE_BLACK, $perPage);
            $response['data'] = $list;
        } catch (Exception $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function getWhiteIcons($currentPage = 1)
    {
        try {
            $response = [
                "success" => true,
            ];
            $perPage = 12;
            Paginator::currentPageResolver(function () use ($currentPage) {
                return $currentPage;
            });
            $list = MstTpAppsTabsIcon::getIcons(MstTpAppsTabsIcon::TYPE_WHITE, $perPage);
            $response['data'] = $list;
        } catch (Exception $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function getColorIcons($currentPage = 1)
    {
        try {
            $response = [
                "success" => true,
            ];
            $perPage = 12;
            Paginator::currentPageResolver(function () use ($currentPage) {
                return $currentPage;
            });
            $list = MstTpAppsTabsIcon::getIcons(MstTpAppsTabsIcon::TYPE_COLOR, $perPage);
            $response['data'] = $list;
        } catch (Exception $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function getColorIconsSection($currentPage = 1)
    {
        try {
            $response = [
                "success" => true,
            ];
            $perPage = 24;
            Paginator::currentPageResolver(function () use ($currentPage) {
                return $currentPage;
            });
            $list = MstTpAppsTabsIcon::getColorIconsSection(MstTpAppsTabsIcon::TYPE_COLOR, $perPage);
            $response['data'] = $list;
        } catch (Exception $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function savecolorsection(Request $request) {
        $data = $request->all();
        if(empty($data) || !$data['image']) {
            throw new Exception('Images not found.');
        }
        $validator = Validator::make($data, [
            'images.*' => 'mimes:jpeg,jpg,png|max|gif:' . MAX_FILE_UPLOAD_SIZE
        ], ['max' => 'The :attribute value is too large.']);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        $attributeNames = [];
        for ($i = 0; $i < 10; $i++) {
            $attributeNames['images.' . $i] = 'image ' . ($i + 1);
        }
        $validator->setAttributeNames($attributeNames);
        if ($validator->fails()) {
            $messages = $validator->errors();
            if ($messages->has('images')) {
                $errors = json_encode(['images' => $messages->get('images')]);
            } else {
                $errors = $messages;
            }
            throw new Exception($errors);
        }
        $path = 'public/icons/color';
        $fileNamePostfix = '_colorIcon';
        $width = 274;
        $height = 274;
        foreach ($data['image'] as $key => $image) {
            $fileName = Helper::uploadImage($image, $path, $fileNamePostfix . $key, $width, $height);
            $insertArr = [
                'type' => MstTpAppsTabsIcon::TYPE_COLOR,
                'name' => $fileName,
                'status' => MstTpAppsTabsIcon::STATUS_ENABLED,
            ];
            MstTpAppsTabsIcon::create($insertArr);
        }
        $result = parent::getSuccessResponse('Image Uploaded Successfully');
        return response()->json($result);
    }

    public function deleteColorIcon(Request $request) {
        if($request->id) {
            $icon_data = MstTpAppsTabsIcon::find($request->id);
            //$icon_name = 'color/'.$icon_data['name'];
            $icon_name = $icon_data['name'];
            $icon_data_exist = TpAppsTabEntity::checkIconExist($icon_name);
            if(!$icon_data_exist) {
                MstTpAppsTabsIcon::where('id', $request->id)->delete();
            } else {  
                throw new Exception('Cant delete. Icon is in used');
            }
        }
        $result = parent::getSuccessResponse('Icon deleted Successfully');
        return response()->json($result);
    }
    
    public function getPhotosIcons($currentPage = 1) {
        try {
            $response = [
                "success" => true,
            ];
            $perPage = 12;
            Paginator::currentPageResolver(function () use ($currentPage) {
                return $currentPage;
            });
            $list = MstTpAppsTabsIcon::getPhotosIcons(MstTpAppsTabsIcon::TYPE_PHOTOS, $perPage);
            $response['data'] = $list;
        } catch (Exception $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function getPhotosIconsSection($currentPage = 1)
    {
        try {
            $response = [
                "success" => true,
            ];
            $perPage = 24;
            Paginator::currentPageResolver(function () use ($currentPage) {
                return $currentPage;
            });
            $list = MstTpAppsTabsIcon::getPhotosIconsSection(MstTpAppsTabsIcon::TYPE_PHOTOS, $perPage);
            $response['data'] = $list;
        } catch (Exception $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function savePhotosIconSection(Request $request) {
        $data = $request->all();
        if(empty($data) || !$data['image']) {
            throw new Exception('Images not found.');
        }
        $validator = Validator::make($data, [
            'images.*' => 'mimes:jpeg,jpg,png|max|gif:' . MAX_FILE_UPLOAD_SIZE
        ], ['max' => 'The :attribute value is too large.']);
        if ($validator->fails()) {
            throw new Exception($validator->errors());
        }
        $attributeNames = [];
        for ($i = 0; $i < 10; $i++) {
            $attributeNames['images.' . $i] = 'image ' . ($i + 1);
        }
        $validator->setAttributeNames($attributeNames);
        if ($validator->fails()) {
            $messages = $validator->errors();
            if ($messages->has('images')) {
                $errors = json_encode(['images' => $messages->get('images')]);
            } else {
                $errors = $messages;
            }
            throw new Exception($errors);
        }
        $path = 'public/icons/photos';
        $fileNamePostfix = '_photosIcon';
        $width = 274;
        $height = 274;
        foreach ($data['image'] as $key => $image) {
            $fileName = Helper::uploadImage($image, $path, $fileNamePostfix . $key, $width, $height);
            $insertArr = [
                'type' => MstTpAppsTabsIcon::TYPE_PHOTOS,
                'name' => $fileName,
                'status' => MstTpAppsTabsIcon::STATUS_ENABLED,
            ];
            MstTpAppsTabsIcon::create($insertArr);
        }
        $result = parent::getSuccessResponse('Image Uploaded Successfully');
        return response()->json($result);
    }

    public function deletephotosIcon(Request $request) {
        if($request->id) {
            $icon_data = MstTpAppsTabsIcon::find($request->id);
            //$icon_name = 'photos/'.$icon_data['name'];
            $icon_name = $icon_data['name'];
            $icon_data_exist = TpAppsTabEntity::checkIconExist($icon_name);
            if(!$icon_data_exist) {
                MstTpAppsTabsIcon::where('id', $request->id)->delete();
            } else {  
                throw new Exception('Cant delete. Icon is in used');
            }
        }
        $result = parent::getSuccessResponse('Icon deleted Successfully');
        return response()->json($result);
    }

    public function storeIcons()
    {
        try {
            // foreach (glob(storage_path('app/public/icons') . '/*.*') as $fileName) {
            //     $fileName = explode('/', $fileName);
            //     $fileName = end($fileName);
            //     if (substr($fileName, 0, 2) === 'w_') {
            //         $insertArr = [
            //             'type' => MstTpAppsTabsIcon::TYPE_WHITE,
            //             'name' => $fileName,
            //             'status' => MstTpAppsTabsIcon::STATUS_ENABLED,
            //         ];
            //     } else {
            //         $insertArr = [
            //             'type' => MstTpAppsTabsIcon::TYPE_BLACK,
            //             'name' => $fileName,
            //             'status' => MstTpAppsTabsIcon::STATUS_ENABLED,
            //         ];
            //     }
            //     MstTpAppsTabsIcon::create($insertArr);
            // }

            foreach (glob(storage_path('app/public/icons/color') . '/*.*') as $fileName) {
                $fileName = explode('/', $fileName);
                $fileName = end($fileName);
                if (substr($fileName, 0, 8) === '06112017') {
                    $insertArr = [
                        'type' => MstTpAppsTabsIcon::TYPE_COLOR,
                        'name' => $fileName,
                        'status' => MstTpAppsTabsIcon::STATUS_ENABLED,
                    ];
                    MstTpAppsTabsIcon::create($insertArr);
                }
            }
        } catch (Exception $ex) {

        }
    }

}
