/**
 * icon-color Component
 * 
 * 
 */
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { InputSwitch } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { HomeScreenService } from '../../../home-screen.service';
import { ColorPickerDirective } from "../../../../../../color-picker/color-picker.directive";

@Component({
    selector: 'icon-color',
    directives: [TOOLTIP_DIRECTIVES, TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, InputSwitch, ColorPickerDirective],
    template: require('./icon-color.component.html'),
    styles: [require('./icon-color.scss')],

})

export class IconColorComponent {
    checked: boolean = true;
    public overlayDisplay: string = "none";
    public showIcon: string = '';

    constructor(
        private params: RouteParams,
        private service: HomeScreenService
    ) {

    }

}
