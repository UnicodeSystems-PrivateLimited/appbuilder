import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, RadioButton } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { AroundUsTabService } from './around-us.service';
import { AroundUsItem, AroundUsTabCategory, Website, Tab, WebsiteTabSettings, distanceTypeKilometer, distanceTypeMile, Comment } from '../../../../../theme/interfaces';
import { ColorPickerDirective } from "../../../../../color-picker/color-picker.directive";
import { LocationEditor } from '../../../../../components';
import { ThumbnailFileReader, MobileViewComponent } from '../../../../../components';
declare var $: any;

@Component({
    selector: 'tab-function-around-us',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, RadioButton, Dialog, LocationEditor, MobileViewComponent, ThumbnailFileReader, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, ColorPickerDirective, Dragula],
    encapsulation: ViewEncapsulation.None,
    template: require('./around-us.component.html'),
    styles: [require('./around-us.scss')],
    viewProviders: [DragulaService],
    providers: [PageService, AroundUsTabService, GridDataService]
})

export class AroundUsTab {
    public tabId: number;
    public id: number;
    public checkAll: boolean = false;
    public checkTrue: boolean = false;
    public deleteCommentId: number = null;
    public deleteItemId: number = null;
    public selectedItem: boolean[] = [];
    public imageTarget: any = null;
    public image: string | File;
    public categoryId: number;
    public categorySelect = [];
    public aroundUsData: AroundUsItem = new AroundUsItem();
    public categoryData: AroundUsTabCategory[] = [];
    public arounds: AroundUsItem[] = [];
    public comments: Comment[] = [];
    private DISTANCE_TYPE_MILE: number = distanceTypeMile;
    private DISTANCE_TYPE_KILOMETER: number = distanceTypeKilometer;
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };

    // ------------------- DISPLAY CONTROL ----------------------------
    public ready: boolean = false;
    public addDialogDisplay: boolean = false;
    public dialogDisplay: boolean = false;
    public showDeleteDialog: boolean = false;
    //    public showDeleteItemDialog: boolean = false;
    public showEditor: boolean = false;
    public addFormlocationEditorDisplay: boolean = false;
    public showLoader: boolean = false;
    public editFormlocationEditorDisplay: boolean = false;
    public isMapDataSet: boolean = false;
    public imageShow: boolean = false;
    public poiHeader: string;
    public addSaveButtonHide: boolean = false;
    // ----------------------------------------------------------------
    public editorView: any = null;

    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: AroundUsTabService,
        private dragulaService: DragulaService,
        private dataService: GridDataService) {
        this.tabId = parseInt(params.get('tabId'));
        this.id = parseInt(params.get('ids'));

        dragulaService.dropModel.subscribe((value) => {
            this.sortAroundItem();
        });
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        // One request to get all initial data.
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                if (res.data.itemData !== undefined && res.data.itemData) {
                    this.arounds = res.data.itemData;
                }
                this.tabData = res.data.tabData;
                if (res.data.categoryData !== undefined && res.data.categoryData.length) {
                    this.categoryData = res.data.categoryData;
                } else {
                    // this.initCategories();
                }
                this.ready = true;
                this._setDisplayImages(res.data.itemData);

                for (let item of res.data.categoryData) {
                    this.categorySelect.push({ label: item.category_name, value: item.id })
                }
                this.refreshSelectedItems();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onCheckAllChange(): void {
        this.refreshSelectedItems();
        if (!this.checkAll) {
            for (let i in this.arounds) {
                this.selectedItem[this.arounds[i].id] = true;
            }
            this.checkTrue = true;
        }
        else {
            for (let i in this.arounds) {
                this.selectedItem[this.arounds[i].id] = false;
            }
            this.checkTrue = false;

        }
    }

    public refreshSelectedItems(): void {
        this.selectedItem = [];
    }

    public sortAroundItem(): void {
        let ids: number[] = [];
        for (let around of this.arounds) {
            ids.push(around.id);
        }
        this.service.sortAroundItemList(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess(res.data);
            } else {
                this.pageService.showError(res.data);
            }
        });
    }

    public getItemList(): void {
        // One request to get all initial data.
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                this.arounds = res.data.itemData;
                console.log('this.arounds');
                console.log(this.arounds);
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public getCommentData(id): void {
        this.service.getCommentData(id).subscribe(res => {
            if (res.success) {
                this.comments = res.data;
                console.log(this.comments);
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public showAddDialog(id): void {
        this.imageShow = true;
        this.poiHeader = "ADD POI";
        this.aroundUsData.around_us_id = this.categoryData[0].id;
        if (this.imageTarget) {
            this.imageTarget.value = null;
            this.aroundUsData.image = null;
        }
        this.dialogDisplay = true;
        this.pageService.onDialogOpen();
        // this.showEditor = true;
        this.initEditor();
        if (this.comments) {
            this.comments = null;
        }
    }

    public showEditDialog(id: number): void {
        this.pageService.onDialogOpen();
        // this.showEditor = true;
        this.dialogDisplay = true;
        this.poiHeader = "EDIT POI";
        this.showLoader = true;
        this.service.getSingleItemData(id).subscribe((res) => {
            if (res.success) {
                this.aroundUsData = res.data.itemData;
                this.aroundUsData.id = res.data.itemData.id;
                this.comments = res.data.comments;
                this.imageShow = true;
                this.showLoader = false;
                this.initEditor();
            }
        });
    }

    public onSaveAroundUsItem(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        if (this.editorView) {
            this.aroundUsData.information = this.editorView.html();
        }
        this.service.saveAroundUsItem(this.aroundUsData, this.isMapDataSet).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this._clearImageInputs();
                this.aroundUsData = new AroundUsItem();
                this.imageShow = false;
                this.dialogDisplay = false;
                this.editorView = null;
                this.pageService.showSuccess(res.message);
                this.getItemList();

            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;

        });
    }

    public deleteThumbnailImage(event: any, id: number): void {
        this.service.deleteThumbnailImage(id).subscribe(res => {
            console.log(res);
            if (res.success) {
                this.aroundUsData.image = null;
                this.pageService.showSuccess(res.message);
            }
            else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onCommentDeleteClick(id: number): void {
        this.deleteCommentId = id;
        this.showDeleteDialog = true;
        this.pageService.onDialogOpen();
    }

    public deleteComment(): void {
        this.showLoader = true;
        this.service.deleteComment([this.deleteCommentId]).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.showDeleteDialog = false;
                this.pageService.showSuccess('Comment Deleted Successfully');
                this.comments.forEach((comment, index) => {
                    if (comment.id === this.deleteCommentId) {
                        this.comments.splice(index, 1);
                    }
                });
            } else {
                this.pageService.showError(res.message);
            }
        });
    }


    public onItemDeleteClick(): void {
        if (this.selectedItem.length > 0 && this.selectedItem.indexOf(true) !== -1) {
            //            this.showDeleteItemDialog = true;
            var yes = window.confirm("Are you sure you want to delete the selected Item ? ");
            if (yes) {
                this.deleteItem();
            }
        }
    }

    public deleteItem(): void {
        let ids: any[] = [];
        for (let i in this.selectedItem) {
            if (this.selectedItem[i]) {
                ids.push(i);
            }
        }
        this.showLoader = true;
        this.service.deleteItem(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkTrue = false;
                this.selectedItem = [];
                this.getItemList();
                //                this.showDeleteItemDialog = false;
                this.pageService.showSuccess(res.message);
                this.arounds.forEach((around, index) => {
                    if (around.id === this.selectedItem['id']) {
                        this.arounds.splice(index, 1);
                    }
                });
            } else {
                this.pageService.showError(res.message);
            }
        });
    }


    public showLocationEditor(): void {
        this.addFormlocationEditorDisplay = true;
        this.editFormlocationEditorDisplay = true;
        this.isMapDataSet = true;
    }


    public onLatLongChange(event: any): void {
        this.aroundUsData.m_lat = event.lat;
        this.aroundUsData.m_long = event.long;
    }

    public onDialogHide(): void {
        this.addFormlocationEditorDisplay = false;
        this.editFormlocationEditorDisplay = false;
        this._clearImageInputs();
        this.aroundUsData = new AroundUsItem();
        this.dialogDisplay = false;
        this.editorView = null;

    }

    private _setDisplayImages(image: string | File): void {
        this.image = image;
    }

    public onImageChange(event: any): void {
        this.aroundUsData.image = event.file[0];
        this.imageTarget = event.target;

    }
    private _clearImageInputs(): void {
        if (this.imageTarget) {
            this.imageTarget.value = null;
            this.aroundUsData.image = null;
        }

    }

    saveSettings() {
        this.categorySelect = [];
        let ids: number[] = [];
        for (let category of this.categoryData) {
            ids.push(category.id);
        }
        this.service.saveCategory(this.categoryData).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.getInitData();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    //Assigned default value to category
    private initCategories(): void {
        this.categoryData[0] = new AroundUsTabCategory();
        this.categoryData[0].category_name = "Category1";
        this.categoryData[0].tab_id = this.tabId;
        this.categoryData[0].color = "#f00";

        this.categoryData[1] = new AroundUsTabCategory();
        this.categoryData[1].category_name = "Category2";
        this.categoryData[1].tab_id = this.tabId;
        this.categoryData[1].color = "#0f0";

        this.categoryData[2] = new AroundUsTabCategory();
        this.categoryData[2].category_name = "Category3";
        this.categoryData[2].tab_id = this.tabId;
        this.categoryData[2].color = "#00f";
    }

    public inputFieldEvent(e: any) {
        if (e.which == 13 || e.keyCode == 13) {
            e.preventDefault();
        }
    }

    public onCheckTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.arounds.forEach((arounds) => {
                console.log('arounds', arounds);
                console.log('checkedTab', checkedTab);
                if (arounds.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedItem[arounds.id]) {
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
    private initEditor(): void {
        setTimeout(() => {
            let editorDiv = window["_globalJQuery"]("div#description-editor");
            editorDiv.froalaEditor({
                fileUploadURL: this.pageService.editorURLs.fileUpload,
                videoUploadURL: this.pageService.editorURLs.videoUpload,
                imageUploadURL: this.pageService.editorURLs.imageUpload + "/" + sessionStorage.getItem('appId'),
                imageManagerLoadURL: this.pageService.editorURLs.imageManagerLoad + "/" + sessionStorage.getItem('appId'),
            });
            this.editorView = editorDiv.find(".fr-view");
            if (this.aroundUsData.information) {
                editorDiv.froalaEditor('placeholder.hide')
            }
            this.editorView.html(this.aroundUsData.information);
        });
    }
}