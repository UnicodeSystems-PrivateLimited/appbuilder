import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { DisplayService, GlobalService, FoodOrderingService } from '../../providers/index';
import { Subscription } from 'ionic-native/node_modules/rxjs/Subscription';
import { FoodOrderingOrderDetails } from '../food-ordering-order-details/food-ordering-order-details';

@Component({
    selector: 'page-food-ordering-past-orders',
    templateUrl: 'food-ordering-past-orders.html'
})
export class FoodOrderingPastOrders {
    tabId: number;
    title: string;
    bgImage: string;
    loader: boolean = true;
    subscriptions: Subscription[] = [];

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public display: DisplayService,
        public globalService: GlobalService,
        public service: FoodOrderingService,
        public platform: Platform
    ) {
        this.tabId = navParams.get('tabId');
        this.getPastOrders();
    }

    ionViewDidLoad() {
        console.log('Hello FoodOrderingPastOrders Page');
    }

    getPastOrders(): void {
        this.loader = true;
        this.subscriptions[0] = this.service.getPastOrdersList(this.tabId).timeout(30000).subscribe(res => {
            if (res.success) {
                this.service.pastOrders = res.data.pastOrdersList;
            } else {
                this.display.showToast("Failed to load data");
                this.display.showRetryDialog(() => this.getPastOrders());
            }
            this.loader = false;
        }, err => {
            this.loader = false;
            this.display.showRetryDialog(() => this.getPastOrders());
        });
    }

    orderDetails(orderKey: number): void {
        console.log('Get order Details.');
        this.navCtrl.push(FoodOrderingOrderDetails, {
            tabId: this.tabId,
            orderKey: orderKey
        })
    }

}
