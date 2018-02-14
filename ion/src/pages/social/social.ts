import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { DisplayService, GlobalService, SocialMedia, SocialService } from '../../providers';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'page-social',
    templateUrl: 'social.html'
})
export class Social {

    public title: string;
    public tabId: number;
    public bgImage: number;
    public tabs: string = "facebook"; // Default open tab.
    public loader: boolean = false;
    public tab_nav_type: string = null;
    public subTabId: number = null;

    public FACEBOOK: number = 1;
    public TWITTER: number = 2;

    constructor(
        public navCtrl: NavController,
        public display: DisplayService,
        public navParams: NavParams,
        public globalService: GlobalService,
        public service: SocialService,
        public platform: Platform
    ) {
        this.tabId = navParams.get("tabId");
        this.title = navParams.get("title");
        this.bgImage = navParams.get("bgImage");
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.initUsers();
    }

    private initUsers(): void {
        this.initFacebookUser().then(res => {
            this.initTwitterUser().then(res => {
                if (SocialMedia.facebookUser && !this.service.facebookUserData) {
                    this.getUserData(SocialMedia.facebookUser, this.FACEBOOK);
                }
                if (SocialMedia.twitterUser && !this.service.twitterUserData) {
                    this.getUserData(SocialMedia.twitterUser, this.TWITTER);
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
                resolve(false);
            });
        });
    }

    public getUserData(user: any, userType: number): void {
        this.loader = true;
        this.service.getUserData(user.id, userType).subscribe(res => {
            this.loader = false;
            if (res.success) {
                if (userType === this.FACEBOOK) {
                    this.service.facebookUserData = res.data;
                }
                if (userType === this.TWITTER) {
                    this.service.twitterUserData = res.data;
                }
            } else {
                this.display.showToast("Server error occured");
            }
        });
    }

}
