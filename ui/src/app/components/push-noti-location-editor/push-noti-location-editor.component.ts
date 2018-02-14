import {Component, ViewEncapsulation, Input, Output, EventEmitter} from '@angular/core';
import {TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {Dropdown} from 'primeng/primeng';
import {GoogleMapsLoader} from '../location-editor/google-maps-loader';

@Component({
    selector: 'push-noti-location-editor',
    directives: [TOOLTIP_DIRECTIVES, Dropdown],
    encapsulation: ViewEncapsulation.None,
    template: require('./push-noti-location-editor.component.html'),
})

export class PushNotiLocationEditor {

    @Input() public lat: any;
    @Input() public long: any;
    @Input() public span: any;
    @Input() public typeSelected: any;
    @Output() areaChanged = new EventEmitter<any>();
    @Output() spanTypeChanged = new EventEmitter<any>();
    private map: any;
    private circle: any;
    private mapElement: HTMLElement;
    private addressInput: HTMLElement;
    private infoWindow: any;
    private marker: any;
    private gMap: any;
    private geocoder: any;
    private address: string = "";
    private type = [];

    constructor() {
        this.type.push(
            {label: 'Kilometer', value: 'Km'},
            {label: 'Miles', value: 'miles'}
        );
    }

    public ngOnInit(): void {
        this.mapElement = document.getElementById('push-noti-map');
        this.addressInput = document.getElementById('push-noti-address-input');
        this.initMap();
    }

    public initMap(): void {
        GoogleMapsLoader.load().then((gMap) => {
            this.gMap = gMap;
            let latitude: number = this.lat ? parseFloat(this.lat) : 26.846694;
            let longitude: number = this.long ? parseFloat(this.long) : 80.946166;
            let span: number = this.span ? this.span : 16;
            let options: any = {
                center: new gMap.LatLng(latitude, longitude),
                zoom: 10,
                mapTypeId: gMap.MapTypeId.ROADMAP
            };
            this.map = new gMap.Map(this.mapElement, options);
            this.circle = new gMap.Circle({
                strokeColor: '#7ceb72',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#7ceb72',
                fillOpacity: 0.35,
                map: this.map,
                radius: this.span * 1000,
                draggable: false,
                editable: true,
            });
            this.circle.setCenter({lat: this.lat, lng: this.long});
            let autocomplete = new gMap.places.Autocomplete(this.addressInput);
            autocomplete.bindTo('bounds', this.map);

            this.infoWindow = new gMap.InfoWindow();
            this.marker = new gMap.Marker({
                map: this.map,
                anchorPoint: new gMap.Point(0, -29),
                draggable: true,
                position: {lat: this.lat, long: this.long}
            });
            this.geocoder = new gMap.Geocoder();

            // First area change
            this.areaChanged.emit({
                lat: this.lat,
                long: this.long,
                span: this.span,
                spanType: this.typeSelected
            });

            this.marker.addListener('drag', (event) => {
                this.lat = this.marker.getPosition().lat();
                this.long = this.marker.getPosition().lng();
                this.circle.setCenter({lat: this.lat, lng: this.long});
                this.reverseGeocode();
            });

            // this.circle.addListener('drag', () => {
            //     console.log("Circle drag");
            //     this.lat = this.circle.getCenter().lat();
            //     this.long = this.circle.getCenter().lng();
            //     this.marker.setPosition({lat: this.lat, lng: this.long});
            // });

            this.marker.addListener('dragend', () => {
                console.log("Marker drag end");
                this.areaChanged.emit({
                    lat: this.lat,
                    long: this.long,
                    span: this.span,
                    spanType: this.typeSelected
                });
            });

            // this.circle.addListener('dragend', () => {
            //     console.log("Circle drag end");
            //     this.areaChanged.emit("Address changed");
            // });

            this.circle.addListener('radius_changed', () => {
                console.log("Radius changed");
                this.circle.radius = this.circle.getRadius();
                let rd = this.circle.getRadius();
                this.span = this.typeSelected === "Km" ? rd / 1000 : rd / 1609.34;
                this.areaChanged.emit({
                    lat: this.lat,
                    long: this.long,
                    span: this.span,
                    spanType: this.typeSelected
                });
            });

            if (this.lat && this.long) {
                this.reverseGeocode();
            }

            autocomplete.addListener('place_changed', () => {
                console.log("Place changed");
                this.infoWindow.close();
                this.marker.setVisible(false);
                let place = autocomplete.getPlace();
                this.setGeocodeOfAddress(place).then((result) => {
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

                    this.lat = place.geometry.location.lat();
                    this.long = place.geometry.location.lng();

                    this.setMarker(place);
                    this.circle.setCenter({lat: this.lat, lng: this.long});
                    this.areaChanged.emit({
                        lat: this.lat,
                        long: this.long,
                        span: this.span,
                        spanType: this.typeSelected
                    });
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
        this.geocoder.geocode({'location': latLong}, (results, status) => {
            if (status === 'OK') {
                if (results[0]) {
                    this.setMarker(results[0]);
                    this.address = results[0].formatted_address;
                }
            }
        });
    }

    public onType(event: any): void {
        if (event.value == 'Km') {
            this.span = (this.span) * 1.60934;
        } else {
            this.span = (this.span) * 0.621371;
        }
        this.spanTypeChanged.emit({span: this.span, spanType: this.typeSelected});
    }

    public setGeocodeOfAddress(place): Promise<any> {
        return new Promise((resolve, reject) => {
            if (place.geometry) {
                resolve(place);
            } else {
                this.geocoder.geocode({'address': place.name}, (results, status) => {
                    if (status === 'OK') {
                        if (results[0]) {
                            resolve(results[0]);
                        }
                    }
                });
            }
        });
    }

}