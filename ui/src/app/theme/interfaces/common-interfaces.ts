export interface APIResponse {
    success?: boolean;
    data?: any;
    message?: any;
    session?: boolean;
}

export interface Tab {
    id?: number;
    app_id?: number;
    title: string;
    tab_func_id?: number;
    tab_func_name?: string;
    tab_func_code?: string;
    active?: boolean;
    icon_name?: string;
    status?: number | boolean;
    icon_image?: File | string;
    settings?: string;
    icon_type?: number | boolean;
}

export interface Website {
    id?: number;
    tab_id?: number;
    name: string;
    url: string;
    is_donation_request: boolean | number;
    is_printing_allowed?: boolean | number;
    use_safari_webview?: boolean | number;
    thumbnail: File | string; // File when it is being submitted, string when it is being retrieved.
}


export interface PhoneNumber {
    id?: number;
    tab_id?: number;
    title: string;
    phone: string;
}

export interface PDF {
    id?: number;
    tab_id?: number;
    name: string;
    section?: string;
    url?: string;
    is_printing_allowed?: boolean | number;
    file_name?: string;
    pdf?: File;
}

export interface WebsiteTabSettings {
    show_nav_bar: boolean;
}

export interface MenuCategory {
    id?: number;
    tab_id?: number;
    name: string;
    section?: string;
    status?: number | boolean;
}

export interface Direction {
    id?: number;
    tab_id?: number;
    title: string;
    m_long: string;
    m_lat: string;
}

export class MenuItem {
    public id: number = null;
    public menu_id: number = null;
    public use_global_colors: boolean | number = true;
    public background_color: string = "#fafafa";
    public text_color: string = "#000";
    public name: string = "";
    public description: string = "";
    public price: number = null;
    public status: boolean | number = true;
}

export class ContactLocation {
    public id: number = null;
    public tab_id: number = null;
    public address_sec_1: string = "";
    public address_sec_2: string = "";
    public website: string = "";
    public email_id: string = "";
    public telephone: string = "";
    public m_lat: number = null;
    public m_long: number = null;
    public m_distance_type: number = distanceTypeMile;
    public left_image: File | string = null;
    public right_image: File | string = null;
    public is_left_right_image_enabled: boolean | number = 0;
}

export class DirectionLocation {
    public id: number = null;
    public tab_id: number = null;
    public m_lat: number = null;
    public m_long: number = null;

}

export const distanceTypeMile: number = 1;
export const distanceTypeKilometer: number = 2;

export class AppsTab implements Tab {
    public id: number = null;
    public app_id: number = null;
    public title: string = "";
    public tab_func_id: number = null;
    public tab_func_name: string = "";
    public tab_func_code: string = "";
    public active: boolean = false;
    public icon_name: string = "";
    public status: number | boolean = false;
    public icon_image: File | string = null;
    public settings: string = "";
}

export class OpeningTime {
    public id: number = null;
    public contact_id: number = null;
    public day_name: string = '';
    public open_from: string = '';
    public open_to: string = '';
}

export class TpComment {
    public id: number = null;
    public comment: string = '';
    public other_info: string = '';
    public created_at: string = '';
}

export class ContactComment extends TpComment {
    public contact_id: number = null;
}

export class ContentItem {
    public id: number = null;
    public use_global_colors: boolean | number = true;
    public background_color: string = "#fafafa";
    public text_color: string = "#000";
    public phone_header_image: File | string = null;
    public tablet_header_image: File | string = null;
    public description: string = "";
    public add_header_and_comment: boolean | number = true;
    public phone_header_image_url: string = null;
    public is_header_required: boolean | number = false;
}

export class ContentTabOneItem extends ContentItem {
    public tab_id: number = null;
}

export class ContentTabTwoItem extends ContentItem {
    public tab_id: number = null;
    public name: string = null;
    public section: string = null;
    public thumbnail: string = null;
    public status: number | boolean = true;
}

export class ContentTabThreeItem extends ContentItem {
    public category_id: number = null;
    public name: string = null;
    public section: string = null;
    public thumbnail: string = null;
    public status: number | boolean = true;
}

export class ContentTabThreeCategory {
    id: number = null;
    tab_id: number = null;
    name: string = '';
    section: string = '';
    thumbnail: string = '';
    status: number | boolean = true;
}


export interface Comment {
    id?: number;
    tab_id?: number;
    name: string;
    description: string;
}

export interface Around {
    id?: number;
    tab_id?: number;
    name: string;
    information: string;
    website: string;
    m_long: number;
    m_lat: number;
    distance_type: number;
    email_id: string;
    telephone: number;
    image: File | string;
    around_us_id: number;
}

