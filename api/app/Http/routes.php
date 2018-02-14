<?php

/*
  |--------------------------------------------------------------------------
  | Application Routes
  |--------------------------------------------------------------------------
  |
  | Here is where you can register all of the routes for an application.
  | It's a breeze. Simply tell Laravel the URIs it should respond to
  | and give it the controller to call when that URI is requested.
  |
 */

Route::get('/', [
    'uses' => 'UserController@getUserLogin',
//    'middleware' => 'uAuth',
    'as' => 'account.login'
]);
Route::post('account/login', [
    'uses' => 'UserController@postUserLogin',
//    'middleware' => 'uAuth',
    'as' => 'account.login.post'
]);

Route::get('ws/customer/login', [
    'uses' => 'UserController@getCustomerLogin',
//    'middleware' => 'uAuth',
    'as' => 'account.customer.login'
]);
Route::post('ws/customer/account/login', [
    'uses' => 'UserController@postCustomerLogin',
    // 'middleware' => 'uAuth',
    'as' => 'account.customer.login.post'
]);
//session check
Route::get('ws/ping', [
    "uses" => 'UserController@getPing',
    'middleware' => 'uAuth',
    "as" => "account.logout"
]);
Route::post('ws/account/login', [
    'uses' => 'UserController@apiPostUserLogin',
    'as' => 'api.account.login'
]);

Route::get('account/logout', [
    "uses" => 'UserController@getlogout',
    "as" => "account.logout"
]);
Route::get('account/client/logout', [
    "uses" => 'UserController@getClientLogout',
    "as" => "account.client.logout"
]);

Route::get('account/recovery-password', [
    "as" => "account.recovery-password",
    "uses" => 'UserController@getReminder'
]);

Route::post('account/reminder', [
    'uses' => 'UserController@postReminder',
    "as" => "account.reminder"
]);

Route::get('account/reminder-success', [
    "uses" => function () {
        return view('user.forgot-success');
    },
    "as" => "account.reminder-success"
]);

Route::get('account/dashboard', [
    'uses' => 'UserController@getUserDashboard',
    'as' => 'account.dashboard'
]);


// web services
Route::post('ws/account/edit-email', [
    "uses" => 'UserController@editProfile',
    'middleware' => 'uAuth',
    "as" => "account.edit"
]);

Route::post('ws/account/changepassword', [
    "uses" => 'UserController@changePassword',
    'middleware' => 'uAuth',
    "as" => "account.changepwd"
]);

Route::post('test/test', [
    'uses' => 'UserController@test',
    'as' => 'account.test'
]);

Route::post('ws/account/profileimage', [
    "uses" => 'UserController@editProfileImage',
    'middleware' => 'uAuth',
    "as" => "account.changeimg"
]);
Route::get('ws/account/profile', [
    "uses" => 'UserController@getProfile',
    'middleware' => 'uAuth',
    "as" => "ws.account.profile"
]);

Route::get('account/reset-password', [
    "as" => "account.reset-password",
    "uses" => 'UserController@resetPassword'
]);

Route::post('account/checkpassword', [
    'uses' => 'UserController@checkPassword',
    "as" => "account.checkpassword"
]);

Route::get('account/password-reset-success', [
    "uses" => function () {
        return view('user.reset-password-success');
    },
    "as" => "account.password-reset-success"
]);

Route::get('ws/app/list/{currentPage?}/{perPage?}', [
    'uses' => 'Apps\CreateController@getAppList',
    'middleware' => 'uAuth',
]);

Route::post('ws/app/create', [
    'uses' => 'Apps\CreateController@createNewApp',
    'middleware' => 'uAuth',
]);
Route::post('ws/app/duplicate', [
    'uses' => 'Apps\CreateController@createDuplicateApp',
    'middleware' => 'uAuth',
]);
Route::post('ws/app/update/{id}', [
    'uses' => 'Apps\CreateController@updateAppInfo',
    'middleware' => 'uAuth',
]);
Route::post('ws/app/update/appPublishInfo/{id}', [
    'uses' => 'Apps\CreateController@updateAppPublishInfo',
    'middleware' => 'uAuth',
]);
Route::get('ws/app/appPublish/log/{id}', [
    'uses' => 'Apps\CreateController@getAppPublishLog',
    'middleware' => 'uAuth',
]);
Route::post('ws/app/icon/upload/{id}', [
    'uses' => 'Apps\CreateController@saveAppIcon',
    'middleware' => 'uAuth',
]);
Route::get('ws/app/icon/delete/{id}', [
    'uses' => 'Apps\CreateController@deleteIcon',
    'middleware' => 'uAuth',
]);

Route::get('ws/app/screen-shot/get/{id}', [
    'uses' => 'Apps\CreateController@getScreenshots',
    'middleware' => 'uAuth',
]);

Route::post('ws/app/screen-shot/upload', [
    'uses' => 'Apps\CreateController@saveScreenshot',
    'middleware' => 'uAuth',
]);

Route::get('ws/app/screen-shot/generate/{appId}', [
    'uses' => 'Apps\CreateController@generateScreenshots',
    'middleware' => 'uAuth'
]);

Route::post('ion/app/screenshot/save', [
    'uses' => 'Apps\CreateController@saveAutoScreenshot',
]);

Route::post('ws/app/splash-screen/upload/{id}', [
    'uses' => 'Apps\CreateController@saveSplashScreen',
    'middleware' => 'uAuth',
]);

Route::get('ws/app/splash-screen/delete/{imageType}/{id}', [
    'uses' => 'Apps\CreateController@deleteSplashImage',
    'middleware' => 'uAuth',
]);
Route::get('ws/app/screen-shot/delete/{imageType}/{imageName}/{appId}', [
    'uses' => 'Apps\CreateController@deleteScreenShot',
    'middleware' => 'uAuth',
]);

Route::post('ws/app/screen-shot/generate/terminate/{appCode}', [
    'uses' => 'Apps\CreateController@terminateScreenshotGeneration',
]);

Route::get('ws/app/screen-shot/generate/status/{appId}', [
    'uses' => 'Apps\CreateController@getScreenshotGenerationStatus',
    'middleware' => 'uAuth'
]);

Route::post('ws/app/publish/save', [
    'uses' => 'Apps\CreateController@appPublish',
    'middleware' => 'uAuth',
]);

Route::get('ws/app/info/{id}', [
    'uses' => 'Apps\CreateController@getAppInfo',
    'middleware' => 'uAuth',
]);
Route::get('ws/app/publish/info/{id}', [
    'uses' => 'Apps\CreateController@getPublishData',
    'middleware' => 'uAuth',
]);
Route::get('ws/app/select-list', [
    'uses' => 'Apps\CreateController@getSelectAppList',
    'middleware' => 'uAuth',
]);

Route::post('ws/app/facebook-token/save', [
    'uses' => 'Apps\AppController@saveFacebookTokenForPushNotifications',
    'middleware' => 'uAuth',
]);

Route::get('ws/app/facebook-token/delete/{appID}', [
    'uses' => 'Apps\AppController@deleteFacebookToken',
    'middleware' => 'uAuth',
]);

Route::post('ws/app/twitter-token/save', [
    'uses' => 'Apps\AppController@saveTwitterTokenAndSecret',
    'middleware' => 'uAuth',
]);

Route::get('ws/app/twitter-token/delete/{appID}', [
    'uses' => 'Apps\AppController@deleteTwitterTokenAndSecret',
    'middleware' => 'uAuth',
]);

//ionic
Route::get('ion/app/tabs/{appCode}', [
    'uses' => 'Apps\AppsTabController@appIonicInit',
]);
Route::get('ion/app/appData/{appCode}', [
    'uses' => 'Apps\AppsTabController@getAppData',
]);
Route::get('ion/app/tabs/getway/{tabCode}/{tabId}', [
    'uses' => 'Apps\AppsTabController@appGetway',
]);

Route::post('ion/app/location/save/{appCode}/{deviceUUID}', [
    'uses' => 'Apps\AppController@saveLocation'
]);

Route::post('ion/app/device/save-member', [
    'uses' => 'Apps\AppController@saveDeviceMember'
]);

Route::post('ion/app/device/clear-member', [
    'uses' => 'Apps\AppController@clearDeviceMember'
]);

// tabs Routes
Route::get('ws/tab/list', [
    'uses' => 'Master\TabController@getTabList',
    'middleware' => 'uAuth',
]);
Route::post('ws/tab/create', [
    'uses' => 'Master\TabController@createNewTab',
    'middleware' => 'uAuth',
]);
Route::post('ws/tab/update/{id}', [
    'uses' => 'Master\TabController@updateTabInfo',
    'middleware' => 'uAuth',
]);
Route::get('ws/tab/info/{id}', [
    'uses' => 'Master\TabController@getTabInfo',
    'middleware' => 'uAuth',
]);
Route::post('ws/app/tab/create', [
    'uses' => 'Apps\AppsTabController@createAppsTab',
    'middleware' => 'uAuth',
]);
Route::post('ws/app/tab/update', [
    'uses' => 'Apps\AppsTabController@updateAppsTab',
    'middleware' => 'uAuth',
]);
Route::get('ws/app/tab/get/{id}/{all?}', [
    'uses' => 'Apps\AppsTabController@getAppTabs',
    'middleware' => 'uAuth',
]);
Route::post('ws/app/delete', [
    'uses' => 'Apps\CreateController@deleteApp',
    'middleware' => 'uAuth',
]);
Route::get('ws/app/tab/info/{id}', [
    'uses' => 'Apps\AppsTabController@getAppTabInfo',
    'middleware' => 'uAuth',
]);
Route::get('ws/app/tab/icon/black/{currentPage?}', [
    'uses' => 'Master\IconController@getBlackIcons',
    'middleware' => 'uAuth',
]);
Route::get('ws/app/tab/icon/white/{currentPage?}', [
    'uses' => 'Master\IconController@getWhiteIcons',
    'middleware' => 'uAuth',
]);
Route::get('ws/app/tab/icon/color/{currentPage?}', [
    'uses' => 'Master\IconController@getColorIcons',
    'middleware' => 'uAuth',
]);
Route::get('ws/app/tab/icon/photos/{currentPage?}', [
    'uses' => 'Master\IconController@getPhotosIcons',
    'middleware' => 'uAuth',
]);
Route::post('ws/app/tab/sort', [
    'uses' => 'Apps\AppsTabController@sortAppTabs',
    'middleware' => 'uAuth',
]);
Route::post('ws/app/tab/delete', [
    'uses' => 'Apps\AppsTabController@deleteTabs',
    'middleware' => 'uAuth',
]);
Route::get('ws/app/tab/icons/store', [
    'uses' => 'Master\IconController@storeIcons',
]);
Route::post('ws/app/tab/status/update', [
    'uses' => 'Apps\AppsTabController@changeStatus',
    'middleware' => 'uAuth',
]);
Route::get('ws/app/all', [
    'uses' => 'Apps\CreateController@getAllAppList',
    'middleware' => 'uAuth',
]);
Route::get('ws/app/tab/content/{id}', [
    'uses' => 'Apps\AppsTabController@getAppTabsForContent',
    'middleware' => 'uAuth',
]);
Route::post('ws/app/tab/sort-content', [
    'uses' => 'Apps\AppsTabController@sortAppTabsForContent',
    'middleware' => 'uAuth',
]);

Route::get('ws/app/tabs/{appId}', [
    'uses' => 'Apps\AppsTabController@getEnabledTabs',
    'middleware' => 'uAuth',
]);
// ---------------------- Tab function - Website -----------------------
Route::post('ws/function/website/create', [
    'uses' => 'TabFunctions\WebsiteTabController@createWebsite',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/website/list/{tabId}', [
    'uses' => 'TabFunctions\WebsiteTabController@getWebsiteList',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/website/tab/data/{tabId}', [
    'uses' => 'TabFunctions\WebsiteTabController@getWebsiteTabData',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/website/sort', [
    'uses' => 'TabFunctions\WebsiteTabController@sortWebsites',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/website/edit', [
    'uses' => 'TabFunctions\WebsiteTabController@editWebsite',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/website/delete', [
    'uses' => 'TabFunctions\WebsiteTabController@deleteWebsites',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/website/get/{id}', [
    'uses' => 'TabFunctions\WebsiteTabController@getWebsiteData',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/website/delete-thumbnail/{id}', [
    'uses' => 'TabFunctions\WebsiteTabController@deleteThumbnail',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/website/settings/save/{tabId}', [
    'uses' => 'TabFunctions\WebsiteTabController@saveSettings',
    'middleware' => 'uAuth'
]);

//ionic 
Route::get('ion/function/website/tab/data/{tabId}', [
    'uses' => 'TabFunctions\WebsiteTabController@getWebsiteTabData',
]);

// ---------------------------------------------------------------------------
// ------------------------- Tab function - Call Us --------------------------
Route::post('ws/function/call-us/create', [
    'uses' => 'TabFunctions\CallUsController@create',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/call-us/list/{tabId}', [
    'uses' => 'TabFunctions\CallUsController@getPhoneNumberList',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/call-us/sort', [
    'uses' => 'TabFunctions\CallUsController@sortItem',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/call-us/edit', [
    'uses' => 'TabFunctions\CallUsController@edit',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/call-us/delete', [
    'uses' => 'TabFunctions\CallUsController@delete',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/call-us/get/{id}', [
    'uses' => 'TabFunctions\CallUsController@getItemData',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/call-us/tab/data/{tabId}', [
    'uses' => 'TabFunctions\CallUsController@getAllTabData',
    'middleware' => 'uAuth'
]);
//ionic
Route::get('ion/function/call-us/tab/data/{tabId}', [
    'uses' => 'TabFunctions\CallUsController@getAllTabData',
]);
//--------------------------------------------------------------------------
// ----------------------- Tab function - PDF Tab --------------------------
Route::post('ws/function/pdf/create', [
    'uses' => 'TabFunctions\PDFTabController@create',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/pdf/tab/data/{tabId}', [
    'uses' => 'TabFunctions\PDFTabController@getAllData',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/pdf/list/{tabId}', [
    'uses' => 'TabFunctions\PDFTabController@getList',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/pdf/sort', [
    'uses' => 'TabFunctions\PDFTabController@sortItem',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/pdf/edit', [
    'uses' => 'TabFunctions\PDFTabController@edit',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/pdf/delete', [
    'uses' => 'TabFunctions\PDFTabController@delete',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/pdf/get/{id}', [
    'uses' => 'TabFunctions\PDFTabController@getItemData',
    'middleware' => 'uAuth'
]);

