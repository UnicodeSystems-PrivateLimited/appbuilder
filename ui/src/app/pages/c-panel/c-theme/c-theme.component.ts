import { Component, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, Control, AbstractControl } from '@angular/common';
import { Router, RouteConfig, RouterOutlet, RouteParams, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { DROPDOWN_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Observable } from 'rxjs/Observable';
import { DomSanitizationService } from "@angular/platform-browser";
import { PageService, GridDataService } from '../../../theme/services';
import { Dialog, Dropdown } from 'primeng/primeng';
import { ColorPickerDirective } from "../../../color-picker/color-picker.directive";
import { CPanelService } from "../c-panel.service";
import { BaCpanelImageUploader } from "../../../theme/components/baCpanelImageUploader";
import { BaCpanelPreview } from "../../../components/baCpanelPreview";
@Component({
    selector: 'c-theme',
    directives: [ROUTER_DIRECTIVES, DROPDOWN_DIRECTIVES, PAGINATION_DIRECTIVES, Dropdown, Dialog, ColorPickerDirective, BaCpanelImageUploader, BaCpanelPreview],
    encapsulation: ViewEncapsulation.None,
    styles: [require('../../settings/settings.scss')],
    template: require('./c-theme.component.html'),
    providers: [GridDataService, PageService, CPanelService]
})

export class CTheme {
    public themeColor: any[] = [];
    public themeData: typeof CPanelService = CPanelService;
    public replaceLogoDialog: boolean = false;
    public showDeleteLogoDialog: boolean = false;
    public headerTitleOfDialog: string = "Select Your Logo";
    public logotype: number = 1;
    constructor(
        protected router: Router,
        private sanitizer: DomSanitizationService,
        private service: CPanelService,
        private _changeDetectionRef: ChangeDetectorRef
    ) {

    }

    public openReplaceLogoDialog(): void {
        console.log("openReplaceLogoDialog called");
        this.replaceLogoDialog = true;
    }

    public onReplaceDialogDismiss(e: any): void {
        console.log("e", e);
        if (e.image) {
            this.themeData.cThemeData.theme_logo = e.image;
        }
        this.replaceLogoDialog = false;
    }

    public onThemeColorChange(e: any): void {
        this.themeData.cThemeData.theme_header_bg_color1 = this.themeData.allThemeData[e.value].theme_bg_color1;
        this.themeData.cThemeData.theme_header_bg_color2 = this.themeData.allThemeData[e.value].theme_bg_color2;
        this.themeData.cThemeData.theme_header_bg_color3 = this.themeData.allThemeData[e.value].theme_bg_color3;
    }

    public ngAfterViewInit(): void {
        this._changeDetectionRef.detectChanges();
    }

    public defaultCMSData(event): void {
        this.service.updateDefaultSettings().subscribe((res) => {
            console.log(res);
            if (res.success) {
                console.log(this.themeData.cThemeData.theme_default_settings);
                if (this.themeData.cThemeData.theme_default_settings) {
                    this.themeData.defaultCmsSettingButton = true;
                    this.service.getDefaultCMSSettings().subscribe((res) => {
                        console.log("res default data", res);
                        this.themeData.cFooterData = res['footer'];
                        this.themeData.cHeaderData = res['header'];
                        this.themeData.cLoginData = res['login_page'];
                        this.themeData.cPreViewerData = res['previewer'];
                        this.themeData.cStepsData = res['steps'];
                        this.themeData.cThemeData = res['theme'];
                    });
                } else {
                    this.themeData.defaultCmsSettingButton = false;
                    this.service.getInitData(0).subscribe((res) => {
                        console.log("res default data", res);
                        this.themeData.cFooterData = res['data']['footer'];
                        this.themeData.cHeaderData = res['data']['header'];
                        this.themeData.cLoginData = res['data']['login_page'];
                        this.themeData.cPreViewerData = res['data']['previewer'];
                        this.themeData.cStepsData = res['data']['steps'];
                        this.themeData.cThemeData = res['data']['theme'];
                    });
                }
            }
        });
    }
}
