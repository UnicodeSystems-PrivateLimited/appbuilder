import { Component, ViewEncapsulation } from '@angular/core';
import {  TAB_DIRECTIVES  } from 'ng2-bootstrap/ng2-bootstrap';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Tab } from '../../../../../theme/interfaces';
import { MobileViewComponent } from '../../../../../components';
import { TellFriendService } from './tell-friend.service';


@Component({
    selector: 'tab-function-tell-friend-tab',
    directives: [MobileViewComponent],
    template: require('./tell-friend.component.html'),
    providers: [PageService, , GridDataService, TellFriendService]
})

export class TellFriend {

    public tabId: number;
    public showLoader:boolean=false;
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
 
    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: TellFriendService,
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