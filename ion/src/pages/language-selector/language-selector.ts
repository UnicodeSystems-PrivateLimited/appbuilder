import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';
import { LanguageTabService } from '../../providers';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { NativeStorage, Splashscreen } from 'ionic-native';
import { Storage } from '@ionic/storage';

/*
  Generated class for the LanguageSelector page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-language-selector',
  templateUrl: 'language-selector.html'
})
export class LanguageSelector {

  public tabId: number = null;
  public languages: any = null;
  public selectedLanguage: string = 'en';
  constructor(
    public params: NavParams,
    public viewCtrl: ViewController,
    public service: LanguageTabService,
    public translate: TranslateService,
    public storage: Storage
  ) {
    this.tabId = params.get('tabId');
    this.getInitData();
  }

  ionViewDidLoad() {
    console.log('Hello LanguageSelector Page');
  }

  public getInitData(): void {
    this.service.getInitData(this.tabId).subscribe((res) => {
      if (res.success) {
        console.log("res", res);
        if (res['data']['languageData']) {
          this.languages = res['data']['languageData']['content'];
        }
      } else {
        console.log('Server error occured');
      }
    });
  }

  public dismiss(): void {
    let data = { 'foo': 'bar' };
    this.viewCtrl.dismiss(data);
  }

  public startApp(buttonClickType: string): void {
    this.storage.set('hasLanguageSelected', 'true');
    NativeStorage.setItem("language", this.selectedLanguage).then(() => {
      this.viewCtrl.dismiss({ language: this.selectedLanguage });
      console.log("language stored in native storage.");
    }).catch(err => {
      this.viewCtrl.dismiss({ language: this.selectedLanguage });
      console.log("language data native storage failed", err);
    });
  }

}
