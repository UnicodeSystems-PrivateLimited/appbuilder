import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { EventsTabService, DisplayService, SocialMedia, SocialService, DataService } from '../../providers';
import { EventsComment, Events, EventsGallery, EventsGoing } from "../../interfaces/common-interfaces";
import { GlobalService } from '../../providers';
import { EventsGallerySlide } from "../events-gallery-slide/events-gallery-slide";
import { EventsPhotoAddModal } from "../events-photo-add-modal/events-photo-add-modal";
import { ModalController, Platform, ViewController, Alert } from 'ionic-angular';
import {
    GoogleMap,
    GoogleMapsEvent,
    GoogleMapsLatLng,
    CameraPosition,
    GoogleMapsMarkerOptions,
    CallNumber,
    LaunchNavigator,
    SocialSharing,
    Calendar,
    Camera,
    Device
} from 'ionic-native';

const facebookComment: number = 1;
const twitterComment: number = 2;
const userProfileComment: number = 3;

const facebookGoing: number = 1;
const twitterGoing: number = 2;
const userProfileGoing: number = 3;
/*
  Generated class for the EventsTabDesc page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-events-tab-desc',
    templateUrl: 'events-tab-desc.html'
})
export class EventsTabDesc {
    public itemId: number;
    public tabId: number;
    public title: string;
    public bgImage: string;
    public map: GoogleMap;
    public itemData: Events = new Events();
    public eventComments: EventsComment = new EventsComment();
    public comments: EventsComment[] = [];
    public eventGoings: EventsGoing = new EventsGoing();
    public goings: EventsGoing[] = [];
    public images: EventsGallery[] = [];
    public tabs: string = 'description'; // Default open tab.
    public facebookUser = null;
    public twitterUser = null;
    public appStoreUrl: string;
    public loader: boolean = false;
    public commentLoader: boolean = false;
    public goingFbButton: boolean = true;
    public goingTwtButton: boolean = true;
    private MAP_TYPE_NORMAL: string = 'MAP_TYPE_NORMAL';
    public event_type: string;
    public eventGallery: EventsGallery = new EventsGallery();


    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public service: EventsTabService,
        public display: DisplayService,
        public alertCtrl: AlertController,
        public globalService: GlobalService,
        public modalCtrl: ModalController,
        public platform: Platform,
        public socialService: SocialService
    ) {
        if (platform.is("android")) {
            this.appStoreUrl = this.globalService.initData.appData.google_play_store_url;
        }
        else if (platform.is("ios")) {
            this.appStoreUrl = this.globalService.initData.appData.ios_app_store_url;
        }

        this.itemId = navParams.get('itemId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tabId = navParams.get('tabId');
        this.event_type = navParams.get('event_type');
        this.getItemData();
    }

    ionViewDidLoad() {
        console.log('Hello EventsTabDesc Page');
    }

    public getItemData(): void {
        this.loader = true;
        this.service.getItemData(this.itemId).subscribe(res => {
            if (res.success) {
                this.loader = false;
                this.itemData = res.data.eventData;
                this.comments = res.data.comments;
                this.goings = res.data.goings;
                this.images = res.data.images;
                if (this.platform.is("cordova")) {
                    this.loadMap(this.itemData.m_lat, this.itemData.m_long);
                }
            }
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

    public onGoingClick(): void {
        this.setMapClickable(false);
        this.display.showCommentActionSheet(() => {
            if (this.goingFbButton)
                this.handleFacebookGoing();
        }, () => {
            if (this.goingTwtButton)
                this.handleTwitterGoing();
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

    private handleFacebookGoing(): void {
        if (this.facebookUser) {
            this.saveGoing(facebookGoing);
        } else {
            SocialMedia.loginFacebook().then(user => {
                this.facebookUser = user;
                this.saveGoing(facebookGoing);
            }).catch(err => {
                this.display.showToast(err);
            });
            this.setMapClickable(true);
        }
        this.goingFbButton = false;
    }

    private handleTwitterGoing(): void {
        if (this.twitterUser) {
            this.saveGoing(twitterGoing);
        } else {
            SocialMedia.loginTwitter().then(user => {
                this.twitterUser = user;
                this.saveGoing(twitterGoing);
            }).catch(err => {
                this.display.showToast(err);
            });
        }
        this.goingTwtButton = false;
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

            this.eventComments.comment = data.comment;
            this.eventComments.event_id = this.itemData.id;
            this.eventComments.app_code = DataService.appCode;
            this.eventComments.device_uuid = Device.uuid;

            switch (commentType) {
                case facebookComment:
                    this.eventComments.name = this.facebookUser.name;
                    this.eventComments.picture = this.facebookUser.picture;
                    this.eventComments.social_media_type = 1;
                    this.eventComments.social_media_id = this.facebookUser.id;
                    break;
                case twitterComment:
                    this.eventComments.name = this.twitterUser.name;
                    this.eventComments.picture = this.twitterUser.picture;
                    this.eventComments.social_media_type = 2;
                    this.eventComments.social_media_id = this.twitterUser.id;
                    break;
                case userProfileComment:
                    this.eventComments.social_media_id = this.socialService.userProfileData.id;
                    this.eventComments.social_media_type = commentType;
                    break;
                default:
                    return;
            }

            this.commentLoader = true;
            this.service.save(this.eventComments).subscribe(res => {
                this.commentLoader = false;
                if (res.success) {
                    this.display.showToast("Comment successfully posted.");
                    console.log(res.data[0]);
                    this.comments.unshift(res.data[0]);
                    if (this.socialService.facebookUserData != null && commentType == 1) {
                        this.socialService.facebookUserData.comments.unshift(res.data[0]);
                    }
                    if (this.socialService.twitterUserData != null && commentType == 2) {
                        this.socialService.twitterUserData.comments.unshift(res.data[0]);
                    }
                    this.eventComments = new EventsComment();
                } else {
                    this.display.showToast('Server error occured');
                }
            });
        } else {
            this.display.showToast('Comment required.', 'priority-toast');
            return false;
        }
    }

    public onPictureClick(imageIndex: number, galleryPhotos: any): void {
        this.navCtrl.push(EventsGallerySlide, {
            imgIndex: imageIndex,
            glryPhotos: galleryPhotos,
            tabId: this.tabId
        })
    }

    public addPhotoClick(): void {
        this.setMapClickable(false);
        this.display.showImagePickerActionSheet(() => {
            this.takeFromCamera();
        }, () => {
            this.takeFromLibrary(2, null);//2 for gallery
        }, () => {
            this.onAddPhotoCancel();
        });
    }
    public takeFromCamera(): void {
        let options = {
            destinationType: Camera.DestinationType.FILE_URI,
            quality: 100,
        };
        Camera.getPicture(options).then((imageData) => {
            console.log("imageData", imageData);
            this.globalService.getFileFromUri(imageData).then((file) => {
                console.log("file", file);
                this.takeFromLibrary(1, file);//1 for camera
            })
        }, (err) => {
            console.log(err);
        });
    }

    private onAddPhotoCancel(): void {
        this.setMapClickable(true);
    }

    public takeFromLibrary(type: number, file: File) {
        let photoModal = this.modalCtrl.create(EventsPhotoAddModal, { tabId: this.tabId, itemId: this.itemId, type: type, file: file });
        photoModal.onDidDismiss(data => {
            this.service.getImagesList(this.itemId).subscribe(res => {
                if (res.success) {
                    this.images = res.data.images;
                }
            });
        });
        photoModal.present();
    }

    public onGetDirectionClick(lat: number, long: number) {
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

    private saveGoing(goingType: number): boolean {
        if (this.socialService.isUserProfileDataRetrieved) {
            goingType = userProfileGoing;
        }

        this.eventGoings.event_id = this.itemData.id;
        this.eventGoings.app_code = DataService.appCode;
        this.eventGoings.device_uuid = Device.uuid;
        switch (goingType) {
            case facebookGoing:
                this.eventGoings.name = this.facebookUser.name;
                this.eventGoings.picture = this.facebookUser.picture;
                this.eventGoings.social_media_type = 1;
                this.eventGoings.social_media_id = this.facebookUser.id;
                break;
            case twitterGoing:
                this.eventGoings.name = this.twitterUser.name;
                this.eventGoings.picture = this.twitterUser.picture;
                this.eventGoings.social_media_type = 2;
                this.eventGoings.social_media_id = this.twitterUser.id;
                break;
            case userProfileGoing:
                this.eventGoings.social_media_id = this.socialService.userProfileData.id;
                this.eventGoings.social_media_type = goingType;
                break;
            default:
                return;
        }
        this.loader = true;
        this.service.saveGoing(this.eventGoings).subscribe(res => {
            this.setMapClickable(true);
            this.loader = false;
            if (res.success) {
                this.display.showToast("Going successfully posted.");
                console.log(res.data[0]);
                this.goings.unshift(res.data[0]);
                this.eventGoings = new EventsGoing();
            } else {
                this.display.showToast('Server error occured');
            }
        });
    }

    public onSharingClick(): void {
        this.setMapClickable(false);
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
        this.setMapClickable(true);
        SocialSharing.shareViaFacebook("Check out this app : " + this.appStoreUrl).then(() => {
            console.log("Facebook share success");
        }).catch(() => {
            if (!this.platform.is("ios")) {
                this.display.showToast("Facebook app not found.");
            }
        });
    }



    public onShareByTwitter(): void {
        this.setMapClickable(true);
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
        this.setMapClickable(true);
        SocialSharing.shareViaSMS("Check out this app : " + this.appStoreUrl, null).then(() => {
            console.log("SMS share success");
        }).catch(() => {
            this.display.showToast("Could not open SMS sender.");
        });
    }

    public onShareByEmail(): void {
        this.setMapClickable(true);
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

    public onAddEventClick(): void {
        Calendar.hasReadWritePermission().then(() => {
            this.addEvent();
        }).catch(() => {
            Calendar.requestReadWritePermission().then(() => {
                this.addEvent();
            }).catch(() => {
                this.display.showToast("Could not add event");
            });
        });
    }

    public addEvent(): void {
        this.dateConvert();
        Calendar.createEvent(this.title, this.itemData.address_sec_1 + ', ' + this.itemData.address_sec_2, this.itemData.description, this.itemData.event_start_time, this.itemData.event_end_time).then(() => {
            console.log("Event Added Successfully");
            this.showEventPrompt();
        }).catch(err => {
            this.display.showToast("Could not add event.");
            console.log(err);
        });
    }

    private showEventPrompt(): void {
        this.setMapClickable(false);
        let alert: Alert = this.display.showAlert("This Event is added to your calender", "Event Added");
        alert.onDidDismiss(() => {
            this.setMapClickable(true);
        });
    }

    public dateConvert(): void {
        let msec: number = Date.parse(this.itemData.event_start_time);
        this.itemData.event_start_time = new Date(msec);
        let msecs: number = Date.parse(this.itemData.event_end_time);
        this.itemData.event_end_time = new Date(msecs);
    }

    private onShareCancel(): void {
        this.setMapClickable(true);
    }

    private setMapClickable(isClickable: boolean): void {
        if (this.map) {
            this.map.setClickable(isClickable);
        }
    }
}                         