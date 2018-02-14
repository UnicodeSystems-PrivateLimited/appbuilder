import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, Control, AbstractControl } from '@angular/common';
import { Router, RouteConfig, RouterOutlet, RouteParams, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { PageService, GridDataService } from '../../theme/services';
import { Dialog, Dropdown } from 'primeng/primeng';
import { CTheme } from './c-theme';
import { CHeader } from './c-header';
import { CSteps } from './c-steps';
import { CPreviewer } from './c-previewer';
import { CFooter } from './c-footer';
import { CLoginPage } from './c-login-page';
import { CPanelService } from './c-panel.service';
import { CPanelData, CPanelSetting } from '../../theme/interfaces/c-panel-declaration';

@Component({
    selector: 'c-panel',
    directives: [ROUTER_DIRECTIVES, DROPDOWN_DIRECTIVES, Dialog, Dropdown],
    encapsulation: ViewEncapsulation.None,
    styles: [require('../settings/settings.scss')],
    template: require('./c-panel.component.html'),
    providers: [GridDataService, PageService, CPanelService]
})

@RouteConfig([
    {
        name: 'CTheme',
        component: CTheme,
        path: '/theme',
        useAsDefault: true
    },
    {
        name: 'CHeader',
        component: CHeader,
        path: '/header',
    },
    {
        name: 'CSteps',
        component: CSteps,
        path: '/steps',
    },
    {
        name: 'CPreviewer',
        component: CPreviewer,
        path: '/previewer',
    },
    {
        name: 'CFooter',
        component: CFooter,
        path: '/footer',
    },
    {
        name: 'CLoginPage',
        component: CLoginPage,
        path: '/loginPage',
    }
])
export class CPanel {

    public staticCPanel: typeof CPanelService = CPanelService;
    public cPanelData: CPanelData = new CPanelData();
    public cPanelSetting: CPanelSetting = new CPanelSetting();
    private BUTTON_ENABLED: number = 1;
    private BUTTON_DISABLED: number = 0;
    public showLoader: boolean = false;
    public appId;
    constructor(
        protected router: Router,
        protected routeParams: RouteParams,
        private service: CPanelService,
        private page: PageService
    ) {
        this.appId = routeParams.get('appId');
        PageService.showpushNotificationButton = false;
        if (this.appId == null) {
            this.appId = 0;
        }
        console.log('this.appId cpanel', this.appId);
    }

    public ngOnInit(): void {
        this.staticCPanel.appId = this.appId;
        this.getInitData();
        this.getAllThems();
        this.getClientLanguages();
    }

    public getInitData(): void {
        this.showLoader = true;
        this.staticCPanel.refreshLoginComponent = true;
        this.service.getInitData(this.appId).subscribe((res) => {
            if (res.success) {
                console.log("data", res);
                this.staticCPanel.cFooterData.footer_bg_color = res.data.footer.footer_bg_color ? res.data.footer.footer_bg_color : '#252525';
                this.staticCPanel.cFooterData.footer_copyright_html = res.data.footer.footer_copyright_html ? res.data.footer.footer_copyright_html : '';
                this.staticCPanel.cFooterData.footer_menu_header_color = res.data.footer.footer_menu_header_color ? res.data.footer.footer_menu_header_color : "#ffffff";
                this.staticCPanel.cFooterData.footer_menu_link_color = res.data.footer.footer_menu_link_color ? res.data.footer.footer_menu_link_color : "#bcbcbc";
                this.staticCPanel.cFooterData.navigationCol1 = res.data.footer.navigationCol1 ? res.data.footer.navigationCol1 : [];
                this.staticCPanel.cFooterData.navigationCol2 = res.data.footer.navigationCol2 ? res.data.footer.navigationCol2 : [];
                this.staticCPanel.cHeaderData.header_link_color = res.data.header.header_link_color ? res.data.header.header_link_color : "#000000";
                this.staticCPanel.cHeaderData.header_start_over = res.data.header.header_start_over ? res.data.header.header_start_over : 0;
                this.staticCPanel.cHeaderData.navigation = res.data.header.navigation ? res.data.header.navigation : [];
                this.staticCPanel.cLoginData = res.data.login_page;
                this.staticCPanel.cPreViewerData = res.data.previewer;
                this.staticCPanel.cStepsData = res.data.steps;
                this.staticCPanel.cThemeData = res.data.theme;
                if (this.staticCPanel.cThemeData.theme_default_settings == 1) {
                    this.staticCPanel.defaultCmsSettingButton = true;
                } else {
                    this.staticCPanel.defaultCmsSettingButton = false;
                }
            } else {
                console.log("some server error occure");
            }
            this.showLoader = false;
            this.staticCPanel.refreshLoginComponent = false;
        })
    }
    public getAllThems() {
        this.service.getThemes().subscribe((res) => {
            if (res.success) {
                this.staticCPanel.allTheme = res.data.themes;
                this.staticCPanel.allThemeData = res.data.themes_data;
            } else {
                console.log("server error occure");
            }
        });
    }
    public getClientLanguages() {
        this.service.getLanguages().subscribe((res) => {
            if (res.success) {
                this.staticCPanel.clientLanguage = res.data.languages;
            } else {
                console.log("server error occure");
            }
        });
    }

    public saveCPanelSettings(): void {

        this.showLoader = true;
        /************    start of step data   ***********/
        this.staticCPanel.cThemeData.theme_default_settings = this.changeBooleanToNumber(this.staticCPanel.cThemeData.theme_default_settings);
        this.staticCPanel.cThemeData.theme_logo = this.service.getLastSegmentFromUrl(this.staticCPanel.cThemeData.theme_logo);
        this.cPanelSetting.theme = this.staticCPanel.cThemeData;

        /************    start of step data   ***********/
        this.staticCPanel.cStepsData.steps_app_code_widget = this.changeBooleanToNumber(this.staticCPanel.cStepsData.steps_app_code_widget);
        this.staticCPanel.cStepsData.steps_appearance = this.changeBooleanToNumber(this.staticCPanel.cStepsData.steps_appearance);
        this.staticCPanel.cStepsData.steps_content = this.changeBooleanToNumber(this.staticCPanel.cStepsData.steps_content);
        this.staticCPanel.cStepsData.steps_functionality = this.changeBooleanToNumber(this.staticCPanel.cStepsData.steps_functionality);
        this.staticCPanel.cStepsData.steps_preview_tool = this.changeBooleanToNumber(this.staticCPanel.cStepsData.steps_preview_tool);
        this.staticCPanel.cStepsData.steps_publish = this.changeBooleanToNumber(this.staticCPanel.cStepsData.steps_publish);
        this.cPanelSetting.steps = this.staticCPanel.cStepsData;

        /************    start of Header data   ***********/
        this.staticCPanel.cHeaderData.header_start_over = this.changeBooleanToNumber(this.staticCPanel.cHeaderData.header_start_over);
        this.cPanelSetting.header = this.staticCPanel.cHeaderData;

        /************    start of Footer data   ***********/
        this.cPanelSetting.footer = this.staticCPanel.cFooterData;

        /************    start of PREVIEWER data   ***********/
        this.staticCPanel.cPreViewerData.prev_bg_image = this.service.getLastSegmentFromUrl(this.staticCPanel.cPreViewerData.prev_bg_image);
        this.staticCPanel.cPreViewerData.prev_load_image = this.service.getLastSegmentFromUrl(this.staticCPanel.cPreViewerData.prev_load_image);
        this.staticCPanel.cPreViewerData.prev_play_image = this.service.getLastSegmentFromUrl(this.staticCPanel.cPreViewerData.prev_play_image);
        this.cPanelSetting.previewer = this.staticCPanel.cPreViewerData;

        /************    start of Login data   ***********/
        this.staticCPanel.cLoginData.login_bg_image = this.service.getLastSegmentFromUrl(this.staticCPanel.cLoginData.login_bg_image);
        this.staticCPanel.cLoginData.login_logo = this.service.getLastSegmentFromUrl(this.staticCPanel.cLoginData.login_logo);
        this.staticCPanel.cLoginData.login_bg_repeat = this.changeBooleanToNumber(this.staticCPanel.cLoginData.login_bg_repeat);
        this.staticCPanel.cLoginData.login_use_custom = this.changeBooleanToNumber(this.staticCPanel.cLoginData.login_use_custom);
        this.cPanelSetting.login_page = this.staticCPanel.cLoginData;
        this.cPanelData.client_permission = this.cPanelSetting;
        this.cPanelData.login_bg_image = this.staticCPanel.loginBgImage;
        this.cPanelData.appId = this.appId;
        console.log("this.cPanelData", this.cPanelData);
        this.service.save(this.cPanelData).subscribe((res) => {
            if (res.success) {
                this.clearInputs();

                this.page.showSuccess(res.message);
            } else {
                this.page.showError(res.message);
            }
            this.getInitData();
            this.showLoader = false;

        });
    }

    public changeBooleanToNumber(value: number | boolean): number {
        return value ? this.BUTTON_ENABLED : this.BUTTON_DISABLED;
    }
    public clearInputs(): void {
        if (this.staticCPanel.loginBgImageTarget) {
            this.staticCPanel.loginBgImageTarget.value = null;
        }
        this.staticCPanel.loginBgImage = null;
    }

}