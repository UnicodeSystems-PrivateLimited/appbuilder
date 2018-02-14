import { Component, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, Control, AbstractControl } from '@angular/common';
import { Router, RouteConfig, RouterOutlet, RouteParams, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { DROPDOWN_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Observable } from 'rxjs/Observable';
import { DomSanitizationService } from "@angular/platform-browser";
import { PageService, GridDataService } from '../../../theme/services';
import { Dialog } from 'primeng/primeng';
import { CPanelService } from '../c-panel.service';
import { ColorPickerDirective } from "../../../color-picker/color-picker.directive";
import { BaCpanelImageUploader } from "../../../theme/components/baCpanelImageUploader";

@Component({
    selector: 'c-login-page',
    directives: [ROUTER_DIRECTIVES, DROPDOWN_DIRECTIVES, PAGINATION_DIRECTIVES, Dialog, ColorPickerDirective, BaCpanelImageUploader],
    encapsulation: ViewEncapsulation.None,
    styles: [require('../../settings/settings.scss')],
    template: require('./c-login-page.component.html'),
    providers: [GridDataService, PageService, CPanelService]
})

export class CLoginPage {

    public showReplaceLogoDialog: boolean = false;
    public headerTitleOfDialog: string = "Select Your Logo";
    public logotype: number = 5;
    public loginData: typeof CPanelService = CPanelService;

    constructor(
        protected router: Router,
        private sanitizer: DomSanitizationService,
        private _changeDetectionRef: ChangeDetectorRef,
        private service: CPanelService,
        private pageService: PageService
    ) {
    }

    public openReplaceLogoDialog(): void {
        this.showReplaceLogoDialog = true;
    }

    public onReplaceDialogDismiss(e: any): void {
        if (e.image) {
            this.loginData.cLoginData.login_logo = e.image;
        }
        this.showReplaceLogoDialog = false;
    }

    public onImagesChange(event: any): void {
        this.loginData.loginBgImageTarget = event.target;
        this.loginData.loginBgImage = event.target.files;
    }

    public ngAfterViewInit(): void {
        this._changeDetectionRef.detectChanges();
    }

    public removeLoginBgImage(): void {
        this.service.removeLoginBgImage(CPanelService.appId).subscribe((res) => {
            if (res.success) {
                this.loginData.cLoginData.login_bg_image = null;
                this.pageService.showSuccess(res.message);
            } else {
                console.log(res.message);
            }
        });
    }
}