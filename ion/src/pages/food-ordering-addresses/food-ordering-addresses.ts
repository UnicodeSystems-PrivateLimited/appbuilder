import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, Platform } from 'ionic-angular';
import { SQLite } from "ionic-native";
import { FoodOrderingAddAddresses } from '../food-ordering-add-addresses/food-ordering-add-addresses';
import { DisplayService, GlobalService, DataService } from '../../providers';
import { Address } from "../../interfaces";
import { FoodOrderingAddAddresses as AddressPage } from '../food-ordering-add-addresses/food-ordering-add-addresses';

/*
  Generated class for the FoodOrderingAddresses page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-food-ordering-addresses',
    templateUrl: 'food-ordering-addresses.html'
})
export class FoodOrderingAddresses {

    tabId: number;
    public db: SQLite;
    public newAddress: Address[] = [];
    public loader: boolean = true;
    public id: number = null;


    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        public display: DisplayService,
        public globalService: GlobalService,
        public dataService: DataService,
        public platform: Platform,
    ) {
        this.tabId = navParams.get('tabId');
        platform.ready().then(() => {
            this.openDB();
        });
    }

    public ionViewDidEnter(): void {
        switch (this.globalService.addressActionStatus) {
            case this.globalService.addressActionStatuses.CREATED:
                this.newAddress.unshift(this.globalService.actedAddress);
                this.reset();
                break;
            case this.globalService.addressActionStatuses.EDITED:
                this.dataService.getByID(this.newAddress, this.globalService.actedAddress.id, (data, index) => {
                    data.locationName = this.globalService.actedAddress.locationName;
                });
                break;
        }
    }

    ionViewDidLoad() {
        console.log('Hello FoodOrderingAddresses Page');
    }

    public ionViewWillLeave(): void {
        this.globalService.addressActionStatus = this.globalService.addressActionStatuses.IDLE;
    }

    onAddNewAddressClick() {
        this.navCtrl.push(AddressPage, {
            tabId: this.tabId,
        });
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
        this.db.executeSql("CREATE TABLE IF NOT EXISTS address (id INTEGER PRIMARY KEY, locationName TEXT, address TEXT, zip TEXT, apartment TEXT, firstName TEXT, lastName TEXT, phone INTEGER, email TEXT, lat VARCHAR, long VARCHAR, created_at DATETIME DEFAULT NULL)", {}).then(() => {
            console.log("address table created/already exists");
            this.getAddressList();
        }, err => {
            console.log("Table couldn't be created or opened :(");
            this.handleDBError(err);
        });
    }

    public getAddressList(): void {
        this.db.executeSql("SELECT id, locationName, address, zip, apartment, firstName, lastName, phone, email, created_at FROM address ORDER BY created_at DESC", {}).then(resultSet => {
            for (let i = 0; i < resultSet.rows.length; i++) {
                this.newAddress.push(resultSet.rows.item(i));
            }
            console.log(this.newAddress);
            this.loader = false;
        }, err => {
            this.handleDBError(err);
        });
    }

    public onAddressClick(address: Address): void {
        this.navCtrl.push(AddressPage, {
            address: address,
            id: address.id
        });
    }

    public handleDBError(err: any): void {
        console.log(err);
        this.display.showToast("Error occured");
        this.navCtrl.pop();
    }

    public reset(): void {
        this.newAddress = this.newAddress.slice();
    }

    public longPressDelete(address: Address): void {
        this.display.showConfirm("", "Are you sure you want to delete this Address ?", () => this.deleteAddress(address));
    }

    public deleteAddress(address: Address): void {
        this.db.executeSql("DELETE FROM address WHERE id=?", [address.id]).then(() => {
            this.display.showToast("Address deleted.");
            let index = this.newAddress.indexOf(address);
            if (index > -1) {
                this.newAddress.splice(index, 1);
                this.reset();
            }

        }, err => {
            this.handleDBError(err);
        });
    }
}
