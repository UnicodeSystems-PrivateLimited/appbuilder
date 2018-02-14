/**
 * Individual Tabs Component
 * 
 * 
 */
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import {  SelectItem, Dropdown, Dialog } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { GlobalStyleSettings, TabData, GlobalStyleIndividualTabs, IndividualTabsButtons } from '../../../../../../theme/interfaces';
import { GlobalStyleService } from '../../../global-style.service';
import { HomeScreenService } from '../../../home-screen.service';
import { AppState } from '../../../../../../app.state';
import { ColorPickerDirective } from "../../../../../../color-picker/color-picker.directive";
import { IndividualAppTabsComponent} from '../../../../../../components';

@Component({
    selector: 'individual-tabs',
    directives: [TOOLTIP_DIRECTIVES, TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, PAGINATION_DIRECTIVES, Dialog, Dropdown, ColorPickerDirective, IndividualAppTabsComponent],
    template: require('./individual-tabs.component.html'),
})

export class IndividualTabsComponent {
    checked: boolean = true;
    colorTheme: SelectItem[];
    selectedcolorTheme: string;
    public appId: number;
    public tabs = [];
    constructor(private params: RouteParams,
        private service: GlobalStyleService,
        private appState: AppState,
        private pageService: PageService,
        public homeScreenService: HomeScreenService,
        private dataService: GridDataService

    ) {
        this.appId = this.appState.dataAppId;
        console.log(this.appId);
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
                this.service.tabData.tab_func_id = res.data.tab_func_id;
                this.service.tabData.type = res.data.type;
                this.service.tabData.icon_name = res.data.icon_name;
                this.getIndividualTabAppearance(id);
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
