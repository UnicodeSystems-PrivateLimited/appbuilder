import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { InboxTabService, DisplayService, GlobalService, DataService, TabService, TabSessionService, BackgroundGeolocationService } from '../../providers';
import { InboxTabData, MemberLoginData } from "../../interfaces/common-interfaces";
import { LaunchNavigator, ThemeableBrowser, SocialSharing, SQLite, NativeStorage, Printer, PrintOptions, SafariViewController } from "ionic-native";

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
import { InboxSubscription } from "../inbox-subscription/inbox-subscription";
import { PdfViewer } from "../pdf-viewer/pdf-viewer";
import { NewsTab } from '../news-tab/news-tab';
import { MusicTab } from '../music-tab/music-tab';
import { QrCouponsTab } from '../qr-coupons-tab/qr-coupons-tab';
import { GpsCouponTab } from '../gps-coupon-tab/gps-coupon-tab';
import { LoyaltyTab } from '../loyalty-tab/loyalty-tab';
import { MailingListTab } from '../mailing-list-tab/mailing-list-tab';
import { LanguageTab } from '../language-tab/language-tab';
import { PictureGalleryPhotos } from "../picture-gallery-photos/picture-gallery-photos";
declare var cordova: any;
import moment from 'moment';
import { ShoppingCartCategories } from '../shopping-cart-categories/shopping-cart-categories';
import { FoodOrdering } from '../food-ordering/food-ordering';

const AUDIENCE_SPECIFIC_AREA_USERS = 2;
const LOCATION_TYPE_POINT = 1;
const SPAN_TYPE_KILOMETERS = "Km";

