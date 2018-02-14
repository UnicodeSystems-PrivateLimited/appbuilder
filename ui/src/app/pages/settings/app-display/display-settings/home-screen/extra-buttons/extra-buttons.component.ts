/**
 * Extra Button Component
 * 
 * 
 */
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { InputSwitch, SelectItem } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { HomeScreenSettings } from '../../../../../../theme/interfaces';
import { HomeScreenService } from '../../../home-screen.service';
import { AppState } from '../../../../../../app.state';
import { MobileAppDisplay } from '../../../../../../components';


@Component({
    selector: 'extra-buttons',
    directives: [TOOLTIP_DIRECTIVES, TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, MobileAppDisplay, InputSwitch],
    template: require('./extra-buttons.component.html'),
})

export class ExtraButtonsComponent {
    checked: boolean = true;
    public appId: number;

    private TAB_LAYOUT: number = 0;
    private TAB_EXTRA_BUTTONS: number = 1;
    private TAB_SUBTABS: number = 2;
    private TAB_HEADERS: number = 3;
    private TAB_BUTTONS: number = 4;
    private TAB_ICON_COLOR: number = 5;

    constructor(private params: RouteParams,
        private service: HomeScreenService,
        private appState: AppState) {

        this.appId = this.appState.dataAppId;
        
    }

    public ngOnInit(): void {

    }

}
