import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Platform, ViewController, ModalController, NavParams } from 'ionic-angular';
import { SocialMedia, DisplayService, SocialService, GlobalService, DataService } from '../../providers';
import { Input } from '@angular/core';
import { Printer, PrintOptions, ThemeableBrowser, SafariViewController } from 'ionic-native';

/*
  Generated class for the SettingsModalDesc page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-settings-modal-desc',
  templateUrl: 'settings-modal-desc.html'
})
export class SettingsModalDesc {
  public type: any;
  public FACEBOOK: number = 1;
  public TWITTER: number = 2;
  public name: string;
  public image: string;
  constructor(public navCtrl: NavController,
    public viewCtrl: ViewController,
    public display: DisplayService,
    public service: SocialService,
    public platform: Platform,
    public globalService: GlobalService,
    public dataService: DataService,
    public modalCtrl: ModalController,
    public navParams: NavParams,
  ) {
    this.type = navParams.get('type');
    this.name = navParams.get('name');
    this.image = navParams.get('image');
    console.log(this.type);
  }

  public dismiss() {
    this.viewCtrl.dismiss(0);
  }

  public onLogoutClick(showToast: boolean = true): void {
    switch (this.type) {
      case this.FACEBOOK:
        SocialMedia.logoutFacebook().then(() => {
          SocialMedia.facebookUser = null;
          this.service.facebookUserData = null;
          this.display.showToast("Facebook successfully logged out");
          this.viewCtrl.dismiss(this.type);
        }).catch(err => {
          this.display.showToast(err);
        });
        break;

      case this.TWITTER:
        SocialMedia.logoutTwitter().then(() => {
          SocialMedia.twitterUser = null;
          this.service.twitterUserData = null;
          this.display.showToast("Twitter successfully logged out");
          this.viewCtrl.dismiss(this.type);
        }).catch(err => {
          this.display.showToast(err);
        });
        break;
    }
  }

}
