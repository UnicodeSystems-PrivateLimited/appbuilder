/**
 * Blur Effect Component
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
    selector: 'blur-effect',
    directives: [TOOLTIP_DIRECTIVES, TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, Dropdown, ColorPickerDirective],
    template: require('./blur-effect.component.html'),
    styles: [require('./blur-effect.scss')],
})

export class BlurEffectComponent {
    checked: boolean = true;
    public checkAll: boolean = false;
    // public overlayDisplay: string = "block";

    constructor(private params: RouteParams,
        private service: GlobalStyleService,
        private appState: AppState) {
    }

    public refreshSelectedItems(): void {
        this.service.globalStyleSettings.blur_effect = [];
    }

    public onCheckAllChange(): void {
        this.refreshSelectedItems();
        if (!this.service.globalBlurCheckAll) {
            this.service.overlayDisplay = "block";
            for (let i in this.service.appTabs) {
                this.service.globalStyleSettings.blur_effect[this.service.appTabs[i].id] = true;
            }
        }
        else {
            this.service.overlayDisplay = "none";
                for (let i in this.service.appTabs) {
                this.service.globalStyleSettings.blur_effect[this.service.appTabs[i].id] = false;
            }
        }
    }
    
    public onCheckTabChange(checkedTabValue, checkedTab): void {
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.service.appTabs.forEach((appTabs) => {
                if (appTabs.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.service.globalStyleSettings.blur_effect[appTabs.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.service.globalBlurCheckAll = flag ? true : false;
        this.service.overlayDisplay = this.service.globalBlurCheckAll ? "block" : "none";
    }
}
