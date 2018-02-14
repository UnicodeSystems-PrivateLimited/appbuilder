import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DisplayService, GlobalService, ShoppingCartService } from '../../providers/index';
import { ShoppingCartInventoryCategory, Tab } from '../../interfaces/index';
import { Subscription } from 'rxjs/Subscription';
import { ShoppingCartItems } from '../shopping-cart-items/shopping-cart-items';
import { Observable } from 'rxjs/Observable';

declare var window: any;

@Component({
    selector: 'page-shopping-cart-categories',
    templateUrl: 'shopping-cart-categories.html'
})
export class ShoppingCartCategories {

    tabId: number;
    title: string;
    bgImage: string;
    loader: boolean = true;
    tab_nav_type: string = null;
    subTabId: number = null;
    categories: ShoppingCartInventoryCategory[] = [];
    tabData: Tab;
    initDataSubscription: Subscription;
    settings: any;
    gridCardWidth: number;
    showSearchBar: boolean = false;
    windowObject: any;

    CATEGORY_VIEW_DISPLAY_GRID: number = 1;
    CATEGORY_VIEW_DISPLAY_LIST: number = 2;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public display: DisplayService,
        public globalService: GlobalService,
        public service: ShoppingCartService
    ) {
        this.service.isDataRetreived = false;
        this.windowObject = window;
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.bgImage = navParams.get('bgImage');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.getInitData();
    }

    ionViewDidLoad(): void {
        if (!this.service.cartData.length) {
            this.service.getCartData().then(data => {
                for (let i = 0; i < data.length; i++) {
                    this.service.cartTotal += Number(data[i].quantity);
                }
            });
        }
    }

    ionViewWillLeave(): void {
        this.initDataSubscription.unsubscribe();
    }

    getInitData(): void {
        this.loader = true;
        this.initDataSubscription = Observable.forkJoin(
            this.service.getInitData(this.tabId).timeout(30000),
            this.service.getCurrencyData().timeout(30000)
        ).subscribe(res => {
            if (res[0].success && res[1].success) {
                this.categories = res[0].data.categories;
                this.tabData = res[0].data.tabData;
                this.settings = JSON.parse(res[0].data.tabData.settings);
                this.service.payment = res[0].data.payment;
                this.service.currencySymbolList = res[1].data.currencySymbolList;
                this.service.isDataRetreived = true;
            } else {
                this.display.showToast("Failed to load data");
                this.display.showRetryDialog(() => this.getInitData());
            }
            this.loader = false;
        }, err => {
            this.loader = false;
            this.display.showRetryDialog(() => this.getInitData());
        });
    }

    onCategoryClick(category: ShoppingCartInventoryCategory): void {
        this.navCtrl.push(ShoppingCartItems, {
            category: category,
            title: this.title,
            tab_nav_type: this.tab_nav_type,
            subTabId: this.subTabId,
            tabId: this.tabId
        });
    }

}