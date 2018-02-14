import { Component, ViewEncapsulation, forwardRef, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Router, RouteConfig, ROUTER_DIRECTIVES, RouterOutlet, RouterLink } from '@angular/router-deprecated';
import { TabView } from 'primeng/primeng';
import { TabPanel } from 'primeng/primeng';
import { Draggable, Droppable, Message, Growl } from 'primeng/primeng';
import { Dialog, Dropdown, Carousel } from 'primeng/primeng';
import { SelectItem } from 'primeng/primeng';
import { MyTabs } from './tabs.component';
import { Tab } from './tab';
import { ControlGroup, AbstractControl, FORM_DIRECTIVES, Validators, FormBuilder } from '@angular/common';
import { AppState } from '../../app.state';
import { BaCard } from '../../theme/components';
import { AppTabs, TabsContent, AppDisplay, AppLive } from './';
import { SettingsService } from './settings.service';
import { GridDataService, PageService } from '../../theme/services';
import { DomSanitizationService } from "@angular/platform-browser";
import { PushNotificationComponent } from '../../components/push-notification';
import { QrImgGenerationData } from '../../theme/interfaces/common-interfaces';
import { SettingDefaultChild } from './setting-default-child.component';
import { CPromote } from '../c-promote';
import { COverview } from '../c-overview';
import { CSettings } from '../c-settings';
import { CSubmittedData } from '../c-submitted-data';
import { CAnalytics } from '../c-analytics';
import { Transactions } from '../transactions';

declare var window: any;

@Component({
    selector: 'settings',
    pipes: [],
    directives: [Carousel, TOOLTIP_DIRECTIVES, MyTabs, Tab, PushNotificationComponent, Dropdown, Dialog, ROUTER_DIRECTIVES, Draggable, Droppable, BaCard, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TabView, TabPanel, FORM_DIRECTIVES, forwardRef(() => AppTabs), forwardRef(() => TabsContent), forwardRef(() => AppDisplay), forwardRef(() => AppLive)],
    encapsulation: ViewEncapsulation.None,
    styles: [require('./settings.scss')],
    template: require('./settings.html'),
    providers: [PageService, SettingsService, Title]
})

@RouteConfig([
    {
        name: 'SettingDefault',
        component: SettingDefaultChild,
        path: '/settingDefault',
        useAsDefault: true
    },
    {
        name: 'AppTabs',
        component: AppTabs,
        path: '/tabs',
    },
    {
        name: 'TabsContent',
        component: TabsContent,
        path: '/content/...',
    },
    {
        name: 'AppDisplay',
        component: AppDisplay,
        path: '/display/...',
    },
    {
        name: 'AppLive',
        component: AppLive,
        path: '/publish',
    },
    {
        name: 'COverview',
        component: COverview,
        path: '/cOverview/',
    },
    {
        name: 'CSettings',
        component: CSettings,
        path: '/cSettings/',
    },
    {
        name: 'CPromote',
        component: CPromote,
        path: '/cPromote/',
    },
    {
        name: 'CSubmittedData',
        component: CSubmittedData,
        path: '/cSubmittedData/',
    },
    {
        name: 'CAnalytics',
        component: CAnalytics,
        path: '/CAnalytics/',
    },
    {
        name: 'Transactions',
        component: Transactions,
        path: '/transactions/',
    }
])

export class Settings {

    public toggleState;
    public tabActive: any = '0';
    public simulatorDisplay: boolean = false;
    public appCodeDisplay: boolean = false;
    public appSimulatorURL: any;
    public appId: any;
    public appCode: any;
    public showIframe: boolean = true;
    public showTestAppDialogDisplay: boolean = false;
    public qrImgGenerationData: QrImgGenerationData = new QrImgGenerationData();
    public mobWebsiteUrl: string = null;
    public mobWebsiteQr: string = null;
    public androidAppUrl: string = null;
    public androidAppQr: string = null;
    public iosAppUrl: string = null;
    public iosAppQr: string = null;
    public showLoader: boolean = false;
    public appDetails: any = null;
    public staticSettingService: typeof SettingsService = SettingsService;
    private _getProfileUrl = '../api/ws/account/profile';
    public staticPageService: typeof PageService = PageService;


