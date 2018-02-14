import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { ContentTabTwoService, DisplayService, SocialMedia, SocialService, DataService } from '../../providers';
import { ContentTabTwoItem, ContentComment } from "../../interfaces/common-interfaces";
import { GlobalService } from '../../providers';
import { Device } from "ionic-native";

const facebookComment: number = 1;
const twitterComment: number = 2;
const userProfileComment: number = 3;

/*
  Generated class for the ContentTabTwoDesc page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-content-tab-two-desc',
    templateUrl: 'content-tab-two-desc.html'
})
export class ContentTabTwoDesc {

    public itemId: number;
    public tabId: number;
    public title: string;
    public itemData: ContentTabTwoItem = new ContentTabTwoItem();
    public comments: ContentComment[] = [];
    public tabs: string = 'description'; // Default open tab.
    public facebookUser = null;
    public twitterUser = null;
    public contentComments: ContentComment = new ContentComment();
    public loader: boolean = false;
    public commentLoader: boolean = false;
    public background_color: any = "#fafafa";
    public text_color: any = "#000";

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public service: ContentTabTwoService,
        public display: DisplayService,
        public alertCtrl: AlertController,
        public globalService: GlobalService,
        public socialService: SocialService
    ) {
        this.itemId = navParams.get('itemId');
        this.title = navParams.get('title');
        this.tabId = navParams.get('tabId');
        this.getItemData();
    }

    public getItemData(): void {
        this.loader = true;
        this.service.getItemData(this.itemId).subscribe(res => {
            this.loader = false;
            if (res.success) {
                if (res.data.itemData) {
                    this.itemData = res.data.itemData;
                    if (res.data.itemData.use_global_colors == 0) {
                        this.background_color = res.data.itemData.background_color;
                        this.text_color = res.data.itemData.text_color;
                    } else {
                        this.background_color = this.globalService.initData.globalStyleSettings.features.background_color;
                        this.text_color = this.globalService.initData.globalStyleSettings.features.button_text;
                    }
                }
                this.comments = res.data.comments;
            }
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

            this.contentComments.description = data.comment;
            this.contentComments.content_id = this.itemData.id;
            this.contentComments.app_code = DataService.appCode;
            this.contentComments.device_uuid = Device.uuid;

            switch (commentType) {
                case facebookComment:
                    this.contentComments.name = this.facebookUser.name;
                    this.contentComments.picture = this.facebookUser.picture;
                    this.contentComments.social_media_id = this.facebookUser.id;
                    this.contentComments.social_media_type = 1;
                    break;
                case twitterComment:
                    this.contentComments.name = this.twitterUser.name;
                    this.contentComments.picture = this.twitterUser.picture;
                    this.contentComments.social_media_id = this.twitterUser.id;
                    this.contentComments.social_media_type = 2;
                    break;
                case userProfileComment:
                    this.contentComments.social_media_id = this.socialService.userProfileData.id;
                    this.contentComments.social_media_type = commentType;
                    break;
                default:
                    return;
            }

            this.commentLoader = true;
            this.service.save(this.contentComments).subscribe(res => {
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
                    this.contentComments = new ContentComment();
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
