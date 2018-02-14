import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { DisplayService, GlobalService, ShoppingCartService, FoodOrderingService } from '../../providers/index';
import { FoodOrderingAccount } from '../food-ordering-account/food-ordering-account';
import { Subscription } from 'ionic-native/node_modules/rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Tab } from '../../interfaces/index';
import { FoodOrderingLocation } from '../food-ordering-location/food-ordering-location';
import { FoodOrderingLocationList } from '../food-ordering-location-list/food-ordering-location-list';
import { Device } from 'ionic-native';
import { FoodOrderingOrderDetails } from '../food-ordering-order-details/food-ordering-order-details';
import { WebViewPage } from '../web-view/web-view';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { GoogleMapsLoader } from '../../utils/google-maps-loader';

declare var cordova: any;

const ORDER_SERVICE_CUSTOM = 1;
@Component({
    selector: 'page-food-ordering',
    templateUrl: 'food-ordering.html'
})
export class FoodOrdering {

    tabId: number;
    title: string;
    bgImage: string;
    loader: boolean = true;
    pastOrderLoader: boolean = false;
    tab_nav_type: string = null;
    subTabId: number = null;
    subscriptions: Subscription[] = [];
    tabData: Tab;
    osType: string;
    viewDidLoad: boolean = false;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public display: DisplayService,
        public globalService: GlobalService,
        public service: FoodOrderingService,
        public platform: Platform
    ) {
        this.service.isDataRetreived = false;
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.bgImage = navParams.get('bgImage');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.osType = platform.is('ios') ? 'ios' : 'android';
        
        // Load Google Maps for further use.
        GoogleMapsLoader.load();

        this.getInitData();
    }

    ionViewDidLoad(): void {
        this.service.initialViewIndex = this.navCtrl.getActive().index;
        this.viewDidLoad = true;
    }

    ionViewWillLeave(): void {
        for (let i = 0; i < this.subscriptions.length; i++) {
            this.subscriptions[i].unsubscribe();
        }
        this.viewDidLoad = false;
    }

    ionViewDidEnter(): void {
        if (!this.viewDidLoad && this.platform.is('cordova')) {
            this.getPastOrders();
        }
    }

    ionViewCanEnter(): boolean {
        let settings = JSON.parse(this.navParams.get('settings'));
        if (settings.order_service_type === ORDER_SERVICE_CUSTOM) {
            return true;
        }
        let url: string = settings['url_' + settings.order_service_type];
        let iframe: boolean = settings['iframe_' + settings.order_service_type];
        if (!url) {
            return false;
        }
        if (iframe) {
            this.globalService.viewCantEnter = new AsyncSubject<boolean>();
            this.globalService.viewCantEnter.subscribe(() => {
                this.navCtrl.push(WebViewPage, {
                    url: url,
                    name: this.title,
                    tabId: this.tabId
                });
            });
        } else if (this.platform.is('cordova')){
            this.openThemeableBrowser(url);
        } else {
            window.open(url, '_system');
        }
        return false;
    }

    getInitData(): void {
        this.loader = true;
        this.subscriptions[0] = Observable.forkJoin(
            this.service.getInitData(this.tabId).timeout(30000),
            this.service.getCurrencyData().timeout(30000)
        ).subscribe(res => {
            if (res[0].success && res[1].success) {
                this.tabData = res[0].data.tabData;
                this.service.services = res[0].data.services;
                this.service.settings = JSON.parse(res[0].data.tabData.settings);
                this.service.payment = res[0].data.payment;
                this.service.taxList = res[0].data.taxAmountList;
                this.service.currencySymbolList = res[1].data.currencySymbolList;
                this.service.isDataRetreived = true;
                this.service.pastOrders = res[0].data.pastOrdersList;
            } else {
                this.display.showToast("Failed to load data");
                this.display.showRetryDialog(() => this.getInitData());
            }
            this.loader = false;
        }, err => {
            this.loader = false;
            this.display.showRetryDialog(() => this.getInitData());
        });
    }

    onPersonClick(): void {
        this.navCtrl.push(FoodOrderingAccount, { tabId: this.tabId });
    }

    onStartClick(): void {
        this.display.showLoader();
        this.subscriptions[1] = this.service.getLocationList(this.tabId).timeout(30000).subscribe(res => {
            if (!res.success) {
                this.display.hideLoader();
                this.display.showToast(res.message);
                this.display.showRetryDialog(() => this.onStartClick());
                return;
            }
            if (!res.data || !res.data.length) {
                this.display.hideLoader();
                this.display.showAlert("No available service(s) at this time.");
            } else if (res.data.length === 1) {
                this.navCtrl.push(FoodOrderingLocation, {
                    tabId: this.tabId,
                    location: res.data[0]
                });
            } else {
                this.navCtrl.push(FoodOrderingLocationList, {
                    tabId: this.tabId,
                    locationList: res.data
                });
            }
        }, err => {
            this.display.hideLoader();
            this.display.showRetryDialog(() => this.onStartClick());
        });
    }

    orderDetails(orderKey: number): void {
        console.log('Get order Details.');
        this.navCtrl.push(FoodOrderingOrderDetails, {
            tabId: this.tabId,
            orderKey: orderKey
        })
    }

    getPastOrders(): void {
        this.pastOrderLoader = true;
        this.subscriptions[2] = this.service.getPastOrdersList(this.tabId).timeout(30000).subscribe(res => {
            if (res.success) {
                this.service.pastOrders = res.data.pastOrdersList;
            } else {
                this.display.showToast("Failed to load data");
                this.display.showRetryDialog(() => this.getPastOrders());
            }
            this.pastOrderLoader = false;
        }, err => {
            this.pastOrderLoader = false;
            this.display.showRetryDialog(() => this.getPastOrders());
        });
    }

    private openThemeableBrowser(url: string): void {
        let headerBackgroundURL: string = this.globalService.tabHeaderBgImageSrcs[this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.background_img : this.globalService.initData.globalStyleSettings.header.background_img];
        let splittedHeaderBackgroundURL: string[] = headerBackgroundURL ? headerBackgroundURL.split("/") : [];
        let headerBackgroundName: string = splittedHeaderBackgroundURL[splittedHeaderBackgroundURL.length - 1];
        let options: any = {
            title: {
                color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.text_color : this.globalService.initData.globalStyleSettings.header.text_color),
                showPageTitle: true,
                staticText: this.title,
                background_color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.background_color : this.globalService.initData.globalStyleSettings.header.background_color),
            },
            toolbar: {
                height: 56,
                color: this.globalService.completeHexCode(this.globalService.initData.individualSettings[this.tabId] ? this.globalService.initData.individualSettings[this.tabId].header.background_color : this.globalService.initData.globalStyleSettings.header.background_color),
                wwwImage: "assets/bg-imgs/" + headerBackgroundName
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