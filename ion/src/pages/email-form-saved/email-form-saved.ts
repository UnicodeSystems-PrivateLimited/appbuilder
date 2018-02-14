import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { EmailFormsTabService, DisplayService } from '../../providers';
import { GlobalService } from '../../providers';
/*
  Generated class for the EmailFormSaved page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-email-form-saved',
    templateUrl: 'email-form-saved.html'
})
export class EmailFormSaved {
    public formId: number;
    public tabId: number;
    public title: string;
    public message: string;
    public backButton: string;
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        public service: EmailFormsTabService,
        public display: DisplayService,
        public globalService: GlobalService,
    ) {
        this.formId = navParams.get('formId');
        this.title = navParams.get('title');
        this.message = navParams.get('message');
        this.backButton = navParams.get('backButton');
        this.tabId = navParams.get('tabId');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');

    }

    public onBackButtonClick() {
        // console.log('backed');
        this.navCtrl.pop();
    }

}
