import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavController, NavParams, Slides, ModalController, AlertController, Alert, Select } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { DisplayService, ShoppingCartService, GlobalService } from '../../providers';
import { ShoppingCartInventoryItem, ShoppingCartInventoryItemSize, ShoppingCartInventoryItemOption, ShoppingCartInventoryItemImage, CartItem } from '../../interfaces/index';
import { AddToCartConfirm } from '../../components/add-to-cart-confirm/add-to-cart-confirm';

@Component({
    selector: 'page-shopping-cart-item-details',
    templateUrl: 'shopping-cart-item-details.html'
})
export class ShoppingCartItemDetails {

    tabId: number;
    title: string;
    loader: boolean = true;
    tab_nav_type: string = null;
    subTabId: number = null;
    id: number;
    subscription: Subscription;
    item: ShoppingCartInventoryItem;
    sizes: ShoppingCartInventoryItemSize[];
    options: ShoppingCartInventoryItemOption[];
    images: ShoppingCartInventoryItemImage[];
    showMore: boolean = false;
    sliderOptions: any;
    quantityOptions: number[];
    cartItem: CartItem;
    previousQuantity: number = 1;
    selectedSize: ShoppingCartInventoryItemSize;
    selectedOptions: ShoppingCartInventoryItemOption[] = [];
    optionCharges: number = 0;

    @ViewChild('imageSlides') slides: Slides;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public display: DisplayService,
        public globalService: GlobalService,
        public service: ShoppingCartService,
        public alertCtrl: AlertController,
        public modalCtrl: ModalController
    ) {
        this.id = navParams.get('id');
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.sliderOptions = { loop: true, autoplay: 7000 };
        this.cartItem = new CartItem();
        this.getItemDetails();
    }

    ionViewWillLeave(): void {
        this.subscription.unsubscribe();
    }

    getItemDetails(): void {
        this.loader = true;
        this.subscription = this.service.getItemDetails(this.id).timeout(30000).subscribe(res => {
            if (res.success) {
                this.item = res.data.item;
                this.sizes = res.data.sizes;
                this.options = res.data.options;
                this.images = res.data.images;
                this.quantityOptions = new Array(this.item.inventory <= 5 ? this.item.inventory : 5).fill(undefined).map((_, i) => i + 1);
                if (this.sizes.length) {
                    this.cartItem.size = this.sizes[0];
                    this.selectedSize = this.sizes[0];
                    this.item.price = this.selectedSize.price;
                }
                this.item.price = parseFloat(<any>this.item.price);
            } else {
                this.display.showToast("Failed to load data");
                this.display.showRetryDialog(() => this.getItemDetails());
            }
            this.loader = false;
        }, err => {
            this.loader = false;
            this.display.showRetryDialog(() => this.getItemDetails());
        });
    }

    onShowMoreToggle(): void {
        this.showMore = !this.showMore;
    }

    onQuantityChange(): void {
        if (this.cartItem.quantity === -1) {
            let prompt = this.alertCtrl.create();
            prompt.setSubTitle("How many do you want?")
            prompt.addInput({ type: "number", name: "quantity" });
            prompt.addButton("Cancel");
            prompt.addButton({
                text: "OK",
                handler: data => this.handleMoreQuantityData(data)
            });
            prompt.onDidDismiss(() => this.cartItem.quantity = this.previousQuantity);
            prompt.present();
        } else {
            this.previousQuantity = this.cartItem.quantity;
        }
    }

    handleMoreQuantityData(data: { quantity: number }): boolean {
        if (!data.quantity) {
            return false;
        }
        data.quantity = Number(data.quantity);
        if (!Number.isInteger(data.quantity) || data.quantity < 0) {
            this.display.showAlert("Invalid quantity.");
            return false;
        }
        if (data.quantity > this.item.inventory) {
            this.display.showAlert("Quantity you entered exceeded item inventory.");
            return false;
        }
        this.quantityOptions.push(data.quantity);
        this.previousQuantity = data.quantity;
        this.cartItem.quantity = data.quantity;
        return true;
    }

    onSizeChange(): void {
        this.item.price = parseFloat(<any>this.selectedSize.price);
    }

    onOptionsChange(selectionState: number, selectedCharges: number): void {
        if (selectionState) {
            this.optionCharges += parseFloat(<any>selectedCharges);
        } else {
            this.optionCharges -= parseFloat(<any>selectedCharges);
        }
    }

    onAddToCartClick(): void {
        this.cartItem.item_id = this.item.id;
        this.cartItem.item_name = this.item.name;
        this.cartItem.item_price = this.item.price;
        this.cartItem.total_price = (this.item.price + this.optionCharges) * this.cartItem.quantity;
        if (this.selectedSize) {
            this.cartItem.size = this.selectedSize;
        }
        // if (this.selectedOptions.length) {
        //     this.cartItem.options = "";
        //     for (let i = 0; i < this.selectedOptions.length; i++) {
        //         if (this.selectedOptions[i]) {
        //             this.cartItem.options += (this.cartItem.options ? "," : "") + this.options[i].title;
        //         }
        //     }
        // }
        let confirm = this.modalCtrl.create(AddToCartConfirm, {
            cartItem: this.cartItem,
            imageURL: this.images.length ? this.images[0].image_url : undefined,
            tabId: this.tabId,
            currencySymbol: this.service.currencySymbolList[this.service.payment.currency] || this.service.payment.currency
        });
        confirm.onDidDismiss(isConfirmed => {
            if (isConfirmed) this.service.addToCart(this.cartItem);
        });
        confirm.present();
    }

}
