import { Component, ViewEncapsulation, Input, OnInit, NgZone, ViewChild } from '@angular/core';
import { PageService, GridDataService } from '../../../../../../theme/services';
import { ShoppingCartService } from '../shopping-cart.service';
import { SelectItem, Dropdown, Dialog } from "primeng/primeng";
import { TAB_DIRECTIVES, TabsetComponent, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import {
    ShoppingCartInventoryCategory,
    ShoppingCartInventoryItem,
    ShoppingCartInventoryItemSize as ItemSize,
    ShoppingCartInventoryItemOption as ItemOption,
    ShoppingCartInventoryItemImage as ItemImage
} from "../../../../../../theme/interfaces/common-interfaces";
import { Dragula, DragulaService } from "ng2-dragula/ng2-dragula";
import { InventoryImage } from '../../../../../../theme/interfaces/index';

const CATEGORY_VIEW_DISPLAY = {
    GRID: 1,
    LIST: 2
};

const CATEGORY_STATUS = {
    ENABLED: 1,
    DISABLED: 2
};

const ITEM_STATUS = {
    ENABLED: 1,
    DISABLED: 2
};

@Component({
    selector: 'shopping-cart-inventory',
    encapsulation: ViewEncapsulation.None,
    template: require('./inventory.component.html'),
    providers: [PageService],
    directives: [Dropdown, Dialog, TOOLTIP_DIRECTIVES, Dragula, TAB_DIRECTIVES],
    viewProviders: [DragulaService]
})

export class Inventory implements OnInit {

    @Input() categoryList: ShoppingCartInventoryCategory[] = [];
    @Input() itemList: ShoppingCartInventoryItem[][] = [];
    @Input() settings: {
        go_back_prompt: boolean,
        shipping_instruction: boolean,
        category_view_display: number
    };
    @Input() currency: string;
    @ViewChild("inventoryItemTabset") inventoryItemTabset: TabsetComponent;

    public CATEGORY_VIEW_DISPLAY = CATEGORY_VIEW_DISPLAY;
    public CATEGORY_STATUS = CATEGORY_STATUS;
    public ITEM_STATUS = ITEM_STATUS;
    public CATEGORIES_BAG: string = "categories-bag";
    public ITEMS_BAG: string = "items-bag";
    public ITEM_SIZES_BAG: string = "item-sizes-bag";
    public ITEM_OPTIONS_BAG: string = "item-options-bag";
    public ITEM_IMAGES_BAG: string = "item-images-bag";

    public appID: number;
    public openedAccordion: number;
    public activeCategory: number;
    public selectedCategories: boolean[] = [];
    public selectedItems: any = {};
    public enableDeleteButton: boolean = false;
    public categoryFormHeader: string;
    public category: ShoppingCartInventoryCategory;
    public showCategoryFormDialog: boolean = false;
    public itemFormHeader: string;
    public item: ShoppingCartInventoryItem;
    public showItemFormDialog: boolean = false;
    public categoryOptions: SelectItem[] = [];
    public editItemCategoryBackup: number;
    public itemSizes: ItemSize[] = [];
    public itemOptions: ItemOption[] = [];
    public itemImages: ItemImage[] = [];
    public selectedItemSizes: boolean[] = [];
    public itemSizesCheckAllToggle: boolean = false;
    public selectedItemOptions: boolean[] = [];
    public itemOptionsCheckAllToggle: boolean = false;
    public selectedItemImages: boolean[] = [];
    public itemImagesCheckAllToggle: boolean = false;
    public sizesToDelete: number[] = [];
    public optionsToDelete: number[] = [];
    public imagesToDelete: number[] = [];
    public selectedItemSizesReferences: ItemSize[] = [];
    public selectedItemOptionsReferences: ItemOption[] = [];
    public selectedItemImagesReferences: ItemImage[] = [];
    public showCategoryImageSelector: boolean = false;
    public categoryImagesRetrieved: boolean = false;
    public catImagesList: InventoryImage[] = [];
    public showItemImageSelector: boolean = false;
    public itemImagesRetrieved: boolean = false;
    public itemImagesList: InventoryImage[] = [];
    public itemImageOnEdit: ItemImage;
    public disableItemImageDeleteButton: boolean = true;

    constructor(
        private pageService: PageService,
        private service: ShoppingCartService,
        private dataService: GridDataService,
        private zone: NgZone,
        private dragulaService: DragulaService
    ) {
        this.appID = parseInt(sessionStorage.getItem('appId'));
        dragulaService.setOptions(this.CATEGORIES_BAG, {
            moves: (el, container, handle) => {
                return handle.className.indexOf("dev-cat-drag-handle") !== -1;
            }
        });

        dragulaService.setOptions(this.ITEMS_BAG, {
            moves: (el, container, handle) => {
                return handle.className.indexOf("dev-item-drag-handle") !== -1;
            }
        });

        dragulaService.setOptions(this.ITEM_IMAGES_BAG, {
            moves: (el, container, handle) => {
                return el.className.indexOf("dev-primary-image") === -1;
            }
        });

        dragulaService.dropModel.subscribe(value => {
            switch (value[0]) {
                case this.CATEGORIES_BAG:
                    this.sortCategoriesAndItems(this.CATEGORIES_BAG);
                    break;
                case this.ITEMS_BAG:
                    this.sortCategoriesAndItems(this.ITEMS_BAG);
                    break;
                case this.ITEM_SIZES_BAG:
                    this.onItemSizeDrop();
                    break;
                case this.ITEM_OPTIONS_BAG:
                    this.onItemOptionDrop();
                    break;
                case this.ITEM_IMAGES_BAG:
                    this.onItemImageDrop();
                    break;
            }
        });

        dragulaService.drag.subscribe(value => {
            switch (value[0]) {
                case this.ITEM_SIZES_BAG:
                    this.onItemSizeDrag();
                    break;
                case this.ITEM_OPTIONS_BAG:
                    this.onItemOptionDrag();
                    break;
                case this.ITEM_IMAGES_BAG:
                    this.onItemImageDrag();
                    break;
            }
        });
    }

    public ngOnInit(): void {
        this.category = new ShoppingCartInventoryCategory();
        this.category.tab_id = this.service.tabID;

        this.item = new ShoppingCartInventoryItem();

        if (this.categoryList.length) {
            this.item.category_id = this.categoryList[0].id;
            this.openedAccordion = this.categoryList[0].id;
            this.activeCategory = this.categoryList[0].id;
            this.initSelectedItems();
            this.initCategoryOptions();
        }
    }

    private initSelectedItems(): void {
        this.selectedItems = {};
        for (let i = 0; i < this.categoryList.length; i++) {
            this.selectedItems[this.categoryList[i].id] = [];
        }
    }

    private initCategoryOptions(): void {
        this.categoryOptions = [];
        for (let i = 0; i < this.categoryList.length; i++) {
            this.categoryOptions.push({ label: this.categoryList[i].name, value: this.categoryList[i].id });
        }
    }

    public onCategoryViewDisplayClick(categoryViewDisplay: number) {
        this.settings.category_view_display = categoryViewDisplay;
    }

    public onUpdateSettingsClick(): void {
        this.service.saveInventorySettings({
            tab_id: this.service.tabID,
            category_view_display: this.settings.category_view_display
        }).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onAccordionArrowClick(categoryID: number): void {
        this.openedAccordion = categoryID !== this.openedAccordion ? categoryID : undefined;
    }

    public onCategoryDivClick(categoryID: number): void {
        this.activeCategory = categoryID;
    }

    private sortCategoriesAndItems(bag: string) {
        let data: { categoryIDs?: number[], itemIDs?: number[][] };
        if (bag === this.CATEGORIES_BAG) {
            data = { categoryIDs: [] };
            for (let i in this.categoryList) {
                data.categoryIDs.push(this.categoryList[i].id);
            }
        } else {
            data = { itemIDs: [] };
            for (let i in this.itemList) {
                let itemIDs: number[] = [];
                for (let j in this.itemList[i]) {
                    itemIDs.push(this.itemList[i][j].id);
                }
                data.itemIDs.push(itemIDs);
            }
        }
        this.service.sortInventory(data).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onCategoryStatusToggle(category: ShoppingCartInventoryCategory): void {
        let statusCopy: number = category.status;
        category.status = category.status === this.CATEGORY_STATUS.ENABLED ? this.CATEGORY_STATUS.DISABLED : this.CATEGORY_STATUS.ENABLED;
        PageService.showLoader();
        this.service.saveInventoryCategory(category).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
                category.status = statusCopy;
            }
        });
    }

    public onItemStatusToggle(item: ShoppingCartInventoryItem): void {
        let statusCopy: number = item.status;
        item.status = item.status === this.ITEM_STATUS.ENABLED ? this.ITEM_STATUS.DISABLED : this.ITEM_STATUS.ENABLED;
        PageService.showLoader();
        this.service.saveInventoryItem(item).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
                item.status = statusCopy;
            }
        });
    }

    public onCategoryCheck(categoryID: number): void {
        setTimeout(() => {
            this.zone.run(() => {
                this.selectedItems[categoryID] = this.pageService.toggleAllCheckboxes(this.selectedCategories[categoryID], this.itemList[categoryID]);
                this.handleDeleteButton();
            });
        });
    }

    public onItemCheck(categoryID: number): void {
        setTimeout(() => {
            this.zone.run(() => {
                if (!this.pageService.updateCheckAllToggle(this.selectedItems[categoryID], this.itemList[categoryID])) {
                    this.selectedCategories[categoryID] = false;
                }
                this.handleDeleteButton();
            });
        });
    }

    private handleDeleteButton(): void {
        if (this.selectedCategories.length && this.selectedCategories.indexOf(true) !== -1) {
            this.enableDeleteButton = true;
            return;
        }
        for (let i in this.selectedItems) {
            if (this.selectedItems[i].length && this.selectedItems[i].indexOf(true) !== -1) {
                this.enableDeleteButton = true;
                return;
            }
        }
        this.enableDeleteButton = false;
    }

    public onDeleteClick(): void {
        if (confirm("Do you really want to delete the selected items? ")) {
            this.deleteSelectedCategoriesAndItems();
        }
    }

    private deleteSelectedCategoriesAndItems(): void {
        let categoryIDs: any[] = [], itemIDs: any[] = [];
        PageService.showLoader();
        for (let i in this.selectedCategories) {
            if (this.selectedCategories[i]) {
                categoryIDs.push(i);
            }
        }
        for (let i in this.selectedItems) {
            for (let j in this.selectedItems[i]) {
                if (this.selectedItems[i][j]) {
                    itemIDs.push(j);
                }
            }
        }
        this.service.deleteInventory(categoryIDs, itemIDs).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.selectedCategories = [];
                this.initSelectedItems();
                this.enableDeleteButton = false;
                for (let i = 0; i < categoryIDs.length; i++) {
                    this.dataService.getByID(this.categoryList, categoryIDs[i], (data, index) => {
                        this.categoryList.splice(index, 1);
                    });
                }
                for (let i = 0; i < itemIDs.length; i++) {
                    let isFound: boolean = false;
                    for (let j in this.itemList) {
                        if (isFound) {
                            break;
                        }
                        for (let k in this.itemList[j]) {
                            if (this.itemList[j][k].id == itemIDs[i]) {
                                this.itemList[j].splice(parseInt(k), 1);
                                isFound = true;
                                break;
                            }
                        }
                    }
                }
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onAddCategoryClick(): void {
        this.categoryFormHeader = "Add Category";
        this.category = new ShoppingCartInventoryCategory();
        this.category.tab_id = this.service.tabID;
        this.showCategoryImageSelector = false;
        this.showCategoryFormDialog = true;
        this.pageService.onDialogOpen();
    }
    
    public onEditCategoryClick(category: ShoppingCartInventoryCategory): void {
        this.categoryFormHeader = "Edit Category";
        this.category = Object.assign({}, category);
        this.showCategoryImageSelector = false;
        this.showCategoryFormDialog = true;
        this.pageService.onDialogOpen();
    }

    public onCategoryFormSubmit(): void {
        PageService.showLoader();
        this.service.saveInventoryCategory(this.category).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.showCategoryFormDialog = false;
                this.pageService.showSuccess(res.message);
                this.updateCategoryList(res.data.id);
                this.category = new ShoppingCartInventoryCategory();
                this.category.tab_id = this.service.tabID;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    private updateCategoryList(id: number): void {
        if (!this.category.id) { // New category created
            this.category.id = id;
            this.categoryList.push(Object.assign({}, this.category));
            this.initSelectedItems();
        } else { // Existing category updated
            this.dataService.getByID(this.categoryList, id, (data, index) => {
                this.categoryList[index] = Object.assign({}, this.category);
            });
        }
    }

    public onAddItemClick(): void {
        if (!this.categoryList.length) {
            this.pageService.showWarning("No category is existing. Please create a category first and then try again.");
            this.onAddCategoryClick();
            return;
        }
        this.itemFormHeader = "Add Item";
        this.item = new ShoppingCartInventoryItem();
        this.item.category_id = this.categoryList[0].id;
        this.initCategoryOptions();
        this.itemSizes = [];
        this.itemOptions = [];
        this.itemImages = [];
        for (let i = 0; i < 5; i++) {
            this.itemSizes.push(new ItemSize());
            this.itemOptions.push(new ItemOption());
            this.itemImages.push(new ItemImage());
        }
        this.selectedItemSizes = [];
        this.selectedItemOptions = [];
        this.selectedItemImages = [];
        this.inventoryItemTabset.tabs[0].active = true;
        this.disableItemImageDeleteButton = true;
        this.showItemImageSelector = false;
        this.showItemFormDialog = true;
        this.pageService.onDialogOpen();
    }

    public onEditItemClick(itemID: number): void {
        PageService.showLoader();
        this.service.getInventoryItem(itemID).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.itemFormHeader = "Edit Item";
                this.item = res.data.item;
                this.editItemCategoryBackup = this.item.category_id;
                this.initCategoryOptions();

                this.itemSizes = [];
                this.itemOptions = [];
                this.itemImages = [];
                for (let i = 0; i < 5; i++) {
                    this.itemSizes.push(res.data.sizes[i] ? res.data.sizes[i] : new ItemSize());
                    this.itemOptions.push(res.data.options[i] ? res.data.options[i] : new ItemOption());
                    this.itemImages.push(res.data.images[i] ? res.data.images[i] : new ItemImage());
                }
                this.selectedItemSizes = [];
                this.selectedItemOptions = [];
                this.selectedItemImages = [];
                this.inventoryItemTabset.tabs[0].active = true;
                this.disableItemImageDeleteButton = true;
                this.showItemImageSelector = false;
                this.showItemFormDialog = true;
                this.pageService.onDialogOpen();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onItemFormSubmit(): void {
        if (!this.item.category_id) {
            this.item.category_id = this.categoryList[0].id;
        }
        PageService.showLoader();
        let sizes: ItemSize[] = [], options: ItemOption[] = [], images: ItemImage[] = [];
        for (let i = 0; i < this.itemSizes.length; i++) {
            if (
                (this.itemSizes[i].price == undefined || this.itemSizes[i].price.toString() === "")
                && (this.itemSizes[i].title == undefined || this.itemSizes[i].title === "")
            ) {
                if (this.itemSizes[i].id) {
                    this.sizesToDelete.push(this.itemSizes[i].id);
                }
            } else {
                sizes.push(this.itemSizes[i]);
            }
        }
        for (let i = 0; i < this.itemOptions.length; i++) {
            if (
                (this.itemOptions[i].charges == undefined || this.itemOptions[i].charges.toString() === "")
                && (this.itemOptions[i].title == undefined || this.itemOptions[i].title === "")
            ) {
                if (this.itemOptions[i].id) {
                    this.optionsToDelete.push(this.itemOptions[i].id);
                }
            } else {
                options.push(this.itemOptions[i]);
            }
        }

        for (let i = 0; i < this.itemImages.length; i++) {
            if (this.itemImages[i].image === undefined) {
                if (this.itemImages[i].id && this.imagesToDelete.indexOf(this.itemImages[i].id) === -1) {
                    this.imagesToDelete.push(this.itemImages[i].id);
                }
            } else {
                images.push(this.itemImages[i]);
            }
        }
        this.service.saveInventoryItem(
            this.item,
            sizes,
            options,
            images,
            this.sizesToDelete,
            this.optionsToDelete,
            this.imagesToDelete
        ).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.showItemFormDialog = false;
                this.pageService.showSuccess(res.message);
                this.updateItemList(res.data.id);
                this.item = new ShoppingCartInventoryItem();
                this.item.category_id = this.categoryList[0].id;
                this.sizesToDelete = [];
                this.optionsToDelete = [];
                this.imagesToDelete = [];
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    private updateItemList(id: number): void {
        if (!this.itemList[this.item.category_id]) {
            this.itemList[this.item.category_id] = [];
        }
        if (!this.item.id) { // New item created
            let newItem: ShoppingCartInventoryItem = new ShoppingCartInventoryItem();
            newItem.id = id;
            newItem.category_id = this.item.category_id;
            newItem.name = this.item.name;
            this.itemList[this.item.category_id].push(newItem);
        } else { // Existing item updated
            this.dataService.getByID(this.itemList[this.item.category_id], id, (data, index) => {
                this.itemList[this.item.category_id][index].name = this.item.name;
            }, () => {
                this.dataService.getByID(this.itemList[this.editItemCategoryBackup], id, (data, index) => {
                    // Item was not found in its category, which means item's category was changed.
                    let newItem: ShoppingCartInventoryItem = Object.assign({}, this.itemList[this.editItemCategoryBackup][index]);
                    newItem.name = this.item.name;
                    this.itemList[this.item.category_id].push(newItem);
                    this.itemList[this.editItemCategoryBackup].splice(index, 1);

                    // Delete item from selected list if it is selected.
                    if (this.selectedItems[this.editItemCategoryBackup] && this.selectedItems[this.editItemCategoryBackup][id]) {
                        this.selectedItems[this.editItemCategoryBackup][id] = false;
                        this.handleDeleteButton();
                    }
                });
            });
        }
    }

    public onItemFormInvalid(): void {
        this.inventoryItemTabset.tabs[0].active = true;
    }

    public onAddNewSizeClick(): void {
        this.itemSizes.push(new ItemSize());
    }

    public onItemSizeSelectAllCheck(): void {
        setTimeout(() => {
            this.zone.run(() => {
                this.selectedItemSizes = this.pageService.toggleAllCheckboxes(this.itemSizesCheckAllToggle, this.itemSizes, true);
            });
        });
    }

    public onItemSizeCheck(): void {
        setTimeout(() => {
            this.zone.run(() => {
                this.itemSizesCheckAllToggle = this.pageService.updateCheckAllToggle(this.selectedItemSizes, this.itemSizes);
            });
        });
    }

    public onDeleteItemSizesClick(): void {
        if (confirm("Are you sure you want to delete the selected items?")) {
            for (let i = this.selectedItemSizes.length - 1; i >= 0; i--) {
                if (this.selectedItemSizes[i]) {
                    if (this.itemSizes[i].id) {
                        this.sizesToDelete.push(this.itemSizes[i].id);
                    }
                    this.itemSizes.splice(i, 1);
                }
            }
            this.selectedItemSizes = [];
        }
    }


    private onItemSizeDrag(): void {
        if (!this.selectedItemSizes.length) {
            return;
        }
        this.selectedItemSizesReferences = [];
        for (let i in this.selectedItemSizes) {
            if (this.selectedItemSizes[i]) {
                this.selectedItemSizesReferences.push(this.itemSizes[i]);
            }
        }
    }

    private onItemSizeDrop(): void {
        if (!this.selectedItemSizesReferences.length) {
            return;
        }
        this.selectedItemSizes = [];
        for (let i = 0; i < this.selectedItemSizesReferences.length; i++) {
            this.selectedItemSizes[this.itemSizes.indexOf(this.selectedItemSizesReferences[i])] = true;
        }
    }

    public onAddNewOptionClick(): void {
        this.itemOptions.push(new ItemOption());
    }

    public onItemOptionSelectAllCheck(): void {
        setTimeout(() => {
            this.zone.run(() => {
                this.selectedItemOptions = this.pageService.toggleAllCheckboxes(this.itemOptionsCheckAllToggle, this.itemOptions, true);
            });
        });
    }

    public onItemOptionCheck(): void {
        setTimeout(() => {
            this.zone.run(() => {
                this.itemOptionsCheckAllToggle = this.pageService.updateCheckAllToggle(this.selectedItemOptions, this.itemOptions);
            });
        });
    }

    public onDeleteItemOptionsClick(): void {
        if (confirm("Are you sure you want to delete the selected items?")) {
            for (let i = this.selectedItemOptions.length - 1; i >= 0; i--) {
                if (this.selectedItemOptions[i]) {
                    if (this.itemOptions[i].id) {
                        this.optionsToDelete.push(this.itemOptions[i].id);
                    }
                    this.itemOptions.splice(i, 1);
                }
            }
            this.selectedItemOptions = [];
        }
    }

    private onItemOptionDrag(): void {
        if (!this.selectedItemOptions.length) {
            return;
        }
        this.selectedItemOptionsReferences = [];
        for (let i in this.selectedItemOptions) {
            if (this.selectedItemOptions[i]) {
                this.selectedItemOptionsReferences.push(this.itemOptions[i]);
            }
        }
    }

    private onItemOptionDrop(): void {
        if (!this.selectedItemOptionsReferences.length) {
            return;
        }
        this.selectedItemOptions = [];
        for (let i = 0; i < this.selectedItemOptionsReferences.length; i++) {
            this.selectedItemOptions[this.itemOptions.indexOf(this.selectedItemOptionsReferences[i])] = true;
        }
    }

    public toggleCategoryImageSelector(): void {
        this.showCategoryImageSelector = !this.showCategoryImageSelector;
        if (!this.categoryImagesRetrieved) {
            this.getCategoryImagesList();
        }
    }

    private getCategoryImagesList(newImagesAdded?: boolean): void {
        this.service.getInventoryCategoryImagesList(this.appID).subscribe(res => {
            if (res.success) {
                this.categoryImagesRetrieved = true;
                this.catImagesList = res.data.app;
                if (newImagesAdded) {
                    this.category.image = this.catImagesList[0].name;
                }
            } else {
                console.warn(res.message);
            }
        });
    }

    public onCategoryImageClick(imageName: string): void {
        this.category.image = this.category.image === imageName ? null : imageName;
        this.category.image_url = null;
    }

    public onCategoryImageChange(event): void {
        PageService.showLoader();
        this.service.addInventoryCategoryImages(event.target.files, this.appID).subscribe(res => {
            PageService.hideLoader();
            event.target.value = null;
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.getCategoryImagesList(true);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onCategoryImageDeleteClick(imageName: string, index: number, event: Event): void {
        event.stopPropagation();
        if (confirm("Are you sure you want to delete this image?")) {
            PageService.showLoader();
            this.service.deleteInventoryCategoryImage(imageName).subscribe(res => {
                PageService.hideLoader();
                if (res.success) {
                    this.catImagesList.splice(index, 1);
                    this.pageService.showSuccess(res.message);
                } else {
                    this.pageService.showError(res.message);
                }
            });
        }
    }

    public toggleItemImageSelector(itemImage: ItemImage): void {
        this.showItemImageSelector = !this.showItemImageSelector;
        if (this.showItemImageSelector) {
            this.itemImageOnEdit = itemImage;
            if (!this.itemImagesRetrieved) {
                this.getItemImagesList();
            }
        }
    }

    public getItemImagesList(newImagesAdded?: boolean): void {
        this.service.getInventoryItemImagesList(this.appID).subscribe(res => {
            if (res.success) {
                this.itemImagesRetrieved = true;
                this.itemImagesList = res.data.app;
                if (newImagesAdded) {
                    this.itemImageOnEdit.image = this.itemImagesList[0].name;
                    this.itemImageOnEdit.image_url = this.itemImagesList[0].url;
                }
            } else {
                console.warn(res.message);
            }
        });
    }

    public onItemImageChange(event): void {
        PageService.showLoader();
        this.service.addInventoryItemImages(event.target.files, this.appID).subscribe(res => {
            PageService.hideLoader();
            event.target.value = null;
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.getItemImagesList(true);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onItemImageClick(image: InventoryImage): void {
        if (this.itemImageOnEdit.image !== image.name) {
            this.itemImageOnEdit.image = image.name;
            this.itemImageOnEdit.image_url = image.url;
        } else {
            this.itemImageOnEdit.image = undefined;
            this.itemImageOnEdit.image_url = undefined;
            if (this.itemImageOnEdit.id && this.selectedItemImages[this.itemImageOnEdit.id]) {
                this.selectedItemImages[this.itemImageOnEdit.id] = false;
            }
        }
    }

    public onItemImageSelectAllCheck(): void {
        setTimeout(() => {
            this.zone.run(() => {
                this.selectedItemImages = this.pageService.toggleAllCheckboxes(this.itemImagesCheckAllToggle, this.itemImages, true);
                this.disableItemImageDeleteButton = true;
                if (this.itemImagesCheckAllToggle) {
                    for (let i in this.selectedItemImages) {
                        if (this.selectedItemImages[i] && this.itemImages[i].image) {
                            this.disableItemImageDeleteButton = false;
                            break;
                        }
                    }
                }
            });
        });
    }

    public onItemImageCheck(index: number): void {
        setTimeout(() => {
            this.zone.run(() => {
                this.itemImagesCheckAllToggle = this.pageService.updateCheckAllToggle(this.selectedItemImages, this.itemImages);
                if (this.selectedItemImages[index] && this.itemImages[index].image) {
                    this.disableItemImageDeleteButton = false;
                } else if (this.itemImages[index].image) {
                    this.disableItemImageDeleteButton = true;
                    for (let i in this.selectedItemImages) {
                        if (this.selectedItemImages[i] && this.itemImages[i].image) {
                            this.disableItemImageDeleteButton = false;
                            break;
                        }
                    }
                }
            });
        });
    }

    public onDeleteItemImagesClick(): void {
        if (confirm("Are you sure you want to delete the selected images?")) {
            for (let i = this.selectedItemImages.length - 1; i >= 0; i--) {
                if (this.selectedItemImages[i]) {
                    if (this.itemImages[i].id) {
                        this.imagesToDelete.push(this.itemImages[i].id);
                    }
                    this.itemImages[i].image = undefined;
                    this.itemImages[i].image_url = undefined;
                }
            }
            this.selectedItemImages = [];
        }
    }

    private onItemImageDrag(): void {
        if (!this.selectedItemImages.length) {
            return;
        }
        this.selectedItemImagesReferences = [];
        for (let i in this.selectedItemImages) {
            if (this.selectedItemImages[i]) {
                this.selectedItemImagesReferences.push(this.itemImages[i]);
            }
        }
    }

    private onItemImageDrop(): void {
        if (!this.selectedItemImagesReferences.length) {
            return;
        }
        this.selectedItemImages = [];
        for (let i = 0; i < this.selectedItemImagesReferences.length; i++) {
            this.selectedItemImages[this.itemImages.indexOf(this.selectedItemImagesReferences[i])] = true;
        }
    }

    public onItemImageDeleteClick(imageName: string, index: number, event: Event): void {
        event.stopPropagation();
        if (confirm("Are you sure you want to delete this image?")) {
            PageService.showLoader();
            this.service.deleteInventoryItemImage(imageName).subscribe(res => {
                PageService.hideLoader();
                if (res.success) {
                    this.itemImagesList.splice(index, 1);
                    this.pageService.showSuccess(res.message);
                } else {
                    this.pageService.showError(res.message);
                }
            });
        }
    }

    public stopPropagation(event: Event): void {
        event.stopPropagation();
    }

}