// ionic
Route::get('ion/function/pdf/tab/data/{tabId}', [
    'uses' => 'TabFunctions\PDFTabController@appInit',
]);

// ------------ Menu Calls --------------------
// Category
Route::get('ws/function/menu-tab/tab/data/{tabId}', [
    'uses' => 'TabFunctions\MenuTabController@getAllTabData',
    'middleware' => 'uAuth'
]);


Route::post('ws/function/menu-tab/category/create', [
    'uses' => 'TabFunctions\MenuTabController@createCategory',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/menu-tab/category/edit', [
    'uses' => 'TabFunctions\MenuTabController@editCategory',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/menu-tab/category/delete', [
    'uses' => 'TabFunctions\MenuTabController@deleteCategory',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/menu-tab/category/sort', [
    'uses' => 'TabFunctions\MenuTabController@sortCategory',
    'middleware' => 'uAuth'
]);


Route::get('ws/function/menu-tab/category/get/{id}', [
    'uses' => 'TabFunctions\MenuTabController@getItemData',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/menu-tab/category/list/{tabId}', [
    'uses' => 'TabFunctions\MenuTabController@getMenuCategoryList',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/menu-tab/item/list/{menuId}', [
    'uses' => 'TabFunctions\MenuTabController@getMenuCategoryItemList',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/menu-tab/item/sort', [
    'uses' => 'TabFunctions\MenuTabController@sortMenuItem',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/menu-tab/item/delete', [
    'uses' => 'TabFunctions\MenuTabController@deleteMenuItem',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/menu-tab/item/create', [
    'uses' => 'TabFunctions\MenuTabController@createMenuItem',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/menu-tab/item/get/{id}', [
    'uses' => 'TabFunctions\MenuTabController@getMenuItemData',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/menu-tab/item/edit', [
    'uses' => 'TabFunctions\MenuTabController@editMenuItem',
    'middleware' => 'uAuth'
]);

// ----------------------- ionic -------------------
Route::get('ion/function/menu-tab/tab/data/{tabId}', [
    'uses' => 'TabFunctions\MenuTabController@appInit',
]);

Route::get('ion/function/menu-tab/item/init/{menuId}', [
    'uses' => 'TabFunctions\MenuTabController@appMenuItemsInit',
]);

Route::get('ion/function/menu-tab/item/get/{id}', [
    'uses' => 'TabFunctions\MenuTabController@getMenuItemData',
]);
// -------------------------------------------------
//--------------------------------------------------------------------------
// ----------------------- Tab function - Contact US Tab --------------------------
Route::get('ws/function/contact-us/init/{tabId}', [
    'uses' => 'TabFunctions\ContactUsController@init',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/contact-us/location/list/{tabId}', [
    'uses' => 'TabFunctions\ContactUsController@listLocations',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/contact-us/location/get/{id}', [
    'uses' => 'TabFunctions\ContactUsController@getItemData',
    'middleware' => 'uAuth'
]);
//both add/edit from same function
Route::post('ws/function/contact-us/location/save', [
    'uses' => 'TabFunctions\ContactUsController@save',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/contact-us/location/sort', [
    'uses' => 'TabFunctions\ContactUsController@sortItem',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/contact-us/location/delete', [
    'uses' => 'TabFunctions\ContactUsController@delete',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/contact-us/location/image/delete/{imageType}/{locationId}', [
    'uses' => 'TabFunctions\ContactUsController@deleteImage',
    'middleware' => 'uAuth'
]);

//--------------------------------------------------------------------------
// ----------------------- Tab function - Contact US Tab-- openings --------------------------
//get all openings for location
Route::get('ws/function/contact-us/location/opening/list/{contact_id}', [
    'uses' => 'TabFunctions\ContactUsController@openingList',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/contact-us/location/opening/get/{id}', [
    'uses' => 'TabFunctions\ContactUsController@getOpeningData',
    'middleware' => 'uAuth'
]);
//both create/edit from same route
Route::post('ws/function/contact-us/location/opening/save', [
    'uses' => 'TabFunctions\ContactUsController@saveOpening',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/contact-us/location/opening/sort', [
    'uses' => 'TabFunctions\ContactUsController@sortOpening',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/contact-us/location/opening/delete', [
    'uses' => 'TabFunctions\ContactUsController@deleteOpening',
    'middleware' => 'uAuth'
]);

//--------------------------------------------------------------------------
// ----------------------- Tab function - Contact US Tab-- comments --------------------------
//get all comments for location

Route::get('ws/function/contact-us/location/comment/list/{contact_id}', [
    'uses' => 'TabFunctions\ContactUsController@commentList',
    'middleware' => 'uAuth'
]);

//delete comment
Route::post('ws/function/contact-us/location/comment/delete', [
    'uses' => 'TabFunctions\ContactUsController@deleteComment',
    'middleware' => 'uAuth'
]);

// -------------------- Contact Us Tab Function Ionic routes ---------------------

Route::get('ion/function/contact-us/location/list/{tabId}', [
    'uses' => 'TabFunctions\ContactUsController@listLocations',
]);

Route::get('ion/function/contact-us/location/get/{id}', [
    'uses' => 'TabFunctions\ContactUsController@getItemData',
]);

Route::post('ion/function/contact-us/save', [
    'uses' => 'TabFunctions\ContactUsController@saveComment',
]);

// -------------------------------------------------------------------------------
//--------------------------------------------------------------------------
// ----------------------- Tab function - Content Tab 2  --------------------------

Route::get('ws/function/content-tab-2/init/{tabId}', [
    'uses' => 'TabFunctions\ContentTabTwoController@init',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/content-tab-2/get/{id}', [
    'uses' => 'TabFunctions\ContentTabTwoController@getItemData',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/content-tab-2/list/{tabId}', [
    'uses' => 'TabFunctions\ContentTabTwoController@contentTwoList',
    'middleware' => 'uAuth'
]);
//both create/edit from same route
Route::post('ws/function/content-tab-2/save', [
    'uses' => 'TabFunctions\ContentTabTwoController@saveContent',
    'middleware' => 'uAuth',
    'as' => 'content-tab-2.save'
]);
Route::post('ws/function/content-tab-2/update-colors', [
    'uses' => 'TabFunctions\ContentTabTwoController@saveContent',
    'middleware' => 'uAuth',
    'as' => 'content-tab-2.update-colors'
]);

Route::post('ws/function/content-tab-2/sort', [
    'uses' => 'TabFunctions\ContentTabTwoController@sortContent',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/content-tab-2/delete', [
    'uses' => 'TabFunctions\ContentTabTwoController@deleteContent',
    'middleware' => 'uAuth'
]);
//delete image
Route::get('ws/function/content-tab-2/image/delete/{imageType}/{id}', [
    'uses' => 'TabFunctions\ContentTabTwoController@deleteImage',
    'middleware' => 'uAuth'
]);
//delete thumbnail
Route::get('ws/function/content-tab-2/thumbnail/delete/{imageType}/{id}', [
    'uses' => 'TabFunctions\ContentTabTwoController@deleteThumbnail',
    'middleware' => 'uAuth'
]);

// Ionic - Content Tab 2
Route::get('ion/function/content-tab-2/list/{tabId}', [
    'uses' => 'TabFunctions\ContentTabTwoController@getSectionWiseItemList',
]);

Route::get('ion/function/content-tab-2/get/{id}', [
    'uses' => 'TabFunctions\ContentTabTwoController@getItemData',
]);

Route::post('ion/function/content-tab-2/save', [
    'uses' => 'TabFunctions\ContentTabTwoController@saveComment',
]);

//Content Tab 1

Route::get('ws/function/content-tab-1/init/{tabId}', [
    'uses' => 'TabFunctions\ContentTab1Controller@init',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/content-tab-1/get/{id}', [
    'uses' => 'TabFunctions\ContentTab1Controller@getItemData',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/content-tab-1/list/{tabId}', [
    'uses' => 'TabFunctions\ContentTab1Controller@contentOneList',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/content-tab-1/save', [
    'uses' => 'TabFunctions\ContentTab1Controller@saveContent',
    'middleware' => 'uAuth',
    'as' => 'content-tab-1.save'
]);
Route::post('ws/function/content-tab-1/update-colors', [
    'uses' => 'TabFunctions\ContentTab1Controller@saveContent',
    'middleware' => 'uAuth',
    'as' => 'content-tab-1.update-colors'
]);

Route::post('ws/function/content-tab-1/sort', [
    'uses' => 'TabFunctions\ContentTab1Controller@sortContent',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/content-tab-1/delete', [
    'uses' => 'TabFunctions\ContentTab1Controller@deleteContent',
    'middleware' => 'uAuth'
]);
//delete image
Route::get('ws/function/content-tab-1/image/delete/{imageType}/{locationId}', [
    'uses' => 'TabFunctions\ContentTab1Controller@deleteImage',
    'middleware' => 'uAuth'
]);
//delete thumbnail
Route::get('ws/function/content-tab-1/thumbnail/delete/{imageType}/{locationId}', [
    'uses' => 'TabFunctions\ContentTab1Controller@deleteThumbnail',
    'middleware' => 'uAuth'
]);

//content tab 1 comments
//comment list
Route::get('ws/function/content-tab-1/comment/list/{content_id}', [
    'uses' => 'TabFunctions\ContentTab1Controller@commentList',
    'middleware' => 'uAuth'
]);
//add/edit comment
Route::post('ws/function/content-tab-1/comment/save', [
    'uses' => 'TabFunctions\ContentTab1Controller@saveComment',
    'middleware' => 'uAuth'
]);
//delete comment
Route::post('ws/function/content-tab-1/comment/delete', [
    'uses' => 'TabFunctions\ContentTab1Controller@deleteComment',
    'middleware' => 'uAuth'
]);

// Ionic
Route::get('ion/function/content-tab-1/init/{tabId}', [
    'uses' => 'TabFunctions\ContentTab1Controller@init',
]);

Route::post('ion/function/content-tab-1/save', [
    'uses' => 'TabFunctions\ContentTab1Controller@saveComment',
]);

//content tab 2 comments
//comment list
Route::get('ws/function/content-tab-2/comment/list/{content_id}', [
    'uses' => 'TabFunctions\ContentTabTwoController@commentList',
    'middleware' => 'uAuth'
]);
//add/edit comment
Route::post('ws/function/content-tab-2/comment/save', [
    'uses' => 'TabFunctions\ContentTabTwoController@saveComment',
    'middleware' => 'uAuth'
]);
//delete comment
Route::post('ws/function/content-tab-2/comment/delete', [
    'uses' => 'TabFunctions\ContentTabTwoController@deleteComment',
    'middleware' => 'uAuth'
]);
//sort Comments
Route::post('ws/function/content-tab-2/comment/sort', [
    'uses' => 'TabFunctions\ContentTabTwoController@sortComments',
    'middleware' => 'uAuth'
]);

//--------------------------------------------------------------------------
// ----------------------- Tab function - Content Tab 3  --------------------------
//init
Route::get('ws/function/content-tab-3/init/{tabId}', [
    'uses' => 'TabFunctions\ContentTabThreeController@init',
    'middleware' => 'uAuth'
]);
//get categories
Route::get('ws/function/content-tab-3/list/{tabId}', [
    'uses' => 'TabFunctions\ContentTabThreeController@categoryList',
    'middleware' => 'uAuth'
]);
//add/edit content tab3 category
Route::post('ws/function/content-tab-3/save', [
    'uses' => 'TabFunctions\ContentTabThreeController@saveContent',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/content-tab-3/sort', [
    'uses' => 'TabFunctions\ContentTabThreeController@sortCategory',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/content-tab-3/delete', [
    'uses' => 'TabFunctions\ContentTabThreeController@deleteCategory',
    'middleware' => 'uAuth'
]);

//delete thumbnail
Route::get('ws/function/content-tab-3/thumbnail/delete/{id}', [
    'uses' => 'TabFunctions\ContentTabThreeController@deleteThumbnail',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/content-tab-3/getCategoryData/{id}', [
    'uses' => 'TabFunctions\ContentTabThreeController@getCategoryData',
    'middleware' => 'uAuth'
]);

// Ionic - Content Tab 3
Route::get('ion/function/content-tab-3/list/{tabId}', [
    'uses' => 'TabFunctions\ContentTabThreeController@getSectionWiseCategoryList',
]);

Route::post('ion/function/content-tab-3/save', [
    'uses' => 'TabFunctions\ContentTabThreeController@saveComment',
]);
// ------------------------ Content Tab 3 -- Items  --------------------------


