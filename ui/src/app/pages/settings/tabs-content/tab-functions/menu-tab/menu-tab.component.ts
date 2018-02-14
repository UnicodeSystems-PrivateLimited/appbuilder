import { Component, ViewEncapsulation, ElementRef, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { Tab, MenuCategory, MenuItem } from "../../../../../theme/interfaces/common-interfaces";
import { MenuTabService } from './menu-tab.service';
import { ColorPickerDirective } from "../../../../../color-picker/color-picker.directive";
// import { CKEditor } from 'ng2-ckeditor';
import { MobileViewComponent } from '../../../../../components';
declare var $: any;

@Component({
    selector: 'tab-function-menu-tab',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, Dialog, MobileViewComponent, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, Dragula, ColorPickerDirective],
    encapsulation: ViewEncapsulation.None,
    template: require('./menu-tab.component.html'),
    styles: [require('./menu-tab.scss')],
    viewProviders: [DragulaService],
    providers: [PageService, MenuTabService]
})

export class MenuTab {
    public tabId: number;
    public ready: boolean = false;
    public menuCategories: MenuCategory[] = [];
    public deleteCategoryId: number = null;
    public deleteItemId: number = null;
    public menuItems: MenuItem[] = [];
    public selectedCategoryId: number = null;
    public addMenuItemData: MenuItem = new MenuItem();
    public editMenuItemData: any = new MenuItem();
    public addItemOverlayDisplay: string = "none";
    public editItemOverlayDisplay: string = "none";
    public checkTrue: boolean = false;
    public checkItemTrue: boolean = false;
    private MENU_CATEGORY_STATUS_ENABLED = 1;
    private MENU_CATEGORY_STATUS_DISABLED = 2;
    private MENU_ITEM_STATUS_ENABLED = 1;
    private MENU_ITEM_STATUS_DISABLED = 2;
    private MENU_CATEGORY_BAG_NAME = "menu-cat-bag";
    private MENU_ITEM_BAG_NAME = "menu-item-bag";

    // ------------------- DISPLAY CONTROL ----------------------------
    public addCategoryDialogDisplay: boolean = false;
    public editCategoryDialogDisplay: boolean = false;
    public showDeleteCategoryDialog: boolean = false;
    public showDeleteItemDialog: boolean = false;
    public showLoader: boolean = false;
    public listItemDialogDisplay: boolean = false;
    public addItemDialogDisplay: boolean = false;
    public editItemDialogDisplay: boolean = false;
    public showEditor: string = null;
    public addSaveButtonHide: boolean = false;
    // ----------------------------------------------------------------

    public addCategoryData: MenuCategory = {
        tab_id: null,
        name: '',
        section: '',
        status: true
    };

