import { Component, ViewEncapsulation, ChangeDetectorRef, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown } from 'primeng/primeng';
import { ColorPickerDirective } from "../../../color-picker/color-picker.directive";
import { CPanelService } from '../c-panel.service';
import { Navigation, ACTION } from '../../../theme/interfaces';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { BaCpanelPreview } from "../../../components/baCpanelPreview";
import { PageService } from '../../../theme/services';
@Component({
    selector: 'c-header',
    directives: [DROPDOWN_DIRECTIVES, PAGINATION_DIRECTIVES, Dropdown, Dialog, ColorPickerDirective, Dragula, BaCpanelPreview],
    encapsulation: ViewEncapsulation.None,
    styles: [require('../../settings/settings.scss')],
    template: require('./c-header.component.html'),
    viewProviders: [DragulaService],
    providers: [CPanelService]
})

export class CHeader {
    public navType: number = null;
    public addEditModal: boolean = false;
    public action = ACTION;
    public template = [];
    public templateValue: number = 1;
    public templateLink: boolean = false;
    public cNavigationData: Navigation = new Navigation();
    public cNavigationTemplateData: Navigation = new Navigation();
    public headerData: typeof CPanelService = CPanelService;
    public editNavIndex: number = null;
    public templateData: any[] = [];


    constructor(
        private _changeDetectionRef: ChangeDetectorRef,
        private dragulaService: DragulaService,
        private pageService: PageService
    ) {
        this.template.push({ label: "Messages", value: 1 }, { label: "Analytics", value: 2 }, { label: "Helpdesk", value: 3 }, { label: "Account", value: 4 }, { label: "QR Codes", value: 5 });
        this.templateData[1] = { label: "Messages", link: "message_list.php", class: "", action: 1 };
        this.templateData[2] = { label: "Analytics", link: "stats_dashboard.php", class: "", action: 1 };
        this.templateData[3] = { label: "Helpdesk", link: "http://mobileappco.assistly.com/", class: "", action: 1 };
        this.templateData[4] = { label: "Account", link: "account_settings.php", class: "", action: 1 };
        this.templateData[5] = { label: "QR Codes", link: "view_qrcode_with_email_collect.php", class: "", action: 1 };
        this.cNavigationTemplateData = this.templateData[1];
        dragulaService.dropModel.subscribe((value) => {
            console.log("headerData.cHeaderData.navigation", this.headerData.cHeaderData.navigation)
        });
    }


    showEditDialog(navData: any, type: number, index: number) {
        this.cNavigationData = navData;
        this.navType = type;
        this.addEditModal = true;
        this.editNavIndex = index;
        this.pageService.onDialogOpen();
    }

    showAddDialog(type: number) {
        this.navType = type;
        this.addEditModal = true;
        this.pageService.onDialogOpen();
    }

    hideAddEditDialog() {
        this.addEditModal = false;
        this.templateLink = false;
        this.clearInputs();
    }

    public onCustomLinkClick(): void {
        this.templateLink = false;
    }

    public onTemplateLinkClick(): void {
        this.templateLink = true;
    }

    public ngAfterViewInit(): void {
        this._changeDetectionRef.detectChanges();
    }

    public saveNavigation(): void {
        if (typeof this.headerData.cHeaderData.navigation == 'undefined') {
            this.headerData.cHeaderData.navigation = [];
        }

        if (this.navType == 1) {
            this.templateLink ? this.headerData.cHeaderData.navigation.push(this.cNavigationTemplateData) : this.headerData.cHeaderData.navigation.push(this.cNavigationData);
        } else if (this.navType == 2) {
            this.headerData.cHeaderData.navigation[this.editNavIndex] = this.templateLink ? this.cNavigationTemplateData : this.cNavigationData;
        }
        this.clearInputs();
        this.templateLink = false;
        this.addEditModal = false;
    }

    public onChangeTemplateDropDown(e: any): void {
        this.cNavigationTemplateData = this.templateData[this.templateValue];
    }

    public deleteHeaderNavigation(index: number): void {
        this.headerData.cHeaderData.navigation.splice(index, 1);
    }

    public clearInputs(): void {
        this.cNavigationData = new Navigation();
    }
}
