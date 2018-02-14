<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\News;
use App\Models\TpAppsTabEntity;
use App\Helpers\Helper;
use Abraham\TwitterOAuth\TwitterOAuth;

class NewsController extends Controller {
    
    //twitter credentials
    const Consumer_Key = 'JMki1sEYVOLAYarJwVg5Bnqlc';
    const Consumer_Secret = 'dI93qd4pTJvonNnkixQipmTFNbmVDRLE9PSmU9mUi8W3VDgYOR';
    const Access_Token = '844834061457666048-nE5nnfJBiPlND0cG0ST2Akeyy2Ef6MT';
    const Access_Token_Secret = 'OFAPiK7K25lFMjbf0iuTsYRJYXSR6KrLdPPW5gBs7m8rd';

    private static function _getCommonValidationRules(): array {
        return [
            'google_keywords' => 'required',
            'twitter_keywords' => 'required',
        ];
    }

    private static function _getValidationMessages() {
        return [];
    }

    /**
     * Load the Keywords
     */
    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $data = [
                'newsData' => News::get_Newstab_data($request->tabId),
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
            ];

            $result = [
                'success' => TRUE,
                'data' => $data,
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
     * Create and Save keywords for news Tab
     */
    public function save(Request $request) {
        try {
            $data = $request->all();
            $google_keywords = $request->google_keywords;
            $twitter_keywords = $request->twitter_keywords;
            $facebook_keywords = $request->facebook_keywords;

            $rules = $request->id ? ['id' => 'required|integer'] : ['tab_id' => 'required|integer'];

            $validator = Validator::make($data, array_merge(self::_getCommonValidationRules(), $rules), self::_getValidationMessages());

            if (!isset($google_keywords)) {
                throw new Exception('"Google News Keywords" field is empty.');
            }
            if (!isset($twitter_keywords)) {
                throw new Exception('"Twitter Keywords" field is empty.');
            }
            if (isset($data['tab_id']) && $data['tab_id'] == 0){
                throw new Exception('"Tab Id is required.');
            }
            if ($validator->fails()) {
                throw new Exception($validator->errors());
            }
            
            $show_news_home = $request->show_news_home;
            $tab_id = $tab_id_form = $request->tab_id;
            $details = TpAppsTabEntity::getAppDetails($tab_id);
            $app_id = $details->app_id;
            $tab_func_id = 32;
            $details = TpAppsTabEntity::getAppTabs($app_id,$tab_func_id);
            foreach($details as $value){
                $tabs[] = $value['id'];
            }
            
            //other tabs of app to update for show_news_home
            $other_tabs = array_diff($tabs,array($tab_id));
            if($show_news_home == 1){
                $data = array('show_news_home' =>1);
                News :: where('tab_id',$tab_id)->update($data);
                foreach($other_tabs as $value){
                    $dataOther = array('show_news_home' =>0);
                    News :: where('tab_id',$value)->update($dataOther);   
                }
                
            }else{
                //check if other tabs has all 0's not 1. Don't allow user to make this 0. It will be 1 always.
//                if(isset($other_tabs) && !empty($other_tabs)){
//                  $home_status = false;
//                  foreach($other_tabs as $tab_id){
//                   $status = News :: getShowNewsHomeStatus($tab_id);   
//                   $show_home = $status['show_news_home'];
//                   if($show_home == 1){
//                    $home_status = true;   
//                   }
//                  }  
//                  if($home_status == true){
//                    $data = array('show_news_home' =>0);
//                    News :: where('tab_id',$tab_id_form)->update($data);   
//                    }else{
//                    throw new Exception('cant update or create as other tabs of app have disabled news on home screen');   
//                    }
//                }else{
                    $data = array('show_news_home' =>0);
                    News :: where('tab_id',$tab_id_form)->update($data);    
//                }
            }
            // Save keywords
            if (!empty($google_keywords)) {
                $string = explode(' ', $google_keywords);
                $google_keywords = implode(',', $string);
                $data['google_keywords'] = $google_keywords;
            } else {
                unset($data['google_keywords']);
            }

            if (!empty($twitter_keywords)) {
                $string = explode(' ', $twitter_keywords);
                $twitter_keywords = implode(',', $string);
                $data['twitter_keywords'] = $twitter_keywords;
            } else {
                unset($data['twitter_keywords']);
            }

            if (!empty($facebook_keywords)) {
                $string = explode(' ', $facebook_keywords);
                $facebook_keywords = implode(',', $string);
                $data['facebook_keywords'] = $facebook_keywords;
            } else {
                $data['facebook_keywords'] = '';
            }

            //check if data exist for tab_id
            //if exists then update the corresponding details otherwise create 
            $tab_id = $request->tab_id;
            $tab_details = News :: get_Newstab_data($tab_id);
            $data['tab_id'] = $tab_id;
            if (!empty($tab_details)) {
                //update tab details   
                $id = $tab_details['id'];
                News :: where('id', $id)->update($data);
            } else {
                News::create($data);
            }

            $result = [
                'success' => TRUE,
                'data' => $data,
                'message' => 'Keywords added successfuly'
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage(),
            ];
        }
        return response()->json($result);
    }

    public function getNewsFeed(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('Tab IDs not found.');
            }
//            $tab_id = $request->tabId;
            
//            $details = TpAppsTabEntity::getAppDetails($request->tabId);
//            $app_id = $details->app_id;
//            $tab_func_id = 32;
//            $details = TpAppsTabEntity::getAppTabs($app_id,$tab_func_id);
//            foreach($details as $value){
//                $tabs[] = $value['id'];
//            }
            $tabs =$request->id;

            if(isset($tabs)){
                foreach($tabs as $tab_id){
                    $keyword_details = News :: get_Newstab_data($tab_id);
                    $google_data = $keyword_details['google_keywords'];
                    $twitter_data = $keyword_details['twitter_keywords'];
                    $facebook_data = $keyword_details['facebook_keywords'];
                    $show_home = $keyword_details['show_news_home'];

            $google_news_feeds = array();
            if (isset($google_data)) {
                $google_keywords = explode(',', $google_data);
                if (isset($google_keywords)) {
                    $google_string = implode(' ', $google_keywords);
                    $google_string = urlencode($google_string);
                } else {
                    $google_string = $google_data;
                }
                $google_feeds = self :: google_feeds($google_data);
                if (isset($google_feeds)) {
                    $channel = $google_feeds->channel;
                    $channel = (array) $channel;
                    $item = $channel['item'];
                    foreach ($item as $key => $value) {
                        $title = (array) $value->title;
                        $pubDate = (array) $value->pubDate;
                        $link = substr($value->link, strrpos($value->link, 'url=') + 4);
                        $google_news_feeds[$key]['title'] = $title[0];
                        $google_news_feeds[$key]['link'] = $link;
                        $google_news_feeds[$key]['pubDate'] = $pubDate[0];
                        $descHtml = urldecode($value->description[0]);
                        libxml_use_internal_errors(true);
                        $doc = new \DOMDocument();
                        @$doc->loadHTML($descHtml);
                        $xpath = new \DOMXPath($doc);
                        $src = $xpath->evaluate("string(//img/@src)");
                        if (isset($src) && $src != "") {
                            $google_news_feeds[$key]['image'] = 'https:' . $src;
                        }
                    }
                    
                    $count = count($google_news_feeds);
                    if ($google_news_feeds > 20) {
                        $google_news_feeds = array_slice($google_news_feeds, 0, 20);
                    }
                }
            }


            $twitter_news_feeds = array();
            if (isset($twitter_data)) {
                $twitter_keywords = explode(',', $twitter_data);
                if (isset($twitter_keywords)) {
                    $twitter_string = implode(' ', $twitter_keywords);
                    $twitter_string = urlencode($twitter_string);
                } else {
                    $twitter_string = $twitter_data;
                }
                $twitter_feeds = self :: twitter_feeds($twitter_string);
                $statuses = $twitter_feeds->statuses;
                if (isset($statuses)) {
                    foreach ($statuses as $key => $value) {
                        $feed_text = $value->text;
                        $profile_image = $value->user->profile_image_url_https;
                        if($value->entities->urls){
                        $link = $value->entities->urls[0]->url;
                        }
                        $twitter_news_feeds[$key]['title'] = $value->text;
                        $twitter_news_feeds[$key]['image'] = $value->user->profile_image_url_https;
                        $twitter_news_feeds[$key]['pubDate'] = $value->created_at;
                        $twitter_news_feeds[$key]['link'] = $link;
                    }
                }
            }
            
            $feeds[$tab_id]['google_feeds'] = $google_news_feeds;
            $feeds[$tab_id]['twitter_feeds'] = $twitter_news_feeds;
            $feeds[$tab_id]['show_news_home'] = $show_home;
            
            }
            }

            $data = ['google_feeds' => $google_news_feeds, 'twitter_feeds' => $twitter_news_feeds];
            $result = [
                'success' => TRUE,
                'data' => $feeds,
            ];
        } catch (Exception $ex) {
            $result = [
                'success' => FALSE,
                'message' => $ex->getMessage()
            ];
        }
        return response()->json($result);
    }

    public function google_feeds($keywords) {
        $url = 'https://news.google.com/news/feeds?output=rss&q=' . $keywords. '&num=20';
        $result = self:: curl_call($url);
        return $result;
    }

    public function twitter_feeds($keywords) {       
        $consumer_key = self::Consumer_Key;
        $consumer_secret = self::Consumer_Secret;
        $access_token = self::Access_Token;
        $access_token_secret = self::Access_Token_Secret;

        $connection = new TwitterOAuth($consumer_key, $consumer_secret, $access_token, $access_token_secret);
//        $content = $connection->get("account/verify_credentials");
//        $timelines = $connection->get('statuses/user_timeline', array('screen_name' => 'unicode_test', 'count' => 20, 'include_rts' => 1));

        $posts = $connection->get("search/tweets", ["q" => $keywords]);

//      $xml = self:: curl_call($url); 
        return $posts;
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
//        return $data;
    }

}
