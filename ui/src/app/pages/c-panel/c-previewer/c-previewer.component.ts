import { Component, ViewEncapsulation } from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, Control, AbstractControl } from '@angular/common';
import { Router, RouteConfig, RouterOutlet, RouteParams, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { DROPDOWN_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Observable } from 'rxjs/Observable';
import { DomSanitizationService } from "@angular/platform-browser";
import { PageService, GridDataService } from '../../../theme/services';
import { Dialog, Dropdown } from 'primeng/primeng';
import { CPanelService } from '../c-panel.service';
import { UploadImage } from '../../../theme/interfaces';
import { BaCpanelImageUploader } from "../../../theme/components/baCpanelImageUploader";
@Component({
    selector: 'c-previewer',
    directives: [ROUTER_DIRECTIVES, DROPDOWN_DIRECTIVES, PAGINATION_DIRECTIVES, Dropdown, Dialog, BaCpanelImageUploader],
    encapsulation: ViewEncapsulation.None,
    styles: [require('../../settings/settings.scss')],
    template: require('./c-previewer.component.html'),
    providers: [GridDataService, PageService, CPanelService]
})

export class CPreviewer {
    public staticCPanel: typeof CPanelService = CPanelService;
    public showReplaceImageDialog: boolean = false;
    public replaceImageHeader: string = null;
    public imageType: number = 2;//2=> for Background Image 3=> Play Image 4=>Loder Image   
    constructor(
        protected router: Router,
        private sanitizer: DomSanitizationService,
        private service: CPanelService,
        private pageService: PageService
    ) {

    }

    public openReplaceImageDialog(): void {
        this.showReplaceImageDialog = true;
        this.replaceImageHeader = (this.imageType == 2) ? "Select Your Background Image" : (this.imageType == 3 ? "Select Your Play Image" : "Select Your Loading Image");
    }

    public clickOnImageTab(type: number): void {
        this.imageType = type;
        this.replaceImageHeader = (this.imageType == 2) ? "Select Your Background Image" : (this.imageType == 3 ? "Select Your Play Image" : "Select Your Loading Image");
    }

    public onReplaceDialogDismiss(e: any): void {
        if (e.image) {
            switch (this.imageType) {
                case 2:
                    this.staticCPanel.cPreViewerData.prev_bg_image = e.image;
                    break;
                case 3:
                    this.staticCPanel.cPreViewerData.prev_play_image = e.image;
                    break;
                case 4:
                    this.staticCPanel.cPreViewerData.prev_load_image = e.image;
                    break;
            }
        }
        this.showReplaceImageDialog = false;
    }

}