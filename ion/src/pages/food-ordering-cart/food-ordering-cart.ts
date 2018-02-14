import { Component, Inject, forwardRef, ElementRef } from '@angular/core';
import { NavController, NavParams, ModalController, Slides, Alert } from 'ionic-angular';
import { DisplayService } from '../../providers/display-service/display-service';
import { GlobalService } from '../../providers/global-service';
import { FoodOrderingService } from '../../providers/food-ordering-service';
import { FoodOrderingItemDetails } from '../food-ordering-item-details/food-ordering-item-details';
import { CartItem, Tip, FoodOrderingTax, FoodOrder, paymentMethod, Address, weekDays } from '../../interfaces/index';
import { AddressSelector as AddressModal } from '../../components/address-selector/address-selector';
import moment from 'moment';
import { Platform } from 'ionic-angular/platform/platform';
import { SQLite, Device } from 'ionic-native';
import { FoodOrderingAddAddresses } from '../food-ordering-add-addresses/food-ordering-add-addresses';
import { AlertController } from 'ionic-angular/components/alert/alert';
import { PaymentIframe } from '../payment-iframe/payment-iframe';
import { DataService } from '../../providers/index';

const BY_RATE: number = 1;
const BY_FLAT: number = 2;
const ORDER_STATUS_UNSERVED: number = 2;
const PAID_STATUS_UNPAID: number = 1;

@Component({
    selector: 'page-food-ordering-cart',
    templateUrl: 'food-ordering-cart.html'
})
export class FoodOrderingCart {

    private paymentMethod = paymentMethod;
    private db: SQLite;

