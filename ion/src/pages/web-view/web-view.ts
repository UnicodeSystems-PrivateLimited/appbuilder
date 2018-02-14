import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Platform } from 'ionic-angular';
import { Printer, PrintOptions, ThemeableBrowser } from 'ionic-native';
import { DisplayService } from "../../providers/display-service/display-service";
import { GlobalService } from '../../providers';
/*
 Generated class for the WebViewPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    selector: 'page-web-view',
    templateUrl: 'web-view.html',
})
export class WebViewPage {

    public safeURL: SafeResourceUrl;
    public url: string;
    public websiteName: string;
    public isPrintingAllowed: boolean;
    public tabId: number;
    loadCount: number = 1;

    constructor(
        private navCtrl: NavController,
        private navParams: NavParams,
        private sanitizer: DomSanitizer,
        private platform: Platform,
        private display: DisplayService,
        public globalService: GlobalService
    ) {
        this.url = navParams.get('url');
        this.safeURL = sanitizer.bypassSecurityTrustResourceUrl(this.url);
        this.websiteName = navParams.get('name');
        this.tabId = navParams.get('tabId');
        this.isPrintingAllowed = navParams.get('isPrintingAllowed');
    }

    public printPage(): void {
        let iframe: string = this.url;
        this.platform.ready().then(() => {
            Printer.isAvailable().then(() => {
                let options: PrintOptions = {
                    name: this.websiteName
                };
                Printer.print(iframe, options);
            }, () => {
                this.display.showAlert('Printer not available.');
            });
        });
    }

    onIframeLoad(): void {
        if (this.loadCount === 1) {
            this.display.showLoader('', true, true);
        } else if(this.loadCount === 2) {
            this.display.hideLoader();
        }
        this.loadCount++;
    }

}