export class AroundUsItem implements Around {
    public id: number = null;
    tab_id: number;
    public name: string = '';
    public information: string = '';
    public website: string = '';
    public m_long: number = null;
    public m_lat: number = null;
    public distance_type: number = distanceTypeMile;
    public email_id: string = '';
    public telephone: number = null;
    public image: File | string = null;
    public around_us_id: number = null;
}

export interface AroundUsCategory {
    id?: number;
    tab_id?: number;
    category_name: string;
    color: string;
}

export class AroundUsTabCategory implements AroundUsCategory {
    public id: number = null;
    public tab_id: number = null;
    public category_name: string = '';
    public color: string = '';
}

export class VoiceRecordingTabItem {
    public id: number = null;
    public tab_id: number = null;
    public email_id: string = null;
    public subject: string = null;
    public description: string = null;
}

export const imageServiceTypeCustom: number = 1;
export const imageServiceTypeFlickr: number = 2;
export const imageServiceTypePicasa: number = 3;
export const imageServiceTypeInstagram: number = 4;

export const galleryTypeGrid: number = 1;
export const galleryTypeCoverFlow: number = 2;

export const imageDescriptionYes: number = 1;
export const imageDescriptionNo: number = 2;

export const importTypeFacebook: number = 1;
export const importTypeWebsite: number = 2;

export class ImageServiceType {
    public tab_id: number = null;
    public image_service_type: number = imageServiceTypeCustom;
    public instagram_user_name: string = null;
}

export class PictureGalleryTabItem {
    public id: number = null;
    public tab_id: number = null;
    public name: string = null;
    public thumbnail: File | string = null;
    public gallery_type: number = galleryTypeGrid;
    public image_description: number = imageDescriptionNo;
    public image: FileList = null;
}

export class GalleryPictureData {
    public id: number = null;
    public gallery_id: number = null;
    public image: File | string = null;
    public description: string = "";
}

export class ImportGalleryData {
    public tab_id: number = null;
    public fbUrl: string = null;
    public webUrl: string = null;
    public importTypeService: number = importTypeFacebook;
}

export class FBPageData {
    public fbPageUrl: string = null;
    public accessKey: string = null;
}

export class FBAlbumList {
    public id: number = null;
    public name: string = "";
    public count: number = null;
}

export class SubmitedFBAlbumList {
    public tab_id: number = null;
    public album_ids: string[] = [];
    public accessKey: string = null;

}

//Inbox Tab Settings

export interface InboxSettings {
    id?: number;
    tab_id?: number;
    hide_msg_tab: boolean;
    msg_center_shortcut: boolean;
    subscription_service: boolean;
    icon_location: number | boolean;
    icon_opacity: number;
}

export class InboxTabSettings implements InboxSettings {
    public id: number = null;
    public tab_id: number = null;
    public msg_center_shortcut: boolean = false;
    public subscription_service: boolean = false;
    public icon_location: number = icon_location_left;
    public icon_opacity: number = 0;
    public hide_msg_tab: boolean = false;

}

export const icon_location_left: number = 1;
export const icon_location_right: number = 2;

//Inbox Subscription
export interface InboxSubscription {
    id?: number;
    tab_id?: number;
    subscription_name: string;
}

export class InboxTabSubscription implements InboxSubscription {
    public id: number = null;
    public tab_id: number = null;
    public subscription_name: string = "";
    public subscribers: number = 0;
}

/*********************CALENDER AND EVENTS TAB ************************************/
/**Event settings */
export interface EventsSettings {
    populate_events?: boolean;
    weeks: number;
    sort_by: number | boolean;

}

export class Settings implements EventsSettings {
    public populate_events: boolean = false;
    public weeks: number = 1;
    public sort_by: number = sort_by_time;

}

export const sort_by_time: number = 1;
export const sort_by_manual: number = 2;

/**SINGLE EVENTS */
export interface Events {
    id?: number;
    tab_id?: number;
    phone_header_image: File | string;
    tablet_header_image: File | string;
    event_start_date: Date;
    event_end_date: Date;
    timezone_id: number;
    name: string;
    status: number | boolean;
    description: string;
    imported_location: boolean | number;
    is_header_required: boolean | number;
    location_id: number;
    address_sec_1: string;
    address_sec_2: string;
    m_lat: string;
    m_long: string;
}

