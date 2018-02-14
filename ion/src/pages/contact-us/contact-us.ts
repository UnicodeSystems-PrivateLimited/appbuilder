import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { ContactUsService, DisplayService } from '../../providers';
import { ContactLocation } from "../../interfaces/common-interfaces";
import { ContactUsDetail } from "../contact-us-detail/contact-us-detail";
import { GlobalService } from '../../providers';

/*
  Generated class for the ContactUs page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-contact-us',
    templateUrl: 'contact-us.html'
})
export class ContactUs {

    public tabId: number;
    public title: string;
    public bgImage: string;
    public loader: boolean = false;
    public locations: ContactLocation[] = [];
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(
        public navCtrl: NavController,
        public platform: Platform,
        public navParams: NavParams,
        public service: ContactUsService,
        public display: DisplayService,
        public globalService: GlobalService
    ) {
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.bgImage = navParams.get('bgImage');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.getLocationsList();
    }

    public getLocationsList(): void {
        this.loader = true;
        this.service.getLocations(this.tabId).subscribe(res => {
            this.loader = false;
            if (res.success) {
                this.locations = res.data;
                if (this.locations.length === 1) {
                    console.log('in1');
                    this.navCtrl.push(ContactUsDetail, {
                        locationId: this.locations[0].id,
                        title: this.title,
                        tab_nav_type: this.tab_nav_type,
                        subTabId: this.subTabId,
                        bgImage: this.bgImage
                    });
                }
            } else {
                this.display.showToast('Server error occured');
            }
        });
    }

    public onLocationClick(id: number) {
        this.navCtrl.push(ContactUsDetail, {
            locationId: id,
            title: this.title,
            bgImage: this.bgImage,
            tab_nav_type: this.tab_nav_type,
            subTabId: this.subTabId,
            tabId: this.tabId
        });
    }

}