Route::get('ws/function/content-tab-3/init/{categoryId}', [
    'uses' => 'TabFunctions\ContentTabThreeController@init',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/content-tab-3/categoryItem/list/{categoryId}', [
    'uses' => 'TabFunctions\ContentTabThreeController@categoryItemList',
    'middleware' => 'uAuth'
]);
//add/edit from same route
Route::post('ws/function/content-tab-3/categoryItem/save', [
    'uses' => 'TabFunctions\ContentTabThreeController@saveCategoryItem',
    'middleware' => 'uAuth',
    'as' => 'content-tab-3.save'
]);
Route::post('ws/function/content-tab-3/categoryItem/update-colors', [
    'uses' => 'TabFunctions\ContentTabThreeController@saveCategoryItem',
    'middleware' => 'uAuth',
    'as' => 'content-tab-3.update-colors'
]);
Route::post('ws/function/content-tab-3/categoryItem/delete', [
    'uses' => 'TabFunctions\ContentTabThreeController@deleteCategoryItem',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/content-tab-3/categoryItem/sort', [
    'uses' => 'TabFunctions\ContentTabThreeController@sortCategoryItem',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/content-tab-3/categoryItem/getData/{id}', [
    'uses' => 'TabFunctions\ContentTabThreeController@getItemData',
    'middleware' => 'uAuth'
]);
//delete image of content tab 3 items
Route::get('ws/function/content-tab-3/categoryItem/image/delete/{imageType}/{itemId}', [
    'uses' => 'TabFunctions\ContentTabThreeController@deleteImage',
    'middleware' => 'uAuth'
]);
//delete thumbnail content tab 3 item
Route::get('ws/function/content-tab-3/categoryItem/thumbnail/delete/{itemId}', [
    'uses' => 'TabFunctions\ContentTabThreeController@deleteThumbnailContentTab3Item',
    'middleware' => 'uAuth'
]);

// Ionic - Content Tab 3 category item list
Route::get('ion/function/content-tab-3/categoryItem/list/{categoryId}', [
    'uses' => 'TabFunctions\ContentTabThreeController@getSectionWiseCategoryItemList',
]);

Route::get('ion/function/content-tab-3/categoryItem/getData/{id}', [
    'uses' => 'TabFunctions\ContentTabThreeController@getItemData',
]);
//content tab 3 comments
//comment list
Route::get('ws/function/content-tab-3/comment/list/{content_id}', [
    'uses' => 'TabFunctions\ContentTabThreeController@commentList',
    'middleware' => 'uAuth'
]);
//add/edit comment
Route::post('ws/function/content-tab-3/comment/save', [
    'uses' => 'TabFunctions\ContentTabThreeController@saveComment',
    'middleware' => 'uAuth'
]);
//delete comment
Route::post('ws/function/content-tab-3/comment/delete', [
    'uses' => 'TabFunctions\ContentTabThreeController@deleteComment',
    'middleware' => 'uAuth'
]);
//sort Comments
Route::post('ws/function/content-tab-3/comment/sort', [
    'uses' => 'TabFunctions\ContentTabThreeController@sortComments',
    'middleware' => 'uAuth'
]);
// upload ck editor images

Route::post('ws/function/ck-editor-image/uploadCkeditorImage', [
    'uses' => 'TabFunctions\ContentTabThreeController@uploadCkEditorImage',
    'middleware' => 'uAuth',
]);

//Around Us 
//
//
//init Around Us
Route::get('ws/function/around-us/init/{tabId}', [
    'uses' => 'TabFunctions\AroundUsController@init',
    'middleware' => 'uAuth'
]);

// Add/Edit Around Us category
Route::post('ws/function/around-us/category/save', [
    'uses' => 'TabFunctions\AroundUsController@saveCategory',
    'middleware' => 'uAuth'
]);

//get items of Category
Route::get('ws/function/around-us/category/item/get/{aroundUsId}', [
    'uses' => 'TabFunctions\AroundUsController@itemList',
    'middleware' => 'uAuth'
]);

// Add/Edit items of category
Route::post('ws/function/around-us/category/item/save', [
    'uses' => 'TabFunctions\AroundUsController@saveItem',
    'middleware' => 'uAuth'
]);

//delete item
Route::post('ws/function/around-us/category/item/delete', [
    'uses' => 'TabFunctions\AroundUsController@deleteItem',
    'middleware' => 'uAuth'
]);

//sort items
Route::post('ws/function/around-us/category/item/sort', [
    'uses' => 'TabFunctions\AroundUsController@sortAroundUsItem',
    'middleware' => 'uAuth'
]);

//get single item

Route::get('ws/function/around-us/category/item/info/{id}', [
    'uses' => 'TabFunctions\AroundUsController@getItemData',
    'middleware' => 'uAuth'
]);

//delete thumbnail for around us item
Route::get('ws/function/around-us/category/item/thumbnail/delete/{itemId}', [
    'uses' => 'TabFunctions\AroundUsController@deleteThumbnail',
    'middleware' => 'uAuth'
]);

//////////////////////////////////
// Add/Edit comments for Around Us


Route::post('ws/function/around-us/comment/save', [
    'uses' => 'TabFunctions\AroundUsController@saveComment',
    'middleware' => 'uAuth'
]);

// Comment List
Route::get('ws/function/around-us/comment/list/{itemId}', [
    'uses' => 'TabFunctions\AroundUsController@commentList',
    'middleware' => 'uAuth'
]);

//Delete Comment
Route::post('ws/function/around-us/comment/delete', [
    'uses' => 'TabFunctions\AroundUsController@deleteComment',
    'middleware' => 'uAuth'
]);

//sort comments
Route::post('ws/function/around-us/comment/sort', [
    'uses' => 'TabFunctions\AroundUsController@sortComments',
]);

//IONIC//
Route::get('ion/function/around-us/init/{tabId}', [
    'uses' => 'TabFunctions\AroundUsController@init',
]);
Route::get('ion/function/around-us/category/item/info/{id}', [
    'uses' => 'TabFunctions\AroundUsController@getItemData',
]);
Route::post('ion/function/around-us/comment/save', [
    'uses' => 'TabFunctions\AroundUsController@saveComment',
]);

//Directions
//init
Route::get('ws/function/direction/init/{tabId}', [
    'uses' => 'TabFunctions\DirectionController@init',
    'middleware' => 'uAuth'
]);
//
//Add/Edit Direction
Route::post('ws/function/direction/save/', [
    'uses' => 'TabFunctions\DirectionController@saveDirection',
    'middleware' => 'uAuth'
]);
//List Directions
Route::get('ws/function/direction/list/{tabId}', [
    'uses' => 'TabFunctions\DirectionController@directionList',
    'middleware' => 'uAuth'
]);
//Get Single Direction
Route::get('ws/function/direction/get/{id}', [
    'uses' => 'TabFunctions\DirectionController@getItemData',
    'middleware' => 'uAuth'
]);
//delete direction
Route::post('ws/function/direction/delete', [
    'uses' => 'TabFunctions\DirectionController@deleteDirection',
    'middleware' => 'uAuth'
]);
//sort directions
Route::post('ws/function/direction/sort', [
    'uses' => 'TabFunctions\DirectionController@sortDirection',
    'middleware' => 'uAuth'
]);

// ------- IONIC -------------
Route::get('ion/function/direction/list/{tabId}', [
    'uses' => 'TabFunctions\DirectionController@directionList',
]);

Route::get('ion/function/direction/get/{id}', [
    'uses' => 'TabFunctions\DirectionController@getItemData',
]);
// ---------------------------
//Voice Recordings
//
//init
Route::get('ws/function/voice-recording/init/{tabId}', [
    'uses' => 'TabFunctions\VoiceRecordingController@init',
    'middleware' => 'uAuth'
]);

// Add/Edit Voice Recording
Route::post('ws/function/voice-recording/save', [
    'uses' => 'TabFunctions\VoiceRecordingController@save',
    'middleware' => 'uAuth'
]);

//get single data
Route::get('ws/function/voice-recording/info/{tabId}', [
    'uses' => 'TabFunctions\VoiceRecordingController@getItemData',
    'middleware' => 'uAuth'
]);

// ------------ IONIC ----------------
Route::get('ion/function/voice-recording/info/{tabId}', [
    'uses' => 'TabFunctions\VoiceRecordingController@getItemData',
]);
//------------------------------------
//Fan Wall Tab
//init
Route::get('ws/function/fan-wall/init/{tabId}', [
    'uses' => 'TabFunctions\FanWallController@init',
    'middleware' => 'uAuth'
]);

// Add/Edit fan wall comments
Route::post('ws/function/fan-wall/save', [
    'uses' => 'TabFunctions\FanWallController@save',
    'middleware' => 'uAuth'
]);

//get single comment
Route::get('ws/function/fan-wall/info/{id}', [
    'uses' => 'TabFunctions\FanWallController@getItemData',
    'middleware' => 'uAuth'
]);

//delete fan wall comment
Route::post('ws/function/fan-wall/delete', [
    'uses' => 'TabFunctions\FanWallController@delete',
    'middleware' => 'uAuth'
]);


//sort comments
Route::post('ws/function/fan-wall/sort', [
    'uses' => 'TabFunctions\DirectionController@sortFanWall',
    'middleware' => 'uAuth'
]);

// IONIC ------

Route::post('ion/function/fan-wall/save', [
    'uses' => 'TabFunctions\FanWallController@save',
]);

Route::get('ion/function/fan-wall/list/{tabId}', [
    'uses' => 'TabFunctions\FanWallController@listItems',
]);

Route::get('ion/function/fan-wall/replies/list/{itemId}', [
    'uses' => 'TabFunctions\FanWallController@listReplies',
]);

// -------
//Image Gallery Tab
//init
Route::get('ws/function/image-gallery/init/{tabId}', [
    'uses' => 'TabFunctions\ImageGalleryController@init',
    'middleware' => 'uAuth'
]);

//Add/Edit image gallery
Route::post('ws/function/image-gallery/save', [
    'uses' => 'TabFunctions\ImageGalleryController@save',
    'middleware' => 'uAuth'
]);
//get single Gallery
Route::get('ws/function/image-gallery/info/{id}', [
    'uses' => 'TabFunctions\ImageGalleryController@getItemData',
    'middleware' => 'uAuth'
]);
//delete Gallery
Route::post('ws/function/image-gallery/delete', [
    'uses' => 'TabFunctions\ImageGalleryController@deleteGallery',
    'middleware' => 'uAuth'
]);
//Sort Galleries
Route::post('ws/function/image-gallery/sort', [
    'uses' => 'TabFunctions\ImageGalleryController@sortGallery',
    'middleware' => 'uAuth'
]);
//Save Image Service Type
Route::post('ws/function/image-gallery/imageServiceType', [
    'uses' => 'TabFunctions\ImageGalleryController@saveImageServiceType',
    'middleware' => 'uAuth'
]);
//lagout instagram user
Route::get('ws/function/image-gallery/instagram/lagout/{tabId}', [
    'uses' => 'TabFunctions\ImageGalleryController@lagoutInstagramUser',
    'middleware' => 'uAuth'
]);
//delete Thumbnail
Route::get('ws/function/image-gallery/thumbnail/delete/{id}', [
    'uses' => 'TabFunctions\ImageGalleryController@deleteThumbnail',
    'middleware' => 'uAuth'
]);
//delete Image
Route::get('ws/function/image-gallery/image/delete/{id}', [
    'uses' => 'TabFunctions\ImageGalleryController@deleteImage',
    'middleware' => 'uAuth'
]);
//put Image description
Route::post('ws/function/image-gallery/image/description/save', [
    'uses' => 'TabFunctions\ImageGalleryController@saveImageDescription',
    'middleware' => 'uAuth'
]);
//get Image description
Route::get('ws/function/image-gallery/image/description/{id}', [
    'uses' => 'TabFunctions\ImageGalleryController@getImageDescription',
    'middleware' => 'uAuth'
]);
//get gallery list
Route::get('ws/function/image-gallery/list/{tabId}', [
    'uses' => 'TabFunctions\ImageGalleryController@galleryList',
    'middleware' => 'uAuth'
]);

//get images web URL for Server Sent Event supported
Route::get('ws/function/image-gallery/getImageUrl/{tabId}', [
    'uses' => 'TabFunctions\ImageGalleryController@getImageWebUrl',
    'middleware' => 'uAuth'
]);

//get images web URL for Server Sent Event not supported
Route::post('ws/function/image-gallery/saveWebUrlImages', [
    'uses' => 'TabFunctions\ImageGalleryController@saveWebUrlImages',
    'middleware' => 'uAuth'
]);
//sort images
Route::post('ws/function/image-gallery/images/sort', [
    'uses' => 'TabFunctions\ImageGalleryController@sortImages',
    'middleware' => 'uAuth'
]);

//after FB Login
Route::post('ws/function/image-gallery/facebook/pageAlbums', [
    'uses' => 'TabFunctions\ImageGalleryController@fbPageAlbums',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/image-gallery/facebook/gallaryImport', [
    'uses' => 'TabFunctions\ImageGalleryController@gallaryImport',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/image-gallery/facebook/pageAlbumImages', [
    'uses' => 'TabFunctions\ImageGalleryController@fbPageAlbumImages',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/image-gallery/user/facebooklogin', [
    'uses' => 'TabFunctions\ImageGalleryController@facebook_login',
    'middleware' => 'uAuth'
]);


// IONIC ----
//get gallery list
Route::get('ion/function/image-gallery/list/{tabId}', [
    'uses' => 'TabFunctions\ImageGalleryController@galleryList',
]);
//get single Gallery
Route::get('ion/function/image-gallery/gallery-photo-list/{id}', [
    'uses' => 'TabFunctions\ImageGalleryController@getItemData',
]);


