import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { Dialog, Carousel, SelectItem } from 'primeng/primeng';
import { GridDataService, PageService } from '../../../theme/services';
import { FORM_DIRECTIVES } from '@angular/common';
import { AppState } from '../../../app.state';
import { SettingsService } from '../settings.service';
// import { CKEditor } from 'ng2-ckeditor';
import { CallUs, WebsiteTab, PDFTab, ContactUs, ContentTab1, ContentTab2, VoiceRecording, FanWall, ContentTab3, PictureGallery, EmailFormsTab, QrScanner, QrCouponsComponent, GpsCouponsComponent, MembershipTab } from './tab-functions';
import { DefaultChild } from './default-child.component';
import { Tab } from '../../../theme/interfaces';
import { DomSanitizationService } from "@angular/platform-browser";
import { MenuTab } from "./tab-functions/menu-tab/menu-tab.component";
import { DirectionTab } from "./tab-functions/direction-tab/direction-tab.component";
import { AroundUsTab } from "./tab-functions/around-us/around-us.component";
import { InboxTab } from "./tab-functions/inbox-tab/inbox-tab.component";
import { EventsTab } from "./tab-functions/events-tab/events-tab.component";
import { SocialMediaTab } from "./tab-functions/social-media-tab/social-media.component";
import { TellFriend } from "./tab-functions/tell-friend-tab/tell-friend.component";
import { NotepadTab } from "./tab-functions/notepad-tab/notepad.component";
import { FindWhereIParkedTab } from "./tab-functions/find-where-i-parked/find-where-i-parked.component";
import { LoyaltyTabComponent } from "./tab-functions/loyalty-tab/loyalty-tab.component";
import { NewsTab } from "./tab-functions/news-tab/news-tab.component";
import { MusicTab } from "./tab-functions/music-tab/music-tab.component";
import { MailingListTab } from "./tab-functions/mailing-list-tab/mailing-list-tab.component";
import { LanguageTab } from './tab-functions/language-tab/language-tab.component';
import { ShoppingCart } from './tab-functions/shopping-cart/shopping-cart.component';
import { FoodOrdering } from './tab-functions/food-ordering/food-ordering.component';
import { GateAccess } from './tab-functions/gate-access';

@Component({
    selector: 'tabs-content',
    pipes: [],
    directives: [Carousel, Dialog, Dragula, ROUTER_DIRECTIVES, FORM_DIRECTIVES],
    encapsulation: ViewEncapsulation.None,
    template: require('./tabs-content.html'),
    viewProviders: [DragulaService],
    providers: [PageService]
})

@RouteConfig([
    {
        name: 'Default',
        component: DefaultChild,
        path: '/default',
        useAsDefault: true
    },
    {
        name: 'TabFunction.call_us',
        component: CallUs,
        path: '/call-us/:tabId',
    },
    {
        name: 'TabFunction.website_tab',
        component: WebsiteTab,
        path: '/website-tab/:tabId',
    },
    {
        name: 'TabFunction.pdf_tab',
        component: PDFTab,
        path: '/pdf-tab/:tabId',
    },
    {
        name: 'TabFunction.menu_tab',
        component: MenuTab,
        path: '/menu-tab/:tabId',
    },
    {
        name: 'TabFunction.contact_us',
        component: ContactUs,
        path: '/contact-us/:tabId',
    },
    {
        name: 'TabFunction.directions_tab',
        component: DirectionTab,
        path: '/directions-tab/:tabId',
    },
    {
        name: 'TabFunction.content_tab1',
        component: ContentTab1,
        path: '/content-tab-1/:tabId',
    },
    {
        name: 'TabFunction.content_tab2',
        component: ContentTab2,
        path: '/content-tab-2/:tabId',
    },

    {
        name: 'TabFunction.aroundus_tab',
        component: AroundUsTab,
        path: '/around-us/:tabId',
    },

    {
        name: 'TabFunction.voice_recording',
        component: VoiceRecording,
        path: '/voice-recording/:tabId',
    },
    {
        name: 'TabFunction.fan_wall',
        component: FanWall,
        path: '/fan-wall/:tabId',
    },
    {
        name: 'TabFunction.picture_gallery',
        component: PictureGallery,
        path: '/picture-gallery/:tabId',
    },
    {
        name: 'TabFunction.content_tab3',
        component: ContentTab3,
        path: '/content-tab-3/:tabId',
    },
    {
        name: 'TabFunction.inbox',
        component: InboxTab,
        path: '/inbox/:tabId',
    },
    {
        name: 'TabFunction.calender_event',
        component: EventsTab,
        path: '/calender_event/:tabId',
    },
    {
        name: "TabFunction.email_forms",
        component: EmailFormsTab,
        path: '/email_forms/:tabId',
    },
    {
        name: "TabFunction.qr_scanner",
        component: QrScanner,
        path: '/qr_scanner/:tabId',
    },
    {
        name: "TabFunction.qr_coupons",
        component: QrCouponsComponent,
        path: '/qr_coupons/:tabId',
    },
    {
        name: "TabFunction.gps_tab",
        component: GpsCouponsComponent,
        path: '/gps_tab/:tabId',
    },
    {
        name: "TabFunction.membership",
        component: MembershipTab,
        path: '/membership/:tabId',
    },
    {
        name: 'TabFunction.social',
        component: SocialMediaTab,
        path: '/social/:tabId',
    },
    {
        name: 'TabFunction.tell_friend',
        component: TellFriend,
        path: '/tell_friend/:tabId',
    },
    {
        name: 'TabFunction.notepad',
        component: NotepadTab,
        path: '/notepad/:tabId',
    },
    {
        name: 'TabFunction.find_where_i_parked',
        component: FindWhereIParkedTab,
        path: '/find_where_i_parked/:tabId',
    },
    {
        name: 'TabFunction.scholl_reward',
        component: LoyaltyTabComponent,
        path: '/scholl_reward/:tabId',
    },
    {
        name: 'TabFunction.news',
        component: NewsTab,
        path: '/news/:tabId',
    },
    {
        name: 'TabFunction.music',
        component: MusicTab,
        path: '/music/:tabId',
    },
    {
        name: 'TabFunction.mailing_list',
        component: MailingListTab,
        path: '/mailing_list/:tabId',
    },
    {
        name: 'TabFunction.language',
        component: LanguageTab,
        path: '/language/:tabId',
    },
    {
        name: 'TabFunction.shopping_cart',
        component: ShoppingCart,
        path: '/shopping_cart/:tabId',
    },
    {
        name: 'TabFunction.food_ordering',
        component: FoodOrdering,
        path: '/food_ordering/:tabId',
    },
    {
        name: 'TabFunction.gate_access',
        component: GateAccess,
        path: '/gate_access/:tabId',
    }
])