    public editCategoryData: MenuCategory = {
        id: null,
        name: '',
        section: '',
        status: true
    };

    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };

    // public ckEditorConfig: any = {
    //     uiColor: '#F0F3F4',
    //     height: '600',
    //     filebrowserUploadUrl: '/api/ws/function/ck-editor-image/uploadCkeditorImage',
    // };
    public features: any = {};
    public selectedCategory: boolean[] = [];
    public selectedItem: boolean[] = [];
    public checkAll: boolean = false;
    public checkAllItem: boolean = false;
    public editorView: any = null;

    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: MenuTabService,
        private dragulaService: DragulaService,
        private dataService: GridDataService) {
        this.tabId = parseInt(params.get('tabId'));
        this.addCategoryData.tab_id = this.tabId;

        dragulaService.dropModel.subscribe((value) => {
            // Do something according to the bags. Cool, right ?
            switch (value[0]) {
                case this.MENU_CATEGORY_BAG_NAME:
                    this.sortCategories();
                    break;
                case this.MENU_ITEM_BAG_NAME:
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
                this.menuCategories = res.data.menu_category;
                this.tabData = res.data.tabData;
                if (res.data.style.features) {
                    this.features = res.data.style.features;
                }
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public sortCategories(): void {
        let ids: number[] = [];
        for (let category of this.menuCategories) {
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

    public showAddCategoryDialog(): void {
        this.addCategoryDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public onAddCategorySubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        // Object.assign() is used here to make a clone of this.addCategoryData, but NOT BY REFERENCE.
        let data: MenuCategory = Object.assign({}, this.addCategoryData);

        data.status = data.status ? this.MENU_CATEGORY_STATUS_ENABLED : this.MENU_CATEGORY_STATUS_DISABLED;
        this.service.addCategory(data).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.addCategoryDialogDisplay = false;
                this.pageService.showSuccess(res.message);
                this.refreshAddCategoryData();
                this.getCategoryList();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public getCategoryList(): void {
        this.service.getCategoryList(this.tabId).subscribe(res => {
            if (res.success) {
                this.menuCategories = res.data;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public refreshAddCategoryData(): void {
        this.addCategoryData.name = '';
        this.addCategoryData.section = '';
        this.addCategoryData.status = true;
    }

    public onEditCategorySubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        // Object.assign() is used here to make a clone of this.editCategoryData, but NOT BY REFERENCE.
        let data: MenuCategory = Object.assign({}, this.editCategoryData);

        data.status = data.status ? this.MENU_CATEGORY_STATUS_ENABLED : this.MENU_CATEGORY_STATUS_DISABLED;
        this.service.editCategory(data).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.editCategoryDialogDisplay = false;
                this.pageService.showSuccess(res.message);
                this.refreshEditCategoryData();
                this.getCategoryList();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public refreshEditCategoryData(): void {
        this.editCategoryData.id = null;
        this.editCategoryData.name = '';
        this.editCategoryData.section = '';
        this.editCategoryData.status = true;
    }

    public showEditCategoryDialog(id: number): void {
        this.editCategoryDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.showLoader = true;
        this.refreshEditCategoryData();
        this.service.getCategory(id).subscribe((res) => {
            if (res.success) {
                this.editCategoryData = res.data;
                this.editCategoryData.status = this.editCategoryData.status === this.MENU_CATEGORY_STATUS_ENABLED ? true : false;
                this.showLoader = false;
            }
        });
    }

    //    public onDeleteCategoryClick(id: number): void {
    //        this.deleteCategoryId = id;
    //        this.showDeleteCategoryDialog = true;
    //    }
    //
    //    public deleteCategory(): void {
    //        this.showLoader = true;
    //        this.service.deleteCategory([this.deleteCategoryId]).subscribe((res) => {
    //            if (res.success) {
    //                this.showLoader = false;
    //                this.showDeleteCategoryDialog = false;
    //                this.pageService.showSuccess(res.message);
    //                this.dataService.getByID(this.menuCategories, this.deleteCategoryId, (data, index) => {
    //                    this.menuCategories.splice(index, 1);
    //                });
    //            } else {
    //                this.pageService.showError(res.message);
    //            }
    //        });
    //    }

    public showItemListDialog(categoryId: number): void {
        this.selectedCategoryId = categoryId;
        this.menuItems = null;
        this.listItemDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.showLoader = true;
        this.getMenuItemList();
    }

    public showAddItemDialog(): void {
        this.addItemDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.showEditor = "add";
        this.initEditor();
        // this.changeEditorColors(this.features.background_color, this.features.feature_text);
    }

    public showEditItemDialog(itemId: number): void {
        this.editMenuItemData = new MenuItem();
        this.editItemDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.showEditor = "edit";
        this.showLoader = true;
        this.service.getMenuItem(itemId).subscribe((res) => {
            if (res.success) {
                this.editMenuItemData = res.data;
                this.initEditor();
                this.editMenuItemData.status = this.editMenuItemData.status === this.MENU_ITEM_STATUS_ENABLED ? true : false;
                this.editMenuItemData.use_global_colors = this.editMenuItemData.use_global_colors == 1 ? true : false;
                this.editMenuItemData.use_global_colors = !!this.editMenuItemData.use_global_colors;
                if (this.editMenuItemData.use_global_colors) {
                    this.changeEditorColors(this.features.background_color, this.features.feature_text);
                } else {
                    this.changeEditorColors(this.editMenuItemData.background_color, this.editMenuItemData.text_color);
                }

                this.showLoader = false;
            }
        });
    }

    public onAddFormUpdateColorClick(): void {
        this.changeEditorColors(this.addMenuItemData.background_color, this.addMenuItemData.text_color);
    }

    public onEditFormUpdateColorClick(): void {
        this.changeEditorColors(this.editMenuItemData.background_color, this.editMenuItemData.text_color);
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

    public sortMenuItems(): void {
        let ids: number[] = [];
        for (let item of this.menuItems) {
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

    public onAddItemSubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        if (this.editorView) {
            this.addMenuItemData.description = this.editorView.html();
        }
        let data: MenuItem = Object.assign({}, this.addMenuItemData);
        data.status = data.status ? this.MENU_ITEM_STATUS_ENABLED : this.MENU_ITEM_STATUS_DISABLED;
        data.use_global_colors = data.use_global_colors ? 1 : 0;
        data.menu_id = this.selectedCategoryId;
        this.service.addMenuItem(data).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.editorView = null;
                this.addItemDialogDisplay = false;
                this.pageService.showSuccess(res.message);
                // this.showEditor = false;
                this.addMenuItemData = new MenuItem();
                this.getMenuItemList();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public getMenuItemList(): void {
        this.service.getItemList(this.selectedCategoryId).subscribe(res => {
            if (res.success) {
                this.menuItems = res.data;
                this.showLoader = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onAddItemUseGlobalClick(): void {
        this.addItemOverlayDisplay = !this.addMenuItemData.use_global_colors ? "block" : "none";
        if (!this.addMenuItemData.use_global_colors) {
            this.changeEditorColors(this.features.background_color, this.features.feature_text);
        } else {
            this.changeEditorColors(this.addMenuItemData.background_color, this.addMenuItemData.text_color);
        }
    }

    public onEditItemUseGlobalClick(): void {
        this.editItemOverlayDisplay = !this.editMenuItemData.use_global_colors ? "block" : "none";
        if (!this.editMenuItemData.use_global_colors) {
            this.changeEditorColors(this.features.background_color, this.features.feature_text);
        } else {
            this.changeEditorColors(this.editMenuItemData.background_color, this.editMenuItemData.text_color);
        }
    }

    public onEditItemSubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        if (this.editorView) {
            this.editMenuItemData.description = this.editorView.html();
        }
        let data: MenuItem = Object.assign({}, this.editMenuItemData);
        data.status = data.status ? this.MENU_ITEM_STATUS_ENABLED : this.MENU_ITEM_STATUS_DISABLED;
        data.use_global_colors = data.use_global_colors ? 1 : 0;
        this.service.editMenuItem(data).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.editorView = null;
                this.editItemDialogDisplay = false;
                this.pageService.showSuccess(res.message);
                // this.showEditor = false;
                this.editMenuItemData = new MenuItem();
                this.getMenuItemList();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    //    public onDeleteItemClick(id: number): void {
    //        this.deleteItemId = id;
    //        this.showDeleteItemDialog = true;
    //    }
    //
    //    public deleteItem(): void {
    //        this.showLoader = true;
    //        this.service.deleteMenuItem([this.deleteItemId]).subscribe((res) => {
    //            if (res.success) {
    //                this.showLoader = false;
    //                this.showDeleteItemDialog = false;
    //                this.pageService.showSuccess(res.message);
    //                this.dataService.getByID(this.menuItems, this.deleteItemId, (data, index) => {
    //                    this.menuItems.splice(index, 1);
    //                });
    //            } else {
    //                this.pageService.showError(res.message);
    //            }
    //        });
    //    }

    public onCategoryDeleteClick(): void {
        if (this.selectedCategory.length > 0 && this.selectedCategory.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete category? ");
            if (yes) {
                this.deleteCategory();
            }
        }
    }

    public refreshSelectedCategory(): void {
        this.selectedCategory = [];
    }

    public onCheckAllChange(): void {
        // this.checkTrue = !this.checkTrue;
        this.refreshSelectedCategory();
        if (!this.checkAll) {
            for (let i in this.menuCategories) {
                this.selectedCategory[this.menuCategories[i].id] = true;
            }
            this.checkTrue = true;
        }
        else {
            for (let i in this.menuCategories) {
                this.selectedCategory[this.menuCategories[i].id] = false;
            }
            this.checkTrue = false;
        }
    }

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
                this.checkTrue = false;
                                this.selectedCategory = [];

                for (var i = 0; i < ids.length; i++) {
                    console.log('ids==============', ids[i]);
                    this.menuCategories.forEach((menuCategories, index) => {
                        console.log('menuCategories.id==============', menuCategories.id);
                        if (menuCategories.id == ids[i]) {
                            console.log('in');
                            this.menuCategories.splice(index, 1);
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

    public onItemDeleteClick(): void {
        if (this.selectedItem.length > 0 && this.selectedItem.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete item? ");
            if (yes) {
                this.deleteItem();
            }
        }
    }

    public refreshSelectedItems(): void {
        this.selectedItem = [];
    }

    public onCheckAllItemChange(): void {
        // this.checkItemTrue = !this.checkItemTrue;
        this.refreshSelectedItems();
        if (!this.checkAllItem) {
            for (let i in this.menuItems) {
                this.selectedItem[this.menuItems[i].id] = true;
            }
            this.checkItemTrue = true;
        }
        else {
            for (let i in this.menuItems) {
                this.selectedItem[this.menuItems[i].id] = false;
            }
            this.checkItemTrue = false;
        }
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
        this.service.deleteMenuItem(item_ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkItemTrue = false;
                                this.selectedItem = [];

                for (var i = 0; i < item_ids.length; i++) {
                    console.log('ids==============', item_ids[i]);
                    this.menuItems.forEach((menuItems, index) => {
                        console.log('menuItems.id==============', menuItems.id);
                        if (menuItems.id == item_ids[i]) {
                            console.log('in');
                            this.menuItems.splice(index, 1);
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

    // disble enter keyCode
    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.which == 13 || event.keyCode == 13)
            event.preventDefault();
    }

    public onCheckCategoryTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.menuCategories.forEach((menuCategories) => {
                console.log('menuCategories', menuCategories);
                console.log('checkedTab', checkedTab);
                if (menuCategories.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedCategory[menuCategories.id]) {
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
            this.menuItems.forEach((menuItems) => {
                console.log('menuItems', menuItems);
                console.log('checkedTab', checkedTab);
                if (menuItems.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedItem[menuItems.id]) {
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
        console.log("this.showEditor",this.showEditor);
        setTimeout(() => {
            let editorDiv = window["_globalJQuery"]("div#description-editor");
            editorDiv.froalaEditor({
                fileUploadURL: this.pageService.editorURLs.fileUpload,
                videoUploadURL: this.pageService.editorURLs.videoUpload,
                imageUploadURL: this.pageService.editorURLs.imageUpload + "/" + sessionStorage.getItem('appId'),
                imageManagerLoadURL: this.pageService.editorURLs.imageManagerLoad + "/" + sessionStorage.getItem('appId'),
            });
            this.editorView = editorDiv.find(".fr-view");
            if(this.showEditor == 'add' ? this.addMenuItemData.description : this.editMenuItemData.description) {
                editorDiv.froalaEditor('placeholder.hide') 
            }
            this.editorView.html(this.showEditor == 'add' ? this.addMenuItemData.description : this.editMenuItemData.description);
            if ((this.showEditor == 'add' ? this.addMenuItemData.use_global_colors : this.editMenuItemData.use_global_colors) && this.features.background_color && this.features.feature_text) {
                this.changeEditorColors(this.features.background_color, this.features.feature_text);
            } else {
                this.changeEditorColors(this.showEditor == 'add' ? this.addMenuItemData.background_color : this.editMenuItemData.background_color, this.showEditor == 'add' ? this.addMenuItemData.text_color : this.editMenuItemData.text_color);
            }
        });
    }

    public onAddEditDialogHide(): void {
        this.editorView = null;
    }
}
