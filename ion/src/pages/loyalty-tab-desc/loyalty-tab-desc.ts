import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { LoyaltyTabService, DisplayService, DataService, SocialService, SocialMedia } from '../../providers';
import { Loyalty, LoyaltyActivity, AdvLoyaltyActivity, InsertStampActivityData, ClearStampActivityData } from "../../interfaces/common-interfaces";
import { GlobalService } from '../../providers';
import { ModalController, Platform, ViewController, Alert } from 'ionic-angular';
import { SocialSharing, SQLite, NativeStorage, Device } from 'ionic-native';
import moment from 'moment';
const facebookActivity: number = 1;
const twitterActivity: number = 2;
const userProfileActivity: number = 3;
/*
  Generated class for the LoyaltyTabDesc page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-loyalty-tab-desc',
    templateUrl: 'loyalty-tab-desc.html'
})
export class LoyaltyTabDesc {

    public itemId: number;
    public item_id: number;
    public is_advance: number;
    public tabId: number;
    public title: string;
    public bgImage: string;
    public appStoreUrl: string;
    public itemData: Loyalty = new Loyalty();
    public activity: LoyaltyActivity = new LoyaltyActivity();
    public advAactivity: AdvLoyaltyActivity = new AdvLoyaltyActivity();
    public socialMedia: typeof SocialMedia = SocialMedia;
    public activities = [];
    public advActivities = [];
    public loader: boolean = false;
    public stamp: boolean = true;
    public toggle_activity_card: boolean = true;
    public info: boolean = false;
    public toggle_perk_card: boolean[] = [];
    public db: SQLite;
    public facebookUser = null;
    public twitterUser = null;
    public stamps: any = [];
    public target = 0;
    public count = 0;
    public status = 0;
    public perks = [];
    public FACEBOOK: number = 1;
    public TWITTER: number = 2;
    public loggedSocialAccount = [];
    public userType: string;
    public deviceUuid: string = null;
    public insertStampActivityData: InsertStampActivityData = new InsertStampActivityData();
    public clearStampActivityData: ClearStampActivityData = new ClearStampActivityData();

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public service: LoyaltyTabService,
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

        this.itemId = navParams.get('itemId');
        this.item_id = navParams.get('item_id');
        this.bgImage = navParams.get('bgImage');
        this.tabId = navParams.get('tabId');
        this.deviceUuid = Device.uuid;
        this.getItemData();
    }

    public getItemData(): void {
        this.loader = true;
        this.service.getItemData(this.itemId, this.globalService.initData.appData.id, this.deviceUuid).subscribe(res => {
            this.loader = false;
            if (res.success) {
                this.itemData = res.data.itemData;
                this.target = res.data.stampCount;
                this.count = this.itemData.square_count - res.data.stampCount;
                this.initUsers();
                if (this.itemData.is_advance == 0) {
                    this.getActivities();
                } else {
                    this.getAdvActivities();
                    this.getPerks();
                }
            }
        });
    }

    public getPerks(): void {
        this.service.getPerks(this.item_id).subscribe(res => {
            if (res.success) {
                this.perks = res.data;
            } else {
                console.log('no Data found');
            }
        });
    }

    public getActivities(): void {
        this.loader = true;
        this.service.getActivities(this.item_id).subscribe(res => {
            this.loader = false;
            if (res.success) {
                this.activities = res.data;
            }
        });
    }

    public getAdvActivities(): void {
        this.loader = true;
        this.service.getAdvActivities(this.item_id).subscribe(res => {
            this.loader = false;
            if (res.success) {
                this.advActivities = res.data;
            }
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
    public toggleperkOpeningCard(id: number): void {
        this.toggle_perk_card[id] = !this.toggle_perk_card[id];
    }

    public onStampClick(): void {
        let prompt = this.alertCtrl.create({
            title: 'SECRET CODE',
            message: "Please hand your device to the business representative who will stamp your card.",
            enableBackdropDismiss: false,
            inputs: [
                { name: 'code', placeholder: 'Enter Secret Code' },
            ],
            buttons: [
                { text: 'CANCEL' },
                { text: 'STAMP', handler: data => this.saveStamp(data) }
            ],
        });
        prompt.present();
    }

    public saveStamp(data: any): void {
        if (data.code == this.itemData.secret_code) {
            let len: number = this.loggedSocialAccount.length;
            if (len) {
                //If some social media is logged in.
                this.insertActivity(() => {
                    if (this.target == this.itemData.square_count) {
                        this.showActivityPrompt();
                    }
                    this.saveActivity(this.loggedSocialAccount[len - 1] === "facebook" ? facebookActivity : twitterActivity);
                });
                this.activity.type = 'stamp';
            } else {
                this.insertActivity(() => {
                    this.onShowLogin();
                });
                this.activity.type = 'stamp';
            }
            // this.display.showToast('Stamp successfully posted');
        } else {
            this.display.showToast('Secret code does not match');
        }
    }

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
            this.stamp = false;
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
            this.stamp = false;
        }).catch(err => {
            this.display.showToast(err);
        });
    }

    public insertActivity(onSubscribe: Function): void {
        this.insertStampActivityData.deviceUuid = this.deviceUuid;
        this.insertStampActivityData.appId = this.globalService.initData.appData.id;
        this.insertStampActivityData.item_id = this.itemId;
        this.service.insertStampActivity(this.insertStampActivityData).subscribe(res => {
            if (res.success) {
                this.target = res.data;
                this.count = this.itemData.square_count - res.data;
                this.display.showToast(res.message);
                onSubscribe();
            } else {
                this.display.showToast('Server error occured');
            }
        });
    }

    private showActivityPrompt(): void {
        let alert: Alert = this.display.showAlert("You have successfully unlocked this loyalty");
    }

    public saveActivity(activityType: number): boolean {
        if (this.socialService.isUserProfileDataRetrieved) {
            activityType = userProfileActivity;
        }

        this.activity.item_id = this.item_id;
        this.activity.target = this.target;
        this.activity.totalTarget = this.itemData.square_count;
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
                this.activity = new LoyaltyActivity();
            } else {
                this.display.showToast('Server error occured');
            }
        });
    }

    public onRedeemClick(): void {
        let prompt = this.alertCtrl.create({
            title: 'SECRET CODE',
            message: "Please hand your device to the business representative who will redeem your card.",
            enableBackdropDismiss: false,
            inputs: [
                { name: 'code', placeholder: 'Enter Secret Code' },
            ],
            buttons: [
                { text: 'CANCEL' },
                { text: 'REDEEM', handler: data => this.onRedeem(data) }
            ]
        });
        prompt.present();
    }

    public onRedeem(data): void {
        if (data.code == this.itemData.secret_code) {
            this.clearStampActivity();
            let len: number = this.loggedSocialAccount.length;
            if (len) {
                //If some social media is logged in.
                this.activity.type = 'redeem';
                this.saveActivity(this.loggedSocialAccount[len - 1] === "facebook" ? facebookActivity : twitterActivity);
            } else {
                this.activity.type = 'redeem';
                this.onShowLogin();
            }
        } else {
            this.display.showToast('Secret code does not match');
        }
    }

    public clearStampActivity(): void {
        this.clearStampActivityData.deviceUuid = this.deviceUuid;
        this.clearStampActivityData.appId = this.globalService.initData.appData.id;
        this.clearStampActivityData.item_id = this.itemId;
        this.service.clearStampActivity(this.clearStampActivityData).subscribe(res => {
            console.log(res);
            if (res.success) {
                this.target = 0;
                this.count = this.itemData.square_count - this.target;
            } else {
                this.display.showToast('Server error occured');
            }
        });
    }

    public deleteStampCount(): void {
        this.service.deleteStampCount(this.itemId).subscribe(res => {
            if (res.success) {
                console.log('scan count cleared');
            } else {
                console.log('Error clearing scan count');
            }
        });
    }

    /**
     * Loyalty Activity End
     */

    /**
     * Advanced Loyalty Activity Starts
     */

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
                console.log('Logged Account', this.loggedSocialAccount);
                let len: number = this.loggedSocialAccount.length;
                this.userType = this.loggedSocialAccount[len - 1] === "facebook" ? 'facebookUser' : 'twitterUser';
                console.log(this.userType);
                if (this.itemData.is_advance == 1) {
                    if (this.loggedSocialAccount.length) {
                        this.stamp = false;
                    } else {
                        this.stamp = true;
                        let alert: Alert = this.display.showAlert("You need to login via social media in order to use this feature");
                    }
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

    public onAdvStampClick(): void {
        let prompt = this.alertCtrl.create({
            title: 'SECRET CODE',
            enableBackdropDismiss: false,
            message: "Please hand your device to the business representative who will stamp your card.",
            inputs: [
                { name: 'secretCode', placeholder: 'Enter Secret Code' },
            ],
            buttons: [
                { text: 'CANCEL' },
                { text: 'STAMP', handler: data => this.onStampSave(data) }
            ]
        });
        prompt.present();
    }

    public onStampSave(data: any): void {
        if (data.secretCode == this.itemData.secret_code) {
            let len: number = this.loggedSocialAccount.length;
            this.saveAdvActivity(this.loggedSocialAccount[len - 1] === "facebook" ? facebookActivity : twitterActivity);
        }
        else {
            this.display.showToast('Secret code does not match');
        }
    }

    public saveAdvActivity(activityType: number): boolean {
        if (this.socialService.isUserProfileDataRetrieved) {
            activityType = userProfileActivity;
        }

        this.advAactivity.app_code = DataService.appCode;
        this.advAactivity.item_id = this.item_id;
        this.advAactivity.perk_unit_type = this.itemData.perk_unit_type;
        this.advAactivity.stamp_award_amount = this.itemData.stamp_award_amount;
        this.advAactivity.device_uuid = Device.uuid;
        switch (activityType) {
            case facebookActivity:
                this.advAactivity.name = SocialMedia.facebookUser.name;
                this.advAactivity.picture = SocialMedia.facebookUser.picture;
                this.advAactivity.social_media_type = 1;
                this.advAactivity.social_media_id = SocialMedia.facebookUser.id;
                break;
            case twitterActivity:
                this.advAactivity.name = SocialMedia.twitterUser.name;
                this.advAactivity.picture = SocialMedia.twitterUser.picture;
                this.advAactivity.social_media_type = 2;
                this.advAactivity.social_media_id = SocialMedia.twitterUser.id;
                break;
            case userProfileActivity:
                this.advAactivity.social_media_id = this.socialService.userProfileData.id;
                this.advAactivity.social_media_type = activityType;
                break;
            default:
                return;
        }
        this.loader = true;
        console.log('this.advAactivity');
        console.log(this.advAactivity);
        this.service.saveAdvActivity(this.advAactivity).subscribe(res => {
            this.loader = false;
            if (res.success) {
                this.display.showToast("Successfully posted.");
                console.log(res.data[0]);
                this.advActivities.unshift(res.data[0]);
                this.advAactivity = new AdvLoyaltyActivity();
                this.getItemData();
            } else {
                this.display.showToast('Server error occured');
            }
        });
    }

    public onPerkRedeem(points: number, perkTitle: string): void {
        let prompt = this.alertCtrl.create({
            title: 'SECRET CODE',
            enableBackdropDismiss: false,
            message: "Please hand your device to the business representative who will redeem your perk.",
            inputs: [
                { name: 'code', placeholder: 'Enter Secret Code' },
            ],
            buttons: [
                { text: 'CANCEL' },
                { text: 'REDEEM', handler: data => this.onPerkOk(data, points, perkTitle) }
            ]
        });
        prompt.present();
    }

    public onPerkOk(data: any, points: number, perkTitle: string): void {
        let len: number = this.loggedSocialAccount.length;
        if (data.code == this.itemData.secret_code) {
            this.onPerkSave(this.loggedSocialAccount[len - 1] === "facebook" ? facebookActivity : twitterActivity, points, perkTitle);
        }
        else {
            this.display.showToast('Secret code does not match');
        }
    }

    public onPerkSave(activityType: number, points: number, perkTitle: string): void {
        if (this.socialService.isUserProfileDataRetrieved) {
            activityType = userProfileActivity;
        }

        this.advAactivity.item_id = this.item_id;
        this.advAactivity.points = points;
        this.advAactivity.app_code = DataService.appCode;
        this.advAactivity.perk_unit_type = this.itemData.perk_unit_type;
        this.advAactivity.perk_title = perkTitle;
        this.advAactivity.device_uuid = Device.uuid;
        switch (activityType) {
            case facebookActivity:
                this.advAactivity.name = SocialMedia.facebookUser.name;
                this.advAactivity.picture = SocialMedia.facebookUser.picture;
                this.advAactivity.social_media_type = 1;
                this.advAactivity.social_media_id = SocialMedia.facebookUser.id;
                break;
            case twitterActivity:
                this.advAactivity.name = SocialMedia.twitterUser.name;
                this.advAactivity.picture = SocialMedia.twitterUser.picture;
                this.advAactivity.social_media_type = 2;
                this.advAactivity.social_media_id = SocialMedia.twitterUser.id;
                break;
            case userProfileActivity:
                this.advAactivity.social_media_id = this.socialService.userProfileData.id;
                this.advAactivity.social_media_type = activityType;
                break;
            default:
                return;
        }
        this.loader = true;
        console.log(this.advAactivity);
        this.service.savePerkActivity(this.advAactivity).subscribe(res => {
            this.loader = false;
            if (res.success) {
                this.display.showToast("Successfully posted.");
                console.log(res.data[0]);
                this.advActivities.unshift(res.data[0]);
                this.advAactivity = new AdvLoyaltyActivity();
                this.getItemData();
            } else {
                this.display.showToast(res.message);
            }
        });
    }

    public onInfo(): void {
        this.info = !this.info;
    }
}
