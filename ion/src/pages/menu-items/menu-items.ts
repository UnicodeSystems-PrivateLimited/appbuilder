import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { MenuTabService } from "../../providers/menu-tab-service/menu-tab-service";
import { MenuItem } from "../../interfaces/common-interfaces";
import { MenuItemDescPage } from "../menu-item-desc/menu-item-desc";
import { GlobalService, DisplayService } from '../../providers';

/*
  Generated class for the MenuItemsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-menu-items',
    templateUrl: 'menu-items.html',
})
export class MenuItemsPage {

    public categoryId: number;
    public tabId: number;
    public bgImage: string;
    public menuItems: MenuItem[] = [];
    public catName: string = "";
    public loader: boolean = false;

    constructor(
        private navCtrl: NavController,
        private navParams: NavParams,
        private service: MenuTabService,
        private loadingCtrl: LoadingController,
        public globalService: GlobalService,
        public display: DisplayService,
    ) {
        this.categoryId = navParams.get('catId');
        this.tabId = navParams.get('tabId');
        this.bgImage = navParams.get('bgImage');
        this.getInitData();
    }

    public getInitData(): void {
       this.loader = true;
        this.service.getMenuItemsInitData(this.categoryId).subscribe(res => {
           this.loader = false;
            if (res.success) {
                this.catName = res.data.categoryName;
                this.menuItems = res.data.menuItems;
            } else {
                console.log("Server error occured.");
            }
        });
    }

    public onItemClick(itemId: number): void {
        this.navCtrl.push(MenuItemDescPage, {
            itemId: itemId,
            tabId: this.tabId
        })
    }

}
