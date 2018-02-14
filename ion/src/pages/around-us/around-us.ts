import { Component } from '@angular/core';
import { NavController, Platform, NavParams, Alert } from 'ionic-angular';
import { AroundUsService, DisplayService } from '../../providers';
import { AroundUsItemData } from "../../interfaces/common-interfaces";
import { GlobalService } from '../../providers';
import { AroundUsItem } from "../around-us-item/around-us-item";
import {
    GoogleMap,
    GoogleMapsEvent,
    GoogleMapsLatLng,
    GoogleMapsMarkerOptions,
    Diagnostic,
    Geolocation,
    Geoposition
} from 'ionic-native';

const DISC_MARKER_URL: string = "./assets/icon/oval.png";

@Component({
    selector: 'page-around-us',
    templateUrl: 'around-us.html'
})
export class AroundUs {

    public title: string;
    public bgImage: string;
    public map: GoogleMap;
    public tabId: number;
    public searching: string;
    public loader: boolean = false;
    public aroundUsLocation: AroundUsItemData[] = [];
    public categories: any;
    public categoryStatus: any;
    public markerList: any;
    public tabs: string = 'map'; // Default open tab.
    public catTabs: string; // Default open tab.
    public categoryName: string[] = [];
    private MAP_TYPE_NORMAL: string = 'MAP_TYPE_NORMAL';
    public firstEntrance: boolean = true;
    public isAlertShown: boolean = false;
    public currentPosition: Geoposition = null;
    public searchIcon: boolean = true;
    public state: boolean = false;
    public tryGettingLocation: boolean = false;
    public tab_nav_type: string = null;
    public subTabId: number = null;

    private successAuthStatuses: Array<string> = ["GRANTED", "authorized", "authorized_when_in_use"];

    constructor(
        public navCtrl: NavController,
        public platform: Platform,
        public navParams: NavParams,
        public service: AroundUsService,
        public display: DisplayService,
        public globalService: GlobalService,

    ) {
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.markerList = [];

        platform.ready().then(() => {
            platform.resume.subscribe(() => this.onAppResume());
        });
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.getAroundUsData();
    }

    public ionViewDidEnter(): void {
        if (!this.firstEntrance) {
            this.loadMap(this.aroundUsLocation, true);

            // Add the current position marker again when we return to the cached page.
            if (this.currentPosition) {
                this.addDiscMarker(this.currentPosition);
            }
        }
    }

    public ionViewWillLeave(): void {
        this.firstEntrance = false;
    }

    public getAroundUsData(): void {
        this.loader = true;
        this.service.getAroundUsData(this.tabId).subscribe(res => {
            this.loader = false;
            if (res.success) {
                this.aroundUsLocation = res.data.itemData;
                this.categories = res.data.categoryData;
                this.categoryStatus = [];
                for (var i = 0; i < this.categories.length; i++) {
                    this.categoryStatus[this.categories[i].id] = true;
                    this.markerList[this.categories[i].id] = [];
                }
                this.loadMap(this.aroundUsLocation);
            } else {
                this.display.showToast('Server error occured');
            }
        });
    }

