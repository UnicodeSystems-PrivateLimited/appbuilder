import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { InputSwitch, Slider, Dropdown } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { GlobalStyleSettings, GlobalStyleIndividualTabs } from '../../../theme/interfaces';
import { AppState } from '../../../app.state';
import { ColorPickerDirective } from "../../../color-picker/color-picker.directive";
import { GlobalStyleService } from '../../../pages/settings/app-display/global-style.service';


@Component({
    selector: 'individual-tab-color',
    directives: [TOOLTIP_DIRECTIVES, TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, InputSwitch, Dropdown, Slider, ColorPickerDirective],
    template: require('./color.component.html'),
})

export class IndividualTabColor {
    checked: boolean = true;
    public appId: number;
    public headerBackgroundImg: File = null;

    constructor(private params: RouteParams,
        private appState: AppState,
        private pageService: PageService,
        private dataService: GridDataService,
        private service: GlobalStyleService
    ) {

        this.appId = appState.dataAppId;
    }

    public onThemeClick(id: number): void {
        this.service.getSingleThemeData(id).subscribe((res) => {
            if (res.success) {
                console.log(res.data);
                if (res.data.section_bar) {
                    this.service.individualTabSettings.color.section_bar = res.data.section_bar;
                }
                if (res.data.section_text) {
                    this.service.individualTabSettings.color.section_text = res.data.section_text;
                }
                if (res.data.row_bar) {
                    this.service.individualTabSettings.color.row_bar = res.data.row_bar;
                }
                if (res.data.row_text) {
                    this.service.individualTabSettings.color.row_text = res.data.row_text;
                }
                if (res.data.even_row_text) {
                    this.service.individualTabSettings.color.even_row_text = res.data.even_row_text;
                }
                if (res.data.even_row_bar) {
                    this.service.individualTabSettings.color.even_row_bar = res.data.even_row_bar;
                }
            }
            else {
                console.log('No color Theme Available');
            }
        });
    }
}