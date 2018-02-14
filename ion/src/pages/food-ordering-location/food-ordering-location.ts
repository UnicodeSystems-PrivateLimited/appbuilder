import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { DisplayService, GlobalService, FoodOrderingService } from '../../providers/index';
import { FoodOrderingLocation as FOLocation, FoodOrderingLocationHours, weekDays, SelectOption, FoodOrderSettings, FoodOrder } from '../../interfaces/index';
import { Geoposition } from 'ionic-native';
import { Subscription } from 'rxjs/Subscription';
import moment from 'moment';
import { FoodOrderingCategories } from '../food-ordering-categories/food-ordering-categories';
import { AlertController } from 'ionic-angular/components/alert/alert';

declare var google: any;

const HOURS_STATUS_ENABLED: number = 1;
const dateFormat: string = 'YYYY-MM-DD';
const timeFormat: string = 'HH:mm:ss';
const dateDisplayFormat: string = 'D (ddd)';
const timeDisplayFormat: string = 'h:mm A';

@Component({
    selector: 'page-food-ordering-location',
    templateUrl: 'food-ordering-location.html'
})
export class FoodOrderingLocation {

    tabId: number;
    loader: boolean = true;
    location: FOLocation;
    map: any;
    marker: any;
    currentPosition: Geoposition;
    selectedOrderType: number;
    subscription: Subscription;
    hours: FoodOrderingLocationHours[] = [];
    todayHours: FoodOrderingLocationHours[] = [];
    day: string;
    dateOptions: SelectOption[] = [];
    timeOptions: SelectOption[] = [];
    orderDate: string;
    orderTime: string;
    dayWiseHours: any = {};
    timeOptionsCollection: any = {};
    orderServices: { label: string, type: number }[] = [];
    unregisterBackButtonAction: Function[] = [];
    timeCheckerTimeout: number;

    constructor(
        public navCtrl: NavController,
        public display: DisplayService,
        public navParams: NavParams,
        public globalService: GlobalService,
        public platform: Platform,
        public service: FoodOrderingService,
        public alertCtrl: AlertController
    ) {
        this.tabId = navParams.get('tabId');
        this.location = navParams.get('location');
        this.service.getCurrentPosition().then(position => {
            this.currentPosition = position;
        });
        this.day = weekDays[moment().day()];
        for (let day of weekDays) {
            this.dayWiseHours[day] = [];
        }

        this.initOrderServices();
        this.getLocationHours();
    }

    ionViewDidLoad(): void {
        this.display.hideLoader();
        this.service.locationViewIndex = this.navCtrl.getActive().index;
        setTimeout(() => {
            this.loadMap();
        });
        if (!this.service.services.dine_in && !this.service.services.take_out && !this.service.services.delivery) {
            this.display.showAlert('No service options are available.', undefined, () => {
                this.navCtrl.pop();
            }, false);
        }
    }

    ionViewDidEnter(): void {
        this.platform.ready().then(() => {
            this.unregisterBackButtonAction.push(
                this.platform.registerBackButtonAction(() => this.onBackClick(), 1)
            );
        });
    }

    ionViewWillLeave(): void {
        for (let i = 0; i < this.unregisterBackButtonAction.length; i++) {
            this.unregisterBackButtonAction[i]();
        }
    }

    private leaveLocation() {
        this.service.clearOrderData();
        this.navCtrl.pop();
        this.clearTimeout();
    }

