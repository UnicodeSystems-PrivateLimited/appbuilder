import { Component, ElementRef, Input, Output } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { DisplayService, GlobalService, FoodOrderingService } from '../../providers/index';
import { FoodOrderingLocation as FOLocation } from '../../interfaces/index';
import { Geoposition } from 'ionic-native';
import { EventEmitter } from '@angular/common/src/facade/async';

@Component({
    selector: 'locations-list',
    templateUrl: 'locations-list.html'
})
export class LocationsList {

    @Input() tabId: number;
    @Input() locationList: FOLocation[] = [];
    currentPosition: Geoposition;
    @Output() locationClick: EventEmitter<FOLocation> = new EventEmitter<FOLocation>();

    constructor(
        public navCtrl: NavController,
        public display: DisplayService,
        public navParams: NavParams,
        public globalService: GlobalService,
        public platform: Platform,
        public service: FoodOrderingService
    ) {
        this.service.getCurrentPosition().then(position => {
            this.currentPosition = position;
        });
    }

    onLocationClick(location: FOLocation): void {
        this.locationClick.emit(location);
    }

}
