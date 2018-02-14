<?php

namespace App\Http\Controllers\TabFunctions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use Exception;
use App\Models\TabFunctions\Language;
use App\Models\TpAppsTabEntity;
use App\Models\ClientLanguage;
use App\Helpers\Helper;
use App\Models\TpAppsEntity;
use App\Models\TabFunctions\SocialUser;

class LanguageController extends Controller {

    /**
     * Load the list of Languages
     */
    public function init(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            $languageData = Language::getItemData($request->tabId);
            $languages = ClientLanguage::languageListForLanguageTab($languageData);
            $data = [
                'tabData' => TpAppsTabEntity::getAppTabInfo($request->tabId),
                'languageData' => $languageData,
                'languages' => $languages
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
     * save  Languages
     */
    public function save(Request $request) {
        try {
            if (empty($request->tabId)) {
                throw new Exception('Tab ID not found.');
            }
            if (empty($request->content)) {
                throw new Exception('Please select Languages.');
            }
            $language_data['tab_id'] = $request->tabId;
            $tabData = Language::where('tab_id', $request->tabId)->first();
            if (empty($tabData)) {
                $language_data['content'] = json_encode($request->content, JSON_NUMERIC_CHECK);
                Language::create($language_data);
            } else {
                $tabContent = json_decode($tabData->content, true);
                $tabContent = array_merge($tabContent, $request->content);
                $language_data['content'] = json_encode($tabContent, JSON_NUMERIC_CHECK);
                Language::where('tab_id', $request->tabId)->update($language_data);
            }
            $result = [
                'success' => TRUE,
                'message' => 'Languages successfully added.'
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
     * delete Languages
     */
    public function daleteLanguage(Request $request) {
        try {
            if (empty($request->id)) {
                throw new Exception('ID not found.');
            }
            if (empty($request->languageIds)) {
                throw new Exception('languageId not found.');
            }
            Language::deleteLanguage($request->id, $request->languageIds);
            $result = [
                'success' => TRUE,
                'message' => ['Languages successfully deleted.'],
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
