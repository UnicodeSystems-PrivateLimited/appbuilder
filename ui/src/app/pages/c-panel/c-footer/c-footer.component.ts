import { Component, ViewEncapsulation, ChangeDetectorRef, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, Growl, Message } from 'primeng/primeng';
import { CPanelService } from '../c-panel.service';
import { PageService } from '../../../theme/services';
import { ColorPickerDirective } from "../../../color-picker/color-picker.directive";
import { Navigation, ACTION } from '../../../theme/interfaces';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { BaCpanelPreview } from "../../../components/baCpanelPreview";
@Component({
    selector: 'c-footer',
    directives: [DROPDOWN_DIRECTIVES, Dialog, Dropdown, ColorPickerDirective, Dragula, BaCpanelPreview],
    encapsulation: ViewEncapsulation.None,
    styles: [require('../../settings/settings.scss')],
    template: require('./c-footer.component.html'),
    viewProviders: [DragulaService],
    providers: [CPanelService]
})

export class CFooter {
    public navColType: number = 1; //1=>col1 2=>col2
    public addEditModal: boolean = false;
    public footerAction = ACTION;
    public openDialogType: number = null;//1=> add 2=> edit
    public navIndex: number = null;
    public footerData: typeof CPanelService = CPanelService;
    public cNavigationData: Navigation = new Navigation();

    constructor(
        private _changeDetectionRef: ChangeDetectorRef,
        private dragulaService: DragulaService,
        private pageService: PageService
    ) {
        dragulaService.dropModel.subscribe((value) => {
        });
    }

    public onClickNavCols(type: number): void {
        this.navColType = type;
    }

    public showAddDialog(type: number): void {
        this.openDialogType = type;
        this.addEditModal = true;
        this.pageService.onDialogOpen();
    }

    public showEditDialog(navData: Navigation, type: number, index: number): void {
        this.openDialogType = type;
        this.cNavigationData = navData;
        this.navIndex = index;
        this.addEditModal = true;
        this.pageService.onDialogOpen();
    }

    public hideAddEditDialog(): void {
        this.addEditModal = false;
        this.clearInputs();
    }

    public onDeleteClick(index: number): void {
        this.navColType == 1 ? this.footerData.cFooterData.navigationCol1.splice(index, 1) : this.footerData.cFooterData.navigationCol2.splice(index, 1);
    }

    public ngAfterViewInit(): void {
        this._changeDetectionRef.detectChanges();
    }

    public saveNavigation(): void {
        if (typeof this.footerData.cFooterData.navigationCol1 == 'undefined') {
            this.footerData.cFooterData.navigationCol1 = [];
        }
        if (typeof this.footerData.cFooterData.navigationCol2 == 'undefined') {
            this.footerData.cFooterData.navigationCol1 = [];
        }
        if (this.openDialogType == 1) {
            this.navColType == 1 ? this.footerData.cFooterData.navigationCol1.push(this.cNavigationData) : this.footerData.cFooterData.navigationCol2.push(this.cNavigationData);
        } else if (this.openDialogType == 2) {
            this.navColType == 1 ? (this.footerData.cFooterData.navigationCol1[this.navIndex] = this.cNavigationData) : (this.footerData.cFooterData.navigationCol2[this.navIndex] = this.cNavigationData);
        }
        this.addEditModal = false;
        this.clearInputs();
    }

    public clearInputs(): void {
        this.cNavigationData = new Navigation();
    }
}