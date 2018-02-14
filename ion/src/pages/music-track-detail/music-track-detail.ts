import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { GlobalService, MusicTabService, DisplayService, SocialMedia, SocialService, DataService } from '../../providers';
import { MusicComment } from "../../interfaces/common-interfaces";
import { Device } from 'ionic-native';
const facebookComment: number = 1;
const twitterComment: number = 2;
const userProfileComment: number = 3;
/*
  Generated class for the MusicTrackDetail page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-music-track-detail',
    templateUrl: 'music-track-detail.html'
})
export class MusicTrackDetail {

    public tabId: number;
    public bgImage: string;
    public title: string;
    public trackData: any;
    public tabHeaderImage: string = null;
    public tabs: string = "comments";
    public loader: boolean = false;
    public commentLoader: boolean = false;
    public comments: MusicComment[] = [];
    public facebookUser = null;
    public twitterUser = null;
    public musicComments: MusicComment = new MusicComment();
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public globalService: GlobalService,
        public service: MusicTabService,
        public display: DisplayService,
        public alertCtrl: AlertController,
        public socialService: SocialService,
    ) {
        this.tabId = this.navParams.get('tabId');
        this.title = this.navParams.get('title');
        this.bgImage = this.navParams.get('bgImage');
        this.trackData = this.navParams.get('trackData');
        this.tabHeaderImage = this.navParams.get('tabHeaderImage');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.getItemData();
    }

    public getItemData(): void {
        this.loader = true;
        this.service.getItemData(this.trackData.id).subscribe(res => {
            this.loader = false;
            if (res.success) {
                console.log("res");
                this.trackData = res.data.itemData;
                this.comments = res.data.comments;
            } else {
                console.log('Server error occured');
            }
        });
    }

    ionViewDidLoad() {
        console.log('Hello MusicTrackDetail Page');
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

            this.musicComments.description = data.comment;
            this.musicComments.content_id = this.trackData.id;
            this.musicComments.app_code = DataService.appCode;
            this.musicComments.device_uuid = Device.uuid;
            switch (commentType) {
                case facebookComment:
                    this.musicComments.name = this.facebookUser.name;
                    this.musicComments.picture = this.facebookUser.picture;
                    this.musicComments.social_media_id = this.facebookUser.id;
                    this.musicComments.social_media_type = 1;
                    break;
                case twitterComment:
                    this.musicComments.name = this.twitterUser.name;
                    this.musicComments.picture = this.twitterUser.picture;
                    this.musicComments.social_media_id = this.twitterUser.id;
                    this.musicComments.social_media_type = 2;
                    break;
                case userProfileComment:
                    this.musicComments.social_media_id = this.socialService.userProfileData.id;
                    this.musicComments.social_media_type = commentType;
                    break;
                default:
                    return;
            }

            this.commentLoader = true;
            this.service.save(this.musicComments).subscribe(res => {
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
                    this.musicComments = new MusicComment();
                } else {
                    this.display.showToast('Server error occured');
                }
            });
        } else {
            this.display.showToast('Comment required.', 'priority-toast');
            return false;
        }
    }
}
