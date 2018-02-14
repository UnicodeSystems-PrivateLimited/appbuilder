import { Component, Input } from '@angular/core';
import { SocialMedia, DisplayService, SocialService, GlobalService, DataService } from '../../providers';
import { Platform } from 'ionic-angular';
import { SocialSharing, Facebook } from 'ionic-native';

/*
  Generated class for the SocialAccount component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
    selector: 'social-account',
    templateUrl: 'social-account.html'
})
export class SocialAccount {

    public FACEBOOK: number = 1;
    public TWITTER: number = 2;

    @Input() type: number = this.FACEBOOK;
    @Input() tabId: number;

    public mediaName: string[] = [];
    public socialMedia: typeof SocialMedia = SocialMedia;
    public userType: string;
    public savingUser: boolean = false;
    public appStoreURL: string;

    constructor(
        public display: DisplayService,
        public service: SocialService,
        public platform: Platform,
        public globalService: GlobalService,
        public dataService: DataService,
    ) {
        this.mediaName[this.FACEBOOK] = "Facebook";
        this.mediaName[this.TWITTER] = "Twitter";

        if (platform.is("android")) {
            this.appStoreURL = this.globalService.initData.appData.google_play_store_url;
        } else if (platform.is("ios")) {
            this.appStoreURL = this.globalService.initData.appData.ios_app_store_url;
        }
    }

    public ngOnInit(): void {
        this.userType = this.type === this.TWITTER ? "twitterUser" : "facebookUser";
    }

    public onConnectClick(): void {
        this.savingUser = true;
        switch (this.type) {
            case this.FACEBOOK:
                SocialMedia.loginFacebook().then(user => {
                    console.log(user);
                    this.saveUser(user);
                }).catch(err => {
                    this.savingUser = false;
                    this.display.showToast(err);
                });
                break;

            case this.TWITTER:
                SocialMedia.loginTwitter().then(user => {
                    console.log(user);
                    this.saveUser(user);
                }).catch(err => {
                    this.savingUser = false;
                    this.display.showToast(err);
                });
                break;
        }
    }

    public onLogoutClick(showToast: boolean = true): void {
        switch (this.type) {
            case this.FACEBOOK:
                SocialMedia.logoutFacebook().then(() => {
                    SocialMedia.facebookUser = null;
                    this.service.facebookUserData = null;
                    if (showToast) {
                        this.display.showToast("Facebook successfully logged out");
                    }
                }).catch(err => {
                    if (showToast) {
                        this.display.showToast(err);
                    }
                });
                break;

            case this.TWITTER:
                SocialMedia.logoutTwitter().then(() => {
                    SocialMedia.twitterUser = null;
                    this.service.twitterUserData = null;
                    if (showToast) {
                        this.display.showToast("Twitter successfully logged out");
                    }
                }).catch(err => {
                    if (showToast) {
                        this.display.showToast(err);
                    }
                });
                break;
        }
    }

    private saveUser(user): void {
        let data = {
            social_media_id: user.id,
            social_media_type: this.type,
            name: user.name,
            picture: user.picture,
            app_code: DataService.appCode
        };
        this.display.showLoader();
        this.service.saveUser(data).subscribe(res => {
            this.display.hideLoader();
            this.savingUser = false;
            if (res.success) {
                this.getUserData(user.id);
                this.display.showToast(this.mediaName[this.type] + " successfully connected");
            } else {
                this.onLogoutClick(false);
                this.display.showToast("Error while saving user. Please login again.");
            }
        })
    }

    public getUserData(socialMediaId: string): void {
        this.service.getUserData(socialMediaId, this.type).subscribe(res => {
            if (res.success) {
                if (this.type === this.FACEBOOK) {
                    this.service.facebookUserData = res.data;
                }
                if (this.type === this.TWITTER) {
                    this.service.twitterUserData = res.data;
                }
            } else {
                this.display.showToast("Server error occured");
            }
        });
    }

    public onShareClick(): void {
        this.display.showShareActionSheet(
            () => this.onFacebookShare(),
            () => this.onTwitterShare(),
            () => this.onEmailShare(),
            () => this.onSMSShare()
        );
    }

    private onFacebookShare(): void {
        SocialSharing.shareViaFacebook("Check out this app: " + this.appStoreURL).then(() => {
            console.log("Facebook share success");
            this.updateSocialShareCount();
        }).catch(() => {
            if (!this.platform.is("ios")) {
                this.display.showToast("Facebook app not installed.");
            }
        });
    }

    private onTwitterShare(): void {
        SocialSharing.shareViaTwitter("Check out this app: " + this.appStoreURL).then(() => {
            console.log("Twitter share success");
            this.updateSocialShareCount();
        }).catch(() => {
            if (!this.platform.is("ios")) {
                this.display.showToast("Twitter app not installed.");
            }
        });
    }

    private onEmailShare(): void {
        SocialSharing.canShareViaEmail().then(() => {
            SocialSharing.shareViaEmail("Check out this app: " + this.appStoreURL, this.globalService.initData.appData.app_name, []).then(() => {
                console.log("Email share success");
                this.updateSocialShareCount();
            }).catch(() => {
                this.display.showToast("Could not open email sender.");
            });
        }).catch(() => {
            this.display.showToast("Email sending is not supported.");
        });
    }

    private onSMSShare(): void {
        SocialSharing.shareViaSMS("Check out this app: " + this.appStoreURL, null).then(() => {
            console.log("SMS share success");
            this.updateSocialShareCount();
        }).catch(() => {
            this.display.showToast("SMS sharing failed");
        });
    }

    public onUpdateStatusClick(): void {
        switch (this.type) {
            case this.FACEBOOK:
                Facebook.showDialog({ method: "share" }).then(res => {
                    console.log(res);
                }).catch(err => {
                    console.log(err);
                });
                break;
            case this.TWITTER:
                SocialSharing.shareViaTwitter("").then(() => {
                    console.log("Twitter post success");
                }).catch(err => {
                    console.log(err);
                    if (!this.platform.is("ios")) {
                        this.display.showToast("Twitter app not installed.");
                    }
                });
                break;
        }
    }
    public updateSocialShareCount(): void {
        let data = {
            socialMediaId: 0,
            socialMediaType: this.type,
            appCode: DataService.appCode
        };
        switch (this.type) {
            case this.FACEBOOK:
                data.socialMediaId = this.service.facebookUserData.user.social_media_id;
                break;
            case this.TWITTER:
                data.socialMediaId = this.service.twitterUserData.user.social_media_id;
                break;
        }
        this.service.updateSocialShareCount(data).subscribe((res) => {
            if (res.success) {
                this.service[this.userType + 'Data'].user.share_count = res['totalCount'];
            } else {
                this.display.showToast("Server error occured");
            }
        });

    }

}
