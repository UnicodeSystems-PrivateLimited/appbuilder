import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ShoppingCartService } from '../../providers/shopping-cart-service';
import { ShoppingCartInventoryCategory } from '../../interfaces/index';
import { GlobalService } from '../../providers/global-service';
import { Subscription } from 'rxjs/Subscription';
import { DisplayService } from '../../providers/index';
import { ShoppingCartInventoryItem } from "../../interfaces/common-interfaces";
import { ShoppingCartItemDetails } from '../shopping-cart-item-details/shopping-cart-item-details';

@Component({
    selector: 'page-shopping-cart-items',
    templateUrl: 'shopping-cart-items.html'
})
export class ShoppingCartItems {
    public tabId: number;
    public title: string;
    public category: any = null;
    public loader: boolean = false;
    public tab_nav_type: string = null;
    public categoryListItems: ShoppingCartInventoryItem[] = [];
    public subTabId: number = null;
    public subscription: Subscription;
    showSearchBar: boolean = false;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public display: DisplayService,
        public globalService: GlobalService,
        public service: ShoppingCartService
    ) {
        this.category = navParams.get('category');
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.getInventoryItemsData();
    }

    ionViewWillLeave(): void {
        this.subscription.unsubscribe();
    }

    getInventoryItemsData(): void {
        this.loader = true;
        this.subscription = this.service.getInventoryItems(this.category.id).timeout(30000).subscribe(res => {
            if (res.success) {
                this.categoryListItems = res.data.categoryItems;
            } else {
                this.display.showToast("Failed to load data");
                this.display.showRetryDialog(() => this.getInventoryItemsData());
            }
            this.loader = false;
        }, err => {
            this.loader = false;
            this.display.showRetryDialog(() => this.getInventoryItemsData());
        });
    }

    onItemClick(id: number): void {
        this.navCtrl.push(ShoppingCartItemDetails, {
            id: id,
            title: this.title,
            tab_nav_type: this.tab_nav_type,
            subTabId: this.subTabId,
            tabId: this.tabId
        });
    }

}
