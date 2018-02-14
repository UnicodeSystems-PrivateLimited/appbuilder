<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\NewsLetterUsers;
use App\Models\TabFunctions\NewsLetterCategories;
use App\Models\TabFunctions\NewsLetterSettings;
use App\Models\TabFunctions\EmailMarketingValue;
use App\Models\TabFunctions\CountryCodeIso;
use App\Models\TpAppsTabEntity;
use App\Models\MstTpTabEntity;
use App\Helpers\Helper;
use App\Helpers\IContactApi;

class NewsLetterController extends Controller {

    const IMAGE_UPLOAD_PATH = 'app/public/functions/newsletter';

    private static function _getCommonValidationRules(): array {
        return [
            'description' => 'required',
            'image_file' => 'mimes:jpeg,jpg,png|max:6144'
        ];
    }

    private static function _getValidationMessages() {
        return [];
    }

    /**
     * Init with newsletter settings
     */
    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $settings = NewsLetterSettings::getSettings($request->tabId);

            $data = [
                'settingsData' => $settings,
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

    /**
     * Saves the image file and returns the saved file name.
     * @return string
     */
    private static function _uploadImage($image, string $uploadPath, $width, $height): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_newsletter.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->resize($width, $height)
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    //thumbnail image
    public static function getImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::IMAGE_UPLOAD_PATH);
    }

    //upload url is used by model function while returning image from database
    public static function getImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::IMAGE_UPLOAD_PATH);
    }

    /**
     * Create and Save Newsletter Settings
     */
    public function saveSettings(Request $request) {
        try {
            $data = $request->all();
            $image_file = $request->file('image_file');
            $data['image_file'] = $image_file;
            if ($request->id) {
                if ($request->image_file == null) {
                    if ($request->image_file_url == null) {
                        $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRules(), ['image_file' => 'required|mimes:jpeg,jpg,png|max:10000', 'id' => 'required|integer'])), self::_getValidationMessages());
                    } else {
                        $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRules(), ['id' => 'required|integer'])), self::_getValidationMessages());
                    }
                } else {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRules(), ['id' => 'required|integer'])), self::_getValidationMessages());
                }
            } else {
                $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRules(), ['image_file' => 'mimes:jpeg,jpg,png|max:10000', 'tab_id' => 'required|integer|unique:newsletter_settings'])), self::_getValidationMessages());
            }


            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }

            // Save image
            if (!empty($image_file)) {
                $data['image_file'] = self::_uploadImage($image_file, self::getImageUploadPath(), 140, 140);
            } else {
                if ($data['image_file_url'] == null) {
                    if ($request->image_file_url == null) {
                        throw new Exception('Image field is required.');
                    }
                }
                unset($data['image_file']);
            }
            unset($data['image_file_url']);

            if ($request->id) {
                NewsLetterSettings::where('id', $request->id)->update($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Newsletter settings successfully edited.'],
                ];
            } else {
//                if (empty($data['image_file'])) {
//                    throw new Exception('Image cannot be empty.');
//                }

                NewsLetterSettings::create($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Newsletter settings successfully added.'],
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

    //delete thumbnail in newsletter settings
    public function deleteThumbnail(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            NewsLetterSettings::where('id', $request->id)->update(['image_file' => NULL]);
            $result = [
                'success' => TRUE,
                'message' => ['Thumbnail successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function getSettings(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found');
            }

            $settings = NewsLetterSettings::getSettings($request->tabId);
            $result = [
                'success' => TRUE,
                'data' => $settings,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function getAccountData(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found');
            }

            $settings = NewsLetterSettings::getSettings($request->tabId);
            $mailChimpAccount = $settings['mailchimp_account'];
            $iConnectAccount = $settings['iconnect_account'];
            $account = array();
            if (isset($mailChimpAccount)) {
                $mailchimp = json_decode($mailChimpAccount, true);
                $account['mailChimp'] = $mailchimp;
            }
            if (isset($iConnectAccount)) {
                $iConnect = json_decode($iConnectAccount, true);
                $account['iConnect'] = $iConnect;
            }
            $result = [
                'success' => TRUE,
                'data' => $account,
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
     * Create and Save category
     */
    public function saveCategory(Request $request) {
        try {
            $data = $request->all();
//            $rules = $request->id ? ['id' => 'required|integer', 'name' => 'required|unique:newsletter_categories,name,' . $request->id] : ['tab_id' => 'required|integer', 'name' => 'required|unique:newsletter_categories,name,null,tab_id'];
            $rules = $request->id ? ['id' => 'required|integer', 'name' => 'required|unique:newsletter_categories,name,' . $request->id] : ['tab_id' => 'required|integer', 'name' => 'required|unique:newsletter_categories'];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }

            if ($request->id) {
                NewsLetterCategories::where('id', $request->id)->update($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Category successfully edited.'],
                ];
            } else {
                NewsLetterCategories::create($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Category successfully added.'],
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
     * Delete category 
     */
    public function deleteCategory(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            NewsLetterCategories::deleteCategory($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Category successfully deleted.'],
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
     * Get categories list
     */
    public function categoryList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $data = NewsLetterCategories::getCategoryList($request->tabId);
            $category = array();
            foreach ($data as $key => $value) {
                $cat_id = $value['id'];
                $user = NewsLetterUsers :: getUsers($categ_id = "");
                $counter = 0;
                if (isset($user) && !empty($user)) {
                    foreach ($user as $value1) {
                        $cat_id_string = $value1['category_id'];
                        if (isset($cat_id_string)) {
                            $cat_id_arr = json_decode($cat_id_string, true);
                            if (in_array($cat_id, $cat_id_arr)) {
                                $counter = $counter + 1;
                            }
                        }
                    }

                    $count = $counter;
                }
                $category[$key]['id'] = $value['id'];
                $category[$key]['name'] = $value['name'];
                $category[$key]['userCount'] = $count;
                $category[$key]['tab_id'] = $value['tab_id'];
            }
            $result = [
                'success' => TRUE,
                'data' => $category
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
     * Load single track data
     */
    public function getCategoryItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $item = NewsLetterCategories::getCategoryData($request->id);
            $data = [
                'itemData' => $item,
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
     * Create and Save users
     */
    public function saveUsers(Request $request) {
        try {
            $data = $request->all();

            $rules = $request->id ? ['id' => 'required|integer', 'name' => 'required', 'email' => 'required|email|unique:newsletter_users,email,' . $request->id] : ['tab_id' => 'required|integer', 'email' => 'required|unique:newsletter_users', 'name' => 'required'];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            //user can subscribe for multiple categories
            $categories = $request->category_id;
            if (isset($categories)) {
                $data['category_id'] = json_encode($categories);
            }

            if ($request->id) {
                NewsLetterUsers::where('id', $request->id)->update($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['User successfully edited.'],
                ];
            } else {
                NewsLetterUsers::create($data);
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

    public function downloadCSV(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('ID not found.');
            }

            $nameValues = array('name', 'email', 'birthday', 'zip', 'country');
            $data = NewsLetterCategories::getCategoryList($request->tabId);

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

    /**
     * upload users to mailchimp account
     */
    public function uploadUsersMailChimp(Request $request) {
        try {
            $data = $request->all();
            if (empty($request->tabId)) {
                throw new Exception('ID not found.');
            }
            $rules = ['tabId' => 'required|integer', 'apiKey' => 'required', 'listId' => 'required'];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $apiKey = $request->apiKey;
            $listId = $request->listId;
            //save mail chimp account details into newsletter settings table            
            $account = array('apiKey' => $apiKey, 'listId' => $listId);
            $mailchimpData = array('mailchimp_account' => json_encode($account));
            NewsLetterSettings::where('tab_id', $request->tabId)->update($mailchimpData);

            $usersInfo = NewsLetterUsers :: getUsersByTabId($request->tabId);
            if (isset($usersInfo) && !empty($usersInfo)) {
                foreach ($usersInfo as $key => $val) {
                    $name = $val['name'];
                    if (strpos($name, " ") === false) {
                        $fname = $val['name'];
                        $lname = "";
                    } else {
                        list($fname, $lname) = explode(' ', $name);
                    }
                    $userDetail[$key]['email'] = $val['email'];
                    $userDetail[$key]['status'] = 'subscribed';
                    $userDetail[$key]['firstname'] = $fname;
                    $userDetail[$key]['lastname'] = $lname;
                }
            }

            foreach ($userDetail as $user) {
                $response = self :: syncMailchimp($user, $apiKey, $listId);
            }

            $result = [
                'success' => TRUE,
                'message' => 'User Contacts uploaded to Mail Chimp List Successfuly',
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function syncMailchimp($data, $apiKey, $listId) {
        // $apiKey = '0e443d61262623d83d23e857ea91ec89-us15';
        // $listId = 'b9395c52c3';
        // $webId = '62647';

        $memberId = md5(strtolower($data['email']));
        $dataCenter = substr($apiKey, strpos($apiKey, '-') + 1);
        $url = 'https://' . $dataCenter . '.api.mailchimp.com/3.0/lists/' . $listId . '/members/' . $memberId;

        $json = json_encode([
            'email_address' => $data['email'],
            'status' => $data['status'], // "subscribed","unsubscribed","cleaned","pending"
            'merge_fields' => [
                'FNAME' => $data['firstname'],
                'LNAME' => $data['lastname']
            ]
        ]);

        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_USERPWD, 'user:' . $apiKey);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $json);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return $result;
    }

    //iContact get AccountId and ClientFolderId
    public function getIContactAccountDetails(Request $request) {
        try {
            $data = $request->all();
            $rules = ['application_id' => 'required', 'user_name' => 'required', 'app_password' => 'required'];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $application_id = $request->application_id;
            $user_name = $request->user_name;
            $app_password = $request->app_password;


//            $application_id = 'kgkMGIzmqXAzcPo0qHT57XrE9KWWcU8E';
//            $user_name = 'rajneesh@unicodesystems.info';
//            $app_password = 'unicode@123';


            $GLOBALS['iContact_settings'] = array(
                'apiUrl' => 'https://app.icontact.com',
                'apiPage' => '/icp/a/',
                'username' => $user_name,
                'password' => $app_password,
                'appId' => $application_id
            );

            /* iContact SANDBOX */
//            $GLOBALS['iContact_settings'] = array(
//                'apiUrl'   => 'https://app.sandbox.icontact.com',
//                'apiPage'  => '/icp/a/',
//                'username' => $user_name,
//                'password' => $app_password,
//                'appId'    => $application_id
//            );

            $icontact_url = $GLOBALS['iContact_settings']['apiUrl'] . $GLOBALS['iContact_settings']['apiPage'];
            $icontact_page = $GLOBALS['iContact_settings']['apiPage'];
            $icontact_headers = array(
                "GET " . $icontact_page . " HTTP/1.0",
                "Accept: text/xml",
                "Content-Type: text/xml",
                "API-Version: 2.2",
                "API-AppId: " . $GLOBALS['iContact_settings']['appId'],
                "API-Username: " . $GLOBALS['iContact_settings']['username'],
                "API-Password: " . $GLOBALS['iContact_settings']['password']
            );

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $icontact_url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $icontact_headers);

            $data = curl_exec($ch);
            curl_close($ch);

            $account_id = "";
            if (($pos = strpos($data, "<accountId>")) !== false) {
                $account_id = substr($data, strlen("<accountId>") + $pos);
                if (($pos = strpos($account_id, "<")) !== false) {
                    $account_id = substr($account_id, 0, $pos);
                }
            }
            $fname = "";
            if (($pos = strpos($data, "<firstName>")) !== false) {
                $fname = substr($data, strlen("<firstName>") + $pos);
                if (($pos = strpos($fname, "<")) !== false) {
                    $fname = substr($fname, 0, $pos);
                }
            }
            $lname = "";
            if (($pos = strpos($data, "<lastName>")) !== false) {
                $lname = substr($data, strlen("<lastName>") + $pos);
                if (($pos = strpos($lname, "<")) !== false) {
                    $lname = substr($lname, 0, $pos);
                }
            }

            $account = array('account_id' => $account_id, 'first_name' => $fname, 'last_name' => $lname);
            $accountArr = array($account);
            $result = [
                'success' => TRUE,
                'data' => $accountArr
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    //iContact get   ClientFolderId
    public function getIContactClientFolderId(Request $request) {
        try {
            $data = $request->all();
            $rules = ['application_id' => 'required', 'user_name' => 'required', 'app_password' => 'required', 'account_id' => 'required'];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $application_id = $request->application_id;
            $user_name = $request->user_name;
            $app_password = $request->app_password;
            $account_id = $request->account_id;


            $GLOBALS['iContact_settings'] = array(
                'apiUrl' => 'https://app.icontact.com',
                'apiPage' => '/icp/a/',
                'username' => $user_name,
                'password' => $app_password,
                'appId' => $application_id
            );

            $icontact_url = $GLOBALS['iContact_settings']['apiUrl'] . $GLOBALS['iContact_settings']['apiPage'];
            $icontact_page = $GLOBALS['iContact_settings']['apiPage'];
            $icontact_headers = array(
                "GET " . $icontact_page . " HTTP/1.0",
                "Accept: text/xml",
                "Content-Type: text/xml",
                "API-Version: 2.2",
                "API-AppId: " . $GLOBALS['iContact_settings']['appId'],
                "API-Username: " . $GLOBALS['iContact_settings']['username'],
                "API-Password: " . $GLOBALS['iContact_settings']['password']
            );


            //clientFolderId
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $icontact_url . "$account_id/c/");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $icontact_headers);

            $data = curl_exec($ch);
            curl_close($ch);

            $client_folder_id = "";
            if (($pos = strpos($data, "<clientFolderId>")) !== false) {
                $client_folder_id = substr($data, strlen("<clientFolderId>") + $pos);
                if (($pos = strpos($client_folder_id, "<")) !== false) {
                    $client_folder_id = substr($client_folder_id, 0, $pos);
                }
            }

            $folder = array('client_folder_id' => $client_folder_id);
            $folderArr = array($folder);
            $result = [
                'success' => TRUE,
                'data' => $folderArr,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    //iContact get   lists
    public function getIContactLists(Request $request) {
        try {
            $data = $request->all();
            $rules = ['tabId' => 'required|integer', 'application_id' => 'required', 'user_name' => 'required', 'app_password' => 'required', 'account_id' => 'required', 'client_folder_id' => 'required'];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $application_id = $request->application_id;
            $user_name = $request->user_name;
            $app_password = $request->app_password;
            $account_id = $request->account_id;
            $client_folder_id = $request->client_folder_id;


            $account = array('application_id' => $application_id, 'user_name' => $user_name, 'app_password' => $app_password, 'account_id' => $account_id, 'client_folder_id' => $client_folder_id);
            $iContactData = array('iconnect_account' => json_encode($account));
            NewsLetterSettings::where('tab_id', $request->tabId)->update($iContactData);

            $GLOBALS['iContact_settings'] = array(
                'apiUrl' => 'https://app.icontact.com',
                'apiPage' => '/icp/a/',
                'username' => $user_name,
                'password' => $app_password,
                'appId' => $application_id
            );

            $icontact_url = $GLOBALS['iContact_settings']['apiUrl'] . $GLOBALS['iContact_settings']['apiPage'];
            $icontact_page = $GLOBALS['iContact_settings']['apiPage'];

            $icontact_headers = array(
                "GET " . $icontact_page . " HTTP/1.0",
                "Accept: text/xml",
                "Content-Type: text/xml",
                "API-Version: 2.2",
                "API-AppId: " . $GLOBALS['iContact_settings']['appId'],
                "API-Username: " . $GLOBALS['iContact_settings']['username'],
                "API-Password: " . $GLOBALS['iContact_settings']['password']
            );



            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $icontact_url . "$account_id/c/" . "$client_folder_id/lists");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $icontact_headers);
            $data = curl_exec($ch);
            curl_close($ch);

            $listData = simplexml_load_string($data) or die("Error: Cannot create object");
            $listObject = (array) $listData->lists;
            $list = (array) $listObject['list'];
            $icontactList = array();
            foreach ($list as $key => $value1) {
                $value = self :: xml2array($value1);
                $icontactList[$key]['listId'] = $value['listId'];
                $icontactList[$key]['name'] = $value['name'];
            }
            $result = [
                'success' => TRUE,
                'data' => $icontactList,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function xml2array($xml) {
        $arr = array();
        foreach ($xml as $element) {
            $tag = $element->getName();
            $e = get_object_vars($element);
            if (!empty($e)) {
                $arr[$tag] = $element instanceof SimpleXMLElement ? xml2array($element) : $e;
            } else {
                $arr[$tag] = trim($element);
            }
        }
        return $arr;
    }

    /**
     * upload users to iConnect account
     */
    public function uploadUsersIconnect(Request $request) {
        try {
            $data = $request->all();
            $rules = ['tabId' => 'required|integer', 'application_id' => 'required', 'user_name' => 'required', 'app_password' => 'required', 'listId' => 'required'];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $application_id = $request->application_id;
            $user_name = $request->user_name;
            $app_password = $request->app_password;
            $list_id = $request->listId;

            IContactApi::getInstance()->setConfig(array(
                'appId' => $application_id,
                'apiUsername' => $user_name,
                'apiPassword' => $app_password
            ));
            // Store the singleton
            $oiContact = IContactApi::getInstance();

            $usersInfo = NewsLetterUsers :: getUsersByTabId($request->tabId);
            $userDetail = array();
            if (isset($usersInfo) && !empty($usersInfo)) {
                foreach ($usersInfo as $key => $val) {
                    $name = $val['name'];
                    if (strpos($name, " ") === false) {
                        $fname = $val['name'];
                        $lname = "";
                    } else {
                        list($fname, $lname) = explode(' ', $name);
                    }
                    $userDetail[$key]['email'] = $val['email'];
                    $userDetail[$key]['firstname'] = $fname;
                    $userDetail[$key]['lastname'] = $lname;
                }
            }

            if (isset($userDetail) && !empty($userDetail)) {
                foreach ($userDetail as $value) {
                    $contactDetails = $oiContact->addContact($value['email'], null, null, $value['firstname'], $value['lastname'], null, null, null, null, null, null, null, null, null);
                    if ($contactDetails) {
                        $contact_id = $contactDetails->contactId;
                        // Subscribe contact to list
                        $oiContact->subscribeContactToList($contact_id, $list_id, 'normal');
                    }
                }
            }
            $result = [
                'success' => TRUE,
                'message' => 'Contacts uploaded to iConnect Successfuly',
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function uploadUsersMailChimpSubmittedData(Request $request) {
        try {
            $data = $request->all();
            if (empty($request->appId)) {
                throw new Exception('ID not found.');
            }
            $rules = ['appId' => 'required|integer', 'apiKey' => 'required', 'listId' => 'required'];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $apiKey = $request->apiKey;
            $listId = $request->listId;
            //save mail chimp account details into newsletter settings table            
            $account = array('apiKey' => $apiKey, 'listId' => $listId);
            $mailchimpData = array('mailchimp_account' => json_encode($account));
            $newLetterSetting = NewsLetterSettings::where('app_id', $request->appId)->first();
            if (empty($newLetterSetting)) {
                $settingData['app_id'] = $request->appId;
                $settingData['tab_id'] = $request->tabId;
                $settingData['mailchimp_account'] = json_encode($account);
                NewsLetterSettings::create($settingData);
            } else {
                NewsLetterSettings::where('app_id', $request->appId)->update($mailchimpData);
            }
            $mst_mailingList_id = MstTpTabEntity::getMstTabId('mailing_list');
            $mailingTabIds = TpAppsTabEntity::getAppTabsForSubmittedData($request->appId, $mst_mailingList_id->id);
            $usersInfo = NewsLetterUsers :: getUsersByTabIds($mailingTabIds);
            if (isset($usersInfo) && !empty($usersInfo)) {
                foreach ($usersInfo as $key => $val) {
                    $name = $val['name'];
                    if (strpos($name, " ") === false) {
                        $fname = $val['name'];
                        $lname = "";
                    } else {
                        list($fname, $lname) = explode(' ', $name);
                    }
                    $userDetail[$key]['email'] = $val['email'];
                    $userDetail[$key]['status'] = 'subscribed';
                    $userDetail[$key]['firstname'] = $fname;
                    $userDetail[$key]['lastname'] = $lname;
                }
            }

            foreach ($userDetail as $user) {
                $response = self :: syncMailchimp($user, $apiKey, $listId);
            }

            $result = [
                'success' => TRUE,
                'message' => 'User Contacts uploaded to Mail Chimp List Successfuly',
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getAccountDataByAppId(Request $request) {
        try {
            if (empty($request->appId)) {
                throw new Exception('App ID not found');
            }

            $settings = NewsLetterSettings::getSettingsByAppId($request->appId);
            $mailChimpAccount = $settings['mailchimp_account'];
            $iConnectAccount = $settings['iconnect_account'];
            $account = array();
            if (isset($mailChimpAccount)) {
                $mailchimp = json_decode($mailChimpAccount, true);
                $account['mailChimp'] = $mailchimp;
            }
            if (isset($iConnectAccount)) {
                $iConnect = json_decode($iConnectAccount, true);
                $account['iConnect'] = $iConnect;
            }
            $result = [
                'success' => TRUE,
                'data' => $account,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    //iContact get   lists
    public function getIContactListsByAppId(Request $request) {
        try {
            $data = $request->all();
            $rules = ['appId' => 'required|integer', 'application_id' => 'required', 'user_name' => 'required', 'app_password' => 'required', 'account_id' => 'required', 'client_folder_id' => 'required'];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $application_id = $request->application_id;
            $user_name = $request->user_name;
            $app_password = $request->app_password;
            $account_id = $request->account_id;
            $client_folder_id = $request->client_folder_id;


            $account = array('application_id' => $application_id, 'user_name' => $user_name, 'app_password' => $app_password, 'account_id' => $account_id, 'client_folder_id' => $client_folder_id);
            $iContactData = array('iconnect_account' => json_encode($account));
            $icontactSetting = NewsLetterSettings::where('app_id', $request->appId)->first();
            if (empty($icontactSetting)) {
                $settingData['app_id'] = $request->appId;
                $settingData['tab_id'] = $request->tabId;
                $settingData['iconnect_account'] = json_encode($account);
                NewsLetterSettings::create($settingData);
            } else {
                NewsLetterSettings::where('app_id', $request->appId)->update($iContactData);
            }


            $GLOBALS['iContact_settings'] = array(
                'apiUrl' => 'https://app.icontact.com',
                'apiPage' => '/icp/a/',
                'username' => $user_name,
                'password' => $app_password,
                'appId' => $application_id
            );

            $icontact_url = $GLOBALS['iContact_settings']['apiUrl'] . $GLOBALS['iContact_settings']['apiPage'];
            $icontact_page = $GLOBALS['iContact_settings']['apiPage'];

            $icontact_headers = array(
                "GET " . $icontact_page . " HTTP/1.0",
                "Accept: text/xml",
                "Content-Type: text/xml",
                "API-Version: 2.2",
                "API-AppId: " . $GLOBALS['iContact_settings']['appId'],
                "API-Username: " . $GLOBALS['iContact_settings']['username'],
                "API-Password: " . $GLOBALS['iContact_settings']['password']
            );



            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $icontact_url . "$account_id/c/" . "$client_folder_id/lists");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $icontact_headers);
            $data = curl_exec($ch);
            curl_close($ch);

            $listData = simplexml_load_string($data) or die("Error: Cannot create object");
            $listObject = (array) $listData->lists;
            $list = (array) $listObject['list'];
            $icontactList = array();
            foreach ($list as $key => $value1) {
                $value = self :: xml2array($value1);
                $icontactList[$key]['listId'] = $value['listId'];
                $icontactList[$key]['name'] = $value['name'];
            }
            $result = [
                'success' => TRUE,
                'data' => $icontactList,
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
     * upload users to iConnect account
     */
    public function uploadUsersIconnectByAppId(Request $request) {
        try {
            $data = $request->all();
            $rules = ['appId' => 'required|integer', 'application_id' => 'required', 'user_name' => 'required', 'app_password' => 'required', 'listId' => 'required'];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $application_id = $request->application_id;
            $user_name = $request->user_name;
            $app_password = $request->app_password;
            $list_id = $request->listId;

            IContactApi::getInstance()->setConfig(array(
                'appId' => $application_id,
                'apiUsername' => $user_name,
                'apiPassword' => $app_password
            ));
            // Store the singleton
            $oiContact = IContactApi::getInstance();
            $mst_mailingList_id = MstTpTabEntity::getMstTabId('mailing_list');
            $mailingTabIds = TpAppsTabEntity::getAppTabsForSubmittedData($request->appId, $mst_mailingList_id->id);
            $usersInfo = NewsLetterUsers :: getUsersByTabIds($mailingTabIds);
            $userDetail = array();
            if (isset($usersInfo) && !empty($usersInfo)) {
                foreach ($usersInfo as $key => $val) {
                    $name = $val['name'];
                    if (strpos($name, " ") === false) {
                        $fname = $val['name'];
                        $lname = "";
                    } else {
                        list($fname, $lname) = explode(' ', $name);
                    }
                    $userDetail[$key]['email'] = $val['email'];
                    $userDetail[$key]['firstname'] = $fname;
                    $userDetail[$key]['lastname'] = $lname;
                }
            }

            if (isset($userDetail) && !empty($userDetail)) {
                foreach ($userDetail as $value) {
                    $contactDetails = $oiContact->addContact($value['email'], null, null, $value['firstname'], $value['lastname'], null, null, null, null, null, null, null, null, null);
                    if ($contactDetails) {
                        $contact_id = $contactDetails->contactId;
                        // Subscribe contact to list
                        $oiContact->subscribeContactToList($contact_id, $list_id, 'normal');
                    }
                }
            }
            $result = [
                'success' => TRUE,
                'message' => 'Contacts uploaded to iConnect Successfuly',
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function updateAutomaticSetting(Request $request) {
        try {
            if (empty($request->appId)) {
                throw new Exception('App ID not found');
            }
            $appId = $request->appId;
            $mailingSetting = NewsLetterSettings::where('app_id', $appId)->first();
            if (empty($mailingSetting)) {
                $settingData['app_id'] = $request->appId;
                $settingData['tab_id'] = 0;
                $settingData['automatic_upload'] = $request->automatic_upload;
                NewsLetterSettings::create($settingData);
            } else {
                $settingData['automatic_upload'] = $request->automatic_upload;
                NewsLetterSettings::where('app_id', $request->appId)->update($settingData);
            }

            $result = [
                'success' => TRUE,
                'message' => 'Successfully updated!',
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function uploadUsersIconnectEmailMarketing(Request $request) {
        try {
            $data = $request->all();
            $rules = ['appId' => 'required|integer', 'application_id' => 'required', 'user_name' => 'required', 'app_password' => 'required', 'listId' => 'required'];
            $validator = Validator::make($data, $rules);
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $application_id = $request->application_id;
            $user_name = $request->user_name;
            $app_password = $request->app_password;
            $list_id = $request->listId;

            IContactApi::getInstance()->setConfig(array(
                'appId' => $application_id,
                'apiUsername' => $user_name,
                'apiPassword' => $app_password
            ));
            // Store the singleton
            $oiContact = IContactApi::getInstance();

            $usersInfo = EmailMarketingValue :: getUserEmailList($request->appId);
            $userDetail = array();
            if (isset($usersInfo) && !empty($usersInfo)) {
                foreach ($usersInfo as $key => $val) {
                    $userDetail[$key]['email'] = $val['email_id'];
                }
            }

            if (isset($userDetail) && !empty($userDetail)) {
                foreach ($userDetail as $value) {
                    $contactDetails = $oiContact->addContact($value['email'], null, null,null, null, null, null, null, null, null, null, null, null, null);
                    if ($contactDetails) {
                        $contact_id = $contactDetails->contactId;
                        // Subscribe contact to list
                        $oiContact->subscribeContactToList($contact_id, $list_id, 'normal');
                    }
                }
            }
            $result = [
                'success' => TRUE,
                'message' => 'Contacts uploaded to iConnect Successfuly',
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