export class EventsList implements Events {
    public id: number = null;
    public tab_id: number = null;
    public timezone_id: number;
    public phone_header_image: File | string = null;
    public tablet_header_image: File | string = null;
    public event_start_date: any = new Date();
    public event_end_date: any = new Date();
    public name: string = "";
    public description: string = "";
    public imported_location: boolean | number = false;
    public is_header_required: boolean | number = false;
    public address_sec_1: string = "";
    public status: boolean | number = true;
    public location_id: number = null;
    public address_sec_2: string = "";
    public m_long: any = 80.946166;
    public m_lat: any = 26.846694;
    public phone_header_image_url: string = null;


}

// SIngle Events Comments
export class EventsComment {
    id: number;
    tab_id: number;
    event_id: number;
    comment: string;
    user_id: number;
    name: string;
}

export class TimeZone {
    id: number;
    name: string;
    offset: number;
    offset_name: string;
}

//SIngle Events Goings
export class EventsGoings {
    id: number;
    tab_id: number;
    name: string;
    event_id: number;
    user_id: number;
}

export class ImageList {
    id: number;
    tab_id: number;
    event_id: number;
    image: FileList | string;
    caption: string;
}

/**RECURRING EVENTS */
export class RecurringEvents {
    id: number;
    tab_id: number;
    phone_header_image: File | string;
    tablet_header_image: File | string;
    phone_header_image_url: string = null;
    start_time: string;
    end_date: Date = new Date();
    timezone_id: number = null;
    name: string;
    status: number | boolean;
    description: string;
    imported_location: boolean | number = false;
    location_id: number;
    address_sec_1: string;
    address_sec_2: string;
    m_lat: any = 80.946166;
    m_long: any = 26.846694;
    repeat_event: number | boolean = 1;
    duration: string;
    day_of_week: string[] | string = ['Sunday'];
    repeat_date: Date = new Date();
    is_header_required: boolean | number = false;

}

// ---------------- EMAIL FORMS TAB ----------------------------
export class EmailForm {
    id: number = null;
    tab_id: number = null;
    email: string = null;
    subject: string = null;
    title: string = "Untitled Form";
    description: string = "This is your form description. Click here to edit.";
    success_msg: string = "Success! Your submission has been saved!";
    error_msg: string = "You have not filled up required fields. Please check your input again.";
    submit_button_label: string = "Submit";
    back_button_label: string = "Back";
    status: number | boolean = true;
}

export const emailFormStatusEnabled: number = 1;
export const emailFormStatusDisabled: number = 2;

export class FormField {
    id: number = null;
    field_type_id: number = null;
    form_id: number = null;
    properties: any = {};
}

export class FieldType {
    id: number;
    name: string;
}

export const formFieldTypes = {
    SINGLE_LINE_TEXT: 1,
    NUMBER: 2,
    PARAGRAPH_TEXT: 3,
    CHECKBOXES: 4,
    MULTIPLE_CHOICES: 5,
    DROPDOWN: 6,
    NAME: 7,
    DATE: 8,
    TIME: 9,
    PHONE: 10,
    ADDRESS: 11,
    WEBSITE: 12,
    PRICE: 13,
    EMAIL: 14,
    SECTION_BREAK: 15,
    FILE_UPLOAD: 16
};

export class DeletedField {
    id: number;

}

export class EmailFormData {
    form_id: number = null;
    form_values: any[] = [];
}

// ---------------------------------------------------------------

//AppDisplayMobile

export class AppDisplayMobile {
    id: number = null;

}

export class HomeScreenSettings {
    id: number = null;
    app_id: number = null;
    layout: any = {};
    extra_buttons: any = {};
    subtabs: any = {};
    header: any = {};
    buttons: any = {};
    icon_color: any = {};
}

export class HomeScreenLayout {
    show_status_bar: boolean = true;
    home_layout: number = 3;
    traditional_position: number = 2;
    traditional_rows: number = 1;
    traditional_tab_number: number = 4;
}

export class HomeScreenIconColor {
    show_icon: boolean = true;
    icon_color: string = null;
    enable_color: boolean = false;
}

export class HomeScreenButtons {
    background_tint: string = "#fff";
    show_text: boolean = true;
    text_color: string = "#000";
    background_img: number = null;
    background_opacity: number = 100;
}

export class HomeScreenSubTab {
    id: number = null;
    app_id: number = null;
    title: string = null;
    text_color: string = "#000";
    text_color_shadow: string = "#fff";
    tab_id: number = null;
    active: boolean | number = true;
    homescreen_only: boolean | number = false;
    icon_name: string = null;
    icon_image: File = null;
    sort_order: number;
    external_url: string;
}

export class HomeScreenHeader {
    background_tint: string = "#000";
    background_opacity: number = 100;
    background_img: number = null;
}

export class HomeScreenExtraButtons {
    direction: boolean | number = false;
    call_us: boolean | number = false;
    tell_friend: boolean | number = false;
}

