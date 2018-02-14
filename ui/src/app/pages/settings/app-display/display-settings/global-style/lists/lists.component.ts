/**
 * Lists Component
 * 
 * 
 */
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import {  SelectItem, Dropdown } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { GlobalStyleSettings } from '../../../../../../theme/interfaces';
import { GlobalStyleService } from '../../../global-style.service';
import { AppState } from '../../../../../../app.state';
import { ColorPickerDirective } from "../../../../../../color-picker/color-picker.directive";

@Component({
    selector: 'lists',
    directives: [TOOLTIP_DIRECTIVES, TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, Dropdown, ColorPickerDirective],
    template: require('./lists.component.html'),
})

export class ListsComponent {
    checked: boolean = true;

    constructor(private params: RouteParams,
        private service: GlobalStyleService,
        private appState: AppState) {

    }

    public onThemeClick(id: number): void {
        this.service.getSingleThemeData(id).subscribe((res) => {
            if (res.success) {
                console.log(res.data);
                if (res.data.section_bar) {
                    this.service.globalStyleSettings.lists.section_bar = res.data.section_bar;
                }
                if (res.data.section_text) {
                    this.service.globalStyleSettings.lists.section_text = res.data.section_text;
                }
                if (res.data.row_bar) {
                    this.service.globalStyleSettings.lists.row_bar = res.data.row_bar;
                }
                if (res.data.row_text) {
                    this.service.globalStyleSettings.lists.row_text = res.data.row_text;
                }
                 if (res.data.even_row_text) {
                    this.service.globalStyleSettings.lists.even_row_text = res.data.even_row_text;
                }
                 if (res.data.even_row_bar) {
                    this.service.globalStyleSettings.lists.even_row_bar = res.data.even_row_bar;
                }
            }
            else {
                console.log('No color Theme Available');
            }
        });
    }
}