    loadMap(): void {
        let latLng = new google.maps.LatLng(Number(this.location.latitude), Number(this.location.longitude));
        let mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        }
        this.map = new google.maps.Map(document.querySelector('page-food-ordering-location #map'), mapOptions);
        this.marker = new google.maps.Marker({
            position: latLng,
            map: this.map
        });
    }

    initOrderServices(): void {
        if (this.service.services.dine_in) {
            this.orderServices.push({
                label: 'Dine-In',
                type: this.service.orderType.DINE_IN
            });
        }
        if (this.service.services.take_out) {
            this.orderServices.push({
                label: 'Takeout',
                type: this.service.orderType.TAKEOUT
            });
        }
        if (this.service.services.delivery) {
            this.orderServices.push({
                label: 'Delivery',
                type: this.service.orderType.DELIVERY
            });
        }
    }

    onNavigateClick(): void {
        let latLng: string = this.location.latitude + ',' + this.location.longitude;
        window.open('http://maps.google.com/?saddr=My+Location&daddr=' + latLng, '_system');
    }

    onOrderTypeClick(type: number): void {
        if (type === this.selectedOrderType) return;
        this.selectedOrderType = undefined;
        this.dateOptions = [];
        this.timeOptions = [];
        this.timeOptionsCollection = [];
        this.orderDate = undefined;
        this.orderTime = undefined;
        let available: boolean;
        switch (type) {
            case this.service.orderType.DINE_IN:
                available = this.onDineInOrder();
                break;
            case this.service.orderType.TAKEOUT:
                available = this.onTakeoutOrDeliveryOrder(this.service.services.take_out_days);
                break;
            case this.service.orderType.DELIVERY:
                available = this.onTakeoutOrDeliveryOrder(this.service.services.delivery_days);
                break;
            default:
                console.log('Invalid order type.');
        }
        if (available) {
            this.selectedOrderType = type;
        } else {
            this.display.showAlert('No availablity for selected service at this time.');
        }
    }

    onChooseItemsClick(): void {
        if (!this.selectedOrderType) {
            this.display.showAlert('Please select order type.');
            return;
        }
        if (!this.orderDate || !this.orderTime) {
            this.display.showAlert('Please select day and time.');
            return;
        }
        this.service.orderSettings = new FoodOrderSettings();
        this.service.orderSettings.type = this.selectedOrderType;
        this.service.orderSettings.datetime = this.orderDate + ' ' + this.orderTime;
        this.service.orderSettings.location = this.location;
        // let orderTimeMoment = moment(this.service.orderSettings.datetime, dateFormat + ' ' + timeFormat);
        // this.clearTimeout();
        // this.timeCheckerTimeout = setTimeout(() => {
        //     this.showTimeOverDialog();
        // }, orderTimeMoment.diff(moment()));
        this.navCtrl.push(FoodOrderingCategories, {
            tabId: this.tabId,
            locationId: this.location.id
        });
    }

    getLocationHours(): void {
        this.loader = true;
        this.subscription = this.service.getLocationHours(this.location.id).timeout(30000).subscribe(res => {
            if (res.success) {
                this.hours = res.data;
                for (let i = 0; i < this.hours.length; i++) {
                    if (this.hours[i].day === this.day && this.hours[i].status == HOURS_STATUS_ENABLED) {
                        this.todayHours.push(this.hours[i]);
                    }
                    this.dayWiseHours[this.hours[i].day].push(this.hours[i]);
                }
            } else {
                this.display.showToast("Failed to load data");
                this.display.showRetryDialog(() => this.getLocationHours());
            }
            this.loader = false;
        }, err => {
            this.loader = false;
            this.display.showRetryDialog(() => this.getLocationHours());
        });
    }

    private getDayClosingTime(hours: FoodOrderingLocationHours[]): string {
        let closingTime = '00:00:00';
        for (let i = 0; i < hours.length; i++) {
            if (moment(hours[i].end_time, timeFormat).isAfter(moment(closingTime, timeFormat), 'minute')) {
                closingTime = hours[i].end_time;
            }
        }
        return closingTime;
    }

    private getFlooredCurrentTime(): moment.Moment {
        let time = moment();
        let mod = time.minutes() % 5;
        if (mod !== 0) {
            time = time.add(5 - mod, 'm');
        }
        time.seconds(0);
        return time;
    }

    onDineInOrder(): boolean {
        if (!this.todayHours.length) {
            return false;
        }
        let finalEndTime = this.getDayClosingTime(this.todayHours);
        if (moment().isAfter(moment(finalEndTime, timeFormat), 'minute')) {
            return false;
        }
        this.dateOptions.push({
            label: moment().date().toString() + ' (Today)',
            value: moment().format(dateFormat)
        });
        this.orderDate = this.dateOptions[0].value;
        let leadTime = this.service.services.lead_time;
        let currentTime = this.getFlooredCurrentTime();
        for (let i = 0; i < this.todayHours.length; i++) {
            let startTime = moment(this.todayHours[i].start_time, timeFormat);
            let orderTime = currentTime.isAfter(startTime) ? currentTime.add(leadTime, 'm') : startTime.add(leadTime, 'm');
            while (orderTime.isBefore(moment(this.todayHours[i].end_time, timeFormat), 'minute')) {
                this.timeOptions.push({
                    label: orderTime.format(timeDisplayFormat),
                    value: orderTime.format(timeFormat)
                });
                orderTime = orderTime.add(leadTime, 'm');
            }
        }
        if (!this.timeOptions.length) {
            return false;
        }
        this.timeOptions[0].label = 'ASAP ' + this.timeOptions[0].label;
        return true;
    }

    onTakeoutOrDeliveryOrder(daysInAdvance: number): boolean {
        if (!this.hours.length) {
            return false;
        }
        if (this.todayHours.length) {
            let todayEndTime = this.getDayClosingTime(this.todayHours);
            if (moment().isBefore(moment(todayEndTime, timeFormat), 'minute')) {
                this.dateOptions.push({
                    label: moment().date().toString() + ' (Today)',
                    value: moment().format(dateFormat)
                });
            }
        }
        for (let i = 1; i <= daysInAdvance; i++) {
            let day = moment().add(i, 'd');
            if (this.dayWiseHours[weekDays[day.day()]][0].status === HOURS_STATUS_ENABLED) {
                this.dateOptions.push({
                    label: day.format(dateDisplayFormat),
                    value: day.format(dateFormat)
                });
            }
        }
        if (!this.dateOptions.length) {
            return false;
        }
        this.setTimeOptionsCollection();
        if (!this.timeOptionsCollection[this.dateOptions[0].value]) {
            this.dateOptions.splice(0, 1);
        }
        this.orderDate = this.dateOptions[0].value;
        this.timeOptions = this.timeOptionsCollection[this.dateOptions[0].value] || [];
        return this.dateOptions.length ? true : false;
    }

    private setTimeOptionsCollection(): void {
        let leadTime = this.service.services.lead_time;
        let currentTime = this.getFlooredCurrentTime();
        for (let dateOption of this.dateOptions) {
            let dateOptionMoment = moment(dateOption.value, dateFormat);
            let weekDay = weekDays[dateOptionMoment.day()];
            let len = this.dayWiseHours[weekDay].length;
            for (let i = 0; i < len; i++) {
                let startTime = moment(this.dayWiseHours[weekDay][i].start_time, timeFormat);
                let orderTime: moment.Moment;
                if (moment().isSame(dateOptionMoment, 'day')) {
                    orderTime = currentTime.isAfter(startTime) ? currentTime.add(leadTime, 'm') : startTime.add(leadTime, 'm');
                } else {
                    orderTime = startTime.add(leadTime, 'm');
                }
                while (orderTime.isBefore(moment(this.dayWiseHours[weekDay][i].end_time, timeFormat), 'minute')) {
                    if (!this.timeOptionsCollection[dateOption.value]) {
                        this.timeOptionsCollection[dateOption.value] = [];
                    }
                    this.timeOptionsCollection[dateOption.value].push({
                        label: orderTime.format(timeDisplayFormat),
                        value: orderTime.format(timeFormat)
                    });
                    orderTime = orderTime.add(leadTime, 'm');
                }
            }
        }
    }

    onDateChange(): void {
        if (this.selectedOrderType !== this.service.orderType.DINE_IN) {
            this.timeOptions = this.timeOptionsCollection[this.orderDate] || [];
        }
    }

    onBackClick(): void {
        if (this.service.cartData.length && !document.getElementsByTagName('ion-alert').length) {
            this.showLeaveConfirm();
            return;
        }
        this.navCtrl.pop();
        this.clearTimeout();
    }

    private showLeaveConfirm(): void {
        let alert = this.alertCtrl.create();
        alert.setTitle('Leave Location?');
        alert.setMessage('If you leave this location your cart will be erased. Will you proceed anyway?');
        alert.addButton('Stay Here');
        alert.addButton({
            text: 'Go Back',
            handler: () => this.leaveLocation()
        });
        alert.present();
    }

    showTimeOverDialog(): void {
        let alert = this.display.showAlert('Order time has been expired. You will be redirected to location page so you can select time again.');
        alert.onDidDismiss(() => {
            let noOfPops = this.navCtrl.length() - this.service.locationViewIndex;
            for (let i = 1; i < noOfPops; i++) {
                this.navCtrl.pop({ animate: false });
            }
        });
    }

    private clearTimeout(): void {
        if (this.timeCheckerTimeout) {
            clearTimeout(this.timeCheckerTimeout);
        }
    }

}