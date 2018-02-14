<?php

namespace App\Http\Controllers;

use App\User;
use App\Models\TappitProfile;
use App\Models\TpAppsEntity;
use App\Models\Users;
use App\Models\Groups;
use App\Models\UsersGroups;
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
use Exception;
use App\Helpers\Helper;
use App\Models\ClientPermission;
use Illuminate\Pagination\Paginator;

class UserController extends Controller {

    protected $authenticator;
    protected $reminder;
    protected $reminder_validator;

    const LOGIN_LOGO_UPLOAD_PATH = 'app/public/functions/client_permission/login';
    const LOGIN_BG_UPLOAD_PATH = 'app/public/functions/client_permission/login';

    public function __construct(ReminderService $r, UserValidator $v) {
        $this->authenticator = App::make('authenticator');
        $this->reminder = $r;
        $this->reminder_validator = $v;
    }

    private static function _getCommonValidationRules(): array {
        return [
            'email' => 'required',
            'password' => 'required',
        ];
    }

    private static function _getValidationMessages() {
        return [
            'email' => 'email/username is required',
        ];
    }

    public function getUserLogin() {
        $authentication = App::make('authenticator');
        $user = $authentication->getLoggedUser();
        if ($user && $user->id) {
            if (Users::isCustomer($user->id)) {
                return Redirect::to('../app/#/pages/customerPortal');
            } else if (Users::isDeveloper($user->id)) {
                return Redirect::to('../app/#/pages/ipaRequestPortal');
            } else {
                return Redirect::to('../app/#/pages/myApp');
            }
        } else {
            return view('user.login');
        }
    }

    public function postUserLogin(Request $request) {
        list($email, $password, $remember) = $this->getLoginInput($request);

        try {
            if (Users::isCustomerByEmail($email)) {
                $errors = 'Invalid email & password';
                return redirect()->route("account.login")->withInput()->withErrors($errors);
            }
            $this->authenticator->authenticate(array(
                "email" => $email,
                "password" => $password
                    ), $remember);
        } catch (NotFoundException $e) {
            $errors = $this->authenticator->getErrors();
            return redirect()->route("account.login")->withInput()->withErrors($errors);
        } catch (AuthenticationErrorException $e) {
            $errors = $this->authenticator->getErrors();
            return redirect()->route("account.login")->withInput()->withErrors($errors);
        }
        if (Users::isDeveloperByEmail($email)) {
            return Redirect::to('../app/#/pages/ipaRequestPortal');
        } else {
            return Redirect::to('../app/#/pages/myApp');
        }
    }

    public function apiPostUserLogin(Request $request) {
        list($email, $password, $remember) = $this->getLoginInput($request);
        $response = [
            "success" => false,
        ];
        try {
            $this->authenticator->authenticate(array(
                "email" => $email,
                "password" => $password
                    ), $remember);
            $response['success'] = true;
        } catch (NotFoundException $e) {
            $errors = $this->authenticator->getErrors();
            $response['success'] = false;
            $response['message'] = $errors;
        } catch (AuthenticationErrorException $e) {
            $errors = $this->authenticator->getErrors();
            $response['success'] = false;
            $response['message'] = $errors;
        }
        return response()->json($response);
    }

    /**
     * @return array
     */
    private function getLoginInput(Request $request) {
        $email = $request->get('email');
        $password = $request->get('password');
        $remember = $request->get('remember');
        return array($email, $password, $remember);
    }

    public function getLogout() {
        $this->authenticator->logout();
        return redirect()->route('account.login');
    }

    /**
     * Forgot password
     */
    public function getReminder() {
        return view("user.forgot");
    }

