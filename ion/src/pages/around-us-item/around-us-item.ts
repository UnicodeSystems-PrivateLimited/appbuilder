import { Component } from '@angular/core';
import { NavController, Platform, NavParams, AlertController } from 'ionic-angular';
import { AroundUsService, DisplayService, SocialMedia, SocialService } from '../../providers';
import { AroundUsItemData, AroundUsComment } from "../../interfaces/common-interfaces";
import { GlobalService, DataService } from '../../providers';
import { ModalController, ViewController } from 'ionic-angular';
import { Subscription } from "rxjs";
import {
    GoogleMap,
    GoogleMapsEvent,
    GoogleMapsLatLng,
    CameraPosition,
    GoogleMapsMarkerOptions,
    CallNumber,
    LaunchNavigator,
    SocialSharing,
    Device
} from 'ionic-native';

const facebookComment: number = 1;
const twitterComment: number = 2;
const userProfileComment: number = 3;

@Component({
    selector: 'page-around-us-item',
    templateUrl: 'around-us-item.html'
})
export class AroundUsItem {
    public title: string;
    public bgImage: string;
    public map: GoogleMap;
    public tabId: number;
    public tab1: string;
    public appName: string;
    public itemId: number;
    public itemData: AroundUsItemData = new AroundUsItemData();
    public comments: AroundUsComment[] = [];
    public aroundComments: AroundUsComment = new AroundUsComment();
    public facebookUser = null;
    public twitterUser = null;
    public loader: boolean = false;
    public commentLoader: boolean = false;
    private MAP_TYPE_NORMAL: string = 'MAP_TYPE_NORMAL';
    public toggle_comment_card: boolean = true;
    public toggle_openingtime_card: boolean = true;
    public itemDataSubscription: Subscription;

