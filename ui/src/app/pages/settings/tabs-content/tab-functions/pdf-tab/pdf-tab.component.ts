import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown } from 'primeng/primeng';
import { PageService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { Tab, PDF } from '../../../../../theme/interfaces';
import { PDFTabService } from './pdf-tab.service';
import { MobileViewComponent } from '../../../../../components';


@Component({
    selector: 'tab-function-pdf-tab',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, MobileViewComponent, Dialog, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, Dragula],
    encapsulation: ViewEncapsulation.None,
    template: require('./pdf-tab.component.html'),
    styles: [require('./pdf-tab.scss')],
    viewProviders: [DragulaService],
    providers: [PageService, PDFTabService]
})

export class PDFTab {
    public tabId: number;
    public ready: boolean = false;
    public pdfs: PDF[] = [];
    public deletePdfId: number = null;
    public addFileTarget = null;
    public editFileTarget = null;
    public checkTrue:boolean = false;
    // ------------------- DISPLAY CONTROL ----------------------------
    public addDialogDisplay: boolean = false;
    public editDialogDisplay: boolean = false;
    public showDeleteDialog: boolean = false;
    public showLoader: boolean = false;
    // ----------------------------------------------------------------

    public addData: PDF = {
        tab_id: null,
        name: '',
        section: '',
        url: '',
        is_printing_allowed: false,
        pdf: null
    };

    public editData: PDF = {
        id: null,
        name: '',
        section: '',
        url: '',
        is_printing_allowed: false,
        pdf: null
    };

    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
    public selectedPDF: boolean[] = [];
    public checkAll: boolean = false;
    public addSaveButtonHide: boolean = false;


    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: PDFTabService,
        private dragulaService: DragulaService) {
        this.tabId = parseInt(params.get('tabId'));
        this.addData.tab_id = this.tabId;

        dragulaService.dropModel.subscribe((value) => {
            this.sort();
        });
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                this.pdfs = res.data.pdfList;
                this.tabData = res.data.tabData;
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public getList(): void {
        this.service.getList(this.tabId).subscribe(res => {
            if (res.success) {
                this.pdfs = res.data;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public showAddDialog(): void {
        if (this.addFileTarget) {
            // Clear the file name from the target element.
            this.addFileTarget.value = null;
        }
        this.addDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public showEditDialog(id: number): void {
        if (this.editFileTarget) {
            // Clear the file name from the target element.
            this.editFileTarget.value = null;
        }
        this.editDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.showLoader = true;
        this.refreshEditData();
        this.service.getPDF(id).subscribe((res) => {
            if (res.success) {
                this.editData = res.data;
                this.editData.is_printing_allowed = !!this.editData.is_printing_allowed;
                this.showLoader = false;
            }
        });
    }

    public refreshAddData(): void {
        this.addData.name = '';
        this.addData.section = '';
        this.addData.url = '';
        this.addData.is_printing_allowed = false;
        this.addData.pdf = null;
    }

    public refreshEditData(): void {
        this.editData.id = null;
        this.editData.name = '';
        this.editData.section = '';
        this.editData.url = '';
        this.editData.is_printing_allowed = false;
        this.editData.pdf = null;
    }

    public onAddSubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.service.addPDF(this.addData).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.addDialogDisplay = false;
                this.pageService.showSuccess(res.message);
                this.refreshAddData();
                this.getList();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public onEditSubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.service.editPDF(this.editData).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.editDialogDisplay = false;
                this.pageService.showSuccess(res.message);
                this.refreshEditData();
                this.getList();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public sort(): void {
        let ids: number[] = [];
        for (let number of this.pdfs) {
            ids.push(number.id);
        }
        this.service.sortList(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('PDF order saved.');
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    //    public onDeleteClick(id: number): voi    d {
    //        this.deletePdfId =     id;
    //        this.showDeleteDialog = tr    ue;
    //        }    
    //
    //    public delete(): voi    d {
    //        this.showLoader = fal    se;
    //        this.service.deletePDF([this.deletePdfId]).subscribe((res) =    > {
    //            if (res.success    ) {
    //                this.showLoader = fal    se;
    //                this.showDeleteDialog = fal    se;
    //                this.pageService.showSuccess(res.messag    e);
    //                this.pdfs.forEach((pdf, index) =    > {
    //                    if (pdf.id === this.deletePdfId    ) {
    //                        this.pdfs.splice(index,     1);
    //                        }
    //                    });
    //            } els    e {
    //                this.pageService.showError(res.messag    e);
    //                }
    //            });
    //    }

    public onPDFDeleteClick(): void {
        if (this.selectedPDF.length > 0 && this.selectedPDF.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete PDF? ");
            if (yes) {
                this.deletePDF();
            }
        }
    }

    public refreshSelectedItem(): void {
        this.selectedPDF = [];
    }

    public onCheckAllChange(): void {
        // this.checkTrue = !this.checkTrue;
        this.refreshSelectedItem();
        if (!this.checkAll) {
            for (let i in this.pdfs) {
                this.selectedPDF[this.pdfs[i].id] = true;
            }
            this.checkTrue = true;
        }
        else {
            for (let i in this.pdfs) {
                this.selectedPDF[this.pdfs[i].id] = false;
            }
            this.checkTrue =false;
        }
    }

    public deletePDF(): void {
        let ids: any[] = [];
        for (let i in this.selectedPDF) {
            if (this.selectedPDF[i]) {
                ids.push(i);
            }
        }
        this.showLoader = true;
        this.service.deletePDF(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkTrue = false;
                                this.selectedPDF = [];

                for (var i = 0; i < ids.length; i++) {
                    console.log('ids==============', ids[i]);
                    this.pdfs.forEach((pdfs, index) => {
                        console.log('pdfs.id==============', pdfs.id);
                        if (pdfs.id == ids[i]) {
                            console.log('in');
                            this.pdfs.splice(index, 1);
                        }
                    });
                }
                this.pageService.showSuccess(res.message);
                this.checkAll = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onAddFileChange(event: any): void {
        this.addData.pdf = event.target.files[0];
        this.addFileTarget = event.target;
    }

    public onEditFileChange(event: any): void {
        this.editData.pdf = event.target.files[0];
        this.editFileTarget = event.target;
    }

    public onCheckTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.pdfs.forEach((pdfs) => {
                console.log('pdfs', pdfs);
                console.log('checkedTab', checkedTab);
                if (pdfs.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedPDF[pdfs.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAll = flag ? true : false;
    }
}