Route::get('ion/function/image-gallery/instagram/images/{tab_id}/{user_id}', [
    "uses" => 'TabFunctions\ImageGalleryController@getInstagramPhotos'
]);
Route::get('ws/function/image-gallery/instagram/user/info/{accessToken}', [
    'middleware' => 'uAuth',
    "uses" => 'TabFunctions\ImageGalleryController@getInstagramUserInfo'
]);


Route::get('ws/function/image-gallery/picasa/images/{tab_id}/{user_id}', [
    'middleware' => 'uAuth',
    "uses" => 'TabFunctions\ImageGalleryController@getPicasaPhotos'
]);

//Save image Gallary configuration details if details not exist in db otherwise update
Route::post('ws/function/image-gallery/config/save', [
    'middleware' => 'uAuth',
    "uses" => 'TabFunctions\ImageGalleryController@saveGallaryConfig'
]);

//Init image Gallary for getting details of default service selected
Route::get('ws/function/image-gallery/config/init/{tab_id}', [
    'middleware' => 'uAuth',
    "uses" => 'TabFunctions\ImageGalleryController@initGallaryConfig'
]);

//get Gallery configuration detail for given tab_id and gallery_type
Route::get('ws/function/image-gallery/config/galleryDetails/{tab_id}/{gallery_type}', [
    'middleware' => 'uAuth',
    "uses" => 'TabFunctions\ImageGalleryController@getGalleryConfigDetails'
]);

// ------------------------ Inbox Tab  -- Settings  --------------------------
//init
Route::get('ws/function/inboxTab/init/{tabId}', [
    'uses' => 'TabFunctions\InboxTabController@init',
    'middleware' => 'uAuth'
]);

//Add/Edit Inbox Settings
Route::post('ws/function/inboxTab/save', [
    'uses' => 'TabFunctions\InboxTabController@saveSettings',
    'middleware' => 'uAuth'
]);
// ------------------------ Inbox Tab  -- Subscription  --------------------------
Route::post('ws/function/inboxTab/subscription/save', [
    'uses' => 'TabFunctions\InboxTabController@saveSubscription',
    'middleware' => 'uAuth'
]);

//List Subscription
Route::get('ws/function/inboxTab/subscription/list/{tabId}', [
    'uses' => 'TabFunctions\InboxTabController@subscriptionList',
    'middleware' => 'uAuth'
]);

//sort subscription
Route::post('ws/function/inboxTab/subscription/sort', [
    'uses' => 'TabFunctions\InboxTabController@sortSubscription',
    'middleware' => 'uAuth'
]);

//delete subscription
Route::post('ws/function/inboxTab/subscription/delete', [
    'uses' => 'TabFunctions\InboxTabController@deleteSubscription',
    'middleware' => 'uAuth'
]);

//Get Single subscription
Route::get('ws/function/inboxTab/subscription/get/info/{id}', [
    'uses' => 'TabFunctions\InboxTabController@getSubscriptionData',
    'middleware' => 'uAuth'
]);


// ------------------------ Events Tab  --  --------------------------
//init
Route::get('ws/function/eventsTab/init/{tabId}/{sortBy?}', [
    'uses' => 'TabFunctions\EventsTabController@init',
    'middleware' => 'uAuth'
]);
//save settings
Route::post('ws/function/eventsTab/settings/save/{tabId}', [
    'uses' => 'TabFunctions\EventsTabController@saveSettings',
    'middleware' => 'uAuth'
]);

//sort events
Route::post('ws/function/eventsTab/events/sort', [
    'uses' => 'TabFunctions\EventsTabController@sortEvents',
    'middleware' => 'uAuth'
]);

//delete events
Route::post('ws/function/eventsTab/events/delete', [
    'uses' => 'TabFunctions\EventsTabController@deleteEvents',
    'middleware' => 'uAuth'
]);
//save events
Route::post('ws/function/eventsTab/events/save', [
    'uses' => 'TabFunctions\EventsTabController@saveSingleEvents',
    'middleware' => 'uAuth',
]);

//Get Single event
Route::get('ws/function/eventsTab/events/info/{id}', [
    'uses' => 'TabFunctions\EventsTabController@getEventData',
    'middleware' => 'uAuth'
]);
//delete image
Route::get('ws/function/eventsTab/image/delete/{imageType}/{id}', [
    'uses' => 'TabFunctions\EventsTabController@deleteImage',
    'middleware' => 'uAuth'
]);

//////////////////////////////////
// Add/Edit comments for Events Tab

Route::post('ws/function/eventsTab/events/comment/save', [
    'uses' => 'TabFunctions\EventsTabController@saveComment',
    'middleware' => 'uAuth'
]);

// Comment List
Route::get('ws/function/eventsTab/events/comment/list/{eventId}', [
    'uses' => 'TabFunctions\EventsTabController@commentList',
    'middleware' => 'uAuth'
]);

//Delete Comment
Route::post('ws/function/eventsTab/events/comment/delete', [
    'uses' => 'TabFunctions\EventsTabController@deleteComment',
    'middleware' => 'uAuth'
]);

//////////Events Timezone/////////////////////
//save timezone
Route::post('ws/function/eventsTab/events/timezone/save', [
    'uses' => 'TabFunctions\EventsTabController@saveTimezone',
    'middleware' => 'uAuth',
]);
//get single contact data in event tab

Route::get('ws/function/eventsTab/events/contact/info/{id}', [
    'uses' => 'TabFunctions\EventsTabController@getContactSingleData',
    'middleware' => 'uAuth'
]);
//get events list
Route::get('ws/function/eventsTab/events/list/{tabId}/{sortBy?}', [
    'uses' => 'TabFunctions\EventsTabController@getEventList',
    'middleware' => 'uAuth'
]);

//////////////////////////////////
// Add/Edit goings for Events Tab

Route::post('ws/function/eventsTab/events/going/save', [
    'uses' => 'TabFunctions\EventsTabController@saveGoings',
    'middleware' => 'uAuth'
]);

// Goings List
Route::get('ws/function/eventsTab/events/going/list/{eventId}', [
    'uses' => 'TabFunctions\EventsTabController@goingsList',
    'middleware' => 'uAuth'
]);

//Delete Going
Route::post('ws/function/eventsTab/events/going/delete', [
    'uses' => 'TabFunctions\EventsTabController@deleteGoing',
    'middleware' => 'uAuth'
]);

// Add/Edit images for Events Tab

Route::post('ws/function/eventsTab/events/image/save', [
    'uses' => 'TabFunctions\EventsTabController@saveImages',
    'middleware' => 'uAuth'
]);

//Delete image
Route::get('ws/function/eventsTab/events/image/delete/{id}', [
    'uses' => 'TabFunctions\EventsTabController@deleteEventImage',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/eventsTab/events/image/{id}', [
    'uses' => 'TabFunctions\EventsTabController@getImageData',
    'middleware' => 'uAuth'
]);
//sort images
Route::post('ws/function/eventsTab/events/image/sort', [
    'uses' => 'TabFunctions\EventsTabController@sortImages',
    'middleware' => 'uAuth'
]);

//save recurring events
Route::post('ws/function/eventsTab/recurring/events/save', [
    'uses' => 'TabFunctions\EventsTabController@saveRecurringEvents',
    'middleware' => 'uAuth',
]);
//sort recurring events
Route::post('ws/function/eventsTab/recurring/events/sort', [
    'uses' => 'TabFunctions\EventsTabController@sortRecurringEvents',
    'middleware' => 'uAuth'
]);
//Delete recurring events
Route::post('ws/function/eventsTab/recurring/events/delete', [
    'uses' => 'TabFunctions\EventsTabController@deleteRecurringEvents',
    'middleware' => 'uAuth'
]);

//Get Single recurring event
Route::get('ws/function/eventsTab/recurring/events/info/{id}', [
    'uses' => 'TabFunctions\EventsTabController@getRecurringEventData',
    'middleware' => 'uAuth'
]);
//get recurring events list
Route::get('ws/function/eventsTab/recurring/events/list/{tabId}', [
    'uses' => 'TabFunctions\EventsTabController@getRecurringEventList',
    'middleware' => 'uAuth'
]);
//delete recurring events image
Route::get('ws/function/eventsTab/recurring/events/image/delete/{imageType}/{id}', [
    'uses' => 'TabFunctions\EventsTabController@deleteRecurringImage',
    'middleware' => 'uAuth'
]);

// -------------------- EMAIL FORMS TAB ---------------------------------

Route::get('ws/function/email-forms-tab/init/{tabId}', [
    'uses' => 'TabFunctions\EmailFormsTabController@init',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/email-forms-tab/save', [
    'uses' => 'TabFunctions\EmailFormsTabController@save',
    'middleware' => 'uAuth'
]);

//sort 
Route::post('ws/function/email-forms-tab/sort', [
    'uses' => 'TabFunctions\EmailFormsTabController@sortForms',
    'middleware' => 'uAuth'
]);

//List Forms
Route::get('ws/function/email-forms-tab/list/{tabId}', [
    'uses' => 'TabFunctions\EmailFormsTabController@formsList',
    'middleware' => 'uAuth'
]);

//delete form
Route::post('ws/function/email-forms-tab/delete', [
    'uses' => 'TabFunctions\EmailFormsTabController@deleteForm',
    'middleware' => 'uAuth'
]);

//Get Single form data
Route::get('ws/function/email-forms-tab/get/{id}', [
    'uses' => 'TabFunctions\EmailFormsTabController@getFormData',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/email-forms-fields/save', [
    'uses' => 'TabFunctions\EmailFormsTabController@deleteFormField',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/email-forms-fields/downloadCsv/{formId}', [
    'uses' => 'TabFunctions\EmailFormsTabController@downloadCSV',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/email-forms-entry/save', [
    'uses' => 'TabFunctions\EmailFormsTabController@saveEmailFormEntries',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/email-forms-entry/list', [
    'uses' => 'TabFunctions\EmailFormsTabController@listEmailFormEntries',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/email-forms-entry/delete', [
    'uses' => 'TabFunctions\EmailFormsTabController@deleteFormEntries',
    'middleware' => 'uAuth'
]);
//download email form values
Route::get('ws/function/email-forms-fields/formFileDownload/', [
    'uses' => 'TabFunctions\EmailFormsTabController@emailFormDownload',
    'middleware' => 'uAuth'
]);

// -- IONIC 
// Email Form List
Route::get('ion/function/email-forms-tab/email-forms-list/{tabId}', [
    'uses' => 'TabFunctions\EmailFormsTabController@emailFormsList',
]);
// Email Form Data
Route::get('ion/function/email-forms-tab/email-form-data/{id}', [
    'uses' => 'TabFunctions\EmailFormsTabController@getFormData',
]);
// Save Email Form Data and send Email to form user
Route::post('ion/function/email-forms-tab/save-email-form-data', [
    'uses' => 'TabFunctions\EmailFormsTabController@saveEmailFormData',
    'middleware' => 'throttle:5,5'
]);
Route::post('ws/function/email-forms-tab/save-email-form-data', [
    'uses' => 'TabFunctions\EmailFormsTabController@saveEmailFormData',
    'middleware' => 'uAuth'
]);
Route::post('ion/function/email-forms-tab/save-form-data', [
    'uses' => 'TabFunctions\EmailFormsTabController@saveFileFormData',
]);
Route::get('ws/function/email-forms-tab/statistics/year/data/{id}/{year}', [
    'uses' => 'TabFunctions\EmailFormsTabController@getYearData',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/email-forms-tab/statistics/year/month/data/{id}/{year}/{month}', [
    'uses' => 'TabFunctions\EmailFormsTabController@getMonthData',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/email-forms-tab/statistics/year/month/day/data/{id}/{year}/{month}/{day}', [
    'uses' => 'TabFunctions\EmailFormsTabController@getDayData',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/email-forms-tab/statistics/twelve/month/data/{id}', [
    'uses' => 'TabFunctions\EmailFormsTabController@getLastTwelveMonthData',
    'middleware' => 'uAuth'
]);

// ----------------------------------------------------------------------
// -------------------- QR SCANNER TAB ---------------------------------

Route::get('ws/function/qr-scanner/init/{tabId}', [
    'uses' => 'TabFunctions\QrScannerController@init',
    'middleware' => 'uAuth'
]);



//*******************************DisplaySettingsHomeScreen***************

Route::post('ws/display/settings/home-screen/save', [
    'uses' => 'Display\DisplaySettingsController@saveSettings',
    'middleware' => 'uAuth'
]);

Route::get('ws/display/settings/init/{app_id}', [
    'uses' => 'Display\DisplaySettingsController@init',
    'middleware' => 'uAuth'
]);

Route::post('ws/display/settings/button-bg-img/save', [
    'uses' => 'Display\DisplaySettingsController@uploadButtonBackgroundImg',
    'middleware' => 'uAuth'
]);

Route::get('ws/display/settings/button-bg-img/list/{app_id}', [
    'uses' => 'Display\DisplaySettingsController@getButtonBackgroundImages',
    'middleware' => 'uAuth'
]);

Route::get('ws/display/settings/button-bg-img/delete/{id}', [
    'uses' => 'Display\DisplaySettingsController@deleteButtonBgImage',
    'middleware' => 'uAuth'
]);

Route::post('ws/display/settings/home-screen/header-bg-img/save', [
    'uses' => 'Display\DisplaySettingsController@uploadHeaderBackgroundImg',
    'middleware' => 'uAuth'
]);

Route::get('ws/display/settings/home-screen/header-bg-img/list/{app_id}', [
    'uses' => 'Display\DisplaySettingsController@getHeaderBackgroundImages',
    'middleware' => 'uAuth'
]);

Route::get('ws/display/settings/home-screen/header-bg-img/delete/{id}', [
    'uses' => 'Display\DisplaySettingsController@deleteHeaderBgImage',
    'middleware' => 'uAuth'
]);

