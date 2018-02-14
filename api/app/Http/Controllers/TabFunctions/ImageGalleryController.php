<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\ImageGallery;
use App\Models\TabFunctions\GalleryImages;
use App\Models\TpAppsTabEntity;
use App\Models\TabFunctions\GalleryConfig;
use App\Helpers\Helper;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Facebook;
use Facebook\FacebookResponse;
use Facebook\FacebookRequest;
use Facebook\FacebookApp;

class ImageGalleryController extends Controller {

    const THUMBNAIL_UPLOAD_PATH = 'app/public/functions/image-gallery/image/thumbnail';
    const IMAGE_UPLOAD_PATH = 'app/public/functions/image-gallery/image/';
    const WEB_IMAGE_UPLOAD_PATH = 'app/test-image/';
    const DEFAULT_GRAPH_VERSION = 'v2.8';
    const APP_ID = '1020349944740206';
    const APP_SECRET = '0f23e716f79c27f1599f1585e8c13f75';
    const ACCESS_TOKEN = 'EAASnStP1yXEBAP7wmNGbqBAQd30sQ8xZCh8KyVDbdukzZBlvQ3mKCKeKQfQwCmXnZAVETLxSWmfCH4VCUMAh7klDZAaYxxcfYjFsXU9s1w927GYlEhfcoBY7TQJPvycHwW6c6fwgyRmLzl1bo3xrbMYSkhfy2ECuNBHRWFRqpwZDZD';

    private static function _getCommonValidationRules(): array {
        return [
            'name' => 'required|max:256',
            'thumbnail' => 'mimes:jpeg,jpg,png|max:10000',
        ];
    }

    private static function _getValidationMessages() {
        return [];
    }

    private static function _getCommonValidationRulesGalleryConfig(): array {
        return [
            'tab_id' => 'required',
            'gallery_type' => 'required|max:256'
        ];
    }

    private static function _getValidationMessagesGalleryConfig() {
        return [];
    }

    private static function _getCommonValidationImageRules(): array {
        return [
            'image' => 'mimes:jpeg,jpg,png|max:10000',
        ];
    }

    private static function _getValidationImageMessages() {
        return [];
    }

