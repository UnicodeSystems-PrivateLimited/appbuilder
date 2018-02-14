import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FoodOrderingItem, FoodOrderingMenuCategory } from '../../interfaces/index';
import { GlobalService } from '../../providers/global-service';
import { Subscription } from 'rxjs/Subscription';
import { DisplayService, FoodOrderingService } from '../../providers/index';
import { FoodOrderingItemDetails } from '../food-ordering-item-details/food-ordering-item-details';

@Component({
    selector: 'page-food-ordering-items',
    templateUrl: 'food-ordering-items.html'
})
export class FoodOrderingItems {
    public tabId: number;
    public category: FoodOrderingMenuCategory = null;
    public loader: boolean = false;
    public categoryListItems: FoodOrderingItem[] = [];
    public subscription: Subscription;
    showSearchBar: boolean = false;
    locationId: number;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public display: DisplayService,
        public globalService: GlobalService,
        public service: FoodOrderingService
    ) {
        this.category = navParams.get('category');
        this.tabId = navParams.get('tabId');
        this.locationId = navParams.get('locationId');
        this.getItemList();
    }

    ionViewWillLeave(): void {
        this.subscription.unsubscribe();
    }

    getItemList(): void {
        this.loader = true;
        this.subscription = this.service.getItemList(this.category.id, this.locationId).timeout(30000).subscribe(res => {
            if (res.success) {
                this.categoryListItems = res.data.items;
            } else {
                this.display.showToast("Failed to load data");
                this.display.showRetryDialog(() => this.getItemList());
            }
            this.loader = false;
        }, err => {
            this.loader = false;
            this.display.showRetryDialog(() => this.getItemList());
        });
    }

    onItemClick(id: number): void {
        this.navCtrl.push(FoodOrderingItemDetails, {
            id: id,
            tabId: this.tabId
        });
    }

}
