<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use App\Models\TabFunctions\MembershipUser;
use App\Models\TabFunctions\MembershipUserTemp;
use App\Models\TabFunctions\MembershipGroup;
use App\Models\TpAppsTabEntity;
use App\Helpers\Helper;
use Mail;
use View,
    URL,
    Redirect,
    Input,
    App;

class MembershipController extends Controller {

    const CSV_UPLOAD_PATH = 'app/public/functions/membership/csv/';

    const TEMPLATE_UPLOAD_PATH = 'resources/views/membershipTemplate/';

    private static function _getCommonValidationRules(): array {
        return [
            'password' => 'required|max:256',
            'password_confirmation' => 'required|same:password',
        ];
    }

    private static function _getValidationMessages() {
        return [];
    }


    private static function _getCommonValidationRulesInviteUser(): array {
        return [
            'tab_id' => 'required|integer',
            'from_email' => 'required|email',
        ];
    }

    private static function _getValidationMessagesInviteUser() {
        return [];
    }

    private static function _getCommonValidationRulesSettings(): array {
        return [
            'user_name' => "required_if:type,2",
            'password' => "required_if:type,2"
        ];
    }

    private static function _getValidationMessagesSettings() {
        return [
            'user_name.required_if' => 'UserName is required.',
            'password.required_if' => 'Password is required.',
        ];
    }

    private static function _getCommonValidationRulesGuest(): array {
        return [
            'user_name' => 'required'
        ];
    }

    private static function _getValidationMessagesGuest() {
        return [];
    }

    private static function _getCommonValidationRulesMemberRegister(): array {
        return [
            'user_name' => 'required|max:256|unique:tp_func_membership_user',
            'password' => 'required|min:6|max:256',
            'password_confirmation' => 'required|same:password'
        ];
    }

    private static function _getValidationMessagesMemberRegister() {
        return [];
    }

