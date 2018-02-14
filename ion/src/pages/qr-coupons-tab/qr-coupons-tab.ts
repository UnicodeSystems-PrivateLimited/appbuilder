import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { DisplayService, QrCouponsService } from '../../providers';
import { GlobalService } from '../../providers';
import { QrCouponsDesc } from "../qr-coupons-desc/qr-coupons-desc";
import { SocialSharing, BarcodeScanner, SQLite } from 'ionic-native';

const scan: number = 1;
const redeem: number = 2;

/*
  Generated class for the QrCouponsTab page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-qr-coupons-tab',
    templateUrl: 'qr-coupons-tab.html'
})
export class QrCouponsTab {
    public tabId: number;
    public title: string;
    public bgImage: string;
    public db: SQLite;
    public loader: boolean = false;
    public searchIcon: boolean = true;
    public state: boolean = false;
    public searchItem: string;
    public qouponLists = [];
    public redeemedCoupanList = [];
    public scanCount = [];
    public tempScanCount = [];
    public lastScanTime = [];
    public timeToNextScan: number[] = [];
    public timeToNextScanInHourMin: string[] = [];
    public firstEntered: boolean = true;
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public service: QrCouponsService,
        public display: DisplayService,
        public globalService: GlobalService,
        public platform: Platform,
    ) {
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        platform.ready().then(() => {
            this.openDB();
        });
    }

    ionViewWillEnter() {
        if (!this.firstEntered) {
            this.createTable();
        }
        this.firstEntered = false;
    }

    public openDB(): void {
        this.db = new SQLite();
        this.db.openDatabase({
            name: 'tappit.db',
            location: 'default'
        }).then(() => {
            this.createTable();
        }).catch(err => {
            this.handleDBError(err);
        });
    }

    public createTable(): void {
        this.db.executeSql("CREATE TABLE IF NOT EXISTS qrCodeActivity (id INTEGER PRIMARY KEY, target INTEGER,item_id INTEGER, type INTEGER, created_at DATETIME DEFAULT NULL)", {}).then(() => {
            console.log("qrCodeActivity table created/already exists");
            //Get No. of coupans redeemed
            this.db.executeSql('SELECT id, item_id, type, created_at FROM qrCodeActivity WHERE type = ?', [redeem]).then(resultSet => {
                for (let i = 0; i < resultSet.rows.length; i++) {
                    this.redeemedCoupanList.push(resultSet.rows.item(i).item_id);
                }
                this.getScannedCoupanCount().then(res => {
                    console.log(this.lastScanTime);
                    //Get Coupan list
                    this.getInitData();
                }).catch(err => {
                    console.log(err);
                });

            }, err => {
                this.handleDBError(err);
            });
        }, err => {
            console.log("Table couldn't be created or opened :(");
            this.handleDBError(err);
        });
    }

    public handleDBError(err: any): void {
        console.log(err);
        this.display.showToast("Error occured");
        this.navCtrl.pop();
    }

    public getInitData(): void {
        this.loader = true;
        this.service.getItemList(this.tabId).subscribe(res => {
            if (res.success) {
                this.loader = false;
                this.qouponLists = res.data.itemData;
                for (let i = 0; i < this.qouponLists.length; i++) {
                    if (this.tempScanCount[this.qouponLists[i].id]) {
                        this.scanCount[this.qouponLists[i].id] = this.tempScanCount[this.qouponLists[i].id];
                    } else {
                        this.scanCount[this.qouponLists[i].id] = 0;
                    }

                    if (this.lastScanTime[this.qouponLists[i].id]) {
                        this.getTimeLeftToNextScan(this.lastScanTime[this.qouponLists[i].id], this.qouponLists[i].hours_before_checkin, this.qouponLists[i].id);
                    } else {
                        this.getTimeLeftToNextScan(false, this.qouponLists[i].hours_before_checkin, this.qouponLists[i].id);
                    }
                }
            } else {
                this.display.showToast("Could not fetch data");
            }
        });
    }

    public getScannedCoupanCount(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db.executeSql('SELECT MAX(id) AS id, item_id, type, created_at, count(*) AS scanCount FROM qrCodeActivity WHERE type = ? GROUP BY item_id', [scan]).then(resultList => {
                for (let i = 0; i < resultList.rows.length; i++) {
                    this.tempScanCount[resultList.rows.item(i).item_id] = resultList.rows.item(i).scanCount;
                    this.lastScanTime[resultList.rows.item(i).item_id] = resultList.rows.item(i).created_at;
                }
                resolve(true);
            }, err => {
                this.handleDBError(err);
                reject();
            });
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

    public onItemClick(id: number): void {
        this.navCtrl.push(QrCouponsDesc, {
            itemId: id,
            bgImage: this.bgImage,
            tabId: this.tabId,

        });
    }

    public getTimeLeftToNextScan(lastScannedAt, hoursBeforeCheckIn, coupanId): void {
        if (lastScannedAt) {
            let startTime = new Date();
            let endTime = new Date(lastScannedAt);
            endTime.setHours(endTime.getHours() + hoursBeforeCheckIn);
            this.timeToNextScan[coupanId] = endTime.valueOf() - startTime.valueOf();

            let timeToNextScanInSeconds = this.timeToNextScan[coupanId] / 1000;
            let timeToNextScanInMin = timeToNextScanInSeconds / 60;
            let minutes = Math.floor(timeToNextScanInMin % 60);
            let timeToNextScanInHour = Math.floor(timeToNextScanInMin / 60);
            this.timeToNextScanInHourMin[coupanId] = timeToNextScanInHour > 0 ? (timeToNextScanInHour + ' hour(s) ' + (minutes > 0 ? minutes + ' minutes' : '')) : (minutes > 0 ? minutes + 'minutes' : '');
        } else {
            this.timeToNextScan[coupanId] = 0;
        }
    }
}
