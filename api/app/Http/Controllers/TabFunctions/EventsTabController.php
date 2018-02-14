<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\EventsTab;
use App\Models\TabFunctions\EventsTabComments;
use App\Models\TabFunctions\EventsTabGoings;
use App\Models\TabFunctions\EventsTabImages;
use App\Models\TabFunctions\RecurringEvents;
use App\Models\TabFunctions\EventsTimeZone;
use App\Models\TabFunctions\ContactUs;
use App\Models\TabFunctions\SocialUser;
use App\Models\TpAppsTabEntity;
use App\Models\TpAppsEntity;
use App\Helpers\Helper;

class EventsTabController extends Controller {

    const PHONE_HEADER_IMAGE_UPLOAD_PATH = 'app/public/functions/eventsTab/phone';
    const TAB_HEADER_IMAGE_UPLOAD_PATH = 'app/public/functions/eventsTab/tablet';
    const IMAGE_UPLOAD_PATH = 'app/public/functions/eventsTab/events/images';

    private static function _getCommonValidationRulesEvents(bool $isRecurringEvent = FALSE): array {
        $rules = ['name' => 'required|max:256'];
        if (!$isRecurringEvent) {
            $rules['event_start_date'] = 'required|max:256';
        }
        return $rules;
    }

    private static function _getValidationMessages() {
        return [];
    }

    private static function _getCommonValidationImageRules(): array {
        return [
            'image' => 'required|mimes:jpeg,jpg,png|max:10000',
        ];
    }

    private static function _getValidationImageMessages() {
        return [
            'image.required' => 'The image is required.',
        ];
    }

    //comment validation for Events Tab
    private static function _getCommonValidationRules(): array {
        return [
            'name' => 'required|max:256',
            'description' => 'required|max:256'
        ];
    }

    private static function _getValidationMessagesCommentsGoings() {
        return [
        ];
    }

    private static function _getCommonValidationRulesTimezone(): array {
        return [
            'offset' => 'required',
            'name' => 'required|max:256',
        ];
    }

    private static function _getValidationMessagesTimezone() {
        return [];
    }

    private static function _getValidationRulesRecurringEvents(): array {
        return [
            'start_time' => 'required',
            'duration' => 'required',
            'name' => 'required|max:256',
            'end_date' => 'required',
        ];
    }

    private static function _getValidationReccuringEventsMessages() {
        return [];
    }

    /**
     * Load the around us tabData, eventsList
     */
    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $sortBy = (isset($request->sortBy) ? $request->sortBy : FALSE);
            $events_list = EventsTab::getEventsTabEventList($request->tabId, $sortBy);
            $timeSettings = Helper::getAppTimeZone($request->tabId);
            $data = [
                'eventsList' => $events_list,
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
                'timezoneList' => EventsTimeZone::timezoneList($request->tabId),
                'contactList' => ContactUs::getLocationListByAppId(TpAppsTabEntity::find($request->tabId)->app_id),
                'recurringEventList' => RecurringEvents::recurringEventsList($request->tabId),
                'timeSettings' => $timeSettings
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

    //ionic init

    public function appInit(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $upcomingEvent = EventsTab::getUpcomingEventList($request->tabId);
            $pastEvent = EventsTab::getPastEventList($request->tabId);
            //for upcomint event
            $eventStartDate = [];
            foreach ($upcomingEvent as $eventData) {
                $eventDateTime = explode(" ", $eventData->event_start_date);
                $eventDate = explode("-", $eventDateTime[0]);
                $eventYearMonth = $eventDate[0] . ' ' . $eventDate[1];
                $eventStartDate[$eventYearMonth][] = $eventData;
            }
            //for past event
            $pastEventStartDate = [];
            foreach ($pastEvent as $pastEventData) {
                $pastEventDateTime = explode(" ", $pastEventData->event_start_date);
                $pastEventDate = explode("-", $pastEventDateTime[0]);
                $pastEventYearMonth = $pastEventDate[0] . ' ' . $pastEventDate[1];
                $pastEventStartDate[$pastEventYearMonth][] = $pastEventData;
            }

            $data = [
                'upcomingEvent' => $eventStartDate,
                'pastEvent' => $pastEventStartDate
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

    public function saveSettings(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            if (!isset($request->populate_events)) {
                throw new Exception('No settings data found.');
            }
            $settings = [
                'populate_events' => $request->populate_events,
                'sort_by' => $request->sort_by, //1=>sort_by_time, 2=>sort_by_manual orders
                'weeks' => $request->weeks,
            ];
            TpAppsTabEntity::where('id', $request->tabId)->update(['settings' => json_encode($settings)]);
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

    public function sortEvents(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            EventsTab::updateMultiple($sortData);
            $result = [
                'success' => TRUE,
                'data' => 'Events order saved.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function deleteEvents(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            EventsTab::deleteEvents($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Events successfully deleted.'],
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
        $fileName = Helper::getMilliTimestamp() . '_eventsTab_image.' . $extension;
        Helper::makeDirectory($uploadPath);
        if ((isset($width) && empty($width)) && (isset($height) && empty($height))) {
            Image::make($image->getRealPath())
                    ->save($uploadPath . '/' . $fileName);
        } else {
            Image::make($image->getRealPath())
                    ->resize($width, $height)
                    ->save($uploadPath . '/' . $fileName);
        }
        return $fileName;
    }

    //phone header image
    public static function getPhoneHeaderImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::PHONE_HEADER_IMAGE_UPLOAD_PATH);
    }

    //upload url is used by model function while returning image from database
    public static function getPhoneHeaderImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::PHONE_HEADER_IMAGE_UPLOAD_PATH);
    }

