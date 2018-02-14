import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog } from 'primeng/primeng';
import { PageService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Tab, ContentTabTwoItem, ContentTabThreeItem, ContentTabThreeCategory } from "../../../../../theme/interfaces/common-interfaces";
import { ContentTabThreeService } from './content-tab-3.service';
import { ColorPickerDirective } from "../../../../../color-picker/color-picker.directive";
// import { CKEditor } from 'ng2-ckeditor';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { ThumbnailFileReader, MobileViewComponent } from '../../../../../components';
import { GridDataService } from '../../../../../theme/services';
declare var $: any;

@Component({
    selector: 'tab-function-content-tab-3',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dialog, ThumbnailFileReader, MobileViewComponent, TAB_DIRECTIVES, ColorPickerDirective, Dragula],
    template: require('./content-tab-3.component.html'),
    styles: [require('./content-tab-3.scss')],
    providers: [PageService, ContentTabThreeService]
})

export class ContentTab3 {
    public tabId: number;
    public color: string = '#000';
    public item: ContentTabThreeItem = new ContentTabThreeItem();
    public itemOverlayDisplay: string = "none";
    public listData = [];
    public phoneHeaderImageTarget: any = null;
    public tabletHeaderImageChange: any = null;
    public thumbnailImageChange: any = null;
    public comments = [];
    public checkTrue: boolean = false;
    public checkItemTrue: boolean = false;
    public listCategory = [];
    public selectedCategory: boolean[] = [];
    public selectedItem: boolean[] = [];
    public addSaveButtonHide: boolean = false;
    public add_new_item_button_hide: boolean = false;


    // ------------------- DISPLAY CONTROL ----------------------------
    public ready: boolean = false;
    public addCategoryDialogDisplay: boolean = false;
    public showEditor: boolean = true;
    public showLoader: boolean = false;
    public listCategoryItemDialogDisplay: boolean = false;
    public addCategoryItemDialogDisplay: boolean = false;
    public showDeleteItemDialog: boolean = false;
    public imageShow: boolean = false;
    public showDeleteCategoryDialog: boolean = false;
    public checkAll: boolean = false;
    public checkAllItem: boolean = false;
    // ----------------------------------------------------------------

    // ------------------- CONSTANT VARIABLE ----------------------------
    public DEFAULT_THUMB_PICTURE: string = 'assets/img/theme/no-photo.png';
    public CATEGORY_ITEM_BAG_NAME = 'category-item-bag';
    public CATEGORY_LIST_BAG_NAME = 'category-list-bag';
    private CATEGORY_STATUS_ENABLED = 1;
    private CATEGORY_STATUS_DISABLED = 2;
    private CATEGORY_ITEM_STATUS_DISABLED = 2;
    private CATEGORY_ITEM_STATUS_ENABLED = 1;

    // ----------------------------------------------------------------
    public addCategoryData: ContentTabThreeCategory = new ContentTabThreeCategory();
    public addCategoryItemData: ContentTabThreeItem = new ContentTabThreeItem();
    public checkColorChange = { background_color: '', text_color: '' };
    public selectedCategoryId = null;
    public categoryItems = null;
    public deleteItemId = null;
    public deleteCategoryId = null;
    public features: any = {};
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
    // public ckEditorConfig: any = {
    //     uiColor: '#F0F3F4',
    //     height: '600',
    //     filebrowserUploadUrl: '/api/ws/function/ck-editor-image/uploadCkeditorImage'
    // };
    public editorView: any = null;

