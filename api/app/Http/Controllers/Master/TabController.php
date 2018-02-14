<?php

namespace App\Http\Controllers\Master;

use App\User;
use App\Models\TappitProfile;
use App\Models\MstTpTabEntity;
use Mail;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
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

class TabController extends Controller {

    protected $authenticator;
    protected $reminder;
    protected $reminder_validator;

    public function __construct(ReminderService $r, UserValidator $v) {
        $this->authenticator = App::make('authenticator');
        $this->reminder = $r;
        $this->reminder_validator = $v;
    }

    public function getTabList() {
        try {
            $response = [
                "success" => true,
            ];
            $list = MstTpTabEntity::getAllTabs();
            $response['data'] = $list;
        } catch (NotFoundException $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function createNewTab(Request $request) {
        try {
            $response = [
                "success" => true,
            ];
            $rules = array(
                'tab_name' => 'Required|unique:mst_tp_tab_entity|Min:3|Max:80',
                'tab_code' => 'Required|unique:mst_tp_tab_entity|Min:3|Max:80'
            );
            $validator = Validator::make($request->all(), $rules);
            if ($validator->fails()) {
                throw new NotFoundException($validator->errors());
            } else {
                $data = $request->all();
                MstTpTabEntity::create($data);
                $response['message'][] = 'Tab Saved Successfully';
            }
        } catch (NotFoundException $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function updateTabInfo(Request $request) {
        try {
            $response = [
                "success" => true,
            ];
            $formData = $request->all();
            $formData['id'] = $request->id;
            $rules = array(
                'tab_name' => 'Required|unique:mst_tp_tab_entity,tab_name,' . $request->id . '|Min:3|Max:80',
                'tab_code' => 'Required|unique:mst_tp_tab_entity,tab_code,' . $request->id . '|Min:3|Max:80'
            );
            $validator = Validator::make($formData, $rules);
            if ($validator->fails()) {
                throw new NotFoundException($validator->errors());
            } else {
                MstTpTabEntity::where('id', $request->id)->update($formData);
                $response['message'][] = 'Apps Saved Successfully';
            }
        } catch (NotFoundException $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function getTabInfo(Request $request) {
        try {
            $response = [
                "success" => true,
            ];
            $list = MstTpTabEntity::getTabInfo($request->id);
            $response['data'] = $list;
        } catch (NotFoundException $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

}
