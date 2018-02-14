import { Component } from '@angular/core';
import { NavParams, LoadingController, AlertController } from 'ionic-angular';
import { Tab, PhoneNumber } from "../../interfaces/common-interfaces";
import { CallUsService } from "../../providers/call-us-service/call-us-service";
import { CallNumber } from "ionic-native";
import { Platform } from 'ionic-angular';
import { DisplayService } from "../../providers/display-service/display-service";
import { GlobalService } from '../../providers';

declare var window;

/*
 Generated class for the CallUsPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    selector: 'page-call-us',
    templateUrl: 'call-us.html',
})
export class CallUsPage {

    public tabId: number;
    public bgImage: string;
    public tabData: Tab = {
        title: ''
    };
    public phoneNumbers: PhoneNumber[];
    public loader: boolean = false;
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(private navParams: NavParams,
        private service: CallUsService,
        private loadingCtrl: LoadingController,
        private platform: Platform,
        private display: DisplayService,
        public globalService: GlobalService,
        public alertCtrl: AlertController
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
                this.phoneNumbers = res.data.phone_numbers;
                this.tabData = res.data.tabData;
                this.loader = false;
            } else {
                console.log("Server error occured.");
            }
        });
    }

    public onNumberClick(number: string): void {
        this.display.showConfirm(number, "Do you want to call this number?", () => {
            CallNumber.callNumber(number, false).then(() => console.log('Launched dialer!')).catch(() => {
                this.display.showAlert('Error launching dialer!');
            });
        });
    }

}