    //tablet header image
    public static function getTabletHeaderImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::TAB_HEADER_IMAGE_UPLOAD_PATH);
    }

    //upload url is used by model function while returning image from database
    public static function getTabletHeaderImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::TAB_HEADER_IMAGE_UPLOAD_PATH);
    }

    public static function getImageUploadPath(): string {
        return Helper::getUploadDirectoryPath(self::IMAGE_UPLOAD_PATH);
    }

    public static function getImageUploadURL(): string {
        return Helper::getUploadDirectoryURL(self::IMAGE_UPLOAD_PATH);
    }

    /**
     * Create and Save content for event tab
     */
    public function saveSingleEvents(Request $request) {
        try {
            $data = $request->all();

            $phone_header_image = $request->file('phone_header_image');
            $tablet_header_image = $request->file('tablet_header_image');
            $data['phone_header_image'] = $phone_header_image;
            $data['tablet_header_image'] = $tablet_header_image;

            if ($request->id) {
                if ($request->phone_header_image == null && $request->is_header_required == 1) {
                    if ($request->phone_header_image_url == null) {
                        $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRulesEvents(), ['phone_header_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE,'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'id' => 'required|integer'])), self::_getValidationMessages());
                    } else {
                        $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRulesEvents(), ['id' => 'required|integer','tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE])), self::_getValidationMessages());
                    }
                } else {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRulesEvents(), ['id' => 'required|integer','phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE,'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE])), self::_getValidationMessages());
                }
            } else {
                if ($data['is_header_required'] == 1) {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRulesEvents(), ['phone_header_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE,'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tab_id' => 'required|integer'])), self::_getValidationMessages());
                } else {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRulesEvents(), ['phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE,'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tab_id' => 'required|integer'])), self::_getValidationMessages());
                }
            }

            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            // Save phone header image
            if (!empty($phone_header_image)) {
                $data['phone_header_image'] = self::_uploadImage($phone_header_image, self::getPhoneHeaderImageUploadPath(), 640, 264);
            } else {
                if ($data['phone_header_image'] == null && $data['is_header_required'] == 1) {
                    if ($request->phone_header_image_url == null) {
                        throw new Exception('Phone header image field is required.');
                    }
                }
                unset($data['phone_header_image']);
            }
            unset($data['phone_header_image_url']);
            // Save tablet header image
            if (!empty($tablet_header_image)) {
                $data['tablet_header_image'] = self::_uploadImage($tablet_header_image, self::getTabletHeaderImageUploadPath(), 1536, 1920);
            } else {
                unset($data['tablet_header_image']);
            }

            $event_start_date = $data['event_start_date'];
            $event_end_date = $data['event_end_date'];

//            $start_hour = $data['event_start_time_hour'];
//            $start_min  = $data['event_start_time_min'];
//            if(!isset($start_hour) || $start_hour ==""){
//             $start_hour = "00";
//            }
//            if(!isset($start_min) || $start_min ==""){
//             $start_min = "00";
//            }
//            $end_hour = $data['event_end_time_hour'];
//            $end_min  = $data['event_end_time_min'];
//            if(!isset($end_hour) || $end_hour ==""){
//             $end_hour = "00";
//            }
//            if(!isset($end_min) || $end_min ==""){
//             $end_min = "00";
//            }
            // $event_start_date  = $event_start_date ." : 0";
            // $event_end_date    = $event_end_date ." : 0";

            if (isset($event_start_date) && isset($event_end_date)) {
                $start_date_time = strtotime($event_start_date);
                $end_date_time = strtotime($event_end_date);
                if ($start_date_time > $end_date_time) {
                    throw new Exception('Event End date must be higher than start date.');
                }
            }

            unset($data['event_start_time_hour']);
            unset($data['event_start_time_min']);
            unset($data['event_end_time_hour']);
            unset($data['event_end_time_min']);
            unset($data['event_start_time']);
            unset($data['event_end_time']);

            if ($request->id) {
                EventsTab::where('id', $request->id)->update($data);
                $result = [
                    'success' => TRUE,
                    'message' => [' Events Tab  information successfully edited.'],
                ];
            } else {
                if (empty($data['phone_header_image']) && $data['is_header_required'] == 1) {
                    throw new Exception('Phone Header Image cannot be empty.');
                }

                EventsTab::create($data);
                $result = [
                    'success' => TRUE,
                    'message' => [' Events Tab  information successfully added.'],
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
     * get the event information by id
     */
    public function getEventData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = EventsTab::getEventInfo($request->id);
            $data = [
                'eventData' => EventsTab::getEventInfo($request->id),
                'timezone' => EventsTimeZone::timezoneList($request->id),
            ];
            $startDate = $data['eventData']->event_start_date;
            $endDate = $data['eventData']->event_end_date;
            $data['eventData']['event_start_date'] = date('Y-m-d', strtotime($startDate));
            $data['eventData']['event_start_time_hour'] = date('H', strtotime($startDate));
            $data['eventData']['event_start_time_min'] = date('i', strtotime($startDate));
            $data['eventData']['event_end_date'] = date('Y-m-d', strtotime($endDate));
            $data['eventData']['event_end_time_hour'] = date('H', strtotime($endDate));
            $data['eventData']['event_end_time_min'] = date('i', strtotime($endDate));
            $data['eventData']['event_start_time'] = $startDate;
            $data['eventData']['event_end_time'] = $endDate;
            if (!empty($data['eventData']->id)) {
                $data['comments'] = EventsTabComments::getEventComments($request->id);
            }
            if (!empty($data['eventData']->id)) {
                $data['goings'] = EventsTabGoings::getEventGoings($request->id);
            }
            if (!empty($data['eventData']->id)) {
                $data['images'] = EventsTabImages::getImages($request->id);
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

    public function deleteImage(Request $request) {
        try {
            if ($request->imageType !== 'phone_header' && $request->imageType !== 'tablet_header') {
                throw new Exception('Invalid URL');
            }
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            EventsTab::where('id', $request->id)->update([$request->imageType . '_image' => NULL]);
            $result = [
                'success' => TRUE,
                'message' => ['Image successfully deleted.'],
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
     * Comments -------- Event Tab

     * Add/Edit Comments
     */
    public function saveComment(Request $request) {
        try {
            $data = $request->all();
            $rules = ['event_id' => 'required|integer', 'comment' => 'required'];
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
                'event_id' => $data['event_id'],
                'comment' => $data['comment'],
                'user_type' => $data['social_media_type']
            ];
            $createdId = EventsTabComments::create($commentData)->id;
            $dataComment = EventsTabComments::getEventComment($createdId);
            $result = [
                'success' => TRUE,
                'message' => ['Event  Comment successfully added.'],
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

    /**
     * Load the comments for events tab id
     */
    public function commentList(Request $request) {
        try {
            if (empty($request->eventId)) {
                throw new Exception('Event id not found.');
            }
            $comment_list = EventsTabComments::getEventComments($request->event_id);
            if ($comment_list) {
                $comment_list_count = count($comment_list);
            } else {
                $comment_list_count = 0;
            }
            $data = [
                'comment_list' => $comment_list,
                'comment_count' => $comment_list_count,
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
     * delete the comment
     */
    public function deleteComment(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            EventsTabComments::deleteComment($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Comment information for Event Tab Item successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function saveTimezone(Request $request) {
        try {
            $data = $request->all();

            $validator = Validator::make($data, array_merge(self::_getCommonValidationRulesTimezone()), self::_getValidationMessagesTimezone());

            // else{
            // $validator = Validator::make($data, array_merge(self::_getCommonValidationRulesAroundUsItem(), ['around_us_id' => 'required|integer']), self::_getValidationMessagesAroundUsItem());
            // }

            if ($validator->fails()) {
                throw new Exception(json_encode($validator->errors()->unique()));
            }

            if ($request->id) {
                EventsTimeZone::where('id', $request->id)->update($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['EventsTimeZone Us item successfully edited.'],
                ];
            } else {
                EventsTimeZone::create($data);
                $result = [
                    'success' => TRUE,
                    'message' => ['EventsTimeZone Us item successfully added.'],
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
     * get the event information by id
     */
    public function getContactSingleData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = ContactUs::getContactUsLocationEventsInfo($request->id);
            $data = [
                'contactList' => ContactUs::getContactUsLocationEventsInfo($request->id)
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
     * Load the around us tabData, eventsList
     */
    public function getEventList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $sortBy = (isset($request->sortBy) ? $request->sortBy : FALSE);
            $events_list = EventsTab::getEventsTabEventList($request->tabId, $sortBy);

            $data = [
                'eventsList' => $events_list,
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
     * Goings -------- Event Tab

     * Add/Edit Goings
     */
    public function saveGoings(Request $request) {
        try {
            $data = $request->all();
            $rules = ['event_id' => 'required|integer'];
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
            $goingData = [
                'user_id' => $userId,
                'event_id' => $data['event_id'],
                'user_type' => $data['social_media_type']
            ];
            $createdId = EventsTabGoings::create($goingData)->id;
            $dataGoing = EventsTabGoings::getEventGoing($createdId);
            $result = [
                'success' => TRUE,
                'message' => ['Event  Going successfully added.'],
                'data' => $dataGoing
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
     * Load the going for events tab id
     */
    public function goingsList(Request $request) {
        try {
            if (empty($request->eventId)) {
                throw new Exception('Event id not found.');
            }
            $going_list = EventsTabGoings::getEventGoings($request->event_id);
            if ($going_list) {
                $going_list_count = count($going_list);
            } else {
                $going_list_count = 0;
            }
            $data = [
                'goings' => $going_list,
                'going_count' => $going_list_count,
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
     * delete the going
     */
    public function deleteGoing(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            EventsTabGoings::deleteGoing($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Going information for Event Tab Item successfully deleted.'],
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
     * Add/Edit Image  for event id
     */
    public function saveImages(Request $request) {
        try {
            if (empty($request->event_id)) {
                throw new Exception('Event id not found.');
            }
            $data = $request->all();
            $images = array();
            if (!empty($request->image)) {
                $images = $request->image;
            } else {
                throw new Exception('Image is required.');
            }
            unset($data['image']);
            $imageRules = array(
                'image' => 'required|mimes:jpeg,jpg,png|max:2048'
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

            if (!empty($images)) {
                foreach ($images as $image) {
                    $image = self::_uploadImage($image, self::getImageUploadPath(), '', '');
                    $imageArray['event_id'] = $request->event_id;
                    $imageArray['image'] = $image;
                    $imageArray['caption'] = $request->caption;

                    EventsTabImages::create($imageArray);
                }
            }
            $result = [
                'success' => TRUE,
                'message' => ['Image successfully added.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    //delete image 
    public function deleteEventImage(Request $request) {
        try {

            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            EventsTabImages::where('id', $request->id)->delete();
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

    public function getImageData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = EventsTab::getEventInfo($request->id);
            $data = [
                'images' => EventsTabImages::getImages($request->id)
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
            EventsTabImages::updateMultiple($sortData);
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

    /**
     * Create and Save recurring event for event tab
     */
    public function saveRecurringEvents(Request $request) {
        try {
            $data = $request->all();
            $rules = $request->id ? ['id' => 'required|integer'] : ['tab_id' => 'required|integer'];

            $phone_header_image = $request->file('phone_header_image');
            $tablet_header_image = $request->file('tablet_header_image');
            $data['phone_header_image'] = $phone_header_image;
            $data['tablet_header_image'] = $tablet_header_image;

              if ($request->id) {
                if ($request->phone_header_image == null && $request->is_header_required == 1) {
                    if ($request->phone_header_image_url == null) {
                        $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRulesEvents(TRUE), ['phone_header_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE,'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'id' => 'required|integer'])), self::_getValidationMessages());
                    } else {
                        $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRulesEvents(TRUE), ['id' => 'required|integer','tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE])), self::_getValidationMessages());
                    }
                } else {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRulesEvents(TRUE), ['id' => 'required|integer','phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE,'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE])), self::_getValidationMessages());
                }
            } else {
                if ($data['is_header_required'] == 1) {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRulesEvents(TRUE), ['phone_header_image' => 'required|mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE,'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tab_id' => 'required|integer'])), self::_getValidationMessages());
                } else {
                    $validator = Validator::make($data, array_reverse(array_merge(self::_getCommonValidationRulesEvents(TRUE), ['phone_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE,'tablet_header_image' => 'mimes:jpeg,jpg,png|max:' . MAX_FILE_UPLOAD_SIZE, 'tab_id' => 'required|integer'])), self::_getValidationMessages());
                }
            }


            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            // Save phone header image
            if (!empty($phone_header_image)) {
                $data['phone_header_image'] = self::_uploadImage($phone_header_image, self::getPhoneHeaderImageUploadPath(), 640, 264);
            } else {
                if ($data['phone_header_image'] == null && $data['is_header_required'] == 1) {
                    if ($request->phone_header_image_url == null) {
                        throw new Exception('Phone header image field is required.');
                    }
                }
                unset($data['phone_header_image']);
            }
            unset($data['phone_header_image_url']);
            // Save tablet header image
            if (!empty($tablet_header_image)) {
                $data['tablet_header_image'] = self::_uploadImage($tablet_header_image, self::getTabletHeaderImageUploadPath(), 1536, 1920);
            } else {
                unset($data['tablet_header_image']);
            }

            //for monthly there is repeat date and for weekly there is day_of_week            
            $repeat_event = $request->repeat_event; //1 for weekly and 2 for monthly
            $endDate = $data['end_date'];

            $tab_id = $request->tab_id;
            $settingsData = TpAppsTabEntity::getSettings($request->tab_id);

            if (isset($settingsData)) {
                $settings = $settingsData->settings;
                $settingsDecoded = json_decode($settings);
                $weeks = $settingsDecoded->weeks;
                if (isset($weeks)) {
                    $week_limit_number = $weeks;
                } else {
                    $week_limit_number = "";
                }
            } else {
                $week_limit_number = "";
            }

            $repeat_date = $request->repeat_date;
            if (isset($repeat_date) && isset($endDate)) {
                $start_date_time = strtotime($repeat_date);
                $end_date_time = strtotime($endDate);
                if ($start_date_time > $end_date_time) {
                    throw new Exception('End date must be higher than start date.');
                }
            }

            $duration = $data['duration'];
            list($durationHour, $durationMin) = explode(':', $duration);
            if ($durationHour == "" || $durationHour == "00" || $durationHour == NULL) {
                throw new Exception('Please input correct duration.');
            }

            list($startHour, $startMinute) = explode(':', $data['start_time']);
            if (!$startHour && $startHour !== 0 && $startHour !== "0") {
                throw new Exception('"Event Time" field is empty.');
            }


            if (isset($data['timezone_id']) && $data['timezone_id'] != "") {
                $timeZoneId = $data['timezone_id'];
                // get timeZone
                $timeZone = EventsTimeZone::timezone($timeZoneId);
                $timeZone = $timeZone->time_zone;
                date_default_timezone_set($timeZone);
            } else {
                $timeZone = "";
            }

            //edit case :: get single events from database for the recurring event
            if ($request->id) {
                $singleEvents = EventsTab :: getsingleRecurringEventList($tab_id, $request->id);
                $eventsDb = [];
                foreach ($singleEvents as $eventData) {
                    $eventDateTime = explode(" ", $eventData->event_start_date);
                    $eventsDb[] = $eventDateTime[0];
                }
            }

            //////////////////////////////////////////////////////////////////
            if ($repeat_event == 1) { //Weekly    
                //case of edit --- getting new week day to be inserted for single events
                $dayWeek = $dayWeek1 = $data['day_of_week'];
                if ($request->id) {
                    $recurringEventData = RecurringEvents::getRecurringEventInfo($request->id);
                    $day_of_week = $recurringEventData->day_of_week;

                    if (strpos($day_of_week, ',') === true) {
                        $dayWeekDb = explode(',', $day_of_week);
                    } else {
                        $dayWeekDb[] = $day_of_week;
                    }
                    //form week values
                    if (strpos($dayWeek1, ',') === true) {
                        $dayWeekArr = explode(',', $dayWeek1);
                    } else {
                        $dayWeekArr[] = $dayWeek1;
                    }
                    $dayWeek = array_diff($dayWeekArr, $dayWeekDb);
                    if (isset($dayWeek) && !empty($dayWeek)) {
                        $data['day_of_week'] = implode($dayWeek, ',');
                        $dayWeekString = $dayWeek[0];
                        if (strchr($dayWeekString, ',') != FALSE) {
                            $dayWeek = explode(',', $dayWeekString);
                        }
                    } else {
                        $data['day_of_week'] = implode($dayWeekArr, ',');
                    }
                    $dayWeek = $dayWeekArr;
                } else {
                    if (strchr($dayWeek1, ',') != FALSE) {
                        $dayWeek = explode(',', $dayWeek1);
                    } else {
                        $dayWeek = array();
                        $dayWeek[] = $dayWeek1;
                    }
                    $week_limit_number = $week_limit_number + 1; // for add case of advance it is week_num+1
                }
                if (isset($dayWeek) && is_array($dayWeek) && !empty($dayWeek)) {
                    foreach ($dayWeek as $value) {
                        $get_days[] = self :: get_week_days($value, $endDate, $week_limit_number);
                    }
                    $final_array = Array();
                    if (isset($get_days) && is_array($get_days) && !empty($get_days)) {
                        foreach ($get_days as $key => $innerArr1) {
                            foreach ($innerArr1 as $val) {
                                array_push($final_array, $val);
                            }
                        }
                    }
                    $data['day_of_week'] = implode($dayWeek, ',');
                }

                if (isset($eventsDb) && !empty($eventsDb) && isset($final_array) && !empty($final_array)) {
                    $final_array = array_diff($final_array, $eventsDb);
                }
            } else { //for monthly
                $startDate = $data['repeat_date'];
                //case of edit --- getting new days to be inserted for single events
                if ($request->id) {
                    $recurringEventData = RecurringEvents::getRecurringEventInfo($request->id);
                    $startDateDb = date("m/d/Y", strtotime($recurringEventData->repeat_date));
                    $endDateDb = date("m/d/Y", strtotime($recurringEventData->end_date));
                    //Now calculate single day events final array and compute difference from final array of form
                    $final_arrayDb = self :: get_recurring_events_monthly($startDateDb, $endDateDb, $week_limit_number);
                    $final_arrayForm = self :: get_recurring_events_monthly($startDate, $endDate, $week_limit_number);
//                    $final_array = array_diff($final_arrayForm, $final_arrayDb);

                    $final_array = $final_arrayForm;
                    if (isset($eventsDb) && !empty($eventsDb) && isset($final_array) && !empty($final_array)) {
                        $final_array = array_diff($final_array, $eventsDb);
                    }
                } else {
                    $final_array = self :: get_recurring_events_monthly($startDate, $endDate, $week_limit_number);
                }
                $data['repeat_date'] = date("Y-m-d", strtotime($data['repeat_date']));
            }



            $cur_date = date("m/d/Y");
            if (isset($final_array) && !empty($final_array)) {
                $final_array = array_values($final_array); //reindex array from 0
                if ($cur_date == $final_array[0]) {
                    $hourCurrent = date('H'); //11
                    $minCurrent = date('i'); //50
                    if ($startHour >= $hourCurrent && $startMinute > $minCurrent) {
                        //today event will occur
                    } else {
                        //there will be no today event(subtract -1 from count)
                        unset($final_array[0]);
                    }
                }
                $event_count = count($final_array);
            }
            unset($data['start_time_hour']);
            unset($data['start_time_min']);
            unset($data['duration_hour']);
            unset($data['duration_min']);


            $data['end_date'] = date("Y-m-d", strtotime($data['end_date']));


            //for the edit if one extra day is added for ex Wednesday then single events for wednesday occurence will be added.


            if ($data['repeat_event'] == 1) {
                unset($data['repeat_date']);
                if (empty($request->day_of_week)) {
                    throw new Exception('Please select the week days.');
                }
            } else {
                unset($data['day_of_week']);
                if (empty($request->repeat_date)) {
                    throw new Exception('Please input the date number.');
                }
            }

            if ($request->id) {
                RecurringEvents::where('id', $request->id)->update($data);
                //Also Add single events for the Reccurring events
                if (isset($final_array) && !empty($final_array)) {
                    foreach ($final_array as $value) {
                        $single_event['tab_id'] = $data['tab_id'];
                        $single_event['recurring_event_id'] = $request->id;
                        $single_event['event_start_date'] = $value;
                        $single_event['timezone_id'] = $timeZone;
                        $single_event['name'] = $data['name'];
                        $single_event['description'] = " ";
                        EventsTab::create($single_event);
                    }
                }
                $result = [
                    'success' => TRUE,
                    'message' => ['Recurring Events  information successfully edited.'],
                ];
            } else {
                if (empty($data['phone_header_image']) && $data['is_header_required'] == 1) {
                    throw new Exception('Phone Header Image cannot be empty.');
                }
                $createdId = RecurringEvents::create($data)->id;
                //Also Add single events for the Reccurring events
                if (isset($final_array) && !empty($final_array)) {
                    foreach ($final_array as $value) {
                        $single_event['tab_id'] = $data['tab_id'];
                        $single_event['recurring_event_id'] = $createdId;
                        $single_event['event_start_date'] = $value;
                        $single_event['timezone_id'] = $timeZone;
                        $single_event['name'] = $data['name'];
                        $single_event['description'] = " ";
                        EventsTab::create($single_event);
                    }
                }

                $result = [
                    'success' => TRUE,
                    'message' => [' Recurring Events  information successfully added.'],
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

    public function get_week_days($dayWeek, $endDate, $num_weeks) {
        try {
            $startDate = date('n/j/Y'); // Today
            $start_date_1 = $startDate;
            $startDate = strtotime($dayWeek, strtotime($startDate));
            $endDate = strtotime($endDate);

            if (isset($num_weeks) && $num_weeks != "") {
                $date = strtotime($start_date_1);
                $date_aftr_N_Weeks = strtotime("+" . $num_weeks . " weeks", $date);
                if ($endDate > $date_aftr_N_Weeks) {
                    $endDate = $date_aftr_N_Weeks;
                }
            }

            $repetion = array();
            while ($startDate < $endDate) {
                $repetion[] = date('Y-m-d', $startDate);
                $startDate = strtotime("next $dayWeek", $startDate);
            }
        } catch (Exception $ex) {
            
        }
        return $repetion;
    }

    public function get_recurring_events_monthly($startDate, $endDate, $num_weeks) {
        $start_date_1 = $startDate;
        $startDate = date("m/d/Y", strtotime("+1 month", strtotime($startDate)));
        $startDateTime = strtotime($startDate);
        $endDateTime = strtotime($endDate);

        if (isset($num_weeks) && $num_weeks != "") {
            $date = strtotime($start_date_1);
            $date_aftr_N_Weeks = strtotime("+" . $num_weeks . " weeks", $date);
            if ($endDateTime > $date_aftr_N_Weeks) {
                $endDateTime = $date_aftr_N_Weeks;
            }
        }

        $final_array = array();
        while ($startDateTime < $endDateTime) {
            $startDate1 = date("Y-m-d", $startDateTime);
            $final_array[] = $startDate1;
            $startDate = date("Y-m-d", strtotime("+1 month", $startDateTime));
            $startDateTime = strtotime($startDate);
        }
        return $final_array;
    }

    /**
     * sort the recurring event list
     */
    public function sortRecurringEvents(Request $request) {
        try {
            if (empty($request->ids)) {
                throw new Exception('IDs not found.');
            }
            $sortData = [];
            $i = 1;
            foreach ($request->ids as $id) {
                $sortData[$id] = ['sort_order' => $i++];
            }
            RecurringEvents::updateMultiple($sortData);
            $result = [
                'success' => TRUE,
                'data' => 'Recurring Events order saved.'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    /*
     * Delete recurring events
     */

    public function deleteRecurringEvents(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            RecurringEvents::deleteRecurringEvents($request->id);
            $result = [
                'success' => TRUE,
                'message' => ['Recurring Event successfully deleted.'],
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
     * get the event information by id
     */
    public function getRecurringEventData(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            $data = [
                'recurringEventData' => RecurringEvents::getRecurringEventInfo($request->id),
            ];
            $startTime = $data['recurringEventData']->start_time;
            $duration = $data['recurringEventData']->duration;
            $data['recurringEventData']['start_time_hour'] = date('H', strtotime($startTime));
            $data['recurringEventData']['start_time_min'] = date('i', strtotime($startTime));
            $data['recurringEventData']['duration_hour'] = date('H', strtotime($duration));
            $data['recurringEventData']['duration_min'] = date('i', strtotime($duration));

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

    public function getRecurringEventList(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $events_list = RecurringEvents::recurringEventsList($request->tabId);

            $data = [
                'recurringEventList' => $events_list,
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

    public function deleteRecurringImage(Request $request) {
        try {
            if ($request->imageType !== 'phone_header' && $request->imageType !== 'tablet_header') {
                throw new Exception('Invalid URL');
            }
            if (empty($request->id)) {
                throw new Exception('ID not found');
            }
            RecurringEvents::where('id', $request->id)->update([$request->imageType . '_image' => NULL]);
            $result = [
                'success' => TRUE,
                'message' => ['Recurring Event Image successfully deleted.'],
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    //Not in use right now
    //route to create in routes is ws/function/eventsTab/google/events

    public function googleEvents() {
//        require_once 'vendor/autoload.php';
        try {
            $google_client = new \Google_Client();
            $config = array(
                'app_name' => 'Web client Unicode',
                'client_id' => '132830528028-7cedub7vv139jb899s05qg2qmku2tf7c.apps.googleusercontent.com',
                'client_secret' => 're1s4Zdlt7uvdvuM28giuRIW',
                'api_key' => 'AIzaSyBm_9JcLTrJrc2qezvVcyO2COEL1r68esI'
            );

            $google_client->setApplicationName('Web client Unicode');
            $google_client->setClientId('132830528028-7cedub7vv139jb899s05qg2qmku2tf7c.apps.googleusercontent.com');
            $google_client->setClientSecret('re1s4Zdlt7uvdvuM28giuRIW');
            $google_client->setDeveloperKey('AIzaSyBm_9JcLTrJrc2qezvVcyO2COEL1r68esI');
            $google_client->setRedirectUri('http://localhost/tappit/api/ws/function/eventsTab/google/eventsCalendar');
            $google_client->setScopes(array('https://www.googleapis.com/auth/calendar.readonly'));
            $google_client->service = new \Google_Service_Calendar($google_client);
            $google_client->access_type = 'offline';
            // Request authorization from the user.
            $authUrl = $google_client->createAuthUrl();
            printf("Open the following link in your browser:\n%s\n", $authUrl);
            die();
            print 'Enter verification code: ';
            $authCode = trim(fgets(STDIN));

            // Exchange authorization code for an access token.
            $accessToken = $google_client->fetchAccessTokenWithAuthCode($authCode);
            echo $accessToken;
            die();
            $cal = new \Google_Service_Calendar($google_client);

            $calendarList = $cal->calendarList->listCalendarList();
            print_r($calendarList);
            die();
        } catch (Google_ServiceException $e) {
            echo "google service exception";
            print_r($e);
        } catch (Google_AuthException $e) {
            echo "google auth exception";
            print_r($e);
        }
    }

    //Not in use right now
    // route to create in routes is ws/function/eventsTab/google/eventsCalendar
    public function googleEventsCalendar() {
        error_reporting(E_ALL);
        ini_set('display_errors', 1);
        echo "00000011111111----";
        $data = $_GET;
        try {
            $google_client = new \Google_Client();
            $google_client->setApplicationName('Web client Unicode');
            $google_client->setClientId('132830528028-7cedub7vv139jb899s05qg2qmku2tf7c.apps.googleusercontent.com');
            $google_client->setClientSecret('re1s4Zdlt7uvdvuM28giuRIW');
            $google_client->setDeveloperKey('AIzaSyBm_9JcLTrJrc2qezvVcyO2COEL1r68esI');
            $google_client->setRedirectUri('http://localhost/tappit/api/ws/function/eventsTab/google/eventsCalendar');
            $google_client->setScopes(array('https://www.googleapis.com/auth/calendar.readonly'));
            $google_client->service = new \Google_Service_Calendar($google_client);
            $google_client->access_type = 'offline';
//        $authUrl = $google_client->createAuthUrl();
//        printf("Open the following link in your browser:\n%s\n", $authUrl);
//        print 'Enter verification code: ';
//        $authCode = trim(fgets(STDIN));
            // Exchange authorization code for an access token.
            $authCode = $data['code'];
            $accessToken = $google_client->fetchAccessTokenWithAuthCode($authCode);
            $google_client->setAccessToken($accessToken);
//        print_r($google_client);
            echo "tttttttttttttttttttttttttttttttttttttttttttt121212";
            if ($google_client->isAccessTokenExpired()) {
                $google_client->fetchAccessTokenWithRefreshToken($google_client->getRefreshToken());
            }

            $service = new \Google_Service_Calendar($google_client);
//        $events = $service->events->listEvents('primary');        
//        $events = (array) $service->events; //working   
            $service = (array) $service;
            print_r(array_keys($service));

            $service = new \Google_Service_Calendar($google_client);
            $calendarList = (array) $service->calendarList;
            print_r(array_keys($calendarList));

            $service = new \Google_Service_Calendar($google_client);
            $calendarList = $service->calendarList;
            $list = $calendarList->listCalendarList();
            print_r($list);
            $calendarListEntry = $service->calendarList->get('calendarId');

            echo $calendarListEntry->getSummary();
            echo "xxxxxxxxxxxxxxx";
            $events = (array) $service->calendarList->listCalendarList();

            $calendarList = $service->calendarList->listCalendarList();

            $calendarId = 'primary';
            $optParams = array(
                'maxResults' => 10,
                'orderBy' => 'startTime',
                'singleEvents' => TRUE,
                'timeMin' => date('c'),
            );
            $results = $service->events->listEvents($calendarId, $optParams);

            if (count($results->getItems()) == 0) {
                print "No upcoming events found.\n";
            } else {
                print "Upcoming events:\n";
                foreach ($results->getItems() as $event) {
                    $start = $event->start->dateTime;
                    if (empty($start)) {
                        $start = $event->start->date;
                    }
                    printf("%s (%s)\n", $event->getSummary(), $start);
                }
            }
        } catch (Exception $ex) {
            
        }
    }

}
