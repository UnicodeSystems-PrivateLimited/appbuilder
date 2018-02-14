import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService, DisplayService } from '../../providers';
import { ModalController, Platform, ViewController } from 'ionic-angular';
import { SocialSharing } from 'ionic-native';

/*
  Generated class for the TellFriend page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-tell-friend',
    templateUrl: 'tell-friend.html'
})
export class TellFriend {
    public tabId: number;
    public title: string;
    public bgImage: string;
    public appStoreUrl: string;
    public iosAppStoreUrl: string;
    public androidAppStoreUrl: string;
    public webUrl: string;
    public shareMsg: string;
    public tab_nav_type: string = null;
    public subTabId: number = null;


    constructor(public navCtrl: NavController,
        public globalService: GlobalService,
        public navParams: NavParams,
        public platform: Platform,
        public display: DisplayService,


    ) {
        if (platform.is("android")) {
            this.appStoreUrl = this.globalService.initData.appData.google_play_store_url;
        }
        else if (platform.is("ios")) {
            this.appStoreUrl = this.globalService.initData.appData.ios_app_store_url;
        }

        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tabId = navParams.get('tabId');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.iosAppStoreUrl = this.globalService.initData.appData.ios_app_store_url;
        this.androidAppStoreUrl = this.globalService.initData.appData.google_play_store_url;
        this.webUrl = this.globalService.initData.appData.html5_mobile_website_url;
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.shareMsg = this.globalService.initData.appScreenConfigData ? this.globalService.initData.appScreenConfigData.share_default_msg : null;
        if (this.shareMsg) {
            this.shareMsg = this.shareMsg.replace('[Android]', this.androidAppStoreUrl);
            this.shareMsg = this.shareMsg.replace('[iOS]', this.iosAppStoreUrl);
            this.shareMsg = this.shareMsg.replace('[HTML5]', this.webUrl);
        } else {
            this.shareMsg = "";
        }
    }

    ionViewDidLoad() {
        console.log('Hello TellFriend Page');
    }

    public onShareClick(): void {
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
        SocialSharing.shareViaFacebook(this.shareMsg).then(() => {
            console.log("Facebook share success");
        }).catch(() => {
            if (!this.platform.is("ios")) {
                this.display.showToast("Facebook app not found.");
            }
        });
    }



    public onShareByTwitter(): void {
        SocialSharing.shareViaTwitter(this.shareMsg).then(() => {
            console.log("Twitter share success");
        }).catch(err => {
            if (!this.platform.is("ios")) {
                this.display.showToast("Twitter app not found.");
            }
            console.log(err);
        });
    }

    private onShareBySms(): void {
        SocialSharing.shareViaSMS(this.shareMsg, null).then(() => {
            console.log("SMS share success");
        }).catch(() => {
            this.display.showToast("Could not open SMS sender.");
        });
    }

    public onShareByEmail(): void {
        SocialSharing.canShareViaEmail().then(() => {
            SocialSharing.shareViaEmail(this.shareMsg, this.title, []).then(() => {
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
}
