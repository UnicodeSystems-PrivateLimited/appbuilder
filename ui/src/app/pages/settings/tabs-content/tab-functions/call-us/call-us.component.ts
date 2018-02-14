import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown } from 'primeng/primeng';
import { PageService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { Tab, PhoneNumber } from '../../../../../theme/interfaces';
import { CallUsService } from './call-us.service';
import { MobileViewComponent } from '../../../../../components';

@Component({
    selector: 'tab-function-call-us',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, Dialog, DROPDOWN_DIRECTIVES, MobileViewComponent, TAB_DIRECTIVES, Dragula],
    encapsulation: ViewEncapsulation.None,
    template: require('./call-us.component.html'),
    styles: [require('./call-us.scss')],
    viewProviders: [DragulaService],
    providers: [PageService, CallUsService]
})

export class CallUs {
    public tabId: number;
    public ready: boolean = false;
    public phoneNumbers: PhoneNumber[] = [];
    public deleteNumberId: number = null;
    public checkTrue:boolean = false;

    // ------------------- DISPLAY CONTROL ----------------------------
    public addDialogDisplay: boolean = false;
    public editDialogDisplay: boolean = false;
    public showDeleteDialog: boolean = false;
    public showLoader: boolean = false;
    public addSaveButtonHide: boolean = false;
    // ----------------------------------------------------------------

    public addNumberData: PhoneNumber = {
        tab_id: null,
        title: '',
        phone: ''
    };

    public editNumberData: PhoneNumber = {
        id: null,
        title: '',
        phone: ''
    };

    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
    public selectedItem: boolean[] = [];
    public checkAll: boolean = false;

    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: CallUsService,
        private dragulaService: DragulaService) {
        this.tabId = parseInt(params.get('tabId'));
        this.addNumberData.tab_id = this.tabId;

        dragulaService.dropModel.subscribe((value) => {
            this.sort();
        });
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        // 1 request to get all initial data.
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                this.phoneNumbers = res.data.phone_numbers;
                this.tabData = res.data.tabData;
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public getList(): void {
        this.service.getNumberList(this.tabId).subscribe(res => {
            if (res.success) {
                this.phoneNumbers = res.data;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public showAddDialog(): void {
        this.addDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public showEditDialog(id: number): void {
        this.editDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.showLoader = true;
        this.refreshEditNumberData();
        this.service.getNumberData(id).subscribe((res) => {
            if (res.success) {
                this.editNumberData = res.data;
                this.showLoader = false;
            }
        });
    }

    public refreshAddNumberData(): void {
        this.addNumberData.title = '';
        this.addNumberData.phone = '';
    }

    public refreshEditNumberData(): void {
        this.editNumberData.id = null;
        this.editNumberData.title = '';
        this.editNumberData.phone = '';
    }

    public onAddSubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.service.addPhoneNumber(this.addNumberData).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.addDialogDisplay = false;
                this.pageService.showSuccess(res.message);
                this.refreshAddNumberData();
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
        this.service.editNumber(this.editNumberData).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.editDialogDisplay = false;
                this.pageService.showSuccess(res.message);
                this.refreshEditNumberData();
                this.getList();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public sort(): void {
        let ids: number[] = [];
        for (let number of this.phoneNumbers) {
            ids.push(number.id);
        }
        this.service.sortNumberList(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('Phone number order saved.');
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onDeleteClick(): void {
        if (this.selectedItem.length > 0 && this.selectedItem.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete number? ");
            if (yes) {
                this.deleteNumber();
            }
        }
    }

    public refreshSelectedItem(): void {
        this.selectedItem = [];
    }

    public onCheckAllChange(): void {
        // this.checkTrue = !this.checkTrue;
        this.refreshSelectedItem();
        if (!this.checkAll) {
            for (let i in this.phoneNumbers) {
                this.selectedItem[this.phoneNumbers[i].id] = true;
            }
             this.checkTrue = true;
        }
        else {
            for (let i in this.phoneNumbers) {
                this.selectedItem[this.phoneNumbers[i].id] = false;
            }
             this.checkTrue = false;
            
        }
    }

    public deleteNumber(): void {
        let ids: any[] = [];
        for (let i in this.selectedItem) {
            if (this.selectedItem[i]) {
                ids.push(i);
            }
        }
        this.showLoader = true;
        this.service.deleteNumber(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkTrue = false;
                                this.selectedItem = [];
                for (var i = 0; i < ids.length; i++) {
                    console.log('ids==============', ids[i]);
                    this.phoneNumbers.forEach((phoneNumbers, index) => {
                        console.log('phoneNumbers.id==============', phoneNumbers.id);
                        if (phoneNumbers.id == ids[i]) {
                            console.log('in');
                            this.phoneNumbers.splice(index, 1);
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

    public onCheckTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.phoneNumbers.forEach((phoneNumbers) => {
                console.log('phoneNumbers', phoneNumbers);
                console.log('checkedTab', checkedTab);
                if (phoneNumbers.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedItem[phoneNumbers.id]) {
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