@Component({
    selector: 'page-inbox-tab',
    templateUrl: 'inbox-tab.html'
})
export class InboxTab {
    public tabId: number;
    public appId: number;
    public title: string;
    public bgImage: string;
    public settingsIcon: number = 0;
    public loader: boolean = false;
    public allMessage: boolean = true;
    public tab: boolean = false;
    public weburl: boolean = false;
    public items: InboxTabData[] = [];
    public itemList: InboxTabData[] = [];
    public appStoreUrl: string;
    public appCode: string;
    public db: SQLite;
    public maxId: number;
    public itemsFromAPI: InboxTabData[] = [];
    public areItemsFromAPIRetrieved: boolean = false;

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
        news: NewsTab,
        qr_coupons: QrCouponsTab,
        gps_tab: GpsCouponTab,
        scholl_reward: LoyaltyTab,
        mailing_list: MailingListTab,
        language: LanguageTab,
        shopping_cart: ShoppingCartCategories,
        food_ordering: FoodOrdering
    };
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        public service: InboxTabService,
        public display: DisplayService,
        public globalService: GlobalService,
        public dataService: DataService,
        public tabService: TabService,
        public tabSession: TabSessionService,
        public location: BackgroundGeolocationService
    ) {
        platform.ready().then(() => {
            this.openDB();
        });
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.appId = this.globalService.initData.appData.id;
        if (platform.is("android")) {
            this.appStoreUrl = this.globalService.initData.appData.google_play_store_url;
        }
        else if (platform.is("ios")) {
            this.appStoreUrl = this.globalService.initData.appData.ios_app_store_url;
        }
        this.appCode = this.globalService.initData.appData.app_code;

    }

    public getInitData(): void {
        this.loader = true;
        this.checkMemberLoginAndGetUserName().then(username => {
            this.service.getInitData(this.appId, username).subscribe(res => {
                if (res.success) {
                    this.items = res.data.notiList;
                    if (res.data.settings && res.data.settings.subscription_service) {
                        this.settingsIcon = res.data.settings.subscription_service;
                    }
                    if (this.items.length > 0) {
                        this.insertMsg();
                    }
                } else {
                    console.log('Server error occured');
                }
                this.loader = false;
            });
        });
    }

    public openDB(): void {
        this.db = new SQLite();
        this.db.openDatabase({
            name: 'tappit.db',
            location: 'default'
        }).then(() => {
            this.createTable();
        }).catch(err => {
            this.handleDBError(err);
        });
    }

    public createTable(): void {
        this.db.executeSql("CREATE TABLE IF NOT EXISTS inbox (id INTEGER PRIMARY KEY,android_type INTEGER,iphone_type INTEGER, message TEXT,title TEXT,bgImage TEXT,tab_id INTEGER,app_id INTEGER,website_url TEXT,tab_func_code TEXT, created_at DATETIME DEFAULT NULL)", {}).then(() => {
            console.log("inbox table created/already exists");
            this.getNotiList();
            this.getInitData();
        }, err => {
            console.log("Table couldn't be created or opened :(");
            this.handleDBError(err);
        });
    }

    public handleDBError(err: any): void {
        console.log("DB Error:", err);
        this.display.showToast("Error occured in storing/retrieving messages");
    }


    public insertMsg(): void {
        let id: number;
        NativeStorage.getItem('maxIdInbox').then(data => {
            id = data;
            for (let item of this.items) {
                if (item.id > id) {
                    this.itemsFromAPI.push(item);
                    this.maxId = item.id;
                }
            }
            this.updateItemListAndInsertToDB();
            if (this.maxId) {
                this.saveMaxIDToNativeStorage();
            }
        }).catch(err => {
            this.itemsFromAPI = this.items;
            this.maxId = this.items[this.items.length - 1].id;
            this.updateItemListAndInsertToDB();
            if (this.maxId) {
                this.saveMaxIDToNativeStorage();
            }
        });
    }

    private updateItemListAndInsertToDB(): void {
        this.areItemsFromAPIRetrieved = true;
        if (!this.itemsFromAPI.length) {
            return;
        }
        this.removeOtherLocationNotifications();
        this.itemList = this.itemsFromAPI.reverse().concat(this.itemList);
        console.log("Inbox item list after API retrieval:", this.itemList);
        this.insertItemsToDB();
    }

    private insertItemsToDB(): void {
        let queries: any[] = [];
        for (let i = 0; i < this.itemsFromAPI.length; i++) {
            queries.push([
                "INSERT INTO inbox (id ,message, created_at,app_id,website_url,tab_func_code,bgImage,tab_id,title,android_type,iphone_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    this.itemsFromAPI[i].id,
                    this.itemsFromAPI[i].message,
                    this.itemsFromAPI[i].created_at,
                    this.itemsFromAPI[i].app_id,
                    this.itemsFromAPI[i].website_url,
                    this.itemsFromAPI[i].tab_func_code,
                    this.itemsFromAPI[i].bgImage,
                    this.itemsFromAPI[i].tab_id,
                    this.itemsFromAPI[i].title,
                    this.itemsFromAPI[i].android_type,
                    this.itemsFromAPI[i].iphone_type
                ]
            ]);
        }
        this.db.sqlBatch(queries).then(() => {
            console.log("Inbox items successfully stored in database");
        }).catch(err => {
            console.log("SQL Batch Error");
            this.handleDBError(err);
        })
    }

    private saveMaxIDToNativeStorage(): void {
        NativeStorage.setItem('maxIdInbox', this.maxId).then(() => {
            console.log(this.maxId);
        }).catch(err => {
            console.log(err);
        });
    }

    public getNotiList(): void {
        this.db.executeSql("SELECT id, message,title,tab_id,tab_func_code,bgImage,app_id,website_url,android_type,iphone_type, created_at FROM inbox ORDER BY created_at DESC", {}).then(resultSet => {
            for (let i = 0; i < resultSet.rows.length; i++) {
                this.itemList.push(resultSet.rows.item(i));
            }
            console.log('this.itemList');
            console.log(this.itemList);
        }, err => {
            this.handleDBError(err);
        });
    }


    public onDeleteClick(id: number): void {
        this.display.showConfirm("", "Are you sure you want to delete this message ?", () => this.deleteMsg(id));
    }

    public deleteMsg(id: number): void {
        this.db.executeSql("DELETE FROM inbox WHERE id=?", [id]).then(() => {
            this.display.showToast("Message deleted.");
            this.itemList.forEach((item, index) => {
                if (item.id === id) {
                    this.itemList.splice(index, 1);
                }
            });
        }, err => {
            this.handleDBError(err);
        });
    }

    public onAllClick(type: number): void {
        if (type == 1) {
            this.allMessage = true;
            this.tab = false;
            this.weburl = false;
        }

        if (type == 2) {
            this.allMessage = false;
            this.tab = false;
            this.weburl = true;
        }

        if (type == 3) {
            this.allMessage = false;
            this.tab = true;
            this.weburl = false;
        }
    }

    public pushPage(tabFunctionCode: string, tabId: number, title: string, bgImage: string, tab_data: any, tab_nav_type: string): void {
        let detail = { tabId: tabId, bgImage: bgImage, tab_nav_type: tab_nav_type };
        let subTabId = tab_nav_type == 'subtab' ? tab_data.id : null;
        // Create and save tab session
        this.tabSession.create(tabId);

        if (tabFunctionCode === "website_tab" || tabFunctionCode === "contact_us" || tabFunctionCode === "pdf_tab" || tabFunctionCode === "email_forms") {
            this.display.showLoader();
            this.loader = true;
            this.tabService.getGateway(tabFunctionCode, tabId).subscribe((res) => {
                this.display.hideLoader();
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
                                    subTabId: subTabId,
                                    tab_nav_type: tab_nav_type,
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
                console.log('View can\'t enter', err);
                if (this.globalService.viewCantEnter) {
                    this.globalService.viewCantEnter.next(true);
                    this.globalService.viewCantEnter.complete();
                }
            });
        }
    }

    public openWebView(url: string) {
        if (this.platform.is('ios') || this.platform.is('android')) {
            let options: any = {
                title: {
                    color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.text_color : this.globalService.initData.globalStyleSettings.header.text_color),
                    background_color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.background_color : this.globalService.initData.globalStyleSettings.header.background_color),

                },
                toolbar: {
                    height: 56,
                    color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.background_color : this.globalService.initData.globalStyleSettings.header.background_color),
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
            cordova.ThemeableBrowser.open(url, '_blank', options).addEventListener(cordova.ThemeableBrowser.EVT_ERR, function (e) {
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
    }

    public onSharingClick(): void {
        this.display.showShareActionSheet(() => {
            this.onShareByFacebook();
        }, () => {
            this.onShareByTwitter();
        }, () => {
            this.onShareByEmail();
        }, () => {
            this.onShareBySms();
        }, () => {
            this.onShareCancel();
        });
    }

    public onShareByFacebook(): void {
        SocialSharing.shareViaFacebook("Check out this app : " + this.appStoreUrl + "/mobile?appcode=" + this.appCode).then(() => {
            console.log("Facebook share success");
        }).catch(() => {
            if (!this.platform.is("ios")) {
                this.display.showToast("Facebook app not found.");
            }
        });
    }



    public onShareByTwitter(): void {
        SocialSharing.shareViaTwitter("Check out this app : " + this.appStoreUrl + "/mobile?appcode=" + this.appCode).then(() => {
            console.log("Twitter share success");
        }).catch(err => {
            if (!this.platform.is("ios")) {
                this.display.showToast("Twitter app not found.");
            }
            console.log(err);
        });
    }

    private onShareBySms(): void {
        SocialSharing.shareViaSMS("Check out this app : " + this.appStoreUrl + "/mobile?appcode=" + this.appCode, null).then(() => {
            console.log("SMS share success");
        }).catch(() => {
            this.display.showToast("Could not open SMS sender.");
        });
    }

    public onShareByEmail(): void {
        SocialSharing.canShareViaEmail().then(() => {
            SocialSharing.shareViaEmail("Check out this app : " + this.appStoreUrl + "/mobile?appcode=" + this.appCode, this.appCode, []).then(() => {
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

    public onSettingsClick(): void {
        this.navCtrl.push(InboxSubscription, {
            tabId: this.tabId,
            bgImage: this.bgImage,
            title: this.title,
            appId: this.appId,
            tab_nav_type: this.tab_nav_type,
            subTabId: this.subTabId
        });
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
            },
            transitionstyle: 'crossdissolve'
        };

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

        options.statusbar = { color: options.title.background_color };
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

    private checkMemberLoginAndGetUserName(): Promise<string> {
        return new Promise(resolve => {
            if (this.globalService.tabs) {
                for (let i = 0; i < this.globalService.tabs.length; i++) {
                    if (this.globalService.tabs[i].settings) {
                        let settings = JSON.parse(this.globalService.tabs[i].settings);
                        if (settings.member_login) {
                            NativeStorage.getItem("memberLoginData").then(memberLoginData => resolve(memberLoginData.userName)).catch(err => {
                                console.log("Member Login Data", err);
                                resolve()
                            });
                            break;
                        }
                    }
                }
                resolve();
            } else {
                resolve();
            }
        });
    }

    private removeOtherLocationNotifications(): void {
        for (let i = 0; i < this.itemsFromAPI.length; i++) {
            if (this.itemsFromAPI[i].audience === AUDIENCE_SPECIFIC_AREA_USERS && this.itemsFromAPI[i].location_type === LOCATION_TYPE_POINT) {
                if (!this.location.currentLocation || !this.isDeviceAtLocation(
                    parseFloat(this.itemsFromAPI[i].m_lat),
                    parseFloat(this.itemsFromAPI[i].m_long),
                    this.itemsFromAPI[i].span,
                    this.itemsFromAPI[i].span_type
                )) {
                    this.itemsFromAPI.splice(i, 1);
                }
            }
        }
    }

    private isDeviceAtLocation(lat: number, long: number, span: number, spanType: string): boolean {
        let theta: number = this.location.currentLocation.longitude - long;
        let dist: number = Math.sin(this.degToRad(this.location.currentLocation.latitude))
            * Math.sin(this.degToRad(lat))
            + Math.cos(this.degToRad(this.location.currentLocation.latitude))
            * Math.cos(this.degToRad(lat))
            * Math.cos(this.degToRad(theta));
        dist = Math.acos(dist);
        dist = this.radToDeg(dist);
        dist = dist * 60 * 1.1515; // In miles
        // Convert to kilometres if span type is kilometre.
        dist = spanType === SPAN_TYPE_KILOMETERS ? (dist * 1.609344) : dist;
        return dist <= span;
    }

    private degToRad(deg: number): number {
        return deg * Math.PI / 180;
    }

    private radToDeg(rad: number): number {
        return rad * 180 / Math.PI;
    }
}
