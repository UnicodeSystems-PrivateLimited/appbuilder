import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { BarcodeScanner, SQLite, ThemeableBrowser } from 'ionic-native';
import { DisplayService, GlobalService } from '../../providers';
import moment from 'moment';
declare var cordova: any;

@Component({
    selector: 'page-qr-scanner',
    templateUrl: 'qr-scanner.html'
})
export class QRScanner {

    public title: string;
    public tabId: number;
    public bgImage: number;
    public db: SQLite;
    public bar_code_text: string;
    public qr_code_list: any[] = [];
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(
        public navCtrl: NavController,
        public display: DisplayService,
        public navParams: NavParams,
        public globalService: GlobalService,
        public platform: Platform,
    ) {

        this.tabId = navParams.get("tabId");
        this.title = navParams.get("title");
        this.bgImage = navParams.get("bgImage");
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        platform.ready().then(() => {
            this.openDB();
        });
    }

    public onScanCodeClick(): void {
        let options = {
            prompt: "Place a QR code inside the viewfinder rectangle to scan it.",
            formats: "QR_CODE"
        };
        BarcodeScanner.scan(options).then((barcodeData) => {
            if (!barcodeData.cancelled) {
                this.bar_code_text = barcodeData.text;
                this.insertQrText();
                if (this.validateURL(barcodeData.text)) {
                    this.openWebView(barcodeData.text);
                } else {
                    this.display.showAlert(barcodeData.text);
                }

            }
        }, (err) => {
            console.log(err);
            this.display.showToast("Scan failed");
        });
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
        this.db.executeSql("CREATE TABLE IF NOT EXISTS qr_scaner_data (id INTEGER PRIMARY KEY, body TEXT, created_at DATETIME DEFAULT NULL)", {}).then(() => {
            console.log("qr_scaner_data table created/already exists");
            this.getQrCodeList();
        }, err => {
            console.log("Table couldn't be created or opened :(");
            this.handleDBError(err);
        });
    }
    public getQrCodeList(): void {
        this.db.executeSql("SELECT id, body, created_at FROM qr_scaner_data ORDER BY created_at DESC", {}).then(resultSet => {
            for (let i = 0; i < resultSet.rows.length; i++) {
                this.qr_code_list.push(resultSet.rows.item(i));
            }
            console.log(" this.qr_code_list", this.qr_code_list);
        }, err => {
            this.handleDBError(err);
        });
    }
    public handleDBError(err: any): void {
        console.log(err);
        this.display.showToast("Error occured");
    }

    public insertQrText(): void {
        let createdAt: string = moment().format();
        this.db.executeSql("INSERT INTO qr_scaner_data (body, created_at) VALUES (?, ?)", [this.bar_code_text, createdAt]).then(resultSet => {
            console.log("text inserted", resultSet);
            this.qr_code_list.unshift({ id: resultSet.insertId, body: this.bar_code_text, created_at: createdAt });
        }, err => {
            this.handleDBError(err);
        });
    }

    public itemSelected(text: string): void {
        if (this.validateURL(text)) {
            this.openWebView(text);
        } else {
            this.display.showAlert(text);
        }
    }

    public openWebView(url: string) {
        if (this.platform.is('ios') || this.platform.is('android')) {
            let options: any = {
                title: {
                    color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.text_color : this.globalService.initData.globalStyleSettings.header.text_color),
                    background_color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.background_color : this.globalService.initData.globalStyleSettings.header.background_color),

                },
                toolbar: {
                    height: 56,
                    color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.background_color : this.globalService.initData.globalStyleSettings.header.background_color),
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
            cordova.ThemeableBrowser.open(url, '_blank', options).addEventListener(cordova.ThemeableBrowser.EVT_ERR, function (e) {
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
    }
    public validateURL(textval: string): boolean {
        var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
        return urlregex.test(textval);
    }

    public deleteQrHistoryElement(event, id): void {
        if (!this.platform.is('ios')) {
            this.display.showConfirm("", "Are you sure you want to delete this history ?", () => this.deleteHistory(id));
        }
    }

    public deleteHistory(id): void {
        this.db.executeSql("DELETE FROM qr_scaner_data WHERE id=?", [id]).then(() => {
            this.display.showToast("Message deleted.");
            this.qr_code_list.forEach((item, index) => {
                if (item.id === id) {
                    this.qr_code_list.splice(index, 1);
                }
            });
        }, err => {
            this.handleDBError(err);
        });
    }

}
