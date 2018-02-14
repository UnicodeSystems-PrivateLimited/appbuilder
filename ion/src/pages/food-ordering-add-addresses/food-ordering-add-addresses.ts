import { Component, NgZone } from '@angular/core';
import { NavController, ViewController, NavParams, Platform, ModalController } from 'ionic-angular';
import { SQLite } from "ionic-native";
import { Address as AddressEntity } from "../../interfaces";
import moment from 'moment';
import { AddressSelector as AddressModal } from '../../components/address-selector/address-selector';
import { GlobalService } from '../../providers/global-service';
import { DisplayService } from '../../providers/display-service/display-service';
import { Keyboard } from 'ionic-native';
import { Subscription, Subject } from 'rxjs';

@Component({
    selector: 'page-food-ordering-add-addresses',
    templateUrl: 'food-ordering-add-addresses.html'
})
export class FoodOrderingAddAddresses {

    newAddress: AddressEntity = new AddressEntity();
    public db: SQLite;
    public tabId: number;
    public id: number = null;
    public locationName: string;
    public showKeyboardOffset: boolean = false;
    public keyboardShowSubscription: Subscription;
    public keyboardHideSubscription: Subscription;
    public onKeyboardOffsetShow: Subject<void> = new Subject<void>();

    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public globalService: GlobalService,
        public display: DisplayService,
        public navParams: NavParams,
        public platform: Platform,
        public modalCtrl: ModalController,
        public zone: NgZone
    ) {
        this.tabId = navParams.get("tabId");
        this.id = navParams.get("id") || this.id;
        this.newAddress = navParams.get("address") || this.newAddress;
        if (navParams.get("address") && navParams.get("address").address) {
            this.newAddress.addressLine = navParams.get("address").address;
        }
        console.log(this.newAddress);
        platform.ready().then(() => {
            this.openDB();
        });
        if (this.platform.is("cordova") && this.platform.is("android")) {
            this.keyboardShowSubscription = Keyboard.onKeyboardShow().subscribe(event => this.onKeyboardShow(event));
            this.keyboardHideSubscription = Keyboard.onKeyboardHide().subscribe(event => this.onKeyboardHide(event));
        }
    }

    ionViewDidLoad() {
        console.log('Hello FoodOrderingAddAddresses Page');
    }

    public ionViewWillLeave(): void {
        this.keyboardShowSubscription.unsubscribe();
        this.keyboardHideSubscription.unsubscribe();
        this.onKeyboardOffsetShow.complete();
    }


    addressModal() {
        let addressModal = this.modalCtrl.create(AddressModal, { "tabId": this.tabId });
        addressModal.onDidDismiss((data) => {
            if (data.data) {
                this.newAddress.addressLine = data.data.address;
                this.newAddress.lat = data.data.lat;
                this.newAddress.long = data.data.long;
            }
        });
        addressModal.present();
    }


    public openDB(): void {
        this.db = new SQLite();
        this.db.openDatabase({
            name: 'tappit.db',
            location: 'default'
        }).then(() => {
            this.createTable();
        }).catch(err => {
            this.handleDBError(err);
        });
    }

    public createTable(): void {
        this.db.executeSql("CREATE TABLE IF NOT EXISTS address (id INTEGER PRIMARY KEY, locationName TEXT, address TEXT, zip TEXT, apartment TEXT, firstName TEXT, lastName TEXT, phone INTEGER, email TEXT, created_at DATETIME DEFAULT NULL)", {}).then(() => {
            console.log("address table created/already exists");
        }, err => {
            console.log("Table couldn't be created or opened :(");
            this.handleDBError(err);
        });
    }

    saveAddress(): void {
        console.log("saveAddress function");
        if (!this.id) {
            console.log("insert address")
            this.insertAddress();
        } else {
            console.log("update address")
            this.updateAddress();
        }
    }

    public insertAddress(): void {
        let createdAt: string = moment().format();
        this.db.executeSql("INSERT INTO address (locationName, address, zip, apartment, firstName, lastName, phone, email, lat, long, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)", [this.newAddress.locationName, this.newAddress.addressLine, this.newAddress.zip, this.newAddress.apartment, this.newAddress.firstName, this.newAddress.lastName, this.newAddress.phone, this.newAddress.email, this.newAddress.lat, this.newAddress.long, createdAt]).then(resultSet => {
            this.globalService.addressActionStatus = this.globalService.addressActionStatuses.CREATED;
            this.globalService.actedAddress = new AddressEntity();
            this.globalService.actedAddress.id = resultSet.insertId;
            this.globalService.actedAddress.locationName = this.newAddress.locationName;
            this.globalService.actedAddress.addressLine = this.newAddress.addressLine;
            this.globalService.actedAddress.zip = this.newAddress.zip;
            this.globalService.actedAddress.apartment = this.newAddress.apartment;
            this.globalService.actedAddress.firstName = this.newAddress.firstName;
            this.globalService.actedAddress.lastName = this.newAddress.lastName;
            this.globalService.actedAddress.phone = this.newAddress.phone;
            this.globalService.actedAddress.email = this.newAddress.email;
            this.globalService.actedAddress.lat = this.newAddress.lat;
            this.globalService.actedAddress.long = this.newAddress.long;
            this.globalService.actedAddress.created_at = createdAt;
            this.display.showToast("Address saved.");
            this.navCtrl.pop();
        }, err => {
            this.handleDBError(err);
        });
    }

    public updateAddress(): void {
        this.db.executeSql("UPDATE address SET locationName=?, address=?, zip=?, apartment=?, firstName=?, lastName=?, phone=?, email=?, lat=?, long=?  WHERE id=?", [this.newAddress.locationName, this.newAddress.addressLine, this.newAddress.zip, this.newAddress.apartment, this.newAddress.firstName, this.newAddress.lastName, this.newAddress.phone, this.newAddress.email, this.newAddress.lat, this.newAddress.long, this.newAddress.id]).then(resultSet => {
            this.globalService.addressActionStatus = this.globalService.addressActionStatuses.EDITED;
            this.globalService.actedAddress = new AddressEntity();
            this.globalService.actedAddress.id = this.newAddress.id;
            this.globalService.actedAddress.locationName = this.newAddress.locationName;
            this.globalService.actedAddress.addressLine = this.newAddress.addressLine;
            this.globalService.actedAddress.zip = this.newAddress.zip;
            this.globalService.actedAddress.apartment = this.newAddress.apartment;
            this.globalService.actedAddress.firstName = this.newAddress.firstName;
            this.globalService.actedAddress.lastName = this.newAddress.lastName;
            this.globalService.actedAddress.phone = this.newAddress.phone;
            this.globalService.actedAddress.email = this.newAddress.email;
            this.globalService.actedAddress.lat = this.newAddress.lat;
            this.globalService.actedAddress.long = this.newAddress.long;
            this.display.showToast("Address updated.");
            this.navCtrl.pop();
        }, err => {
            this.handleDBError(err);
        });
    }

    public handleDBError(err: any): void {
        console.log(err);
        this.display.showToast("Error occured");
        this.navCtrl.pop();
    }


    public onTextInputFocus(event): void {
        if (this.platform.is("cordova") && this.platform.is("android")) {
            let element = event.target;
            let i: number = 1;
            while (element) {
                if (i++ > 3) {
                    break;
                }
                element = element.parentNode;
                if (element.tagName === "DIV") {
                    let subscription: Subscription = this.onKeyboardOffsetShow.subscribe(() => {
                        element.scrollIntoView({ behavior: "smooth" });
                        subscription.unsubscribe();
                    });
                    break;
                }
            }
        }
    }

    public onKeyboardShow(event): void {
        this.zone.run(() => {
            this.showKeyboardOffset = true;
            setTimeout(() => this.onKeyboardOffsetShow.next(), 0);
        });
    }

    public onKeyboardHide(event): void {
        console.log(event);
        this.zone.run(() => {
            this.showKeyboardOffset = false;
        });
    }


}
