/**
 * Layout Component
 */
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dropdown, InputSwitch, RadioButton, SelectItem } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { MobileAppDisplay } from '../../../../../../components';
import { HomeScreenService } from '../../../home-screen.service';
import { AppState } from '../../../../../../app.state';
import { HomeScreenSettings } from '../../../../../../theme/interfaces';


@Component({
    selector: 'layout',
    directives: [TOOLTIP_DIRECTIVES, Dropdown, TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, InputSwitch, MobileAppDisplay],
    template: require('./layout.component.html'),
    styles: [require('./layout.scss')],

})

export class LayoutComponent {
    checked: boolean;
    checkedStatus: boolean;
    layouts: SelectItem[];
    selectedLayout: string;
    rows: SelectItem[];
    selectedRow: string;
    tabs: SelectItem[];
    selectedTab: string;
    public overlayDisplay: string = "none";
    public traditional: boolean = false;
    public appId: number;
    public bottom: boolean = false;
    public top: boolean = false;
    public right: boolean = false;
    public left: boolean = false;

    @Output() traditionalPositionChange: EventEmitter<number> = new EventEmitter<number>();

    private TAB_LAYOUT: number = 0;
    private TAB_EXTRA_BUTTONS: number = 1;
    private TAB_SUBTABS: number = 2;
    private TAB_HEADERS: number = 3;
    private TAB_BUTTONS: number = 4;
    private TAB_ICON_COLOR: number = 5;

    constructor(
        private params: RouteParams,
        private service: HomeScreenService,
        private appState: AppState
    ) {
        this.layouts = [];
        this.layouts.push({ label: 'Traditional', value: 1 });
        this.layouts.push({ label: 'Modern Panel Slider List', value: 2 });
        this.layouts.push({ label: 'Modern Panel Slider Tiles', value: 3 });

        this.rows = [];
        this.rows.push({ label: 'Single Row', value: 1 });
        this.rows.push({ label: '2 Rows', value: 2 });
        this.rows.push({ label: '3 Rows', value: 3 });
        this.rows.push({ label: '4 Rows', value: 4 });

        this.tabs = [];
        this.tabs.push({ label: '3 Tabs', value: 3 });
        this.tabs.push({ label: '4 Tabs', value: 4 });
        this.tabs.push({ label: '5 Tabs', value: 5 });
        this.appId = this.appState.dataAppId;
    }

    public ngOnInit(): void {

    }

    public onBottomClick(type): void {
        this.service.homeScreenSettings.layout.traditional_position = type;
        this.traditionalPositionChange.emit(type);
    }

    public onTabRowsChange(): void {
        this.service.initTabRowsIterator();
    }

    public onHomeLayoutChange(): void {
        if (this.service.homeScreenSettings.layout.home_layout != 1) {
            this.service.tabRowsIterator = [];
            this.service.disabledHomeScreenTabs[this.TAB_EXTRA_BUTTONS] = false;
            this.service.disabledHomeScreenTabs[this.TAB_SUBTABS] = false;
        } else {
            this.service.initTabRowsIterator();
            if (this.service.homeScreenSettings.layout.traditional_position !== 2) {
                this.service.disabledHomeScreenTabs[this.TAB_EXTRA_BUTTONS] = true;
                this.service.disabledHomeScreenTabs[this.TAB_SUBTABS] = true;
            }
        }
    }

}