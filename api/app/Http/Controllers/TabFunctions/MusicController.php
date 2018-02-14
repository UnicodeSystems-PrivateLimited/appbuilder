<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\Music;
use App\Models\TabFunctions\CountryCodeIso;
use App\Models\TpAppsTabEntity;
use App\Helpers\Helper;
use SevenDigital;
use SevenDigital\ApiClient;
use App\Models\TabFunctions\MusicComments;
use App\Models\TpAppsEntity;
use App\Models\TabFunctions\SocialUser;

class MusicController extends Controller {

    const THUMBNAIL_IMAGE_UPLOAD_PATH = 'app/public/functions/music/thumbnail';
    const TRACK_UPLOAD_PATH = 'app/public/functions/music/track';
    const PHONE_HEADER_IMAGE_UPLOAD_PATH = 'app/public/functions/music/phone';
    const TAB_HEADER_IMAGE_UPLOAD_PATH = 'app/public/functions/music/tablet';

    private static function _getCommonValidationRules(): array {
        return [
            'track_file' => 'mimes:mpeg,mpga,mp3,mpeg3,ogg,wav,aiff,amr|max:6144',
            'title' => 'required',
            'art_file' => 'mimes:jpeg,jpg,png|max:6144',
        ];
    }

    private static function _getValidationMessages() {
        return [];
    }

    private static function _getCommonValidationImportiTunesRules(): array {
        return [
            'by_search' => '',
            'by_album_url' => '',
            'keyword' => 'required_if:by_search,1',
            'album_url' => 'required_if:by_album_url,1|url'
        ];
    }

    private static function _getValidationImportiTunesMessages() {
        return [
            'keyword.required_if' => 'No songs found. Please update your search criteria and then try again.',
            'album_url.required_if' => 'Please type the correct album URL on App Store. \n ex: http://itunes.apple.com/us/album/take-care-deluxe-version/id479760323'
        ];
    }

    private static function _getCommonValidationImport7DigitalRules(): array {
        return [
            'keyword' => 'required'
        ];
    }

    private static function _getValidationImport7DigitalMessages() {
        return [
            'keyword' => 'Enter your artist name, album name or track'
        ];
    }

    /**
     * Save the settings for music tab
     */
    public function saveSettings(Request $request) {
        try {
            if (empty($request->tab_id)) {
                throw new Exception('Tab ID not found.');
            }
            if (!isset($request->home_screen_widget)) {
                throw new Exception('No settings data found.');
            }
            $tabData = TpAppsTabEntity::getAppTabInfo($request->tab_id);
            $settings = [
                'home_screen_widget' => $request->home_screen_widget,
                'widget_location' => $request->widget_location, //1=>left, 2=>right
                'icon_opacity' => $request->icon_opacity,
                'phone_header_image' => $request->phone_header_image,
                'tablet_header_image' => $request->tablet_header_image,
            ];
            TpAppsTabEntity::where('id', $request->tab_id)->update(['settings' => json_encode($settings)]);
            if ($request->home_screen_widget) {
                Music::updateSettings($request->tab_id, $tabData->app_id);
            }
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
     * Load the list of Tracks with Count
     */
    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $type = (isset($request->type) ? $request->type : NULL);
            $tab_data = TpAppsTabEntity::getAppTabInfo($request->tabId);
            $settings_data = $tab_data->settings;
            $image = array();
            if (isset($settings_data) && !empty($settings_data)) {
                $settings = json_decode($settings_data);
                $phone_header_image = $settings->phone_header_image;
                $tablet_header_image = $settings->tablet_header_image;
                if (isset($phone_header_image) && !empty($phone_header_image)) {
                    $phoneURL = self :: getPhoneHeaderImageUploadUrl();
                    $image['phone_header_image'] = $phoneURL . '/' . $phone_header_image;
                }
                if (isset($tablet_header_image) && !empty($tablet_header_image)) {
                    $tabURL = self :: getTabletHeaderImageUploadUrl();
                    $image['tablet_header_image'] = $tabURL . '/' . $tablet_header_image;
                }
            }
            $data = [
                'itemData' => Music::getTrackList($request->tabId, $type),
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
                'musicCategory' => Music::getAlbumWiseMusicTrackList($request->tabId, $type),
                'header_image' => $image
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
     * Load single track data
     */
    public function getItemData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $comments = MusicComments::getComments($request->id);
            $item = Music::getTrackData($request->id);
            $track_file = $item['track_file'];
            $track_url = $item['track_url'];
            $art_file = $item['art_file'];
            $art_url = $item['art_url'];
            $data = [
                'itemData' => $item,
                'comments' => $comments,
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
     * Get the track list
     */
    public function ListTracks(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $type = (isset($request->type) ? $request->type : NULL);
            $data = Music::getTrackList($request->tabId, $type);
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
     * Saves the image file and returns the saved file name.
     * @return string
     */
    private static function _uploadImage($image, string $uploadPath, $width, $height): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_music_art.' . $extension;
        Helper::makeDirectory($uploadPath);
        Image::make($image->getRealPath())
                ->resize($width, $height)
                ->save($uploadPath . '/' . $fileName);
        return $fileName;
    }

    /**
     * Saves the track file and returns the saved file name.
     * @return string
     */
    private static function _uploadTrack($track, string $uploadPath): string {
        $extension = $track->getClientOriginalExtension();
        $fileName = Helper::getMilliTimestamp() . '_track_music.' . $extension;
        Helper::makeDirectory($uploadPath);
        $track->move($uploadPath, $fileName);
        return $fileName;
    }

    //thumbnail image
    public static function getThumbNailImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::THUMBNAIL_IMAGE_UPLOAD_PATH);
    }

    //upload url is used by model function while returning image from database
    public static function getThumbNailImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::THUMBNAIL_IMAGE_UPLOAD_PATH);
    }

