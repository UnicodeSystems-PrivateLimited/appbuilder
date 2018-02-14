import { Component, ViewEncapsulation, OnInit, HostListener } from '@angular/core';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Tab, GateAccessData } from '../../../../../theme/interfaces';
import { GateAccessService } from './gate-access.service';
import { MobileViewComponent } from '../../../../../components';

@Component({
    selector: 'tab-function-gate-access',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, MobileViewComponent],
    encapsulation: ViewEncapsulation.None,
    template: require('./gate-access.component.html'),
    styles: [require('./gate-access.scss')],
    viewProviders: [],
    providers: [PageService, GateAccessService]
})

export class GateAccess implements OnInit {
    public tabId: number;
    public ready: boolean = false;
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };

    public bannerImageTarget: any = null;
    public gateAccessData: GateAccessData = new GateAccessData();
    public bannerImage: string | File;
    public addSaveButtonHide: boolean = false;

    constructor(
        private pageService: PageService,
        private params: RouteParams,
        private service: GateAccessService,
        private dataService: GridDataService
    ) {
        this.tabId = parseInt(params.get('tabId'));

    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        // One request to get all initial data.
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                this.tabData = res.data.tabData;
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onBannerImageChange(event: any): void {
        this.gateAccessData.banner_image = event.target.files[0];
        this.bannerImageTarget = event.target;
    }

    public deleteBannerImage(id: number): void {
        var yes = window.confirm("Do you really want to delete Image. ");
        if (yes) {

        }
    }

    public onFormSubmit() {
        this.gateAccessData.tab_id = this.tabId;
        console.log("dfata", this.gateAccessData);
        
    }


}