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
    icon_src?: string;
    bgImage?: string;
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

export class MenuItem {
    public id: number = null;
    public menu_id: number = null;
    public use_global_colors: boolean | number = false;
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
    public created_at: any = null;
    public name: string = '';
    public picture: string = null;
    public social_media_id: number = null;
    public social_media_type: number = null;
    public device_uuid: string = null;
}

export class ContactComment extends TpComment {
    public contact_id: number = null;
    public app_code: string;

}

export class ContentItem {
    public id: number = null;
    public use_global_colors: boolean | number = false;
    public background_color: string = "#fafafa";
    public text_color: string = "#000";
    public phone_header_image: File | string = null;
    public tablet_header_image: File | string = null;
    public description: string = "";
    public add_header_and_comment: boolean | number = false;
}

export class ContentTabOneItem extends ContentItem {
    public tab_id: number = null;
}

export class ContentTabTwoItem extends ContentItem {
    public tab_id: number = null;
    public name: string = null;
    public section: string = null;
    public thumbnail: string = null;
    public status: boolean | number = true;
}

export class VoiceRecordingTabItem {
    public id: number = null;
    public tab_id: number = null;
    public email_id: string = null;
    public subject: string = null;
    public description: string = null;
}

export class ContentComment {
    public id: number = null;
    public content_id: number = null;
    public description: string = '';
    public created_at: any = null;
    public app_code: string;
    public name: string = '';
    public picture: string = null;
    public social_media_id: number = null;
    public social_media_type: number = null;
    public device_uuid: string = null;
}

export class ContentTabThreeCategory extends ContentItem {
    public tab_id: number = null;
    public name: string = null;
    public section: string = null;
    public thumbnail: string = null;
    public status: boolean | number = true;
}

export class ContentTabThreeCategoryItem extends ContentItem {
    public tab_id: number = null;
    public category_id: number = null;
    public name: string = null;
    public section: string = null;
    public thumbnail: string = null;
    public status: boolean | number = true;
}

export class ContentTabThreeCategoryItemData extends ContentItem {
    public tab_id: number = null;
    public category_id: number = null;
    public name: string = null;
    public section: string = null;
    public thumbnail: string = null;
    public status: boolean | number = true;
}

export class Direction {
    public id: number = null;
    public tab_id: number = null;
    public title: string = null;
    public m_long: number = null;
    public m_lat: number = null;
}

export class FanWallItem {
    public id: number = null;
    public tab_id: number = null;
    public app_code: string;
    public description: string = null;
    public created_at: any = null;
    public name: string = null;
    public picture: string = null;
    public parent_id: number = null;
    public no_of_replies: number = 0;
    public social_media_id: number = null;
    public social_media_type: number = null;
    public device_uuid: string = null;
}

export class Gallery {
    public id: number = null;
    public tab_id: number = null;
    public name: string = null;
    public thumbnail: File | string = null;
    public gallery_type: number = null;
    public image_description: number = null;
}

export class GalleryPhotos {
    public id: number = null;
    public gallery_id: number = null;
    public image: string = null;
    public description: string = null;
}

export class AroundUsItemData {
    public id: number = null;
    public tab_id: number = null;
    public name: string = '';
    public category_name: string = '';
    public information: string = '';
    public website: string = '';
    public m_long: number = null;
    public m_lat: number = null;
    public distance_type: number = distanceTypeMile;
    public email_id: string = '';
    public telephone: any = null;
    public image: File | string = null;
    public around_us_id: number = null;
}

export class EmailFormsTabItem {
    public id: number = null;
    public tab_id: number = null;
    public email: string = '';
    public subject: string = '';
    public title: string = '';
    public description: string = '';
    public success_msg: string = '';
    public error_msg: string = '';
    public submit_button_label: string = '';
    public back_button_label: string = '';
    public status: number | boolean = false;
}

