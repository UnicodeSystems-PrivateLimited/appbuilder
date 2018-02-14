export class CPanelData {
    public appId: number;
    public client_permission: CPanelSetting = null;
    public login_bg_image: File = null;
}

export class CPanelSetting {
    public theme: CPanelThemeSetting = null;
    public header: CPanelHeaderSetting = null;
    public steps: CPanelStepsSetting = null;
    public previewer: CPanelPreViewerSetting = null;
    public login_page: CPanelLoginSetting = null;
    public footer: CPanelFooterSetting = null;
}

export class CPanelHeaderSetting {
    public header_link_color: string = "#000000";
    public header_start_over: number | boolean = button_off;
    public navigation: Navigation[] = [];
}

export class Navigation {
    public label: string = "";
    public link: string = "";
    public class: string = "";
    public action: number = 1;
}
export class CPanelFooterSetting {
    public footer_copyright_html: string = "";
    public footer_bg_color: string = "#252525";
    public footer_menu_header_color: string = "#ffffff";
    public footer_menu_link_color: string = "#bcbcbc";
    public navigationCol1: Navigation[] = [];
    public navigationCol2: Navigation[] = [];
}
export class CPanelLoginSetting {
    public login_logo: string = "";
    public login_bg_color: string = "#FFFFFF";
    public text_color_login: string = "#000000";
    public login_bg_repeat: number | boolean = button_on;
    public login_bg_image: string = "";
    public login_custom_html: string = "";
    public login_use_custom: number | boolean = button_off;
}
export class CPanelPreViewerSetting {
    public prev_language: number = 1;
    public prev_play_image: string = "";
    public prev_bg_image: string = "";
    public prev_load_image: string = "";
}
export class CPanelStepsSetting {
    public steps_functionality: number | boolean = button_on;
    public steps_content: number | boolean = button_on;
    public steps_appearance: number | boolean = button_on;
    public steps_publish: number | boolean = button_on;
    public steps_preview_tool: number | boolean = button_on;
    public steps_app_code_widget: number | boolean = button_on;
}
export class CPanelThemeSetting {
    public theme_default_settings: number | boolean = button_off;
    public theme_logo: string = "";
    public theme_page_title: string = "";
    public theme_type: number = 1;
    public theme_header_bg_color1: string = "#2f2e2f";
    public theme_header_bg_color2: string = "#b58b43";
    public theme_header_bg_color3: string = "#312e2e";
}
export class UploadImage {
    public type: number = 2;
    public image_file: File = null;
}
export const button_on: number = 1;
export const button_off: number = 0;
export const ACTION: any = [{ label: "Open in same", value: 1 }, { label: "Open in new", value: 2 }, { label: "Normal Popup", value: 3 }, { label: "Big Popup", value: 4 }, { label: "Grand Popup", value: 5 }, { label: "Biggest Popup", value: 6 }];

export class CustomerSetting {
    app_id: number = null;
    config_data: AppConfigSetting = null;
    app_screen_config_data: AppConfigScreenSetting = null;
    app_membership_settings_data: AppMembershipSettings = null;
    single_member_login_details: AppSingleMemberLoginDetails = null;
}
export class AppConfigSetting {
    time_zone: number = 1;
    date_time_format: string = "12";
    ios_url: string = null;
    android_url: string = null;
    mobile_website_enabled: number = 1;
    smart_banners: boolean = false;
    android_images: number = 1;
    mobile_website_images: number = 1;
}
export class AppConfigScreenSetting {
    user_profile: boolean = true;
    social_login: boolean = true;
    terms_of_service: boolean = false;
    terms_of_service_url: string = null;
    privacy_policy: number = 1;
    privacy_policy_url: string = null;
    user_comment_ability: boolean = true;
    social_onboarding: boolean = false;
    share_default_msg: string = null;
}

export class AppConfigPromoteSetting {
    app_id: number = null;
    app_share_setting: AppShareingSetting = null;
    emailMarketing: EmailMarketingSetting=null;
}
export class AppShareingSetting {
    mobile_website_redirect: number | boolean = false;
    promote_bg_image: string = null;
    location: number = null;
    location_show: number | boolean = true;
    phone_show: number | boolean = true;
    email_show: number | boolean = true;
    description: string;
}
export class AppMembershipSettings {
    public login_color: string = "#000";
    public member_login: boolean = false;
    public guest_login: boolean = false;
    public type: number = 2;
}

export class AppSingleMemberLoginDetails {
    public user_name: string = null;
    public password: string = null;
}

export class SaveMembershipSettings {
    public app_id: number = null;
    public membsership_settings: AppMembershipSettings = null;
}
export class EmailMarketingSetting {
    public CollectEmailButton: boolean = true;
    public emailMarketingButton: boolean = true;
    public selectedTabs: Array<Number> = [];
    public selectedPromptFrequency: number = 7;
    public promptText: string = 'Please enter your email address to receive free coupons and rewards.';
    public lastDownLoadDate: Date = null;
}