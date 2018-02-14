import { Component, ElementRef, Input, OnInit, NgZone, ViewChild, EventEmitter, Output } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { DisplayService, GlobalService, FoodOrderingService } from '../../providers/index';
import { FoodOrderingLocation as FOLocation } from '../../interfaces/index';
import { Geoposition } from 'ionic-native';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser/src/security/dom_sanitization_service';

declare var google: any;

@Component({
    selector: 'locations-map',
    templateUrl: 'locations-map.html'
})
export class LocationsMap implements OnInit {

    @Input() tabId: number;
    @Input() locationList: FOLocation[];
    currentPosition: Geoposition;
    map: any;
    marker: any;
    selectedLocation: FOLocation;
    mapHeight: SafeStyle;
    @Output() locationSelect: EventEmitter<FOLocation> = new EventEmitter<FOLocation>();

    @ViewChild('footer') footer: ElementRef;

    constructor(
        public navCtrl: NavController,
        public display: DisplayService,
        public navParams: NavParams,
        public globalService: GlobalService,
        public service: FoodOrderingService,
        public zone: NgZone,
        public sanitizer: DomSanitizer
    ) {
        this.service.getCurrentPosition().then(position => {
            this.currentPosition = position;
        });
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.loadMap();
        });
    }

    loadMap(): void {
        let mapOptions = {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: false
        }
        this.map = new google.maps.Map(document.querySelector('locations-map #map'), mapOptions);
        this.service.getCurrentPosition().then(position => this.setCurrentPositionMarker(position));
        let infoWindow = new google.maps.InfoWindow();
        let bounds = new google.maps.LatLngBounds();
        for (let i = 0; i < this.locationList.length; i++) {
            let latLng = new google.maps.LatLng(this.locationList[i].latitude, this.locationList[i].longitude);
            bounds.extend(latLng);
            let marker = new google.maps.Marker({
                position: latLng,
                map: this.map
            });
            let infoWindowContent = '<h6>' + this.locationList[i].address_section_1 + '</h6>'
                + '<h8>' + (this.locationList[i].is_open ? 'OPEN' : 'CLOSED') + ' NOW</h8>';
            marker.addListener('click', () => {
                infoWindow.setContent(infoWindowContent);
                infoWindow.open(this.map, marker);
                this.zone.run(() => {
                    this.selectedLocation = this.locationList[i];
                });
            });
        }
        this.map.fitBounds(bounds);
    }

    getMapHeight(): SafeStyle {
        let footerHeight = 0;
        if (this.footer && this.footer.nativeElement) {
            footerHeight = this.footer.nativeElement.scrollHeight;
        }
        return this.sanitizer.bypassSecurityTrustStyle('calc(100% - ' + footerHeight + 'px)');
    }

    onSelectLocationClick(): void {
        if (!this.selectedLocation) {
            this.display.showAlert('Please select a location.');
            return;
        }
        this.locationSelect.emit(this.selectedLocation);
    }

    onNavigateClick(): void {
        let latLng: string = this.selectedLocation.latitude + ',' + this.selectedLocation.longitude;
        window.open('http://maps.google.com/?saddr=My+Location&daddr=' + latLng, '_system');
    }

    private setCurrentPositionMarker(position: Geoposition): void {
        if (!position) return;
        let currentPositionMarker = new google.maps.Marker({
            position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
            map: this.map,
            icon: {
                url: './assets/icon/oval.png',
                anchor: new google.maps.Point(10, 10),
                size: new google.maps.Size(20, 20),
                scaledSize: new google.maps.Size(20, 20)
            }
        });
    }

}
