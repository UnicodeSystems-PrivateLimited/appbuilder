import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog } from 'primeng/primeng';
import { PageService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Tab, ContentTabTwoItem } from "../../../../../theme/interfaces/common-interfaces";
import { ContentTabTwoService } from './content-tab-2.service';
import { ColorPickerDirective } from "../../../../../color-picker/color-picker.directive";
// import { CKEditor } from 'ng2-ckeditor';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { MobileViewComponent } from '../../../../../components';
declare var $: any;

@Component({
    selector: 'tab-function-content-tab-2',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dialog, TAB_DIRECTIVES, ColorPickerDirective, MobileViewComponent, Dragula],
    encapsulation: ViewEncapsulation.None,
    template: require('./content-tab-2.component.html'),
    styles: [require('./content-tab-2.scss')],
    providers: [PageService, ContentTabTwoService]
})

export class ContentTab2 {
    public tabId: number;
    public color: string = '#000';
    public ready: boolean = false;
    public checkTrue: boolean = false;
    public addContentDialogDisplay: boolean = false;
    public item: ContentTabTwoItem = new ContentTabTwoItem();
    public itemOverlayDisplay: string = "none";
    public features: any = {};
    public showEditor: boolean = true;
    public showLoader: boolean = false;
    public itemList = [];
    public phoneHeaderImage: File | string = null;
    public tabletHeaderImage: File | string = null;
    public thumbnailImage: File | string = null;
    // public ckEditorConfig: any = {
    //     uiColor: '#F0F3F4',
    //     height: '600',
    //     filebrowserUploadUrl: '/api/ws/function/ck-editor-image/uploadCkeditorImage',
    // };

    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
    public phoneHeaderImageTarget: any = null;
    public tabletHeaderImageChange: any = null;
    public thumbnailImageChange: any = null;
    public comments = [];
    public categoryFormHeader: string;
    public selectedItem: boolean[] = [];
    public checkAll: boolean = false;
    public addSaveButtonHide: boolean = false;
    public editorView: any = null;

    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: ContentTabTwoService, dragulaService: DragulaService) {
        this.tabId = parseInt(params.get('tabId'));
        this.item.tab_id = this.tabId;

        dragulaService.dropModel.subscribe((value) => {
            this.sort();
        });
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        // One request to get all initial data.
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                if (res.data.itemData && res.data.itemData.length) {
                    this.itemList = res.data.itemData;

                }
                if (res.data.style.features) {
                    this.features = res.data.style.features;
                }

                this.tabData = res.data.tabData;
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onItemUseGlobalClick(): void {
        this.itemOverlayDisplay = !this.item.use_global_colors ? "block" : "none";
        if (this.item) {

            if (!this.item.use_global_colors) {
                this.changeEditorColors(this.features.background_color, this.features.feature_text);
            } else {
                this.changeEditorColors(this.item.background_color, this.item.text_color);
            }
        }
    }

    public changeEditorColors(backgroundColor: string, textColor: string): void {
        // this.showEditor = false;
        // this.ckEditorConfig.contentsCss = "body { background-color: " + backgroundColor + "; color: " + textColor + "; }";

        // // Reloading the editor forcefully so that the new config can be initialized.
        // setInterval(() => {
        //     this.showEditor = true;
        // }, 0);
        if (this.editorView) {
            this.editorView.css({
                "background-color": backgroundColor,
                "color": textColor
            });
        }
    }

    public onUpdateColorClick(): void {
        this.changeEditorColors(this.item.background_color, this.item.text_color);
        if (this.item.id) {
            this.showLoader = true;
            this.service.saveContentTabTwoItemColor({ id: this.item.id, background_color: this.item.background_color, text_color: this.item.text_color }).subscribe(res => {
                console.log(res);
                if (res.success) {
                    this.pageService.showSuccess("Item updated succesfully.");

                } else {
                    this.pageService.showError(res.message);
                }
                this.showLoader = false;
            });
        }
    }

    public onPhoneHeaderImageChange(event: any): void {
        this.phoneHeaderImageTarget = event.target;
        this.item.phone_header_image = event.target.files[0];
    }

    public onTabletHeaderImageChange(event: any): void {
        this.tabletHeaderImageChange = event.target;
        this.item.tablet_header_image = event.target.files[0];
    }
    public onThumbnailImageChange(event: any): void {
        this.thumbnailImageChange = event.target;
        this.item.thumbnail = event.target.files[0];
    }
    public showAddContentDialog(): void {
        this.categoryFormHeader = "Add New Item";
        this.item = new ContentTabTwoItem();
        this.item.tab_id = this.tabId;
        this.phoneHeaderImage = '';
        this.tabletHeaderImage = '';
        this.itemOverlayDisplay = this.item.use_global_colors ? "block" : "none";
        // this.changeEditorColors(this.features.background_color, this.features.feature_text);
        console.log(this.item);
        this.addContentDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.initEditor();
    }
    public showEditContentDialog(contentId): void {
        PageService.showLoader();

        this.service.getItem(contentId).subscribe(res => {
            PageService.hideLoader();
            this.addContentDialogDisplay = true;
            this.pageService.onDialogOpen();
            this.categoryFormHeader = "Edit Item";
            this.item = res.data.itemData;
            this.item.status = this.item.status == 1 ? true : false;
            this.item.use_global_colors = this.item.use_global_colors == 1 ? true : false;
            this.item.is_header_required = this.item.is_header_required == 1 ? true : false;
            this.item.background_color = res.data.itemData.background_color;
            this.item.text_color = res.data.itemData.text_color;
            this.phoneHeaderImage = this.item.phone_header_image;
            this.tabletHeaderImage = this.item.tablet_header_image;
            this.item.phone_header_image_url = res.data.itemData.phone_header_image;
            this.thumbnailImage = this.item.thumbnail;
            this.itemOverlayDisplay = this.item.use_global_colors ? "block" : "none";
            if (this.item.use_global_colors) {
                this.changeEditorColors(this.features.background_color, this.features.feature_text);
            } else {
                this.changeEditorColors(this.item.background_color, this.item.text_color);
            }
            this.initEditor();
            this.comments = res.data.comments;
            console.log(this.item);
        });
    }

    public onItemSubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        if (this.editorView) {
            this.item.description = this.editorView.html();
        }
        let data: ContentTabTwoItem = Object.assign({}, this.item);
        console.log("this.item", this.item);
        data.status = this.item.status ? 1 : 2;
        data.add_header_and_comment = this.item.add_header_and_comment ? 1 : 0;
        data.use_global_colors = this.item.use_global_colors ? 1 : 0;
        data.is_header_required = this.item.is_header_required ? 1 : 0;
        this.service.saveContentTabTwoItem(data).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                this.pageService.showSuccess("Item saved succesfully.");
                this.showEditor = false;
                this.onAddEditDialogHide();
                this.addContentDialogDisplay = false;
                this.item = new ContentTabTwoItem();
                this._clearImageInputs();
                this.getItemList();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    private _clearImageInputs(): void {
        if (this.phoneHeaderImageTarget) {
            this.phoneHeaderImageTarget.value = null;
        }
        if (this.tabletHeaderImageChange) {
            this.tabletHeaderImageChange.value = null;
        }
        if (this.thumbnailImageChange) {
            this.thumbnailImageChange.value = null;
        }
    }
    public deleteComment(id): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deleteComment({ id: id }).subscribe(res => {
                    console.log(res);
                    if (res.success) {
                        for (var i = 0; i < this.comments.length; i++) {
                            if (this.comments[i].id == id) {
                                this.comments.splice(i, 1);
                            }
                        }
                        this.pageService.showSuccess("Comment deleted succesfully.");
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }

    public getItemList() {
        this.service.getItemLsit(this.tabId).subscribe(res => {
            if (res.success) {
                if (res.data && res.data.length) {
                    this.itemList = res.data;
                }
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public sort(): void {
        let ids: number[] = [];
        for (let number of this.itemList) {
            ids.push(number.id);
        }
        this.service.sortNumberList(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('order saved.');
            } else {
                this.pageService.showError(res.message);
            }
        });
    }
    public deleteImage(type: string, id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deleteImage(type, id).subscribe(res => {
                    console.log(res);
                    if (res.success) {
                        if (type == "phone_header") {
                            this.item.phone_header_image = '';
                            this.phoneHeaderImage = '';
                            this.item.phone_header_image_url = null;
                        }
                        else if (type == "tablet_header") {
                            this.item.tablet_header_image = '';
                            this.tabletHeaderImage = '';
                        }

                        this.pageService.showSuccess(res.message);
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }
    public deleteThumbnailImage(type: string, id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deleteThumbnailImage(type, id).subscribe(res => {
                    console.log(res);
                    if (res.success) {
                        if (type == "thumbnail") {
                            this.item.thumbnail = '';
                            this.thumbnailImage = '';
                        }
                        this.pageService.showSuccess(res.message);
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }

    public deleteCategory(): void {
        let ids: any[] = [];
        for (let i in this.selectedItem) {
            if (this.selectedItem[i]) {
                ids.push(i);
            }
        }
        console.log('ids++++++++++++++', ids);
        this.showLoader = true;
        this.service.deleteItem(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.selectedItem = [];
                for (var i = 0; i < ids.length; i++) {
                    console.log('ids==============', ids[i]);
                    this.itemList.forEach((itemList, index) => {
                        console.log('itemList.id==============', itemList.id);
                        if (itemList.id == ids[i]) {
                            console.log('in');
                            this.itemList.splice(index, 1);
                        }
                    });
                }
                this.pageService.showSuccess("Category deleted succesfully.");
                this.checkAll = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onCheckAllChange(): void {
        this.checkTrue = !this.checkTrue;
        this.refreshSelectedItems();
        if (!this.checkAll) {
            for (let i in this.itemList) {
                this.selectedItem[this.itemList[i].id] = true;
            }
            this.checkTrue = true;
        }
        else {
            for (let i in this.itemList) {
                this.selectedItem[this.itemList[i].id] = false;
            }
            this.checkTrue = false ;
        }
    }

    public refreshSelectedItems(): void {
        this.selectedItem = [];
    }

    public onItemDeleteClick(): void {
        if (this.selectedItem.length > 0 && this.selectedItem.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete category? ");
            if (yes) {
                this.deleteCategory();
            }
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
            this.itemList.forEach((itemList) => {
                console.log('itemList', itemList);
                console.log('checkedTab', checkedTab);
                if (itemList.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedItem[itemList.id]) {
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
            if(this.item.description) {
                editorDiv.froalaEditor('placeholder.hide') 
            }
            this.editorView.html(this.item.description);
            if (this.item.use_global_colors && this.features.background_color && this.features.feature_text) {
                this.changeEditorColors(this.features.background_color, this.features.feature_text);
            } else {
                this.changeEditorColors(this.item.background_color, this.item.text_color);
            }
        });
    }

    public onAddEditDialogHide() {
        this.editorView = null;
    }
}