import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { EventsTabService, DisplayService } from '../../providers';
import { EmailFormsTabItem } from "../../interfaces/common-interfaces";
import { GlobalService } from '../../providers';
import { EventsTabDesc } from "../events-tab-desc/events-tab-desc";
import moment from 'moment';

/*
  Generated class for the EventsTab page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-events-tab',
    templateUrl: 'events-tab.html'
})
export class EventsTab {
    public tabId: number;
    public title: string;
    public bgImage: string;
    events: string = "upcoming";
    public eventSearch: string;
    public searchField: number = 1;;
    public upcomingEvents = [];
    public pastEvents = [];
    public loader: boolean = false;
    public state: boolean = false;
    public searchIcon: boolean = true;
    public lDate = new Date();
    public localDate: any;
    public localYear: any
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public service: EventsTabService,
        public display: DisplayService,
        public globalService: GlobalService
    ) {
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.getInitData();
        this.localDate = moment(this.lDate).format('YYYY-MM-DD kk:mm:ss');
        this.localYear = moment(this.lDate).format('YYYY-MM-DD');
    }

    ionViewDidLoad() {
        console.log('Hello EventsTab Page');
    }

    public getInitData(): void {
        this.loader = true;
        this.service.getEventList(this.tabId).subscribe(res => {
            if (res.success) {
                this.loader = false;
                for (let section in res.data.upcomingEvent) {
                    this.upcomingEvents.push(res.data.upcomingEvent[section]);
                }
                for (let item in res.data.pastEvent) {
                    this.pastEvents.push(res.data.pastEvent[item]);
                }
            } else {
                this.display.showToast("Could not fetch data");
            }
        });
    }

    public onItemClick(id: number, name: string): void {
        this.navCtrl.push(EventsTabDesc, {
            itemId: id,
            title: name,
            bgImage: this.bgImage,
            tabId: this.tabId,
            event_type: this.events
        });
    }

    public search(): void {
        this.state = true;
        this.searchIcon = false;
    }

    public onCancel(): void {
        this.state = false;
        this.searchIcon = true;
    }
}