export class SubTabSettings {
    show_on_tablet: boolean | number = false;
}

//-------------------QRCOUPON TAB------------------------

export class QrCoupons {
    id: number;
    tab_id: number;
    phone_header_image: File | string;
    tablet_header_image: File | string;
    end_date: Date;
    start_date: Date;
    coupon_name: string;
    qr_code: string;
    coupon_reuse: number | boolean = false;
    timezone_id: number;
    check_in_target: number = 1;
    hours_before_checkin: number = null;
    coupon_status: number | boolean = true;
    is_header_required: number | boolean = false;
    description: string;
    qr_coupon_code: string = '';
    phone_header_image_url: string = null;

}

//-------------------GPSCOUPON TAB------------------------

export class GpsCoupons {
    id: number;
    tab_id: number;
    phone_header_image: File | string;
    tablet_header_image: File | string;
    end_date: Date;
    start_date: Date;
    coupon_name: string;
    location_id: number;
    coupon_reuse: number | boolean = false;
    timezone_id: number;
    check_in_target: number = 1;
    hours_before_checkin: number;
    coupon_status: number | boolean = true;
    description: string;
    radius: number = 0.5;
    radius_unit: string[] | string = ['1'];
    phone_header_image_url: string = null;
    is_header_required: number | boolean = false;
}

//---------------Display Settings Global Style-------------------------

export class GlobalStyleSettings {
    id: number = null;
    app_id: number = null;
    header: any = {};
    lists: any = {};
    fonts: any = {};
    features: any = {};
    individual_tabs: any = {};
    blur_effect: any = {};
}

export class GlobalStyleHeader {
    background_color: string = "#000";
    background_opacity: number = 100;
    text_color: string = "#fff";
    shadow: string = "#000";
    background_img: number = null;
}

export class GlobalStyleFonts {
    font_id: number = 7;
}

export class GlobalStyleLists {
    section_bar: string = "#000";
    section_text: string = "#fff";
    row_bar: string = "#000";
    row_text: string = "#fff";
    even_row_bar: string = "#000";
    even_row_text: string = "#fff";
    color_theme_id: number = null;
}

export class GlobalStyleFeatures {
    button_text: string = "#fff";
    button_image: string = "#000";
    feature_text: string = "#000";
    background_color: string = "#fff";

}

export class GlobalStyleBlurEffect {
    id: number | boolean = false;
}

export class GlobalStyleIndividualTabs {
    id: number = null;
    tab_id: number = null;
    header: any = {};
    buttons: any = {};
    icon_color: any = {};
    color: any = {};
}

export class IndividualTabsButtons {
    background_tint: string = "#fff";
    show_text: boolean = true;
    text_color: string = "#000";
    background_opacity: number = 100;
    background_img: number = null;

}

export class IndividualTabIconColor {
    show_icon: boolean = true;
    icon_color: string = "#000";
}

export class IndividualTabHeader {
    background_color: string = "#000";
    background_opacity: number = 100;
    text_color: string = "#fff";
    shadow: string = "#000";
    background_img: number = null;
}

export class IndividualTabColor {
    section_bar: string = "#000";
    section_text: string = "#fff";
    row_bar: string = "#000";
    row_text: string = "#fff";
    even_row_bar: string = "#000";
    even_row_text: string = "#fff";
    color_theme_id: number = null;
}

export class TabData implements Tab {
    public id: number = null;
    public app_id: number = null;
    public type: number = null;
    public title: string = "";
    public tab_func_id: number = null;
    public active: boolean = false;
    public icon_name: string = "";
    public status: number | boolean = false;
    public icon_image: File | string = null;
}

export class MembershipSettings {
    public login_color: string = "#000";
    public member_login: boolean = false;
    public guest_login: boolean = false;
    public type: number = 2;
}

export class SingleMemberLoginDetails {
    public user_name: string = null;
    public password: string = null;
}

export class OnSubmitSettingsData {
    public tab_id: number = null;
    public membsershipSettings: MembershipSettings = null;
    public singleMemberLoginDetails: SingleMemberLoginDetails = null;
}

export class MultipleUserList {
    public id: number = null;
    public user_name: string = null;
    public group_name: string = null;
    public group_color: string = '#fff';
}

export const appAccessTypeSingle: number = 2;
export const appAccessTypeMultiple: number = 3;

export class GroupList {
    public id: number = null;
    public tab_id: number = null;
    public group_name: string = null;
    public group_color: string = "#fff";
    public tabs_access: any[] = [];
}

export class AppTabs {
    public id: number = null;
    public title: string = null;
}

