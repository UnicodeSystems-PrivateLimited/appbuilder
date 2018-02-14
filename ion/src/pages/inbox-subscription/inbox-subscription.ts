import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { InboxTabService, DisplayService, GlobalService, DataService } from '../../providers';
import { LaunchNavigator, SQLite, NativeStorage, Device } from "ionic-native";
import { SaveSubscriptionData } from "../../interfaces/common-interfaces";
import moment from 'moment';


/*
  Generated class for the InboxSubscription page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-inbox-subscription',
  templateUrl: 'inbox-subscription.html'
})
export class InboxSubscription {
  public tabId: number;
  public appId: number;
  public maxId: number;
  public title: string;
  public bgImage: string;
  public db: SQLite;
  public state: number[] = [];
  public subsList = [];
  public itemList = [];
  public subscriberStatusList = [];
  public id: number;
  public deviceUuid: string = null;
  public saveSubscriptionData: SaveSubscriptionData = new SaveSubscriptionData();
  public tab_nav_type: string = null;
  public subTabId: number = null;

  constructor(public navCtrl: NavController,
    public globalService: GlobalService,
    public service: InboxTabService,
    public navParams: NavParams,
    public dataService: DataService,
    public display: DisplayService,
    public platform: Platform,

  ) {

    this.tabId = navParams.get('tabId');
    this.appId = navParams.get('appId');
    this.title = navParams.get('title');
    this.bgImage = navParams.get('bgImage');
    this.tab_nav_type = navParams.get('tab_nav_type');
    this.subTabId = navParams.get('subTabId');
    this.deviceUuid = Device.uuid;
    this.getInitData();
  }



  public getInitData(): void {
    let subscriberStatus = []
    this.service.getSubscriptionInitData(this.appId, this.deviceUuid).subscribe(res => {
      if (res.success) {

        this.subsList = res.data.subscriptionList;
        subscriberStatus = res.data.subscriberStatusList;
        for (let subs of subscriberStatus) {
          this.subscriberStatusList[subs.subscription_id] = subs.is_subscribed;
        }

        for (let subList of this.subsList) {
          if (typeof this.subscriberStatusList[subList.id] === 'undefined') {
            // does not exist
            this.state[subList.id] = 1;
          }
          else {
            // does exist
            this.state[subList.id] = this.subscriberStatusList[subList.id];
          }
        }
      } else {
        console.log('Server error occured');
      }
    });
  }

  public onSaveSubscription(): void {
    this.saveSubscriptionData.appId = this.appId;
    this.saveSubscriptionData.deviceUuid = this.deviceUuid;
    this.saveSubscriptionData.subscriptionState = this.state;
    this.service.onSaveSubscription(this.saveSubscriptionData).subscribe(res => {
      if (res.success) {
        this.display.showToast(res.message);
        this.saveSubscriptionData = new SaveSubscriptionData();
      } else {
        this.display.showToast(res.message);
      }
    });
  }

  public onStateChange(itemId): void {
    if (this.state[itemId]) {
      this.state[itemId] = 1;
    } else {
      this.state[itemId] = 0;
    }
  }

}
