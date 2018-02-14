import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { DisplayService, LoyaltyTabService } from '../../providers';
import { EmailFormsTabItem } from "../../interfaces/common-interfaces";
import { GlobalService } from '../../providers';
import { LoyaltyTabDesc } from "../loyalty-tab-desc/loyalty-tab-desc";
import { Device } from 'ionic-native';

/*
  Generated class for the LoyaltyTab page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-loyalty-tab',
    templateUrl: 'loyalty-tab.html'
})
export class LoyaltyTab {
    public tabId: number;
    public title: string;
    public bgImage: string;
    public loader: boolean = false;
    public searchIcon: boolean = true;
    public state: boolean = false;
    public searchItem: string;
    public itemLists = [];
    public deviceUuid: string = null;
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public service: LoyaltyTabService,
        public display: DisplayService,
        public globalService: GlobalService) {
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.deviceUuid = Device.uuid;
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.getInitData();
    }


    public getInitData(): void {
        this.loader = true;
        this.service.getItemList(this.tabId, this.globalService.initData.appData.id, this.deviceUuid).subscribe(res => {
            this.loader = false;
            if (res.success) {
                this.itemLists = res.data.loyaltylist;
            } else {
                this.display.showToast("Could not fetch data");
            }
        });
    }

    public search(): void {
        this.state = true;
        this.searchIcon = false;
    }

    public onCancel(): void {
        this.state = false;
        this.searchIcon = true;
    }

    public onItemClick(id: number, itemId: number): void {
        this.navCtrl.push(LoyaltyTabDesc, {
            itemId: id,
            item_id: itemId,
            bgImage: this.bgImage,
            tabId: this.tabId,
        });

    }

}
