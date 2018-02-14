import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { DisplayService, SocialMedia, FanWallTabService, DataService, SocialService } from '../../providers';
import { FanWallItem } from "../../interfaces/common-interfaces";
import { GlobalService } from '../../providers';
import { Device } from 'ionic-native';

const facebookComment: number = 1;
const twitterComment: number = 2;
const userProfileComment: number = 3;

@Component({
    selector: 'page-fan-wall-replies',
    templateUrl: 'fan-wall-replies.html'
})
export class FanWallReplies {

    public tabId: number;
    public parent: FanWallItem;
    public facebookUser = null;
    public twitterUser = null;
    public replies: FanWallItem[] = [];
    public reply: FanWallItem = new FanWallItem();
    public item: FanWallItem = new FanWallItem();
    public loader: boolean = false;
    public commentLoader: boolean = false;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public display: DisplayService,
        public alertCtrl: AlertController,
        public service: FanWallTabService,
        public globalService: GlobalService,
        public socialService: SocialService
    ) {
        this.tabId = navParams.get('tabId');
        this.parent = navParams.get('parent');
        this.reply.tab_id = this.tabId;
        this.reply.parent_id = this.parent.id;
        this.getReplies();
    }

    public getReplies(): void {
        this.loader = true;
        this.service.getReplies(this.parent.id).subscribe(res => {
            this.loader = false;
            if (res.success) {

                this.replies = res.data;
            } else {
                this.display.showToast("Could not fetch data");
            }
        });
    }

    public onFacebookCommentClick(): void {
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

    private saveComment(data, commentType: number): void {
        if (data.comment || data.comment.length > 0) {
            if (this.socialService.isUserProfileDataRetrieved) {
                commentType = userProfileComment;
            }

            this.reply.description = data.comment;
            this.reply.app_code = DataService.appCode;
            this.reply.device_uuid = Device.uuid;

            switch (commentType) {
                case facebookComment:
                    this.reply.name = this.facebookUser.name;
                    this.reply.picture = this.facebookUser.picture;
                    this.reply.social_media_id = this.facebookUser.id;
                    this.reply.social_media_type = 1;
                    break;
                case twitterComment:
                    this.reply.name = this.twitterUser.name;
                    this.reply.picture = this.twitterUser.picture;
                    this.reply.social_media_id = this.twitterUser.id;
                    this.reply.social_media_type = 2;
                    break;
                case userProfileComment:
                    this.reply.social_media_id = this.socialService.userProfileData.id;
                    this.reply.social_media_type = commentType;
                    break;
                default:
                    return;
            }

            this.commentLoader = true;
            this.service.save(this.reply).subscribe(res => {
                this.commentLoader = false;
                if (res.success) {
                    this.display.showToast("Reply successfully posted");
                    this.replies.unshift(res.data);
                    this.globalService.actedComment.id = this.reply.parent_id;
                    this.globalService.actedComment.no_of_replies = this.replies.length;
                    this.globalService.fanWallReplyAdded = true;
                    this.reply = new FanWallItem();
                    this.reply.tab_id = this.tabId;
                    this.reply.parent_id = this.parent.id;
                } else {
                    this.display.showToast("Unknown error occured.");
                }
            });
        }
    }

    public onTwitterCommentClick(): void {
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

}
