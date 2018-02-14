import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

import { BaPageTop, BaContentTop, BaSidebar, BaBackTop } from '../theme/components';

import { Dashboard } from './dashboard';
import { Ui } from './ui';
import { Maps } from './maps';
import { Charts } from './charts';
import { Forms } from './forms';
import { Tables } from './tables';
import { MyApp } from './myApp';
import { Settings } from './settings';
import { Profile } from './profile';
import { AddUser } from './addUser';
import { AddColorIcons } from './add-color-icons';
import { AddPhotosIcons } from './add-photos-icons';
import { Growl } from 'primeng/primeng';
import { PageService } from '../theme/services';
import { CustomerPortal } from './customer-portal';
import { CPanel } from './c-panel';
import { SettingsService } from './settings/settings.service';
import { IpaRequest } from './ipa-request';
import { IpaRequestPortal } from './ipa-request-portal';


@Component({
    selector: 'pages',
    encapsulation: ViewEncapsulation.None,
    styles: [require('./pages.scss')],
    directives: [BaPageTop, BaSidebar, BaContentTop, BaBackTop, Growl],
    template: `
    
    <ba-page-top></ba-page-top>
    <div class="al-main">
      <div class="al-content">
        
        <router-outlet></router-outlet>
      </div>
    </div>
    <footer class="al-footer clearfix footer-data layout-column" [style.background]="staticSettingService.appSettingData.footer?.footer_bg_color">
                 <div class="layout-row">
                   <div class="layout-column flex-30" *ngIf="staticSettingService.appSettingData.footer?.navigationCol1">
                    <div class="layout-column" [style.color]="staticSettingService.appSettingData.footer?.footer_menu_header_color">
                        <span>{{ staticSettingService.appSettingData.footer?.navigationCol1[0].label}}</span>
                    </div>
                    <div class="layout-column c-p" (click)="openLink(col1)" [style.color]="staticSettingService.appSettingData.footer?.footer_menu_link_color" *ngFor="let col1 of staticSettingService.appSettingData.footer.navigationCol1 | slice:1">
                        <span>{{col1.label}}</span>
                    </div>
                </div>
                <div class="layout-column flex-30" *ngIf="staticSettingService.appSettingData.footer?.navigationCol2">
                    <div class="layout-column" [style.color]="staticSettingService.appSettingData.footer?.footer_menu_header_color">
                        <span>{{staticSettingService.appSettingData.footer?.navigationCol2[0].label}}</span>
                    </div>
                    <div class="layout-column c-p" (click)="openLink(col2)" [style.color]="staticSettingService.appSettingData.footer?.footer_menu_link_color" *ngFor="let col2 of staticSettingService.appSettingData.footer.navigationCol2 | slice:1">
                        <span>{{col2.label}}</span>
                    </div>
                </div></div>
      <div class="al-footer-right">Created with <i class="ion-heart"></i></div>
      <div class="al-footer-main clearfix">
        <div class="al-copy" *ngIf="staticSettingService.appSettingData.footer?.footer_copyright_html" [innerHTML]="staticSettingService.appSettingData.footer?.footer_copyright_html"></div>
        <div class="al-copy" *ngIf="!staticSettingService.appSettingData.footer?.footer_copyright_html">&copy; Tappit Technology</div>
      </div>
    </footer>
    <p-growl [value]="staticPageService.msgs" [life]="staticPageService.msgLife"></p-growl>
    <div *ngIf="staticPageService.loaderDisplay" class="fm-spinner fm-page-fixed">
        <div class="fm-double-bounce1"></div>
        <div class="fm-double-bounce2"></div>
    </div>
    <ba-back-top position="200"></ba-back-top>
    `,
    providers: [PageService]
})
@RouteConfig([
    {
        name: 'Dashboard',
        component: Dashboard,
        path: '/dashboard',
    },
    {
        name: 'Ui',
        component: Ui,
        path: '/ui/...',
    },
    {
        name: 'Profile',
        component: Profile,
        path: '/profile/',
    },
    
    {
        name: 'AddUser',
        component: AddUser,
        path: '/addUser/',
    },
    {
        name: 'AddColorIcons',
        component: AddColorIcons,
        path: '/add-color-icons/',
    },
    {
        name: 'AddPhotosIcons',
        component: AddPhotosIcons,
        path: '/add-photos-icons/',
    },
    {
        name: 'Maps',
        component: Maps,
        path: '/maps/...',
    },
    {
        name: 'Forms',
        component: Forms,
        path: '/forms/...',
    },
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
    {
        name: 'Tables',
        component: Tables,
        path: '/tables/...',
    },
    {
        name: 'CustomerPortal',
        component: CustomerPortal,
        path: '/customerPortal/...',
    },
    {
        name: 'CPanel',
        component: CPanel,
        path: '/cPanel/...',
    },
    {
        name: 'IpaRequest',
        component: IpaRequest,
        path: '/ipaRequest/...',
    },
    {
        name: 'IpaRequestPortal',
        component: IpaRequestPortal,
        path: '/ipaRequestPortal/...',
    }
])
export class Pages {

    public staticPageService: typeof PageService = PageService;
    public staticSettingService: typeof SettingsService = SettingsService;

    constructor() {
    }

    ngOnInit() {
    }

    public openLink(nav: any) {
        window.open(nav.link);
    }
}