Route::post('ws/display/settings/home-screen/subtabs/save', [
    'uses' => 'Display\DisplaySettingsController@saveSubTabs',
    'middleware' => 'uAuth'
]);

Route::get('ws/display/settings/home-screen/subtabs/list/{app_id}', [
    'uses' => 'Display\DisplaySettingsController@getSubTabList',
    'middleware' => 'uAuth'
]);

Route::get('ws/display/settings/home-screen/get/{tab_id}', [
    'uses' => 'Display\DisplaySettingsController@getIndividualTabSettings',
    'middleware' => 'uAuth'
]);

Route::get('ws/display/settings/home-screen/subtabs/get/{id}', [
    'uses' => 'Display\DisplaySettingsController@getSubTab',
    'middleware' => 'uAuth'
]);

Route::post('ws/display/settings/home-screen/subtabs/sort', [
    'uses' => 'Display\DisplaySettingsController@sortSubTabs',
    'middleware' => 'uAuth'
]);

Route::get('ws/display/settings/home-screen/subtabs/delete/{id}', [
    'uses' => 'Display\DisplaySettingsController@deleteSubTab',
    'middleware' => 'uAuth'
]);

// -----------------------------------------------------------------------------
// -------------------- DISPLAY BACKROUND IMAGES -------------------------------

Route::get('ws/display/background-images/init/{app_id}', [
    'uses' => 'Display\BackgroundImagesController@init',
    'middleware' => 'uAuth'
]);
Route::post('ws/display/background-images/upload-user-image', [
    'uses' => 'Display\BackgroundImagesController@uploadUserImage',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/displaySettings/init/{app_id}', [
    'uses' => 'TabFunctions\DisplaySettingsController@init',
]);
Route::get('ws/display/library/image-list', [
    'uses' => 'Display\BackgroundImagesController@getLibraryImage',
    'middleware' => 'uAuth'
]);

Route::get('ws/display/library/image-list/{cat_id}', [
    'uses' => 'Display\BackgroundImagesController@getAllImageByCat',
    'middleware' => 'uAuth'
]);

Route::post('ws/display/background-images/update', [
    'uses' => 'Display\BackgroundImagesController@updateBckGroundImage',
    'middleware' => 'uAuth'
]);
Route::post('ws/display/background-images/import-lib-images', [
    'uses' => 'Display\BackgroundImagesController@importLibraryImages',
    'middleware' => 'uAuth'
]);

Route::get('ws/display/background-images/remove-home-background-image/{id}/{bgImageType}', [
    'uses' => 'Display\BackgroundImagesController@removeHomeBckImage',
    'middleware' => 'uAuth'
]);
Route::post('ws/display/background-images/save-slider-images', [
    'uses' => 'Display\BackgroundImagesController@saveSliderImages',
    'middleware' => 'uAuth'
]);
Route::post('ws/display/background-images/tabs-background-image', [
    'uses' => 'Display\BackgroundImagesController@saveTabsBackgroundImages',
    'middleware' => 'uAuth'
]);
Route::post('ws/display/background-images/delete-tab-background-image', [
    'uses' => 'Display\BackgroundImagesController@deleteTabBackgroundImage',
    'middleware' => 'uAuth'
]);
Route::post('ws/display/background-images/delete-slider-image', [
    'uses' => 'Display\BackgroundImagesController@deleteSliderImage',
    'middleware' => 'uAuth'
]);
Route::post('ws/display/background-images/delete-user-images', [
    'uses' => 'Display\BackgroundImagesController@deleteUserImages',
    'middleware' => 'uAuth'
]);
Route::get('ws/display/background-images/tab-background-image/{tabId}', [
    'uses' => 'Display\BackgroundImagesController@getTabBackgroundImage',
    'middleware' => 'uAuth'
]);
Route::post('ws/display/background-images/tab-background-flag/save', [
    'uses' => 'Display\BackgroundImagesController@saveTabBackgroundImageFlag',
    'middleware' => 'uAuth'
]);
Route::post('ws/display/background-images/slider/link-tab', [
    'uses' => 'Display\BackgroundImagesController@saveSliderTabLink',
    'middleware' => 'uAuth'
]);

// -----------------------------------------------------------------------------
//QR Coupon Code
Route::get('ws/function/qrCouponCode/init/{tabId}', [
    'uses' => 'TabFunctions\QrCouponCodeController@init',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/qrCouponCode/get/{id}', [
    'uses' => 'TabFunctions\QrCouponCodeController@getItemData',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/qrCouponCode/list/{tabId}', [
    'uses' => 'TabFunctions\QrCouponCodeController@QrCouponsList',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/qrCouponCode/save', [
    'uses' => 'TabFunctions\QrCouponCodeController@saveContent',
    'middleware' => 'uAuth'
]);


Route::post('ws/function/qrCouponCode/sort', [
    'uses' => 'TabFunctions\QrCouponCodeController@sortContent',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/qrCouponCode/delete', [
    'uses' => 'TabFunctions\QrCouponCodeController@deleteCoupon',
    'middleware' => 'uAuth'
]);
//delete image
Route::get('ws/function/qrCouponCode/image/delete/{imageType}/{id}', [
    'uses' => 'TabFunctions\QrCouponCodeController@deleteImage',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/qrCouponCode/download/{code}', [
    'uses' => 'TabFunctions\QrCouponCodeController@downloadCoupon',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/qrCouponCode/generate', [
    'uses' => 'TabFunctions\QrCouponCodeController@qRCodes',
    'middleware' => 'uAuth'
]);
//delete activity
Route::post('ws/function/qrCouponCode/activity/delete', [
    'uses' => 'TabFunctions\QrCouponCodeController@deleteActivity',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/qrCouponCode/viewQRByCode/{code}', [
    'uses' => 'TabFunctions\QrCouponCodeController@viewQRByCode',
    'middleware' => 'uAuth'
]);
//ionic qrcoupon

Route::get('ion/function/qrCouponCode/init/{tabId}', [
    'uses' => 'TabFunctions\QrCouponCodeController@appInit',
]);
Route::get('ion/function/qrCouponCode/info/{id}', [
    'uses' => 'TabFunctions\QrCouponCodeController@getAppItemData',
]);
Route::post('ion/function/qrCouponCode/activity/save', [
    'uses' => 'TabFunctions\QrCouponCodeController@saveActivity',
]);
// Route::get('ion/function/qrCouponCode/scan_count/delete/{id}', [
//     'uses' => 'TabFunctions\QrCouponCodeController@deleteScanCount',
// ]);
//GPS Coupon Code
Route::get('ws/function/gpsCouponCode/init/{tabId}', [
    'uses' => 'TabFunctions\GPSCouponCodeController@init',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/gpsCouponCode/get/{id}', [
    'uses' => 'TabFunctions\GPSCouponCodeController@getItemData',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/gpsCouponCode/list/{tabId}', [
    'uses' => 'TabFunctions\GPSCouponCodeController@GPSCouponsList',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/gpsCouponCode/save', [
    'uses' => 'TabFunctions\GPSCouponCodeController@saveContent',
    'middleware' => 'uAuth'
]);


Route::post('ws/function/gpsCouponCode/sort', [
    'uses' => 'TabFunctions\GPSCouponCodeController@sortContent',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/gpsCouponCode/delete', [
    'uses' => 'TabFunctions\GPSCouponCodeController@deleteCoupon',
    'middleware' => 'uAuth'
]);
//delete image
Route::get('ws/function/gpsCouponCode/image/delete/{imageType}/{id}', [
    'uses' => 'TabFunctions\GPSCouponCodeController@deleteImage',
    'middleware' => 'uAuth'
]);
//ionic 
Route::get('ion/function/gpsCouponCode/init/{tabId}', [
    'uses' => 'TabFunctions\GPSCouponCodeController@appInit',
]);
Route::get('ion/function/gpsCouponCode/info/{id}/{tabId}', [
    'uses' => 'TabFunctions\GPSCouponCodeController@getAppItemData',
]);
Route::post('ion/function/gpsCouponCode/activity/save', [
    'uses' => 'TabFunctions\GPSCouponCodeController@saveActivity',
]);
Route::post('ws/function/gpsCouponCode/activity/delete', [
    'uses' => 'TabFunctions\GPSCouponCodeController@deleteActivity',
    'middleware' => 'uAuth'
]);
Route::get('ion/function/gpsCouponCode/scan_count/delete/{id}', [
    'uses' => 'TabFunctions\GPSCouponCodeController@deleteScanCount',
]);

//*******************************DisplaySettingsGlobalStyle***************

Route::post('ws/display/settings/global-style/save', [
    'uses' => 'Display\GlobalStyleController@save',
    'middleware' => 'uAuth'
]);

Route::get('ws/display/settings/global-style/init/{app_id}', [
    'uses' => 'Display\GlobalStyleController@init',
    'middleware' => 'uAuth'
]);

Route::get('ws/display/settings/header-bg-img/list/{app_id}', [
    'uses' => 'Display\GlobalStyleController@getGlobalHeaderBgImages',
    'middleware' => 'uAuth'
]);

Route::get('ws/display/settings/header-bg-img/delete/{id}', [
    'uses' => 'Display\GlobalStyleController@deleteGlobalHeaderBgImage',
    'middleware' => 'uAuth'
]);

Route::post('ws/display/settings/header-bg-img/save', [
    'uses' => 'Display\GlobalStyleController@uploadGlobalHeaderBgImg',
    'middleware' => 'uAuth'
]);

//Get Single theme
Route::get('ws/display/settings/color-theme/get/{id}', [
    'uses' => 'Display\GlobalStyleController@getSingleThemeData',
    'middleware' => 'uAuth'
]);

//Get Single font
Route::get('ws/display/settings/font-family/get/{id}', [
    'uses' => 'Display\GlobalStyleController@getSingleFontData',
    'middleware' => 'uAuth'
]);

Route::post('ws/display/settings/global-style/individual-tab/save', [
    'uses' => 'Display\GlobalStyleController@saveIndividualTabAppearance',
    'middleware' => 'uAuth'
]);
// delete individual settings
Route::post('ws/display/settings/global-style/individual-tab/delete', [
    'uses' => 'Display\GlobalStyleController@deleteSettings',
    'middleware' => 'uAuth'
]);

// -----------------------------------------------------------------------------
// ---------------------- Tab function - Membership -----------------------
Route::get('ws/function/membership/init/{appId}/{tabId}', [
    'uses' => 'TabFunctions\MembershipController@init',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/membership/group/save', [
    'uses' => 'TabFunctions\MembershipController@saveGroup',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/membership/group/get/{id}', [
    'uses' => 'TabFunctions\MembershipController@getGroupItemData',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/membership/group/list/{tab_id}', [
    'uses' => 'TabFunctions\MembershipController@listGroup',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/membership/group/delete', [
    'uses' => 'TabFunctions\MembershipController@deleteGroup',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/membership/user/save', [
    'uses' => 'TabFunctions\MembershipController@saveUser',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/membership/user/get/{id}', [
    'uses' => 'TabFunctions\MembershipController@getUserItemData',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/membership/user/list/{tab_id}', [
    'uses' => 'TabFunctions\MembershipController@listUser',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/membership/user/delete', [
    'uses' => 'TabFunctions\MembershipController@deleteUser',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/membership/settings/save', [
    'uses' => 'TabFunctions\MembershipController@saveSettings',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/membership/guest/save', [
    'uses' => 'TabFunctions\MembershipController@saveGuest',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/membership/guest/get/{tab_id}', [
    'uses' => 'TabFunctions\MembershipController@guestLoginDetails',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/membership/single-user/get/{tab_id}', [
    'uses' => 'TabFunctions\MembershipController@singleUserLoginDetails',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/membership/single-user/save', [
    'uses' => 'TabFunctions\MembershipController@singleUserLoginDetailsSave',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/membership/user/invite', [
    'uses' => 'TabFunctions\MembershipController@inviteUser',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/membership/emailInviteTemplate/save', [
    'uses' => 'TabFunctions\MembershipController@saveEmailInviteTemplate',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/membership/emailInviteTemplate/get/{tab_id}', [
    'uses' => 'TabFunctions\MembershipController@getEmailInviteTemplate',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/membership/user/register', [
    "as" => "member.register",
    "uses" => 'TabFunctions\MembershipController@memberRegister'
]);
Route::post('ws/function/membership/inviteUser/save', [
    'uses' => 'TabFunctions\MembershipController@memberSave',
    "as" => "member.save"
]);
Route::get('ws/function/membership/user/save-success', [
    "uses" => function () {
        return view('user.member-save-success');
    },
    "as" => "member.member-save-success"
]);

//Ionic Membership
Route::post('ion/function/membership/login', [
    'uses' => 'TabFunctions\MembershipController@login',
]);
Route::post('ion/function/membership/guestlogin', [
    'uses' => 'TabFunctions\MembershipController@guestLogin',
]);


//Events Ionic

Route::get('ion/function/eventsTab/init/{tabId}', [
    'uses' => 'TabFunctions\EventsTabController@appInit',
]);
Route::get('ion/function/eventsTab/info/{id}', [
    'uses' => 'TabFunctions\EventsTabController@getEventData',
]);
Route::post('ion/function/eventsTab/events/comment/save', [
    'uses' => 'TabFunctions\EventsTabController@saveComment',
]);
Route::post('ion/function/eventsTab/events/image/save', [
    'uses' => 'TabFunctions\EventsTabController@saveImages',
]);
Route::post('ion/function/eventsTab/events/going/save', [
    'uses' => 'TabFunctions\EventsTabController@saveGoings',
]);
///font-family tab
Route::get('ion/function/font-family/tab/data', [
    'uses' => 'TabFunctions\FontFamilyTabController@getAllData',
]);
Route::get('ion/function/eventsTab/events/image/{id}', [
    'uses' => 'TabFunctions\EventsTabController@getImageData',
]);

