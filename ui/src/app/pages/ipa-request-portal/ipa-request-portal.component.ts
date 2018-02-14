import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouteConfig, RouterOutlet, RouteParams, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { BaCard } from '../../theme/components';
import { AppState } from '../../app.state';
import { IpaRequest } from '../ipa-request';





@Component({
    selector: 'ipa-request-portal',
    directives: [ROUTER_DIRECTIVES, BaCard],
    encapsulation: ViewEncapsulation.None,
    styles: [require('../settings/settings.scss')],
    template: require('./ipa-request-portal.component.html'),
})
@RouteConfig([
    {
        name: 'IpaRequest',
        component: IpaRequest,
        path: '/ipaRequest/...',
        useAsDefault: true,
    }
])

export class IpaRequestPortal {

    constructor(protected appState: AppState, protected router: Router) {
        this.appState.isDeveloperLogin = true;
    }
}