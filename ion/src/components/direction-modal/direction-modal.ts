import { Component } from '@angular/core';
import { Platform, ViewController } from 'ionic-angular';
import { LaunchNavigator } from "ionic-native";
import { DisplayService } from "../../providers/display-service/display-service";
import { GlobalService } from '../../providers';
import { DirectionModalData } from "../../interfaces/common-interfaces";

/*
  Generated class for the DirectionModal component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'direction-modal',
  templateUrl: 'direction-modal.html'
})
export class DirectionModal {

  public directionData: DirectionModalData[] = [];

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
            if ((val.address_sec_1) || ( val.address_sec_2)) {
                if(val.address_sec_1 == null) {
                    let data = {
                        address: val.address_sec_2,
                        m_lat: val.m_lat,
                        m_long: val.m_long
                    };
                    this.directionData.push(data);
                } else if (val.address_sec_2 == null) {
                    let data = {
                        address: val.address_sec_1,
                        m_lat: val.m_lat,
                        m_long: val.m_long
                    };
                    this.directionData.push(data);
                } else {
                    let data = {
                        address: val.address_sec_1 + ', ' + val.address_sec_2,
                        m_lat: val.m_lat,
                        m_long: val.m_long
                    }
                    this.directionData.push(data);
                }
            }
        });
    }

    private onDirectionClick(lat: number, long: number) {
        let defaultApp: any = LaunchNavigator.APP.GOOGLE_MAPS;
        if (this.platform.is("ios")) {
            defaultApp = LaunchNavigator.APP.APPLE_MAPS;
        }
        LaunchNavigator.isAppAvailable(defaultApp).then(isAvailable => {
            if (!isAvailable) {
                defaultApp = LaunchNavigator.APP.USER_SELECT;
            }
            LaunchNavigator.navigate([lat, long], {
                app: defaultApp
            }).then(
                success => console.log("Launched navigator"),
                error => {
                    console.log("Error launching navigator", error);
                    this.display.showAlert("Could not launch navigator");
                });
        });
    }

    public dismiss() {
        this.viewCtrl.dismiss();
    }

}