export class FormField {
    id: number = null;
    field_type_id: number = null;
    form_id: number = null;
    properties: any = {};
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

export class EmailFormData {
    form_id: number = null;
    form_values: any[] = [];
}
export class FileData {
    file_value: File | string = null;
}

export class GlobalSettings {
    id: number = null;
    app_id: number = null;
    header: any = {};
    lists: any = {};
    fonts: any = {};
    features: any = {};
    individual_tabs: any = {};
    blur_effect: any = {};
}

export class EventsComment {
    id: number;
    tab_id: number;
    event_id: number;
    user_id: number;
    app_code: string;
    name: string;
    comment: string;
    picture: string = null;
    social_media_id: number;
    social_media_type: number;
    created_at: any = null;
    device_uuid: string = null;
}
export class Events {
    public id: number = null;
    public tab_id: number = null;
    public timezone_id: number = 50;
    public phone_header_image: File | string = null;
    public tablet_header_image: File | string = null;
    public event_start_date: Date = new Date();
    public event_end_date: Date = new Date();
    public event_start_time: any;
    public event_end_time: any;
    public name: string = "";
    public description: string = "";
    public imported_location: boolean | number = null;
    public address_sec_1: string = "";
    public status: boolean | number = null;
    public location_id: number = null;
    public address_sec_2: string = "";
    public m_lat: number = null;
    public m_long: number = null;

}
export class EventsGallery {
    id: number;
    event_id: number;
    image: File[];
    caption: string;

}

export class EventsGoing {
    id: number;
    tab_id: number;
    event_id: number;
    user_id: number;
    name: string;
    picture: string = null;
    social_media_id: number;
    social_media_type: number;
    created_at: any = null;
    device_uuid: string = null;
    app_code: string;
}

export class AroundUsComment {
    id: number;
    tab_id: number;
    item_id: number;
    user_id: number;
    app_code: string;
    name: string;
    description: string;
    picture: string = null;
    social_media_id: number;
    social_media_type: number;
    created_at: any = null;
    device_uuid: string = null;
}

export class Note {
    id: number = null;
    body: string = "";
    created_at: string = null;
}

export class CallUsModalData {
    telephone: number = null;
    address: string = null;
}

export class DirectionModalData {
    address: string = null;
    m_lat: number = null;
    m_long: number = null;
}

export class InboxTabData {
    id: number = null;
    app_id: number = null;
    created_at: string = null;
    tab_id: number;
    timezone_id: number;
    span: number;
    user_group_id: any;
    content_type: number;
    android_type: any = false;
    iphone_type: any = false;
    send_now: any = false;
    message: string;
    website_url: string = null;
    active: Date = new Date();
    send_on: any = false;
    send_on_date: Date = new Date();
    m_long: string;
    m_lat: string;
    span_type: string;
    tab_func_code: string;
    bgImage: string;
    title: string;
    audience: number;
    location_type: number;
}
export class Time {
    hours: number = 0;
    minutes: number = 0;
    seconds: number = 0;
}

export class MemberLoginData {
    appId: number = null;
    loginType: number = null;
    userName: string = null;
    password: string = null;
}

export class GuestMemberLoginData {
    appId: number = null;
    loginType: number = null;
}

export class SaveSubscriptionData {
    appId: number = null;
    deviceUuid: string = null;
    subscriptionState: any[] = [];
}


export class MusicComment {
    public id: number = null;
    public content_id: number = null;
    public description: string = '';
    public created_at: any = null;
    public app_code: string;
    public name: string = '';
    public picture: string = null;
    public social_media_id: number = null;
    public social_media_type: number = null;
    public device_uuid: string = null;
}

export class QrCoupons {
    public id: number = null;
    public tab_id: number = null;
    public phone_header_image: File | string = null;
    public tablet_header_image: File | string = null;
    public start_date: Date = new Date();
    public end_date: Date = new Date();
    public coupon_name: string = "";
    public description: string = "";
    public qr_code: string = "";
    public check_in_target: number = null;
    public scan_count: number = 0;
    public coupon_reuse: number = null;
    public hours_before_checkin: number = 0;

}

export class QrCouponsActivity {
    public id: number;
    public tab_id: number;
    public item_id: number;
    public user_id: number;
    public target: number;
    public totalTarget: number;
    public name: string;
    public picture: string = null;
    public type: string = null;
    public created_at: any = null;
    public active: number | boolean = true;
    public social_media_id: number = null;
    public social_media_type: number = null;
    public app_code: string;
    public device_uuid: string = null;
}

export class GpsCoupons {
    public id: number = null;
    public tab_id: number = null;
    public phone_header_image: File | string = null;
    public tablet_header_image: File | string = null;
    public start_date: Date = new Date();
    public end_date: Date = new Date();
    public coupon_name: string = "";
    public description: string = "";
    public radius: number = 0;
    public radius_unit: number = 1;
    public check_in_target: number = null;
    public m_lat: number = null;
    public m_long: number = null;
    public scan_count: number = 0;
    public coupon_reuse: number = null;
    public hours_before_checkin: number = 0;
}

export class GpsCouponsActivity {
    public id: number;
    public tab_id: number;
    public item_id: number;
    public user_id: number;
    public target: number;
    public totalTarget: number;
    public name: string;
    public picture: string = null;
    public type: string = null;
    public created_at: any = null;
    public active: number | boolean = true;
    public social_media_id: number = null;
    public social_media_type: number = null;
    public app_code: string;
    public device_uuid: string = null;
}

export class Loyalty {
    public id: any;
    public tab_id: number = null;
    public secret_code: string = null;
    public reward_text: string = null;
    public square_count: any = 1;
    public is_advance: number = null;
    public phone_header_image: string = null;
    public loyalty_title: string = null;
    public perk_unit_type: any = 0;
    public perk_unit: any = 0;
    public stamp_count: any = 0;
    public stamp_award_amount: any = 0;

}
export class LoyaltyActivity {
    public id: number;
    public tab_id: number;
    public item_id: number;
    public user_id: number;
    public target: number;
    public totalTarget: number;
    public name: string;
    public picture: string = null;
    public type: string = null;
    public created_at: any = null;
    public active: number | boolean = true;
    public social_media_id: number = null;
    public social_media_type: number = null;
    public app_code: string;
    public device_uuid: string = null;
}

export class AdvLoyaltyActivity {
    public id: number;
    public tab_id: number;
    public item_id: number;
    public user_id: number;
    public name: string;
    public picture: string;
    public created_at: any;
    public social_media_id: number;
    public social_media_type: number;
    public stamp_award_amount: number = 0;
    public points: number = 0;
    public app_code: string;
    public perk_unit_type: any = 0;
    public perk_title: string;
    public device_uuid: string = null;
}
export class MailingListUsers {
    public id: number;
    public tab_id: number;
    public name: string;
    public email: string;
    public birthDay: Date = new Date();
    public zip: number;
    public country: string;
    public category_id: any[] = [];
    public comments: string;
}
export class InsertStampActivityData {
    appId: number = null;
    deviceUuid: string = null;
    item_id: number = null;
}
export class ClearStampActivityData {
    appId: number = null;
    deviceUuid: string = null;
    item_id: number = null;
}
export class UserProfile {
    id: number = null;
    app_id: number = null;
    device_uuid: string = null;
    name: string = null;
    picture: string | File = null;
    email: string = null;
    birth_month: any = null;
    birth_day: any = null;
}

export class AppSession {
    id: number = null;
    app_id: number = null;
    app_type: number = null;
    platform: number = null;
    session_time: number = 0.0;
    country: string = null;
    country_code: string = null;
}

export class TabSession {
    id: number;
    app_id: number;
    tab_id: number;
    app_type: number;
    platform: number;
    device_uuid: string;
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

export interface ShoppingCartPayment {
    id: number;
    tab_id: number;
    currency: number;
    payment_gateway: number;
    payment_gateway_credentials: AuthorizeNetCredentials | PaypalCredentials | StripeCredentials;
    is_cash: number;
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

export class ShoppingCartInventoryItemImage {
    id: number;
    item_id: number;
    image: string;
    is_primary: number;
    image_url: string;
}

export class CartItem {
    id: number;
    item_id: number;
    item_name: string;
    item_price: number;
    item_image: string;
    quantity: number = 1;
    size: ShoppingCartInventoryItemSize | FoodOrderingItemSize;
    options: ShoppingCartInventoryItemOption[] | { option: FoodOrderingItemOption, quantity: number }[];
    notes: string;
    total_price: number;
    is_tax_exempted: boolean;
}

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
    lat: number = null;
    long: number = null;
}

export interface FoodOrderingLocation {
    id: number;
    tab_id: number;
    is_custom_timezone: number;
    timezone_id: number;
    is_imported_locations: number;
    imported_location_id: number;
    address_section_1: string;
    address_section_2: string;
    latitude: number;
    longitude: number;
    distance_type: number;
    emails: string;
    is_open: boolean;
}

export interface FoodOrderingServices {
    convenience_fee: number;
    convenience_fee_taxable: boolean;
    delivery: boolean;
    delivery_address_validation: boolean;
    delivery_days: number;
    delivery_minimum: number;
    delivery_price_fee: number;
    delivery_price_fee_taxable
    delivery_radius: number;
    delivery_radius_type: number;
    dine_in: boolean;
    free_delivery_amount: number;
    id: number;
    lead_time: number;
    tab_id: number;
    take_out: boolean;
    take_out_days: number;
}

export interface FoodOrderingLocationHours {
    id: number;
    location_id: number;
    day: string;
    start_time: string;
    end_time: string;
    status: number;
}

export const weekDays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];

export interface SelectOption {
    label: string;
    value: any;
}

export class FoodOrderSettings {
    type: number;
    datetime: string;
    location: FoodOrderingLocation;
}

export interface FoodOrderingMenuCategory {
    id: number;
    tab_id: number;
    name: string;
    image: string;
    image_url: string;
    status: number;
}

export interface FoodOrderingItem {
    id: number;
    category_id: number;
    name: string;
    description: string;
    price: number;
    is_tax_exempted: boolean;
    image: string;
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

export interface FoodOrderingItemOptionType {
    id: number;
    item_id: number;
    title: string;
    is_required: boolean;
    amount: number;
}

export class AddressSelector{
    id: number;
    tab_id: number;
    address_section_1: string;
    address_section_2: string;
    latitude: number;
    longitude: number;
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
    order_status: number;
    paid_status: number;
    datetime: string;
    items: CartItem[];
    shipping_instructions: string;
    is_email_receipt: boolean = false;
    device_uuid: string;
    is_order_placed: boolean;
    delivery_charges: number;
    free_delivery_amount: number;
    convenience_fee_taxable: boolean;
    delivery_price_fee_taxable: boolean;
}