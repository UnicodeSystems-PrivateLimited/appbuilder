import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { TabService } from '../../providers';
import { GlobalService, DataService, NewsTabService, DisplayService, SocialService } from '../../providers';
import { SocialSharing, ThemeableBrowser } from "ionic-native";
import { WebViewPage } from "../web-view/web-view";
declare var cordova: any;
/*
  Generated class for the NewsTab page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-news-tab',
    templateUrl: 'news-tab.html'
})
export class NewsTab {
    public tabId: number;
    public title: string;
    public bgImage: string;
    public tabs: string = 'google'; //    Default open tab.
    public appStoreURL: string;
    public showTweet: Array<boolean> = [];
    public show: Array<boolean> = [];
    public searchIcon: boolean = true;
    public state: boolean = false;
    public searching: string;
    public tab_nav_type: string = null;
    public subTabId: number = null;
    public tweetTab: number = null;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public service: NewsTabService,
        public display: DisplayService,
        public globalService: GlobalService,
        public socialService: SocialService,
        public platform: Platform
    ) {
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tweetTab = navParams.get('tweetTab');
        if (this.tweetTab == 1) {
            this.tabs = 'twitter';
        } else {
            this.tabs = 'google';
        }
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        if (platform.is("android")) {
            this.appStoreURL = this.globalService.initData.appData.google_play_store_url;
        } else if (platform.is("ios")) {
            this.appStoreURL = this.globalService.initData.appData.ios_app_store_url;
        }
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.getInitData();
    }

    ionViewDidLoad() {
        console.log('Hello NewsTab Page');
    }

    public getInitData(): void {
        console.log('news data', this.service.newsTabData);
        console.log('this.tabId', this.tabId);
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
                transitionstyle: 'crossdissolve'
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

    public onShareClick(event: any): void {
        event.stopPropagation();
        this.display.showShareActionSheet(
            () => this.onFacebookShare(),
            () => this.onTwitterShare(),
            () => this.onEmailShare(),
            () => this.onSMSShare()
        );
    }

    private onFacebookShare(): void {
        SocialSharing.shareViaFacebook("Check out this app: " + this.appStoreURL).then(() => {
            console.log("Facebook share success");
        }).catch(() => {
            if (!this.platform.is("ios")) {
                this.display.showToast("Facebook app not installed.");
            }
        });
    }

    private onTwitterShare(): void {
        SocialSharing.shareViaTwitter("Check out this app: " + this.appStoreURL).then(() => {
            console.log("Twitter share success");
        }).catch(() => {
            if (!this.platform.is("ios")) {
                this.display.showToast("Twitter app not installed.");
            }
        });
    }

    private onEmailShare(): void {
        SocialSharing.canShareViaEmail().then(() => {
            SocialSharing.shareViaEmail("Check out this app: " + this.appStoreURL, this.globalService.initData.appData.app_name, []).then(() => {
                console.log("Email share success");
            }).catch(() => {
                this.display.showToast("Could not open email sender.");
            });
        }).catch(() => {
            this.display.showToast("Email sending is not supported.");
        });
    }

    private onSMSShare(): void {
        SocialSharing.shareViaSMS("Check out this app: " + this.appStoreURL, null).then(() => {
            console.log("SMS share success");
        }).catch(() => {
            this.display.showToast("SMS sharing failed");
        });
    }

    public onShowClick(event: any, index): void {
        event.stopPropagation();
        if (typeof (this.show[index]) == "undefined") {
            this.show[index] = true;
        }
        else {
            this.show[index] = !this.show[index];
        }
    }

    public onShowTwitterClick(event: any, index): void {
        event.stopPropagation();
        if (typeof (this.showTweet[index]) == "undefined") {
            this.showTweet[index] = true;
        }
        else {
            this.showTweet[index] = !this.showTweet[index];
        }
    }

    public search(): void {
        this.state = true;
        this.searchIcon = false;
    }

    public onCancel(): void {
        this.state = false;
        this.searchIcon = true;
    }
}
