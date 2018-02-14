import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, Platform } from 'ionic-angular';
import { PdfTabService } from "../../providers/pdf-tab-service/pdf-tab-service";
import { PDF, Tab } from "../../interfaces/common-interfaces";
import { PdfViewer } from "../pdf-viewer/pdf-viewer";
import { GlobalService, DisplayService } from '../../providers';
import { WebViewPage } from "../web-view/web-view";
import { Printer, PrintOptions } from "ionic-native";

declare var cordova: any;
@Component({
    selector: 'page-pdf-tab',
    templateUrl: 'pdf-tab.html',
})
export class PdfTabPage {

    public tabId: number;
    public bgImage: string;
    public tabData: Tab = {
        title: ''
    };
    public noSectionPDFs: PDF[] = [];
    public sectionWisePDFs: PDF[][] = [];
    public loader: boolean = false;
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public service: PdfTabService,
        public loadingCtrl: LoadingController,
        public globalService: GlobalService,
        public display: DisplayService,
        public platform: Platform
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
            if (res.success) {
                this.tabData = res.data.tabData;
                let pdfList: any = res.data.pdfList;
                if (typeof pdfList.__noSection !== undefined) {
                    this.noSectionPDFs = pdfList.__noSection;
                }
                for (let section in pdfList) {
                    if (section === "__noSection") {
                        continue;
                    }
                    this.sectionWisePDFs.push(pdfList[section]);
                }
                this.loader = false;
            } else {
                console.log("Server error occured.");
            }
        });
    }

    public openPDF(url: string, name: string, isPrintingAllowed: boolean) {
        if (this.platform.is("cordova")) {
            if (this.platform.is("android")) {
                // PdfViewer should only be used when the app is running on an android device.
                this.navCtrl.push(PdfViewer, {
                    url: url,
                    name: name,
                    tabId: this.tabId,
                    isPrintingAllowed: isPrintingAllowed
                });
            } else if (this.platform.is("ios")) {
                this.openThemeableBrowser(url, name, isPrintingAllowed);
            }
        } else {
            // For web
            this.navCtrl.push(WebViewPage, {
                url: url,
                name: name,
                tabId: this.tabId,
                isPrintingAllowed: isPrintingAllowed
            });
        }
    }

    private openThemeableBrowser(url: string, name: string, isPrintingAllowed: boolean): void {
        let headerBackgroundURL: string = this.globalService.tabHeaderBgImageSrcs[this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.background_img : this.globalService.initData.globalStyleSettings.header.background_img];
        let splittedHeaderBackgroundURL: string[] = headerBackgroundURL ? headerBackgroundURL.split("/") : [];
        let headerBackgroundName: string = splittedHeaderBackgroundURL[splittedHeaderBackgroundURL.length - 1];
        let options: any = {
            title: {
                color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.text_color : this.globalService.initData.globalStyleSettings.header.text_color),
                showPageTitle: true,
                staticText: name,
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

        if (isPrintingAllowed) {
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
        cordova.ThemeableBrowser.open(url, '_blank', options).addEventListener('printPage', (e) => {
            this.printPage(url, name);
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

}