    constructor(public navCtrl: NavController,
        public platform: Platform,
        public navParams: NavParams,
        public service: AroundUsService,
        public display: DisplayService,
        public globalService: GlobalService,
        public alertCtrl: AlertController,
        public modalCtrl: ModalController,
        public socialService: SocialService,
        public dataService: DataService,
    ) {
        this.itemId = navParams.get('itemId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tabId = navParams.get('tabId');
        this.getItemData();
        this.appName = this.globalService.initData.appData.app_name;
    }

    public ionViewWillLeave(): void {
        this.itemDataSubscription.unsubscribe();
    }

    public getItemData(): void {
        this.loader = true;
        this.itemDataSubscription = this.service.getItemData(this.itemId).subscribe(res => {
            if (res.success) {
                this.loader = false;
                this.itemData = res.data.itemData;
                this.comments = res.data.comments;
                this.loadMap(this.itemData.m_lat, this.itemData.m_long);
            }
        });
    }

    public loadMap(lat: number, long: number): void {
        this.map = new GoogleMap('item-map');
        let latLong: GoogleMapsLatLng = new GoogleMapsLatLng(lat, long);
        this.map.clear();
        this.map.setMapTypeId(this.MAP_TYPE_NORMAL);
        let position: CameraPosition = {
            target: latLong,
            zoom: 15,
        };
        let markerOptions: GoogleMapsMarkerOptions = {
            position: latLong
        };

        this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
            this.map.moveCamera(position);
            this.map.addMarker(markerOptions);
            this.map.setOptions({
                controls: {
                    zoom: true,
                }
            });
        }, err => {
            console.log(err);
        });
    }

    public onPostCommentClick(): void {
        this.display.showCommentActionSheet(() => {
            this.handleFacebook();
        }, () => {
            this.handleTwitter();
        });
    }

    private handleFacebook(): void {
        if (this.facebookUser) {
            this.showCommentPrompt(facebookComment);
        } else {
            SocialMedia.loginFacebook().then(user => {
                this.facebookUser = user;
                this.showCommentPrompt(facebookComment);
            }).catch(err => {
                this.display.showToast(err);
            });
        }
    }

    private handleTwitter(): void {
        if (this.twitterUser) {
            this.showCommentPrompt(twitterComment);
        } else {
            SocialMedia.loginTwitter().then(user => {
                this.twitterUser = user;
                this.showCommentPrompt(twitterComment);
            }).catch(err => {
                this.display.showToast(err);
            });
        }
    }

    private showCommentPrompt(commentType: number): void {
        let prompt = this.alertCtrl.create({
            inputs: [
                { name: 'comment', placeholder: 'Enter comment' },
            ],
            buttons: [
                { text: 'Cancel' },
                { text: 'Post', handler: data => this.saveComment(data, commentType) }
            ]
        });
        prompt.present();
    }

    private saveComment(data, commentType: number): boolean {
        if (data.comment || data.comment.length > 0) {
            if (this.socialService.isUserProfileDataRetrieved) {
                commentType = userProfileComment;
            }

            this.aroundComments.description = data.comment;
            this.aroundComments.item_id = this.itemData.id;
            this.aroundComments.app_code = DataService.appCode;
            this.aroundComments.device_uuid = Device.uuid;
            switch (commentType) {
                case facebookComment:
                    this.aroundComments.name = this.facebookUser.name;
                    this.aroundComments.picture = this.facebookUser.picture;
                    this.aroundComments.social_media_id = this.facebookUser.id;
                    this.aroundComments.social_media_type = 1;
                    break;
                case twitterComment:
                    this.aroundComments.name = this.twitterUser.name;
                    this.aroundComments.picture = this.twitterUser.picture;
                    this.aroundComments.social_media_id = this.twitterUser.id;
                    this.aroundComments.social_media_type = 2;
                    break;
                case userProfileComment:
                    this.aroundComments.social_media_id = this.socialService.userProfileData.id;
                    this.aroundComments.social_media_type = commentType;
                    break;
                default:
                    return;
            }

            this.commentLoader = true;
            this.service.saveComment(this.aroundComments).subscribe(res => {
                this.commentLoader = false;
                if (res.success) {
                    this.display.showToast("Comment successfully posted.");
                    console.log(res.data[0]);
                    this.comments.unshift(res.data[0]);
                    let commentDetails: any = {};
                    commentDetails.id = res.data[0].id;
                    commentDetails.name = res.data[0].name;
                    commentDetails.comment = res.data[0].description;
                    commentDetails.picture = res.data[0].picture;
                    commentDetails.created_at = res.data[0].created_at;
                    if (this.socialService.facebookUserData != null && commentType == 1) {
                        this.socialService.facebookUserData.comments.unshift(commentDetails);
                    }
                    if (this.socialService.twitterUserData != null && commentType == 2) {
                        this.socialService.twitterUserData.comments.unshift(commentDetails);
                    }
                    this.aroundComments = new AroundUsComment();
                } else {
                    this.display.showToast('Server error occured');
                }
            });
        } else {
            this.display.showToast('Comment required.', 'priority-toast');
            return false;
        }
    }

    public showCallPrompt(): void {
        let prompt = this.alertCtrl.create({
            title: this.itemData.telephone,
            message: 'Do you want to call this number?',
            buttons: [
                { text: 'NO' },
                { text: 'YES', handler: data => this.callOnNumber() }
            ]
        });
        prompt.present();
    }

    public callOnNumber(): void {
        this.platform.ready().then(() => {
            CallNumber.callNumber(this.itemData.telephone, false).catch(() => {
                this.display.showAlert('Error launching dialer!');
            });
        });
    }

    public onMailClick(): void {
        SocialSharing.canShareViaEmail().then(() => {
            SocialSharing.shareViaEmail(" ", this.title, [this.itemData.email_id]).then(() => {
                console.log("Email share success");
            }).catch(() => {
                this.display.showToast("Could not open email sender.");
            });
        }).catch(() => {
            this.display.showToast("Email sending is not supported.");
        });
    }


    public onDirectionClick() {
        let defaultApp: any = LaunchNavigator.APP.GOOGLE_MAPS;
        if (this.platform.is("ios")) {
            defaultApp = LaunchNavigator.APP.APPLE_MAPS;
        }
        LaunchNavigator.isAppAvailable(defaultApp).then(isAvailable => {
            if (!isAvailable) {
                defaultApp = LaunchNavigator.APP.USER_SELECT;
            }
            LaunchNavigator.navigate([this.itemData.m_lat, this.itemData.m_long], {
                app: defaultApp
            }).then(
                success => console.log("Launched navigator"),
                error => {
                    console.log("Error launching navigator", error);
                    this.display.showToast("Could not launch navigator");
                });
        });
    }

    public onWebsiteClick(): void {
        window.open(this.itemData.website, '_system');
    }

    public onSharingClick(): void {
        this.map.setClickable(false);
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
        this.map.setClickable(true);
        SocialSharing.shareViaFacebook(this.appName).then(() => {
            console.log("Facebook share success");
        }).catch(() => {
            if (!this.platform.is("ios")) {
                this.display.showToast("Facebook app not found.");
            }
        });
    }

    public onShareByTwitter(): void {
        this.map.setClickable(true);
        SocialSharing.shareViaTwitter(this.appName).then(() => {
            console.log("Twitter share success");
        }).catch(err => {
            if (!this.platform.is("ios")) {
                this.display.showToast("Twitter app not found.");
            }
            console.log(err);
        });
    }

    private onShareBySms(): void {
        this.map.setClickable(true);
        SocialSharing.shareViaSMS(this.appName, null).then(() => {
            console.log("SMS share success");
        }).catch(() => {
            this.display.showToast("Could not open SMS sender.");
        });
    }

    public onShareByEmail(): void {
        this.map.setClickable(true);
        SocialSharing.canShareViaEmail().then(() => {
            SocialSharing.shareViaEmail("", this.appName, []).then(() => {
                console.log("Email share success");
            }).catch(() => {
                this.display.showToast("Could not open email sender.");
            });
        }).catch(() => {
            this.display.showToast("Email sending is not supported.");
        });
    }

    private onShareCancel(): void {
        this.map.setClickable(true);
    }

    public toggleCommentsCard(): void {
        this.toggle_comment_card = !this.toggle_comment_card;
    }
    public toggleOpeningCard(): void {
        this.toggle_openingtime_card = !this.toggle_openingtime_card;
    }
}     
