import { Component, ViewEncapsulation } from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, Control, AbstractControl } from '@angular/common';
import { Router, RouteConfig, RouterOutlet, RouteParams, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { DROPDOWN_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Observable } from 'rxjs/Observable';
import { DomSanitizationService } from "@angular/platform-browser";
import { PageService, GridDataService } from '../../../theme/services';
import { CPanelService } from '../c-panel.service';
import { BaCpanelPreview} from "../../../components/baCpanelPreview";
@Component({
    selector: 'c-steps',
    directives: [ROUTER_DIRECTIVES, DROPDOWN_DIRECTIVES, PAGINATION_DIRECTIVES, BaCpanelPreview],
    encapsulation: ViewEncapsulation.None,
    styles: [require('../../settings/settings.scss')],
    template: require('./c-steps.component.html'),
    providers: [GridDataService, PageService, CPanelService]
})

export class CSteps {

    public stepData: typeof CPanelService = CPanelService;
    constructor(
        protected router: Router,
        private sanitizer: DomSanitizationService
    ) {
    }
 
}