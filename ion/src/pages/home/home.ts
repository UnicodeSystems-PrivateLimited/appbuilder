import { Component } from '@angular/core';
import { NavController, Platform, AlertController, MenuController, ModalController, NavOptions, ActionSheetController, ActionSheetOptions, ActionSheet } from 'ionic-angular';
import { TabService } from '../../providers';
import { GlobalService, DataService, NewsTabService, BackgroundGeolocationService } from '../../providers';
import { Tab, Website } from "../../interfaces";
import { DisplayService, SocialMedia, SocialService, AppSessionService, TabSessionService } from "../../providers";
import { NativeStorage, StatusBar, AppVersion, Printer, PrintOptions, ThemeableBrowser, Splashscreen, Push, Device, Screenshot, SafariViewController } from "ionic-native";
import { First } from "../first/first";
import { WebViewPage } from "../web-view/web-view";
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
import { EventsTab } from "../events-tab/events-tab";
import { Social } from "../social/social";
import { ContactUsDetail } from "../contact-us-detail/contact-us-detail";
import { EmailFormDetail } from "../email-form-detail/email-form-detail";
import { TellFriend } from "../tell-friend/tell-friend";
import { Notepad } from "../notepad/notepad";
import { FindWhereIParked } from "../find-where-i-parked/find-where-i-parked";
import { InboxTab } from "../inbox-tab/inbox-tab";
import { PdfViewer } from "../pdf-viewer/pdf-viewer";
import { NewsTab } from '../news-tab/news-tab';
import { MusicTab } from '../music-tab/music-tab';
import { QrCouponsTab } from '../qr-coupons-tab/qr-coupons-tab';
import { GpsCouponTab } from '../gps-coupon-tab/gps-coupon-tab';
import { LoyaltyTab } from '../loyalty-tab/loyalty-tab';
import { MailingListTab } from '../mailing-list-tab/mailing-list-tab';
import { LanguageTab } from '../language-tab/language-tab';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Storage } from '@ionic/storage';
import { LanguageSelector } from '../language-selector/language-selector';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { MobileWebsiteDisabled } from "../mobile-website-disabled/mobile-website-disabled";
import { Subscription } from "rxjs";
import { PictureGalleryPhotos } from "../picture-gallery-photos/picture-gallery-photos";
import { ShoppingCartCategories } from "../shopping-cart-categories/shopping-cart-categories";
import { FoodOrdering } from '../food-ordering/food-ordering';
declare var cordova: any;

const membershipLoginTypeSingle: number = 2;
const membershipLoginTypeMulti: number = 3;

const CONTENT_TYPE_NONE: number = 0;
const CONTENT_TYPE_WEBSITE_URL: number = 1;
const CONTENT_TYPE_TAB_LINK: number = 2;

const MOBILE_WEBSITE_DISABLED: number = 2;

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
})
export class HomePage {
    public facebookUser = null;
    public twitterUser = null;
    public tabSearch: string;
    public rootPage: any = First;
    public loader: boolean = false;
    public splashScreenHidden: boolean = false;
    public isNativeStorageData: boolean = false;
    public inboxTab: Tab;
    public doesInboxTabExist: boolean = null;
    public isScreenshotMaker: boolean = false;
    public screenshotType: number = 1;
    public screenshotDataURIs: string[] = [];
    public isInitDataNotAlreadyAvailable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public screenshotBuildCheckDone: Subject<boolean> = new Subject<boolean>();
    public promptSocialOnboarding: Subject<void> = new Subject<void>();
    public socialOnboardingActionSheetOptions: ActionSheetOptions;
    public socialOnboardingCancelButton: any;
    public isPlatformTablet: boolean = false;
    public gcmSenderID: string = "796017776918";
    public isPushNotificationInitialized: boolean = false;
    public socialOnboarding: boolean = false;

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