// ----- SOCIAL TAB --------

Route::post('ion/function/social/user/save', [
    'uses' => 'TabFunctions\SocialController@saveSocialUser',
]);

Route::post('ion/function/social/user/updatecount', [
    'uses' => 'TabFunctions\SocialController@updateSocialShareCount',
]);

Route::get('ion/function/social/user/data/{socialMediaId}/{socialMediaType}/{appCode}', [
    'uses' => 'TabFunctions\SocialController@getUserData',
]);

Route::get('ws/function/social/user/list/{appId}/{tabId}', [
    'uses' => 'TabFunctions\SocialController@init',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/social/user/delete', [
    'uses' => 'TabFunctions\SocialController@deleteUser',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/social/user/data/{socialMediaId}/{socialMediaType}/{appCode}', [
    'uses' => 'TabFunctions\SocialController@getUserData',
    'middleware' => 'uAuth'
]);

// -------------------------
// -------------------- TELL FRIEND TAB ---------------------------------

Route::get('ws/function/tell-friend/init/{tabId}', [
    'uses' => 'TabFunctions\TellFriendController@init',
    'middleware' => 'uAuth'
]);

//Push notification

Route::get('ws/function/push-noti/init/{appId}', [
    'uses' => 'TabFunctions\PushNotificationController@init',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/push-noti/save', [
    'uses' => 'TabFunctions\PushNotificationController@save',
    'middleware' => 'uAuth'
]);

Route::get('ion/function/push-noti/init/{appId}/{deviceUUID}/{memberUsername?}', [
    'uses' => 'TabFunctions\PushNotificationController@ionInit',
]);

Route::get('ion/function/subscription-noti/init/{appId}/{deviceUuid}', [
    'uses' => 'TabFunctions\PushNotificationController@subscriptionInit',
]);

Route::post('ion/function/subscribe-status/save', [
    'uses' => 'TabFunctions\PushNotificationController@saveSubscribeStatus',
]);

Route::get('ws/function/push-noti/users/{appId}/{groupId}', [
    'uses' => 'TabFunctions\PushNotificationController@getUserByGroupId',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/push-noti/delete', [
    'uses' => 'TabFunctions\PushNotificationController@deleteNoti',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/push-noti/history/get/{appId}', [
    'uses' => 'TabFunctions\PushNotificationController@getHistory',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/push-noti/get-located-users', [
    'uses' => 'TabFunctions\PushNotificationController@getLocatedAppUsers',
    'middleware' => 'uAuth'
]);

// ----------------------------------------------------------------------
// ---------- APP BUILD --------------

Route::get('ws/function/app/build/data/{appId}', [
    'uses' => 'Apps\CreateController@getAppBuildData',
]);


// -----------------------------------
//Music Tab
//save settings
Route::post('ws/function/website/musicSettings/save/{tab_id}', [
    'uses' => 'TabFunctions\MusicController@saveSettings',
    'middleware' => 'uAuth'
]);

//Upload phone, tablet header image
Route::post('ws/function/music/uploadImage/', [
    'uses' => 'TabFunctions\MusicController@uploadHeaderImage',
    'middleware' => 'uAuth'
]);

//init
Route::get('ws/function/music/init/{tabId}', [
    'uses' => 'TabFunctions\MusicController@init',
    'middleware' => 'uAuth'
]);

//Add/Edit Music Track
Route::post('ws/function/music/save/', [
    'uses' => 'TabFunctions\MusicController@save',
    'middleware' => 'uAuth'
]);

//Get Single Music Track
Route::get('ws/function/music/get/{id}', [
    'uses' => 'TabFunctions\MusicController@getItemData',
    'middleware' => 'uAuth'
]);

//List Music Tracks
Route::get('ws/function/music/list/{tabId}/{type?}', [
    'uses' => 'TabFunctions\MusicController@ListTracks',
    'middleware' => 'uAuth'
]);

//delete Music Track
Route::post('ws/function/music/delete', [
    'uses' => 'TabFunctions\MusicController@deleteTrack',
    'middleware' => 'uAuth'
]);

//sort Music Track
Route::post('ws/function/music/sort', [
    'uses' => 'TabFunctions\MusicController@sortTracks',
    'middleware' => 'uAuth'
]);

Route::get('ion/function/music-tab/init/{tabId}/{type?}', [
    'uses' => 'TabFunctions\MusicController@init',
]);

Route::get('ion/function/music-tab/get/{id}', [
    'uses' => 'TabFunctions\MusicController@getItemData',
]);

Route::post('ion/function/music-tab/save', [
    'uses' => 'TabFunctions\MusicController@saveComment',
]);

//Loyalty Tab
//init
Route::get('ws/function/loyalty/init/{tabId}', [
    'uses' => 'TabFunctions\LoyaltyController@init',
    'middleware' => 'uAuth'
]);

Route::get('ion/function/loyalty/app/init/{tabId}/{appId}/{deviceUuid}', [
    'uses' => 'TabFunctions\LoyaltyController@appInit',
]);
Route::get('ion/function/loyalty/activity/list/{item_id}', [
    'uses' => 'TabFunctions\LoyaltyController@getLoyaltyActivity',
]);
Route::get('ion/function/adv/loyalty/activity/list/{item_id}', [
    'uses' => 'TabFunctions\LoyaltyController@getAdvLoyaltyActivity',
]);
Route::post('ion/function/loyalty/activity/save', [
    'uses' => 'TabFunctions\LoyaltyController@saveLoyaltyActivity',
]);
Route::post('ion/function/loyalty/stamp_activity/save', [
    'uses' => 'TabFunctions\LoyaltyController@insertLoyaltyStampActivity',
]);
Route::post('ion/function/loyalty/stamp_activity/clear', [
    'uses' => 'TabFunctions\LoyaltyController@clearLoyaltyStampActivity',
]);
Route::post('ion/function/advanced/loyalty/activity/save', [
    'uses' => 'TabFunctions\LoyaltyController@saveAdvLoyaltyActivity',
]);
Route::post('ion/function/advanced/loyalty/perk/redeem/save', [
    'uses' => 'TabFunctions\LoyaltyController@onPerkRedeem',
]);
Route::get('ion/function/loyalty/stamp_count/delete/{id}', [
    'uses' => 'TabFunctions\LoyaltyController@deleteStampCount',
]);
//delete 
Route::post('ws/function/loyalty/delete', [
    'uses' => 'TabFunctions\LoyaltyController@deleteItem',
    'middleware' => 'uAuth'
]);
//sort 
Route::post('ws/function/loyalty/sort', [
    'uses' => 'TabFunctions\LoyaltyController@sortList',
    'middleware' => 'uAuth'
]);

//Get Single item
Route::get('ws/function/loyalty/get/{id}', [
    'uses' => 'TabFunctions\LoyaltyController@getItemData',
    'middleware' => 'uAuth'
]);


//delete advanced loyalty
Route::post('ws/function/loyalty/advanced/delete', [
    'uses' => 'TabFunctions\LoyaltyController@deleteAdvancedItem',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/loyalty/advanced/get/{id}', [
    'uses' => 'TabFunctions\LoyaltyController@getAdvItemData',
    'middleware' => 'uAuth'
]);

Route::get('ion/function/loyalty/get/{id}/{appId}/{deviceUuid}', [
    'uses' => 'TabFunctions\LoyaltyController@getAppItemData',
]);

Route::post('ws/function/loyalty/save', [
    'uses' => 'TabFunctions\LoyaltyController@saveLoyalty',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/advanced/loyalty/save', [
    'uses' => 'TabFunctions\LoyaltyController@saveAdvancedLoyalty',
    'middleware' => 'uAuth'
]);

//delete loyalty image
Route::get('ws/function/loyalty/image/delete/{imageType}/{id}', [
    'uses' => 'TabFunctions\LoyaltyController@deleteLoyaltyImage',
    'middleware' => 'uAuth'
]);

//delete advance loyalty image
Route::get('ws/function/advanced/loyalty/image/delete/{imageType}/{id}', [
    'uses' => 'TabFunctions\LoyaltyController@deleteAdvLoyaltyImage',
    'middleware' => 'uAuth'
]);
//delete advanced activity
Route::post('ws/function/advanced/loyalty/activity/delete', [
    'uses' => 'TabFunctions\LoyaltyController@deleteAdvancedActivity',
    'middleware' => 'uAuth'
]);
//delete activity
Route::post('ws/function/loyalty/activity/delete', [
    'uses' => 'TabFunctions\LoyaltyController@deleteActivity',
    'middleware' => 'uAuth'
]);

//delete perk image
Route::get('ws/function/loyalty/perk/delete/{imageType}/{id}', [
    'uses' => 'TabFunctions\LoyaltyController@deletePerkImage',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/loyalty/perk/get/{id}', [
    'uses' => 'TabFunctions\LoyaltyController@getPerkList',
    'middleware' => 'uAuth'
]);
Route::get('ion/function/loyalty/perk/get/{id}', [
    'uses' => 'TabFunctions\LoyaltyController@getPerkList',
]);

//search music from iTunes
Route::post('ws/function/music/search/iTunes', [
    'uses' => 'TabFunctions\MusicController@searchFromItunes',
    'middleware' => 'uAuth'
]);
//import tracks from iTunes
Route::post('ws/function/music/import/iTunesTrack', [
    'uses' => 'TabFunctions\MusicController@importItunesTrack',
    'middleware' => 'uAuth'
]);
//import music from 7Digital
Route::post('ws/function/music/import/7Digital', [
    'uses' => 'TabFunctions\MusicController@importFrom7Digital',
    'middleware' => 'uAuth'
]);

//Route::get('ws/function/music/import/7Digital/{oauth_consumer_key}/{oauth_nonce}/{oauth_signature_method}/{oauth_timestamp}/{oauth_version}/{oauth_signature}', [
//    'uses' => 'TabFunctions\MusicController@importFrom7Digital',
//    'middleware' => 'uAuth'
//
//]);
//get country list for itunes
Route::get('ws/function/music/isoCountryList', [
    'uses' => 'TabFunctions\MusicController@isoCountryList',
    'middleware' => 'uAuth'
]);

//Register Device
Route::post('ion/app/register-device', [
    'uses' => 'Apps\CreateController@registerDevice',
]);
//Increment Push Noti Count
Route::post('ion/app/increment-push-noti-count', [
    'uses' => 'Apps\CreateController@increasePushNotiCount',
]);

//-------------------------------------------NEWS TAB----------------------------------------
//init
Route::get('ws/function/news/init/{tabId}', [
    'uses' => 'TabFunctions\NewsController@init',
    'middleware' => 'uAuth'
]);
//get Feeds
Route::post('ion/function/news/feeds', [
    'uses' => 'TabFunctions\NewsController@getNewsFeed',
]);
//Add/Edit news keywords
Route::post('ws/function/news/save/', [
    'uses' => 'TabFunctions\NewsController@save',
    'middleware' => 'uAuth'
]);


//------------------------------------ Client Permission -----------------------------------------
//Add/Edit theme setings
Route::post('ws/function/clientPermission/save', [
    'uses' => 'Master\ClientPermissionController@saveClientPermission',
    'middleware' => 'uAuth'
]);

//Add/Edit header navigation
Route::post('ws/function/clientPermission/navigation/header/save', [
    'uses' => 'Master\ClientPermissionController@headerNavigationSave',
    'middleware' => 'uAuth'
]);
//Add/Edit footer navigation
Route::post('ws/function/clientPermission/navigation/footer/save', [
    'uses' => 'Master\ClientPermissionController@footerNavigationSave',
    'middleware' => 'uAuth'
]);
//delete header navigation
Route::get('ws/function/clientPermission/navigation/header/delete/{index}', [
    'uses' => 'Master\ClientPermissionController@headerNavigationDelete',
    'middleware' => 'uAuth'
]);
//delete footer navigation
Route::get('ws/function/clientPermission/navigation/footer/delete/{columnType}/{index}', [
    'uses' => 'Master\ClientPermissionController@footerNavigationDelete',
    'middleware' => 'uAuth'
]);
//get themes
Route::get('ws/function/clientPermission/themes', [
    'uses' => 'Master\ClientPermissionController@ThemeList',
    'middleware' => 'uAuth'
]);
//get languages
Route::get('ws/function/clientPermission/languages', [
    'uses' => 'Master\ClientPermissionController@ClientLanguages',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/clientPermission/init/{appId}', [
    'uses' => 'Master\ClientPermissionController@init',
    'middleware' => 'uAuth'
]);
//get images
Route::get('ws/function/clientPermission/images/{type}', [
    'uses' => 'Master\ClientPermissionController@ClientImages',
    'middleware' => 'uAuth'
]);
//upload image
Route::post('ws/function/clientPermission/imageUpload/', [
    'uses' => 'Master\ClientPermissionController@uploadClientImage',
    'middleware' => 'uAuth'
]);
//delete image
Route::get('ws/function/clientPermission/image/delete/{id}', [
    'uses' => 'Master\ClientPermissionController@deleteImage',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/clientPermission/defaultCmsSettings', [
    "uses" => 'Master\ClientPermissionController@defaultCmsSettings',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/clientPermission/saveDefaultSetting', [
    "uses" => 'Master\ClientPermissionController@updateDefaultCmsSettings',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/clientPermission/updateCmsImages', [
    "uses" => 'Master\ClientPermissionController@updateCmsImages',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/clientPermission/removeLoginBgImage/{appId}', [
    "uses" => 'Master\ClientPermissionController@removeLoginBgImage',
    'middleware' => 'uAuth'
]);


