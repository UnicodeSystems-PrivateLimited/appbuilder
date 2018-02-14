/**
 * Location Editor Component
 * 
 * @author  Akash
 */
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dropdown } from 'primeng/primeng';
import { GoogleMapsLoader } from './google-maps-loader';

@Component({
    selector: 'location-editor',
    directives: [TOOLTIP_DIRECTIVES, Dropdown],
    encapsulation: ViewEncapsulation.None,
    template: require('./location-editor.component.html'),
    styles: [require('./location-editor.scss')],
})

export class LocationEditor {

    @Input() public lat: any;
    @Input() public long: any;
    @Output() latLongChange = new EventEmitter<any>();
    @Output() addressChange = new EventEmitter<string>();
    private map: any;
    private mapElement: HTMLElement;
    private addressInput: HTMLElement;
    private infoWindow: any;
    private marker: any;
    private gMap: any;
    private geocoder: any;
    private address: string = "";

    constructor() {
    }

    public ngOnInit(): void {
        this.mapElement = document.getElementById('map');
        this.addressInput = document.getElementById('address-input');
        this.initMap();
    }

    public initMap(): void {
        GoogleMapsLoader.load().then((gMap) => {
            this.gMap = gMap;
            let latitude: number = this.lat ? this.lat : 26.846694;
            let longitude: number = this.long ? this.long : 80.946166;
            let options: any = {
                center: new gMap.LatLng(latitude, longitude),
                zoom: 15,
                mapTypeId: gMap.MapTypeId.ROADMAP
            };
            this.map = new gMap.Map(this.mapElement, options);

            let autocomplete = new gMap.places.Autocomplete(this.addressInput);
            autocomplete.bindTo('bounds', this.map);

            this.infoWindow = new gMap.InfoWindow();
            this.marker = new gMap.Marker({
                map: this.map,
                anchorPoint: new gMap.Point(0, -29)
            });
            this.geocoder = new gMap.Geocoder();

            if (this.lat && this.long) {
                this.reverseGeocode();
            }
            autocomplete.addListener('place_changed', () => {
                this.infoWindow.close();
                this.marker.setVisible(false);
                let place = autocomplete.getPlace();
                this.setGeocodeOfAddress(place.name).then((result) => {
                    if (result) {
                        place = result;
                    }
                    if (!place.geometry) {
                        return;
                    }
                    if (place.geometry.viewport) {
                        this.map.fitBounds(place.geometry.viewport);
                    } else {
                        this.map.setCenter(place.geometry.location);
                    }

                    this.latLongChange.emit({
                        lat: place.geometry.location.lat(),
                        long: place.geometry.location.lng()
                    });

                    this.addressChange.emit(place.formatted_address);

                    this.setMarker(place);
                    this.setInfoWindow(place);
                });

            });
        });
    }

    public setMarker(place): void {
        this.marker.setPosition(place.geometry.location);
        this.marker.setVisible(true);
    }

    public setInfoWindow(place): void {
        let address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

        this.infoWindow.setContent(address);
        this.infoWindow.open(this.map, this.marker);
    }

    public reverseGeocode(): void {
        let latLong = {
            lat: parseFloat(this.lat),
            lng: parseFloat(this.long)
        };
        this.geocoder.geocode({ 'location': latLong }, (results, status) => {
            if (status === 'OK') {
                if (results[0]) {
                    this.setMarker(results[0]);
                    this.setInfoWindow(results[0]);
                    this.address = results[0].formatted_address;
                }
            }
        });
    }
    public setGeocodeOfAddress(address: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.geocoder.geocode({ 'address': address }, (results, status) => {
                if (status === 'OK') {
                    if (results[0]) {
                        resolve(results[0]);
                    }
                }
            });
        });
    }
    // disble enter keyCode
    // public changeEvent(e: any) {
    //     if (e.which == 13 || e.keyCode == 13)
    //         e.preventDefault();
    // }

}