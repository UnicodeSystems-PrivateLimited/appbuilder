/**
 * Fonts Component
 * 
 * 
 */
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { InputSwitch, Slider, SelectItem, Dropdown } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { GlobalStyleSettings } from '../../../../../../theme/interfaces';
import { GlobalStyleService } from '../../../global-style.service';
import { AppState } from '../../../../../../app.state';

@Component({
    selector: 'fonts',
    directives: [TOOLTIP_DIRECTIVES, TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, InputSwitch, Slider, Dropdown],
    template: require('./fonts.component.html'),
})

export class FontsComponent {
    checked: boolean = true;
    public appId: number;


    constructor(private params: RouteParams,
        private service: GlobalStyleService,
        private appState: AppState) {

    }

    public onFontClick(id: number): void {
        this.service.getSingleFontData(id).subscribe((res) => {
            if (res.success) {
                console.log(res.data);
                // this.service.font_value = res.data.value;
                this.service.globalStyleSettings.fonts.font_id = id;
            }
            else {
                console.log('No font Available');
            }
        });
    }
}