//------------------------------------ Newsletter -------------------

Route::post('ws/function/newsletter/category/create', [
    'uses' => 'TabFunctions\NewsLetterController@saveCategory',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/newsletter/category/delete', [
    'uses' => 'TabFunctions\NewsLetterController@deleteCategory',
    'middleware' => 'uAuth'
]);


Route::get('ws/function/newsletter/category/get/{id}', [
    'uses' => 'TabFunctions\NewsLetterController@getCategoryItemData',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/newsletter/category/list/{tabId}', [
    'uses' => 'TabFunctions\NewsLetterController@categoryList',
    'middleware' => 'uAuth'
]);

//Ionic list Categories
Route::get('ion/function/newsletter/category/list/{tabId}', [
    'uses' => 'TabFunctions\NewsLetterController@categoryList',
]);

//Ionic Newsletter Users
Route::post('ion/function/newsletter/user/save', [
    'uses' => 'TabFunctions\NewsLetterController@saveUsers',
]);

//Newsletter Settings
Route::post('ws/function/newsletter/settings/save', [
    'uses' => 'TabFunctions\NewsLetterController@saveSettings',
    'middleware' => 'uAuth'
]);

//ionic get Newsletter Settings
Route::get('ion/function/newsletter/settings/get/{tabId}', [
    'uses' => 'TabFunctions\NewsLetterController@getSettings',
]);

//Newsletter init
Route::get('ws/function/newsletter/init/{tabId}', [
    'uses' => 'TabFunctions\NewsLetterController@init',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/newsletter/image/delete/{id}', [
    'uses' => 'TabFunctions\NewsLetterController@deleteThumbnail',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/newsletter/download/Csv/{tabId}', [
    'uses' => 'TabFunctions\NewsLetterController@downloadCSV',
    'middleware' => 'uAuth'
]);

//upload users to mailchimp
Route::post('ws/function/newsletter/user/upload/mailChimp', [
    'uses' => 'TabFunctions\NewsLetterController@uploadUsersMailChimp',
    'middleware' => 'uAuth'
]);

//get IContact Account Details
Route::post('ws/function/newsletter/iContact/accountId', [
    'uses' => 'TabFunctions\NewsLetterController@getIContactAccountDetails',
    'middleware' => 'uAuth'
]);
//get IContact Folder Id
Route::post('ws/function/newsletter/iContact/folderId', [
    'uses' => 'TabFunctions\NewsLetterController@getIContactClientFolderId',
    'middleware' => 'uAuth'
]);
//get IContact Lists
Route::post('ws/function/newsletter/iContact/lists', [
    'uses' => 'TabFunctions\NewsLetterController@getIContactLists',
    'middleware' => 'uAuth'
]);
//upload users to iContact
Route::post('ws/function/newsletter/user/upload/iContact', [
    'uses' => 'TabFunctions\NewsLetterController@uploadUsersIconnect',
    'middleware' => 'uAuth'
]);

//get mailchimp and iconnect account data
Route::get('ws/function/newsletter/accounts/get/{tabId}', [
    'uses' => 'TabFunctions\NewsLetterController@getAccountData',
]);

// Language tab

Route::get('ws/function/language-tab/init/{tabId}', [
    'uses' => 'TabFunctions\LanguageController@init',
    'middleware' => 'uAuth'
]);
Route::get('ion/function/language-tab/init/{tabId}', [
    'uses' => 'TabFunctions\LanguageController@init',
]);

Route::post('ws/function/language-tab/save/{tabId}', [
    'uses' => 'TabFunctions\LanguageController@save',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/language-tab/delete', [
    'uses' => 'TabFunctions\LanguageController@daleteLanguage',
    'middleware' => 'uAuth'
]);

/// app language translation 

Route::post('ws/app/tab/translation', [
    'uses' => 'Apps\AppsTabController@translation',
    'middleware' => 'uAuth'
]);

// --------------- CRON URLs ---------------------------------
// For scheduled push notifcations
Route::get('ws/cron/push', [
    'uses' => 'TabFunctions\PushNotificationController@sendScheduledPushNotification'
]);

// -----------------------------------------------------------
//---------------- Customer Setting -------------------
// init data
Route::get('ws/function/CustomerPortal/setting/init/{appId}', [
    'uses' => 'CustomerPortal\CustomerSettingController@init',
    'middleware' => 'uAuth'
]);

// save AppConfig settings
Route::post('ws/function/CustomerPortal/setting/save', [
    'uses' => 'CustomerPortal\CustomerSettingController@saveAppConfig',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/CustomerPortal/membershipsettings/save', [
    'uses' => 'CustomerPortal\CustomerSettingController@saveMembership',
    'middleware' => 'uAuth'
]);

//---------------- Customer Promote -------------------

Route::get('ws/function/CustomerPortal/promote/init/{appId}', [
    'uses' => 'CustomerPortal\CustomerPromoteController@init',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/CustomerPortal/promote/download/qr', [
    'uses' => 'CustomerPortal\CustomerPromoteController@downloadQr',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/CustomerPortal/promote/save', [
    'uses' => 'CustomerPortal\CustomerPromoteController@save',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/CustomerPortal/promote/pdf', [
    'uses' => 'CustomerPortal\CustomerPromoteController@getPdf',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/CustomerPortal/promote/upload/image', [
    'uses' => 'CustomerPortal\CustomerPromoteController@uploadPromoteImage',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/CustomerPortal/promote/delete/image/{id}/{type}', [
    'uses' => 'CustomerPortal\CustomerPromoteController@deletePromoteImage',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/CustomerPortal/promote/download/bg/image', [
    'uses' => 'CustomerPortal\CustomerPromoteController@downloadBgImage',
    'middleware' => 'uAuth'
]);

//User Profile Settings
Route::post('ion/function/user/profile/save', [
    'uses' => 'CustomerPortal\CustomerSettingController@saveUserSettings',
]);
Route::get('ion/function/user/profile/get/{id}/{deviceUUID}', [
    'uses' => 'CustomerPortal\CustomerSettingController@getUserInfo',
]);

Route::get('ion/function/user/profile/image/delete/{imageType}/{id}', [
    'uses' => 'CustomerPortal\CustomerSettingController@deleteUserImage',
]);


//---------------- Customer Submitted Data -------------------

Route::get('ws/function/CustomerPortal/SubmittedData/init/{appId}', [
    'uses' => 'CustomerPortal\CustomerSubmittedDataController@init',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/CustomerPortal/SubmittedData/formEntry/{currentPage?}/{perPage?}/{formId}', [
    'uses' => 'CustomerPortal\CustomerSubmittedDataController@listEmailFormEntriesForSubmittedData',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/CustomerPortal/email-forms-fields/downloadPdf/{formId}', [
    'uses' => 'CustomerPortal\CustomerSubmittedDataController@downloadPdf',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/CustomerPortal/email-forms-fields/statistics/getDaydata/{formId}/{year}/{month}/{day}', [
    'uses' => 'CustomerPortal\CustomerSubmittedDataController@getDayData',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/CustomerPortal/email-forms-fields/statistics/getMonthData/{formId}/{year}/{month}', [
    'uses' => 'CustomerPortal\CustomerSubmittedDataController@getMonthData',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/CustomerPortal/email-forms-fields/statistics/getYearData/{formId}/{year}', [
    'uses' => 'CustomerPortal\CustomerSubmittedDataController@getYearData',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/CustomerPortal/email-forms-fields/statistics/getBetweenTwoDateData/{formId}', [
    'uses' => 'CustomerPortal\CustomerSubmittedDataController@getBetweenTwoDateData',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/CustomerPortal/SubmittedData/MailingList/{currentPage?}/{perPage?}/{appId}', [
    'uses' => 'CustomerPortal\CustomerSubmittedDataController@listMailingListForSubmittedData',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/CustomerPortal/SubmittedData/MailingList/deleteUser', [
    'uses' => 'CustomerPortal\CustomerSubmittedDataController@deleteUser',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/CustomerPortal/SubmittedData/MailingList/downloadCsv/{appId}', [
    'uses' => 'CustomerPortal\CustomerSubmittedDataController@downloadCsvEmailList',
    'middleware' => 'uAuth'
]);
//upload users to mailchimp
Route::post('ws/function/CustomerPortal/user/upload/mailChimp', [
    'uses' => 'TabFunctions\NewsLetterController@uploadUsersMailChimpSubmittedData',
    'middleware' => 'uAuth'
]);
//get mailchimp and iconnect account data
Route::get('ws/function/CustomerPortal/accounts/get/{appId}', [
    'uses' => 'TabFunctions\NewsLetterController@getAccountDataByAppId',
]);
//get IContact Lists
Route::post('ws/function/CustomerPortal/iContact/lists', [
    'uses' => 'TabFunctions\NewsLetterController@getIContactListsByAppId',
    'middleware' => 'uAuth'
]);
//upload users to iContact
Route::post('ws/function/CustomerPortal/user/upload/iContact', [
    'uses' => 'TabFunctions\NewsLetterController@uploadUsersIconnectByAppId',
    'middleware' => 'uAuth'
]);
//update autoMatic Upload Setting
Route::post('ws/function/CustomerPortal/update/uploadSetting', [
    'uses' => 'TabFunctions\NewsLetterController@updateAutomaticSetting',
    'middleware' => 'uAuth'
]);

// --------------- Activity Log -------------------
//Save Launch App Activity 
Route::get('ws/app/activity/saveLaunchApp/{appId}', [
    'uses' => 'Apps\AppController@saveAppLaunchActivity',
    'middleware' => 'uAuth',
]);

//Get Activity List
Route::get('ws/app/activity/getActivityList/{currentPage?}/{perPage?}', [
    'uses' => 'Apps\AppController@getActivityList',
    'middleware' => 'uAuth',
]);
//Get App Activity List
Route::get('ws/app/activity/getAppActivityList/{currentPage?}/{perPage?}/{appId}', [
    'uses' => 'Apps\AppController@getAppActivityList',
    'middleware' => 'uAuth',
]);

// --------------- Customer Email Marketting -------------------
Route::post('ion/function/CustomerPortal/emailMarketting/saveUser/email/{appCode}', [
    'uses' => 'CustomerPortal\CustomerPromoteController@saveUserEmail',
]);
Route::post('ws/function/CustomerPortal/emailMarketting/deleteUser/email', [
    'uses' => 'CustomerPortal\CustomerPromoteController@deleteUserEmail',
]);
//upload users to mailchimp
Route::post('ws/function/CustomerPortal/emailMarketting/user/upload/mailChimp', [
    'uses' => 'CustomerPortal\CustomerPromoteController@uploadUsersMailChimpEmailMarketing',
    'middleware' => 'uAuth'
]);
//upload users to iContact
Route::post('ws/function/CustomerPortal/emailMarketting/user/upload/iContact', [
    'uses' => 'TabFunctions\NewsLetterController@uploadUsersIconnectEmailMarketing',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/CustomerPortal/emailMarketting/downloadCsv/{appId}', [
    'uses' => 'CustomerPortal\CustomerPromoteController@downloadCsvMarketingList',
    'middleware' => 'uAuth'
]);

//----------------------User Activity-------------------
//get init
Route::get('ws/function/CustomerPortal/userActivity/init/{appId}', [
    'uses' => 'CustomerPortal\CustomerPromoteController@getUserActivityInit',
    'middleware' => 'uAuth'
]);
// delete users on the basis of devices
Route::post('ws/function/CustomerPortal/userActivity/deleteUser', [
    'uses' => 'CustomerPortal\CustomerPromoteController@deleteDevicesBasisUsers',
]);

//Get App Analytics
Route::post('ws/function/AppAnalytics/init', [
    'uses' => 'Apps\AnalyticsController@init',
    'middleware' => 'uAuth'
]);

// Save app session request coming from ionic app.
Route::post('ion/app/session/save', [
    'uses' => 'Apps\AnalyticsController@saveAppSession',
]);

// Save tab session request coming from ionic app.
Route::post('ion/app/tab/session/save', [
    'uses' => 'Apps\AnalyticsController@saveTabSession',
]);


//----------------------IPA REQUEST (DEVELOPER DASHBOSRD)-------------------
Route::get('ws/function/IpaRequest/init/{currentPage?}/{perPage?}/{type}', [
    'uses' => 'Apps\CreateController@getAllIpaTabletRequest',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/IpaRequest/download/screenShot/{appId}', [
    'uses' => 'Apps\CreateController@downloadScreenShotImages',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/IpaRequest/done/request/{id}', [
    'uses' => 'Apps\CreateController@markDoneIpaRequest',
    'middleware' => 'uAuth'
]);
Route::post('ws/function/IpaRequest/send/email', [
    'uses' => 'Apps\CreateController@sendQueryResponseEmail',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/IpaRequest/getById/{id}', [
    'uses' => 'Apps\CreateController@getRequestByAppId',
    'middleware' => 'uAuth'
]);
Route::get('ws/function/appPublish/history/{app_id}', [
    'uses' => 'Apps\CreateController@getAppPublishistoryByAppId',
    'middleware' => 'uAuth'
]);

//------------------- Clean data Base tables --------------------
Route::get('/database/clear/tables', [
    'uses' => 'Apps\CreateController@cleanDatabase',
]);

Route::post('ws/create/group', [
    'uses' => 'UserController@createGroups',
]);
Route::post('ws/create/developer/user', [
    'uses' => 'UserController@createDeveloperUser',
]);

// Static
Route::get('privacy-policy', function () {
    return view('static.privacy-policy');
});

Route::get('ws/app/prepare/{app_id}', [
    'uses' => 'Apps\CreateController@prepareAppForIOS',
    'middleware' => 'uAuth',
]);