    constructor(private pageService: PageService,
        private params: RouteParams,
        private dataService: GridDataService,
        private service: ContentTabThreeService, dragulaService: DragulaService) {
        this.tabId = parseInt(params.get('tabId'));
        this.item.category_id = this.tabId;

        dragulaService.dropModel.subscribe((value) => {
            // Do something according to the bags. Cool, right ?
            switch (value[0]) {
                case this.CATEGORY_LIST_BAG_NAME:
                    this.sortCategories();
                    break;
                case this.CATEGORY_ITEM_BAG_NAME:
                    this.sortMenuItems();
                    break;
            }
        });

    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        // One request to get all initial data.
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                if (res.data.listData && res.data.listData.length) {
                    this.listCategory = res.data.listData;
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


    public onThumbnailCategoryImageChange(event: any): void {

        this.addCategoryData.thumbnail = event.file[0];
        console.log('this.addCategoryData.thumbnail', this.addCategoryData.thumbnail)
    }

    public showAddCategoryDialog(): void {
        this.addCategoryData.thumbnail = null;
        this.item = new ContentTabThreeItem();
        this.imageShow = true;
        this.item.category_id = this.tabId;
        this.addCategoryDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public onAddCategorySubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        // Object.assign() is used here to make a clone of this.addCategoryData, but NOT BY REFERENCE.
        let data: ContentTabThreeCategory = Object.assign({}, this.addCategoryData);
        data.status = this.addCategoryData.status ? 1 : 2;
        data.tab_id = this.tabId;
        console.log('data---', data);
        this.service.saveCategory(data).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.getInitData();
                this.imageShow = false;
                this.addCategoryData = new ContentTabThreeCategory();
                this.addCategoryDialogDisplay = false;
                this.pageService.showSuccess(res.message);

            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public deleteThumbnailCategoryImage(event: any, id: number): void {

        this.service.deleteThumbnailCategoryImage(id).subscribe(res => {
            console.log(res);
            if (res.success) {
                this.addCategoryData.thumbnail = null;
                this.pageService.showSuccess(res.message);
            }
            else
                this.pageService.showError(res.message);
        });
    }

    public showListItemContentDialog(categoryId): void {

        this.selectedCategoryId = categoryId;
        this.categoryItems = null;
        this.listCategoryItemDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.showLoader = true;
        this.getCategoryItemList();

    }

    public getCategoryItemList(): void {

        this.service.getCategoryItem(this.selectedCategoryId).subscribe(res => {
            if (res.success) {
                this.categoryItems = res.data;
                this.showLoader = false;
            } else {
                this.pageService.showError(res.message);
            }
        });

    }

    public showAddCategoryItemDialog(): void {
        this.imageShow = true;
        this.addCategoryItemDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.initEditor();
        this.changeEditorColors(this.features.background_color, this.features.feature_text);
        this.addCategoryItemData = new ContentTabThreeItem();
        this.checkColorChange.background_color = this.addCategoryItemData.background_color;
        this.checkColorChange.text_color = this.addCategoryItemData.text_color;
        this.itemOverlayDisplay = this.addCategoryItemData.use_global_colors ? "block" : "none";
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


    public onAddItemSubmit(): void {
        this.showLoader = true;
        this.add_new_item_button_hide = true;
        if (this.editorView) {
            this.addCategoryItemData.description = this.editorView.html();
        }
        let data: ContentTabThreeItem = Object.assign({}, this.addCategoryItemData);
        data.status = data.status ? this.CATEGORY_ITEM_STATUS_ENABLED : this.CATEGORY_ITEM_STATUS_DISABLED;
        data.add_header_and_comment = data.add_header_and_comment ? 1 : 0;
        data.use_global_colors = data.use_global_colors ? 1 : 0;
        data.is_header_required = data.is_header_required ? 1 : 0;
        data.category_id = this.selectedCategoryId;
        console.log('data', data);
        this.service.saveContentTabThreeItem(data).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.imageShow = false;
                this.editorView = null;
                this.addCategoryItemDialogDisplay = false;
                this.pageService.showSuccess(res.message);
                this.addCategoryItemData = new ContentTabThreeItem();
                this.getCategoryItemList();
            } else {
                this.pageService.showError(res.message);
            }
            this.add_new_item_button_hide = false;

        });
    }

    public onItemUseGlobalClick(): void {
        this.itemOverlayDisplay = !this.addCategoryItemData.use_global_colors ? "block" : "none";
        if (this.addCategoryItemData) {

            if (!this.addCategoryItemData.use_global_colors) {
                this.changeEditorColors(this.features.background_color, this.features.feature_text);
            } else {
                this.changeEditorColors(this.addCategoryItemData.background_color, this.addCategoryItemData.text_color);
            }
        }
    }

    public onPhoneHeaderImageChange(event: any): void {
        this.phoneHeaderImageTarget = event.target;
        console.log('event:  ', event);
        this.addCategoryItemData.phone_header_image = event.file[0];
    }

    public onTabletHeaderImageChange(event: any): void {
        this.tabletHeaderImageChange = event.target;
        console.log('event:  ', event);
        this.addCategoryItemData.tablet_header_image = event.file[0];
    }
    public onThumbnailImageChange(event: any): void {
        this.thumbnailImageChange = event.target;
        this.addCategoryItemData.thumbnail = event.file[0];
    }

    public showEditContentDialog(contentId): void {
        this.imageShow = true;
        this.addCategoryItemData = new ContentTabThreeItem();
        PageService.showLoader();

        this.service.editCategoryItem(contentId).subscribe(res => {
            PageService.hideLoader();
            this.addCategoryItemDialogDisplay = true;
            this.pageService.onDialogOpen();
            this.addCategoryItemData = res.data.itemData;
            this.addCategoryItemData.status = this.addCategoryItemData.status == 1 ? true : false;
            this.addCategoryItemData.add_header_and_comment = this.addCategoryItemData.add_header_and_comment == 1 ? true : false;
            this.addCategoryItemData.use_global_colors = this.addCategoryItemData.use_global_colors == 1 ? true : false;
            this.addCategoryItemData.is_header_required = this.addCategoryItemData.is_header_required == 1 ? true : false;
            this.addCategoryItemData.background_color = res.data.itemData.background_color;
            this.addCategoryItemData.phone_header_image_url = res.data.itemData.phone_header_image;
            this.addCategoryItemData.text_color = res.data.itemData.text_color;
            this.checkColorChange.background_color = this.addCategoryItemData.background_color;
            this.checkColorChange.text_color = this.addCategoryItemData.text_color;
            this.itemOverlayDisplay = this.addCategoryItemData.use_global_colors ? "block" : "none";
            this.initEditor();
            if (this.addCategoryItemData.use_global_colors) {
                this.changeEditorColors(this.features.background_color, this.features.feature_text);
            } else {
                this.changeEditorColors(this.addCategoryItemData.background_color, this.addCategoryItemData.text_color);
            }

            this.getItemComments(this.addCategoryItemData.id);
            console.log(this.addCategoryItemData);
        });
    }

    public getItemComments(id) {

        this.service.listItemComments(id).subscribe(res => {
            this.comments = res.data;
        });
    }

    public onUpdateColorClick(): void {
        if (this.checkColorChange.background_color != this.addCategoryItemData.background_color || this.checkColorChange.text_color != this.addCategoryItemData.text_color) {
            this.checkColorChange.background_color = this.addCategoryItemData.background_color;
            this.checkColorChange.text_color = this.addCategoryItemData.text_color;
            this.changeEditorColors(this.addCategoryItemData.background_color, this.addCategoryItemData.text_color);
            if (this.addCategoryItemData.id) {
                this.showLoader = true;
                this.service.saveContentTabThreeItemColor({ id: this.addCategoryItemData.id, background_color: this.addCategoryItemData.background_color, text_color: this.addCategoryItemData.text_color }).subscribe(res => {
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
    }

    public sortCategories(): void {
        let ids: number[] = [];
        for (let category of this.listCategory) {
            ids.push(category.id);
        }
        this.service.sortCategoryList(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('Menu category order saved.');
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public sortMenuItems(): void {
        let ids: number[] = [];
        for (let item of this.categoryItems) {
            ids.push(item.id);
        }
        this.service.sortItemList(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('Menu items order saved.');
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    //    public onDeleteItemClick(id: number): void {
    //        this.deleteItemId = id;
    //        this.showDeleteItemDialog = true;
    //    }

    //    public deleteItem(): void {
    //        this.showLoader = true;
    //        this.service.deleteItem([this.deleteItemId]).subscribe((res) => {
    //            if (res.success) {
    //                this.showLoader = false;
    //                this.showDeleteItemDialog = false;
    //                this.pageService.showSuccess(res.message);
    //                this.dataService.getByID(this.categoryItems, this.deleteItemId, (data, index) => {
    //                    this.categoryItems.splice(index, 1);
    //                });
    //            } else {
    //                this.pageService.showError(res.message);
    //            }
    //        });
    //    }

    public deleteComment(id): void {
        if (id) {

            this.service.deleteComment([id]).subscribe(res => {
                console.log(res);
                if (res.success) {
                    for (var i = 0; i < this.comments.length; i++) {
                        if (this.comments[i].id = id) {
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

    public deletePhoneHeaderImage(image): void {
        this.addCategoryItemData.phone_header_image = image;
    }
    public deleteTabletHeaderImage(image): void {
        this.addCategoryItemData.tablet_header_image = image;
    }
    public deleteThumbnailImageChange(image): void {
        this.addCategoryItemData.thumbnail = image;
    }

    public deleteImage(event: any, type: string, id: number): void {
        if (id) {

            this.service.deleteImage(type, id).subscribe(res => {
                console.log(res);
                if (res.success) {
                    if (type == "phone_header") {
                        this.addCategoryItemData.phone_header_image = null;
                        this.addCategoryItemData.phone_header_image_url = null;
                    }

                    else if (type == "tablet_header") {
                        this.addCategoryItemData.tablet_header_image = null;
                    }

                    this.pageService.showSuccess(res.message);
                }
                else
                    this.pageService.showError(res.message);
            });
        }

    }
    public deleteThumbnailImage(event: any, type: string, id: number): void {
        if (id) {

            this.service.deleteThumbnailImage(type, id).subscribe(res => {
                console.log(res);
                if (res.success) {
                    if (type == "thumbnail")
                        this.addCategoryItemData.thumbnail = null;
                    this.pageService.showSuccess(res.message);
                }
                else
                    this.pageService.showError(res.message);
            });
        }

    }

    //    public onDeleteClick(id: number): void {
    //        this.deleteCategoryId = id;
    //        this.showDeleteCategoryDialog = true;
    //    }

    //    public deleteCategory(): void {
    //        this.showLoader = true;
    //        this.service.deleteCategory([this.deleteCategoryId]).subscribe((res) => {
    //            if (res.success) {
    //                this.showLoader = false;
    //                this.showDeleteCategoryDialog = false;
    //                this.pageService.showSuccess(res.message);
    //                this.getInitData();
    //                this.listCategory.forEach((item, index) => {
    //                    if (item.id === this.deleteCategoryId) {
    //                        this.listCategory.splice(index, 1);
    //                    }
    //                });
    //            } else {
    //                this.pageService.showError(res.message);
    //            }
    //        });
    //    }
    public deleteCategory(): void {
        let ids: any[] = [];
        for (let i in this.selectedCategory) {
            if (this.selectedCategory[i]) {
                ids.push(i);
            }
        }
        console.log('ids++++++++++++++', ids);
        this.showLoader = true;
        this.service.deleteCategory(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.selectedCategory = [];
                for (var i = 0; i < ids.length; i++) {
                    console.log('ids==============', ids[i]);
                    this.listCategory.forEach((listCategory, index) => {
                        console.log('listCategory.id==============', listCategory.id);
                        if (listCategory.id == ids[i]) {
                            console.log('in');
                            this.listCategory.splice(index, 1);
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
    public deleteItem(): void {
        let item_ids: any[] = [];
        for (let i in this.selectedItem) {
            if (this.selectedItem[i]) {
                item_ids.push(i);
            }
        }
        console.log('ids++++++++++++++', item_ids);
        this.showLoader = true;
        this.service.deleteItem(item_ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.selectedItem = [];
                for (var i = 0; i < item_ids.length; i++) {
                    console.log('ids==============', item_ids[i]);
                    this.categoryItems.forEach((categoryItems, index) => {
                        console.log('categoryItems.id==============', categoryItems.id);
                        if (categoryItems.id == item_ids[i]) {
                            console.log('in');
                            this.categoryItems.splice(index, 1);
                        }
                    });
                }
                this.pageService.showSuccess("Item deleted succesfully.");
                this.checkAllItem = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public showEditCategoryDialog(id: number): void {
        this.addCategoryDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.showLoader = true;
        this.imageShow = true;
        this.service.getSingleCategoryData(id).subscribe((res) => {
            if (res.success) {
                this.addCategoryData = res.data.categoryData;
                this.addCategoryData.status = res.data.categoryData.status == 1 ? true : false;
                this.imageShow = true;
                this.showLoader = false;
            }
        });
    }

    public onCategoryDialogHide(): void {
        this.imageShow = false;
        this.addCategoryDialogDisplay = false;
        this.addCategoryData = new ContentTabThreeCategory();
    }

    public onCategoryItemDialogHide(): void {
        this.imageShow = false;
        this.addCategoryItemDialogDisplay = false;
        this.addCategoryItemData = new ContentTabThreeItem();
        this.editorView = null;
    }

    public onCheckAllChange(): void {
        // this.checkTrue = !this.checkTrue;
        this.refreshSelectedCategory();
        if (!this.checkAll) {
            for (let i in this.listCategory) {
                this.selectedCategory[this.listCategory[i].id] = true;
            }
            this.checkTrue = true;
        }
        else {
            for (let i in this.listCategory) {
                this.selectedCategory[this.listCategory[i].id] = false;
            }
            this.checkTrue = false;
        }
    }
    public onCheckAllItemChange(): void {
        // this.checkItemTrue = !this.checkItemTrue;
        this.refreshSelectedItems();
        if (!this.checkAllItem) {
            for (let i in this.categoryItems) {
                this.selectedItem[this.categoryItems[i].id] = true;
            }
            this.checkItemTrue = true;
        }
        else {
            for (let i in this.categoryItems) {
                this.selectedItem[this.categoryItems[i].id] = false;
            }
            this.checkItemTrue = false;
        }
    }

    public refreshSelectedCategory(): void {
        this.selectedCategory = [];
    }
    public refreshSelectedItems(): void {
        this.selectedItem = [];
    }

    public onCategoryDeleteClick(): void {
        if (this.selectedCategory.length > 0 && this.selectedCategory.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete category? ");
            if (yes) {
                this.deleteCategory();
            }
        }
    }
    public onItemDeleteClick(): void {
        if (this.selectedItem.length > 0 && this.selectedItem.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete item? ");
            if (yes) {
                this.deleteItem();
            }
        }
    }

    // disble enter keyCode
    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.which == 13 || event.keyCode == 13)
            event.preventDefault();
    }

    public changeCalled(e): void {
        console.log("e", e);
    }

    public onCheckCategoryTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.listCategory.forEach((listCategory) => {
                console.log('listCategory', listCategory);
                console.log('checkedTab', checkedTab);
                if (listCategory.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedCategory[listCategory.id]) {
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

    public onCheckItemTabChange(checkedTabValue, checkedTab): void {
        // this.checkItemTrue = !this.checkItemTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.categoryItems.forEach((categoryItems) => {
                console.log('categoryItems', categoryItems);
                console.log('checkedTab', checkedTab);
                if (categoryItems.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedItem[categoryItems.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAllItem = flag ? true : false;
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
            if(this.addCategoryItemData.description) {
                editorDiv.froalaEditor('placeholder.hide') 
            }
            this.editorView.html(this.addCategoryItemData.description);
            if (this.addCategoryItemData.use_global_colors && this.features.background_color && this.features.feature_text) {
                this.changeEditorColors(this.features.background_color, this.features.feature_text);
            } else {
                this.changeEditorColors(this.addCategoryItemData.background_color, this.addCategoryItemData.text_color);
            }
        });
    }
}