    /**
     * Load Initial Tab Details with user list and group list
     */
    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }

            $data = [
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
                'appTabs' => TpAppsTabEntity::getAppTabsForMembership($request->appId),
                'groupList' => MembershipGroup::getGroupList($request->tabId),
                'multipleUserList' => MembershipUser::getUserList($request->tabId),
                'singleUserData' => MembershipUser::getSingleUser($request->tabId, 2),
                'guestUser' => MembershipUser :: getSingleUser($request->tabId, 1)
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

    /**
     * Add/Edit Group
     */
    public function saveGroup(Request $request) {
        try {
            $data = $request->all();

            $rules = $request->id ? ['id' => 'required|integer', 'group_name' => 'required|unique:tp_func_membership_groups,group_name,'. $request->id .',id,tab_id,' . $request->tab_id] : ['tab_id' => 'required|integer', 'group_name' => 'required|unique:tp_func_membership_groups,group_name,id,'. NULL .',tab_id,'. $request->tab_id];
            $validator = Validator::make($data, $rules);

            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()->unique()));
            }

            if (!empty($data['tabs_access'])) {
                $tabs_access = $data['tabs_access'];
                $tabs_access_json = json_encode($tabs_access);
                $data['tabs_access'] = $tabs_access_json;
            } else {
                $data['tabs_access'] = NULL;
            }

            if ($request->id) {
                MembershipGroup::where('id', $request->id)->update($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Group successfully edited.'],];
            } else {
                MembershipGroup::create($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Group successfully added.'],
                ];
            }
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    /**
     * get the Group item data
     */
    public function getGroupItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = MembershipGroup::getItemData($request->id);
            if (!empty($data['tabs_access'])) {
                $data['tabs_access'] = json_decode($data['tabs_access']);
            }
            $data = [
                'itemData' => $data
            ];

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
     * Load the Group list
     */
    public function listGroup(Request $request) {
        try {

            $data = MembershipGroup::getGroupList($request->tab_id);
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

    /**
     * delete Group
     */
    public function deleteGroup(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            MembershipGroup::deleteGroup($request->id);
            MembershipUser::updateUserByGroup($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Group successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    /**
     * Add/Edit User
     */
    public function saveUser(Request $request) {
        try {
            $data = $request->all();
            $rules = $request->id ? ($request->password ? ['id' => 'required|integer', 'user_name' => 'required|max:256|unique:tp_func_membership_user,user_name,'. $request->id .',id,tab_id,' . $request->tab_id, 'email' => 'email|unique:tp_func_membership_user,email,'. $request->id .',id,tab_id,' . $request->tab_id, 'password' => 'max:256', 'password_confirmation' => 'required|same:password'] : ['id' => 'required|integer', 'user_name' => 'required|max:256|unique:tp_func_membership_user,user_name,'. $request->id .',id,tab_id,' . $request->tab_id, 'email' => 'email|unique:tp_func_membership_user,email,'. $request->id .',id,tab_id,' . $request->tab_id]) : ['tab_id' => 'required|integer', 'user_name' => 'required|max:256|unique:tp_func_membership_user,user_name,id,'. NULL .',tab_id,'. $request->tab_id, 'email' => 'email|unique:tp_func_membership_user,email,id,'. NULL .',tab_id,'. $request->tab_id, 'password' => 'required|max:256', 'password_confirmation' => 'required|same:password'];
//            $validator = Validator::make($data, array_merge(self::_getCommonValidationRules(), $rules), self::_getValidationMessages());
            $validator = Validator::make($data, $rules, self::_getValidationMessages());

            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()));
            }
            if (!empty($data['tabs_access'])) {
                $tabs_access = $data['tabs_access'];
                $tabs_access_json = json_encode($tabs_access);
                $data['tabs_access'] = $tabs_access_json;
                //in edit mode if user form has tab access ids, then empty the group_id field in db
                if ($request->id) {
                    $data['group_id'] = "";
                }
            } else {
                $data['tabs_access'] = NULL;
            }

            if (!empty($data['group_id'])) {
                //in edit mode if user form has tab group_id, then empty the tabs_access field in db
                if ($request->id) {
                    $data['tabs_access'] = "";
                }
            }

            unset($data['password_confirmation']);
//            $data['status'] = 1; // Active User
            if ($request->id) {
                if($request->password == NULL){
                    unset($data['password']);
                }
                MembershipUser::where('id', $request->id)->update($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['User successfully edited.'],
                    ];
            } else {
                MembershipUser::create($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['User successfully added.'],
                ];
            }
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    /**
     * get the User item data
     */
    public function getUserItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = MembershipUser::getItemData($request->id);
            if (!empty($data['tabs_access'])) {
                $data['tabs_access'] = json_decode($data['tabs_access']);
            }
            $data = [
                'itemData' => $data
            ];

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
     * Load the Group list
     */
    public function listUser(Request $request) {
        try {

            $data = MembershipUser::getUserList($request->tab_id);
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

    /**
     * delete User
     */
    public function deleteUser(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            MembershipUser::deleteUser($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['User successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function saveSettings(Request $request) {
        try {
            $id = $request->tab_id;
            $membsershipSettings = $request->membsershipSettings;
            $loginDetails = $request->singleMemberLoginDetails;

            $data['tab_id'] = $id;
            $data['type'] = $membsershipSettings['type'];
            $data['user_name'] = $loginDetails['user_name'];
            $data['password'] = $loginDetails['password'];

            $rules = ['tab_id' => 'required|integer'];
            $validator = Validator::make($data, array_merge(self::_getCommonValidationRulesSettings(), $rules), self::_getValidationMessagesSettings());

            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()));
            }


            $settings = [];
            $settings['login_color'] = $membsershipSettings['login_color'];
            $settings['member_login'] = $membsershipSettings['member_login'];
            $settings['guest_login'] = $membsershipSettings['guest_login'];
            $settings['type'] = $membsershipSettings['type'];

            $settings_encoded = json_encode($settings);

            $info = array('settings' => $settings_encoded);

            if ($membsershipSettings['type'] == 2) {
                //single user login
                $user_name = $loginDetails['user_name'];
                $password = $loginDetails['password'];

                //check if username and password row exist in  tp_func_membership_user table for login_type field
                $user = MembershipUser :: getSingleUser($request['tab_id'], 2);

                $user_details = array('tab_id' => $id, 'user_name' => $user_name, 'password' => $password, 'login_type' => $settings['type']);

                if (!empty($user['id'])) {
                    // edit single user login
                    MembershipUser::where('id', $user['id'])->update($user_details);
                } else {
                    //add single user login
                    MembershipUser :: create($user_details);
                }
            }

            TpAppsTabEntity::where('id', $id)->update($info);
            $result = [
                'success' => TRUE,
                'message' => ['Settings successfully saved.']
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    /**
     * Add/Edit User (GUEST)
     */
    public function saveGuest(Request $request) {
        try {
            $data = $request->all();
            $rules = ['tab_id' => 'required|integer'];
            $validator = Validator::make($data, array_merge(self::_getCommonValidationRulesGuest(), $rules), self::_getValidationMessagesGuest());

            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()));
            }

            $user_name = $data['user_name'];
            $login_type = 1; //guest user
            //check if username exist in  tp_func_membership_user table for login_type field
            $user = MembershipUser :: getSingleUser($request->tab_id, $login_type);

            $user_details = array('tab_id' => $request->tab_id, 'user_name' => $user_name, 'login_type' => $login_type);

            if (!empty($data['tabs_access'])) {
                $tabs_access = $data['tabs_access'];
                $tabs_access_json = json_encode($tabs_access);
                $user_details['tabs_access'] = $tabs_access_json;
            }


            if (!empty($user['id'])) { // edit single user login
                MembershipUser::where('id', $user['id'])->update($user_details);
            } else { //add single user login
                MembershipUser :: create($user_details);
            }

            $result = [
                'success' => TRUE,
                'message' => ['Guest login details successfully saved.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    /**
     * guestLoginDetails
     */
    public function guestLoginDetails(Request $request) {
        try {
            $data = $request->all();
            if (empty($request->tab_id)) {
                throw new Exception('Tab ID not found.');
            }

            $login_type = 1; //guest user
            $user = MembershipUser :: getSingleUser($request->tab_id, $login_type);
            if (!empty($user['tabs_access'])) {
                $user['tabs_access'] = json_decode($user['tabs_access']);
            }
            $data = ['itemData' => $user];
            $result = [
                'success' => TRUE,
                'data' => $data,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    /**
     * singleUserLoginDetails
     */
    public function singleUserLoginDetails(Request $request) {
        try {
            $data = $request->all();
            if (empty($request->tab_id)) {
                throw new Exception('Tab ID not found.');
            }

            $login_type = 2; //Membership Type Single
            $user = MembershipUser :: getSingleUser($request->tab_id, $login_type);
            if (!empty($user['tabs_access'])) {
                $user['tabs_access'] = json_decode($user['tabs_access']);
            }
            $data = ['itemData' => $user];
            $result = [
                'success' => TRUE,
                'data' => $data,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function singleUserLoginDetailsSave(Request $request) {
        try {
            $data = $request->all();
            $rules = ['tab_id' => 'required|integer'];
            $validator = Validator::make($data, $rules);

            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()));
            }
            $login_type = 2; // single user
            //check if access tabs exist in  tp_func_membership_user table for tabs_access field
            $user = MembershipUser :: getSingleUser($request->tab_id, $login_type);

            $user_details = array('tab_id' => $request->tab_id, 'login_type' => $login_type);

            if (!empty($data['tabs_access'])) {
                $tabs_access = $data['tabs_access'];
                $tabs_access_json = json_encode($tabs_access);
                $user_details['tabs_access'] = $tabs_access_json;
            } else {
                $user_details['tabs_access'] = '';
            }


            if (!empty($user['id'])) { // edit single user login
                MembershipUser::where('id', $user['id'])->update($user_details);
            } else { //add single user login
                MembershipUser :: create($user_details);
            }

            $result = [
                'success' => TRUE,
                'message' => ['Single User Tab Access details successfully saved.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public static function getTemplateUploadURL(): string {
        return Helper::getUploadDirectoryURLEmailTemplate(self::TEMPLATE_UPLOAD_PATH);
    }

    public static function getUploadPathTemplate(): string {
        return Helper::getUploadDirectoryPathEmailTemplate(self::TEMPLATE_UPLOAD_PATH);
    }

    public function getEmailInviteTemplate(Request $request) {
        try {
            $data = $request->all();
            if (empty($request->tab_id)) {
                throw new Exception('Tab ID not found.');
            }
            //for reading content url path is needed
            // for writing a file  server path is needed
            $tab_id = $request->tab_id;
            $app_file_name = "emailInvite" . $tab_id . ".blade.php";
            $file_name = "emailInvite.blade.php";
            $default_url = self::getTemplateUploadURL() . '/' . $file_name;
            $custom_url = self::getTemplateUploadURL() . '/' . $app_file_name;
            $custom_path = self::TEMPLATE_UPLOAD_PATH . '/' . $app_file_name;
            //load the content
            if (file_exists($custom_path)) {
                $contents = file_get_contents($custom_url);
            } else {
                $contents = file_get_contents($default_url);
            }
            $data = ['itemData' => $contents];
            $result = [
                'success' => TRUE,
                'data' => $data,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function saveEmailInviteTemplate(Request $request) {
        try {
            $data = $request->all();
            $rules = ['tab_id' => 'required|integer', 'content' => 'required'];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()));
            }
            $tab_id = $request->tab_id;
            $app_file_name = "emailInvite" . $tab_id . ".blade.php";
            $file_name = "emailInvite.blade.php";
//            $default_url = self::getTemplateUploadURL() . '/' . $file_name;
//            $custom_url = self::getTemplateUploadURL() . '/' . $app_file_name;
//            $default_path = self::getUploadPathTemplate() . '/' . $file_name;
            $custom_path = self::TEMPLATE_UPLOAD_PATH . '/' . $app_file_name;


            //load the content
            $contents = $request->content;
            $path = $custom_path;
            $myfile = fopen($path, "w");
            fwrite($myfile, $contents);
            fclose($myfile);
            chmod($path, 0777);

            $result = [
                'success' => TRUE,
                'message' => ['Invite Email Template successfully saved.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public static function getCSVUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::CSV_UPLOAD_PATH);
    }

    /**
     * Saves the CSV file and returns the saved file name.
     *
     * @param \Illuminate\Http\UploadedFile|array $csv
     * @return string
     */
    private static function _uploadCSV($csv) {
        $extension = $csv->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . "_csv." . $extension;
        $uploadPath = self::getUploadPathCSV();
        Helper::makeDirectory($uploadPath);
        $csv->move($uploadPath, $fileName);
        chmod($uploadPath . '/' . $fileName, 0777);
        return $fileName;
    }

    public static function getUploadPathCSV(): string {
        return Helper::getUploadDirectoryPath(self::CSV_UPLOAD_PATH);
    }

    /**
     * Invite User
     */
    public function inviteUser(Request $request) {
        try {
            $data = $request->all();
            $fromEmail = $request->from_email;
            $csv = $request->file('csv_emails');
            $rules = ['email' => 'required'];

            if (!empty($csv)) {
                $validator = Validator::make($data, self::_getCommonValidationRulesInviteUser(), self::_getValidationMessagesInviteUser());
            } else {
                $validator = Validator::make($data, array_merge(self::_getCommonValidationRulesInviteUser(), $rules), self::_getValidationMessagesInviteUser());
            }
            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()->unique()), 1);
            }


            if (!empty($csv)) {
                $file = self::_uploadCSV($csv);
                $csvUrl = self::getCSVUploadURL() . '/' . $file;
                $emailArr = [];
//                $file = fopen("/var/www/html/tappit/api/storage/app/public/functions/final.csv", "r");
                $file = fopen($csvUrl, "r");
                $emailArr = [];
                while (!feof($file)) {
                    $email = fgetcsv($file);
                    array_push($emailArr, $email[0]);
                }
                fclose($file);
                //Validate email for $emailValidator->true()
                //create an array of emails which are valid and not duplicated and send emails                
                $emailRulesCsv = array(
                    'email' => 'required|email|unique:tp_func_membership_user'
                );
                if (!empty($emailArr)) {
                    $falseEmail = [];
                    foreach ($emailArr as $email) {
                        $email = array('email' => $email);
                        $emailValidator = Validator::make($email, $emailRulesCsv);
                        if ($emailValidator->fails()) {
                            $falseEmail[] = $email['email'];
                        }
                    }
                    $emailArray = array_diff($emailArr, $falseEmail);
                }
            } // END for CSV


            $emailString = $request->email;
            if (empty($csv)) { //execute for email comma saperated if csv file is empty
                if (!empty($emailString)) {
                    // $pos = strpos($emailString, ',');
                    // if ($pos !== false) {
                    $emailArray = explode(',', $emailString);
                    // }
                    $emailArray=array_map('trim',$emailArray);
                    $emailRules = array(
                        'email' => 'required|email'
                    );
                    $emailRulesUnique = array(
                        'email' => 'unique:tp_func_membership_user'
                    );
                    if (!empty($emailArray)) {
                        $falseEmail = self ::false_emails($emailArray, $emailRules, 'Emails not valid, please correct', 0);
                        $falseEmail = self ::false_emails($emailArray, $emailRulesUnique, 'Emails already exists', 1);
                    }
                } //END for Emails
            }


            $tab_id = $request->tab_id;
            $app_details = TpAppsTabEntity::getAppDetails($tab_id);
            $app_name = $app_details->app_name;

            $emailArray = array_unique($emailArray);
            //check if dynamic email template exists
            $app_file_name = "emailInvite" . $tab_id . ".blade.php";
            $custom_path = self::TEMPLATE_UPLOAD_PATH . '/' . $app_file_name;
            if (file_exists($custom_path)) {
                $emailTemplate = "membershipTemplate.emailInvite" . $tab_id;
            } else {
                $emailTemplate = "membershipTemplate.emailInvite";
            }
            $group_id = $request->group_id;
            unset($data['from_email']);
            if (!empty($emailArray)) {
                foreach ($emailArray as $email) {
                    //create temp user in temporary user table
                    $tempData = ['tab_id' => $tab_id, 'email' => $email, 'group_id' => $group_id];
                    $user = MembershipUserTemp :: getUserByEmail($email);
                    if (empty($user['email'])) { //check for email entry exists or not                    
                        $id = MembershipUserTemp :: create($tempData)->id;
                    } else {
                        $id = $user['id'];
                    }
                    $link = URL::route('member.register');
                    $link = $link . '?_token=' . base64_encode($id);
                    $data = ['link' => $link, 'app_name' => $app_name, 'email_template' => $emailTemplate, 'from_email' => $fromEmail, 'email' => $email, 'subject' => 'You have received an invitation for member login'];
                    $mail = Mail::send($emailTemplate, $data, function ($message) use ($data) {
                                $message->from($data['from_email']);
                                $message->to($data['email'])->subject($data['subject']);
                            });
                }
            }
            $result = [
                'success' => TRUE,
                'message' => ['Email invitation send successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'exType' => $ex->getCode(),
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function validate_email($email, $emailRules) {
        $emailValidator = Validator::make($email, $emailRules);
        return $emailValidator;
    }

    public function false_emails($emailArray, $emailRules, $msg, $condition) {
        $falseEmail = [];
        foreach ($emailArray as $email) {
            $email = array('email' => $email);
            $emailValidator = self ::validate_email($email, $emailRules);
            if ($emailValidator->fails()) {
                $falseEmail[] = $email['email'];
            }
        }
        if (!empty($falseEmail)) {
            if ($condition == 1) { //for duplicate show emails in string
                $emailString = implode(', ', $falseEmail);
                $msg = $emailString . ' ' . $msg;
            }
            throw new Exception($msg, 2);
        }
        return $falseEmail;
    }

    public function memberRegister(Request $request) {
        try {
            $token = $_REQUEST['_token'];
            $id = base64_decode($token);
            //also get temp user data
            $userTemp = MembershipUserTemp :: getItemData($id);
            $email = $userTemp['email'];

            //check if there is record for specific email in membership_user table
            $user = MembershipUser :: getUserByEmail($email);
            if (!empty($user['id'])) {
                return redirect()->route("member.member-save-success");
            } else {
                return view("user.membership")->with('email', $email);
            }
        } catch (Exception $ex) {
            return view("user.membership");
        }
    }

    public function memberSave(Request $request) {
        try {
            $data = $request->all();

            $validator = Validator::make($data, self::_getCommonValidationRulesMemberRegister(), self::_getValidationMessagesMemberRegister());
            if ($validator->fails()) {
//                throw new Exception(json_encode($validator->errors()));
                $errors = $validator->errors();
                return back()->withInput($request->input())->withErrors($errors);
            }

            $email = $request->input('email');
            //get tab_id, group_id from db by email
            $user = MembershipUserTemp :: getUserByEmail($email);
            $tab_id = $user['tab_id'];
            $group_id = $user['group_id'];

            $password = $request->input('password');
            $user_name = $request->input('user_name');
            $data = ['tab_id' => $tab_id, 'user_name' => $user_name, 'email' => $email, 'password' => $password, 'group_id' => $group_id, 'login_type' => 3];
            MembershipUser :: create($data);
            return redirect()->route("member.member-save-success")->withInput()->withErrors('testing');
        } catch (NotFoundException $e) {
            $errors = $this->authenticator->getErrors();
            return redirect()->route("member.register")->withInput()->withErrors($errors);
        }
    }
    
    /**
     * Login User
     */
    public function login(Request $request) {
        try {
            $data = $request->all();
            
            $userName = $data['userName']; $password = $data['password']; 
            $appId = $data['appId']; $loginType = $data['loginType'];
            
            if (empty($data['appId'])) {
                throw new Exception('Server error  occurred.');
            }
            if (empty($data['userName']) || empty($data['password'])) {
                throw new Exception('Username and Password both required.');
            }
            
            $user = MembershipUser :: loginCheck($userName, $password, $appId, $loginType);
            if (!empty($user)) {
                $result = [
                    'success' => TRUE,
                    'data' => $user,
                ];
            } else {
                $result = [
                    'success' => FALSE,
                    'message' => 'Username or Password is wrong.',
                ];
            }
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }
    
    /**
     * Login Guest User
     */
    public function guestLogin(Request $request) {
        try {
            $data = $request->all();
            
            $appId = $data['appId']; $loginType = $data['loginType'];
            
            if (empty($data['appId'])) {
                throw new Exception('Server error  occurred.');
            }
            
            $user = MembershipUser :: guestLoginCheck($appId, $loginType);
//            if (!empty($user)) {
                $result = [
                    'success' => TRUE,
                    'data' => $user,
                ];
//            } else {
//                $result = [
//                    'success' => FALSE,
//                    'message' => 'Username or Password is wrong.',
//                ];
//            }
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

}