    constructor(
        public navCtrl: NavController,
        public tabService: TabService,
        public display: DisplayService,
        public globalService: GlobalService,
        public platform: Platform,
        public alertCtrl: AlertController,
        public dataService: DataService,
        public service: NewsTabService,
        public menuCtrl: MenuController,
        public backgroundGeolocationService: BackgroundGeolocationService,
        public storage: Storage,
        public modalCtrl: ModalController,
        public translate: TranslateService,
        public socialService: SocialService,
        public actionSheetCtrl: ActionSheetController,
        public appSession: AppSessionService,
        public tabSession: TabSessionService
    ) {
        if ((platform.is("tablet") || platform.is("ipad"))) {
            this.isPlatformTablet = true;
        }
        if (!DataService.isPreviewApp) {
            platform.ready().then(() => {
                NativeStorage.getItem("initData").then(data => {
                    this.globalService.initData = data;
                    this.handleSocialOnboarding();
                    this.globalService.initData.subTabs = Object.keys(this.globalService.initData.subTabs).map(i => this.globalService.initData.subTabs[i]);
                    // Get user profile info
                    this.getUserProfileInfo();

                    this.globalService.tabs = this.globalService.initData.tabData;
                    if (data.timeSettings) {
                        this.globalService.timeFormatSettings = this.globalService.initData.timeSettings.date_time_format;
                    }
                    this.globalService.mySlideOptions = {
                        initialSlide: 0,
                        zoom: true,
                        loop: true,
                        speed: 3000,
                        autoplayDisableOnInteraction: false,
                        autoplay: (this.isPlatformTablet ? this.globalService.initData.appData.tab_slider_type : this.globalService.initData.appData.slider_type) == 1 ? null : 3000,
                        effect: (this.isPlatformTablet ? this.globalService.initData.appData.tab_slider_type : this.globalService.initData.appData.slider_type) == 3 ? 'fade' : '',
                        parallax: (this.isPlatformTablet ? this.globalService.initData.appData.tab_slider_type : this.globalService.initData.appData.slider_type) == 4 ? true : false
                    };
                    this.globalService.isSliderInitialize = true;
                    this.globalService.checkMusicTabSettings(this.globalService.tabs);
                    this.screenshotBuildCheckDone.subscribe(isDone => {
                        if (!this.isScreenshotMaker) {
                            this.checkMemberLogin();

                            // Initialize push notification processes, just after member login checks
                            this.preInitPushNotification();
                        }
                        this.appSession.appReady.next(this.isScreenshotMaker);
                        this.appSession.appReady.complete();
                    });


                    this.globalService.isInit = false;
                    this.globalService.resizeFirstPageContent();
                    this.isNativeStorageData = true;
                    this.globalService.initTabRowsIterator();
                    this.globalService.initTabColsIterator();
                    this.globalService.initTabColIterator();
                    if (this.globalService.initData.homeScreenSettings && this.globalService.initData.homeScreenSettings.layout) {
                        if (!parseInt(this.globalService.initData.homeScreenSettings.layout.show_status_bar)) {
                            StatusBar.hide();
                        }
                    }
                    this.hideSplashScreen();
                }).catch(err => {
                    this.isInitDataNotAlreadyAvailable.next(true);
                    console.log(err, "No previously stored data found");
                });
                NativeStorage.getItem("buttonBgImageSrcs").then(data => {
                    this.globalService.buttonBgImageSrcs = data;
                }).catch(err => {
                    console.log(err, "No previously stored data found");
                });
                NativeStorage.getItem("headerBgImageSrcs").then(data => {
                    this.globalService.headerBgImageSrcs = data;
                }).catch(err => {
                    console.log(err, "No previously stored data found");
                });
                NativeStorage.getItem("tabHeaderBgImageSrcs").then(data => {
                    this.globalService.tabHeaderBgImageSrcs = data;
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
                        this.screenshotBuildCheckDone.subscribe(isDone => {
                            if (!this.isScreenshotMaker) {
                                this.promptSocialOnboarding.next();
                            }
                        });
                    }
                }).catch(err => {
                    console.log(err, "No previously stored data found");
                });
                NativeStorage.getItem("font").then(data => {
                    this.globalService.font = data;
                    this.setFontFamily();
                }).catch(err => {
                    console.log(err, "No previously stored data found");
                });
                NativeStorage.getItem("homeScreenSliders").then(data => {
                    this.globalService.homeScreenSliders = data;
                }).catch(err => {
                    console.log(err, "No previously stored data found");
                });
                NativeStorage.getItem("appEmailMarketingConfigData").then(data => {
                    this.globalService.appEmailMarketingConfigData = data;
                    this.screenshotBuildCheckDone.subscribe(isDone => {
                        if (!this.isScreenshotMaker) {
                            this.globalService.checkTabAddedInEmailMarketting(0);
                        }
                    });
                }).catch(err => {
                    console.log(err, "No previously stored data found");
                });
                if (platform.is("cordova") && platform.is("ios")) {
                    this.getAppCodeFromConfigXML();
                } else {
                    this.getAppCodeFromPackageName();
                }
            });
        } else {
            // This is the Preview App.
            this.getTabs();
        }
    }

    public getAppCodeFromConfigXML(): void {
        this.globalService.readConfig().then((doc: Document) => {
            let screenshotAppCodeElement: Element = doc.getElementsByName("ScreenshotAppCode").item(0);
            let screenshotTargetElement: Element = doc.getElementsByName("ScreenshotTarget").item(0);
            let screenshotAppCode: string = screenshotAppCodeElement.attributes.getNamedItem("value").value;
            if (screenshotAppCode !== "none") {
                // This is a screenshot build running on iOS simulator.
                this.isScreenshotMaker = true;
                this.screenshotBuildCheckDone.next(true);
                DataService.appCode = screenshotAppCode;
                this.globalService.isAppCodeAvailable.next(true);
                this.appSession.appCodeReady.next(DataService.appCode);
                this.appSession.appCodeReady.complete();
                this.screenshotType = parseInt(screenshotTargetElement.attributes.getNamedItem("value").value);
                this.getTabs();
            } else {
                this.getAppCodeFromPackageName();
            }
        });
    }

    public getAppCodeFromPackageName(): void {
        this.screenshotBuildCheckDone.next(true);
        // Getting the App Code from the Package Name.
        // NO API SHOULD BE CALLED BEFORE THIS PROMISE RESOLVES (OR REJECTS, IF IT'S RUNNING ON BROWSER)
        AppVersion.getPackageName().then(packageName => {
            DataService.appCode = packageName.split(".")[1];
            this.globalService.isAppCodeAvailable.next(true);
            this.appSession.appCodeReady.next(DataService.appCode);
            this.appSession.appCodeReady.complete();
            this.isInitDataNotAlreadyAvailable.subscribe(notAvailable => {
                if (notAvailable) {
                    this.clearDeviceMemberID();
                }
            });
            this.getTabs();
        }).catch(err => {
            console.log(err);
            this.appSession.appCodeReady.next(DataService.appCode);
            this.appSession.appCodeReady.complete();
            this.getTabs();
        });
    }

    public getTabs(): void {
        this.tabService.getTabs().subscribe((res) => {
            this.hideSplashScreen();
            if (res.success) {
                this.globalService.tabs = res.data.tabData;
                this.globalService.checkMusicTabSettings(this.globalService.tabs);
                this.globalService.initData = res.data;
                this.handleSocialOnboarding();
                this.globalService.initData.subTabs = Object.keys(this.globalService.initData.subTabs).map(i => this.globalService.initData.subTabs[i]);
                // Get user profile info
                if (!this.socialService.isUserProfileDataRetrieved) {
                    this.getUserProfileInfo();
                }

                if (!this.isScreenshotMaker && !DataService.isPreviewApp) {
                    if (res.data.gcmSenderID) {
                        this.gcmSenderID = res.data.gcmSenderID;
                        this.storeGCMSenderID(this.gcmSenderID);
                    }
                    this.initPushNotification();
                }

                if (this.globalService.initData.timeSettings && this.globalService.initData.appShareConfigData) {
                    if (this.globalService.initData.appShareConfigData.mobile_website_redirect == 1 && (this.globalService.initData.timeSettings.android_url || this.globalService.initData.timeSettings.ios_url)) {
                        this.checkDeviceType(this.globalService.initData.timeSettings.android_url, this.globalService.initData.timeSettings.ios_url);
                    }
                }
                if (res.data.timeSettings) {
                    this.globalService.timeFormatSettings = res.data.timeSettings.date_time_format;
                    this.checkMobileWebsiteDisabled(res.data.timeSettings.mobile_website_enabled);
                }
                this.globalService.mySlideOptions = {
                    initialSlide: 0,
                    zoom: true,
                    loop: true,
                    speed: 3000,
                    autoplayDisableOnInteraction: false,
                    autoplay: (this.isPlatformTablet ? this.globalService.initData.appData.tab_slider_type : this.globalService.initData.appData.slider_type) == 1 ? null : 3000,
                    effect: (this.isPlatformTablet ? this.globalService.initData.appData.tab_slider_type : this.globalService.initData.appData.slider_type) == 3 ? 'fade' : '',
                    parallax: (this.isPlatformTablet ? this.globalService.initData.appData.tab_slider_type : this.globalService.initData.appData.slider_type) == 4 ? true : false
                };
                this.globalService.isSliderInitialize = true;

                console.log(this.globalService.initData.homeScreenSliders);
                this.globalService.appTabTitleLanguages = res.data.appLanguageData;
                this.globalService.appScreenConfigData = res.data.appScreenConfigData;
                this.globalService.homeScreenSliders = res.data.homeScreenSliders;
                this.globalService.appEmailMarketingConfigData = res.data.appEmailMarketingConfigData;
                this.globalService.isInit = false;
                if (!this.isNativeStorageData && !this.isScreenshotMaker) {
                    this.checkLanguageTabAdded(this.globalService.tabs);
                    this.checkMemberLogin();
                    this.promptSocialOnboarding.next();
                    this.globalService.checkTabAddedInEmailMarketting(0);
                }

                // Fire app ready event
                this.appSession.appReady.next(this.isScreenshotMaker);
                this.appSession.appReady.complete();

                this.globalService.resizeFirstPageContent();
                this.globalService.initTabRowsIterator();
                this.globalService.initTabColsIterator();
                this.globalService.initTabColIterator();
                if (this.globalService.initData.homeScreenSettings && this.globalService.initData.homeScreenSettings.layout) {
                    this.globalService.initData.homeScreenSettings.layout.traditional_tab_number = parseInt(this.globalService.initData.homeScreenSettings.layout.traditional_tab_number);
                    if (!parseInt(this.globalService.initData.homeScreenSettings.layout.show_status_bar)) {
                        StatusBar.hide();
                    }
                }

                for (let image of res.data.home_buttons_images) {
                    this.globalService.buttonBgImageSrcs[image.id] = image.name;
                }
                for (let image of res.data.home_header_image) {
                    this.globalService.headerBgImageSrcs[image.id] = image.name;
                }
                for (let image of res.data.global_image_header) {
                    this.globalService.tabHeaderBgImageSrcs[image.id] = image.name;
                }
                for (let font of res.data.font_list) {
                    this.globalService.font[font.id] = font.value;
                }
                this.setFontFamily();
                this.storeDataInNativeStorage();
                this.backgroundGeolocationService.fetchStoredLocations();

                if (this.globalService.tabAccess.length > 0) {
                    let tempTabs: any[] = [];
                    this.globalService.tabs.forEach((data) => {
                        if (this.globalService.tabAccess.indexOf(data.id) !== -1) {
                            tempTabs.push(data);
                        }
                    });
                    this.globalService.tabs = tempTabs;

                    let tempSubTabs: any[] = [];
                    this.globalService.initData.subTabs.forEach((data) => {
                        if (this.globalService.tabAccess.indexOf(data.tab_id) !== -1) {
                            tempSubTabs.push(data);
                        }
                    });
                    this.globalService.initData.subTabs = tempSubTabs;
                }
                if (this.globalService.tabs.length > 0) {
                    this.fetchNewsData();
                }

                // Just some code related to screenshot generation.
                if (this.isScreenshotMaker) {
                    setTimeout(() => this.generateScreenshots(), 5000);
                }
            } else {
                console.log("Server error occured");
            }
        });
    }

    private storeDataInNativeStorage(): void {
        NativeStorage.setItem("initData", this.globalService.initData).then(() => {
            console.log("Init data stored in native storage.");
        }).catch(err => {
            console.log("Init data native storage failed", err);
        });
        NativeStorage.setItem("buttonBgImageSrcs", this.globalService.buttonBgImageSrcs).then(() => {
            console.log("buttonBgImageSrcs stored in native storage.");
        }).catch(err => {
            console.log("buttonBgImageSrcs native storage failed", err);
        });
        NativeStorage.setItem("headerBgImageSrcs", this.globalService.headerBgImageSrcs).then(() => {
            console.log("headerBgImageSrcs stored in native storage.");
        }).catch(err => {
            console.log("headerBgImageSrcs native storage failed", err);
        });
        NativeStorage.setItem("tabHeaderBgImageSrcs", this.globalService.tabHeaderBgImageSrcs).then(() => {
            console.log("tabHeaderBgImageSrcs stored in native storage.");
        }).catch(err => {
            console.log("tabHeaderBgImageSrcs native storage failed", err);
        });
        NativeStorage.setItem("font", this.globalService.font).then(() => {
            console.log("font stored in native storage.");
        }).catch(err => {
            console.log("font native storage failed", err);
        });
        NativeStorage.setItem("appTabTitleLanguages", this.globalService.appTabTitleLanguages).then(() => {
            console.log("tab title translated data stored in native storage.");
        }).catch(err => {
            console.log("tab title translated data storage failed", err);
        });
        NativeStorage.setItem("appScreenConfigData", this.globalService.appScreenConfigData).then(() => {
            console.log("app screen config data stored in native storage.");
        }).catch(err => {
            console.log("app screen config data storage failed", err);
        });
        NativeStorage.setItem("homeScreenSliders", this.globalService.homeScreenSliders).then(() => {
            console.log("home screen sliders data stored in native storage.");
        }).catch(err => {
            console.log("home screen sliders data storage failed", err);
        });
        NativeStorage.setItem("appEmailMarketingConfigData", this.globalService.appEmailMarketingConfigData).then(() => {
            console.log("app email marketing config data stored in native storage.");
        }).catch(err => {
            console.log("app screen config data storage failed", err);
        });
    }

    public pushPage(tabFunctionCode: string, tabId: number, title: string, tab_data: any, tab_nav_type: string): void {
        let bgImage = this.globalService.checkPlatform(tab_data);
        let subTabId = tab_nav_type == 'subtab' ? tab_data.id : null;
        let detail = { tabId: tabId, bgImage: bgImage, tab_nav_type: tab_nav_type, subTabId: subTabId };

        // Create and save tab session
        this.tabSession.create(tabId);

        if (tabFunctionCode === "website_tab" || tabFunctionCode === "contact_us" || tabFunctionCode === "pdf_tab" || tabFunctionCode === "email_forms") {
            this.display.showLoader();
            this.loader = true;
            this.tabService.getGateway(tabFunctionCode, tabId).subscribe((res) => {
                this.loader = false;
                this.display.hideLoader();
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
            this.navCtrl.push(this.pages[tabFunctionCode], {
                tabId: tabId,
                title: title,
                tab_nav_type: tab_nav_type,
                subTabId: subTabId,
                bgImage: bgImage,
                settings: tab_data.settings
            }).catch(err => {
                console.log('View cant enter', err);
                if (this.globalService.viewCantEnter) {
                    this.globalService.viewCantEnter.next(true);
                    this.globalService.viewCantEnter.complete();
                }
            });
        }
    }

    private setFontFamily(): void {
        if (this.globalService.initData.globalStyleSettings && this.globalService.initData.globalStyleSettings.fonts) {
            let fontFamily: string = this.globalService.font[this.globalService.initData.globalStyleSettings.fonts.font_id];
            let x = document.createElement("STYLE");
            let t = document.createTextNode("* {font-family:" + fontFamily + ";}");
            x.appendChild(t);
            document.head.appendChild(x);
        }
    }

    private openWebsite(res, detail): void {
        if (res.data.is_donation_request) {
            window.open(res.data.url, "_system");
        } else if (this.platform.is("cordova") && this.platform.is("ios") && res.data.use_safari_webview) {
            this.openSafariViewController(res);
        } else if (this.platform.is("cordova") && (this.platform.is('ios') || this.platform.is('android'))) {
            let urlSplit: string[] = res.data.url.split(".");
            if (this.platform.is("android") && urlSplit[urlSplit.length - 1].toLowerCase() === "pdf") {
                window.open(res.data.url, "_system");
            } else {
                this.openThemeableBrowser(res);
            }
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
        let headerBackgroundURL: string = this.globalService.tabHeaderBgImageSrcs[this.globalService.initData.individualSettings[res.data.id] ? this.globalService.initData.individualSettings[res.data.id].header.background_img : this.globalService.initData.globalStyleSettings.header.background_img];
        let splittedHeaderBackgroundURL: string[] = headerBackgroundURL ? headerBackgroundURL.split("/") : [];
        let headerBackgroundName: string = splittedHeaderBackgroundURL[splittedHeaderBackgroundURL.length - 1];
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
                wwwImage: "assets/bg-imgs/" + headerBackgroundName
            },
            closeButton: {
                wwwImage: 'assets/icon/back-arrow-25.png',
                imagePressed: 'close_pressed',
                align: 'left',
                event: 'closePressed'
            },
            transitionstyle: 'crossdissolve'
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

    private hideSplashScreen(): void {
        if (!this.splashScreenHidden) {
            setTimeout(() => {
                Splashscreen.hide();
            }, 500);
            this.splashScreenHidden = true;
        }
    }

    public checkMemberLogin(): void {
        if (this.globalService.tabs) {
            for (let tab of this.globalService.tabs) {
                if (tab.settings) {
                    let tabSettings = JSON.parse(tab.settings);
                    if (tabSettings.member_login) {
                        this.globalService.membershipLoginFormColor = tabSettings.login_color;
                        this.globalService.membershipLoginInputColor = 'inset 0 -1px 0 0 ' + tabSettings.login_color;

                        this.globalService.isMemberLogin = true;
                        this.globalService.membershipLoginBg = tab.bgImage;

                        if (tabSettings.type == membershipLoginTypeMulti) {
                            this.globalService.membershipLoginType = membershipLoginTypeMulti;
                        }
                        if (tabSettings.type == membershipLoginTypeSingle) {
                            this.globalService.membershipLoginType = membershipLoginTypeSingle;
                        }

                        if (tabSettings.guest_login) {
                            this.globalService.isGuestLoginEnabled = true;
                        }
                    }
                }
            }
        }
    }

    public initPushNotification() {
        if (this.isPushNotificationInitialized || !this.platform.is('cordova') || this.platform.is("browser")) {
            console.warn("Push notifications not initialized. Cordova is not available - Run in physical device");
            return;
        }
        this.isPushNotificationInitialized = true;
        let push = Push.init({
            android: {
                senderID: this.gcmSenderID,
                icon: "icon"
            },
            ios: {
                senderID: this.gcmSenderID,
                alert: true,
                badge: true,
                sound: true,
                gcmSandbox: false
            }
        });

        try {
            push.on("registration", (data) => {
                console.log("Device Token: ", data.registrationId);
                this.saveRegistrationDetails(data.registrationId);
            });

            push.on("notification", (data) => {
                this.savePushNotificationCount();
                if (data.additionalData.foreground) {
                    // If the notification comes when the app is active
                    this.handleAppActiveNotification(data);
                } else {
                    this.handleAppInactiveNotification(data);
                }
            });

            push.on('error', (e) => {
                console.log("Push Notification Error: ", e.message);
            });
        } catch (e) {
            console.error("Caught Exception:", e);
        }
    }

    public saveRegistrationDetails(deviceToken: string): void {
        let data: any = {
            platform: this.platform.is('android') ? 1 : 2,
            device_token: deviceToken,
            device_uuid: Device.uuid
        };
        AppVersion.getPackageName().then(packageName => {
            data.app_code = packageName.split(".")[1];
            this.globalService.registerDevice(data).subscribe(res => {
                if (res.success) {
                    console.log("Device registration details saved");
                    // Start tracking background geolocation
                    this.backgroundGeolocationService.configureAndStartBackgroundGeolocation(data.app_code);
                } else {
                    console.log("Error occured while saving device registration details: ", res.message);
                }
            });
        }).catch(err => {
            console.log("App Version Plugin error: ", err);
        });
    }

    public handleAppActiveNotification(data: any): void {
        if (data.additionalData.type === "inbox") {
            let confirm = this.alertCtrl.create({
                title: "New Message",
                message: data.message,
                buttons: [
                    { text: "Cancel" },
                    {
                        text: parseInt(data.additionalData.content_type) === CONTENT_TYPE_NONE ? "Ok" : "View",
                        handler: () => this.handleNotificationData(data)
                    }
                ]
            });
            confirm.present();
        }
    }

    public handleAppInactiveNotification(data: any): void {
        if (parseInt(data.additionalData.content_type) === CONTENT_TYPE_NONE) {
            this.handleAppActiveNotification(data);
        } else {
            if (data.additionalData.type === "inbox") {
                this.handleNotificationData(data);
            }
        }
    }

    public inboxTabExists(): boolean {
        if (this.doesInboxTabExist === null) {
            for (let tab of this.globalService.tabs) {
                if (tab.tab_func_code === "inbox") {
                    this.inboxTab = tab;
                    return this.doesInboxTabExist = true;
                }
            }
            return this.doesInboxTabExist = false;
        } else {
            return this.doesInboxTabExist;
        }
    }

    public handleNotificationData(data): void {
        data.additionalData.content_type = parseInt(data.additionalData.content_type);
        switch (data.additionalData.content_type) {
            case CONTENT_TYPE_WEBSITE_URL:
                let inboxTabId: number = 0;
                if (this.inboxTabExists()) {
                    inboxTabId = this.inboxTab.id;
                }
                this.openWebViewForNotification(data.additionalData.website_url, inboxTabId);
                break;
            case CONTENT_TYPE_TAB_LINK:
                this.dataService.getByID(this.globalService.tabs, parseInt(data.additionalData.tab_id), (tab, index) => {
                    this.pushPage(tab.tab_func_code, tab.id, tab.title, tab, 'tab');
                });
                break;
            case CONTENT_TYPE_NONE:
                // this.dataService.getByID(this.globalService.tabs, parseInt(data.additionalData.tab_id), (tab, index) => {
                //     this.pushPage(tab.tab_func_code, tab.id, tab.title, tab, 'tab');
                // });
                if (this.inboxTabExists()) {
                    this.pushPage(this.inboxTab.tab_func_code, this.inboxTab.id, this.inboxTab.title, this.inboxTab, 'tab');
                }
                break;

        }
    }

    public openWebViewForNotification(url: string, inboxTabId: number) {
        if (this.platform.is('ios') || this.platform.is('android')) {
            let options: any = {
                title: {
                    color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[inboxTabId] ? this.globalService.initData.individualSettings[inboxTabId].header.text_color : this.globalService.initData.globalStyleSettings.header.text_color),
                    background_color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[inboxTabId] ? this.globalService.initData.individualSettings[inboxTabId].header.background_color : this.globalService.initData.globalStyleSettings.header.background_color),
                },
                toolbar: {
                    height: 56,
                    color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[inboxTabId] ? this.globalService.initData.individualSettings[inboxTabId].header.background_color : this.globalService.initData.globalStyleSettings.header.background_color),
                },
                closeButton: {
                    wwwImage: 'assets/icon/back-arrow-25.png',
                    imagePressed: 'close_pressed',
                    align: 'left',
                    event: 'closePressed'
                },
                transitionstyle: 'crossdissolve'
            };
            options.statusbar = { color: options.title.background_color };
            let isLoaderActive: boolean = false;
            cordova.ThemeableBrowser.open(url, '_blank', options).addEventListener(cordova.ThemeableBrowser.EVT_ERR, (e) => {
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
        }
    }

    public fetchNewsData(): void {
        let ids: any[] = [];
        for (let i = 0; i < this.globalService.tabs.length; i++) {
            if (this.globalService.tabs[i].tab_func_code === "news") {
                console.log('tab data+++++++++', this.globalService.tabs[i]);
                ids.push(this.globalService.tabs[i].id);
            }
        }
        console.log('ids', ids);
        this.service.getNewsFeed(ids).subscribe((res) => {
            if (res.success) {
                this.service.newsTabData = res.data;
                console.log('this.service.newsTabData', this.service.newsTabData);
                for (var key in res.data) {
                    var value = res.data[key];
                    console.log('data', value);
                    if (value.show_news_home == 1) {
                        this.service.newsFeedData = value;
                        if (!this.globalService.isObjectEmpty(this.service.newsFeedData)) {
                            this.globalService.resizeFirstPageContent();
                        }
                        console.log('this.service.newsFeedData', this.service.newsFeedData);
                        break;
                    }
                }
            }
            else {
                console.log(res.message);
            }
        });
    }

    private generateScreenshots(): void {
        // Take the screenshot of the home page.
        this.saveScreenshot();

        // Then open the slider menu
        if (this.globalService.initData.homeScreenSettings && this.globalService.initData.homeScreenSettings.layout && this.globalService.initData.homeScreenSettings.layout.home_layout != 1) {
            this.menuCtrl.open();

            // Take a screenshot after 2 seconds, hoping the menu has opened.
            setTimeout(() => {
                this.saveScreenshot();
                // Start the first tab's screenshot process after 2 seconds so that the dimming of menu
                // during navigation on ios doesn't have any effect on its screenshot.
                setTimeout(() => this.takeFirstTabScreenshot(), 2000);
            }, 2000);
        } else {
            this.takeFirstTabScreenshot();
        }

    }

    private takeFirstTabScreenshot(): void {
        if (this.globalService.tabs.length) {
            setTimeout(() => this.saveLastScreenshot(), 7000);
            this.globalService.appEmailMarketingConfigData = null;
            this.pushPage(this.globalService.tabs[0].tab_func_code, this.globalService.tabs[0].id, this.globalService.tabs[0].title, this.globalService.tabs[0], 'tab');
        }
    }

    private saveScreenshot(): Promise<any> {
        return new Promise((resolve, reject) => {
            Screenshot.URI().then(data => {
                console.log("Screenshot generated", data);
                this.screenshotDataURIs.push(data.URI);
                resolve();
            }).catch(err => resolve());
        });
    }

    private saveLastScreenshot(): void {
        let screenshotFiles: File[] = [];
        this.saveScreenshot().then(() => {
            for (let i = 0; i < this.screenshotDataURIs.length; i++) {
                screenshotFiles.push(this.globalService.dataURIToFile(this.screenshotDataURIs[i]));
            }
            this.globalService.saveScreenshots(screenshotFiles, this.screenshotType).subscribe(res => {
                if (res.success) {
                    console.log("Screenshots saved on server.");
                } else {
                    console.log("Screenshot saving error:", res.message);
                }
            });
        });
    }

    private clearDeviceMemberID(): void {
        this.globalService.clearDeviceMemberID().subscribe(res => {
            if (res.success) {
                console.log("Device member id cleared");
            } else {
                console.log("Clear device member id:", res.message);
            }
        })
    }

    public checkLanguageTabAdded(list: any[]): void {
        let language_tab_data = list.filter((list) => {
            return list.tab_func_code === "language";
        });
        console.log("language_tab_data", language_tab_data)
        if (language_tab_data.length > 0) {
            this.storage.get('hasLanguageSelected')
                .then((hasLanguageSelected) => {
                    if (!hasLanguageSelected) {
                        let modal = this.modalCtrl.create(LanguageSelector, { tabId: language_tab_data[0].id });
                        modal.onDidDismiss(data => {
                            this.globalService.currentLanguage = data.language;
                            this.translate.use(data.language);
                        });
                        modal.present();
                    }
                });
        }
    }

    public onCheckLogin(): void {
        this.isFacebookLoggedIn().then(isFacebookLoggedIn => {
            this.isTwitterLoggedIn().then(isTwitterLoggedIn => {
                this.showSocialOnboardingPrompt(isFacebookLoggedIn, isTwitterLoggedIn);
            });
        });
    }

    private handleFacebook(isFacebookLoggedIn: boolean): boolean {
        if (isFacebookLoggedIn) {
            SocialMedia.logoutFacebook()
                .then(() => this.onLogout("Facebook", 0))
                .catch(err => this.display.showToast(err));
        } else {
            SocialMedia.loginFacebook()
                .then(() => this.onLogin("Facebook", 0))
                .catch(err => this.display.showToast(err));
        }
        return false;
    }

    private handleTwitter(isTwitterLoggedIn: boolean): boolean {
        if (isTwitterLoggedIn) {
            SocialMedia.logoutTwitter()
                .then(() => this.onLogout("Twitter", 1))
                .catch(err => this.display.showToast(err));
        } else {
            SocialMedia.loginTwitter()
                .then(() => this.onLogin("Twitter", 1))
                .catch(err => this.display.showToast(err));
        }
        return false;
    }

    public checkDeviceType(android_url, ios_url): void {
        if ((this.platform.is("mobile")) && (this.platform.is("mobileweb")) && !DataService.getQueryVariable("ionicplatform")) {
            if ((this.platform.is("android"))) {
                //Redirect to playstore url
                if (android_url) {
                    window.location.href = android_url;
                }
            }
            if ((this.platform.is("ios"))) {
                //Redirect to appstore url
                if (ios_url) {
                    window.location.href = ios_url;
                }
            }
        }
    }

    private getUserProfileInfo(): void {
        let id = this.globalService.initData.appData.id;
        this.globalService.getUserInfo(id).subscribe(res => {
            if (res.success) {
                this.socialService.isUserProfileDataRetrievalFinished = true;
                this.socialService.userProfileDataBehaviorSubject.next(true);
                if (res.data) {
                    this.socialService.isUserProfileDataRetrieved = true;
                    this.socialService.userProfileData = res.data;
                }
            } else {
                console.log(res.message);
            }
        });
    }

    private checkMobileWebsiteDisabled(mobileWebsiteStatus: number): void {
        if (mobileWebsiteStatus === MOBILE_WEBSITE_DISABLED && !this.platform.is("cordova") && !DataService.getQueryVariable("ionicplatform")) {
            this.navCtrl.setRoot(MobileWebsiteDisabled).then(() => {
                this.navCtrl.getActive().pageRef().nativeElement.removeAttribute("hidden");
            });
        }
    }

    private handleSocialOnboarding(): void {
        if (!this.platform.is("cordova")) {
            return;
        }
        if(!this.socialOnboarding && (this.globalService.initData.appScreenConfigData ? this.globalService.initData.appScreenConfigData.social_onboarding : false)) {
            let subscription: Subscription = this.promptSocialOnboarding.subscribe(() => {
                this.onCheckLogin();
                subscription.unsubscribe();
            });
            this.socialOnboarding = true;
        }
    }

    public savePushNotificationCount(): void {
        console.log("savePushNotificationCount");
        AppVersion.getPackageName().then(packageName => {
            let app_code = packageName.split(".")[1];
            let data = { app_code: app_code, device_uuid: Device.uuid };
            this.globalService.savePushNotiCount(data).subscribe(res => {
                if (res.success) {
                    console.log("count incremented successfully");
                } else {
                    console.log("Error occured while saving device registration details: ", res.message);
                }
            });
        }).catch(err => {
            console.log("App Version Plugin error: ", err);
        });
    }

    private isFacebookLoggedIn(): Promise<boolean> {
        return new Promise(resolve => {
            SocialMedia.getStoredFacebookUser()
                .then(() => resolve(true))
                .catch(() => resolve(false));
        });
    }

    private isTwitterLoggedIn(): Promise<boolean> {
        return new Promise(resolve => {
            SocialMedia.getStoredTwitterUser()
                .then(() => resolve(true))
                .catch(() => resolve(false));
        });
    }

    private showSocialOnboardingPrompt(isFacebookLoggedIn: boolean, isTwitterLoggedIn: boolean): void {
        let cancelText: string = (isFacebookLoggedIn || isTwitterLoggedIn) ? "Next" : "Skip";
        this.socialOnboardingCancelButton = { icon: "arrow-forward", text: cancelText, role: "cancel" }
        this.socialOnboardingActionSheetOptions = {
            title: "Social Connect",
            buttons: [
                {
                    icon: "logo-facebook",
                    text: "Facebook (" + (isFacebookLoggedIn ? "LOGOUT" : "CONNECT") + ")",
                    handler: () => this.handleFacebook(isFacebookLoggedIn)
                },
                {
                    icon: "logo-twitter",
                    text: "Twitter (" + (isTwitterLoggedIn ? "LOGOUT" : "CONNECT") + ")",
                    handler: () => this.handleTwitter(isTwitterLoggedIn)
                },
                this.socialOnboardingCancelButton
            ]
        };
        let actionSheet: ActionSheet = this.actionSheetCtrl.create(this.socialOnboardingActionSheetOptions);
        actionSheet.present();
    }

    private onLogin(socialMediaName: string, buttonIndex: number): void {
        this.socialOnboardingActionSheetOptions.buttons[buttonIndex].text = socialMediaName + " (LOGOUT)";
        this.socialOnboardingActionSheetOptions.buttons[buttonIndex].handler = () => this["handle" + socialMediaName](true);
        this.socialOnboardingCancelButton.text = "Next";
    }

    private onLogout(socialMediaName: string, buttonIndex: number): void {
        this.socialOnboardingActionSheetOptions.buttons[buttonIndex].text = socialMediaName + " (CONNECT)";
        this.socialOnboardingActionSheetOptions.buttons[buttonIndex].handler = () => this["handle" + socialMediaName](false);
        this.socialOnboardingCancelButton.text = "Skip";
    }

    private preInitPushNotification(): void {
        this.getStoredGCMSenderID().then(id => {
            if (id) {
                this.gcmSenderID = id;
            }
            console.log("Calling init push notification with stored gcm sender id.");
            this.initPushNotification();
        });
    }

    private getStoredGCMSenderID(): Promise<string> {
        return new Promise(resolve => {
            NativeStorage.getItem("gcmSenderID").then(data => {
                resolve(data);
            }).catch(err => {
                resolve(undefined);
            });
        });
    }

    private storeGCMSenderID(gcmSenderID: string): void {
        NativeStorage.setItem("gcmSenderID", gcmSenderID).then(() => {
            console.log("GCM Sender ID stored in native storage:", gcmSenderID);
        }).catch(err => {
            console.log("Failed to store GCM Sender ID in native storage:", gcmSenderID);
        });
    }

}