export class UserData {
    public id: number = null;
    public tab_id: number = null;
    public user_name: string = null;
    public email: string = null;
    public password: string = null;
    public password_confirmation: string = null;
    public group_id: number = 0;
    public tabs_access: any[] = [];
    public login_type: number = appAccessTypeMultiple;
}

export class GuestData {
    public id: number = null;
    public tab_id: number = null;
    public user_name: string = 'Guest Login';
    public tabs_access: any[] = [];
}

export class SingleUserTabAccessData {
    public id: number = null;
    public tab_id: number = null;
    public tabs_access: any[] = [];
}

export class OnSubmitInviteEmailTemplateData {
    public tab_id: number = null;
    public content: string = null;
}

export class InviteUserFormData {
    public tab_id: number = null;
    public csv_emails: File = null;
    public email: string = null;
    public from_email: string = null;
    public group_id: number = 0;
}

export class AppData {
    public id: any;
    public app_name: string;
    public app_code: string;
    public icon_name: File = null;
    public phone_splash_screen: string = null;
    public tablet_splash_screen: string = null;
    public iphone_splash_screen: string = null;
    public username: string;
    public password: string;
    public app_icon_name: string;
    public contact_email: string;
    public contact_phone: string;
    public client_name: string;
    public client_email: string;
    public client_phone: number;
    public label: string;
    public ios_app_store_url: string;
    public ios_app_store_id: string;
    public google_play_store_url: string;
    public html5_mobile_website_url: string;
    public apple_credit_used: boolean;
    public code_version: any;
    public created_at: any;
    public created_by: any;
    public source_app_id: any;
    public updated_at: any;
    public keywords: string = null;
    public description: string = null;
    public new_info: string = null;
    public copyright: string = null;
    public category: string;
    public price: string;
    public language: string;
    public disable_comment: any = false;
    public audio_bg_play: any = false;
    public google_plus_id: string = null;

}

export class AppScreenShot {
    public id: any;
    public app_id: string;
    public type: number = null;
    public screen_shot_1: string = null;
    public screen_shot_2: string = null;
    public screen_shot_3: string = null;
    public screen_shot_4: string = null;
    public screen_shot_5: string = null;
}

export class AppPublish {
    public id: any;
    public app_id: string;
    public apple_user_name: string = null;
    public apple_password: string = null;
    public apple_dev_name: string = null;
    public android_product: any = false;
    public tab_product: any = false;
    public iphone_product: any = false;
    public instruction: string = null;
    public update_type: number | boolean = null;
    public email: string = null;

}

export const send_on: number = 0;
export const send_now: number = 1;

export class PushNotification {
    public id: any;
    public app_id: number;
    public tab_id: number = null;
    public timezone_id: number = null;
    public span: number = 16;
    public user_group_id: any[] = null;
    public subscription_id: any[] = null;
    public user_id: any[] = [];
    public content_type: number = 0;
    public android_type: any = false;
    public iphone_type: any = false;
    public facebook_type: any = false;
    public twitter_type: any = false;
    public send_now: any = send_now;
    public message: any;
    public website_url: string = null;
    public active: string = null;
    public send_on_date: string = null;
    public m_long: any = -95.712891;
    public m_lat: any = 37.090240;
    public span_type: string = "Km";
    public audience: number = 1; // All users
    public location_type: number = 1; // Point
}

export class QrImgGenerationData {
    public urls: any[] = [];
}

export class Loyalty {
    public id: any;
    public tab_id: number = null;
    public secret_code: string = null;
    public thumbnail: string = null;
    public reward_text: string = null;
    public square_count: any = 1;
    public is_advance: number = null;
    public issue_freebie_loyalty: any = false;
    public freebie_text: string = 'Congratulations. You have just received a FREE loyalty reward for downloading this application!';
    public view_type: number = 1;
    public gauge_display: number = 1;
    public phone_header_image: string = null;
    public tablet_header_image: string = null;
    public phone_header_image_url: string = null;
    public is_header_required: number | boolean = false;
}

export class AdvancedLoyalty {
    public id: number = null;
    public tab_id: number = null;
    public secret_code: string = null;
    public thumbnail: File | string = null;
    public loyalty_title: string = null;
    public stamp_award_amount: number = 1;
    public instruction: string = null;
    public perk_unit_type: any = null;
    public perk_unit: any = null;
    public no_of_perks: number = 1;
    public earn_credit: any = false;
    public push_accept_award: number = 0;
    public is_advance: number = null;
    public perkData: LoyaltyPerk[] = [];
}

export class LoyaltyPerk {
    public id: any;
    public loyalty_id: number = null;
    public title: string = null;
    public description: string = null;
    public points: number = null;
    public reuse_perk: any = false;
    public perk_thumbnail: File | string = null;
    public gauge_icon: File | string = null;

}