    /**
     * Load the image gallery list and tabData
     */
    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $data = [
                'gallery_list' => ImageGallery::getGalleryList($request->tabId),
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
    private static function _uploadThumbnail($image, string $uploadPath, $width, $height): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_gallery_thumb_image.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->resize($width, $height)
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    public static function getThumbnailUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::THUMBNAIL_UPLOAD_PATH);
    }

    public static function getThumbnailUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::THUMBNAIL_UPLOAD_PATH);
    }

    /**
     * Saves the image file and returns the saved file name.
     * @return string
     */
    private static function _uploadImage($image, string $uploadPath): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_gallery_image.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    public static function getImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::IMAGE_UPLOAD_PATH);
    }

    public static function getImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::IMAGE_UPLOAD_PATH);
    }

    /**
     * Add/Edit Image Gallery info for tab id
     */
    public function save(Request $request) {
        try {
            $data = $request->all();

            $images = array();
            if (!empty($request->image)) {
                $images = $request->image;
            }
            unset($data['image']);

            $thumbnail = $request->file('thumbnail');
            $data['thumbnail'] = $thumbnail;

            $rules = $request->id ? ['id' => 'required|integer'] : ['tab_id' => 'required|integer'];
            $rulesImages = $request->id ? ['id' => 'required|integer'] : array();

            $validator = Validator::make($data, array_merge(self::_getCommonValidationRules(), $rules), self::_getValidationMessages());


            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()->unique()));
            }

            $imageRules = array(
                'image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE
            );
            if (!empty($images)) {
                foreach ($images as $image) {
                    $image = array('image' => $image);
                    $imageValidator = Validator::make($image, $imageRules);
                    if ($imageValidator->fails()) {
                        throw new Exception(json_encode($imageValidator->errors()));
                    }
                }
            }



            if (!empty($thumbnail)) {
                $data['thumbnail'] = self::_uploadThumbnail($thumbnail, self::getThumbnailUploadPath(), 140, 140);
            } else {
                unset($data['thumbnail']);
            }

            if ($request->id) {
                ImageGallery::where('id', $request->id)->update($data);
                $gallery_data = ImageGallery::getGalleryInfo($request->id);
                //update/add gallery images on edit 
                if (!empty($images)) {
                    foreach ($images as $image) {
                        $image = self::_uploadImage($image, self::getImageUploadPath());
                        $imageArray['gallery_id'] = $request->id;
                        $imageArray['image'] = $image;
                        //Add Gallery images
                        GalleryImages::create($imageArray);
                    }
                }

                $data = [
                    'galleryData' => $gallery_data,
                ];
                if (!empty($gallery_data->id)) {
                    $data['galleryimages'] = GalleryImages::getImages($request->id);
                }



                $result = [
                    'success' => TRUE,
                    'message' => ['Image Gallery information successfully edited.'],
                    'data' => $data
                ];
            } else {
                $createdId = ImageGallery::create($data)->id;
                $gallery_data = ImageGallery::getGalleryInfo($createdId);
                // start if user has uploaded images    
                if (!empty($images)) {
                    foreach ($images as $image) {
                        $image = self::_uploadImage($image, self::getImageUploadPath());
                        $imageArray['gallery_id'] = $createdId;
                        $imageArray['image'] = $image;
                        //Add Gallery images
                        GalleryImages::create($imageArray);
                    }
                }
                // end if user has uploaded images 
                $result = [
                    'success' => TRUE,
                    'message' => ['Image Gallery information successfully added.'],
                    'data' => $gallery_data
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
     * Save the settings for music tab
     */
    public function saveImageServiceType(Request $request) {
        try {
            if (empty($request->tab_id)) {
                throw new Exception('Tab ID not found.');
            }
            if (!isset($request->image_service_type)) {
                throw new Exception('No settings data found.');
            }
            $tabData = TpAppsTabEntity::getAppTabInfo($request->tab_id);
            $tab_settings = json_decode($tabData->settings);
            $instagram_user_name = $request->instagram_user_name;
            if (isset($tab_settings->instagram_user_name)) {
                if (empty($instagram_user_name)) {
                    $instagram_user_name = $tab_settings->instagram_user_name;
                }
                $settings = [
                    'image_service_type' => $request->image_service_type, //1=>custom 2=>flicker 3=>picasa 4=>instagram
                    'instagram_user_name' => $instagram_user_name
                ];
            } else {
                if (empty($instagram_user_name)) {
                    $settings = [
                        'image_service_type' => $request->image_service_type, //1=>custom 2=>flicker 3=>picasa 4=>instagram
                    ];
                } else {
                    $settings = [
                        'image_service_type' => $request->image_service_type, //1=>custom 2=>flicker 3=>picasa 4=>instagram
                        'instagram_user_name' => $instagram_user_name
                    ];
                }
            }
            TpAppsTabEntity::where('id', $request->tab_id)->update(['settings' => json_encode($settings)]);
            $result = [
                'success' => TRUE,
                'message' => ['Settings successfully updated.'],
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
     * sort the image gallery
     */
    public function sortGallery(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            ImageGallery::updateMultiple($sortData);
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

    /**
     * delete the image gallery
     */
    public function deleteGallery(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            ImageGallery::deleteGallery($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Gallery information successfully deleted.'],
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
     * get the gallery data
     */
    public function getItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = [
                'galleryData' => ImageGallery::getGalleryInfo($request->id),
//                'galleryimages' => GalleryImages::getGalleryInfo($request->id)
            ];
            if (!empty($data['galleryData']->id)) {
                $data['galleryimages'] = GalleryImages::getImages($request->id);
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

//delete thumbnail
    public function deleteThumbnail(Request $request) {
        try {

            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            ImageGallery::where('id', $request->id)->update(['thumbnail' => NULL]);
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

    //delete image 
    public function deleteImage(Request $request) {
        try {

            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            GalleryImages::where('id', $request->id)->delete();
            $result = [
                'success' => TRUE,
                'message' => ['image successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    //Save Image description
    public function saveImageDescription(Request $request) {
        try {
            $data = $request->all();

            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            GalleryImages::where('id', $request->id)->update($data);
            $result = [
                'success' => TRUE,
                'message' => ['Image described successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    //Get Image description
    public function getImageDescription(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('image id not found.');
            }

            $data = GalleryImages::getImageDescription($request->id);
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
     * List Gallery
     */
    public function galleryList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab Id not found.');
            }
            $data = ImageGallery::getGalleryList($request->tabId);
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

    public static function getWebImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::WEB_IMAGE_UPLOAD_PATH);
    }

    /**
     * Saves the image file and returns the saved file name.
     * @return string
     */
    private static function _uploadImageWeb($image, string $uploadPath): string {
        //added for facebook album image validation
        if (strpos($image, '?') !== false) {
            list($image1, $nextPart) = explode('?', $image);
            $extension = substr(strrchr($image1, "."), 1);
        } else {
            $extension = substr(strrchr($image, "."), 1);
        }
        $fileName = Helper::getMilliTimestamp() . '_gallery_image.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image)
//                ->resize($width, $height)
                ->save($uploadPath . '/' . $fileName);
        chmod($uploadPath . '/' . $fileName, 0777);
        return $fileName;
    }

    /**
     * Load the image gallery from Web URL using streamed response
     */
    public function getImageWebUrl(Request $request) {
        $tId = $request->tabId;
        $url = $request->webUrl;

        $response = new StreamedResponse(function() use ($tId, $url) {
            try {
                $data = array();
                if (empty($tId)) {
                    throw new Exception('Tab Id not found.');
                }
                if (empty($url)) {
                    throw new Exception('Web URL not found.');
                }

                $img_count = 0;
                $data['tab_id'] = $tId;
                $data['webUrl'] = $url;

                $rules = ['tab_id' => 'required|integer', 'webUrl' => 'required|url'];
                $validator = Validator::make($data, $rules, self::_getValidationMessages());

                if ($validator->fails()) {
                    throw new Exception(json_encode($validator->errors()));
                }


                libxml_use_internal_errors(true);

                $webUrl = $data['webUrl'];
                $htmlContent = file_get_contents($webUrl);
                unset($data['webUrl']);

                preg_match_all('/(https?:\/\/\S+\.(?:jpg|png))+/', $htmlContent, $matches);

                if (!empty($matches[0]) || count($matches[0]) != 0) {

                    $images = $matches[0];
                    $valid_image_array = array();
//                    $images = array_slice($images, 20); //For Testing Purpose images restricted after 20 elements

                    foreach ($images as $imageUrl) {
                        $img_status = self :: checkRemoteFile($imageUrl);
                        if ($img_status == 1) {
                            $valid_image_array[] = $imageUrl;
                        }
                    }

                    $valid_img_count = count($valid_image_array);
                    $img_count = $valid_img_count;

                    //create gallery if at least one image is found
                    if ($valid_img_count > 1) {
                        //if there exists images then create a gallery with below images as gallery_images  
                        $data['name'] = 'Misc Photos';
                        $createdId = ImageGallery::create($data)->id;
                        $result = [
                            'success' => TRUE,
                            'data' => ['total' => $img_count, 'current' => 0],
                        ];

                        //Send data to event listener
                        $msg = "data:" . json_encode($result) . "\n\n";
                        $this->sendStream($msg);

                        foreach ($valid_image_array as $key => $imageUrl) {
                            //Add Gallery images to folder
                            $image = self::_uploadImageWeb($imageUrl, self::getImageUploadPath());
                            $imageArray['gallery_id'] = $createdId;
                            $imageArray['image'] = $image;

                            //Add Gallery images to database
                            GalleryImages::create($imageArray);

                            $result = [
                                'success' => TRUE,
                                'data' => ['total' => $img_count, 'current' => ($key + 1)],
                            ];

                            //Send data to event listener
                            $msg = "data:" . json_encode($result) . "\n\n";
                            $this->sendStream($msg);
                        }
                    } else {
                        //If no valid image url found
                        $result = [
                            'success' => TRUE,
                            'data' => ['total' => $img_count],
                        ];

                        //Send data to event listener
                        $msg = "data:" . json_encode($result) . "\n\n";
                        $this->sendStream($msg);
                    }
                } else {
                    //If no image url found
                    $result = [
                        'success' => TRUE,
                        'data' => ['total' => $img_count],
                    ];

                    //Send data to event listener
                    $msg = "data:" . json_encode($result) . "\n\n";
                    $this->sendStream($msg);
                }
            } catch (Exception $ex) {
                $result = [
                    'success' => FALSE,
                    'message' => $ex->getMessage(),
                ];

                //Send data to event listener
                $msg = "data:" . json_encode($result) . "\n\n";
                $this->sendStream($msg);
            }
        });
        $response->headers->set('Content-Type', 'text/event-stream');
        return $response;
    }

    private function sendStream(string $message) {
        echo $message;
        ob_flush();
        flush();
    }

    //check Remote Url for valid url
    function checkRemoteFile($url) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        // don't download content
        curl_setopt($ch, CURLOPT_NOBODY, 1);
        curl_setopt($ch, CURLOPT_FAILONERROR, 1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        if (curl_exec($ch) !== FALSE) {
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * Load the image gallery from Web URL without streamed response
     */
    public function saveWebUrlImages(Request $request) {
        try {
            $data = $request->all();
            unset($data['fbUrl']);
            unset($data['importTypeService']);

            $rules = ['tab_id' => 'required|integer', 'webUrl' => 'required|url'];
            $validator = Validator::make($data, $rules, self::_getValidationMessages());

            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()));
            }

            libxml_use_internal_errors(true);
            $webUrl = $data['webUrl'];
            $htmlContent = file_get_contents($webUrl);

            unset($data['webUrl']);

            preg_match_all('/(https?:\/\/\S+\.(?:jpg|png))+/', $htmlContent, $matches);

            if (!empty($matches[0]) || count($matches[0]) != 0) {

                $images = $matches[0];
                $valid_image_array = array();

                foreach ($images as $imageUrl) {
                    $img_status = self :: checkRemoteFile($imageUrl);
                    if ($img_status == 1) {
                        $valid_image_array[] = $imageUrl;
                    }
                }

                $valid_img_count = count($valid_image_array);
                $img_count = $valid_img_count;

                //create gallery if at least one image is found
                if ($valid_img_count > 1) {
                    //if there exists images then create a gallery with below images as gallery_images  
                    $data['tab_id'] = $request->tab_id;
                    $data['name'] = 'Misc Photos';
                    $createdId = ImageGallery::create($data)->id;

                    foreach ($valid_image_array as $imageUrl) {
                        $image = self::_uploadImageWeb($imageUrl, self::getImageUploadPath());
                        $imageArray['gallery_id'] = $createdId;
                        $imageArray['image'] = $image;
                        //Add Gallery images
                        GalleryImages::create($imageArray);
                    }

                    $result = [
                        'success' => True,
                        'message' => ['Gallery Created Successfully.'],
                    ];
                } else {
                    $result = [
                        'success' => False,
                        'message' => ['Valid Images not found.'],
                    ];
                }
            } else {
                $result = [
                    'success' => False,
                    'message' => ['Images not found.'],
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

    public function facebook_login(Request $request) {
        try {
            session_start();
            $fb = new Facebook\Facebook([/* . . . */]);
            $helper = $fb->getRedirectLoginHelper();
//                $permissions = ['email','user_photos']; // optional
            $url = 'https://localhost/tappit/api/ws/function/image-gallery/facebook/pageAlbums';
//                $url = 'https://localhost/tappit/api/ws/function/image-gallery/user/accessToken';
            $loginUrl = $helper->getLoginUrl($url);
            $data = [
                'isLogIn' => 0,
                'loginUrl' => $loginUrl
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

    public function get_access_token() {
        session_start();
        $id = self::APP_ID;
        $secret = self::APP_SECRET;
        $fb = new Facebook\Facebook([/* . . . */]);
        $helper = $fb->getRedirectLoginHelper();
        $accessToken = $helper->getAccessToken();
        // The OAuth 2.0 client handler helps us manage access tokens
        $oAuth2Client = $fb->getOAuth2Client();
        // Get the access token metadata from /debug_token
        $tokenMetadata = $oAuth2Client->debugToken($accessToken);
        // Validation (these will throw FacebookSDKException's when they fail)
        $tokenMetadata->validateAppId($id);
        $tokenMetadata->validateExpiration();
        if (!$accessToken->isLongLived()) {
            // Exchanges a short-lived access token for a long-lived one
            try {
                $accessToken = $oAuth2Client->getLongLivedAccessToken($accessToken);
            } catch (Facebook\Exceptions\FacebookSDKException $e) {
                echo "<p>Error getting long-lived access token: " . $helper->getMessage() . "</p>\n\n";
                exit;
            }
        }
        $_SESSION['fb_access_token'] = $accessToken;
        return $accessToken;
    }

    //Facebook sdk after login and getting albums
    public function fbPageAlbums(Request $request) {
        try {
            $id = self::APP_ID;
            $secret = self::APP_SECRET;

            if (empty($request->accessKey)) {
                throw new Exception('Acess Key not found.');
            }
            if (empty($request->fbPageUrl)) {
                throw new Exception('Facebook page url not found.');
            }

            $url = $request->fbPageUrl;
            $access_token = $request->accessKey;

            $page_id = substr($url, strrpos($url, '/') + 1);
            $page_id = '/' . $page_id;

            $fbApp = new FacebookApp($id, $secret);
            $fbrequest = new FacebookRequest($fbApp, $access_token, 'GET', $page_id, array('fields' => 'id,name,albums'));
            $fb = new Facebook(/* . . . */);

            // Send the request to Graph
            try {
                $response = $fb->getClient()->sendRequest($fbrequest);
            } catch (Facebook\Exceptions\FacebookResponseException $e) {
                // When Graph returns an error              
                $result = [
                    'success' => FALSE,
                    'message' => $e->getMessage(),
                ];
            } catch (Facebook\Exceptions\FacebookSDKException $e) {
                // When validation fails or other local issues
                $result = [
                    'success' => FALSE,
                    'message' => $e->getMessage(),
                ];
            }

            $graphNode = $response->getGraphNode();
            $album = $graphNode['albums'];
            $new_album = array();
            foreach ($album as $value) {
                $album_count = self :: albumImageCount($value['id'], $access_token);
                if ($album_count > 0) {
                    $new_album[] = array('id' => $value['id'], 'name' => $value['name'], 'count' => $album_count);
                }
            }

            $data = array('albums' => $new_album, 'access_token' => $access_token);

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

    public function albumImageCount($album_id, $access_token) {
        try {
            $id = self::APP_ID;
            $secret = self::APP_SECRET;
            $fbApp = new FacebookApp($id, $secret);

            $request = new FacebookRequest($fbApp, $access_token, 'GET', '/' . $album_id . '/photos', array('fields' => 'id'));
            $fb = new Facebook(/* . . . */);

            // Send the request to Graph
            try {
                $response = $fb->getClient()->sendRequest($request);
            } catch (Facebook\Exceptions\FacebookResponseException $e) {
                // When Graph returns an error
                echo 'Graph returned an error: ' . $e->getMessage();
                exit;
            } catch (Facebook\Exceptions\FacebookSDKException $e) {
                // When validation fails or other local issues
                echo 'Facebook SDK returned an error: ' . $e->getMessage();
                exit;
            }
            $graphNode = $response->getGraphEdge();
            $count = count($graphNode);
        } catch (Exception $ex) {
            $count = 0;
        }
        return $count;
    }

    //import gallary for multiple gallary selected.
    public function gallaryImport(Request $request) {
        try {
            if (empty($request->album_ids)) {
                throw new Exception('Album IDs not found.');
            }
            if (empty($request->tab_id)) {
                throw new Exception('Tab ID not found.');
            }
            if (empty($request->accessKey)) {
                throw new Exception('Access Token not found.');
            }
            $id = $request->album_ids;
            $albumIdArr = $id;

            $access_token = $request->accessKey;
//            $albumIdArr = array('642613552428158','662773323745514');

            if (!is_array($id)) {
                $albumIdArr = [$id];
            }

//            print_r($albumIdArr);
            //import gallary images for checkboxes of albums selected.
            foreach ($albumIdArr as $album_id_string) {
                //album id string is in form "642613552428158__Amazing world"
                list($album_id, $album_name) = explode("__", $album_id_string);
                $images = self :: fbPageAlbumImages($album_id, $access_token);

                $valid_img_count = count($images);
                $img_count = $valid_img_count;

                // testing for now only download 5 images
                if ($valid_img_count > 10) {
                    $images = array_slice($images, 0, 5);
                }

//                print_r($images);
//                die();
                //create gallery if at least one image is found
                if ($valid_img_count > 1) {
                    //if there exists images then create a gallery with below images as gallery_images  
                    $data['tab_id'] = $request->tab_id;
                    $data['name'] = $album_name;

                    $createdId = ImageGallery::create($data)->id;
                    $gallery_data = ImageGallery::getGalleryInfo($createdId);

                    foreach ($images as $imageUrl) {
                        $image = self::_uploadImageWeb($imageUrl, self::getImageUploadPath());
                        $imageArray['gallery_id'] = $createdId;
                        $imageArray['image'] = $image;
                        //Add Gallery images
                        GalleryImages::create($imageArray);
                    }
                    //                $result = [
                    //                    'success' => True,
                    //                    'message' => ['Gallery Created Successfully.'],
                    //                    ];
                }
//                else{
//                    $result = [
//                    'success' => False,
//                    'message' => ['Valid Images not found.'],
//                    ];
//                } 
            }
            // end if album images uploaded
            $result = [
                'success' => TRUE,
                'message' => ['Image Gallery information successfully added.'],
//                        'data' => $gallery_data
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    //get images of album
    public function fbPageAlbumImages($album_id, $access_token) {
        try {
            session_start();
            if (empty($album_id)) {
                throw new Exception('Album ID not found.');
            }

            $id = self::APP_ID;
            $secret = self::APP_SECRET;

            $fbApp = new FacebookApp($id, $secret);
            $request = new Facebook\FacebookRequest($fbApp, $access_token, 'GET', '/' . $album_id . '/photos', array('fields' => 'id,name,source'));
            $fb = new Facebook\Facebook(/* . . . */);

            // Send the request to Graph
            try {
                $response = $fb->getClient()->sendRequest($request);
            } catch (Facebook\Exceptions\FacebookResponseException $e) {
                // When Graph returns an error
                echo 'Graph returned an error: ' . $e->getMessage();
                exit;
            } catch (Facebook\Exceptions\FacebookSDKException $e) {
                // When validation fails or other local issues
                echo 'Facebook SDK returned an error: ' . $e->getMessage();
                exit;
            }
            $graphNode = $response->getGraphEdge();

            $images = array();
            foreach ($graphNode as $value) {
                $images[] = $value['source'];
            }
        } catch (Exception $ex) {
            $images = array();
        }
        return $images;
    }

    /**
     * get gallery photos
     */
    public function getGalleryPhotos(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = [
                'galleryimages' => GalleryImages::getGalleryPhotos($request->id)
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
     * Instagram Images
     */
    public function getInstagramUserInfo(Request $request) {
        try {
            if (empty($request->accessToken)) {
                throw new Exception('Instagram User Token not found.');
            }
            $access_token = $request->accessToken;
            if ($access_token) {
                $client = new \GuzzleHttp\Client;
                $url = 'https://api.instagram.com/v1/users/self/?access_token=' . $access_token;
                $response = self::curl_call_for_instagram($url);

                $user = json_decode($response, true)['data'];
                $result = [
                    'success' => True,
                    'user' => $user
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
     * Instagram Images
     */
    public function getInstagramPhotos(Request $request) {
        try {
            if (empty($request->tab_id)) {
                throw new Exception('Tab ID not found.');
            }
            if (empty($request->user_id)) {
                throw new Exception('Instagram User Id not found.');
            }
            $user_name = $request->user_id;
            $items = [];
            $images = [];
            if ($user_name) {
                $client = new \GuzzleHttp\Client;
                $url = sprintf('https://www.instagram.com/%s/media', $user_name);
                $response = $client->get($url);
                $items = json_decode((string) $response->getBody(), true)['items'];
                if (isset($items) && !empty($items)) {
                    foreach ($items as $key => $item) {
                        $images[] = [
                            'image' => $item['images']['standard_resolution']['url']
                        ];
                    }
                }
                if (isset($images)) {
                    $result = [
                        'success' => True,
                        'data' => $images
                    ];
                } else {
                    $result = [
                        'success' => False,
                        'message' => ['Images Not Found']
                    ];
                }

                $valid_img_count = count($images);
                $img_count = $valid_img_count;
            }
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function curl_call_for_instagram($url) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
        $data = curl_exec($ch);
        curl_close($ch);
        return $data;
    }

    /**
     * Picasa Images
     */
    public function getPicasaPhotos(Request $request) {
        try {
            if (empty($request->tab_id)) {
                throw new Exception('ID not found.');
            }
            if (empty($request->user_id)) {
                throw new Exception('Picasa User Id not found.');
            }
            $user_name = $request->user_id;
//            $user_name = 'rajneesh.185';
//            $user_name = 'akash.nigam008';
//            $user_name = 'aman07dixit';
//            $user_name = 'purish87';
//            $user_name = '106997187098410041791';
            $items = [];
            if ($user_name) {
                $client = new \GuzzleHttp\Client;
                $url = 'https://picasaweb.google.com/data/feed/api/user/' . $user_name;
//                $url = 'http://picasaweb.google.com/data/feed/api/user/'.$user_name.'?kind=album&hl=en_US&access=visible&fields=entry(id,media:group(media:content,media:description,media:keywords,media:title))';

                $xml = self:: curl_call($url);
                $entry = $xml->entry->id;
                $str = $entry[0];
                $album_id = substr($str, strrpos($str, '/') + 1);

                if (isset($album_id) && $album_id != "") {
                    $url = 'https://picasaweb.google.com/data/entry/api/user/' . $user_name . '/albumid/' . $album_id;
                    $xml = self:: curl_call($url);
                    $album_name = $xml->title;
                    $links = $xml->link;
                    $photoUrl = $links[0]['href'];
                    // https://picasaweb.google.com/data/feed/api/user/115265196352234417702/albumid/5994901989622683841

                    $xml = self:: curl_call($photoUrl);
                    $entries = $xml->entry; // is array of photoid url

                    if (isset($entries) && !empty($entries)) {
                        $images = array();
                        foreach ($entries as $values) {
                            $url = array((string) $values->id);
                            $photo_id = substr($url[0], strrpos($url[0], '/') + 1);
                            $photo_id_url = 'https://picasaweb.google.com/data/feed/api/user/' . $user_name . '/albumid/' . $album_id . '/photoid/' . $photo_id;
                            $xml = self:: curl_call($photo_id_url);
                            $title = $xml->title;
                            $icon = $xml->icon;
                            array_push($images, $icon);
                        }
                        $result = [
                            'success' => True,
                            'data' => $images
                        ];
                    } else {
                        $result = [
                            'success' => False,
                            'message' => ['No images found.'],
                        ];
                    }
                } else {
                    $result = [
                        'success' => False,
                        'message' => ['No Album found.'],
                    ];
                }
            }
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function curl_call($url) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
        $data = curl_exec($ch);
        curl_close($ch);

        $xml = simplexml_load_string($data) or die("Error: Cannot create object");
        return $xml;
    }

    //Init image Gallary for getting details of default service selected
    public function initGallaryConfig(Request $request) {
        try {
            if (empty($request->tab_id)) {
                throw new Exception('Tab ID not found.');
            }
            //get default image service selected for specific tab_id 
            $tab_id = $request->tab_id;
            $service_details = GalleryConfig :: get_default_image_service($tab_id);
            $result = [
                'success' => TRUE,
                'data' => $service_details,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    //Save image Gallary configuration details if details not exist in db otherwise update
    public function saveGallaryConfig(Request $request) {
        try {
            $data = $request->all();
            $validator = Validator::make($data, self::_getCommonValidationRulesGalleryConfig(), self::_getValidationMessagesGalleryConfig());


            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()));
            }
            $tab_id = $request->tab_id;
            $gallery_type = $request->gallery_type;
            //check if data exist for tab_id and gallery_type
            //if exists then update the corresponding details otherwise create 
            $gallery_details = GalleryConfig :: get_gallery_config($tab_id, $gallery_type);

            if (!empty($gallery_details)) {
                //update gallery config details   
                $id = $gallery_details['id'];
                GalleryConfig :: where('id', $id)->update($data);
            } else {
                GalleryConfig::create($data);
            }
            $result = [
                'success' => TRUE,
                'message' => ['Gallery configuration saved successfully.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    //get Gallery configuration detail for given tab_id and gallery_type
    public function getGalleryConfigDetails(Request $request) {
        try {
            if (empty($request->tab_id)) {
                throw new Exception('Tab ID not found.');
            }
            if (empty($request->gallery_type)) {
                throw new Exception('Gallary type not found.');
            }
            //get configuration details for gallery type and tab_id 
            $tab_id = $request->tab_id;
            $gallery_type = $request->gallery_type;

            $gallery_details = GalleryConfig :: get_gallery_config($tab_id, $gallery_type);

            $result = [
                'success' => TRUE,
                'data' => $gallery_details,
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
     * sort the image list
     */
    public function sortImages(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            GalleryImages::updateMultiple($sortData);
            $result = [
                'success' => TRUE,
                'data' => 'Image order saved.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function lagoutInstagramUser(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Id not found');
            }
            $settings = [
                'image_service_type' => 1, //1=>custom 2=>flicker 3=>picasa 4=>instagram
            ];
            TpAppsTabEntity::where('id', $request->tabId)->update(['settings' => json_encode($settings)]);
            $result = [
                'success' => TRUE,
                'data' => 'Lagout successfully.'
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
