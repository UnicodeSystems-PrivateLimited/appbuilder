import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { DirectionTabService } from './direction-tab.service';
import { Website, Tab, WebsiteTabSettings, Direction, DirectionLocation } from '../../../../../theme/interfaces';
import { LocationEditor } from '../../../../../components';
import { MobileViewComponent } from '../../../../../components';


@Component({
    selector: 'tab-function-direction-tab',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, Dialog, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, Dragula, LocationEditor, MobileViewComponent],
    encapsulation: ViewEncapsulation.None,
    template: require('./direction-tab.component.html'),
    styles: [require('./direction-tab.scss')],
    viewProviders: [DragulaService],
    providers: [PageService, DirectionTabService, GridDataService]
})

export class DirectionTab {

    public tabId: number;
    public directions: Direction[] = [];
    public deleteDirectionId: number = null;
    public isMapDataSet: boolean = false;
    public checkTrue:boolean = false;
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };

    public addDirectionData: Direction = {
        title: '',
        m_long: '',
        m_lat: '',
    };
    public editDirectionData: Direction = {
        id: null,
        title: '',
        m_long: '',
        m_lat: '',
    };

    // ------------------- DISPLAY CONTROL ----------------------------
    public ready: boolean = false;
    public addDialogDisplay: boolean = false;
    public showDeleteDialog: boolean = false;
    public showLoader: boolean = false;
    public addFormlocationEditorDisplay: boolean = false;
    public editFormlocationEditorDisplay: boolean = false;
    public editDialogDisplay: boolean = false;
    public selectedItem: boolean[] = [];
    public checkAll: boolean = false;
    public addSaveButtonHide: boolean = false;
    // ----------------------------------------------------------------

    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: DirectionTabService,
        private dragulaService: DragulaService,
        private dataService: GridDataService) {
        this.tabId = parseInt(params.get('tabId'));
        this.addDirectionData.tab_id = this.tabId;

        dragulaService.dropModel.subscribe((value) => {
            this.sortDirections();
        });

    }

    public showAddDialog(): void {
        this.addDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.addFormlocationEditorDisplay = true;
        this.addDirectionData.tab_id = this.tabId;
        console.log(this.addDirectionData.tab_id);

    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        // One request to get all initial data.
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                this.directions = res.data.listData;
                console.log(this.directions);
                this.tabData = res.data.tabData;
                this.ready = true;
            } else {
                console.log('no data found');
            }
        });
    }

    public sortDirections(): void {
        let ids: number[] = [];
        for (let direction of this.directions) {
            ids.push(direction.id);
        }
        this.service.sortDirectionList(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('Direction order saved.')
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    //    public onDeleteClick(id: number): void {
    //        this.deleteDirectionId = id;
    //        this.showDeleteDialog = true;
    //    }
    //
    //    public deleteDirection(): void {
    //        this.showLoader = true;
    //        this.service.deleteDirection([this.deleteDirectionId]).subscribe((res) => {
    //            if (res.success) {
    //                this.showLoader = false;
    //                this.showDeleteDialog = false;
    //                this.pageService.showSuccess('Direction Deleted Successfully');
    //                this.getDirectionList();
    //                this.directions.forEach((direction, index) => {
    //                    if (direction.id === this.deleteDirectionId) {
    //                        this.directions.splice(index, 1);
    //                    }
    //                });
    //            } else {
    //                this.pageService.showError(res.message);
    //            }
    //        });
    //    }

    public onLatLongChange(event: any): void {
        this.addDirectionData.m_lat = event.lat;
        this.addDirectionData.m_long = event.long;

    }
    public onLatLongChangeEdit(event: any): void {
        this.editDirectionData.m_lat = event.lat;
        this.editDirectionData.m_long = event.long;

    }

    public onDialogHide(): void {
        this.addFormlocationEditorDisplay = false;
        this.editFormlocationEditorDisplay = false;
    }

    public onAddDirection(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.service.addDirection(this.addDirectionData).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.addDialogDisplay = false;
                this.pageService.showSuccess('Direction saved successfully.');
                this.getDirectionList();
                this.addDirectionData.m_lat = '';
                this.addDirectionData.m_long = '';
                this.addDirectionData.title = '';
                this.addFormlocationEditorDisplay = false;


            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public getDirectionList(): void {
        this.service.getDirectionList(this.tabId).subscribe(res => {
            if (res.success) {
                this.directions = res.data;
            } else {
                this.pageService.showError('Server error occurred');
            }
        });
    }

    public showEditDialog(id: number): void {

        this.editDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.showLoader = true;
        this.service.getDirectionData(id).subscribe((res) => {
            if (res.success) {
                this.editDirectionData = res.data;
                this.editDirectionData.id = res.data.id;
                this.showLoader = false;
                this.editFormlocationEditorDisplay = true;
            }
        });
    }

    public onEditDirection(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.service.editDirection(this.editDirectionData).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.editDialogDisplay = false;
                this.pageService.showSuccess('Direction updated successfully.');
                this.getDirectionList();
                this.editDirectionData.m_lat = '';
                this.editDirectionData.m_long = '';
                this.editDirectionData.title = '';
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public onDeleteClick(): void {
        if (this.selectedItem.length > 0 && this.selectedItem.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete direction? ");
            if (yes) {
                this.deleteDirection();
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
            for (let i in this.directions) {
                this.selectedItem[this.directions[i].id] = true;
            }
            this.checkTrue = true ;
        }
        else {
            for (let i in this.directions) {
                this.selectedItem[this.directions[i].id] = false;
            }
            this.checkTrue = false;
        }
    }

    public deleteDirection(): void {
        let ids: any[] = [];
        for (let i in this.selectedItem) {
            if (this.selectedItem[i]) {
                ids.push(i);
            }
        }
        this.showLoader = true;
        this.service.deleteDirection(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkTrue = false;
                                this.selectedItem = [];
                for (var i = 0; i < ids.length; i++) {
                    console.log('ids==============', ids[i]);
                    this.directions.forEach((directions, index) => {
                        console.log('directions.id==============', directions.id);
                        if (directions.id == ids[i]) {
                            console.log('in');
                            this.directions.splice(index, 1);
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
            this.directions.forEach((directions) => {
                console.log('directions', directions);
                console.log('checkedTab', checkedTab);
                if (directions.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedItem[directions.id]) {
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