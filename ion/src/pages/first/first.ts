import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, ModalController, Content, Slides } from 'ionic-angular';
import { Formfile } from "../formfile/formfile";
import { GlobalService } from '../../providers';
import { DisplayService, SocialMedia, MemberLoginService, NewsTabService, TabSessionService, DataService } from "../../providers";
import { TabService } from '../../providers';
import { NativeStorage, SocialSharing, Printer, PrintOptions, SafariViewController } from "ionic-native";
import { MemberLoginData, GuestMemberLoginData, Tab } from "../../interfaces/common-interfaces";

import { WebsiteTabPage } from "../website-tab/website-tab";
import { PdfTabPage } from "../pdf-tab/pdf-tab";
import { CallUsPage } from "../call-us/call-us";
import { MenuTabPage } from "../menu-tab/menu-tab";
import { ContactUs } from "../contact-us/contact-us";
import { ContentTabOne } from "../content-tab-one/content-tab-one";
import { ContentTabTwo } from "../content-tab-two/content-tab-two";
import { VoiceRecording } from "../voice-recording/voice-recording";
import { ContentTabThree } from "../content-tab-three/content-tab-three";
import { DirectionsTab } from "../directions-tab/directions-tab";
import { FanWallTab } from "../fan-wall-tab/fan-wall-tab";
import { PictureGallery } from "../picture-gallery/picture-gallery";
import { QRScanner } from "../qr-scanner/qr-scanner";
import { AroundUs } from "../around-us/around-us";
import { EmailFormsTab } from "../email-forms-tab/email-forms-tab";
import { Social } from "../social/social";
import { EventsTab } from "../events-tab/events-tab";
import { FontFamilyTab } from "../font-family-tab/font-family-tab";
import { ContactUsDetail } from "../contact-us-detail/contact-us-detail";
import { EmailFormDetail } from "../email-form-detail/email-form-detail";
import { WebViewPage } from "../web-view/web-view";
import { TellFriend } from "../tell-friend/tell-friend";
import { Notepad } from "../notepad/notepad";
import { FindWhereIParked } from "../find-where-i-parked/find-where-i-parked";
import { CallUsModal } from "../../components/call-us-modal/call-us-modal";
import { DirectionModal } from "../../components/direction-modal/direction-modal";
import { InboxTab } from "../inbox-tab/inbox-tab";
import { PdfViewer } from "../pdf-viewer/pdf-viewer";
import { NewsTab } from '../news-tab/news-tab';
import { MusicTab } from '../music-tab/music-tab';
import { QrCouponsTab } from '../qr-coupons-tab/qr-coupons-tab';
import { GpsCouponTab } from '../gps-coupon-tab/gps-coupon-tab';
import { LoyaltyTab } from '../loyalty-tab/loyalty-tab';
import { MailingListTab } from '../mailing-list-tab/mailing-list-tab';
import { LanguageTab } from '../language-tab/language-tab';
import { SettingsModal } from '../settings-modal/settings-modal';
import { PictureGalleryPhotos } from "../picture-gallery-photos/picture-gallery-photos";
import { ShoppingCartCategories } from '../shopping-cart-categories/shopping-cart-categories';
import { FoodOrdering } from '../food-ordering/food-ordering';
declare var cordova: any;
declare var window: any;

const membershipLoginTypeGuest: number = 1;
const membershipLoginTypeSingle: number = 2;
const membershipLoginTypeMulti: number = 3;

