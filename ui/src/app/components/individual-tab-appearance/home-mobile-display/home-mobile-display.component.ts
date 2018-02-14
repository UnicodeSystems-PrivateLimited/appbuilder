import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { TOOLTIP_DIRECTIVES, PAGINATION_DIRECTIVES, TAB_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dropdown, SelectItem, TabView, TabPanel, Dialog } from 'primeng/primeng';
import { GridDataService, PageService, FormDataService } from '../../../theme/services';
import { HomeScreenService } from '../../../pages/settings/app-display/home-screen.service';
import { GlobalStyleService } from '../../../pages/settings/app-display/global-style.service';
import { SettingsService } from '../../../pages/settings/settings.service';
import {  AppsTab, HomeScreenSettings } from '../../../theme/interfaces';
import {AppState} from '../../../app.state.ts';
import { RouteParams } from '@angular/router-deprecated';

@Component({
    selector: 'home-mobile-display',
    directives: [TOOLTIP_DIRECTIVES, Dropdown, TabView, TabPanel, Dialog, PAGINATION_DIRECTIVES, TAB_DIRECTIVES],
    encapsulation: ViewEncapsulation.None,
    template: require('./home-mobile-display.component.html'),
})

export class HomeMobileDisplay {
    @Input() tabId: any;
    @Input() homeData: any;
    public traditionalLayoutClasses: Object[] = [];
    public mobileView: any = {};
    public tabs: AppsTab[] = [];
    public btnBgImageSrcs: string[] = [];
    public showLoader: boolean = false;
    public appId: number;
    private LAYOUT_TOP: number = 1;
    private LAYOUT_BOTTOM: number = 2;
    private LAYOUT_LEFT: number = 3;
    private LAYOUT_RIGHT: number = 4;
    constructor(
        private dataService: GridDataService,
        private pageService: PageService,
        private homeScreenService: HomeScreenService,
        private service: GlobalStyleService,
        private settingsService: SettingsService,
        private params: RouteParams,
        private appState: AppState
    ) {
        this.appId = this.appState.dataAppId;
        this.tabId = parseInt(params.get('tabId'));
        this.initClasses();
        this.mobileView = Object.assign({}, this.homeScreenService.homeScreenSettings);
        this.homeData = {};
    }

    public ngOnInit(): void {
        this.getAllTabs();
    }

    public getAllTabs(): void {
        this.homeScreenService.getAllTabs(this.appId).subscribe(res => {
            if (res.success) {
                this.tabs = res.data.tabData;
                console.log(this.tabs);

            }
        });
    }

    public onEditClick(id: number): void {
        PageService.showLoader();
        this.service.editDialog = true;
        this.service.iconSelect = [];
        this.service.getTabData(id).subscribe(res => {
            PageService.hideLoader();
            if (res.success === true) {
                console.log(res.data);
                this.service.tabData.title = res.data.title;
                this.service.tabData.status = res.data.status == this.service.APPS_TAB_STATUS_ENABLED ? true : false;
                this.service.appTabIconSrc = res.data.src;
                this.service.tabData.id = id;
                this.service.tabData.tab_func_id = res.data.tab_func_id;

            } else {
                this.pageService.showError(res.message);
            }
        });
    }
    private initClasses(): void {
        this.traditionalLayoutClasses[this.LAYOUT_TOP] = "layout-row";
        this.traditionalLayoutClasses[this.LAYOUT_BOTTOM] = "layout-row";
        this.traditionalLayoutClasses[this.LAYOUT_LEFT] = "layout-column";
        this.traditionalLayoutClasses[this.LAYOUT_RIGHT] = "layout-column";
    }
}