export class TabsContent {

    // public ckeditorContent;
    public config;
    public count: SelectItem[] = [];
    public selectedCount: string;
    public date: SelectItem[] = [];
    public selectedDate: string;
    public appId: any;
    public tabs: Tab[] = [];
    public simulatorDisplay: boolean = false;
    public appSimulatorURL: any;
    private _getProfileUrl = '../api/ws/account/profile';

    constructor(private pageService: PageService,
        protected appState: AppState,
        private router: Router,
        private settingsService: SettingsService,
        private dragulaService: DragulaService,
        private sanitizer: DomSanitizationService,
        private dataService: GridDataService) {

        // this.ckeditorContent = `<p>Hello CKEditor</p>`;
        // this.ckeditorContent = `<p>My HTML</p>`;

        this.config = { uiColor: '#F0F3F4', height: '600' };

        this.count.push({ label: '15', value: '15' });
        this.count.push({ label: ' 1', value: ' 1' });
        this.count.push({ label: ' 2', value: ' 2' });
        this.count.push({ label: '3', value: '3' });
        this.count.push({ label: '4', value: ' 4' });

        this.date = [];
        this.date.push({ label: 'Date/Time', value: 'Date/Time' });
        this.date.push({ label: ' 12/06/2016', value: ' 12/06/2016' });
        this.date.push({ label: ' 20/06/20', value: ' 20/06/20' });
        this.date.push({ label: '12/06/2016', value: '12/06/2016' });
        this.date.push({ label: '20/06/20', value: '20/06/20' });
        // if (this.appState.isCustomerLogin) {
        //     this.dataService.getData(this._getProfileUrl).subscribe(account => {
        //         this.appState.dataAppId = account.data.app_id;
        //         this.appId = this.appState.dataAppId;
        //         this.getAllAppTabs();
        //     });
        // } else {
        this.appId = sessionStorage.getItem('appId');
        // }
        console.log("this.appId", this.appId);
        console.log("this.appState.isCustomerLogin", this.appState.isCustomerLogin);
        dragulaService.setOptions('first-bag', {
            moves: (el, container, handle) => {
                return el.className.indexOf("inactive-tab") === -1;
            }
        });
        dragulaService.dropModel.subscribe((value) => {
            console.log(this.tabs);
            this.sortTabs();
        });
        this.appSimulatorURL = sanitizer.bypassSecurityTrustResourceUrl(SettingsService.simulatorBaseURL + "?app_id=" + this.appId);
    }

    public ngOnInit(): void {
        if ((typeof this.appId === "undefined" || this.appId == null) && this.appState.isCustomerLogin) {
            // No access to settings without App ID. Go back to your App grid page.
            this.router.parent.navigate(['Settings']);
        } else if ((typeof this.appId === "undefined" || this.appId == null) && !this.appState.isCustomerLogin) {
            this.router.parent.navigate(['MyApp']);
        }
        else {
            this.getAllAppTabs();
        }
    }

    public getAllAppTabs(): void {
        this.settingsService.getAppTabsForContent(this.appId).subscribe(res => {
            if (res.success) {
                this.tabs = res.data;
                this.tabs[0].active = true; // The first tab is selected by default.
                this.navigateToTabFunction(this.tabs[0].tab_func_code, this.tabs[0].id);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    private _deactivateAllTabs(): void {
        this.tabs.forEach((tab) => tab.active = false);
    }

    public onTabSelect(tab: Tab): void {
        this._deactivateAllTabs();
        tab.active = true;
        this.navigateToTabFunction(tab.tab_func_code, tab.id);
    }

    public navigateToTabFunction(tabFunctionCode: string, tabId: number): void {
        this.router.navigate(['TabFunction.' + tabFunctionCode, { tabId: tabId }]);
    }

    public sortTabs(): void {
        let sortedIds: number[] = [];
        this.tabs.forEach(tab => {
            sortedIds.push(tab.id);
        });
        this.settingsService.sortAppTabsForContent(sortedIds).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess('Tab order saved.');
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public toggleSimulator(): void {
        this.simulatorDisplay = !this.simulatorDisplay;
    }

    public onCpanelClick(): void {
        console.log('this.appId', this.appId);
        this.router.parent.navigate(['CPanel', { appId: this.appId }]);
    }
}