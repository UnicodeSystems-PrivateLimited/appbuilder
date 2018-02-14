import { Component, ViewEncapsulation, } from '@angular/core';
import { PageService } from '../../theme/services';
import { Dropdown, SelectItem } from 'primeng/primeng';
import { PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Router, RouteConfig, RouterOutlet, RouteParams, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { AppInfoView } from './app-info-view';
import { IpaRequestAppList } from './ipa-request-app-list';

@Component({
    selector: 'ipa-request',
    directives: [Dropdown, PAGINATION_DIRECTIVES, ROUTER_DIRECTIVES],
    encapsulation: ViewEncapsulation.None,
    styles: [require('./ipa-request.scss')],
    template: require('./ipa-request.component.html'),
    pipes: [],
    providers: [PageService]
})

@RouteConfig([
    {
        name: 'IpaRequestAppList',
        component: IpaRequestAppList,
        path: '/ipaRequestAppList',
        useAsDefault: true
    },
    {
        name: 'AppInfoView',
        component: AppInfoView,
        path: '/appInfoView/:appId'
    }
])

export class IpaRequest {

    constructor(
    ) {
        
    }
   

}