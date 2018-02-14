import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DisplayService, GlobalService, FoodOrderingService } from '../../providers/index';
import { FoodOrderingMenuCategory } from '../../interfaces/index';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { FoodOrderingItems } from '../food-ordering-items/food-ordering-items';

declare var window: any;

@Component({
    selector: 'page-food-ordering-categories',
    templateUrl: 'food-ordering-categories.html'
})
export class FoodOrderingCategories {

    tabId: number;
    loader: boolean = true;
    categories: FoodOrderingMenuCategory[] = [];
    subscription: Subscription;
    gridCardWidth: number;
    showSearchBar: boolean = false;
    windowObject: any;
    locationId: number;

    CATEGORY_VIEW_DISPLAY_GRID: number = 1;
    CATEGORY_VIEW_DISPLAY_LIST: number = 2;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public display: DisplayService,
        public globalService: GlobalService,
        public service: FoodOrderingService
    ) {
        this.service.isDataRetreived = false;
        this.windowObject = window;
        this.tabId = navParams.get('tabId');
        this.locationId = navParams.get('locationId');
        this.getCategories();
    }

    ionViewWillLeave(): void {
        this.subscription.unsubscribe();
    }

    getCategories(): void {
        this.loader = true;
        this.subscription = this.service.getCategories(this.tabId, this.locationId).timeout(30000).subscribe(res => {
            if (res.success) {
                this.categories = res.data.categories;
            } else {
                this.display.showToast("Failed to load data");
                this.display.showRetryDialog(() => this.getCategories());
            }
            this.loader = false;
        }, err => {
            this.loader = false;
            this.display.showRetryDialog(() => this.getCategories());
        });
    }

    onCategoryClick(category: FoodOrderingMenuCategory): void {
        this.navCtrl.push(FoodOrderingItems, {
            category: category,
            tabId: this.tabId,
            locationId: this.locationId
        });
    }

}
