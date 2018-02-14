import { Component } from '@angular/core';
import { NavController, NavParams, Platform, Alert } from 'ionic-angular';
import { DisplayService, GlobalService, DataService, FindWhereIParkedService } from '../../providers';
import {
    GoogleMap,
    GoogleMapsEvent,
    MyLocation,
    Geolocation,
    Geoposition,
    GoogleMapsCircleOptions,
    GoogleMapsLatLng,
    GoogleMapsMarkerOptions,
    Diagnostic,
    GoogleMapsMarker,
    GoogleMapsCircle,
    LaunchNavigator,
    SocialSharing,
    Camera,
    ImagePicker
} from 'ionic-native';

@Component({
    selector: 'page-find-where-i-parked',
    templateUrl: 'find-where-i-parked.html'
})
export class FindWhereIParked {

    public title: string;
    public tabId: number;
    public bgImage: number;
    public map: GoogleMap;
    public hybridView: boolean = false;
    public isCirclePresent: boolean = false;
    public isPinMarkerPresent: boolean = false;
    public isDiscMarkerPresent: boolean = false;
    public isAlertShown: boolean = false;
    public discMarker: GoogleMapsMarker;
    public pinMarker: GoogleMapsMarker;
    public circle: GoogleMapsCircle;
    public tryGettingLocation: boolean = false;
    public tryLocating: boolean = false;
    public tab_nav_type: string = null;
    public subTabId: number = null;

