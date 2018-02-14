import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Platform, ViewController, ModalController } from 'ionic-angular';
import { SocialMedia, DisplayService, SocialService, GlobalService, DataService } from '../../providers';
import { Input } from '@angular/core';
import { Printer, PrintOptions, ThemeableBrowser, SafariViewController } from 'ionic-native';
import { SettingsModalDesc } from '../settings-modal-desc/settings-modal-desc';
import { SettingsUserProfileModal } from '../settings-user-profile-modal/settings-user-profile-modal';

declare var cordova: any;

/*
  Generated class for the SettingsModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-settings-modal',
    templateUrl: 'settings-modal.html'
})
export class SettingsModal {
    public savingUser: boolean = false;
    public fbLogin: boolean = false;
    public twitterLogin: boolean = false;
    public FACEBOOK: number = 1;
    public TWITTER: number = 2;
    public mediaName: string[] = [];
    public socialMedia: typeof SocialMedia = SocialMedia;
    public userType: string;
    public fbUser: string;
    public fbImg: string;
    public twitterUser: string;
    public twitterImg: string;
    public profileName: string;
    public type: number = this.FACEBOOK;
    constructor(public navCtrl: NavController,
        public viewCtrl: ViewController,
        public display: DisplayService,
        public service: SocialService,
        public platform: Platform,
        public globalService: GlobalService,
        public dataService: DataService,
        public modalCtrl: ModalController
    ) {
        this.mediaName[this.FACEBOOK] = "Facebook";
        this.mediaName[this.TWITTER] = "Twitter";

        platform.ready().then(() => {
            this.initSocialMediaUsers();
        });

    }

    public ngOnInit(): void {
        this.userType = this.type === this.TWITTER ? "twitterUser" : "facebookUser";
    }

    public dismiss() {
        this.viewCtrl.dismiss();
    }

    public onConnectClick(type: number): void {
        this.savingUser = true;
        this.type = type;
        switch (this.type) {
            case this.FACEBOOK:
                SocialMedia.loginFacebook().then(user => {
                    console.log(user);
                    if (user) {
                        this.fbLogin = true;
                        this.fbUser = user.name;
                        this.fbImg = user.picture;
                    }
                    this.saveUser(user);
                }).catch(err => {
                    this.savingUser = false;
                    this.display.showToast(err);
                });
                break;

            case this.TWITTER:
                SocialMedia.loginTwitter().then(user => {
                    console.log(user);
                    if (user) {
                        this.twitterLogin = true;
                        this.twitterUser = user.name;
                        this.twitterImg = user.picture;
                    }
                    this.saveUser(user);
                }).catch(err => {
                    this.savingUser = false;
                    this.display.showToast(err);
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

    public onLogoutClick(showToast: boolean = true): void {
        switch (this.type) {
            case this.FACEBOOK:
                SocialMedia.logoutFacebook().then(() => {
                    SocialMedia.facebookUser = null;
                    this.service.facebookUserData = null;
                    this.fbLogin = false;
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
                    this.twitterLogin = false;
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

    public onPrivacyClick(): void {
        this.openThemeableBrowser();
    }

    private openThemeableBrowser(): void {
        let options: any = {
            title: {
                color: this.globalService.completeHexCode(this.globalService.initData.globalStyleSettings.header.text_color),
                showPageTitle: true,
                staticText: 'Privacy Policy',
                background_color: this.globalService.completeHexCode(this.globalService.initData.globalStyleSettings.header.background_color),
            },
            toolbar: {
                height: 56,
                color: this.globalService.completeHexCode(this.globalService.initData.globalStyleSettings.header.background_color),
            },
            closeButton: {
                wwwImage: 'assets/icon/back-arrow-25.png',
                imagePressed: 'close_pressed',
                align: 'left',
                event: 'closePressed'
            },
            transitionstyle: 'crossdissolve'
        };
        options.statusbar = { color: options.title.background_color };
        let isLoaderActive: boolean = false;
        cordova.ThemeableBrowser.open(this.globalService.appScreenConfigData.privacy_policy_url || (DataService.apiBaseURL + "privacy-policy"), '_blank', options)
            .addEventListener(cordova.ThemeableBrowser.EVT_ERR, function (e) {
                console.error(e.message);
            }).addEventListener(cordova.ThemeableBrowser.EVT_WRN, function (e) {
                console.log(e.message);
            }).addEventListener('loadstart', () => {
                if (!isLoaderActive && this.platform.is("android")) {
                    this.display.showNativeLoaderForBrowser();
                    isLoaderActive = true;
                }
            }).addEventListener('loadstop', () => {
                this.display.hideNativeLoader();
                isLoaderActive = false;
            }).addEventListener('loaderror', () => {
                this.display.hideNativeLoader();
                isLoaderActive = false;
            });
    }

    public onTermsClick(): void {
        let options: any = {
            title: {
                color: this.globalService.completeHexCode(this.globalService.initData.globalStyleSettings.header.text_color),
                showPageTitle: true,
                staticText: 'Terms',
                background_color: this.globalService.completeHexCode(this.globalService.initData.globalStyleSettings.header.background_color),
            },
            toolbar: {
                height: 56,
                color: this.globalService.completeHexCode(this.globalService.initData.globalStyleSettings.header.background_color),
            },
            closeButton: {
                wwwImage: 'assets/icon/back-arrow-25.png',
                imagePressed: 'close_pressed',
                align: 'left',
                event: 'closePressed'
            },
            transitionstyle: 'crossdissolve'
        };
        options.statusbar = { color: options.title.background_color };
        let isLoaderActive: boolean = false;
        cordova.ThemeableBrowser.open(this.globalService.appScreenConfigData.terms_of_service_url, '_blank', options)
            .addEventListener(cordova.ThemeableBrowser.EVT_ERR, function (e) {
                console.error(e.message);
            }).addEventListener(cordova.ThemeableBrowser.EVT_WRN, function (e) {
                console.log(e.message);
            }).addEventListener('loadstart', () => {
                if (!isLoaderActive && this.platform.is("android")) {
                    this.display.showNativeLoaderForBrowser();
                    isLoaderActive = true;
                }
            }).addEventListener('loadstop', () => {
                this.display.hideNativeLoader();
                isLoaderActive = false;
            }).addEventListener('loaderror', () => {
                this.display.hideNativeLoader();
                isLoaderActive = false;
            });
    }

    public onUnlinkClick(type: number): void {
        let modal = this.modalCtrl.create(SettingsModalDesc, { type: type, name: (type === this.FACEBOOK ? this.fbUser : this.twitterUser), image: (type === this.FACEBOOK ? this.fbImg : this.twitterImg) });
        modal.present();
        modal.onDidDismiss((data) => {
            let loginType = data;
            if (loginType == 1) {
                this.fbLogin = false;
            }
            if (loginType == 2) {
                this.twitterLogin = false;
            }
        });
    }

    public onProfileClick(): void {
        let modal = this.modalCtrl.create(SettingsUserProfileModal);
        modal.present();
    }

    public onSocialMediaItemClick(type: number): void {
        if ((type === this.FACEBOOK && this.fbLogin) || (type === this.TWITTER && this.twitterLogin)) {
            this.onUnlinkClick(type);
        } else {
            this.onConnectClick(type);
        }
    }

    private initSocialMediaUsers(): void {
        this.initFacebookUser();
        this.initTwitterUser();
    }

    private initFacebookUser(): void {
        SocialMedia.getStoredFacebookUser().then(user => {
            this.fbLogin = true;
            this.fbUser = user.name;
            this.fbImg = user.picture;
        }).catch(() => { });
    }

    private initTwitterUser(): void {
        SocialMedia.getStoredTwitterUser().then(user => {
            this.twitterLogin = true;
            this.twitterUser = user.name;
            this.twitterImg = user.picture;
        }).catch(() => { });
    }

}