    tabId: number;
    currencySymbol: string;
    order: FoodOrder;
    orderInfo: string;
    addressSlideOptions: any;
    addressList: Address[] = [];
    addressCoords: { lat?: number, long?: number } = {};
    orderDay: string;
    orderTime: string;
    requiredFields: string[] = ['firstName', 'lastName', 'phone'];
    deliveryRequiredFields: string[] = ['addressLine', 'email'];
    isDeliveryOrder: boolean = false;
    paymentIframeDismiss: (token: string) => Promise<void>;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public display: DisplayService,
        public globalService: GlobalService,
        @Inject(forwardRef(() => FoodOrderingService)) public service: FoodOrderingService,
        public modalCtrl: ModalController,
        public platform: Platform,
        public alertCtrl: AlertController
    ) {
        this.setPaymentIframeDismiss();
        this.tabId = navParams.get('tabId');
        this.currencySymbol = this.service.currencySymbolList[this.service.payment.currency] || this.service.payment.currency;

        this.order = this.service.order;
        this.order.total_charges = 0;
        this.order.total_price = 0;
        this.order.contact = new Address();
        this.order.is_email_receipt = false;
        if (this.service.payment.is_card) {
            this.order.payment_method = this.paymentMethod.CARD;
        } else if (this.service.payment.is_cash) {
            this.order.payment_method = this.paymentMethod.CASH;
        }

        if (this.service.orderSettings.type === this.service.orderType.DELIVERY) {
            // If the order is of type DELIVERY.
            this.isDeliveryOrder = true;
            this.order.is_email_receipt = true;
            if (platform.is('cordova')) {
                this.initAddressSlideOptions();
                platform.ready().then(() => this.startFetchingAddresses());
            }
        }

        for (let item of this.service.cartData) {
            this.order.total_price += item.total_price * item.quantity;
        }

        this.setOrderInfo();
        this.updateTaxListAndTotalCharges();
    }

    ionViewDidEnter(): void {
        if (!this.service.cartData.length) {
            this.leaveEmptyCart();
        }
        if (this.globalService.addressActionStatus === this.globalService.addressActionStatuses.CREATED) {
            this.addressList.push(Object.assign({}, this.globalService.actedAddress));
        }
    }

    leaveEmptyCart(): void {
        let alert = this.display.showAlert("Your cart is empty.");
        alert.onDidDismiss(() => {
            this.navCtrl.pop();
        });
    }

    initAddressSlideOptions(): void {
        this.addressSlideOptions = {
            freeMode: true,
            slidesPerView: 'auto',
            spaceBetween: 10
        };
    }

    onItemClick(itemID: number): void {
        this.navCtrl.push(FoodOrderingItemDetails, {
            tabId: this.tabId,
            id: itemID
        });
    }

    onItemDelete(index: number): void {
        this.display.showConfirm('Remove Item?', 'Are you sure you want to remove this item from cart?', () => {
            this.service.cartTotal -= this.service.cartData[index].quantity;
            this.service.cartData.splice(index, 1);
            if (!this.service.cartData.length) {
                this.leaveEmptyCart();
            }
        });
    }

    onQuantityMinusClick(index: number, event: Event): void {
        event.stopPropagation();
        if (this.service.cartData[index].quantity === 1) {
            this.onItemDelete(index);
            return;
        }
        this.service.cartTotal--;
        this.service.cartData[index].quantity--;
        this.order.total_price -= this.service.cartData[index].total_price;
        this.setTipValue(this.order.tip.percent, true);
        this.updateTaxListAndTotalCharges();
    }

    onQuantityAddClick(index: number, event: Event): void {
        event.stopPropagation();
        this.service.cartTotal++;
        this.service.cartData[index].quantity++;
        this.order.total_price += this.service.cartData[index].total_price;
        this.setTipValue(this.order.tip.percent, true);
        this.updateTaxListAndTotalCharges();
    }

    setTipValue(percent: number, afterQuantityChange?: boolean): void {
        if (!afterQuantityChange && percent === this.order.tip.percent) {
            this.order.tip = new Tip();
            this.updateTaxListAndTotalCharges();
            return;
        }
        this.order.tip.percent = percent;
        this.order.tip.amount = percent / 100 * this.order.total_price;
        if (!afterQuantityChange) {
            this.updateTaxListAndTotalCharges();
        }
    }

    private updateTaxListAndTotalCharges(): void {
        this.order.tax_list = [];
        this.service.services.convenience_fee = Number(this.service.services.convenience_fee);
        this.service.services.delivery_price_fee = Number(this.service.services.delivery_price_fee);
        this.order.total_charges = this.order.total_price + this.service.services.convenience_fee;
        this.order.total_charges += this.order.tip.amount ? this.order.tip.amount : 0;

        let isDeliveryFeeApplicable: boolean = false;
        if (this.isDeliveryOrder && this.order.total_price < this.service.services.free_delivery_amount) {
            this.order.total_charges += this.service.services.delivery_price_fee;
            isDeliveryFeeApplicable = true;
        }

        if (!this.service.taxList.length) {
            return;
        }
        let taxableTotalPrice: number = 0;
        for (let item of this.service.cartData) {
            if (!item.is_tax_exempted) {
                taxableTotalPrice += item.total_price * item.quantity;
            }
        }
        for (let tax of this.service.taxList) {
            tax.tax_value = Number(tax.tax_value);
            let amount: number;
            if (tax.tax_method === BY_FLAT) {
                amount = tax.tax_value;
            } else {
                amount = tax.tax_value / 100 * taxableTotalPrice;
                amount += this.service.services.convenience_fee_taxable ? tax.tax_value / 100 * this.service.services.convenience_fee : 0;
                if (isDeliveryFeeApplicable && this.service.services.delivery_price_fee_taxable) {
                    amount += tax.tax_value / 100 * this.service.services.delivery_price_fee;
                }
            }
            this.order.tax_list.push({
                tax: tax,
                amount: amount
            });
            this.order.total_charges += amount;
        }
    }

    openAddressSelector(): void {
        let addressModal = this.modalCtrl.create(AddressModal, { "tabId": this.tabId });
        addressModal.onDidDismiss(data => {
            if (data.data) {
                this.order.contact.addressLine = data.data.address;
                this.addressCoords.lat = data.data.lat;
                this.addressCoords.long = data.data.long;
                this.checkDeliveryRadius();
            }
        });
        addressModal.present();
    }

    setOrderInfo(): void {
        let services = {};
        services[this.service.orderType.DINE_IN] = 'Dine-In';
        services[this.service.orderType.TAKEOUT] = 'Takeout';
        services[this.service.orderType.DELIVERY] = 'Delivery';
        let orderMoment = moment(this.service.orderSettings.datetime, 'YYYY-MM-DD HH:mm:ss');
        this.orderDay = orderMoment.isSame(moment(), 'day') ? 'Today' : weekDays[orderMoment.day()];
        this.orderTime = orderMoment.format('h:mm A');
        this.orderInfo = services[this.service.orderSettings.type] + ' ' + this.orderDay + ' @ ' + this.orderTime;
    }

    onAddressButtonClick(address: Address): void {
        this.order.contact.addressLine = address.addressLine;
        this.order.contact.zip = address.zip;
        this.order.contact.apartment = address.apartment;
        this.order.contact.firstName = address.firstName;
        this.order.contact.lastName = address.lastName;
        this.order.contact.phone = address.phone;
        this.order.contact.email = address.email;
        this.addressCoords.lat = address.lat;
        this.addressCoords.long = address.long;
    }

    private startFetchingAddresses(): void {
        this.db = this.service.getDatabaseObject();
        this.service.openDatabase().then(() => {
            this.service.createAddressTable().then(() => this.getAddressList()).catch(() => { });
        }).catch(() => { });
    }

    private getAddressList(): void {
        this.db.executeSql("SELECT id, locationName, address as addressLine, zip, apartment, firstName, lastName, phone, email, created_at, lat, long FROM address", {}).then(resultSet => {
            for (let i = 0; i < resultSet.rows.length; i++) {
                this.addressList.push(resultSet.rows.item(i));
            }
        }, err => {
            console.log('Address select query error:', err);
        });
    }

    onAddressAddClick(): void {
        this.navCtrl.push(FoodOrderingAddAddresses, { tabId: this.tabId });
    }

    private checkDeliveryRadius(): boolean {
        let distance: number = <number>this.service.getDistance(
            this.service.orderSettings.location.latitude,
            this.service.orderSettings.location.longitude,
            this.service.services.delivery_radius_type,
            this.addressCoords.lat,
            this.addressCoords.long
        );
        if (distance > this.service.services.delivery_radius) {
            this.display.showToast('Cannot deliver to this address.');
            return false;
        }
        return true;
    }

    onCheckoutClick(): void {
        if (!this.service.payment.is_cash && !this.service.payment.is_card) {
            this.display.showAlert('No payment method available.');
            return;
        }
        
        if (!this.order.payment_method) {
            this.display.showAlert('Please select a payment method.');
            return;
        }

        if (this.service.payment.is_card && !this.service.payment.payment_gateway) {
            this.display.showAlert('No payment gateway available.');
            return;
        }

        let requiredFields = this.requiredFields;
        if (this.isDeliveryOrder) {
            if (this.order.total_price < this.service.services.delivery_minimum) {
                this.display.showAlert('Minimum order for delivery is: ' + this.currencySymbol + ' ' + this.service.services.delivery_minimum);
                return;
            }
            requiredFields = requiredFields.concat(this.deliveryRequiredFields);
        } else if (this.order.is_email_receipt) {
            requiredFields.push('email');
        }

        // Required validation check
        for (let i = 0; i < requiredFields.length; i++) {
            if (this.order.contact[requiredFields[i]] === '' || this.order.contact[requiredFields[i]] === undefined) {
                this.display.showAlert('Please fill out the required fields.');
                return;
            }
        }

        // Email validation when it's a delivery order, or if email receipt is true.
        if (
            (this.isDeliveryOrder || this.order.is_email_receipt) &&
            !this.globalService.validateEmail(this.order.contact.email)
        ) {
            this.display.showToast('Please verify your email is correct.');
            return;
        }

        if (this.isDeliveryOrder && !this.checkDeliveryRadius()) {
            return;
        }

        this.order.tab_id = this.tabId;
        this.order.location_id = this.service.orderSettings.location.id;
        this.order.convenience_fee = this.service.services.convenience_fee;
        this.order.datetime = this.service.orderSettings.datetime;
        this.order.items = this.service.cartData;
        this.order.order_status = ORDER_STATUS_UNSERVED;
        this.order.paid_status = PAID_STATUS_UNPAID;
        this.order.shipping_instructions = '';
        this.order.type = this.service.orderSettings.type;
        this.order.device_uuid = Device.uuid;
        this.order.is_order_placed = this.order.payment_method === this.paymentMethod.CASH ? true : false;
        this.order.delivery_charges = this.service.services.delivery_price_fee;
        this.order.free_delivery_amount = this.service.services.free_delivery_amount;
        this.order.convenience_fee_taxable = this.service.services.convenience_fee_taxable;
        this.order.delivery_price_fee_taxable = this.service.services.delivery_price_fee_taxable;
        
        this.display.showNativeLoader('', () => this.onNativeLoaderBackdropClick());
        this.service.placeOrder(this.order).timeout(30000).subscribe(res => {
            if (res.success) {
                this.order.id = res.data.id;
                if (this.order.payment_method === this.paymentMethod.CASH) {
                    this.display.hideNativeLoader();
                    this.onOrderSuccess();
                } else {
                    this.navCtrl.push(PaymentIframe, {
                        tabId: this.tabId,
                        currencySymbol: this.currencySymbol,
                        price: this.order.total_charges,
                        dismissCallback: this.paymentIframeDismiss,
                    });
                }
            } else {
                this.display.hideNativeLoader();
                this.display.showToast(res.message);
            }
        }, err => {
            this.display.hideNativeLoader();
            this.display.showAlert('Order could not be placed. Please try again');
        });
    }

    private onOrderSuccess(): void {
        this.showOrderSuccessAlert().onDidDismiss(() => {
            this.popToInitialView();
            this.refreshOrderData();
        });
    }

    private refreshOrderData(): void {
        this.service.orderSettings = undefined;
        this.service.cartData = [];
        this.service.cartTotal = 0;
        this.service.taxList = [];
        this.service.order = new FoodOrder();
    }

    private showOrderSuccessAlert(): Alert {
        let alert = this.alertCtrl.create();
        alert.setTitle('Success');
        alert.setMessage('Your order will be ready at ' + this.orderTime + ' ' + this.orderDay + '<p>Thank you</p>');
        alert.addButton('OK');
        alert.present();
        return alert;
    }

    private popToInitialView(): void {
        this.navCtrl.remove(
            this.service.initialViewIndex + 1,
            this.navCtrl.length() - (this.service.initialViewIndex + 1)
        );
    }

    private setPaymentIframeDismiss(): void {
        this.paymentIframeDismiss = (token) => {
            this.makePayment(token);
            return new Promise(resolve => resolve());
        };
    }

    private makePayment(token: string): void {
        let data = {
            order_id: this.order.id,
            tab_id: this.tabId,
            app_code: DataService.appCode,
            device_uuid: Device.uuid,
            first_name: this.order.contact.firstName,
            last_name: this.order.contact.lastName,
            phone: this.order.contact.phone,
            email: this.order.contact.email,
            apt_suite_floor: this.order.contact.apartment,
            address: this.order.contact.addressLine,
            zip: this.order.contact.zip,
            total_charges: this.globalService.formatNumber(this.order.total_charges, 2),
            payment_method_token: token
        };
        this.display.showNativeLoader('', () => this.onNativeLoaderBackdropClick());
        this.service.makePayment(data).timeout(30000).subscribe(res => {
            this.display.hideNativeLoader();
            if (res.success) {
                this.onOrderSuccess();
            } else {
                this.display.showAlert('There was a problem with your card', 'Failed');
            }
        }, err => {
            this.display.hideNativeLoader();
            this.display.showAlert('Order could not be placed. Please try again');
        });
    }

    onNativeLoaderBackdropClick(): void {
        if (this.navCtrl.getActive().name === 'PaymentIframe') {
            this.display.hideNativeLoader();
        }
    }

}