    /**
     * Invio token per set nuova password via mail
     *
     * @return mixed
     */
    public function postReminder(Request $request) {
        try {
            if (empty($request->email)) {
                throw new NotFoundException('Email Required');
            }
            $count = User::where('email', $request->email)->count();
            if ($count) {
                $link = URL::route('account.reset-password');
                $token = csrf_token();
                $link = $link . '?_token=' . $token;
                $data = ['name' => 'User', 'email' => $request->email, 'link' => $link];
                $mail = Mail::send('emails.forgotPassword', $data, function ($message) use ($data) {
                            $message->from('tappitmobapp@gmail.com', 'Tappit');
                            $message->to($data['email'])->subject('Forgot Your Password');
                        });
                DB::table('users')->where('email', $request->email)->update(array('reset_password_code' => $token));
                return redirect()->route("account.reminder-success");
            } else {
                $errors = 'There is no user associated with this email.';
                return redirect()->route("account.recovery-password")->withErrors($errors);
            }
        } catch (NotFoundException $e) {
            $errors = $this->reminder->getErrors();
            return redirect()->route("account.recovery-password")->withErrors($errors);
        }
    }

    /**
     * Show the profile for the given user.
     *
     * @param  int $id
     * @return Response
     */
    public function showProfile($id) {
        return view('user.profile', ['user' => User::findOrFail($id)]);
    }

    public function getUserDashboard() {
        return view('user.dashboard');
    }

