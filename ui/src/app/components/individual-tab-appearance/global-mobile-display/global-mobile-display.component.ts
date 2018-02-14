import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { TOOLTIP_DIRECTIVES, PAGINATION_DIRECTIVES, TAB_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dropdown, SelectItem, TabView, TabPanel, Dialog } from 'primeng/primeng';
import { GridDataService, PageService, FormDataService } from '../../../theme/services';
import { GlobalStyleService } from '../../../pages/settings/app-display/global-style.service';
import { HomeScreenService } from '../../../pages/settings/app-display/home-screen.service';


@Component({
    selector: 'global-mobile-display',
    directives: [TOOLTIP_DIRECTIVES, Dropdown, TabView, TabPanel, Dialog, PAGINATION_DIRECTIVES, TAB_DIRECTIVES],
    encapsulation: ViewEncapsulation.None,
    template: require('./global-mobile-display.component.html'),
})

export class GlobalMobileDisplay {
    @Input() tabId: any;
    @Input() homeData: any;

    constructor(
        private dataService: GridDataService,
        private pageService: PageService,
        private globalStyleService: GlobalStyleService,
        private homeScreenService: HomeScreenService

    ) {
    }
}