import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { EmailFormsTabService, DisplayService } from '../../providers';
import { EmailFormsTabItem } from "../../interfaces/common-interfaces";
import { EmailFormDetail } from "../email-form-detail/email-form-detail";
import { GlobalService } from '../../providers';

/*
  Generated class for the EmailFormsTab page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-email-forms-tab',
    templateUrl: 'email-forms-tab.html'
})
export class EmailFormsTab {
    public tabId: number;
    public title: string;
    public bgImage: string;
    public emailForms: EmailFormsTabItem[] = [];
    public loader: boolean = false;
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(
        public navCtrl: NavController,
        public platform: Platform,
        public navParams: NavParams,
        public service: EmailFormsTabService,
        public display: DisplayService,
        public globalService: GlobalService,

    ) {
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.getEmailFormsList();
    }

    public getEmailFormsList(): void {
        this.loader = true;
        this.service.getEmailFormsList(this.tabId).subscribe(res => {
            this.loader = false;
            if (res.success) {
                this.emailForms = res.data;
                if (this.emailForms.length === 1) {
                    this.navCtrl.push(EmailFormDetail, {
                        formId: this.emailForms[0].id,
                        title: this.title,
                        tab_nav_type: this.tab_nav_type,
                        subTabId: this.subTabId
                    });
                }
            } else {
                this.display.showToast('Server error occured');
            }
        });
    }

    public onEmailFormClick(id: number) {
        this.navCtrl.push(EmailFormDetail, {
            formId: id,
            title: this.title,
            bgImage: this.bgImage,
            tab_nav_type: this.tab_nav_type,
            subTabId: this.subTabId,
            tabId: this.tabId
        });
    }

}
