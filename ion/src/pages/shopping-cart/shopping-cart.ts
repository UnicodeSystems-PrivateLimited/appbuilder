import { Component, Inject, forwardRef } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { DisplayService } from '../../providers/display-service/display-service';
import { GlobalService } from '../../providers/global-service';
import { ShoppingCartService } from '../../providers/shopping-cart-service';

@Component({
    selector: 'page-shopping-cart',
    templateUrl: 'shopping-cart.html'
})
export class ShoppingCart {

    tabId: number;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public display: DisplayService,
        public globalService: GlobalService,
        public alertCtrl: AlertController,
        @Inject(forwardRef(() => ShoppingCartService)) public service: ShoppingCartService
    ) {
        this.tabId = navParams.get('tabId');
    }

}
