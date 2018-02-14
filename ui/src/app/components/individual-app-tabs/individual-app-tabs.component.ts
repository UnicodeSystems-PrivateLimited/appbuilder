import { Component, ViewEncapsulation, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { TOOLTIP_DIRECTIVES, PAGINATION_DIRECTIVES, TAB_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dropdown, SelectItem, TabView, TabPanel, Dialog } from 'primeng/primeng';
import { AppDisplayMobile, TabData } from '../../theme/interfaces';
import { GridDataService, PageService, FormDataService } from '../../theme/services';
import { GlobalStyleService } from '../../pages/settings/app-display/global-style.service';
import { SettingsService } from '../../pages/settings/settings.service';
import { RouteParams } from '@angular/router-deprecated';
import { AppState } from '../../app.state.ts';
import { IndividualButtonsComponent } from '../individual-tab-appearance/buttons/buttons.component';
import { IndividualTabIconColor } from '../individual-tab-appearance/icon-color/icon-color.component';
import { IndividualTabHeader } from '../individual-tab-appearance/header/header.component';
import { IndividualTabColor } from '../individual-tab-appearance/color/color.component';
import { HomeMobileDisplay } from '../individual-tab-appearance/home-mobile-display/home-mobile-display.component';
import { GlobalMobileDisplay } from '../individual-tab-appearance/global-mobile-display/global-mobile-display.component';

@Component({
    selector: 'individual-app-tabs',
    directives: [TOOLTIP_DIRECTIVES, Dropdown, HomeMobileDisplay, GlobalMobileDisplay, TabView, TabPanel, IndividualTabColor, Dialog, IndividualTabHeader, PAGINATION_DIRECTIVES, TAB_DIRECTIVES, IndividualButtonsComponent, IndividualTabIconColor],
    encapsulation: ViewEncapsulation.None,
    template: require('./individual-app-tabs.component.html'),
})

export class IndividualAppTabsComponent {
    public tabId: number = null;
    public appId: number = null;
    public selectedTab: number = 0;
    public enableCustom: number = 2;

    constructor(
        private dataService: GridDataService,
        private pageService: PageService,
        private globalStyleService: GlobalStyleService,
        private settingsService: SettingsService,
        private params: RouteParams,
        private appState: AppState
    ) {
        this.tabId = parseInt(params.get('tabId'));
        this.appId = this.appState.dataAppId;
    }

    public ngOnInit(): void {
    }

    public onEditTabImageChange(event: any): void {
        this.globalStyleService.tabData.icon_image = event.target.files[0];
        this.globalStyleService.editImageTarget = event.target;
    }

    public setIcon(id: number, imgName: any): void {
        this.globalStyleService.tabData.icon_name = imgName;
        this.globalStyleService.iconSelect = [];
        this.globalStyleService.iconSelect[id] = true;
    }

    public saveIndividualTab(): void {
        this.globalStyleService.tabData.app_id = this.appId;
        let data: TabData = Object.assign({}, this.globalStyleService.tabData);
        data.status = data.status ? this.globalStyleService.APPS_TAB_STATUS_ENABLED : this.globalStyleService.APPS_TAB_STATUS_DISABLED;
        this.globalStyleService.saveIndividualTab(data).subscribe((res) => {
            if (res.success) {
                console.log(res);
                this.pageService.showSuccess(res.message);
                this.getAppList();
                this.globalStyleService.editDialog = false;
            }
            else {
                this.pageService.showError(res.message);
            }
        })
    }

    public onDialogHide(): void {
        this.globalStyleService.tabData = new TabData();
    }

    public getAppList(): void {
        this.globalStyleService.getInitData(this.appId).subscribe((res) => {
            if (res.success) {
                this.globalStyleService.appTabs = res.data.app_tabs_data;
            }
        })
    }

    public onTabSelect(index: number): void {
        this.selectedTab = index;
    }


    public onSaveIndividualAppearance(): void {
        this.globalStyleService.individualTabSettings.tab_id = this.globalStyleService.tabData.id
        this.globalStyleService.individualTabSettings.icon_color.show_icon = this.globalStyleService.individualTabSettings.icon_color.show_icon ? 1 : 0;
        this.globalStyleService.individualTabSettings.buttons.show_text = this.globalStyleService.individualTabSettings.buttons.show_text ? 1 : 0;
        PageService.showLoader();
        console.log(this.globalStyleService.individualTabSettings.tab_id);
        this.globalStyleService.saveIndividualTabAppearance(this.globalStyleService.individualTabSettings).subscribe((res) => {
            PageService.hideLoader();
            if (res.success) {
                console.log(this.globalStyleService.individualTabSettings);
                this.pageService.showSuccess(res.message);
                this.globalStyleService.editDialog = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public enableAppearance(index: number): void {
        this.enableCustom = index;
    }

    public deleteSettings(): void {
        if (!confirm("Are you sure you want to delete this settings ?")) {
            return;
        }
        console.log(this.globalStyleService.tabData.id);
        PageService.showLoader();
        this.globalStyleService.deleteIndividualSettings([this.globalStyleService.tabData.id]).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.globalStyleService.editDialog = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

}