    public function editProfile(Request $request) {
        try {
            $authentication = App::make('authenticator');
            $user = $authentication->getLoggedUser();
            $response = [
                "success" => false,
            ];
            if ($user && $user->id) {
                if (empty($request->first_name)) {
                    throw new NotFoundException('First Name Required');
                }
                if (empty($request->last_name)) {
                    throw new NotFoundException('Last Name Required');
                }
                if (empty($request->email)) {
                    throw new NotFoundException('Email Required');
                }
                /**
                 * Email validation
                 */
                $validator = Validator::make(['email' => $request->email], [
                            'email' => 'Required|Email|unique:users,email,' . $user->id,
                ]);
                if ($validator->fails()) {
                    throw new NotFoundException($validator->errors());
                }
                $data = ['name' => 'User', 'email' => $user->email, 'old' => $user->email, 'new' => $request->email];
                $mail = Mail::send('emails.changeEmail', $data, function ($message) use ($data) {
                            $message->from('tappitmobapp@gmail.com', 'Tappit');
                            $message->to($data['email'])->subject('Reset Email');
                        });
                DB::table('users')->where('id', $user->id)->update(array('email' => $request->email));
                DB::table('tappit_profile')->where('user_id', $user->id)->update(array('first_name' => $request->first_name, 'last_name' => $request->last_name));
                $response["success"] = true;
                $response["message"] = "Profile saved successfully";
            } else {
                throw new NotFoundException('Invalid Request');
            }
        } catch (NotFoundException $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function changePassword(Request $request) {
        try {
            $authentication = App::make('authenticator');
            $user = $authentication->getLoggedUser();
            if ($user && $user->id) {
                $userData = User::where('id', $user->id)->get();
                $response = [];
                $oldPwd = $userData[0]['password'];
                if (empty($request->old_password)) {
                    throw new NotFoundException('Old Password Required');
                }
                if (empty($request->new_password)) {
                    throw new NotFoundException('New Password Required');
                }
                if (empty($request->confirm_password)) {
                    throw new NotFoundException('Confirm Password Required');
                }
                if (!password_verify($request->old_password, $oldPwd)) {
                    throw new NotFoundException('Old Password Not Valid');
                }

                if ($request->new_password != $request->confirm_password) {
                    throw new NotFoundException('New Password & Confirm Password should match');
                }
                $new_password = bcrypt($request->new_password);
                DB::table('users')->where('id', $user->id)->update(array('password' => $new_password));
                $response['success'] = true;
                $response['message'] = 'Password changed successfully';
                $pathtofile = URL::asset('resources/assets/images/email/logo.png');
                $data = ['name' => 'User', 'email' => $user->email, 'logo_file_path' => $pathtofile];
                $mail = Mail::send('emails.changePassword', $data, function ($message) use ($data) {
                            $message->from('tappitmobapp@gmail.com', 'Tappit');
                            $message->to($data['email'])->subject('Reset Password');
                        });
            } else {
                throw new NotFoundException('Invalid Request');
            }
        } catch (NotFoundException $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function editProfileImage(Request $request) {
        $response = [
            "success" => false,
        ];
        try {
            $authentication = App::make('authenticator');
            $user = $authentication->getLoggedUser();
            if ($user && $user->id) {
                $image = $request->file('file');
                if (!$image) {
                    throw new NotFoundException('File Not Found');
                }
                $file = array('image' => $image);
                $rules = array('image' => 'required'); //mimes:jpeg,bmp,png and for max size max:10000
                $validator = Validator::make($file, $rules);
                if ($validator->fails()) {
                    throw new NotFoundException('Invalid file');
                } else {
                    // checking file is valid.
                    if ($image->isValid()) {
                        $destinationPath = storage_path('app/user/image');
                        $extension = $image->getClientOriginalExtension(); // getting image extension
                        $fileName = rand(11111, 99999) . '.' . $extension; // renameing image
                        $image->move($destinationPath, $fileName); // uploading file to given path               
                        DB::table('tappit_profile')->where('user_id', $user->id)->update(array('avatar' => $fileName));
                        $response['success'] = true;
                        $response['message'] = 'Image changed successfully';
                    }
                }
            } else {
                $response['success'] = false;
                $response["message"] = "Invalid Request";
            }
        } catch (NotFoundException $e) {
            $response['success'] = false;
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function getProfile() {
        $response = [
            "success" => false,
        ];
        try {
            $authentication = App::make('authenticator');
            $user = $authentication->getLoggedUser();
            if ($user && $user->id) {
                $userData = DB::table('users')
                                ->select(DB::raw("`users`.`email`, `tappit_profile`.`first_name`, `tappit_profile`.`last_name`, `tappit_profile`.`avatar`, `groups`.`id` as `role`, tae.id as app_id, tae.app_code as app_code"))
                                ->leftjoin('tappit_profile', 'users.id', '=', 'tappit_profile.user_id')
                                ->leftJoin('users_groups', 'users_groups.user_id', '=', 'users.id')
                                ->leftJoin('groups', 'groups.id', '=', 'users_groups.group_id')
                                ->leftJoin('tp_apps_entity as tae', 'tae.client_email', '=', 'users.email')
                                ->where('users.id', $user->id)->first();
                $response["success"] = true;
                $response["data"] = $userData;
            } else {
                throw new NotFoundException('Invalid Request');
            }
        } catch (NotFoundException $e) {
            $response['message'] = $e->getMessage();
        }
        return response()->json($response);
    }

    public function resetPassword() {
        return view("user.reset-password");
    }

    public function checkPassword(Request $request) {
        try {
            if (empty($request->password)) {
                throw new NotFoundException('Password Required');
            }
            if (empty($request->_token)) {
                throw new NotFoundException('Token Required');
            }
            $password = $request->input('password');
            $pwd = bcrypt($password);
            $_token = $request->input('_token');
            DB::table('users')->where('reset_password_code', $_token)->update(array('password' => $pwd, 'reset_password_code' => NULL));
            return redirect()->route("account.password-reset-success")->withInput()->withErrors('testing');
        } catch (NotFoundException $e) {
            $errors = $this->authenticator->getErrors();
            return redirect()->route("account.reset-password")->withInput()->withErrors($errors);
        }
    }

    public function getPing() {
        $authentication = App::make('authenticator');
        $user = $authentication->getLoggedUser();
        if (!$user || !$user->id) {
            $res = ['session' => false];
        } else {
            $res = ['session' => true];
        }
        return response()->json($res);
    }

    //Login Logo Image URL
    public static function getLoginLogoImageUploadUrl(): string {
        return Helper::getUploadDirectoryURL(self::LOGIN_LOGO_UPLOAD_PATH);
    }

//Login BG Image URL
    public static function getLoginBgImageUploadUrl(): string {
        return Helper::getUploadDirectoryURL(self::LOGIN_BG_UPLOAD_PATH);
    }

    public function getCustomerLogin() {
        $row = ClientPermission:: get_data_by_app_id($appId = 0);
        $default_id = $row->id;
        if (isset($default_id)) {
            $client_cms_data = ClientPermission:: get_settings_data($default_id, $scope = 'global');
            $settings = $client_cms_data['settings'];
            $settings_data = json_decode($settings, true);

            $login_logo_image = $settings_data['login_page']['login_logo'];
            if (isset($login_logo_image) && $login_logo_image != "") {
                $login_logo_url1 = self:: getLoginLogoImageUploadUrl();
                $settings_data['login_page']['login_logo'] = $login_logo_url1 . '/' . $login_logo_image;
            }

            $login_bg_image = $settings_data['login_page']['login_bg_image'];
            if (isset($login_bg_image) && $login_bg_image != "") {
                $login_bg_url1 = self:: getLoginBgImageUploadUrl();
                $settings_data['login_page']['login_bg_image'] = $login_bg_url1 . '/' . $login_bg_image;
            }
//            } else {
//                $pathtofile = URL::asset('resources/assets/images/email/logo.png');
//                $settings_data['login_page']['login_bg_image'] = $pathtofile;
//            }
        }
        if ($settings_data['login_page']['login_bg_repeat'] == 1) {
            $repeat = 'repeat';
            $bgsize = 'initial';
        } else {
            $repeat = 'no-repeat';
            $bgsize = 'cover';
        }
        return View::make('user.customer-login')->with(['login_logo' => $settings_data['login_page']['login_logo'], 'login_bg_color' => $settings_data['login_page']['login_bg_color'], 'text_color_login' => $settings_data['login_page']['text_color_login'], 'login_bg_image' => $settings_data['login_page']['login_bg_image'], 'login_bg_repeat' => $repeat, 'bgsize' => $bgsize]);
//        return view('user.customer-login');
    }

    public function postCustomerLogin(Request $request) {
        try {
            $data = $request->all();
            $validator = Validator::make($data, array_merge(self::_getCommonValidationRules()), self::_getValidationMessages());
            if ($validator->fails()) {
                $errors = $validator->errors()->unique();
                return redirect()->route("account.customer.login")->withErrors($errors);
            }
            $email = $data['email'];
            //check for email or username
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                //get client_email from  tp_apps_entity
//                $username = $email;
//                $email = TpAppsEntity:: getAppEmail($username);
                $password = $data['password'];
                $remember = 0;

                $this->authenticator->authenticate(array(
                    "email" => $email,
                    "password" => $password
                        ), $remember);

                $authentication = App::make('authenticator');
                $user = $authentication->getLoggedUser();

                //check if group of user is 'customer' by this user_id. 
                //if user is customer then redirect to customer portal otherwise dont login him
                // get user group and permissions
                $user_permissions = Users:: user_group($user['id']);
                $userType = $user_permissions[0]->userType;
                if (!empty($userType) && $userType == 'customer') {
                    //get app_id of customer    
//                    $app_id = TpAppsEntity::getAppIdByEmail($email);

                    return Redirect::to('../app/#/pages/customerPortal');
                } else {
                    $errors = ['Not a valid customer'];
                    return redirect()->route("account.customer.login")->withErrors($errors);
                }
            } else {
                $errors = ['Please enter the username.'];
                return redirect()->route("account.customer.login")->withErrors($errors);
            }
        } catch (NotFoundException $e) {
            $errors = $this->authenticator->getErrors();
            return redirect()->route("account.customer.login")->withErrors($errors);
        } catch (AuthenticationErrorException $e) {
            $errors = $this->authenticator->getErrors();
            return redirect()->route("account.customer.login")->withErrors($errors);
        }
        return Redirect::to('../app/#/pages/customerPortal');
    }

    public function getClientLogout() {
        $this->authenticator->logout();
        return redirect()->route('account.customer.login');
    }

    public function createGroups(Request $request) {
        try {
            if (empty($request->name)) {
                throw new Exception('group name not found');
            }
            if (empty($request->permissions)) {
                throw new Exception('permissions not found');
            }
            $permissions = json_encode($request->permissions, JSON_NUMERIC_CHECK);
            $group = [
                'name' => $request->name,
                'permissions' => $permissions
            ];
            $checkGroupExists = Groups::getGroupByName($request->name);
            if (empty($checkGroupExists)) {
                Groups::create($group);
            } else {
                throw new Exception('group already exits');
            }
            $res = [
                "success" => TRUE,
                "message" => 'group successfully created'
            ];
        } catch (Exception $ex) {
            $res = [
                "success" => FALSE,
                "message" => $ex->getMessage()
            ];
        }
        return response()->json($res);
    }

    public function createDeveloperUser(Request $request) {
        try {
            if (empty($request->email)) {
                throw new Exception('email not found');
            }
            if (empty($request->name)) {
                throw new Exception('name not found');
            }
            if (empty($request->password)) {
                throw new Exception('password not found');
            }
            $data = $request->all();
            //CHECK IF client_email exists in table "users"
            $password = bcrypt($data['password']);
            $created_at = date('Y-m-d h:i:s');
            $checkGroupExists = Groups::getGroupByName('developer');
            if (!empty($checkGroupExists)) {
                $customer_email_exist = Users:: isDeveloperByEmail($data['email']);
                if (!$customer_email_exist) {

                    //create entry to users table
                    $user_details = ['email' => $data['email'], 'password' => $password, 'permissions' => '', 'activated' => 1, 'banned' => 0, 'activation_code' => '', 'activated_at' => '', 'last_login' => '', 'persist_code' => '', 'reset_password_code' => '', 'protected' => '', 'created_at' => $created_at, 'updated_at' => $created_at];
                    $userId = Users::create($user_details)->id;

                    //create users_groups table entry
                    $user_group_details = ['user_id' => $userId, 'group_id' => $checkGroupExists->id];
                    UsersGroups::create($user_group_details);

                    if (isset($data['phone'])) {
                        $phone = $data['phone'];
                    } else {
                        $phone = '';
                    }
                    //create entry to tappit_profile
                    $user_profile = ['user_id' => $userId, 'code' => '', 'vat' => '', 'first_name' => $data['name'], 'last_name' => '', 'phone' => $phone, 'state' => '', 'city' => '', 'avatar' => '', 'country' => '', 'zip' => '', 'address' => '', 'created_at' => $created_at, 'updated_at' => $created_at];
                    TappitProfile:: create($user_profile);
                } else {
                    throw new Exception('email already taken');
                }
            } else {
                throw new Exception('please create group first');
            }
            $res = [
                "success" => TRUE,
                "message" => 'User created successfully'
            ];
        } catch (Exception $ex) {
            $res = [
                "success" => FALSE,
                "message" => $ex->getMessage()
            ];
        }
        return response()->json($res);
    }

    public function saveUser(Request $request) {
        try {
            $rules = [
                'first_name' => 'required|max:50',
                'last_name' => 'max:50',
                'email' => 'required|email|max:255',
                'password' => 'required_without:id|max:255',
                'activated' => 'required|integer|min:0|max:1',
            ];
            $messages = [
                'password.required_without' => 'The password field is required.',
                'activated.required' => 'The status field is required.'
            ];
            $validator = Validator::make($request->all(), $rules, $messages);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }

            $userData = [
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'activated' => $request->activated ? 1 : 0,
                'banned' => $request->activated ? 0 : 1
            ];
            if (empty($request->id)) {
                $userID = Users::create($userData)->id;
                $userGroupData = [
                    'user_id' => $userID,
                    'group_id' => UsersGroups::ADMIN_GROUP_ID
                ];
                UsersGroups::create($userGroupData);
            } else {
                if (empty($request->password)) {
                    unset($userData['password']);
                }
                Users::where('id', $request->id)->update($userData);
                $userID = $request->id;
            }

            $tappitProfileData = [
                'user_id' => $userID,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name
            ];
            if (empty($request->id)) {
                TappitProfile:: create($tappitProfileData);
            } else {
                TappitProfile::where('user_id', $request->id)->update($tappitProfileData);
            }

            $result = [
                'success' => TRUE,
                'message' => 'User saved successfully.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function getAdminUsers(Request $request) {
        try {
            $filters = $request->all();
            $filters['perPage'] = $filters['perPage'] ?? 10;
            $filters['currentPage'] = $filters['currentPage'] ?? 1;
            Paginator::currentPageResolver(function () use ($filters) {
                return $filters['currentPage'];
            });
            $result = [
                'success' => TRUE,
                'data' => Users::getAdminUsers($filters)
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function getUserDetail(Request $request) {
        try {
            $data = Users::getUserDetail($request->id);
            if (empty($data)) {
                throw new Exception('No data found.');
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

}
