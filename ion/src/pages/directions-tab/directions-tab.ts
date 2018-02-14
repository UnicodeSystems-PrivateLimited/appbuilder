import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { DirectionsTabService, DisplayService } from '../../providers';
import { Direction } from "../../interfaces/common-interfaces";
import { LaunchNavigator } from "ionic-native";
import { GlobalService } from '../../providers';

@Component({
    selector: 'page-directions-tab',
    templateUrl: 'directions-tab.html'
})
export class DirectionsTab {

    public tabId: number;
    public title: string;
    public bgImage: string;
    public directions: Direction[] = [];
    public loader: boolean = false;
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        public service: DirectionsTabService,
        public display: DisplayService,
        public globalService: GlobalService
    ) {
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.getDirectionsList();
    }

    public getDirectionsList(): void {
        this.loader = true;
        this.service.getList(this.tabId).subscribe(res => {
            if (res.success) {
                this.loader = false;
                this.directions = res.data;
            } else {
                this.display.showToast("Could not fetch data");
            }
        });
    }

    public onDirectionClick(lat: number, long: number) {
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
                    this.display.showToast("Could not launch navigator");
                });
        });
    }

}
