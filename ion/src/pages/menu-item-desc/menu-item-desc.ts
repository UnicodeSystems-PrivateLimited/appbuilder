import { Component } from '@angular/core';
import { NavParams, LoadingController } from 'ionic-angular';
import { MenuTabService } from "../../providers/menu-tab-service/menu-tab-service";
import { MenuItem } from "../../interfaces/common-interfaces";
import { GlobalService, DisplayService } from '../../providers';

/*
  Generated class for the MenuItemDescPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-menu-item-desc',
    templateUrl: 'menu-item-desc.html',
})
export class MenuItemDescPage {

    public itemId: number;
    public tabId: number;
    public item: MenuItem = new MenuItem();
    public loader: boolean = false;
    public background_color: any;
    public text_color: any;
    constructor(
        private navParams: NavParams,
        private service: MenuTabService,
        private loadingCtrl: LoadingController,
        public globalService: GlobalService,
        public display: DisplayService,
    ) {
        this.itemId = navParams.get('itemId');
        this.tabId = navParams.get('tabId');
        this.getItemDetails();
    }

    public getItemDetails(): void {
        this.loader = true;
        this.service.getMenuItemDetails(this.itemId).subscribe(res => {
            this.loader = false;
            if (res.success) {
                this.item = res.data;
                if (res.data.use_global_colors == 0) {
                    this.background_color = res.data.background_color;
                    this.text_color = res.data.text_color;
                } else {
                    this.background_color = this.globalService.initData.globalStyleSettings.features.background_color;
                    this.text_color = this.globalService.initData.globalStyleSettings.features.button_text;
                }
            } else {
                console.log("Server error occured.");
            }
        });
    }

}
