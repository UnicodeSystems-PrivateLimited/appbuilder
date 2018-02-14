import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { DisplayService, GlobalService, FoodOrderingService } from '../../providers/index';
import { FoodOrderingLocation as FOLocation } from '../../interfaces/index';
import { Geoposition } from 'ionic-native';
import { FoodOrderingLocation } from '../food-ordering-location/food-ordering-location';

@Component({
    selector: 'page-food-ordering-location-list',
    templateUrl: 'food-ordering-location-list.html'
})
export class FoodOrderingLocationList {

    tabId: number;
    loader: boolean = true;
    locationList: FOLocation[] = [];
    currentPosition: Geoposition;
    viewType: string = 'list';

    constructor(
        public navCtrl: NavController,
        public display: DisplayService,
        public navParams: NavParams,
        public globalService: GlobalService,
        public platform: Platform,
        public service: FoodOrderingService
    ) {
        this.tabId = navParams.get('tabId');
        this.locationList = navParams.get('locationList');
        this.service.getCurrentPosition().then(position => {
            this.currentPosition = position;
        });
    }

    ionViewDidLoad(): void {
        this.display.hideLoader();
    }

    onMapOrListClick(): void {
        this.viewType = this.viewType === 'map' ? 'list' : 'map';
    }

    openLocationPage(location: FOLocation): void {
        if (location.is_open || this.service.services.delivery_days || this.service.services.take_out_days) {
            this.navCtrl.push(FoodOrderingLocation, {
                tabId: this.tabId,
                location: location
            });
        } else {
            this.display.showAlert('No available service(s) at this time.');
        }
    }

}
