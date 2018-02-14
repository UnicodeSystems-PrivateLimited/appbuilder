import { Component, ViewChild } from '@angular/core';
import { NavController, Platform, NavParams, AlertController, Content } from 'ionic-angular';
import { ContactUsService, DisplayService, SocialMedia, SocialService, DataService } from '../../providers';
import { GlobalService } from '../../providers';
import { ContactLocation, ContactComment, OpeningTime } from "../../interfaces/common-interfaces";
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
    selector: 'page-contact-us-detail',
    templateUrl: 'contact-us-detail.html'
})
export class ContactUsDetail {
    public tabId: number;
    public title: string;
    public map: GoogleMap;
    public loader: boolean = false;
    public commentLoader: boolean = false;
    public locationId: number;
    public location: ContactLocation = new ContactLocation();
    public comments: ContactComment[] = [];
    public openingTimes: OpeningTime[] = [];
    public facebookUser = null;
    public twitterUser = null;
    public contactComments: ContactComment = new ContactComment();
    public bgImage: string;
    private MAP_TYPE_NORMAL: string = 'MAP_TYPE_NORMAL';
    public toggle_comment_card: boolean = true;
    public toggle_openingtime_card: boolean = true;
    public tab_nav_type: string = null;
    public subTabId: number = null;
    @ViewChild(Content) content: Content;

    constructor(public navCtrl: NavController,
        public platform: Platform,
        public navParams: NavParams,
        public service: ContactUsService,
        public display: DisplayService,
        public alertCtrl: AlertController,
        public globalService: GlobalService,
        public socialService: SocialService

    ) {
        this.locationId = navParams.get('locationId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tabId = navParams.get('tabId');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.getLocationData();
    }

    public getLocationData(): void {
        this.loader = true;
        this.platform.ready().then(() => {
            this.service.getLocation(this.locationId).subscribe(res => {
                this.loader = false;
                if (res.success) {
                    this.location = res.data.locationData;
                    this.comments = res.data.comments;
                    this.openingTimes = res.data.openingTimes;
                    this.loadMap(this.location.m_lat, this.location.m_long);
                } else {
                    console.log('Server error occured');
                }
            });
        });
    }

    public loadMap(lat: number, long: number): void {
        this.map = new GoogleMap('map');
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

    public onCallUsClick(): void {
        this.display.showConfirm(
            this.location.telephone,
            "Do you want to call this number?",
            () => this._call()
        );
    }

    private _call(): void {
        this.platform.ready().then(() => {
            CallNumber.callNumber(this.location.telephone, false).catch(() => {
                this.display.showAlert('Error launching dialer!');
            });
        });
    }

    public onDirectionsClick(): void {
        let defaultApp: any = LaunchNavigator.APP.GOOGLE_MAPS;
        if (this.platform.is("ios")) {
            defaultApp = LaunchNavigator.APP.APPLE_MAPS;
        }
        LaunchNavigator.isAppAvailable(defaultApp).then(isAvailable => {
            if (!isAvailable) {
                defaultApp = LaunchNavigator.APP.USER_SELECT;
            }
            LaunchNavigator.navigate([this.location.m_lat, this.location.m_long], {
                app: defaultApp
            }).then(
                success => console.log("Launched navigator"),
                error => {
                    console.log("Error launching navigator", error);
                    this.display.showToast("Could not launch navigator");
                });
        });
    }

    public onEmailClick(): void {
        SocialSharing.canShareViaEmail().then(() => {
            SocialSharing.shareViaEmail("", this.title, [this.location.email_id]).then(() => {
                console.log("Email share success");
            }).catch(() => {
                this.display.showToast("Could not open email sender.");
            });
        }).catch(() => {
            this.display.showToast("Email sending is not supported.");
        });
    }

    public onWebsiteClick(): void {
        window.open(this.location.website, '_system');
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

            this.contactComments.comment = data.comment;
            this.contactComments.contact_id = this.locationId;
            this.contactComments.app_code = DataService.appCode;
            this.contactComments.device_uuid = Device.uuid;

            switch (commentType) {
                case facebookComment:
                    this.contactComments.name = this.facebookUser.name;
                    this.contactComments.picture = this.facebookUser.picture;
                    this.contactComments.social_media_id = this.facebookUser.id;
                    this.contactComments.social_media_type = 1;
                    break;
                case twitterComment:
                    this.contactComments.name = this.twitterUser.name;
                    this.contactComments.picture = this.twitterUser.picture;
                    this.contactComments.social_media_id = this.twitterUser.id;
                    this.contactComments.social_media_type = 2;
                    break;
                case userProfileComment:
                    this.contactComments.social_media_id = this.socialService.userProfileData.id;
                    this.contactComments.social_media_type = commentType;
                    break;
                default:
                    return;
            }

            this.commentLoader = true;
            this.service.save(this.contactComments).subscribe(res => {
                this.commentLoader = false;
                if (res.success) {
                    this.display.showToast("Comment successfully posted.");
                    this.comments.unshift(res.data[0]);
                    if (this.socialService.facebookUserData != null && commentType == 1) {
                        this.socialService.facebookUserData.comments.unshift(res.data[0]);
                    }
                    if (this.socialService.twitterUserData != null && commentType == 2) {
                        this.socialService.twitterUserData.comments.unshift(res.data[0]);
                    }
                    this.contactComments = new ContactComment();
                } else {
                    this.display.showToast('Server error occured');
                }
            });
        } else {
            this.display.showToast('Comment required.', 'priority-toast');
            return false;
        }
    }

    public toggleOpeningCard(): void {
        this.toggle_openingtime_card = !this.toggle_openingtime_card;
    }

    public toggleCommentsCard(): void {
        this.toggle_comment_card = !this.toggle_comment_card;
    }

}
