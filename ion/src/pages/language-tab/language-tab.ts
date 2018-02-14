import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService, LanguageTabService, DisplayService } from '../../providers';
import { NativeStorage, Splashscreen } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';
/*
  Generated class for the LanguageTab page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-language-tab',
  templateUrl: 'language-tab.html'
})
export class LanguageTab {

  public tabId: number;
  public bgImage: string;
  public title: string;
  public loader: boolean = false;
  public languages: any = [];
  public tab_nav_type: string = null;
  public subTabId: number = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalService: GlobalService,
    public displayService: DisplayService,
    public service: LanguageTabService,
    public translate: TranslateService
  ) {
    this.tabId = this.navParams.get('tabId');
    this.title = this.navParams.get('title');
    this.bgImage = this.navParams.get('bgImage');
    this.tab_nav_type = navParams.get('tab_nav_type');
    this.subTabId = navParams.get('subTabId');
    this.globalService.checkTabAddedInEmailMarketting(this.tabId);
    this.getInitData();
  }

  ionViewDidLoad() {
    console.log('Hello LanguageTab Page');
  }

  public getInitData(): void {
    this.loader = true;
    this.service.getInitData(this.tabId).subscribe((res) => {
      this.loader = false;
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

  public setAppLanguage(language: any): void {
    NativeStorage.setItem("language", language.code).then(() => {
      this.globalService.currentLanguage = language.code;
      this.translate.use(language.code);
      this.displayService.showToast('App Language Changed Successfully.');
      console.log("language stored in native storage.");
    }).catch(err => {
      this.displayService.showToast('Unable To  Change Language!.');
      console.log("language data native storage failed", err);
    });

  }

}
