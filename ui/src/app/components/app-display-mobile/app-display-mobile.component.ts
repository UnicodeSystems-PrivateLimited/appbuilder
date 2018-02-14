import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { TOOLTIP_DIRECTIVES, PAGINATION_DIRECTIVES, TAB_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dropdown, SelectItem, TabView, TabPanel, Dialog, Draggable, Droppable } from 'primeng/primeng';
import { AppDisplayMobile, AppsTab, HomeScreenSubTab } from '../../theme/interfaces';
import { GridDataService, PageService, FormDataService } from '../../theme/services';
import { ButtonsComponent } from '../../pages/settings/app-display/display-settings/home-screen/buttons';
import { IconColorComponent } from '../../pages/settings/app-display/display-settings/home-screen/icon-color';
import { HeaderGlobalComponent } from '../../pages/settings/app-display/display-settings/global-style/headers';
import { ListsComponent } from '../../pages/settings/app-display/display-settings/global-style/lists';
import { HomeScreenService } from '../../pages/settings/app-display/home-screen.service';
import { SettingsService } from '../../pages/settings/settings.service';
import { IndividualAppTabsComponent} from '../individual-app-tabs/individual-app-tabs.component';
import { GlobalStyleService } from '../../pages/settings/app-display/global-style.service';

@Component({
    selector: 'app-display-mobile',
    directives: [TOOLTIP_DIRECTIVES, Dropdown, TabView, IndividualAppTabsComponent, HeaderGlobalComponent, ListsComponent, TabPanel, IconColorComponent, Dialog, PAGINATION_DIRECTIVES, TAB_DIRECTIVES, ButtonsComponent, Draggable, Droppable],
    encapsulation: ViewEncapsulation.None,
    template: require('./app-display-mobile.component.html'),
})

export class MobileAppDisplay {
    @Input() settings: any;
    @Input() appId: any;
    @Input() selectedTab: any;

    public tilesView: boolean = false;
    public listView: boolean = false;
    public traditionalLayoutClasses: Object[] = [];
    public tabs: AppsTab[] = [];
    public draggedSubtab: HomeScreenSubTab;
    public draggedIndex: number;

    private LAYOUT_TOP: number = 1;
    private LAYOUT_BOTTOM: number = 2;
    private LAYOUT_LEFT: number = 3;
    private LAYOUT_RIGHT: number = 4;

    private TAB_LAYOUT: number = 0;
    private TAB_EXTRA_BUTTONS: number = 1;
    private TAB_SUBTABS: number = 2;
    private TAB_HEADERS: number = 3;
    private TAB_BUTTONS: number = 4;
    private TAB_ICON_COLOR: number = 5;

    constructor(
        private dataService: GridDataService,
        private pageService: PageService,
        private homeScreenService: HomeScreenService,
        private service: GlobalStyleService,
        private settingsService: SettingsService
    ) {
        this.initClasses();
    }

    public ngOnInit(): void {
        this.homeScreenService.initTabRowsIterator();
        this.getAllTabs();
    }

    public getAllTabs(): void {
        this.homeScreenService.getAllTabs(this.appId).subscribe(res => {
            if (res.success) {
                this.tabs = res.data.tabData;
            }
        });
    }

    public onEditClick(id: number): void {
        this.service.editDialog = true;
        this.service.iconSelect = [];
        this.service.getTabData(id).subscribe(res => {
            if (res.success === true) {
                console.log(res.data);
                this.service.tabData.title = res.data.title;
                this.service.tabData.status = res.data.status == this.service.APPS_TAB_STATUS_ENABLED ? true : false;
                this.service.appTabIconSrc = res.data.src;
                this.service.tabData.id = id;
                this.service.tabData.icon_name = res.data.icon_name;
                this.service.tabData.type = res.data.type;
                this.service.tabData.tab_func_id = res.data.tab_func_id;
                this.getIndividualTabAppearance(id);
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

    public onDragStart(subtab: HomeScreenSubTab, index: number): void {
        this.draggedSubtab = subtab;
        this.draggedIndex = index;
    }

    public onDrop(subtab: HomeScreenSubTab | {}, index: number): void {
        if (this.draggedSubtab && this.draggedIndex !== undefined) {
            this.homeScreenService.subTabList[this.draggedIndex] = <HomeScreenSubTab>subtab;
            this.homeScreenService.subTabList[index] = this.draggedSubtab;
            this.sortSubtabs();
        }
    }

    public onDragEnd(): void {
        this.draggedSubtab = undefined;
        this.draggedIndex = undefined;
    }

    public sortSubtabs(): void {
        let ids: number[] = [];
        for (let subtab of this.homeScreenService.subTabList) {
            ids.push(subtab.id);
        }
        this.homeScreenService.sortSubTabs(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('Item order saved.')
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public getIndividualTabAppearance(tabId: number): void {
        this.service.getIndividualTabAppearance(tabId).subscribe((res) => {
            if (res.success) {
                if (res.data) {
                    this.service.individualTabSettings = res.data;
                    if (res.data.buttons) {
                        this.service.individualTabSettings.buttons = res.data.buttons;
                        this.service.individualTabSettings.buttons.show_text = res.data.buttons.show_text == 1 ? true : false;
                    }
                    if (res.data.header) {
                        this.service.individualTabSettings.header = res.data.header;
                    }
                    if (res.data.icon_color) {
                        this.service.individualTabSettings.icon_color = res.data.icon_color;
                        this.service.individualTabSettings.icon_color.show_icon = res.data.icon_color.show_icon == 1 ? true : false;
                    }
                    if (res.data.color) {
                        this.service.individualTabSettings.color = res.data.color;
                    }
                }
            }
            else {
                this.pageService.showError(res.message);
            }
        });
    }
}