    //track file
    public static function getTrackUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::TRACK_UPLOAD_PATH);
    }

    //upload url is used by model function while returning track from database
    public static function getTrackUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::TRACK_UPLOAD_PATH);
    }

    /**
     * Create and Save Tacks for Music Tab
     */
    public function save(Request $request) {
        try {
            $data = $request->all();

            $track_file = $request->file('track_file');
            $art_file = $request->file('art_file');
            $data['track_file'] = $track_file;
            $data['art_file'] = $art_file;

            $track_url = $request->track_url;
            $art_url = $request->art_url;

            $rules = $request->id ? ['id' => 'required|integer', 'art_file' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE] : ['tab_id' => 'required|integer', 'art_file' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE];

            $validator = Validator::make($data, array_merge(self::_getCommonValidationRules(), $rules), self::_getValidationMessages());

            if (!isset($track_file) && !isset($track_url)) {
                throw new Exception('Track Section is empty.');
            }
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }

            // Save track_file music
            if (!empty($track_file)) {
                $data['track_file'] = self::_uploadTrack($track_file, self::getTrackUploadPath());
            } else {
                unset($data['track_file']);
            }
            if (isset($track_file)) {
                $track_url = substr($data['track_file'], strrpos($data['track_file'], '/') + 1);
                $data['track_url'] = $track_url;
            }
            // Save art_file image
            if (!empty($art_file)) {
                $data['art_file'] = self::_uploadImage($art_file, self::getThumbNailImageUploadPath(), 200, 200);
            } else {
                unset($data['art_file']);
            }

            if (isset($art_file)) {
                $art_url = substr($data['art_file'], strrpos($data['art_file'], '/') + 1);
                $data['art_url'] = $art_url;
            }
            if ($request->id) {
                Music::where('id', $request->id)->update($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Music track information successfully edited.'],
                ];
            } else {
                Music::create($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['Music track successfully added.'],
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
     * Delete track
     */
    public function deleteTrack(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            Music::deleteTrack($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Track information successfully deleted.'],
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
     * sort the Tracks
     */
    public function sortTracks(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            Music::updateMultiple($sortData);
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

    //phone header image
    public static function getPhoneHeaderImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::PHONE_HEADER_IMAGE_UPLOAD_PATH);
    }

    //tablet header image
    public static function getTabletHeaderImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::TAB_HEADER_IMAGE_UPLOAD_PATH);
    }

    //phone header image
    public static function getPhoneHeaderImageUploadUrl(): string {
        return Helper::getUploadDirectoryURL(self::PHONE_HEADER_IMAGE_UPLOAD_PATH);
    }

    //tablet header image
    public static function getTabletHeaderImageUploadUrl(): string {
        return Helper::getUploadDirectoryURL(self::TAB_HEADER_IMAGE_UPLOAD_PATH);
    }

    /**
     * upload phone and tablet header image
     */
    public function uploadHeaderImage(Request $request) {
        try {

            $phone_header_image = $request->file('phone_header_image');
            $tablet_header_image = $request->file('tablet_header_image');
            $imageData = $request->all();
            //phone header image
            $imageRules = ['phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE];
            $imageValidator = Validator::make($imageData, $imageRules);
            if ($imageValidator->fails()) {
                throw new Exception(json_encode($imageValidator->errors()));
            }
            if (!empty($phone_header_image)) {
                $image1 = self::_uploadImage($phone_header_image, self::getPhoneHeaderImageUploadPath(), 640, 264);
                $phoneURL = self :: getPhoneHeaderImageUploadUrl();
                $image['phone_header_image'] = $phoneURL . '/' . $image1;
            }
            //tablet header image
            if (!empty($tablet_header_image)) {
                $image1 = self::_uploadImage($tablet_header_image, self::getTabletHeaderImageUploadPath(), 1536, 634);
                $tabURL = self :: getTabletHeaderImageUploadUrl();
                $image['tablet_header_image'] = $tabURL . '/' . $image1;
            }

            $result = [
                'success' => TRUE,
                'data' => $image
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
     * import tracks from iTunes
     */
    public function isoCountryList(Request $request) {
        try {
            $data = [
                'countries' => CountryCodeIso::countryListISO()
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
     * search tracks from iTunes
     */
    public function searchFromItunes(Request $request) {
        try {
            if (empty($request->tab_id)) {
                throw new Exception('Tab Id not found.');
            }
            $data = $request->all();
            $validator = Validator::make($data, self::_getCommonValidationImportiTunesRules(), self::_getValidationImportiTunesMessages());
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            $keyword = $request->keyword;
            $country_id = $request->country_id;
            $country_details = CountryCodeIso::country($country_id);
            $country = $country_details['code'];
            if ($request->search_by == "BYKEYWORD") {
                if (isset($keyword)) {
                    $keyword = urlencode($request->keyword);
                    $client = new \GuzzleHttp\Client;
                    $url = 'https://itunes.apple.com/search?term=' . $keyword . '&media=music&country=' . $country;
                }
            } else {
                $url = $request->album_url;
                if (empty($request->album_url)) {
                    throw new Exception('Please type the correct album URL on App Store.');
                }
//            $url = 'http://itunes.apple.com/us/album/take-care-deluxe-version/id479760323';
                $album_url_id_string = substr($url, strrpos($url, '/') + 1);
                $pos = strpos($album_url_id_string, 'id');
                $album_id = substr($album_url_id_string, $pos + 2);
                $url = 'https://itunes.apple.com/lookup?id=' . $album_id . '&entity=song&media=music';
            }
            $music = self:: curl_call($url);
            $musicJson = json_decode($music, true);
            $tracks = $musicJson['results'];
            if (!empty($tracks)) {
                foreach ($tracks as $value) {
                    if ($value['wrapperType'] == 'track') {
                        $iTuneTrack[] = [
                            'is_for_android' => 1,
                            'is_active_iphone' => 1,
                            'artist' => $value['artistName'],
                            'title' => $value['trackName'],
                            'album' => $value['collectionName'],
                            'track_url' => $value['previewUrl'],
                            'purchase_url' => $value['collectionViewUrl'],
                            'art_url' => $value['artworkUrl100'],
                        ];
                    }
                }
                $result = [
                    'success' => TRUE,
                    'data' => $iTuneTrack
                ];
            } else {
                $result = [
                    'success' => FALSE,
                    'message' => 'No songs found. Please update your search criteria and then try again.'
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
     * import tracks from iTunes into database
     */
    public function importItunesTrack(Request $request) {
        try {
            if (empty($request->tab_id)) {
                throw new Exception('Tab Id not found.');
            }
            $data = $request->itune_list;
//            $tracks = [];  //data from request fields
            foreach ($data as $key => $value) {
                $trackData['tab_id'] = $request->tab_id;
                $trackData['title'] = $value['title'];
                $trackData['album'] = $value['album'];
                $trackData['artist'] = $value['artist'];
                $trackData['track_url'] = $value['track_url'];
                $trackData['art_url'] = $value['art_url'];
                $trackData['purchase_url'] = $value['purchase_url'];
                $trackData['is_for_android'] = $value['is_for_android'];
                $trackData['is_active_iphone'] = $value['is_active_iphone'];
                Music :: create($trackData);
            }
            $result = [
                'success' => TRUE,
                'message' => 'Tracks Imported Successfully'
            ];
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
        return $data;
    }

    /**
     * import tracks from iTunes
     */
    public function importFrom7Digital(Request $request) {
        try {
//            if (empty($request->tab_id)) {
//                throw new Exception('Tab Id not found.');
//            }

            $data = $request->all();
            print_r($data);
            $oauth_consumer_key = '7dmt6fhduhdf';
//            $oauth_consumer_secret='tftu8f64k3phqgcw';
//            $consumer_key      = '7dmt6fhduhdf';
//            $client = new ApiClient($consumer_key);
//            print_r($client);
//            die();
//            $track = $client->getTrackService(); //Services artist, release and tag are also accessible the same way
//            print_r($client);
//            die();
//            $results = $track->search('jack+johnson'); // Use the method name as described in the 7digital api documentation
            // (ex: http://api.7digital.com/1.2/static/documentation/7digitalpublicapi.html#track/search)
            // Required argument can be passed directly
//            $results = $track->search(array( // Other arguments must be passed as a hash
//             'q'        => 'Queen',          // Method result will be an instance of \SimpleXMLElement (http://fr2.php.net/simplexmlelement)
//             'pageSize' => 1,
//            ));
//            print_r($results);
//            $url = 'http://api.7digital.com/1.2/release/search?q=no%20surprises&oauth_consumer_key='. $oauth_consumer_key .'&country=GB&pagesize=2&usageTypes=download,subscriptionstreaming,adsupportedstreaming';
//            $url = 'http://api.7digital.com/1.2/artist/details?country=GB&oauth_consumer_key='. $oauth_consumer_key .'&artistId=1';
//            $keyword = urlencode($request->keyword);
//            $url = 'http://localhost/tappit/api/ws/function/music/import/7Digital?oauth_consumer_key=7dmt6fhduhdf&oauth_nonce=402808941&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1488951998&oauth_version=1.0&oauth_signature=amBwY7cv2mCuLqOyuVAwUP1ywYc%3D';
//            $url = 'http://feeds.api.7digital.com/1.2/feed/track/full?country=WW&date=20160623&oauth_consumer_key='.$oauth_consumer_key;
//     
//            $url = 'http://api.7digital.com/1.2/static/documentation/7digitalpublicapi.html#track/search/jack';
//            
//            $url = ' http://api.7digital.com/1.2/artist/details?country=US&oauth_consumer_key='. $oauth_consumer_key;

            $url = 'http://feeds.api.7digital.com/1.2/feed/artist/full?country=WW&date=20160623&oauth_consumer_key=' . $oauth_consumer_key;
            $client = new \GuzzleHttp\Client;
            $music = self:: curl_call($url);
            print_r($music);
            die();


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
     * Comments -------- Music tab

     * Add Comments for Music tab
     */
    public function saveComment(Request $request) {
        try {
            $data = $request->all();
            $rules = ['content_id' => 'required|integer', 'description' => 'required'];
            $validator = Validator :: make($data, $rules);
            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()->unique()));
            }
            $appId = TpAppsEntity::getAppId($data['app_code']);
            if (!$appId) {
                throw new Exception("Invalid app code provided");
            }
            if ($data['social_media_type'] != SocialUser::USER_TYPE_USER_PROFILE) {
                $socialUserData = [
                    'social_media_id' => $data['social_media_id'],
                    'social_media_type' => $data['social_media_type'],
                    'name' => $data['name'],
                    'picture' => $data['picture'],
                    'app_id' => $appId,
                ];
                $userId = SocialUser::saveUserAndGetId($socialUserData, $data['device_uuid']);
            } else {
                $userId = $data['social_media_id'];
            }
            $commentData = [
                'user_id' => $userId,
                'content_id' => $data['content_id'],
                'description' => $data['description'],
                'user_type' => $data['social_media_type']
            ];
            $createdId = MusicComments::create($commentData)->id;
            $dataComment = MusicComments::getComment($createdId);
            $result = [
                'success' => TRUE,
                'message' => ['Music Tab  Comment successfully added.'],
                'data' => $dataComment
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
