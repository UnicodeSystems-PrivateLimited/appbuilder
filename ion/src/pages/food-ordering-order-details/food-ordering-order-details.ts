import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { DisplayService, GlobalService, FoodOrderingService } from '../../providers/index';
import { Subscription } from 'ionic-native/node_modules/rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Tab } from '../../interfaces/index';
import { FoodOrderingLocationHours, weekDays, SelectOption } from '../../interfaces/index';
import moment from 'moment';

const HOURS_STATUS_ENABLED: number = 1;
const dateFormat: string = 'YYYY-MM-DD';
const timeFormat: string = 'HH:mm:ss';
const dateDisplayFormat: string = 'D (ddd)';
const timeDisplayFormat: string = 'h:mm A';

@Component({
    selector: 'page-food-ordering-order-details',
    templateUrl: 'food-ordering-order-details.html'
})
export class FoodOrderingOrderDetails {

    orderKey: number;
    tabId: number;
    loader: boolean = true;
    orderData: any;
    items: any;
    orderInfo: string;
    orderDay: string;
    orderTime: string;
    osType: string;
    // osType: string;
    // orderServices: { label: string, type: number }[] = [];
    // subscription: Subscription;
    // hours: FoodOrderingLocationHours[] = [];
    // todayHours: FoodOrderingLocationHours[] = [];
    // day: string;
    // dayWiseHours: any = {};
    // selectedOrderType: number;
    // dateOptions: SelectOption[] = [];
    // timeOptions: SelectOption[] = [];
    // orderDate: string;
    // orderTime: string;
    // timeOptionsCollection: any = {};
    // checkItems: any = [];
 
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public service: FoodOrderingService,
        public display: DisplayService,
        public globalService: GlobalService,
        public platform: Platform
    ) {
        this.orderKey = navParams.get('orderKey');
        this.tabId = navParams.get('tabId');
        this.orderData = this.service.pastOrders[this.orderKey];
        this.items = JSON.parse(this.orderData.items);
        this.osType = platform.is('ios') ? 'ios' : 'android';
        console.log('this.orderData', this.orderData);
        // this.osType = platform.is('ios') ? 'ios' : 'android';
        // this.day = weekDays[moment().day()];
        // for (let day of weekDays) {
        //     this.dayWiseHours[day] = [];
        // }

        // this.initOrderServices();
        // this.getLocationHours();
        this.setOrderInfo();
    }

    setOrderInfo(): void {
        let services = {};
        services[this.service.orderType.DINE_IN] = 'Dine-In';
        services[this.service.orderType.TAKEOUT] = 'Takeout';
        services[this.service.orderType.DELIVERY] = 'Delivery';
        let orderMoment = moment(this.orderData.datetime, 'YYYY-MM-DD HH:mm:ss');
        this.orderDay = orderMoment.isSame(moment(), 'day') ? 'Today' : weekDays[orderMoment.day()];
        this.orderTime = orderMoment.format('h:mm A');
        this.orderInfo = services[this.orderData.type] + ' ' + this.orderDay + ' @ ' + this.orderTime;
    }

    // ionViewDidLoad() {
    //     console.log('Hello FoodOrderingOrderDetails Page');
    //     console.log('order', this.orderData);
    // }

    // initOrderServices(): void {
    //     if (this.service.services.dine_in) {
    //         this.orderServices.push({
    //             label: 'Dine-In',
    //             type: this.service.orderType.DINE_IN
    //         });
    //     }
    //     if (this.service.services.take_out) {
    //         this.orderServices.push({
    //             label: 'Takeout',
    //             type: this.service.orderType.TAKEOUT
    //         });
    //     }
    //     if (this.service.services.delivery) {
    //         this.orderServices.push({
    //             label: 'Delivery',
    //             type: this.service.orderType.DELIVERY
    //         });
    //     }
    // }

    // getLocationHours(): void {
    //     this.loader = true;
    //     this.subscription = this.service.getLocationHours(this.orderData.location_id).timeout(30000).subscribe(res => {
    //         console.log('getLocationHours ---- ', res);
    //         if (res.success) {
    //             this.hours = res.data;
    //             for (let i = 0; i < this.hours.length; i++) {
    //                 if (this.hours[i].day === this.day && this.hours[i].status == HOURS_STATUS_ENABLED) {
    //                     this.todayHours.push(this.hours[i]);
    //                 }
    //                 this.dayWiseHours[this.hours[i].day].push(this.hours[i]);
    //             }
    //         } else {
    //             this.display.showToast("Failed to load data");
    //             this.display.showRetryDialog(() => this.getLocationHours());
    //         }
    //         this.loader = false;
    //     }, err => {
    //         this.loader = false;
    //         this.display.showRetryDialog(() => this.getLocationHours());
    //     });
    // }

    // onOrderTypeClick(type: number): void {
    //     if (type === this.selectedOrderType) return;
    //     this.selectedOrderType = undefined;
    //     this.dateOptions = [];
    //     this.timeOptions = [];
    //     this.timeOptionsCollection = [];
    //     this.orderDate = undefined;
    //     this.orderTime = undefined;
    //     let available: boolean;
    //     switch (type) {
    //         case this.service.orderType.DINE_IN:
    //             available = this.onDineInOrder();
    //             break;
    //         case this.service.orderType.TAKEOUT:
    //             available = this.onTakeoutOrDeliveryOrder(this.service.services.take_out_days);
    //             break;
    //         case this.service.orderType.DELIVERY:
    //             available = this.onTakeoutOrDeliveryOrder(this.service.services.delivery_days);
    //             break;
    //         default:
    //             console.log('Invalid order type.');
    //     }
    //     if (available) {
    //         this.selectedOrderType = type;
    //     } else {
    //         this.display.showAlert('No availablity for selected service at this time.');
    //     }
    // }

    // onDineInOrder(): boolean {
    //     if (!this.todayHours.length) {
    //         return false;
    //     }
    //     let finalEndTime = this.getDayClosingTime(this.todayHours);
    //     if (moment().isAfter(moment(finalEndTime, timeFormat), 'minute')) {
    //         return false;
    //     }
    //     this.dateOptions.push({
    //         label: moment().date().toString() + ' (Today)',
    //         value: moment().format(dateFormat)
    //     });
    //     this.orderDate = this.dateOptions[0].value;
    //     let leadTime = this.service.services.lead_time;
    //     let currentTime = this.getFlooredCurrentTime();
    //     for (let i = 0; i < this.todayHours.length; i++) {
    //         let startTime = moment(this.todayHours[i].start_time, timeFormat);
    //         let orderTime = currentTime.isAfter(startTime) ? currentTime.add(leadTime, 'm') : startTime.add(leadTime, 'm');
    //         while (orderTime.isBefore(moment(this.todayHours[i].end_time, timeFormat), 'minute')) {
    //             this.timeOptions.push({
    //                 label: orderTime.format(timeDisplayFormat),
    //                 value: orderTime.format(timeFormat)
    //             });
    //             orderTime = orderTime.add(leadTime, 'm');
    //         }
    //     }
    //     if (!this.timeOptions.length) {
    //         return false;
    //     }
    //     this.timeOptions[0].label = 'ASAP ' + this.timeOptions[0].label;
    //     return true;
    // }

    // onTakeoutOrDeliveryOrder(daysInAdvance: number): boolean {
    //     if (!this.hours.length) {
    //         return false;
    //     }
    //     if (this.todayHours.length) {
    //         let todayEndTime = this.getDayClosingTime(this.todayHours);
    //         if (moment().isBefore(moment(todayEndTime, timeFormat), 'minute')) {
    //             this.dateOptions.push({
    //                 label: moment().date().toString() + ' (Today)',
    //                 value: moment().format(dateFormat)
    //             });
    //         }
    //     }
    //     for (let i = 1; i <= daysInAdvance; i++) {
    //         let day = moment().add(i, 'd');
    //         if (this.dayWiseHours[weekDays[day.day()]][0].status === HOURS_STATUS_ENABLED) {
    //             this.dateOptions.push({
    //                 label: day.format(dateDisplayFormat),
    //                 value: day.format(dateFormat)
    //             });
    //         }
    //     }
    //     if (!this.dateOptions.length) {
    //         return false;
    //     }
    //     this.setTimeOptionsCollection();
    //     if (!this.timeOptionsCollection[this.dateOptions[0].value]) {
    //         this.dateOptions.splice(0, 1);
    //     }
    //     this.orderDate = this.dateOptions[0].value;
    //     this.timeOptions = this.timeOptionsCollection[this.dateOptions[0].value] || [];
    //     return this.dateOptions.length ? true : false;
    // }

    // private getDayClosingTime(hours: FoodOrderingLocationHours[]): string {
    //     let closingTime = '00:00:00';
    //     for (let i = 0; i < hours.length; i++) {
    //         if (moment(hours[i].end_time, timeFormat).isAfter(moment(closingTime, timeFormat), 'minute')) {
    //             closingTime = hours[i].end_time;
    //         }
    //     }
    //     return closingTime;
    // }

    // private getFlooredCurrentTime(): moment.Moment {
    //     let time = moment();
    //     let mod = time.minutes() % 5;
    //     if (mod !== 0) {
    //         time = time.add(5 - mod, 'm');
    //     }
    //     time.seconds(0);
    //     return time;
    // }

    // private setTimeOptionsCollection(): void {
    //     let leadTime = this.service.services.lead_time;
    //     let currentTime = this.getFlooredCurrentTime();
    //     for (let dateOption of this.dateOptions) {
    //         let dateOptionMoment = moment(dateOption.value, dateFormat);
    //         let weekDay = weekDays[dateOptionMoment.day()];
    //         for (let i = 0; i < this.dayWiseHours[weekDay].length; i++) {
    //             let startTime = moment(this.dayWiseHours[weekDay][i].start_time, timeFormat);
    //             let orderTime: moment.Moment;
    //             if (moment().isSame(dateOptionMoment, 'day')) {
    //                 orderTime = currentTime.isAfter(startTime) ? currentTime.add(leadTime, 'm') : startTime.add(leadTime, 'm');
    //             } else {
    //                 orderTime = startTime.add(leadTime, 'm');
    //             }
    //             while (orderTime.isBefore(moment(this.dayWiseHours[weekDay][i].end_time, timeFormat), 'minute')) {
    //                 if (!this.timeOptionsCollection[dateOption.value]) {
    //                     this.timeOptionsCollection[dateOption.value] = [];
    //                 }
    //                 this.timeOptionsCollection[dateOption.value].push({
    //                     label: orderTime.format(timeDisplayFormat),
    //                     value: orderTime.format(timeFormat)
    //                 });
    //                 orderTime = orderTime.add(leadTime, 'm');
    //             }
    //         }
    //     }
    // }

    // onReorderClick(): void {
    //     if (!this.selectedOrderType) {
    //         this.display.showAlert('Please select order type.');
    //         return;
    //     }
    //     if (!this.orderDate || !this.orderTime) {
    //         this.display.showAlert('Please select day and time.');
    //         return;
    //     }
    //     console.log('items count ---- ', this.items.length);
    //     this.checkItemStatus();
    //     // this.display.showToast('One or more items in your order will not be added to cart.');
    //     // this.service.orderSettings = new FoodOrderSettings();
    //     // this.service.orderSettings.type = this.selectedOrderType;
    //     // this.service.orderSettings.datetime = this.orderDate + ' ' + this.orderTime;
    //     // this.service.orderSettings.location = this.location;
    //     // this.navCtrl.push(FoodOrderingCategories, {
    //     //     tabId: this.tabId,
    //     //     locationId: this.location.id
    //     // });
    // }

    // private checkItemStatus(): any {
    //     let itemCount = this.items.length;
    //     console.log('this.items----',this.items);
    //     for (let i = 0; i < itemCount; i++) {
    //         let itemId = this.items[i].item_id;
    //         console.log('itemId',itemId);
    //         if(this.items[i].hasOwnProperty('options')) {
    //             let optionsCount = this.items[i].options.length;
    //             for(let j = 0; j < optionsCount; j++) {
    //                 this.checkItems = { itemId: {
    //                         'id' : this.items[i].options[j].option.id, 
    //                         'type_id' : this.items[i].options[j].option.type_id
    //                     }
    //                 };
    //             }
    //         } else {

    //         }
    //     }
    //     console.log('this.checkItems',this.checkItems);
    // }

}
