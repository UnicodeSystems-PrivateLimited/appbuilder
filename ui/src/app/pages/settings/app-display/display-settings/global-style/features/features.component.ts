/**
 * Features Component
 * 
 * 
 */
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { SelectItem } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { GlobalStyleSettings } from '../../../../../../theme/interfaces';
import { GlobalStyleService } from '../../../global-style.service';
import { AppState } from '../../../../../../app.state';
import { ColorPickerDirective } from "../../../../../../color-picker/color-picker.directive";

@Component({
    selector: 'features',
    directives: [TOOLTIP_DIRECTIVES, TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, ColorPickerDirective],
    template: require('./features.component.html'),
})

export class FeaturesComponent {
    checked: boolean = true;

    constructor(private params: RouteParams,
        private service: GlobalStyleService,
        private appState: AppState) {



    }


}
