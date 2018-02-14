import { Component, ViewEncapsulation } from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, Control, AbstractControl } from '@angular/common';
import { Router, RouteConfig, RouterOutlet, RouteParams, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { DROPDOWN_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { SelectItem } from 'primeng/primeng';
import { BaCard } from '../../theme/components';
import { PageService, GridDataService } from '../../theme/services';
import { Dialog, Dropdown, Growl, Message } from 'primeng/primeng';
import { EmailValidator, EqualPasswordsValidator, UrlValidator, AlphaValidator } from '../../theme/validators';
import { MyAppPipe } from '../../theme/pipes';
import { AppState } from '../../app.state';
import { Observable } from 'rxjs/Observable';
import { MyApp } from '../myApp';
import { Settings } from '../settings';
import { SettingsService } from '../settings/settings.service';
import { DomSanitizationService } from "@angular/platform-browser";


@Component({
    selector: 'customer-portal',
    pipes: [MyAppPipe],
    directives: [ROUTER_DIRECTIVES, BaCard, DROPDOWN_DIRECTIVES, Growl, Dialog, Dropdown, PAGINATION_DIRECTIVES],
    encapsulation: ViewEncapsulation.None,
    styles: [require('../settings/settings.scss')],
    template: require('./customer-portal.component.html'),
    providers: [GridDataService, PageService, SettingsService]
})
@RouteConfig([
    {
        name: 'MyApp',
        component: MyApp,
        path: '/myApp',
        useAsDefault: true,
    },
     {
        name: 'Settings',
        component: Settings,
        path: '/app/...',
    },
])

export class CustomerPortal {
    public appId: any;
    public appCode: any;
    public appSimulatorURL: any;

    constructor(settingsService: SettingsService, protected appState: AppState, protected router: Router, private sanitizer: DomSanitizationService) {
        this.appState.isCustomerLogin = true;
    }
}