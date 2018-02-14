import { Component } from '@angular/core';
import { NavController, Platform, NavParams, Alert } from 'ionic-angular';
import { DisplayService, GpsCouponService } from '../../providers';
import { EmailFormsTabItem } from "../../interfaces/common-interfaces";
import { GlobalService } from '../../providers';
import { GpsCouponDesc } from "../gps-coupon-desc/gps-coupon-desc";
import {
    GoogleMap,
    GoogleMapsEvent,
    GoogleMapsLatLng,
    GoogleMapsMarkerOptions,
    Diagnostic,
    Geolocation,
    Geoposition,
    SQLite
} from 'ionic-native';

const checkIn: number = 1;
const redeem: number = 2;
/*
  Generated class for the GpsCouponTab page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-gps-coupon-tab',
    templateUrl: 'gps-coupon-tab.html'
})
export class GpsCouponTab {

    public tabId: number;
    public cm_lat: number;
    public cm_long: number;
    public title: string;
    public bgImage: string;
    public db: SQLite;
    public loader: boolean = false;
    public searchIcon: boolean = true;
    public state: boolean = false;
    public searchItem: string;
    public gpsLists = [];
    private successAuthStatuses: Array<string> = ["GRANTED", "authorized", "authorized_when_in_use"];
    public tryGettingLocation: boolean = false;
    public isAlertShown: boolean = false;
    public currentPosition: Geoposition = null;
    public gpsEnabled: boolean = false;
    public contactList: any[] = [];
    public locationDistance: any[] = [];
    public redeemedCoupanList = [];
    public checkInCount = [];
    public tempCheckInCount = [];
    public lastCheckInTime = [];
    public timeToNextCheckIn: number[] = [];
    public timeToNextCheckInHourMin: string[] = [];
    public firstEntered: boolean = true;
    public tab_nav_type: string = null;
    public subTabId: number = null;


    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public service: GpsCouponService,
        public display: DisplayService,
        public platform: Platform,
        public globalService: GlobalService) {
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        platform.ready().then(() => {
            this.openDB();
            platform.resume.subscribe(() => this.onAppResume());
        });
    }

    public ionViewWillEnter() {
        if (!this.firstEntered) {
            this.createTable();
        }
        this.firstEntered = false;
    }

    public ionViewDidEnter(): void {
        this.checkLocationDiagnostics();
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
        this.db.executeSql("CREATE TABLE IF NOT EXISTS gpsCodeActivity (id INTEGER PRIMARY KEY, target INTEGER,item_id INTEGER, type INTEGER, created_at DATETIME DEFAULT NULL)", {}).then(() => {
            console.log("gpsCodeActivity table created/already exists");
            //Get No. of coupans redeemed
            this.db.executeSql('SELECT id, item_id, type, created_at FROM gpsCodeActivity WHERE type = ?', [redeem]).then(resultSet => {
                for (let i = 0; i < resultSet.rows.length; i++) {
                    this.redeemedCoupanList.push(resultSet.rows.item(i).item_id);
                }
                this.getCheckedInCoupanCount().then(res => {
                    console.log(this.lastCheckInTime);
                    //Get Coupan list
                    this.getInitData();
                }).catch(err => {
                    console.log(err);
                });

            }, err => {
                this.handleDBError(err);
            });
        }, err => {
            console.log("Table couldn't be created or opened :(");
            this.handleDBError(err);
        });
    }

    public handleDBError(err: any): void {
        console.log(err);
        this.display.showToast("Error occured");
        this.navCtrl.pop();
    }

    public getInitData(): void {
        this.loader = true;
        this.service.getItemList(this.tabId).subscribe(res => {
            if (res.success) {
                this.loader = false;
                this.gpsLists = res.data.itemData;
                this.contactList = res.data.contactList;
                for (let i = 0; i < this.gpsLists.length; i++) {
                    if (this.tempCheckInCount[this.gpsLists[i].id]) {
                        this.checkInCount[this.gpsLists[i].id] = this.tempCheckInCount[this.gpsLists[i].id];
                    } else {
                        this.checkInCount[this.gpsLists[i].id] = 0;
                    }

                    if (this.lastCheckInTime[this.gpsLists[i].id]) {
                        this.getTimeLeftToNextCheckIn(this.lastCheckInTime[this.gpsLists[i].id], this.gpsLists[i].hours_before_checkin, this.gpsLists[i].id);
                    } else {
                        this.getTimeLeftToNextCheckIn(false, this.gpsLists[i].hours_before_checkin, this.gpsLists[i].id);
                    }
                }
            } else {
                this.display.showToast("Could not fetch data");
            }
        });
    }

    public getDistanceFromLocation(locations, currentLat, currentLong): void {
        locations.forEach((data) => {
            let coupanId = data.id;
            let locationLat = data.m_lat;
            let locationLong = data.m_long;
            let locationId = data.location_id;
            if (locationLat != null && locationLong != null && locationId != 0) {
                let radlat1 = Math.PI * currentLat / 180
                let radlat2 = Math.PI * locationLat / 180
                let theta = currentLong - locationLong
                let radtheta = Math.PI * theta / 180
                let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                dist = Math.acos(dist);
                dist = dist * 180 / Math.PI;
                dist = dist * 60 * 1.1515;
                dist = dist * 1.609344;
                dist = Math.round(dist * 100) / 100;
                this.locationDistance[coupanId] = dist;
            } else {
                this.locationDistance[coupanId] = -1;
            }

        });
        console.log('current location distance from all location ---- ', this.locationDistance);
    }

    public getCheckedInCoupanCount(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db.executeSql('SELECT MAX(id) AS id, item_id, type, created_at, count(*) AS scanCount FROM gpsCodeActivity WHERE type = ? GROUP BY item_id', [checkIn]).then(resultList => {
                for (let i = 0; i < resultList.rows.length; i++) {
                    this.tempCheckInCount[resultList.rows.item(i).item_id] = resultList.rows.item(i).scanCount;
                    this.lastCheckInTime[resultList.rows.item(i).item_id] = resultList.rows.item(i).created_at;
                }
                resolve(true);
            }, err => {
                this.handleDBError(err);
                reject();
            });
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


    public checkLocationDiagnostics(): Promise<any> {
        let okClicked: boolean = false;
        return new Promise((resolve, reject) => {
            if (this.platform.is("android") || !this.globalService.locationAuthorization) {
                // Run location auth request everytime for android and just once for iOS.
                Diagnostic.requestLocationAuthorization().then((authorization: string) => {
                    console.log(authorization);
                    this.globalService.locationAuthorization = authorization;
                    this.handleLocationEnabling(resolve, reject);
                    this.getCurrentPosition();
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
                let alert: Alert = this.display.showAlert("Please enable location services", "", () => {
                    this.isAlertShown = false;
                    Diagnostic.switchToLocationSettings();
                    okClicked = true;
                    resolve();
                }, false);
                alert.onDidDismiss(() => {
                    if (okClicked) {
                        return;
                    }
                    this.isAlertShown = false;
                    this.display.showToast("Could not access your current location. Please enable location services.", "", false, "bottom", 5000);
                    reject();
                });
            }
        }).catch(err => { console.log("Location Auth requesting failed.", err); reject(err); });
    }


    private onAppResume(): void {
        if (this.platform.is("ios") && this.tryGettingLocation) {
            this.tryGettingLocation = false;
        }
    }

    public getCurrentPosition(): Promise<any> {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition().then((position: Geoposition) => {
                console.log(position);
                this.currentPosition = position;
                console.log('this.currentPosition');
                console.log(this.currentPosition.coords.latitude);
                console.log(this.currentPosition.coords.longitude);
                this.cm_lat = this.currentPosition.coords.latitude;
                this.cm_long = this.currentPosition.coords.longitude;
                this.gpsEnabled = true;
                this.getDistanceFromLocation(this.gpsLists, this.cm_lat, this.cm_long);
                resolve(position);
            }).catch((error) => {
                console.log("Error getting location", error);
                this.display.showToast("Could not access your current location. Please check if the device's location services are turned on.", "", false, "bottom", 5000);
                reject(error);
            });
        });

    }


    public onItemClick(id: number, m_lat: number, m_long: number, location_id: number, distance: number): void {
        // if ((m_lat != this.cm_lat || m_long != this.cm_long) && location_id != 0) {
        //     let alert: Alert = this.display.showAlert("You need to get closer to the location marked");
        // } else {
        this.navCtrl.push(GpsCouponDesc, {
            itemId: id,
            bgImage: this.bgImage,
            tabId: this.tabId,
            distance: distance,
            clLat: this.cm_lat,
            clLong: this.cm_long
        });
        // }
    }

    public getTimeLeftToNextCheckIn(lastScannedAt, hoursBeforeCheckIn, coupanId): void {
        if (lastScannedAt) {
            let startTime = new Date();
            let endTime = new Date(lastScannedAt);
            endTime.setHours(endTime.getHours() + hoursBeforeCheckIn);
            this.timeToNextCheckIn[coupanId] = endTime.valueOf() - startTime.valueOf();

            let timeToNextScanInSeconds = this.timeToNextCheckIn[coupanId] / 1000;
            let timeToNextScanInMin = timeToNextScanInSeconds / 60;
            let minutes = Math.floor(timeToNextScanInMin % 60);
            let timeToNextScanInHour = Math.floor(timeToNextScanInMin / 60);
            this.timeToNextCheckInHourMin[coupanId] = timeToNextScanInHour > 0 ? (timeToNextScanInHour + ' hour(s) ' + (minutes > 0 ? minutes + ' minutes' : '')) : (minutes > 0 ? minutes + 'minutes' : '');
        } else {
            this.timeToNextCheckIn[coupanId] = 0;
        }
    }
}
