import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { DisplayService, SocialMedia, FanWallTabService, SocialService } from '../../providers';
import { FanWallItem } from "../../interfaces/common-interfaces";
import { FanWallReplies } from "../../pages/fan-wall-replies/fan-wall-replies";
import { GlobalService, DataService } from '../../providers';
import { Device } from 'ionic-native';

const facebookComment: number = 1;
const twitterComment: number = 2;
const userProfileComment: number = 3;

@Component({
    selector: 'page-fan-wall-tab',
    templateUrl: 'fan-wall-tab.html'
})
export class FanWallTab {

    public tabId: number;
    public title: string;
    public bgImage: string;
    public facebookUser = null;
    public twitterUser = null;
    public items: FanWallItem[] = [];
    public itemData: FanWallItem = new FanWallItem();
    public loader: boolean = false;
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public display: DisplayService,
        public alertCtrl: AlertController,
        public service: FanWallTabService,
        public globalService: GlobalService,
        public dataService: DataService,
        public socialService: SocialService
    ) {
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.itemData.tab_id = this.tabId;
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.getItemList();
    }

    public getItemList(): void {
        this.loader = true;
        this.service.getList(this.tabId).subscribe(res => {
            this.loader = false;
            if (res.success) {
                this.items = res.data;
            } else {
                this.display.showToast("Could not fetch data");

            }
        })
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

            this.itemData.description = data.comment;
            this.itemData.app_code = DataService.appCode;
            this.itemData.device_uuid = Device.uuid;
            switch (commentType) {
                case facebookComment:
                    this.itemData.name = this.facebookUser.name;
                    this.itemData.picture = this.facebookUser.picture;
                    this.itemData.social_media_id = this.facebookUser.id;
                    this.itemData.social_media_type = 1;
                    break;
                case twitterComment:
                    this.itemData.name = this.twitterUser.name;
                    this.itemData.picture = this.twitterUser.picture;
                    this.itemData.social_media_id = this.twitterUser.id;
                    this.itemData.social_media_type = 2;
                    break;
                case userProfileComment:
                    this.itemData.social_media_id = this.socialService.userProfileData.id;
                    this.itemData.social_media_type = commentType;
                    break;
                default:
                    return;
            }

            this.loader = true;
            this.service.save(this.itemData).subscribe(res => {
                this.loader = false;
                if (res.success) {
                    this.display.showToast("Comment successfully posted");
                    this.items.unshift(res.data);
                    this.itemData = new FanWallItem();
                    this.itemData.tab_id = this.tabId;
                } else {
                    this.display.showToast("Unknown error occured.");
                }
            });
        }
    }

    public onReplyClick(item: FanWallItem): void {
        console.log("item", item);
        this.navCtrl.push(FanWallReplies, {
            parent: item,
            tabId: this.tabId
        });
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

    public ionViewDidEnter(): void {
        if (this.globalService.fanWallReplyAdded) {
            console.log("added");
            console.log("this.globalService.actedComment", this.globalService.actedComment);
            this.dataService.getByID(this.items, this.globalService.actedComment.id, (data, index) => {
                console.log("this.globalService.actedComment", this.globalService.actedComment);
                console.log("this.globalService.actedComment.no_of_replies", this.globalService.actedComment.no_of_replies);
                data.no_of_replies = this.globalService.actedComment.no_of_replies;
            });
        }
    }

    public ionViewWillLeave(): void {
        this.globalService.fanWallReplyAdded = false;
    }
}
