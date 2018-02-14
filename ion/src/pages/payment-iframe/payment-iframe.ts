import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { DataService } from '../../providers/data-service/data-service';
import { GlobalService } from '../../providers/global-service';
import { DisplayService } from '../../providers/display-service/display-service';

@Component({
    selector: 'page-payment-iframe',
    templateUrl: 'payment-iframe.html'
})
export class PaymentIframe {

    @ViewChild('iframe') iframe: ElementRef;

    price: number;
    tabId: number;
    iframeSrc: SafeResourceUrl;
    spreedlySuccessURL: string = DataService.apiBaseURL + 'ion/payment/spreedly-success';
    dismissCallback: (token: string) => Promise<void>;
    currencySymbol: string;
    loadCount: number = 1;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public sanitizer: DomSanitizer,
        public globalService: GlobalService,
        public display: DisplayService
    ) {
        this.tabId = this.navParams.get('tabId');
        this.price = this.navParams.get('price');
        this.dismissCallback = this.navParams.get('dismissCallback');
        this.currencySymbol = this.navParams.get('currencySymbol');

        let url = DataService.apiBaseURL + 'ion/payment/form/'
            + DataService.appCode + '/en/' + DataService.appCode + '/'
            + this.globalService.htmlDecode(this.currencySymbol) + ' '
            + this.globalService.formatNumber(this.price, 2);
        this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    onIframeLoad(): void {
        if (this.loadCount === 2) {
            this.display.hideNativeLoader();
        } else {
            let location = this.iframe.nativeElement.contentWindow.location;
            if (this.spreedlySuccessURL === location.origin + location.pathname) {
                let token = (<string>location.href).split('=')[1];
                this.dismissCallback(token).then(() => this.navCtrl.pop());
            }
        }
        this.loadCount++;
    }

}
