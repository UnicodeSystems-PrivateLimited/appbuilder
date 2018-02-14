import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { Website, Tab } from "../../interfaces/common-interfaces";
import { WebsiteTabService } from "../../providers/website-tab-service/website-tab-service";
import { WebViewPage } from "../web-view/web-view";
import { GlobalService, DisplayService } from '../../providers';
import { Printer, PrintOptions, ThemeableBrowser, SafariViewController } from 'ionic-native';
import { Platform } from 'ionic-angular';

declare var cordova: any;

/*
 Generated class for the WebsiteTabPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    selector: 'page-website-tab',
    templateUrl: 'website-tab.html',
})
export class WebsiteTabPage {

    public tabId: number;
    public bgImage: string;
    public websites: Website[];
    public tabData: Tab = {
        title: ''
    };
    public loader: boolean = false;
    public tab_nav_type: string = null;
    public subTabId: number = null;


    constructor(
        private navCtrl: NavController,
        private navParams: NavParams,
        private service: WebsiteTabService,
        private platform: Platform,
        private loadingCtrl: LoadingController,
        public globalService: GlobalService,
        public display: DisplayService
    ) {
        this.tabId = navParams.get('tabId');
        this.bgImage = navParams.get('bgImage');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.getInitData();
    }

    public getInitData(): void {
        this.loader = true;
        this.service.getTabData(this.tabId).subscribe((res) => {
            this.loader = false;
            if (res.success) {
                this.websites = res.data.websites;
                this.tabData = res.data.tabData;

                // If there is only one website available then there is no need to show this page.
                // Navigating to the first website's web view.
                if (this.websites.length === 1) {

                    // Pop this page otherwise the WebViewPage won't be able to get popped.
                    this.navCtrl.pop();
                    this.navCtrl.push(WebViewPage, {
                        url: this.websites[0].url,
                        name: this.websites[0].name
                    });
                }

            } else {
                console.log("Server error occured.");
            }
        });
    }

    public openWebView(website: Website) {
        if (website.is_donation_request) {
            window.open(website.url, "_system");
        } else if (this.platform.is("cordova") && this.platform.is("ios") && website.use_safari_webview) {
            this.openSafariViewController(website);
        } else if (this.platform.is("cordova") && (this.platform.is('ios') || this.platform.is('android'))) {
            let urlSplit: string[] = website.url.split(".");
            if (this.platform.is("android") && urlSplit[urlSplit.length - 1].toLowerCase() === "pdf") {
                window.open(website.url, "_system");
            } else {
                this.openThemeableBrowser(website);
            }
        } else {
            this.navCtrl.push(WebViewPage, {
                url: website.url,
                name: website.name,
                isPrintingAllowed: website.is_printing_allowed,
                tabId: this.tabId
            });
        }
    }

    public printPage(url: string, name: string): void {
        let iframe: string = url;
        this.platform.ready().then(() => {
            Printer.isAvailable().then(() => {
                let options: PrintOptions = {
                    name: name
                };
                Printer.print(iframe, options);
            }, () => {
                this.display.showAlert('Printer not available.');
            });
        });
    }

    private openThemeableBrowser(website: Website): void {
        let headerBackgroundURL: string = this.globalService.tabHeaderBgImageSrcs[this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.background_img : this.globalService.initData.globalStyleSettings.header.background_img];
        let splittedHeaderBackgroundURL: string[] = headerBackgroundURL ? headerBackgroundURL.split("/") : [];
        let headerBackgroundName: string = splittedHeaderBackgroundURL[splittedHeaderBackgroundURL.length - 1];
        let options: any = {
            title: {
                color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.text_color : this.globalService.initData.globalStyleSettings.header.text_color),
                showPageTitle: true,
                staticText: website.name,
                background_color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.background_color : this.globalService.initData.globalStyleSettings.header.background_color),
            },
            toolbar: {
                height: 56,
                color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.background_color : this.globalService.initData.globalStyleSettings.header.background_color),
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

        if (website.is_printing_allowed) {
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
        cordova.ThemeableBrowser.open(website.url, '_blank', options).addEventListener('printPage', (e) => {
            this.printPage(website.url, website.name);
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

    private openSafariViewController(website: Website): void {
        SafariViewController.isAvailable().then((available) => {
            if (available) {
                SafariViewController.show({ url: website.url }).catch(err => {
                    console.log("Safari View Controller could not be opened.", err);
                });
            } else {
                this.openThemeableBrowser(website);
            }
        }).catch(() => {
            this.openThemeableBrowser(website);
        });
    }

}