/**************************************News Tab **************************************/
export class News {
    public id: number;
    public tab_id: number;
    public google_keywords: string = "";
    public twitter_keywords: string = "";
    public facebook_keywords: string = "";
    public show_news_home: number = 0;
}

/**************************************Music Tab **************************************/

export interface MusicTabSettings {
    home_screen_widget?: boolean;
    widget_location: number | boolean;
    icon_opacity: number;
    phone_header_image: string;
    tablet_header_image: string;
}

export class MusicSetting implements MusicTabSettings {
    public home_screen_widget: boolean = false;
    public widget_location: number = widget_location_left;
    public icon_opacity: number = 100;
    public phone_header_image: string = "";
    public tablet_header_image: string = "";
}

export const widget_location_left: number = 1;
export const widget_location_right: number = 2;

export interface MusicHeaderImageSetting {
    phone_header_image: File | string;
    tablet_header_image: File | string;
}

export class MusicHeaderImage implements MusicHeaderImageSetting {
    public phone_header_image: File | string = null;
    public tablet_header_image: File | string = null;
}

export interface Musics {
    id?: number;
    tab_id?: number;
    track_file: File | string;
    track_url: string;
    artist: string;
    album: string;
    title: string;
    is_for_android: number | boolean;
    is_active_iphone: number | boolean;
    purchase_url: string;
    description: string;
    art_file: File | string;
    art_url: string;

}

export class MusicsList implements Musics {
    public id: number = null;
    public tab_id: number = null;
    public track_file: File | string = null;
    public track_url: string = "";
    public artist: string = "";
    public album: string = "";
    public title: string = "";
    public is_for_android: number | boolean = false;
    public is_active_iphone: number | boolean = true;
    public purchase_url: string = "";
    public description: string = "";
    public art_file: File | string = "";
    public art_url: string = "";

}

export class ImportFromItune {
    public tab_id: number = 0;
    public search_by: string = "";
    public keyword: string = null;
    public album_url: string = null;
    public country_id: number = 0;
}

/**************************************Music end **************************************/


/*****************************  MobileViewComponent  **************************/

export class BackgroundImageSetting {
    public tabId: number = 0;
    public appId: number = 0;
    public flag_phone_img: number | boolean = false;
    public flag_tablet_img: number | boolean = false;
    public flag_iphone_img: number | boolean = false;
}

/**
 * Mailing List Tab
 */
export class MailingList {
    public id: number;
    public tab_id: number;
    public description: string;
    public prompt_action: boolean | number = false;
    public automatic_upload: boolean | number = false;
    public image_file: File | string = null;
    public image_file_url: string = null;

}

export class MailingListCategory {
    public id: number;
    public tab_id: number;
    public name: string;
}

/**
 * Language Tab
 */
export class Language {
    public id: number = null;
    public name: string = "";
    public code: string = "";
}

export class LanguageData {
    public content: Language[] = [];
}

/**
 * Mailing List Mail Chimp
 */
export class MailChimp {
    public tabId: number;
    public appId: number;
    public apiKey: string;
    public listId: number;

}

export class IContact {
    public tabId: number = null;
    public appId: number = null;
    public application_id: string = null;
    public user_name: string = null;
    public app_password: string = null;
    public account_id: number = null;
    public client_folder_id: number = null;
    public listId: number = null;
}

/**
 * Dashboard
 */
export class DashboardActivities {
    public id: number;
    public app_id: number;
    public activity: string;
    public activity_type: number;
    public created_at: string;
}

export const activityType = {
    LOGIN: 1,
    NOTIFICATION: 2,
    APP_PUBLISH: 3
};

export class AppAnalyticsSelectorData {
    public app_id: number;
    public start_date: string;
    public end_date: string;
    public app_type: number;
}

export class IpaRequestEmailData {
    public email_type: number = 1;//1=>for Query 2=> response
    public client_email: string = null;
    public email_body: string = null;
    public subject: string = null;
    public app_name: string = null;
}

export class IpaRequest {
    public id: number = null;
    public app_id: number = null;
    public app_code: string = null;
    public app_name: string = null;
    public apple_dev_name: string = null;
    public apple_password: string = null;
    public apple_user_name: string = null;
    public created_at: Date = null;
    public email: string = null;
    public instruction: string = null;
    public ipa_request_status: number = null;
    public iphone_product: number = null;
    public tab_product: number = null;
    public update_type: number = null;
    public ios_app_version: number = null;
}

