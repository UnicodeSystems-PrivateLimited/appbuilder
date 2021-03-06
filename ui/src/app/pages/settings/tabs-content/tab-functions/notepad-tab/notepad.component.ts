import { Component, ViewEncapsulation } from '@angular/core';
import {  TAB_DIRECTIVES  } from 'ng2-bootstrap/ng2-bootstrap';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Tab } from '../../../../../theme/interfaces';


@Component({
    selector: 'tab-function-notepad-tab',
    directives: [],
    template: require('./notepad.component.html'),
    providers: [PageService, , GridDataService]
})

export class NotepadTab {

    public tabId: number;
    public showLoader: boolean = false;

    constructor(private pageService: PageService,
        private params: RouteParams,
        private dataService: GridDataService) {
        this.tabId = parseInt(params.get('tabId'));

    }


}