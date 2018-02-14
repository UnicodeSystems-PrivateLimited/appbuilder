import { Component, ViewEncapsulation } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { Tab } from '../../../../../theme/interfaces';
import { MobileViewComponent } from '../../../../../components';
import { QrScannerService } from './qr-scanner.service';


@Component({
    selector: 'tab-function-qr-scanner-tab',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, Dragula, MobileViewComponent],
    template: require('./qr-scanner.component.html'),
    viewProviders: [DragulaService],
    providers: [PageService, , GridDataService, QrScannerService]
})

export class QrScanner {

    public tabId: number;
    public showLoader:boolean=false;
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
 
    constructor(private pageService: PageService,
        private params: RouteParams,
        private dragulaService: DragulaService,
        private service: QrScannerService,
        private dataService: GridDataService) {
        this.tabId = parseInt(params.get('tabId'));

    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
               this.showLoader = true;
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                this.showLoader = false;
                this.tabData = res.data.tabData;
            } else {
                console.log('no data found');
            }
        });
    }
}