export interface ShoppingCartPayment {
    id: number;
    tab_id: number;
    currency: number;
    payment_gateway: number;
    payment_gateway_credentials: AuthorizeNetCredentials | PaypalCredentials | StripeCredentials;
    is_cash: number;
}

export class ShoppingCartPaymentTaxDetails {
    id: number;
    payment_id: number;
    tax_name: string;
    tax_method: number = 1;
    tax_value: number;
}

export class AuthorizeNetCredentials {
    api_login_id: string;
    transaction_key: string;
}

export class PaypalCredentials {
    api_username: string;
    api_password: string;
    signature: string;
}

export class StripeCredentials {
    api_secret_key: string;
}

export interface ShoppingCartDelivery {
    id: number;
    tab_id: number;
    is_pickup_method: boolean;
    pickup_title: string;
    pickup_confirmation_message: string;
    is_digital_method: boolean;
    digital_title: string;
    is_shipping_method: boolean;
    shipping_title: string;
    shipping_minimum: number;
    free_shipping_amount: number;
    shipping_days: number;
    is_shipping_fee_taxable: boolean;
    is_delivery_address_validation: boolean;
}

export class ShoppingCartShippingCharge {
    id: number;
    tab_id: number;
    country: string;
    price: number;
}

export class ShoppingCartBlockedCountry {
    id: number;
    tab_id: number;
    country: string;
}

export class ShoppingCartInventoryCategory {
    id: number;
    tab_id: number;
    name: string;
    image: string;
    image_url: string;
    status: number = 1;
}

export class ShoppingCartInventoryItem {
    id: number;
    category_id: number;
    name: string;
    description: string;
    price: number = 0;
    inventory: number = 50;
    is_tax_exempted: boolean = false;
    status: number = 1;
}

export class ShoppingCartInventoryItemSize {
    id: number;
    item_id: number;
    title: string;
    price: number;
}

export class ShoppingCartInventoryItemOption {
    id: number;
    item_id: number;
    title: string;
    charges: number;
}

export class PushNotificationKeyId {
    id: number;
    app_id: number;
    server_key: string;
    sender_id: string;
}

export class ShoppingCartInventoryItemImage {
    id: number;
    item_id: number;
    image: string;
    is_primary: number;
    image_url: string;
}

export class ShoppingCartEmailCustomerConfirmation {
    id: number;
    tab_id: number;
    subject: string;
    type: number;
    template: string;
}

export class ShoppingCartEmailAdminReceipt {
    id: number;
    tab_id: number;
    admin_email: string;
    subject: string;
    type: number;
    template: string;
}

export class ShoppingCartCustomGuides {
    id: number;
    tab_id: number;
    shipping_method: string;
    pickup_method: string;
    digital_method: string;
    card: string;
    cash: string;
    order_items_list_template: string;
}

export class ColorIconNewAdd {
    public image: FileList = null;
}

export class PhotosIconNewAdd {
    public image: FileList = null;
}

export interface InventoryImage {
    name: string;
    url: string;
}

export interface ServicesInfo {
    tab_id: number;
    dine_in: number;
    take_out: number;
    take_out_days: number;
    delivery: number;
    delivery_days: number;
    delivery_address_validation: number;
    delivery_radius: number;
    delivery_radius_type: string;
    delivery_minimum: number;
    delivery_price_fee: number;
    delivery_price_fee_taxable: number;
    free_delivery_amount: number;
    lead_time: number;
    convenience_fee: number;
    convenience_fee_taxable: number;
}

export interface FoodOrderingPayment {
    id: number;
    tab_id: number;
    currency: number;
    payment_gateway: number;
    payment_gateway_credentials: AuthorizeNetCredentials | PaypalCredentials | StripeCredentials;
    is_cash: number;
    is_card: number;
}

export class FoodOrderingPaymentTaxDetails {
    id: number;
    tax_name: string;
    tax_method: number = 1;
    tax_value: number;
    tab_id: number;
}

export class FoodOrderingEmailCustomerConfirmation {
    id: number;
    tab_id: number;
    subject: string;
    type: number;
    template: string;
}

export class FoodOrderingEmailAdminReceipt {
    id: number;
    tab_id: number;
    admin_email: string;
    subject: string;
    type: number;
    template: string;
}

export class FoodOrderingCustomGuides {
    id: number;
    tab_id: number;
    shipping_method: string;
    pickup_method: string;
    digital_method: string;
    card: string;
    cash: string;
    order_items_list_template: string;
}

export class FoodLocationInfo {
    tab_id: number;
    is_custom_timezone: number;
    timezone_id: number;
    is_imported_locations: number;
    imported_location_id: number;
    address_section_1: string;
    address_section_2: string;
    latitude: string;
    longitude: string;
    distance_type: number;
    emails: string;
}

