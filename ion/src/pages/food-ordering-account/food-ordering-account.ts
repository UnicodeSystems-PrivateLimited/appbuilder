import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FoodOrderingAddresses } from '../food-ordering-addresses/food-ordering-addresses';
import { GlobalService } from '../../providers/index';
import { FoodOrderingPastOrders } from '../food-ordering-past-orders/food-ordering-past-orders'
/*
  Generated class for the FoodOrderingAccount page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-food-ordering-account',
    templateUrl: 'food-ordering-account.html'
})
export class FoodOrderingAccount {

    tabId: number;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public globalService: GlobalService,
    ) {
        this.tabId = navParams.get('tabId');
    }

    onPastOrdersClick(): void {
        this.navCtrl.push(FoodOrderingPastOrders, {
            tabId: this.tabId
        })
    }

    onAddressesClick(): void {
        this.navCtrl.push(FoodOrderingAddresses, { tabId: this.tabId });
    }

}
