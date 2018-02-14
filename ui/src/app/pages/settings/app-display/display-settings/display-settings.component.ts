import { Component, ViewEncapsulation } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Router, RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { TabView, TabPanel } from 'primeng/primeng';
import { Dragula } from 'ng2-dragula/ng2-dragula';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { Draggable, Droppable, Message, Growl } from 'primeng/primeng';
import { Dialog, Dropdown, Carousel } from 'primeng/primeng';
import { SelectItem, InputSwitch } from 'primeng/primeng';
import { GridDataService, PageService } from '../../../../theme/services';
import { ControlGroup, AbstractControl, FORM_DIRECTIVES, Validators, FormBuilder } from '@angular/common';
import { AppState } from '../../../../app.state';
import { BaCard } from '../../../../theme/components';
import { SettingsService } from '../../settings.service';
import { DomSanitizationService } from "@angular/platform-browser";
import { ButtonsComponent } from './home-screen/buttons';
import { ExtraButtonsComponent } from './home-screen/extra-buttons';
import { HeaderComponent } from './home-screen/header';
import { IconColorComponent } from './home-screen/icon-color';
import { LayoutComponent } from './home-screen/layout';
import { SubTabsComponent } from './home-screen/sub-tabs';
import { HeaderGlobalComponent } from './global-style/headers';
import { FontsComponent } from './global-style/fonts';
import { ListsComponent } from './global-style/lists';
import { FeaturesComponent } from './global-style/features';
import { IndividualTabsComponent } from './global-style/individual-tabs';
import { BlurEffectComponent } from './global-style/blur-effect';
import { MobileAppDisplay, GlobalStyleAppDisplay} from '../../../../components';
import { HomeScreenService } from '../home-screen.service';
import { GlobalStyleService } from '../global-style.service';

@Component({
    selector: 'display-settings',
    pipes: [],
    directives: [TabView, TAB_DIRECTIVES, TabPanel, FontsComponent, IndividualTabsComponent, BlurEffectComponent, GlobalStyleAppDisplay, MobileAppDisplay, ListsComponent, FeaturesComponent, InputSwitch, HeaderGlobalComponent, ButtonsComponent, SubTabsComponent, LayoutComponent, IconColorComponent, HeaderComponent, ExtraButtonsComponent, ROUTER_DIRECTIVES],
    template: require('./display-settings.component.html'),
})

export class DisplaySettings {

    public appId: any;
    public selectedTab: number = 0;
    public selectedSettingsTab: number = 0;

    public disabledHomeScreenTabs: boolean[] = [];

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
    public homeSelected: boolean = true;
    public globalSelected: boolean = false;

    constructor(
        private homeScreenService: HomeScreenService,
        private globalStyleService: GlobalStyleService,
        private appState: AppState
    ) {
        this.appId = sessionStorage.getItem('appId');
        this.initDisabledHomeScreenTabs();
    }

    public onHomeScreenTabChange(event): void {
        this.selectedTab = event.index;
    }
    public onSettingsTabChange(event): void {
        this.selectedSettingsTab = event.index;
    }

    private initDisabledHomeScreenTabs(): void {
        this.homeScreenService.disabledHomeScreenTabs[this.TAB_LAYOUT] = false;
        this.homeScreenService.disabledHomeScreenTabs[this.TAB_EXTRA_BUTTONS] = false;
        this.homeScreenService.disabledHomeScreenTabs[this.TAB_SUBTABS] = false;
        this.homeScreenService.disabledHomeScreenTabs[this.TAB_HEADERS] = false;
        this.homeScreenService.disabledHomeScreenTabs[this.TAB_BUTTONS] = false;
        this.homeScreenService.disabledHomeScreenTabs[this.TAB_ICON_COLOR] = false;
    }

    public onTraditionalPositionChange(type: number): void {
        if (this.homeScreenService.homeScreenSettings.layout.home_layout === 1 && type !== 2) {
            this.homeScreenService.disabledHomeScreenTabs[this.TAB_EXTRA_BUTTONS] = true;
            this.homeScreenService.disabledHomeScreenTabs[this.TAB_SUBTABS] = true;
        } else {
            this.homeScreenService.disabledHomeScreenTabs[this.TAB_EXTRA_BUTTONS] = false;
            this.homeScreenService.disabledHomeScreenTabs[this.TAB_SUBTABS] = false;
        }
    }

}