    constructor(private titleService: Title, protected appState: AppState, protected router: Router, private sanitizer: DomSanitizationService, private service: SettingsService, private pageService: PageService,
        private dataService: GridDataService
    ) {
        if (this.appState.isCustomerLogin)
            this.appState.isAllAppPage = false;
        console.log(" this.appState.isCustomerLogin", this.appState.isCustomerLogin);
        PageService.showpushNotificationButton = true;
        this.appId = sessionStorage.getItem('appId');
        console.log("this.appId", this.appId);
        this.appCode = sessionStorage.getItem('appCode'); console.log(this.appCode); console.log("this.appState.isCustomerLogin", this.appState.isCustomerLogin);
        if (this.appState.isCustomerLogin) {
            this.getAppInfo();
        }
        // appState.dataAppId = 60;
        console.log(" appState.dataAppId appState.dataAppId appState.dataAppId", appState.dataAppId);
        this.getAppDetails();
        this.appSimulatorURL = sanitizer.bypassSecurityTrustResourceUrl(SettingsService.simulatorBaseURL + "?app_code=" + this.appCode + "&ionicplatform=android");

    }

    public ngOnInit() {
        console.log("this.appState.isCustomerLogin", this.appState.isCustomerLogin);
        if (!this.appState.isCustomerLogin) {
            if (typeof this.appId === 'undefined') {
                this.router.parent.navigate(['MyApp']);
            } else {
                this.checkUrlRedirection();
            }
        }
    }
    public checkUrlRedirection() {
        let url = window.location.href.substring(window.location.href.indexOf('#') + 2);
        let segment = url.split('/');
        if (segment.indexOf('content') > -1) {
            this.router.navigate(['TabsContent']);
        } else if (segment.indexOf('display') > -1) {
            this.router.navigate(['AppDisplay']);
        } else if (segment.indexOf('publish') > -1) {
            this.router.navigate(['AppLive']);
        } else if (segment.indexOf('cOverview') > -1) {
            this.router.navigate(['COverview']);
        } else if (segment.indexOf('cPromote') > -1) {
            this.router.navigate(['CPromote']);
        } else if (segment.indexOf('cSettings') > -1) {
            this.router.navigate(['CSettings']);
        } else if (segment.indexOf('cSubmittedData') > -1) {
            this.router.navigate(['CSubmittedData']);
        } else if (segment.indexOf('CAnalytics') > -1) {
            this.router.navigate(['CAnalytics']);
        } else {
            this.router.navigate(['AppTabs']);
        }
    }
    public getAppDetails(): void {
        this.service.getAppDetails(this.appId).subscribe(res => {
            if (res.success) {
                this.appDetails = res.data;
                console.log("this.appDetails", this.appDetails);
            }
        });
    }
    public getAppInfo() {
        this.showLoader = true;
        this.service.getAppSettings(0).subscribe((res) => {
            this.showLoader = false;
            console.log("res", res);
            this.titleService.setTitle(res.data.theme.theme_page_title);
            this.staticSettingService.appSettingData = res.data;
            console.log(" this.staticSettingService.appSettingData", this.staticSettingService.appSettingData);
            if (this.staticSettingService.appSettingData['steps']['steps_functionality']) {
                this.router.navigate(['AppTabs']);
            } else if (this.staticSettingService.appSettingData['steps']['steps_content']) {
                this.router.navigate(['TabsContent']);
            } else if (this.staticSettingService.appSettingData['steps']['steps_appearance']) {
                this.router.navigate(['AppDisplay']);
            }
            else if (this.staticSettingService.appSettingData['steps']['steps_publish']) {
                this.router.navigate(['AppLive']);
            }
        });
    }
    public toggleNav(): void {
        this.toggleState = !this.toggleState;
    }

    public toggleSimulator(): void {
        this.simulatorDisplay = !this.simulatorDisplay;
    }

    public toggleAppCode(): void {
        this.appCodeDisplay = !this.appCodeDisplay;
    }

    public onClickHome(): void {
        this.showIframe = false;
        setTimeout(() => {
            this.showIframe = true;
        }, 0);

    }

    public showTestAppDialog(): void {
        let qrUrls: any[] = [];
        this.iosAppUrl = "https://itunes.apple.com/us/app/tappit-live/id1271304188";
        this.mobWebsiteUrl = 'http://yourmobileschoolapp.us/ion/?app_code=' + this.appCode;
        this.androidAppUrl = 'https://play.google.com/store/apps/details?id=us.yourmobileschoolapp.tappitlive';
        qrUrls.push(this.iosAppUrl);
        qrUrls.push(this.androidAppUrl);
        qrUrls.push(this.mobWebsiteUrl);
        this.qrImgGenerationData.urls = qrUrls;

        this.service.getQrImgs(this.qrImgGenerationData).subscribe(res => {
            if (res.success) {
                this.iosAppQr = res.data[0];
                this.androidAppQr = res.data[1];
                this.mobWebsiteQr = res.data[2];
            } else {
                console.log(res);
            }
        });
        this.showTestAppDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public downloadApk(): void {
        window.location.href = "http://tappit.tk/preview_apk/tappit_preview_app.apk";
    }
    public onNotiClick(): void {
        this.pageService.setPushNotiOpenStatus(true);
        PageService.notiDialog = true;
    }

}