export class FoodOrderingLocationsHours {
    id: number;
    location_id: number;
    day: string;
    status: boolean;
    timings: Array<FoodOrderingLocationsHoursTimings>;
}

export class FoodOrderingLocationsHoursTimings {
    id: number;
    start_time_hour: string;
    start_time_minute: string;
    end_time_hour: string;
    end_time_minute: string;
    option: number;
}

export class FoodOrderingMenuCategory {
    id: number;
    tab_id: number;
    name: string;
    image: string;
    image_url: string;
    status: number = 1;
}

export class FoodOrderingMenuItem {
    id: number;
    category_id: number;
    name: string;
    description: string;
    price: number = 0;
    image: string;
    image_url: string;
    is_tax_exempted: boolean = false;
    status: number = 1;
}

export class FoodOrderingMenuItemSize {
    id: number;
    item_id: number;
    title: string;
    price: number;
}

export class FoodOrderingMenuItemImage {
    id: number;
    image: string;
    image_url: string;
}

export interface MenuImage {
    name: string;
    url: string;
}

export class FoodOrderingMenuItemOption {
    id: number = null;
    type_id: number = null;
    status: boolean = true;
    title: string = null;
    charges: number = 0;
    is_allow_qty: number = 0;
    max_qty: string = 'Unlimited';
}

export class FoodOrderingMenuOptionType {
    id: number = null;
    item_id: number = null;
    title: string = '';
    status: boolean = true;
    is_required: number = null;
    amount: number = null;
    optionTypeRequired: Array<typeOptionRequiredDropDown> = [];
    options: Array<FoodOrderingMenuItemOption> = [];
}

export class typeOptionRequiredDropDown {
    label: number = null;
    value: number = null;
}

export class AvailabilityInfo {
    location_id: number;
    availability_type: number;
    availableHours: Array<AvailableMenuItemHours>;
}

export class AvailableMenuItemHours {
    id: number;
    day: string;
    status: boolean;
    timings: Array<AvailableMenuItemHoursTimings>;
}

export class AvailableMenuItemHoursTimings {
    id: number;
    start_time_hour: string;
    start_time_minute: string;
    end_time_hour: string;
    end_time_minute: string;
}

export class GateAccessData {
    public id: number = null;
    public tab_id: number = null;
    public email_id: string = "";
    public banner_image: File | string = null;
}

export class FoodOrdersSearch {
    public title: string = "";
    public location: number = -1;
    public type: number = 4;
    public states: number = 4;
    public status: number = 3;
}

export const orderingServiceType = {
    CUSTOM: 1,
    MYCHECK: 2,
    IMENU360: 3,
    OLO: 4,
    EAT24: 5,
    GRUBHUB: 6,
    SEAMLESS: 7,
    ONOSYS: 8
};
export class Address {
    id: number = null;
    locationName: string;
    addressLine: string;
    zip: string;
    apartment: string;
    firstName: string;
    lastName: string;
    phone: number;
    email: string;
    created_at: string = null;
    body: string = "";
}
export class FoodOrder {
    id: number;
    tab_id: number;
    location_id: number;
    tip: Tip = new Tip();
    total_price: number = 0;
    tax_list: { tax: FoodOrderingTax, amount: number }[] = [];
    total_charges: number = 0;
    payment_method: number = paymentMethod.CARD;
    contact: Address = new Address();
    type: number;
    convenience_fee: number;
    delivery_charges: number;
    free_delivery_amount: number;
    delivery_price_fee_taxable: number | boolean;
    convenience_fee_taxable: number | boolean;
    order_status: number;
    paid_status: number;
    datetime: string;
    items: CartItem[];
    shipping_instructions: string;
    is_email_receipt: boolean = true;
    device_uuid: string;
}

export class Tip {
    amount: number;
    percent: number;
}

export interface FoodOrderingTax {
    id: number;
    tab_id: number;
    tax_method: number;
    tax_name: string;
    tax_value: number;
}

export const paymentMethod = {
    CASH: 1,
    CARD: 2
};
export class CartItem {
    id: number;
    item_id: number;
    item_name: string;
    item_price: number;
    item_image: string;
    quantity: number = 1;
    size: FoodOrderingItemSize;
    options: { option: FoodOrderingItemOption, quantity: number }[];
    notes: string;
    total_price: number;
    is_tax_exempted: boolean;
}
export interface FoodOrderingItemSize {
    id: number;
    item_id: number;
    title: string;
    price: number;
}
export interface FoodOrderingItemOption {
    id: number;
    type_id: number;
    title: string;
    charges: number;
    is_allow_qty: boolean;
    max_qty: number;
}
