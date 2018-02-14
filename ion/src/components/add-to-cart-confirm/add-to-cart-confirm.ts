import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { CartItem } from '../../interfaces/index';
import { ViewController } from 'ionic-angular/navigation/view-controller';
import { GlobalService } from '../../providers/global-service';
import { Renderer } from '@angular/core/src/render/api';

/**
 * This modal is used by both Food Ordering and Shopping Cart tabs.
 * So make your changes accordingly.
 */
@Component({
    selector: 'add-to-cart-confirm',
    templateUrl: 'add-to-cart-confirm.html'
})
export class AddToCartConfirm {

    cartItem: CartItem;
    imageURL: string;
    tabId: number;
    isConfirmed: boolean = false;
    currencySymbol: string;

    constructor(
        public navParams: NavParams,
        public viewCtrl: ViewController,
        public globalService: GlobalService,
        public renderer: Renderer
    ) {
        this.cartItem = navParams.get("cartItem");
        this.imageURL = navParams.get("imageURL");
        this.tabId = navParams.get("tabId");
        this.currencySymbol = navParams.get("currencySymbol");
        this.renderer.setElementClass(viewCtrl.pageRef().nativeElement, 'cart-confirm-modal', true);
    }

    dismiss(): void {
        this.viewCtrl.dismiss(this.isConfirmed);
    }

    onAddClick(): void {
        this.isConfirmed = true;
        this.dismiss();
    }

}