    private successAuthStatuses: Array<string> = ["GRANTED", "authorized", "authorized_when_in_use"];
    private MAP_TYPE_HYBRID: string = "MAP_TYPE_HYBRID";
    private MAP_TYPE_NORMAL: string = "MAP_TYPE_NORMAL";

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public display: DisplayService,
        public globalService: GlobalService,
        public dataService: DataService,
        public platform: Platform,
        public service: FindWhereIParkedService
    ) {
        this.tabId = navParams.get("tabId");
        this.title = navParams.get("title");
        this.bgImage = navParams.get("bgImage");
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
    }

    public ionViewDidEnter(): void {
        this.platform.ready().then(() => {
            this.loadMap();
            this.platform.resume.subscribe(() => this.onAppResume());
        });
    }

    public loadMap(): void {
        this.map = new GoogleMap('map');
        this.map.clear();
        this.map.setMapTypeId(this.MAP_TYPE_NORMAL);
        this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
            if (this.isAlertShown) {
                this.setMapClickable(false);
            }
            this.map.setOptions({
                controls: {
                    zoom: true,
                }
            });
            this.checkLocationDiagnostics().then(() => {
                if (this.service.currentPosition) {
                    this.onLocating();
                } else {
                    this.onLocateClick();
                }
            }).catch(err => { });
        }, err => {
            console.log(err);
            this.display.showToast("Error occured while loading map.");
        });
    }

    public onPinClick(): void {
        if (!this.service.currentPosition || this.service.showPinRow) {
            return;
        }
        this.service.showPinRow = true;
        this.service.pinnedLocation = this.service.currentPosition;
        this.service.startPinnedTime();
        this.moveCameraToCurrent();
        this.addPinMarker();
    }

    public onHybridViewChange(): void {
        this.map.setMapTypeId(this.hybridView ? this.MAP_TYPE_HYBRID : this.MAP_TYPE_NORMAL);
    }

    public getCurrentPosition(): Promise<any> {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition().then((position: Geoposition) => {
                this.service.currentPosition = position;
                console.log(this.service.currentPosition);
                resolve(position);
            }).catch((error) => {
                console.log("Error getting location", error);
                this.display.showToast("Could not access location. Please check if the device's location services are turned on.");
                reject(error);
            });
        });

    }

    public makeCircle(lat: number, long: number, radius: number): void {
        if (!this.isCirclePresent) {
            console.log('makeCircle reached ---');
            let options: GoogleMapsCircleOptions = {
                center: new GoogleMapsLatLng(lat, long),
                radius: radius,
                fillColor: "#387ef5",
                strokeWidth: 1,
                strokeColor: "#387ef5"
            };
            this.map.addCircle(options).then((circle: GoogleMapsCircle) => {
                this.circle = circle;
                this.isCirclePresent = true;
            }).catch(error => {
                console.log(error);
            });
        }
    }

    public addPinMarker(): void {
        if (!this.isPinMarkerPresent) {
            this.addMarker("./assets/icon/pin.png").then((marker: GoogleMapsMarker) => {
                this.isPinMarkerPresent = true;
                this.pinMarker = marker;
            }).catch(err => {
                console.log("Error while adding Pin marker");
            });
        }
    }

    public addDiscMarker(): void {
        if (!this.isDiscMarkerPresent) {
            console.log('addDiscMarker reached ---');
            this.addMarker("./assets/icon/oval.png").then((marker: GoogleMapsMarker) => {
                this.isDiscMarkerPresent = true;
                this.discMarker = marker;
            }).catch(err => {
                console.log("Error while adding Disc marker");
            });
        }
    }

    public addMarker(iconURL: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.map.addMarker({
                icon: { url: iconURL },
                position: new GoogleMapsLatLng(this.service.currentPosition.coords.latitude, this.service.currentPosition.coords.longitude)
            }).then((marker: GoogleMapsMarker) => {
                resolve(marker);
            }, err => {
                console.log(err);
                reject();
            });
        });
    }

    public onLocateClick(): void {
        if (!this.tryLocating) {
            this.tryLocating = true;
            this.getCurrentPosition().then(position => {
                console.log('onLocateClick reached ---');
                this.removeDiskNCircle().then(res => {
                    console.log('removeDiskNCircle reached ---');
                    console.log('this.isDiscMarkerPresent reached ---', this.isDiscMarkerPresent);
                    console.log('this.isDiscMarkerPresent reached ---', this.discMarker);
                    console.log('this.isCirclePresent reached ---', this.isCirclePresent);
                    console.log('this.isCirclePresent reached ---', this.circle);
                    this.onLocating();
                });
            }).catch(err => {
                console.log("Shit!");
            });
        }

    }

    public removeDiskNCircle(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.isDiscMarkerPresent) {
                this.discMarker.remove();
                this.discMarker = null;
                this.isDiscMarkerPresent = false;
            }
            if (this.isCirclePresent) {
                this.circle.remove();
                this.circle = null;
                this.isCirclePresent = false;
            }
            resolve(true);
        });
    }

    public moveCameraToCurrent(): void {
        this.map.moveCamera({
            target: new GoogleMapsLatLng(this.service.currentPosition.coords.latitude, this.service.currentPosition.coords.longitude),
            zoom: 16
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

    public setMapClickable(isClickable: boolean = true): void {
        if (this.map) {
            this.map.setClickable(isClickable);
        }
    }

    public onLocating(): void {
        this.addDiscMarker();
        this.makeCircle(this.service.currentPosition.coords.latitude, this.service.currentPosition.coords.longitude, 250);
        this.moveCameraToCurrent();
        this.tryLocating = false;
    }

    public onTrashClick(): void {
        if (this.isPinMarkerPresent) {
            this.pinMarker.remove();
            this.isPinMarkerPresent = false;
        }
        this.service.stopTimer();
        this.service.destroyCarFinderPin();
    }

    public onMapClick(): void {
        let defaultApp: any = LaunchNavigator.APP.GOOGLE_MAPS;
        if (this.platform.is("ios")) {
            defaultApp = LaunchNavigator.APP.APPLE_MAPS;
        }
        LaunchNavigator.isAppAvailable(defaultApp).then(isAvailable => {
            if (!isAvailable) {
                defaultApp = LaunchNavigator.APP.USER_SELECT;
            }
            LaunchNavigator.navigate([this.service.pinnedLocation.coords.latitude, this.service.pinnedLocation.coords.longitude], {
                app: defaultApp
            }).then(
                success => console.log("Launched navigator"),
                error => {
                    console.log("Error launching navigator", error);
                    this.display.showToast("Could not launch navigator");
                });
        });
    }

    public onCameraClick(): void {
        this.map.setClickable(false);
        this.display.showImagePickerActionSheet(() => {
            this.takeFromCamera();
        }, () => {
            this.takeFromLibrary();//2 for gallery
        }, () => {
            this.onCameraClickCancel();
        });
    }

    public onMailClick(): void {
        let message: string = "Please click on the link below to find out where I am.\nhttp://maps.google.com/maps?q=" + this.service.currentPosition.coords.latitude + "," + this.service.currentPosition.coords.longitude;
        SocialSharing.canShareViaEmail().then(() => {
            SocialSharing.shareViaEmail(message, "Current Location", []).then(() => {
                console.log("Email share success");
            }).catch(() => {
                this.display.showToast("Could not open email sender.");
            });
        }).catch(() => {
            this.display.showToast("Email sending is not supported.");
        });
    }

    public onTimerDateTimeOpened(): void {
        this.setMapClickable(false);
    }

    public onTimerDateTimeCancelled(): void {
        this.setMapClickable(true);
    }

    public onTimerDateTimeDone(): void {
        this.setMapClickable(true);
    }

    public takeFromCamera(): void {
        let options = {
            destinationType: Camera.DestinationType.FILE_URI,
            quality: 100,
        };
        Camera.getPicture(options).then((imageData) => {
            console.log("imageData", imageData);
            this.onEmailShare(imageData);
            this.setMapClickable(true);
        }, (err) => {
            this.setMapClickable(true);
            console.log(err);
        });
    }

    public takeFromLibrary() {
        console.log('Take image library');
        let options = {
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
        };
        Camera.getPicture(options).then((imageData) => {
            let image = "data:image/jpeg;base64," + imageData;
            this.setMapClickable(true);
            this.onEmailShare(image);
        }, (error) => {
            this.setMapClickable(true);
            console.log('image library error');
            console.log(error);
        });
    }

    private onCameraClickCancel(): void {
        this.map.setClickable(true);
    }

    public onEmailShare(imageData): void {
        SocialSharing.canShareViaEmail().then(() => {
            SocialSharing.shareViaEmail("", "", [], [], [], imageData).then(() => {
                this.display.showToast("Email send successfully.");
            }).catch((err) => {
                console.log(err);
                this.display.showToast("Email not sent.");
            });
        }).catch(() => {
            this.display.showToast("Sharing via email is not supported.");
        });
    }

    private handleLocationEnabling(resolve, reject): void {
        if (this.successAuthStatuses.indexOf(this.globalService.locationAuthorization) === -1) {
            console.log("Location authorization denied.");
            this.display.showToast("Could not access location");
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
                    if (!okClicked) {
                        this.isAlertShown = false;
                        this.setMapClickable(true);
                        this.display.showToast("Could not access location. Please enable location services.");
                        reject();
                    }
                });
            }
        }).catch(err => reject(err));
    }

    private onAppResume(): void {
        if (this.platform.is("ios") && this.tryGettingLocation) {
            this.onLocateClick();
            this.tryGettingLocation = false;
        }
    }

}
