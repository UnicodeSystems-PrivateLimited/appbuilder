import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { GpsCouponService, DisplayService, DataService, SocialService, SocialMedia } from '../../providers';
import { GpsCoupons, GpsCouponsActivity } from "../../interfaces/common-interfaces";
import { GlobalService } from '../../providers';
import { ModalController, Platform, ViewController, Alert } from 'ionic-angular';
import {
    SocialSharing, SQLite, NativeStorage, BarcodeScanner, GoogleMap,
    GoogleMapsEvent,
    GoogleMapsLatLng,
    CameraPosition,
    GoogleMapsMarkerOptions,
    CallNumber,
    LaunchNavigator,
    Geoposition,
    Device
} from 'ionic-native';
import { DirectionModal } from "../../components/direction-modal/direction-modal";
import moment from 'moment';
const facebookActivity: number = 1;
const twitterActivity: number = 2;
const userProfileActivity: number = 3;

const check: number = 1;
const redeem: number = 2;
const km: number = 1;
const mile: number = 2;

/*
  Generated class for the GpsCouponDesc page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-gps-coupon-desc',
    templateUrl: 'gps-coupon-desc.html'
})
export class GpsCouponDesc {

    public itemId: number;
    public tabId: number;
    public title: string;
    public bgImage: string;
    public distFromLocation: number;
    public appStoreUrl: string;
    public socialMedia: typeof SocialMedia = SocialMedia;
    public itemData: GpsCoupons = new GpsCoupons();
    public activity: GpsCouponsActivity = new GpsCouponsActivity();
    public activities = [];
    public loader: boolean = false;
    public toggle_activity_card: boolean = true;
    public db: SQLite;
    public facebookUser = null;
    public bar_code_text: string;
    public twitterUser = null;
    public gps_codes: any = [];
    public target = 0;
    public count = 0;
    public status = 0;
    public FACEBOOK: number = 1;
    public TWITTER: number = 2;
    public loggedSocialAccount: string[] = [];
    public lastScannedAt: any = null;
    public timeToNextScan: number = 0;
    public timeToNextScanInHourMin: string = null;
    public isRedeemed: boolean = false;
    public locationDistance: number[] = [];
    public contactList: any[] = [];
    public clLat: number;
    public clLong: number;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public service: GpsCouponService,
        public display: DisplayService,
        public alertCtrl: AlertController,
        public globalService: GlobalService,
        public modalCtrl: ModalController,
        public platform: Platform,
        public socialService: SocialService,
    ) {
        if (platform.is("android")) {
            this.appStoreUrl = this.globalService.initData.appData.google_play_store_url;
        }
        else if (platform.is("ios")) {
            this.appStoreUrl = this.globalService.initData.appData.ios_app_store_url;
        }
        platform.ready().then(() => {
            this.openDB();
        });
        this.itemId = navParams.get('itemId');
        this.bgImage = navParams.get('bgImage');
        this.tabId = navParams.get('tabId');
        this.clLat = navParams.get('clLat');
        this.clLong = navParams.get('clLong');
        this.distFromLocation = navParams.get('distance');
        this.getItemData();
        this.initUsers();
    }

    ionViewDidLoad() {
        this.gps_codes = [];
        this.target = 0;
        this.count = 0;
    }

    private initUsers(): void {
        this.initFacebookUser().then(res => {
            this.initTwitterUser().then(res => {
                if (SocialMedia.facebookUser && !this.socialService.facebookUserData) {
                    this.getUserData(SocialMedia.facebookUser, this.FACEBOOK);
                }
                if (SocialMedia.twitterUser && !this.socialService.twitterUserData) {
                    this.getUserData(SocialMedia.twitterUser, this.TWITTER);
                }

                //Check Recent Logged Account
                if (!SocialMedia.facebookUser && SocialMedia.twitterUser) {
                    //Only Twitter Logged In
                    this.loggedSocialAccount.push('twitter');
                } else if (SocialMedia.facebookUser && !SocialMedia.twitterUser) {
                    //Only Facebook Logged In
                    this.loggedSocialAccount.push('facebook');
                } else if (SocialMedia.facebookUser && SocialMedia.twitterUser) {
                    //Facebook & Twitter both Logged In
                    let fbLoggedAt = new Date(SocialMedia.facebookUser.loggedAt).getTime();
                    let twitterLoggedAt = new Date(SocialMedia.twitterUser.loggedAt).getTime();;
                    if (fbLoggedAt > twitterLoggedAt) {
                        this.loggedSocialAccount.push('twitter');
                        this.loggedSocialAccount.push('facebook');
                    } else {
                        this.loggedSocialAccount.push('facebook');
                        this.loggedSocialAccount.push('twitter');
                    }
                } else {
                    //No Social Account logged In
                }
            });
        });
    }

    private initFacebookUser(): Promise<boolean> {
        return new Promise(resolve => {
            SocialMedia.getStoredFacebookUser().then(user => {
                console.log("Facebook user logged in", user);
                resolve(true);
            }).catch(err => {
                console.log("No Facebook user logged in");
                resolve(false);
            });
        });
    }

    private initTwitterUser(): Promise<boolean> {
        return new Promise(resolve => {
            SocialMedia.getStoredTwitterUser().then(user => {
                console.log("Twitter user logged in", user);
                resolve(true);
            }).catch(err => {
                console.log("No Twitter user logged in");
                resolve(true);
            });
        });
    }

    public getUserData(user: any, userType: number): void {
        this.loader = true;
        this.socialService.getUserData(user.id, userType).subscribe(res => {
            this.loader = false;
            if (res.success) {
                if (userType === this.FACEBOOK) {
                    this.socialService.facebookUserData = res.data;
                }
                if (userType === this.TWITTER) {
                    this.socialService.twitterUserData = res.data;
                }
            } else {
                this.display.showToast("Server error occured");
            }
        });
    }

    public getItemData(): void {
        this.loader = true;
        this.service.getItemData(this.itemId, this.tabId).subscribe(res => {
            this.loader = false;
            if (res.success) {
                this.itemData = res.data.itemData;
                this.activities = res.data.activities;
                this.contactList = res.data.contactList;
                if (this.itemData.radius_unit == mile) {
                    this.itemData.radius = this.itemData.radius * 1.609344;
                }
                if (this.distFromLocation == -1) {
                    this.loader = true;
                    this.getDistanceFromLocation(this.contactList, this.clLat, this.clLong).then(getRes => {
                        this.loader = false;
                        let x = this.locationDistance.reduce(function (prev, cur) {
                            if (+prev < +cur) {
                                return prev;
                            } else {
                                return cur;
                            }
                        });
                    });
                }
            }
        });
    }

    public getDistanceFromLocation(locations, currentLat, currentLong): Promise<boolean> {
        return new Promise((resolve) => {
            locations.forEach((data) => {
                let locationLat = data.m_lat;
                let locationLong = data.m_long;
                let locationId = data.id;
                if (locationLat != null && locationLong != null) {
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
                    this.locationDistance[locationId] = dist;
                }
            });
            resolve(true);
        });
    }

    public onSharingClick(): void {
        this.display.showShareActionSheet(() => {
            this.onShareByFacebook();
        }, () => {
            this.onShareByTwitter();
        }, () => {
            this.onShareByEmail();
        }, () => {
            this.onShareBySms();
        }, () => {
            this.onShareCancel();
        });
    }

    public onShareByFacebook(): void {
        SocialSharing.shareViaFacebook("Check out this app : " + this.appStoreUrl).then(() => {
            console.log("Facebook share success");
        }).catch(() => {
            if (!this.platform.is("ios")) {
                this.display.showToast("Facebook app not found.");
            }
        });
    }

    public onShareByTwitter(): void {
        SocialSharing.shareViaTwitter("Check out this app : " + this.appStoreUrl).then(() => {
            console.log("Twitter share success");
        }).catch(err => {
            if (!this.platform.is("ios")) {
                this.display.showToast("Twitter app not found.");
            }
            console.log(err);
        });
    }

    private onShareBySms(): void {
        SocialSharing.shareViaSMS("Check out this app : " + this.appStoreUrl, null).then(() => {
            console.log("SMS share success");
        }).catch(() => {
            this.display.showToast("Could not open SMS sender.");
        });
    }

    public onShareByEmail(): void {
        SocialSharing.canShareViaEmail().then(() => {
            SocialSharing.shareViaEmail("Check out this app : " + this.appStoreUrl, this.title, []).then(() => {
                console.log("Email share success");
            }).catch(() => {
                this.display.showToast("Could not open email sender.");
            });
        }).catch(() => {
            this.display.showToast("Email sending is not supported.");
        });
    }

    private onShareCancel(): void {
    }


    public toggleOpeningCard(): void {
        this.toggle_activity_card = !this.toggle_activity_card;
    }

    public onDirectionClick() {
        if (this.distFromLocation == -1) {
            let modal = this.modalCtrl.create(DirectionModal);
            modal.present();
        } else {
            let lat = this.itemData.m_lat; let long = this.itemData.m_long;
            let defaultApp: any = LaunchNavigator.APP.GOOGLE_MAPS;
            if (this.platform.is("ios")) {
                defaultApp = LaunchNavigator.APP.APPLE_MAPS;
            }
            LaunchNavigator.isAppAvailable(defaultApp).then(isAvailable => {
                if (!isAvailable) {
                    defaultApp = LaunchNavigator.APP.USER_SELECT;
                }
                LaunchNavigator.navigate([lat, long], {
                    app: defaultApp
                }).then(
                    success => console.log("Launched navigator"),
                    error => {
                        console.log("Error launching navigator", error);
                        this.display.showToast("Could not launch navigator");
                    });
            });
        }

    }
    //activity work started

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
        this.db.executeSql("CREATE TABLE IF NOT EXISTS gpsCodeActivity (id INTEGER PRIMARY KEY, target INTEGER ,item_id INTEGER, type INTEGER, created_at DATETIME DEFAULT NULL)", {}).then(() => {
            console.log("gpsCodeActivity table created/already exists");
            this.db.executeSql('SELECT id, target, item_id, type, created_at FROM gpsCodeActivity WHERE item_id = ? AND type = ?', [this.itemId, redeem]).then(resultSet => {
                if (resultSet.rows.length == 0) {
                    this.isRedeemed = false;
                    this.getTargetCount().then(res => {
                        if (this.lastScannedAt) {
                            this.getTimeLeftToNextScan();
                        }
                    }).catch(err => {
                        console.log(err);
                    });
                } else {
                    this.isRedeemed = true;
                }
            }, err => {
                this.handleDBError(err);
            });
        }, err => {
            console.log("Table couldn't be created or opened :(");
            this.handleDBError(err);
        });
    }

    public handleDBError(err: any): void {
        this.display.showToast("Error occured");
        this.navCtrl.pop();
    }

    public getTargetCount(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.gps_codes = [];
            this.target = 0;
            this.count = 0;
            this.db.executeSql('SELECT id, target,item_id, type, created_at FROM gpsCodeActivity WHERE item_id = ? AND type = ?', [this.itemId, check]).then(resultSet => {
                for (let i = 0; i < resultSet.rows.length; i++) {
                    this.gps_codes.push(resultSet.rows.item(i));
                    this.lastScannedAt = resultSet.rows.item(i).created_at;
                }
                this.target = resultSet.rows.length;
                this.count = this.itemData.check_in_target - resultSet.rows.length;
                resolve(true);
            }, err => {
                this.handleDBError(err);
                reject();
            });
        });
    }

    public insertActivity(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let createdAt: string = moment().format();
            this.db.executeSql("INSERT INTO gpsCodeActivity (item_id, target, type, created_at) VALUES (?, ?, ?, ?)", [this.itemId, 1, check, createdAt]).then(resultSet => {
                this.display.showToast("Activity saved.");
                if (this.target == this.itemData.check_in_target) {
                    this.showActivityPrompt();
                }
                resolve(true);
            }, err => {
                this.handleDBError(err);
                reject();
            });
        });
    }

    private showActivityPrompt(): void {
        let alert: Alert = this.display.showAlert("You have successfully unlocked this coupon");
    }

    // on check in button click starts//

    public onCheckInClick(): void {
        if (this.distFromLocation < this.itemData.radius) {
            this.getTimeLeftToNextScan();
            if (this.timeToNextScan == 0 || this.itemData.hours_before_checkin == 0) {
                if ((this.count - 1) > 0) {
                    let leftCount = this.count - 1;
                    let prompt = this.alertCtrl.create({
                        message: "You need to check in another" + " " + leftCount + " " + "times before you can use this coupon.",
                        buttons: [
                            { text: 'OK', handler: data => this.OnCheckInOk() }
                        ]
                    });
                    prompt.present();
                } else {
                    this.OnCheckInOk();
                }
            } else {
                this.display.showAlert("You can't check in on this coupan again just yet. Come back later.", "Too soon!");
            }
        } else {
            this.display.showAlert("You need to get closer to the location marked.", "Not Quite There");
        }
    }

    public OnCheckInOk(): void {

        let len: number = this.loggedSocialAccount.length;
        if (len) {
            //If some social media is logged in.
            this.insertActivity().then(res => {
                this.getTargetCount().then(res => {
                    this.saveActivity(this.loggedSocialAccount[len - 1] === "facebook" ? facebookActivity : twitterActivity);
                    this.getTimeLeftToNextScan();
                }).catch(err => {
                    console.log(err);
                });
            }).catch(err => {
                console.log(err);
            });
            this.activity.type = 'check';
        } else {
            //If nothing is logged in
            this.activity.type = 'check';
            this.insertActivity().then(res => {
                this.getTargetCount().then(res => {
                    this.getTimeLeftToNextScan();
                    this.onShowLogin();
                }).catch(err => {
                    console.log(err);
                });
            }).catch(err => {
                console.log(err);
            });
        }

    }

    // public updateActivity(): void {
    //     this.db.executeSql("UPDATE gpsCodeActivity SET target=? WHERE item_id=?", [1, this.itemId]).then(resultSet => {
    //         this.display.showToast("Activity updated.");
    //         console.log(resultSet);
    //     }, err => {
    //         this.handleDBError(err);
    //     });
    // }


    public onShowLogin(): void {
        this.display.showCommentActionSheet(() => {
            this.handleFacebook();
        }, () => {
            this.handleTwitter();
        });
    }

    private handleFacebook(): void {
        SocialMedia.loginFacebook().then(user => {
            this.facebookUser = user;
            this.loggedSocialAccount.push('facebook');
            this.saveActivity(facebookActivity);
            this.display.showToast("Successfully posted.");
        }).catch(err => {
            this.display.showToast(err);
        });
    }

    private handleTwitter(): void {
        SocialMedia.loginTwitter().then(user => {
            this.twitterUser = user;
            this.loggedSocialAccount.push('twitter');
            this.saveActivity(twitterActivity);
            this.display.showToast("Successfully posted.");
        }).catch(err => {
            this.display.showToast(err);
        });
    }

    //on check in button click ends//


    //on redeem button click starts//

    public onRedeemClick(): void {
        let prompt = this.alertCtrl.create({
            title: 'Redeem',
            message: "Are you sure you want to redeem this coupon?",
            buttons: [
                { text: 'NO' },
                { text: 'OK', handler: data => this.clearCoupon() }
            ]
        });
        prompt.present();
    }

    public clearCoupon(): void {
        this.db.executeSql("DELETE FROM gpsCodeActivity WHERE item_id=? AND type=?", [this.itemId, check]).then(() => {
            this.onRedeem();
            let createdAt: string = moment().format();
            this.db.executeSql("INSERT INTO gpsCodeActivity (item_id, target, type, created_at) VALUES (?, ?, ?, ?)", [this.itemId, 1, redeem, createdAt]).then(resultSet => {
                let alert: Alert = this.display.showAlert("Coupon successfully redeemed");
                this.isRedeemed = true
                this.getTargetCount();
            }, err => {
                this.handleDBError(err);
            });
        }, err => {
            this.handleDBError(err);
        });
    }

    public onRedeem(): void {
        let len: number = this.loggedSocialAccount.length;
        if (len) {
            //If some social media is logged in.
            this.activity.type = 'redeem';
            this.saveActivity(this.loggedSocialAccount[len - 1] === "facebook" ? facebookActivity : twitterActivity);
        } else {
            //If nothing is logged in
            this.activity.type = 'redeem';
            this.onShowLogin();
        }
    }
    //Redeem button click ends//

    // Redeemed button click starts//
    public onRedeemedClick(): void {
        if (this.itemData.coupon_reuse == 1) {
            this.db.executeSql("DELETE FROM gpsCodeActivity WHERE item_id=? AND type=?", [this.itemId, redeem]).then(() => {
                this.isRedeemed = false;
            }, err => {
                this.handleDBError(err);
            });
        } else {
            this.display.showToast('This coupon cannot be used again');
        }
    }

    public deleteScanCount(): void {
        this.service.deleteScanCount(this.itemId).subscribe(res => {
            if (res.success) {
                console.log('scan count cleared');

            } else {
                console.log('Error clearing scan count');
            }
        });
    }
    // redeemed button click ends//


    //saving activity to database
    public saveActivity(activityType: number): boolean {
        if (this.socialService.isUserProfileDataRetrieved) {
            activityType = userProfileActivity;
        }

        this.activity.item_id = this.itemId;
        this.activity.target = this.target;
        this.activity.totalTarget = this.itemData.check_in_target;
        this.activity.app_code = DataService.appCode;
        this.activity.device_uuid = Device.uuid;
        switch (activityType) {
            case facebookActivity:
                this.activity.name = SocialMedia.facebookUser.name;
                this.activity.picture = SocialMedia.facebookUser.picture;
                this.activity.social_media_type = 1;
                this.activity.social_media_id = SocialMedia.facebookUser.id;
                break;
            case twitterActivity:
                this.activity.name = SocialMedia.twitterUser.name;
                this.activity.picture = SocialMedia.twitterUser.picture;
                this.activity.social_media_type = 2;
                this.activity.social_media_id = SocialMedia.twitterUser.id;
                break;
            case userProfileActivity:
                this.activity.social_media_id = this.socialService.userProfileData.id;
                this.activity.social_media_type = activityType;
                break;
            default:
                return;
        }
        this.loader = true;
        this.activity.active = this.activity.active == true ? 1 : 2;
        this.service.saveActivity(this.activity).subscribe(res => {
            this.loader = false;
            if (res.success) {
                // this.display.showToast("Activity successfully posted.");
                this.activities.unshift(res.data[0]);
                this.activity = new GpsCouponsActivity();
            } else {
                this.display.showToast('Server error occured');
            }
        });
    }

    public getTimeLeftToNextScan(): void {
        if (this.lastScannedAt) {
            let startTime = new Date();
            let endTime = new Date(this.lastScannedAt);
            endTime.setHours(endTime.getHours() + this.itemData.hours_before_checkin);
            this.timeToNextScan = endTime.valueOf() - startTime.valueOf();

            let timeToNextScanInSeconds = this.timeToNextScan / 1000;
            let timeToNextScanInMin = timeToNextScanInSeconds / 60;
            let minutes = Math.floor(timeToNextScanInMin % 60);
            let timeToNextScanInHour = Math.floor(timeToNextScanInMin / 60);
            this.timeToNextScanInHourMin = timeToNextScanInHour > 0 ? (timeToNextScanInHour + ' hour(s) ' + (minutes > 0 ? minutes + ' minutes' : '')) : (minutes > 0 ? minutes + 'minutes' : '');
        }
    }

}
