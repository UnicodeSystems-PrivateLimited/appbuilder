import { Component, ViewChild, Inject, forwardRef } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController, Alert, Select } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { CartItem, FoodOrderingItem, FoodOrderingItemSize, FoodOrderingItemOption, FoodOrderingItemOptionType } from '../../interfaces/index';
import { AddToCartConfirm } from '../../components/add-to-cart-confirm/add-to-cart-confirm';
import { Checkbox } from 'ionic-angular/components/checkbox/checkbox';
import { Platform } from 'ionic-angular/platform/platform';
import { DisplayService } from '../../providers/display-service/display-service';
import { GlobalService } from '../../providers/global-service';
import { FoodOrderingService } from '../../providers/food-ordering-service';

@Component({
    selector: 'page-food-ordering-item-details',
    templateUrl: 'food-ordering-item-details.html'
})
export class FoodOrderingItemDetails {

    tabId: number;
    loader: boolean = true;
    id: number;
    subscription: Subscription;
    item: FoodOrderingItem;
    sizes: FoodOrderingItemSize[] = [];
    options: FoodOrderingItemOption[][] = [];
    optionTypes: FoodOrderingItemOptionType[] = [];
    showMore: boolean = false;
    quantityOptions: number[];
    cartItem: CartItem;
    previousQuantity: number = 1;
    selectedSize: FoodOrderingItemSize;
    selectedOptions: { option: FoodOrderingItemOption, quantity: number }[] = [];
    optionCharges: number = 0;
    optionButtonPairs: any = {};
    disabledPlusButtons: any = {};
    optionQuantities: any = {};
    minusButtonMargin: { left: number, right: number };
    currencySymbol: string;
    optionTypeSelection: any = {};
    ignoreNextOptionsChange: boolean = false;
    showCartButton = false;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public display: DisplayService,
        public globalService: GlobalService,
        @Inject(forwardRef(() => FoodOrderingService)) public service: FoodOrderingService,
        public alertCtrl: AlertController,
        public modalCtrl: ModalController,
        public platform: Platform
    ) {
        this.id = navParams.get('id');
        this.tabId = navParams.get('tabId');
        this.cartItem = new CartItem();
        if (platform.is('ios')) {
            this.minusButtonMargin = { left: 5, right: 18 };
        } else {
            this.minusButtonMargin = { left: 3, right: 35 };
        }
        this.currencySymbol = this.service.currencySymbolList[this.service.payment.currency] || this.service.payment.currency;
        this.getItemDetails();
    }

    ionViewDidLoad(): void {
        let previousView = this.navCtrl.getPrevious();
        if (previousView.name !== 'FoodOrderingCart') {
            this.showCartButton = true;
        }
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
                this.optionTypes = res.data.optionTypes;
                this.options = res.data.options;
                this.quantityOptions = new Array(5).fill(undefined).map((_, i) => i + 1);
                if (this.sizes.length) {
                    this.cartItem.size = this.sizes[0];
                    this.selectedSize = this.sizes[0];
                    this.item.price = this.selectedSize.price;
                }
                this.item.price = parseFloat(<any>this.item.price);
                for (let type of this.optionTypes) {
                    if (this.options[type.id] && this.options[type.id].length) {
                        this.optionTypeSelection[type.id] = 0;
                    }
                }
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
        if (!Number.isInteger(data.quantity) || data.quantity <= 0) {
            this.display.showAlert("Invalid quantity.");
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

    onOptionsChange(checked: boolean, option: FoodOrderingItemOption, type: FoodOrderingItemOptionType, checkbox?: Checkbox): void {
        if (this.ignoreNextOptionsChange) {
            this.ignoreNextOptionsChange = false;
            return;
        }
        let i = this.alreadySelectedOption(option);
        if (checked) {
            if (i !== null) {
                this.selectedOptions[i].quantity++;
            } else {
                if (type.is_required && this.optionTypeSelection[type.id] === type.amount) {
                    this.display.showAlert('Please select ' + type.amount + ' ' + type.title);
                    this.ignoreNextOptionsChange = true;
                    checkbox.checked = false;
                    return;
                }
                this.optionTypeSelection[type.id]++;
                i = this.selectedOptions.push({ option: option, quantity: 1 }) - 1;
            }
            if (option.is_allow_qty && option.max_qty !== 1) {
                this.optionButtonPairs[option.id] = true;
                this.optionQuantities[option.id] = this.selectedOptions[i].quantity;
            }
            if (this.optionButtonPairs[option.id] && this.selectedOptions[i].quantity === option.max_qty) {
                this.disabledPlusButtons[option.id] = true;
            }
            this.optionCharges += parseFloat(<any>option.charges);
        } else {
            if (this.selectedOptions[i].quantity === 1) {
                this.selectedOptions.splice(i, 1);
                this.optionTypeSelection[type.id]--;
                if (this.optionButtonPairs[option.id]) {
                    this.optionButtonPairs[option.id] = false;
                    this.optionQuantities[option.id] = 0;
                }
            } else {
                this.selectedOptions[i].quantity--;
                this.optionQuantities[option.id]--;
            }
            if (this.disabledPlusButtons[option.id]) {
                this.disabledPlusButtons[option.id] = false;
            }
            this.optionCharges -= parseFloat(<any>option.charges);
        }
        console.log('Selected options', this.selectedOptions);
        console.log('Option button pairs', this.optionButtonPairs);
        console.log('Disabled plus buttons', this.disabledPlusButtons);
        console.log('optionTypeSelection', this.optionTypeSelection);
    }

    onAddToCartClick(): void {
        for (let type of this.optionTypes) {
            if (type.is_required && this.optionTypeSelection[type.id] !== undefined && this.optionTypeSelection[type.id] !== type.amount) {
                this.display.showAlert('Please select ' + type.amount + ' ' + type.title);
                return;
            }
        }
        this.cartItem.item_id = this.item.id;
        this.cartItem.item_name = this.item.name;
        this.cartItem.item_price = this.selectedSize ? this.selectedSize.price : this.item.price;
        this.cartItem.item_image = this.item.image ? this.item.image : undefined;
        this.cartItem.total_price = this.item.price + this.optionCharges;
        this.cartItem.is_tax_exempted = this.item.is_tax_exempted;
        if (this.selectedSize) {
            this.cartItem.size = this.selectedSize;
        }
        if (this.selectedOptions.length) {
            this.cartItem.options = this.selectedOptions;
        }
        let confirm = this.modalCtrl.create(AddToCartConfirm, {
            cartItem: this.cartItem,
            imageURL: this.item.image ? this.item.image : undefined,
            tabId: this.tabId,
            currencySymbol: this.currencySymbol
        });
        confirm.onDidDismiss(isConfirmed => {
            if (isConfirmed) this.service.addToCart(this.cartItem);
            console.log(this.cartItem);
        });
        confirm.present();
    }

    private alreadySelectedOption(option: FoodOrderingItemOption): number {
        for (let i = 0; i < this.selectedOptions.length; i++) {
            if (this.selectedOptions[i].option.id === option.id) {
                return i;
            }
        }
        return null;
    }

}