/*
  Generated class for the First page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-first',
    templateUrl: 'first.html'
})
export class First {
    public background_img: any;
    public appData: any = {};
    public layoutClasses: string[] = [];
    public appStoreUrl: string;
    public facebookUser = null;
    public twitterUser = null;
    public LAYOUT_TOP: number = 1;
    public LAYOUT_BOTTOM: number = 2;
    public LAYOUT_LEFT: number = 3;
    public LAYOUT_RIGHT: number = 4;
    public loader: boolean = false;
    public showonTab: boolean = false;
    public showOnAll: boolean = false;
    public pages: Object = {
        website_tab: WebsiteTabPage,
        pdf_tab: PdfTabPage,
        call_us: CallUsPage,
        menu_tab: MenuTabPage,
        contact_us: ContactUs,
        content_tab1: ContentTabOne,
        content_tab2: ContentTabTwo,
        voice_recording: VoiceRecording,
        content_tab3: ContentTabThree,
        directions_tab: DirectionsTab,
        fan_wall: FanWallTab,
        picture_gallery: PictureGallery,
        qr_scanner: QRScanner,
        aroundus_tab: AroundUs,
        email_forms: EmailFormsTab,
        social: Social,
        calender_event: EventsTab,
        tell_friend: TellFriend,
        notepad: Notepad,
        find_where_i_parked: FindWhereIParked,
        inbox: InboxTab,
        news: NewsTab,
        music: MusicTab,
        qr_coupons: QrCouponsTab,
        gps_tab: GpsCouponTab,
        scholl_reward: LoyaltyTab,
        mailing_list: MailingListTab,
        language: LanguageTab,
        shopping_cart: ShoppingCartCategories,
        food_ordering: FoodOrdering
    };

    public webRestrictedTabs: string[] = [
        'voice_recording',
        'qr_scanner',
        'notepad'
    ];

    public appRestrictedTabs: string[] = [
        'membership'
    ];
    public mySlideOptions;
    public memberLoginData: MemberLoginData = new MemberLoginData();
    public guestMemberLoginData: GuestMemberLoginData = new GuestMemberLoginData();
    public noTabAccess: boolean = false;
    public musicTabAccess: boolean = true;
    public appDetails: any = null;
    public isSliderInitialize: boolean = false;
    public isLoggingThroughStoredData: boolean = false;
    public iosAppStoreUrl: string;
    public androidAppStoreUrl: string;
    public webUrl: string;
    public shareMsg: string;
    @ViewChild(Content) content: Content;

    constructor(public navCtrl: NavController,
        public globalService: GlobalService,
        public display: DisplayService,
        public tabService: TabService,
        public navParams: NavParams,
        public platform: Platform,
        public modalCtrl: ModalController,
        public service: MemberLoginService,
        public newsService: NewsTabService,
        public tabSession: TabSessionService,
        public dataService: DataService
    ) {

        this.setLayoutClasses();
        if ((platform.is("tablet") || platform.is("ipad"))) {
            this.showonTab = true;
        } else {
            this.showOnAll = true;
        }

        NativeStorage.getItem("memberLoginData").then(data => {
            this.memberLoginData = data;
            console.log(this.memberLoginData);
            NativeStorage.getItem("initData").then(data => {
                this.globalService.initData = data;
                this.globalService.initData.subTabs = Object.keys(this.globalService.initData.subTabs).map(i => this.globalService.initData.subTabs[i]);
                if (data.timeSettings) {
                    this.globalService.timeFormatSettings = data.timeSettings.date_time_format;
                }
                this.globalService.mySlideOptions = {
                    initialSlide: 0,
                    zoom: true,
                    loop: true,
                    speed: 3000,
                    autoplayDisableOnInteraction: false,
                    autoplay: (this.showonTab ? this.globalService.initData.appData.tab_slider_type : this.globalService.initData.appData.slider_type) == 1 ? null : 3000,
                    effect: (this.showonTab ? this.globalService.initData.appData.tab_slider_type : this.globalService.initData.appData.slider_type) == 3 ? 'fade' : '',
                    parallax: (this.showonTab ? this.globalService.initData.appData.tab_slider_type : this.globalService.initData.appData.slider_type) == 4 ? true : false
                };
                this.globalService.isSliderInitialize = true;
                this.globalService.tabs = this.globalService.initData.tabData;
                if (this.globalService.tabs) {
                    for (let tab of this.globalService.tabs) {
                        if (tab.settings) {
                            let tabSettings = JSON.parse(tab.settings);
                            if (tabSettings.member_login) {
                                this.globalService.isMemberLogin = true;
                                console.log('member login true ho gaya');
                                if (tabSettings.type == membershipLoginTypeMulti) {
                                    this.globalService.membershipLoginType = membershipLoginTypeMulti;
                                }
                                if (tabSettings.type == membershipLoginTypeSingle) {
                                    this.globalService.membershipLoginType = membershipLoginTypeSingle;
                                }
                            }
                        }
                    }

                    if (this.globalService.membershipLoginType) {
                        this.isLoggingThroughStoredData = true;
                        this.onLoginClick();
                    }
                }
            }).catch(err => {
                console.log(err, "No previously stored data found");
            });
            NativeStorage.getItem("appTabTitleLanguages").then(data => {
                this.globalService.appTabTitleLanguages = data;
            }).catch(err => {
                console.log(err, "No previously stored data found");
            });
            NativeStorage.getItem("appScreenConfigData").then(data => {
                this.globalService.appScreenConfigData = data;
                if (this.globalService.appScreenConfigData.social_onboarding) {
                    this.onCheckLogin();
                }
            }).catch(err => {
                console.log(err, "No previously stored data found");
            });
            NativeStorage.getItem("homeScreenSliders").then(data => {
                this.globalService.homeScreenSliders = data;
                console.log('hiiiii', this.globalService.homeScreenSliders);
            }).catch(err => {
                console.log(err, "No previously stored data found");
            });

        }).catch(err => {
            console.log(err, "No previously stored data found");
        });
    }

    public getAppData(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.globalService.getAppData().subscribe((res) => {
                if (res.success) {
                    this.appDetails = res.data.appData;
                    if (res.data.timeSettings)
                        this.globalService.timeFormatSettings = res.data.timeSettings.date_time_format;
                    resolve(true);
                } else {
                    console.log(res.message);
                    reject();
                }
            });
        });
    }
    ionViewDidLoad() {
        this.appData = this.globalService.initData.appData;
        this.globalService.firstPageContent = this.content;
    }

    public formfile() {
        this.navCtrl.push(Formfile);
    }

    private setLayoutClasses(): void {
        this.layoutClasses[this.LAYOUT_TOP] = "top";
        this.layoutClasses[this.LAYOUT_LEFT] = "left";
        this.layoutClasses[this.LAYOUT_RIGHT] = "right";
        this.layoutClasses[this.LAYOUT_BOTTOM] = "bottom";
    }

    public pushPage(tabFunctionCode: string, tabId: number, title: string, tab_data: any, tab_nav_type: string): void {
        let bgImage = this.globalService.checkPlatform(tab_data);
        let subTabId = tab_nav_type == 'subtab' ? tab_data.id : null;
        let detail = { tabId: tabId, bgImage: bgImage, tab_nav_type: tab_nav_type, subTabId: subTabId };
        this.loader = true;

        // Create and save tab session
        this.tabSession.create(tabId);

        if (tabFunctionCode === "website_tab" || tabFunctionCode === "contact_us" || tabFunctionCode === "pdf_tab" || tabFunctionCode === "email_forms") {
            this.tabService.getGateway(tabFunctionCode, tabId).subscribe((res) => {
                this.loader = false;
                if (res.success && res.data.is_single_entry) {
                    let alert = this.globalService.checkTabAddedInEmailMarketting(tabId);
                    alert.onDidDismiss(() => {
                        switch (tabFunctionCode) {
                            case 'website_tab':
                                this.openWebsite(res, detail);
                                break;
                            case 'contact_us':
                                this.navCtrl.push(ContactUsDetail, {
                                    title: title,
                                    detail: detail,
                                    tab_nav_type: tab_nav_type,
                                    subTabId: subTabId,
                                    locationId: res.data.id
                                });
                                break;
                            case 'pdf_tab':
                                if (this.platform.is("cordova")) {
                                    if (this.platform.is("android")) {
                                        // PdfViewer should only be used when the app is running on an android device.
                                        this.navCtrl.push(PdfViewer, {
                                            name: res.data.title,
                                            tabId: tabId,
                                            tab_nav_type: tab_nav_type,
                                            subTabId: subTabId,
                                            isPrintingAllowed: res.data.is_printing_allowed,
                                            url: res.data.url
                                        });
                                    } else if (this.platform.is("ios")) {
                                        this.openThemeableBrowser(res);
                                    }
                                } else {
                                    // For web
                                    this.navCtrl.push(WebViewPage, {
                                        url: res.data.url,
                                        name: name,
                                        tabId: tabId,
                                        isPrintingAllowed: res.data.is_printing_allowed,
                                        tab_nav_type: tab_nav_type,
                                        subTabId: subTabId,
                                    });
                                }
                                break;
                            case 'email_forms':
                                this.navCtrl.push(EmailFormDetail, {
                                    title: res.data.title,
                                    detail: detail,
                                    tab_nav_type: tab_nav_type,
                                    subTabId: subTabId,
                                    formId: res.data.id
                                });
                            default:
                                return;
                        }
                    });
                } else {
                    this.navCtrl.push(this.pages[tabFunctionCode], {
                        tabId: tabId,
                        title: title,
                        tab_nav_type: tab_nav_type,
                        subTabId: subTabId,
                        bgImage: bgImage
                    });
                }
            });
        } else if (tabFunctionCode === "picture_gallery") {
            if (tab_data.settings) {
                let setting_data = JSON.parse(tab_data.settings)
                if (setting_data && setting_data.image_service_type != 1) {
                    this.navCtrl.push(PictureGalleryPhotos, {
                        glryId: 0,
                        glryName: title,
                        bgImage: bgImage,
                        tabId: tabId,
                        settings: setting_data,
                        galleryType: 1
                    });
                } else {
                    this.navCtrl.push(this.pages[tabFunctionCode], {
                        tabId: tabId,
                        title: title,
                        tab_nav_type: tab_nav_type,
                        subTabId: subTabId,
                        bgImage: bgImage
                    });
                }
            } else {
                this.navCtrl.push(this.pages[tabFunctionCode], {
                    tabId: tabId,
                    title: title,
                    tab_nav_type: tab_nav_type,
                    subTabId: subTabId,
                    bgImage: bgImage
                });
            }
        } else {
            this.loader = false;
            this.navCtrl.push(this.pages[tabFunctionCode], {
                tabId: tabId,
                title: title,
                tab_nav_type: tab_nav_type,
                subTabId: subTabId,
                bgImage: bgImage,
                settings: tab_data.settings
            }).catch(err => {
                console.log('View can\'t enter', err);
                if (this.globalService.viewCantEnter) {
                    this.globalService.viewCantEnter.next(true);
                    this.globalService.viewCantEnter.complete();
                }
            });
        }
    }

    public onShowClick(): void {
        this.navCtrl.push(FontFamilyTab);
    }

    public onTellFriendClick(): void {
        this.getAppStoreUrl();
        this.display.showShareActionSheet(
            () => this.onShareByFacebook(),
            () => this.onShareByTwitter(),
            () => this.onShareByEmail(),
            () => this.onShareBySms(),
            () => this.onShareCancel()
        );
    }

    public onShareByFacebook(): void {
        SocialSharing.shareViaFacebook(this.shareMsg).then(() => {
            console.log("Facebook share success");
        }).catch(() => {
            if (!this.platform.is("ios")) {
                this.display.showToast("Facebook app not found.");
            }
        });
    }



    public onShareByTwitter(): void {
        SocialSharing.shareViaTwitter(this.shareMsg).then(() => {
            console.log("Twitter share success");
        }).catch(err => {
            if (!this.platform.is("ios")) {
                this.display.showToast("Twitter app not found.");
            }
            console.log(err);
        });
    }

    private onShareBySms(): void {
        SocialSharing.shareViaSMS(this.shareMsg, null).then(() => {
            console.log("SMS share success");
        }).catch(() => {
            this.display.showToast("Could not open SMS sender.");
        });
    }

    public onShareByEmail(): void {
        SocialSharing.canShareViaEmail().then(() => {
            SocialSharing.shareViaEmail(this.shareMsg, 'Tell Friend', []).then(() => {
                console.log("Email share success");
            }).catch(() => {
                this.display.showToast("Could not open email sender.");
            });
        }).catch(() => {
            this.display.showToast("Email sending is not supported.");
        });
    }

    private onShareCancel(): void {
    }

    public checkTabRestriction(tabCode: string): boolean {
        if (this.appRestrictedTabs.indexOf(tabCode) === -1 ? true : false) {
            if (this.platform.is("core") || this.platform.is("mobileweb")) {
                return this.webRestrictedTabs.indexOf(tabCode) === -1 ? true : false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    private openWebsite(res, detail): void {
        if (res.data.is_donation_request) {
            window.open(res.data.url, "_system");
        } else if (this.platform.is("cordova") && this.platform.is("ios") && res.data.use_safari_webview) {
            this.openSafariViewController(res);
        } else if (this.platform.is("cordova") && (this.platform.is('ios') || this.platform.is('android'))) {
            this.openThemeableBrowser(res);
        } else {
            this.navCtrl.push(WebViewPage, {
                name: res.data.title,
                detail: detail,
                id: res.data.id,
                tab_nav_type: detail.tab_nav_type,
                subTabId: detail.subTabId,
                isPrintingAllowed: res.data.is_printing_allowed,
                url: res.data.url
            });
        }
    }

    private openSafariViewController(res: any): void {
        SafariViewController.isAvailable().then((available) => {
            if (available) {
                SafariViewController.show({ url: res.data.url }).catch(err => {
                    console.log("Safari View Controller could not be opened.", err);
                });
            } else {
                this.openThemeableBrowser(res);
            }
        }).catch(() => {
            this.openThemeableBrowser(res);
        });
    }

    private openThemeableBrowser(res: any): void {
        let options: any = {
            title: {
                color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[res.data.id] ? this.globalService.initData.individualSettings[res.data.id].header.text_color : this.globalService.initData.globalStyleSettings.header.text_color),
                showPageTitle: true,
                staticText: res.data.title,
                background_color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[res.data.id] ? this.globalService.initData.individualSettings[res.data.id].header.background_color : this.globalService.initData.globalStyleSettings.header.background_color),
            },
            toolbar: {
                height: 56,
                color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[res.data.id] ? this.globalService.initData.individualSettings[res.data.id].header.background_color : this.globalService.initData.globalStyleSettings.header.background_color),
            },
            closeButton: {
                wwwImage: 'assets/icon/back-arrow-25.png',
                imagePressed: 'close_pressed',
                align: 'left',
                event: 'closePressed'
            }
        };
        options.statusbar = { color: options.title.background_color };

        if (res.data.is_printing_allowed) {
            options.customButtons = [
                {
                    wwwImage: 'assets/icon/print-25.png',
                    imagePressed: 'print_pressed',
                    align: 'right',
                    event: 'printPage'
                }
            ]
        }

        let isLoaderActive: boolean = false;
        cordova.ThemeableBrowser.open(res.data.url, '_blank', options).addEventListener('printPage', (e) => {
            this.printPage(res);
        }).addEventListener(cordova.ThemeableBrowser.EVT_ERR, function (e) {
            console.error(e.message);
        }).addEventListener(cordova.ThemeableBrowser.EVT_WRN, function (e) {
            console.log(e.message);
        }).addEventListener('loadstart', () => {
            if (!isLoaderActive && this.platform.is("android")) {
                this.display.showNativeLoaderForBrowser();
                isLoaderActive = true;
            }
        }).addEventListener('loadstop', () => {
            this.display.hideNativeLoader();
            isLoaderActive = false;
        }).addEventListener('loaderror', () => {
            this.display.hideNativeLoader();
            isLoaderActive = false;
        });
    }

    private printPage(res): void {
        let iframe: string = res.data.url;
        this.platform.ready().then(() => {
            Printer.isAvailable().then(() => {
                let options: PrintOptions = {
                    name: res.data.title
                };
                Printer.print(iframe, options);
            }, () => {
                this.display.showAlert('Printer not available.');
            });
        });
    }

    public onCallUsClick(): void {
        if (this.globalService.initData.contactData) {
            let modal = this.modalCtrl.create(CallUsModal);
            modal.present();
        }
    }

    public onDirectionClick(contactData: any[]): void {
        if (this.globalService.initData.contactData) {
            let modal = this.modalCtrl.create(DirectionModal);
            modal.present();
        }
    }

    public onLoginClick(): void {
        // console.log('onLoginClick clicked');
        this.loader = true;
        this.memberLoginData.appId = this.globalService.initData.appData.id;
        this.memberLoginData.loginType = this.globalService.membershipLoginType;
        this.service.login(this.memberLoginData).subscribe((res) => {
            if (res.success) {
                if (res.data[0].group_id == 0 || res.data[0].group_id == null) {
                    this.globalService.tabAccess = res.data[0].tabs_access;
                } else {
                    this.globalService.tabAccess = res.data[0].group_tabs_access;
                }

                NativeStorage.setItem("memberLoginData", this.memberLoginData).then(() => {
                    console.log("Member Login Data stored in native storage.");
                }).catch(err => {
                    console.log("Member Login Data native storage failed", err);
                });

                let tempTabs: any[] = [];
                let homeMusicWidget: boolean = false;
                if (this.globalService.tabAccess != null) {
                    this.globalService.tabs.forEach((data) => {
                        if (this.globalService.tabAccess.indexOf(data.id) !== -1) {
                            tempTabs.push(data);
                            if (data.tab_func_code == 'music' && data.settings && !homeMusicWidget) {
                                let setting_data = JSON.parse(data.settings);
                                homeMusicWidget = setting_data.home_screen_widget;
                            }
                        }
                    });
                    this.musicTabAccess = homeMusicWidget;
                } else {
                    this.musicTabAccess = homeMusicWidget;
                    this.noTabAccess = true;
                }
                this.globalService.tabs = tempTabs;

                let tempSubTabs: any[] = [];
                if (this.globalService.tabAccess != null) {
                    this.globalService.initData.subTabs.forEach((data) => {
                        if (this.globalService.tabAccess.indexOf(data.tab_id) !== -1) {
                            tempSubTabs.push(data);
                        }
                    });
                }
                this.globalService.initData.subTabs = tempSubTabs;

                this.content.resize();
                this.globalService.isMemberLogin = false;
                // console.log('onLoginClick clicked pura chl gaya', this.globalService.isMemberLogin);

                if (!this.isLoggingThroughStoredData) {
                    this.mapMemberToDevice();
                }
            } else {
                this.display.showToast(res.message);
            }
            this.loader = false;
        });
    }

    public onGuestLoginClick(): void {
        // console.log('guest login clicked');
        this.loader = true;
        this.guestMemberLoginData.appId = this.globalService.initData.appData.id;
        this.guestMemberLoginData.loginType = membershipLoginTypeGuest;
        console.log(this.guestMemberLoginData);
        this.service.guestLogin(this.guestMemberLoginData).subscribe((res) => {
            console.log(res);
            if (res.success) {
                if (res.data.length > 0) {
                    if (res.data[0].group_id == 0 || res.data[0].group_id == null) {
                        this.globalService.tabAccess = res.data[0].tabs_access;
                    } else {
                        this.globalService.tabAccess = res.data[0].group_tabs_access;
                    }
                }

                let tempTabs: any[] = [];
                let homeMusicWidget: boolean = false;
                if (this.globalService.tabAccess != null) {
                    this.globalService.tabs.forEach((data) => {
                        if (this.globalService.tabAccess.indexOf(data.id) !== -1) {
                            tempTabs.push(data);
                            if (data.tab_func_code == 'music' && data.settings && !homeMusicWidget) {
                                let setting_data = JSON.parse(data.settings);
                                homeMusicWidget = setting_data.home_screen_widget;
                            }
                        }
                    });
                    this.musicTabAccess = homeMusicWidget;
                } else {
                    this.noTabAccess = true;
                }
                this.globalService.tabs = tempTabs;

                let tempSubTabs: any[] = [];
                if (this.globalService.tabAccess != null) {
                    this.globalService.initData.subTabs.forEach((data) => {
                        if (this.globalService.tabAccess.indexOf(data.tab_id) !== -1) {
                            tempSubTabs.push(data);
                        }
                    });
                }
                this.globalService.initData.subTabs = tempSubTabs;

                this.content.resize();
                this.globalService.isMemberLogin = false;
            } else {
                this.display.showToast(res.message);
            }
            this.loader = false;
        });
    }

    public onNewsClick(link): void {
        console.log('link ', link);
        if (this.platform.is('ios') || this.platform.is('android')) {
            console.log('in');
            let options: any = {
                toolbar: {
                    height: 56,
                    background_color: this.globalService.completeHexCode(this.globalService.initData.homeScreenSettings ? this.globalService.initData.homeScreenSettings.header.background_tint : '#387ef5')
                },
                closeButton: {
                    wwwImage: 'assets/icon/back-arrow-25.png',
                    imagePressed: 'close_pressed',
                    align: 'left',
                    event: 'closePressed'
                },
            };
            options.statusbar = { color: options.toolbar.background_color };
            let isLoaderActive: boolean = false;
            cordova.ThemeableBrowser.open(link, '_blank', options).addEventListener(cordova.ThemeableBrowser.EVT_ERR, (e) => {
                console.error(e.message);
            }).addEventListener(cordova.ThemeableBrowser.EVT_WRN, (e) => {
                console.log(e.message);
            }).addEventListener('loadstart', () => {
                if (!isLoaderActive && this.platform.is("android")) {
                    this.display.showNativeLoaderForBrowser();
                    isLoaderActive = true;
                }
            }).addEventListener('loadstop', () => {
                this.display.hideNativeLoader();
                isLoaderActive = false;
            }).addEventListener('loaderror', () => {
                this.display.hideNativeLoader();
                isLoaderActive = false;
            });
        } else {
            this.navCtrl.push(WebViewPage, {
                url: link
            });
        }
    }
    public onTwitterNewsClick(show_news_home: number): void {
        for (let item of this.globalService.tabs) {
            let bgImage = this.globalService.checkPlatform(item);
            if (item.tab_func_code == 'news' && show_news_home == 1) {
                this.navCtrl.push(NewsTab, {
                    tabId: item.id,
                    title: item.title,
                    bgImage: bgImage,
                    tweetTab: 1
                });
                break;
            }
        }
    }

    public goToMusicPage(tab_data: any): void {
        let bgImage = this.globalService.checkPlatform(tab_data);
        this.navCtrl.push(MusicTab, {
            tabId: tab_data.id,
            title: tab_data.title,
            bgImage: bgImage
        });
    }

    private mapMemberToDevice(): void {
        this.globalService.saveDeviceMember(this.memberLoginData.userName).subscribe(res => {
            if (res.success) {
                console.log("Member-device association successful");
            } else {
                console.log("Member-device association failed:", res.message);
            }
        })
    }
    public onSettingsClick() {
        let modal = this.modalCtrl.create(SettingsModal);
        modal.present();
    }
    public onCheckLogin(): void {
        this.display.showCommentActionSheet(() => {
            this.handleFacebook();
        }, () => {
            this.handleTwitter();
        });
    }

    private handleFacebook(): void {
        if (this.facebookUser) {
        } else {
            SocialMedia.loginFacebook().then(user => {
                this.facebookUser = user;
            }).catch(err => {
                this.display.showToast(err);
            });
        }
    }

    private handleTwitter(): void {
        if (this.twitterUser) {
        } else {
            SocialMedia.loginTwitter().then(user => {
                this.twitterUser = user;
            }).catch(err => {
                this.display.showToast(err);
            });
        }
    }

    public checkExternalUrlInSubTab(subTab: any): void {
        if (subTab.external_url) {
            this.openSubTabExternalUrl(subTab);
        } else {
            this.pushPage(subTab.tab_func_code, subTab.tab_id, subTab.tab_title, subTab, 'subtab');
        }
    }

    public openSubTabExternalUrl(data: any): void {
        if (typeof cordova != 'undefined') {
            let options: any = {
                title: {
                    color: this.globalService.completeHexCode(this.globalService.initData.globalStyleSettings.header.text_color),
                    showPageTitle: true,
                    staticText: data.title,
                    background_color: this.globalService.completeHexCode(this.globalService.initData.globalStyleSettings.header.background_color),
                },
                toolbar: {
                    height: 56,
                    color: this.globalService.completeHexCode(this.globalService.initData.globalStyleSettings.header.background_color),
                },
                closeButton: {
                    wwwImage: 'assets/icon/back-arrow-25.png',
                    imagePressed: 'close_pressed',
                    align: 'left',
                    event: 'closePressed'
                }
            };
            options.statusbar = { color: options.title.background_color };
            let isLoaderActive: boolean = false;
            cordova.ThemeableBrowser.open(data.external_url, '_blank', options).addEventListener(cordova.ThemeableBrowser.EVT_ERR, function (e) {
                console.error(e.message);
            }).addEventListener(cordova.ThemeableBrowser.EVT_WRN, function (e) {
                console.log(e.message);
            }).addEventListener('loadstart', () => {
                if (!isLoaderActive && this.platform.is("android")) {
                    this.display.showNativeLoaderForBrowser();
                    isLoaderActive = true;
                }
            }).addEventListener('loadstop', () => {
                this.display.hideNativeLoader();
                isLoaderActive = false;
            }).addEventListener('loaderror', () => {
                this.display.hideNativeLoader();
                isLoaderActive = false;
            });
        } else {
            window.open(data.external_url, '_blank');
        }

    }

    public isEmpty(obj): boolean {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
    public getAppStoreUrl(): void {
        if (this.globalService.initData.appData) {
            if (this.platform.is("android")) {
                this.appStoreUrl = this.globalService.initData.appData.google_play_store_url;
            }
            else if (this.platform.is("ios")) {
                this.appStoreUrl = this.globalService.initData.appData.ios_app_store_url;
            }
        }
        this.iosAppStoreUrl = this.globalService.initData.appData.ios_app_store_url;
        this.androidAppStoreUrl = this.globalService.initData.appData.google_play_store_url;
        this.webUrl = this.globalService.initData.appData.html5_mobile_website_url;
        this.shareMsg = this.globalService.initData.appScreenConfigData ? this.globalService.initData.appScreenConfigData.share_default_msg : null;
        if (this.shareMsg) {
            this.shareMsg = this.shareMsg.replace('[Android]', this.androidAppStoreUrl);
            this.shareMsg = this.shareMsg.replace('[iOS]', this.iosAppStoreUrl);
            this.shareMsg = this.shareMsg.replace('[HTML5]', this.webUrl);
        } else {
            this.shareMsg = "";
        }
    }

    public onSlideClick(tabID: number): void {
        if (!tabID) {
            return;
        }
        this.dataService.getByID(this.globalService.tabs, tabID, (tab: Tab) => {
            this.pushPage(tab.tab_func_code, tabID, tab.title, tab, 'tab');
        });
    }

    public onInboxTabShortcutClick(tab: Tab): void {
        this.pushPage(tab.tab_func_code, tab.id, tab.title, tab, 'tab');
    }

}