    public loadMap(aroundData: any, calledFromViewDidEnter: boolean = false): void {
        this.map = new GoogleMap('map');
        let latLongs: GoogleMapsLatLng[] = [];
        this.map.clear();
        this.map.setMapTypeId(this.MAP_TYPE_NORMAL);
        aroundData.forEach((data) => {
            let latLong: GoogleMapsLatLng = new GoogleMapsLatLng(data.m_lat, data.m_long);
            latLongs.push(latLong);

            let markerOptions: GoogleMapsMarkerOptions = {
                position: latLong,
                icon: data.color,
                title: data.name,
            };

            this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
                this.map.addMarker(markerOptions).then(marker => {
                    this.markerList[data.around_us_id].push(marker);
                });
            }, err => {
                console.log(err);
            });
        });

        this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
            this.map.moveCamera({ target: latLongs });
            if (this.isAlertShown) {
                this.setMapClickable(false);
            }
            if (this.firstEntrance) {
                this.checkLocationDiagnostics().then(() => {
                    this.pinCurrentPosition();
                }).catch(err => { });
            }
        }, err => {
            console.log(err);
        });

        if (calledFromViewDidEnter) {
            this.map.moveCamera({ target: latLongs });
        }

    }

    public onCategoryClick(catId: number): void {
        this.categoryStatus[catId] = !this.categoryStatus[catId];
        let selectedMarkers = this.markerList[catId];
        selectedMarkers.forEach((data) => {
            if (data.isVisible()) {
                data.setVisible(false);
            } else {
                data.setVisible(true);
            }
        });
    }

    public onItemClick(id: number, name: string): void {

        this.navCtrl.push(AroundUsItem, {
            itemId: id,
            title: name,
            bgImage: this.bgImage,
            tabId: this.tabId
        });
    }


    public checkLocationDiagnostics(): Promise<any> {
        let okClicked: boolean = false;
        return new Promise((resolve, reject) => {
            if (this.platform.is("android") || !this.globalService.locationAuthorization) {
                // Run location auth request everytime for android and just once for iOS.
                Diagnostic.requestLocationAuthorization().then((authorization: string) => {
                    console.log(authorization);
                    this.globalService.locationAuthorization = authorization;
                    this.handleLocationEnabling(resolve, reject);
                }).catch(err => {
                    console.log("Location authorization failed.");
                    reject(err);
                });
            } else {
                // iOS only
                this.handleLocationEnabling(resolve, reject);
            }
        });
    }

    private handleLocationEnabling(resolve, reject): void {
        if (this.successAuthStatuses.indexOf(this.globalService.locationAuthorization) === -1) {
            console.log("Location authorization denied.");

            // Set this variable true so that the app tries to get location when it resumes
            // after opening location settings. Only for iOS.
            this.tryGettingLocation = true;

            reject();
            return;
        }
        let okClicked: boolean = false;
        Diagnostic.isLocationEnabled().then(res => {
            if (res) {
                resolve();
            } else {
                this.isAlertShown = true;
                this.setMapClickable(false);
                let alert: Alert = this.display.showAlert("Please enable location services", "", () => {
                    this.isAlertShown = false;
                    Diagnostic.switchToLocationSettings();
                    this.setMapClickable(true);
                    okClicked = true;
                    resolve();
                }, false);
                alert.onDidDismiss(() => {
                    if (okClicked) {
                        return;
                    }
                    this.isAlertShown = false;
                    this.setMapClickable(true);
                    this.display.showToast("Could not access your current location. Please enable location services.", "", false, "bottom", 5000);
                    reject();
                });
            }
        }).catch(err => { console.log("Location Auth requesting failed.", err); reject(err); });
    }

    public getCurrentPosition(): Promise<any> {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition().then((position: Geoposition) => {
                console.log(position);
                this.currentPosition = position;
                resolve(position);
            }).catch((error) => {
                console.log("Error getting location", error);
                this.display.showToast("Could not access your current location. Please check if the device's location services are turned on.", "", false, "bottom", 5000);
                reject(error);
            });
        });

    }

    public setMapClickable(isClickable: boolean = true): void {
        if (this.map) {
            this.map.setClickable(isClickable);
        }
    }

    public pinCurrentPosition(): void {
        this.getCurrentPosition().then((position: Geoposition) => {
            this.addDiscMarker(position);
        }).catch(() => { });
    }

    public addDiscMarker(position: Geoposition): void {
        this.map.addMarker({
            icon: { url: DISC_MARKER_URL },
            position: new GoogleMapsLatLng(position.coords.latitude, position.coords.longitude)
        }).then(() => { }, err => {
            console.log("Error while adding current location marker", err);
        });
    }

    public search(): void {
        this.state = true;
        this.searchIcon = false;
    }

    public onCancel(): void {
        this.state = false;
        this.searchIcon = true;
    }

    private onAppResume(): void {
        if (this.platform.is("ios") && this.tryGettingLocation) {
            this.pinCurrentPosition();
            this.tryGettingLocation = false;
        }
    }

}