// Admin User save
Route::post('ws/user/save', [
    'uses' => 'UserController@saveUser',
    'middleware' => 'uAuth',
]);

// Admin user list
Route::get('ws/user/list', [
    'uses' => 'UserController@getAdminUsers',
    'middleware' => 'uAuth',
]);

// Admin user get
Route::get('ws/user/get/{id}', [
    'uses' => 'UserController@getUserDetail',
    'middleware' => 'uAuth',
]);

//App tab title translation 
Route::get('ws/app/tab/translation/{id}', [
    'uses' => 'Apps\AppsTabController@getAppTabTranslation',
    'as' => 'app.tab.translation'
]);

// ---------------------------------- Editor Uploads -------------------------------

Route::post('ws/editor/upload/{uploadType}/{appID?}', [
    'uses' => 'Apps\EditorUploadController@upload',
    'middleware' => 'uAuth'
]);

Route::get('ws/editor/upload/load-images/{appID}', [
    'uses' => 'Apps\EditorUploadController@loadImages',
    'middleware' => 'uAuth'
]);

// ---------------------------------------------------------------------------------
// -------------------------------------- TAB FUNCTION SHOPPING CART --------------------------------------

Route::get('ws/function/shopping-cart/init/{tabID}', [
    'uses' => 'TabFunctions\ShoppingCartController@init',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/settings/save/{tabID}', [
    'uses' => 'TabFunctions\ShoppingCartController@saveSettings',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/payment/save', [
    'uses' => 'TabFunctions\ShoppingCartController@savePayment',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/payment/tax/save', [
    'uses' => 'TabFunctions\ShoppingCartController@saveTaxDetails',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/payment/tax/delete', [
    'uses' => 'TabFunctions\ShoppingCartController@deleteTaxDetails',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/delivery/save', [
    'uses' => 'TabFunctions\ShoppingCartDeliveryController@save',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/delivery/shipping-charge/save', [
    'uses' => 'TabFunctions\ShoppingCartDeliveryController@saveShippingCharge',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/delivery/shipping-charge/delete/{tabID}', [
    'uses' => 'TabFunctions\ShoppingCartDeliveryController@deleteShippingCharges',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/delivery/blocked-country/save', [
    'uses' => 'TabFunctions\ShoppingCartDeliveryController@saveBlockedCountry',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/delivery/blocked-country/delete', [
    'uses' => 'TabFunctions\ShoppingCartDeliveryController@deleteBlockedCountries',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/inventory/settings/save', [
    'uses' => 'TabFunctions\ShoppingCartInventoryController@saveSettings',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/inventory/category/save', [
    'uses' => 'TabFunctions\ShoppingCartInventoryController@saveCategory',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/inventory/item/save', [
    'uses' => 'TabFunctions\ShoppingCartInventoryController@saveItem',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/inventory/delete', [
    'uses' => 'TabFunctions\ShoppingCartInventoryController@deleteInventory',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/inventory/category/images/add', [
    'uses' => 'TabFunctions\ShoppingCartInventoryController@addCategoryImages',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/shopping-cart/inventory/category/images/list/{appID}', [
    'uses' => 'TabFunctions\ShoppingCartInventoryController@getCategoryImagesList',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/inventory/item/images/add', [
    'uses' => 'TabFunctions\ShoppingCartInventoryController@addItemImages',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/shopping-cart/inventory/item/images/list/{appID}', [
    'uses' => 'TabFunctions\ShoppingCartInventoryController@getItemImagesList',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/inventory/sort', [
    'uses' => 'TabFunctions\ShoppingCartInventoryController@sortCategoriesAndItems',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/shopping-cart/inventory/item/get/{id}', [
    'uses' => 'TabFunctions\ShoppingCartInventoryController@getItemDetails',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/inventory/category/image/delete', [
    'uses' => 'TabFunctions\ShoppingCartInventoryController@deleteCategoryImage',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/shopping-cart/inventory/item/image/delete', [
    'uses' => 'TabFunctions\ShoppingCartInventoryController@deleteItemImage',
    'middleware' => 'uAuth'
]);

Route::get('ion/function/shopping-cart/init/{tabID}', [
    'uses' => 'TabFunctions\ShoppingCartController@appInit',
    'middleware' => 'uAuth'
]);

Route::get('ion/function/shopping-cart-items/inventoryItems/{id}', [
    'uses' => 'TabFunctions\ShoppingCartInventoryController@inventoryItems',
    'middleware' => 'uAuth'
]);

Route::get('ion/function/shopping-cart/currency-items', [
    'uses' => 'TabFunctions\ShoppingCartController@currencyItems',
    'middleware' => 'uAuth'
]);

Route::get('ion/function/shopping-cart/inventory/item/get/{id}', [
    'uses' => 'TabFunctions\ShoppingCartInventoryController@getItemDetails',
    'middleware' => 'uAuth'
]);

// --------------------------------------------------------------------------------------------------------
// -------------------------------------- TAB FUNCTION FOOD ORDERING --------------------------------------

Route::get('ws/function/food-ordering/init/{tabID}', [
    'uses' => 'TabFunctions\FoodOrderingController@init',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/settings/save/{tabID}', [
    'uses' => 'TabFunctions\FoodOrderingController@saveSettings',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/food-ordering/contact/info/{id}', [
    'uses' => 'TabFunctions\FoodOrderingController@getContactSingleData',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/locationInfo/save', [
    'uses' => 'TabFunctions\FoodOrderingLocationsController@saveLocationInfo',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/food-ordering/locationInfo/getLocationData/{tabID}', [
    'uses' => 'TabFunctions\FoodOrderingLocationsController@getLocationData',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/food-ordering/locationInfo/getLocationHoursData/{id}', [
    'uses' => 'TabFunctions\FoodOrderingLocationsController@getLocationHoursData',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/locationInfo/location/delete', [
    'uses' => 'TabFunctions\FoodOrderingLocationsController@deleteFoodLocation',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/services/save', [
    'uses' => 'TabFunctions\FoodOrderingServicesController@save',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/payment/save', [
    'uses' => 'TabFunctions\FoodOrderingController@savePayment',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/payment/tax/save', [
    'uses' => 'TabFunctions\FoodOrderingController@saveTaxDetails',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/payment/tax/delete', [
    'uses' => 'TabFunctions\FoodOrderingController@deleteTaxDetails',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/email/item/save', [
    'uses' => 'TabFunctions\FoodOrderingEmailController@saveEmailFood',
    'middleware' => 'uAuth'
]);

Route::get('ion/function/food-ordering/init/{tabID}/{deviceUUID?}', [
    'uses' => 'TabFunctions\FoodOrderingController@appInit',
]);

Route::get('ion/function/food-ordering/location/list/{tabID}', [
    'uses' => 'TabFunctions\FoodOrderingLocationsController@getLocationList',
]);

Route::get('ion/function/food-ordering/location/hours/{id}', [
    'uses' => 'TabFunctions\FoodOrderingLocationsController@getLocationHoursList',
]);

Route::get('ion/function/food-ordering/currency-items', [
    'uses' => 'TabFunctions\FoodOrderingController@currencyItems',
]);

Route::post('ws/function/food-ordering/menu/settings/save', [
    'uses' => 'TabFunctions\FoodOrderingMenuController@saveSettings',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/menu/sort', [
    'uses' => 'TabFunctions\FoodOrderingMenuController@sortCategoriesAndItems',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/menu/delete', [
    'uses' => 'TabFunctions\FoodOrderingMenuController@deleteMenu',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/food-ordering/category/item/get/{id}', [
    'uses' => 'TabFunctions\FoodOrderingMenuController@getItemDetails',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/food-ordering/menu/category/images/list/{appID}', [
    'uses' => 'TabFunctions\FoodOrderingMenuController@getCategoryImagesList',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/food-ordering/menu/item/images/list/{appID}', [
    'uses' => 'TabFunctions\FoodOrderingMenuController@getItemImagesList',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/menu/category/save', [
    'uses' => 'TabFunctions\FoodOrderingMenuController@saveCategory',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/menu/category/images/add', [
    'uses' => 'TabFunctions\FoodOrderingMenuController@addCategoryImages',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/menu/item/images/add', [
    'uses' => 'TabFunctions\FoodOrderingMenuController@addItemImages',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/menu/item/image/delete', [
    'uses' => 'TabFunctions\FoodOrderingMenuController@deleteItemImage',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/menu/category/image/delete', [
    'uses' => 'TabFunctions\FoodOrderingMenuController@deleteCategoryImage',
    'middleware' => 'uAuth'
]);

Route::post('ws/function/food-ordering/menu/item/save', [
    'uses' => 'TabFunctions\FoodOrderingMenuController@saveItem',
    'middleware' => 'uAuth'
]);

Route::get('ion/function/food-ordering/menu/category/list/{tabID}/{locationID}', [
    'uses' => 'TabFunctions\FoodOrderingMenuController@getCategoriesForApp',
]);

Route::get('ion/function/food-ordering/menu/item/list/{categoryID}/{locationID}', [
    'uses' => 'TabFunctions\FoodOrderingMenuController@getItemsForApp',
]);

Route::get('ion/function/food-ordering/menu/item/get/{id}', [
    'uses' => 'TabFunctions\FoodOrderingMenuController@getItemDetailsForApp',
]);

Route::post('ion/function/food-ordering/order/add', [
    'uses' => 'TabFunctions\FoodOrderingController@addOrder',
]);

Route::get('ion/function/food-ordering/pastOrders/list/{tabID}/{deviceUUID}', [
    'uses' => 'TabFunctions\FoodOrderingController@getPastOrders',
]);

// --------------------------------------------------------------------------------------------------------
//----------------------Qadir Code Start------------------------------//

Route::get('ws/app/serverkey/{app_id}', [
    'uses' => 'Apps\AppController@getServerId',
    'middleware' => 'uAuth',
]);

Route::post('ws/app/serverkey/save', [
    'uses' => 'Apps\AppController@saveServerKey',
    'middleware' => 'uAuth',
]);

Route::post('ws/function/shopping-cart/email/item/save', [
    'uses' => 'TabFunctions\ShoppingCartEmailController@saveEmailCart',
    'middleware' => 'uAuth'
]);
Route::get('ws/app/tab/icon/colorsection/{currentPage?}', [
    'uses' => 'Master\IconController@getColorIconsSection',
    'middleware' => 'uAuth',
]);
Route::post('ws/app/tab/icon/savecolorsection', [
    'uses' => 'Master\IconController@savecolorsection',
    'middleware' => 'uAuth'
]);
Route::get('ws/app/tab/icon/deletecoloricon/{id}', [
    'uses' => 'Master\IconController@deleteColorIcon',
    'middleware' => 'uAuth',
]);
Route::get('ws/app/tab/icon/photosiconsection/{currentPage?}', [
    'uses' => 'Master\IconController@getPhotosIconsSection',
    'middleware' => 'uAuth',
]);
Route::post('ws/app/tab/icon/savephotosiconsection', [
    'uses' => 'Master\IconController@savePhotosIconSection',
    'middleware' => 'uAuth'
]);
Route::get('ws/app/tab/icon/deletephotosicon/{id}', [
    'uses' => 'Master\IconController@deletePhotosIcon',
    'middleware' => 'uAuth',
]);

//----------------------Qadir Code End------------------------------//

Route::get('ws/app/location/list/{app_id}', [
    'uses' => 'TabFunctions\PushNotificationController@getLocationsByAppId',
    'middleware' => 'uAuth',
]);


//------------------- Paymet form view------------------------//

Route::get('ion/payment/form/{appCode}/{language}/{desc}/{total_price}', [
    'uses' => 'Apps\AppController@getPaymentForm',
]);

Route::get('ion/payment/spreedly-success', [
    'uses' => 'Apps\AppController@onSpreedlyPaymentMethodAdd',
    'as' => 'spreedly-success'
]);

Route::post('ion/payment/make-payment', [
    'uses' => 'Apps\AppController@makePayment',
]);

//--------------- Gate Access Tab -------------------//

Route::get('ws/function/gate-access/init/{tabId}', [
    'uses' => 'TabFunctions\GateAccessController@init',
    'middleware' => 'uAuth'
]);

//------------ transactions api's --------------

Route::get('ws/transaction/init/{currentPage?}/{perPage?}/{appId}', [
    'uses' => 'TabFunctions\FoodOrderingController@foodOrdersInit',
    'middleware' => 'uAuth'
]);

Route::get('ws/transaction/orders/{currentPage?}/{perPage?}/{tabId}', [
    'uses' => 'TabFunctions\FoodOrderingController@foodOrdersByTabId',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/food-orders/menu/category/list/{tabID}', [
    'uses' => 'TabFunctions\FoodOrderingController@getCategories',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/food-orders/menu/items/list/{tabID}', [
    'uses' => 'TabFunctions\FoodOrderingController@getItems',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/food-orders/item/detail/{itemId}', [
    'uses' => 'TabFunctions\FoodOrderingController@getItemDetails',
    'middleware' => 'uAuth'
]);

//delete Food Order Track
Route::post('ws/transaction/food-orders/delete', [
    'uses' => 'TabFunctions\FoodOrderingController@foodOrderDelete',
    'middleware' => 'uAuth'
]);

Route::get('ws/function/food-orders/downloadCsv/{tabId}/{type}', [
    'uses' => 'TabFunctions\FoodOrderingController@downloadCSV',
    'middleware' => 'uAuth'
]);
Route::post('ws/transaction/food-orders/edit', [
    'uses' => 'TabFunctions\FoodOrderingController@editFoodOrder',
    'middleware' => 'uAuth'
]);
