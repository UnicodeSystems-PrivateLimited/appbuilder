import { Component } from '@angular/core';
import { CallNumber } from "ionic-native";
import { Platform, ViewController } from 'ionic-angular';
import { DisplayService } from "../../providers/display-service/display-service";
import { GlobalService } from '../../providers';
import { CallUsModalData } from "../../interfaces/common-interfaces";

/*
  Generated class for the CallUsModal component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
    selector: 'call-us-modal',
    templateUrl: 'call-us-modal.html'
})
export class CallUsModal {

    public callUsData: CallUsModalData[] = [];

    constructor(
        private platform: Platform,
        private display: DisplayService,
        public globalService: GlobalService,
        public viewCtrl: ViewController
    ) {
        this.getInitData();
    }

    public getInitData(): void {
        this.globalService.initData.contactData.forEach(val => {
            if (val.telephone) {
                let data = {
                    telephone: val.telephone,
                    address: val.address_sec_1 + ', ' + val.address_sec_2
                };
                this.callUsData.push(data);
            }
        });
    }

    private onNumberClick(number: string): void {
        this.platform.ready().then(() => {
            CallNumber.callNumber(number, false).catch(() => {
                this.display.showAlert('Error launching dialer!');
            });
        });
    }

    public dismiss() {
        this.viewCtrl.dismiss();
    }

}
