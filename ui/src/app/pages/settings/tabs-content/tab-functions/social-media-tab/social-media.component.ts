import { Component, ViewEncapsulation } from '@angular/core';
import { TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { RadioButton, Dialog  } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { SocialMediaService } from './social-media.service';
import { Tab } from '../../../../../theme/interfaces';
import { MobileViewComponent } from '../../../../../components';
import { AppState } from '../../../../../app.state';
import { DomSanitizationService } from "@angular/platform-browser";
import { HomeScreenService } from '../../../app-display/home-screen.service';
import {DatePipe} from '../../../../../pipes/date-format.pipe';
var moment = require('moment/moment');


@Component({
    selector: 'tab-function-social',
    pipes: [DatePipe],
    directives: [TOOLTIP_DIRECTIVES, RadioButton, MobileViewComponent, Dragula, Dialog],
    encapsulation: ViewEncapsulation.None,
    template: require('./social-media.component.html'),
    viewProviders: [DragulaService],
    providers: [PageService, SocialMediaService, GridDataService, HomeScreenService]
})

export class SocialMediaTab {
    public id: number;
    public tabId: number;
    public appId: number;
    public appCode: string;
    public comments = [];
    public users = [];
    public showLoader: boolean = false;
    public deleteUserId: number = null;
    public showDeleteDialog: boolean = false;
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: SocialMediaService,
        private dataService: GridDataService,
        private homeScreenService: HomeScreenService,
        protected appState: AppState) {
        this.tabId = parseInt(params.get('tabId'));
        this.id = parseInt(params.get('ids'));
        this.appId = this.appState.dataAppId;
        this.appCode = this.appState.dataAppCode;
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        this.showLoader = true;
        this.service.getInitData(this.appId, this.tabId).subscribe(res => {
            if (res.success) {
                this.showLoader = false;
                this.users = res.data.userList;
                for(let item of this.users){
                    if(item.fanwall == null){
                        item.fanwall = 0;
                    }
                    if(item.comment == null){
                        item.comment = 0;
                    }
                }
                this.tabData = res.data.tabData;
            } else {
                console.log('no data found');
            }
        });
    }

    public onDelete(id: number): void {
        this.deleteUserId = id;
        this.showDeleteDialog = true;
        this.pageService.onDialogOpen();
    }

    public deleteUser(): void {
        this.showLoader = true;
        this.service.deleteUser([this.deleteUserId]).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.showDeleteDialog = false;
                this.pageService.showSuccess(res.message);
                this.getInitData();
                this.users.forEach((user, index) => {
                    if (user.id === this.deleteUserId) {
                        this.users.splice(index, 1);
                    }
                });
            } else {
                this.pageService.showError(res.message);
            }
        });
    }
}