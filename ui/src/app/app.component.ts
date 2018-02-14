import './app.loader.ts';

import {Component, ViewEncapsulation, enableProdMode} from '@angular/core';

import {GridDataService, PageService, FormDataService} from './theme/services';
import {Router, RouteConfig, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {Pages} from './pages';
import {Login} from './pages/login';
import {Forgot} from './pages/forgotPassword';
import {Register} from './pages/register';
import {AppState} from './app.state';
import {BaThemeConfigProvider, BaThemeConfig} from './theme';
import {BaThemeRun} from './theme/directives';
import {BaImageLoaderService, BaThemePreloader, BaThemeSpinner} from './theme/services';
import { ColorPickerService } from "./color-picker/color-picker.service";

import {layoutPaths} from './theme/theme.constants';

var firebase = require("firebase");
// enableProdMode();
/*
 * App Component
 * Top Level Component
 */
@Component({
    selector: 'app',
    pipes: [],
    directives: [BaThemeRun],
    providers: [BaThemeConfigProvider, BaThemeConfig, BaImageLoaderService, GridDataService, BaThemeSpinner, FormDataService, ColorPickerService],
    encapsulation: ViewEncapsulation.None,
    styles: [require('normalize.css'), require('./app.scss')],
    template: `
    <main [ngClass]="{'menu-collapsed': isMenuCollapsed}" baThemeRun>
      <div class="additional-bg"></div>
      <router-outlet></router-outlet>
    </main>
  `
})
@RouteConfig([
    {
        path: '/pages/...',
        name: 'Pages',
        component: Pages

    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        useAsDefault: true
    },
    {
        path: '/forgotPassword',
        name: 'Forgot',
        component: Forgot,

    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    // handle any non-registered route
    // and simply redirects back to dashboard page
    // you can specify any customer 404 page while it's not built in ito ng2-admin
    {
        path: '/**',
        redirectTo: ['Login']
    }
])
export class App {

    isMenuCollapsed: boolean = false;
    private _dataUrl = '../api/ws/ping';

    constructor(private dataService: GridDataService, private _state: AppState, private _imageLoader: BaImageLoaderService, private _spinner: BaThemeSpinner, private _config: BaThemeConfig, private router: Router) {
        this._loadImages();

        this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
            this.isMenuCollapsed = isCollapsed;
        });

        // Initialize Firebase
        if (!firebase.apps.length) {
            let config: Object = {
                apiKey: "AIzaSyBr-AQ9Pzc_Yi3xoOocorIVseqhGN659c0",
                authDomain: "tappit-88fcb.firebaseapp.com",
                databaseURL: "https://tappit-88fcb.firebaseio.com",
                projectId: "tappit-88fcb",
                storageBucket: "tappit-88fcb.appspot.com",
                messagingSenderId: "117583570120"
            };
            firebase.initializeApp(config);
        }
    }

    public ngAfterViewInit(): void {
        // hide spinner once all loaders are completed
        BaThemePreloader.load().then((values) => {
            this._spinner.hide();
        });
    }

    private _loadImages(): void {
        // register some loaders
        BaThemePreloader.registerLoader(this._imageLoader.load(layoutPaths.images.root + 'sky-bg.jpg'));
    }
    ngOnInit() {
    }

}
