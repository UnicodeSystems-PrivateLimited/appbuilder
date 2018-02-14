import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { MenuTabService } from "../../providers/menu-tab-service/menu-tab-service";
import { Tab, MenuCategory } from "../../interfaces/common-interfaces";
import { MenuItemsPage } from "../menu-items/menu-items";
import { GlobalService, DisplayService } from '../../providers';

/*
  Generated class for the MenuTabPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-menu-tab',
    templateUrl: 'menu-tab.html',
})
export class MenuTabPage {

    public tabId: number;
    public bgImage: string;
    public menuCategories: MenuCategory[][] = [];
    public tabData: Tab = {
        title: ''
    };
    public loader: boolean = false;
    public tab_nav_type: string = null;
    public subTabId: number = null;


    constructor(
        private navCtrl: NavController,
        private navParams: NavParams,
        private service: MenuTabService,
        private loadingCtrl: LoadingController,
        public globalService: GlobalService,
        public display: DisplayService,
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
        this.service.getInitData(this.tabId).subscribe((res) => {
            if (res.success) {
                this.tabData = res.data.tabData;
                for (let section in res.data.menu_category) {
                    this.menuCategories.push(res.data.menu_category[section]);
                }
                this.loader = false;
            } else {
                console.log("Server error occured.");
            }
        });
    }

    public onCategoryClick(categoryId: number): void {
        this.navCtrl.push(MenuItemsPage, {
            catId: categoryId,
            bgImage: this.bgImage,
            tabId: this.tabId
        })
    }

}
