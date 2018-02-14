import { Component, OnInit, NgZone, ViewChild, ElementRef, Inject, forwardRef } from '@angular/core';
import { NavController, ViewController, NavParams } from 'ionic-angular';
import { Geoposition } from 'ionic-native';
import { AddressSelector as LocationSelector } from '../../interfaces/index';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { DisplayService } from '../../providers/display-service/display-service';
import { GlobalService } from '../../providers/global-service';
import { FoodOrderingService } from '../../providers/food-ordering-service';


declare var google: any;
@Component({
    selector: 'components-address-selector',
    templateUrl: 'address-selector.html'
})
export class AddressSelector implements OnInit {

    map: any;
    geocoder: any;
    marker: Array<any> = [];
    public tabId: number = null;
    location: LocationSelector;
    public address: string = null;
    public shouldShowCancel: boolean = true;
    public selectedLocation: any = null;
    @ViewChild('footer') footer: ElementRef;


    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public display: DisplayService,
        @Inject(forwardRef(() => FoodOrderingService)) public foodOrderingService: FoodOrderingService,
        public zone: NgZone,
        public sanitizer: DomSanitizer,
        public globalService: GlobalService,
        public nav: NavParams
    ) {
        this.tabId = nav.get('tabId');
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.loadMap();
        });
    }

    loadMap(): void {
        let mapOptions = {
            center: { lat: 0, lng: 0 },
            zoom: 1,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: false
        }
        this.map = new google.maps.Map(document.querySelector('components-address-selector #address-selector-map'), mapOptions);
        this.foodOrderingService.getCurrentPosition().then(position => this.setCurrentPositionMarker(position));
    }

    dismiss() {
        this.viewCtrl.dismiss({ 'data': null });
    }

    public getMapHeight(): SafeStyle {
        let footerHeight = 0;
        if (this.footer && this.footer.nativeElement) {
            footerHeight = this.footer.nativeElement.scrollHeight;
        }
        return this.sanitizer.bypassSecurityTrustStyle('calc(100% - ' + footerHeight + 'px)');
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

    public searchAddress(event: any) {
        console.log("this.address", this.address);
        this.geocoder = new google.maps.Geocoder();
        this.display.showLoader();
        this.geocoder.geocode({ 'address': this.address }, (results, status) => {
            console.log("status", status);
            if (status === 'OK') {
                this.setMarker(results);
                console.log("ressult", results);
            }
            this.address = null;
            this.display.hideLoader();
        });
    }

    public setMarker(location: Array<any>) {
        if (this.marker.length) {
            for (let i = 0; i < this.marker.length; i++) {
                this.marker[i].setMap(null);
            }
            this.marker = [];
        }
        let infoWindow = new google.maps.InfoWindow();
        let bounds = new google.maps.LatLngBounds();
        for (let i = 0; i < location.length; i++) {
            let latLng = new google.maps.LatLng(location[i].geometry.location.lat(), location[i].geometry.location.lng());

            let marker = new google.maps.Marker({
                position: latLng,
                map: this.map
            });
            if (location.length != 1)
                bounds.extend(latLng);
            else
                this.map.setCenter(latLng);
            this.marker.push(marker);
            let infoWindowContent = '<h6>' + location[i].formatted_address + '</h6>';
            marker.addListener('click', () => {
                infoWindow.setContent(infoWindowContent);
                infoWindow.open(this.map, marker);
                this.zone.run(() => {
                    this.selectedLocation = location[i];
                });
            });
        }
        if (location.length != 1)
            this.map.fitBounds(bounds);
        else
            this.map.setZoom(15);
    }

    public onSelectLocationClick(): void {
        if (!this.selectedLocation) {
            this.display.showAlert('Please select a location.');
            return;
        }
        this.viewCtrl.dismiss({ 'data': { 'address': this.selectedLocation.formatted_address, 'lat': this.selectedLocation.geometry.location.lat(), 'long': this.selectedLocation.geometry.location.lng() } });
    }


}
