import {
  Component,
  ViewEncapsulation,
  Input,
  OnInit,
  NgZone,
  ViewChild
} from "@angular/core";
import { PageService, GridDataService } from "../../../../../../theme/services";
import { FoodOrderingService } from "../food-ordering.service";
import { SelectItem, MultiSelect, Dropdown, Dialog } from "primeng/primeng";
import {
  TAB_DIRECTIVES,
  TabsetComponent,
  TOOLTIP_DIRECTIVES
} from "ng2-bootstrap/ng2-bootstrap";
import {
  FoodOrderingMenuCategory,
  FoodOrderingMenuItem,
  FoodOrderingMenuItemSize as ItemSize,
  FoodOrderingMenuOptionType as ItemOptionsType,
  FoodOrderingMenuItemOption as ItemOption,
  FoodOrderingMenuItemImage as ItemImage,
  AvailabilityInfo
} from "../../../../../../theme/interfaces/common-interfaces";
import { Dragula, DragulaService } from "ng2-dragula/ng2-dragula";
import { MenuImage } from "../../../../../../theme/interfaces/index";

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
  selector: "food-ordering-menu",
  encapsulation: ViewEncapsulation.None,
  template: require("./menu.component.html"),
  styles: [require('./menu.scss')],
  providers: [PageService],
  directives: [Dropdown, Dialog, TOOLTIP_DIRECTIVES, Dragula, TAB_DIRECTIVES, MultiSelect],
  viewProviders: [DragulaService]
})
export class Menu implements OnInit {
  @Input() foodlocationInfoData: Array<any> = [];
  @Input() categoryList: FoodOrderingMenuCategory[] = [];
  @Input() itemList: FoodOrderingMenuItem[][] = [];
  @Input()
  settings: {
    go_back_prompt: boolean;
    shipping_instruction: boolean;
    category_view_display: number;
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
  public ITEM_MENU_BAG: string = "item-menu-bag";

  public appID: number;
  public openedAccordion: number;
  public activeCategory: number;
  public activeOptions: number;
  public selectedCategories: boolean[] = [];
  public selectedItems: any = {};
  public selectedOptionsType: boolean[] = [];
  public selectedOptionsItems: any = {};
  public enableDeleteButton: boolean = false;
  public categoryFormHeader: string;
  public menuItemHeader: string;
  public category: FoodOrderingMenuCategory;
  public showCategoryFormDialog: boolean = false;
  public showMenuItemDialog: boolean = false;
  public itemFormHeader: string;
  public item: FoodOrderingMenuItem;
  public showItemFormDialog: boolean = false;
  public categoryOptions: SelectItem[] = [];
  public availabilityOptions: SelectItem[] = [];
  public locationOptions = [];
  public editItemCategoryBackup: number;
  public itemSizes: ItemSize[] = [];
  public itemOptionsType: Array<ItemOptionsType> = [];
  public itemOptions: Array<ItemOption> = [];
  public itemImages: ItemImage[] = [];
  public selectedItemSizes: boolean[] = [];
  public itemSizesCheckAllToggle: boolean = false;
  public selectedItemOptions: boolean[] = [];
  public selectedMenuItemOptions: boolean[] = [];
  public itemOptionsCheckAllToggle: boolean = false;
  public menuItemOptionsCheckAllToggle: boolean = false;
  public selectedItemImages: boolean[] = [];
  public itemImagesCheckAllToggle: boolean = false;
  public sizesToDelete: number[] = [];
  public optionsToDelete: number[] = [];
  public itemsOptionsToDelete: number[] = [];
  public imagesToDelete: number[] = [];
  public selectedItemSizesReferences: ItemSize[] = [];
  public selectedOptionsTypeReferences: ItemOptionsType[] = [];
  public selectedItemMenuReferences: ItemOption[] = [];
  public showCategoryImageSelector: boolean = false;
  public categoryImagesRetrieved: boolean = false;
  public catImagesList: MenuImage[] = [];
  public showItemImageSelector: boolean = false;
  public itemImagesRetrieved: boolean = false;
  public itemImagesList: MenuImage[] = [];
  public itemImageOnEdit: ItemImage;
  public disableItemImageDeleteButton: boolean = true;
  public startTimeHour = [];
  public startTimeMin = [];
  public availabilityInfo: AvailabilityInfo = new AvailabilityInfo();

  constructor(
    private pageService: PageService,
    private service: FoodOrderingService,
    private dataService: GridDataService,
    private zone: NgZone,
    private dragulaService: DragulaService
  ) {
    this.appID = parseInt(sessionStorage.getItem("appId"));
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
    
    // dragulaService.setOptions(this.ITEM_OPTIONS_BAG, {
    //     moves: (el, container, handle) => {
    //         return el.className.indexOf("dev-options-drag-handle") === -1;
    //     }
    // });
    
    // dragulaService.setOptions(this.ITEM_MENU_BAG, {
    //     moves: (el, container, handle) => {
    //         return el.className.indexOf("dev-primary-image") === -1;
    //     }
    // });

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
            //this.sortOptions(this.ITEM_OPTIONS_BAG);
            this.onItemOptionDrop();
            break;
        case this.ITEM_MENU_BAG:
            //this.sortOptions(this.ITEM_MENU_BAG);
                this.onItemMenuDrop();
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
            case this.ITEM_MENU_BAG:
                this.onItemMenuDrag();
                break;
        }
    });
    for (let j = 1; j <= 23; j++) {
        let temp;
        if (j < 10) {
            temp = j;
            temp = '0' + temp;
        } else {
            temp = j;
        }
        this.startTimeHour.push({ label: temp, value: temp });
    }
    for (let k = 0; k <= 59; k++) {
        let temp;
        if (k < 10) {
            temp = k;
            temp = '0' + temp;
        } else {
            temp = k;
        }
        this.startTimeMin.push({ label: temp, value: temp });
    }
  }

  public ngOnInit(): void {
    this.category = new FoodOrderingMenuCategory();
    this.category.tab_id = this.service.tabID;
    this.item = new FoodOrderingMenuItem();
    this.availabilityOptions = [
      { label: 'None', value: '0' },
      { label: 'Any Open Time', value: '1' },
      { label: 'Specific Time', value: '2' }
    ];
    this.initaAvailableOptions();
      this.locationOptions.push({ label: 'All Locations', value: 0 });
      for (let item of this.foodlocationInfoData) {
        this.locationOptions.push({ label: item.address_section_1 + item.address_section_2, value: item.id })
      }
    if (this.categoryList.length) {
      this.item.category_id = this.categoryList[0].id;
      this.openedAccordion = this.categoryList[0].id;
      this.activeCategory = this.categoryList[0].id;
      this.initSelectedItems();
      this.initCategoryOptions();
    }
  }

  public initaAvailableOptions(): void {
    this.availabilityInfo = new AvailabilityInfo();
    this.availabilityInfo.availableHours = [];
    this.availabilityInfo.availableHours = [
        { id: null, day: 'Monday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00' }] },
        { id: null, day: 'Tuesday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00' }] },
        { id: null, day: 'Wednesday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00' }] },
        { id: null, day: 'Thursday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00' }] },
        { id: null, day: 'Friday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00' }] },
        { id: null, day: 'Saturday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00' }] },
        { id: null, day: 'Sunday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00' }] }
    ];
  }
  
  public pushTimings(index: number): void {
      this.availabilityInfo.availableHours[index].timings.push({ id: null, start_time_hour: '01', start_time_minute: '00', end_time_hour: '01', end_time_minute: '00' });
  }

  public spliceTimings(parentIndex: number, childIndex: number): void {
      this.availabilityInfo.availableHours[parentIndex].timings.splice(childIndex, 1);
  }

  public setItemOptionsDefaultValues(): void {
    this.itemOptionsType = [];
    this.itemOptionsType.push(new ItemOptionsType());
    this.itemOptionsType[0].options.push(new ItemOption());
    this.itemOptionsType[0].options.push(new ItemOption());
    // this.itemOptionsType[0].options.push(new ItemOption());
    this.activeOptions = 0;
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
      this.categoryOptions.push({
        label: this.categoryList[i].name,
        value: this.categoryList[i].id
      });
    }
  }

  public onCategoryViewDisplayClick(categoryViewDisplay: number) {
    this.service.settings.category_view_display = categoryViewDisplay;
  }

  public onUpdateSettingsClick(): void {
    this.service
      .saveSettings(this.service.settings, this.service.tabID)
      .subscribe(res => {
        if (res.success) {
          this.pageService.showSuccess(res.message);
        } else {
          this.pageService.showError(res.message);
        }
      });
  }

  public onAccordionArrowClick(categoryID: number): void {
    this.openedAccordion =
      categoryID !== this.openedAccordion ? categoryID : undefined;
  }

  public onCategoryDivClick(categoryID: number): void {
    this.activeCategory = categoryID;
  }

  public onOptionsDivClick(index: number): void {
    this.activeOptions = index;
  }

  private sortCategoriesAndItems(bag: string) {
    let data: { categoryIDs?: number[]; itemIDs?: number[][] };
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
    this.service.sortMenu(data).subscribe(res => {
      if (res.success) {
        this.pageService.showSuccess(res.message);
      } else {
        this.pageService.showError(res.message);
      }
    });
  }
  
  // private sortOptions(bag: string) {console.log(bag);
  //   let data: { optionTypeIDs?: number[]; optionIDs?: number[][] };
  //   if (bag === this.ITEM_OPTIONS_BAG) {
  //     data = { optionTypeIDs: [] };
  //     for (let i in this.itemOptionsType) {
  //       data.optionTypeIDs.push(this.itemOptionsType[i].id);
  //     }
  //   } else {
  //     data = { optionIDs: [] };
  //     for (let i in this.itemOptions) {
  //       let optionIDs: number[] = [];
  //       for (let j in this.itemOptions[i]) {
  //         optionIDs.push(this.itemOptions[i][j].id);
  //       }
  //       data.optionIDs.push(optionIDs);
  //     }
  //   }
  //   this.service.sortOptions(data).subscribe(res => {
  //     if (res.success) {
  //       this.pageService.showSuccess(res.message);
  //     } else {
  //       this.pageService.showError(res.message);
  //     }
  //   });
  // }

  public onCategoryStatusToggle(category: FoodOrderingMenuCategory): void {
    let statusCopy: number = category.status;
    category.status =
      category.status === this.CATEGORY_STATUS.ENABLED
        ? this.CATEGORY_STATUS.DISABLED
        : this.CATEGORY_STATUS.ENABLED;
    // PageService.showLoader();
    // this.service.saveInventoryCategory(category).subscribe(res => {
    //     PageService.hideLoader();
    //     if (res.success) {
    //         this.pageService.showSuccess(res.message);
    //     } else {
    //         this.pageService.showError(res.message);
    //         category.status = statusCopy;
    //     }
    // });
  }

  // public onItemStatusToggle(item: FoodOrderingMenuItem): void {
  //     let statusCopy: number = item.status;
  //     item.status = item.status === this.ITEM_STATUS.ENABLED ? this.ITEM_STATUS.DISABLED : this.ITEM_STATUS.ENABLED;
  //     PageService.showLoader();
  //     this.service.saveInventoryItem(item).subscribe(res => {
  //         PageService.hideLoader();
  //         if (res.success) {
  //             this.pageService.showSuccess(res.message);
  //         } else {
  //             this.pageService.showError(res.message);
  //             item.status = statusCopy;
  //         }
  //     });
  // }

  public onOptionsTypeCheck(): void {
    setTimeout(() => {
      this.zone.run(() => {
        this.itemOptionsCheckAllToggle = this.pageService.updateCheckAllToggle(
          this.selectedOptionsType,
          this.itemOptionsType
        );
      });
    });
  }

  public onCategoryCheck(categoryID: number): void {
    setTimeout(() => {
      this.zone.run(() => {
        this.selectedItems[categoryID] = this.pageService.toggleAllCheckboxes(
          this.selectedCategories[categoryID],
          this.itemList[categoryID]
        );
        this.handleDeleteButton();
      });
    });
  }

  public onItemCheck(categoryID: number): void {
    setTimeout(() => {
      this.zone.run(() => {
        if (
          !this.pageService.updateCheckAllToggle(
            this.selectedItems[categoryID],
            this.itemList[categoryID]
          )
        ) {
          this.selectedCategories[categoryID] = false;
        }
        this.handleDeleteButton();
      });
    });
  }

  private handleDeleteButton(): void {
    if (
      this.selectedCategories.length &&
      this.selectedCategories.indexOf(true) !== -1
    ) {
      this.enableDeleteButton = true;
      return;
    }
    for (let i in this.selectedItems) {
      if (
        this.selectedItems[i].length &&
        this.selectedItems[i].indexOf(true) !== -1
      ) {
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
    let categoryIDs: any[] = [],
      itemIDs: any[] = [];
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
    this.service.deleteMenu(categoryIDs, itemIDs).subscribe(res => {
      PageService.hideLoader();
      if (res.success) {
        this.selectedCategories = [];
        this.initSelectedItems();
        this.enableDeleteButton = false;
        for (let i = 0; i < categoryIDs.length; i++) {
          this.dataService.getByID(
            this.categoryList,
            categoryIDs[i],
            (data, index) => {
              this.categoryList.splice(index, 1);
            }
          );
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
    this.categoryFormHeader = "  Category";
    this.category = new FoodOrderingMenuCategory();
    this.category.tab_id = this.service.tabID;
    this.showCategoryImageSelector = false;
    this.showCategoryFormDialog = true;
    this.pageService.onDialogOpen();
  }

  public onEditCategoryClick(category: FoodOrderingMenuCategory): void {
    this.categoryFormHeader = "Edit Category";
    this.category = Object.assign({}, category);
    this.showCategoryImageSelector = false;
    this.showCategoryFormDialog = true;
    this.pageService.onDialogOpen();
  }

  public onCategoryFormSubmit(): void {
    PageService.showLoader();
    this.service.saveMenuCategory(this.category).subscribe(res => {
      PageService.hideLoader();
      if (res.success) {
        this.showCategoryFormDialog = false;
        this.pageService.showSuccess(res.message);
        this.updateCategoryList(res.data.id);
        this.category = new FoodOrderingMenuCategory();
        this.category.tab_id = this.service.tabID;
      } else {
        this.pageService.showError(res.message);
      }
    });
  }

  private updateCategoryList(id: number): void {
    if (!this.category.id) {
      // New category created
      this.category.id = id;
      this.categoryList.push(Object.assign({}, this.category));
      this.initSelectedItems();
    } else {
      // Existing category updated
      this.dataService.getByID(this.categoryList, id, (data, index) => {
        this.categoryList[index] = Object.assign({}, this.category);
      });
    }
  }

  public onAddItemClick(): void {
    if (!this.categoryList.length) {
      this.pageService.showWarning(
        "No category is existing. Please create a category first and then try again."
      );
      this.onAddCategoryClick();
      return;
    }
    this.itemFormHeader = "Add Item";
    this.item = new FoodOrderingMenuItem();
    this.item.category_id = this.categoryList[0].id;
    this.initCategoryOptions();
    this.setItemOptionsDefaultValues();
    this.itemSizes = [];
    this.itemOptions = [];
    this.itemImages = [];
    this.itemOptionsType[0].options = [];
    this.availabilityInfo = new AvailabilityInfo();
    this.initaAvailableOptions();
    for (let i = 0; i < 5; i++) {
      this.itemSizes.push(new ItemSize());
      if (i < 2) {
        for (let j = 0; j < this.itemOptionsType.length; j++) {
          this.itemOptionsType[j].options.push(new ItemOption());
          this.itemOptionsType[j].optionTypeRequired.push({
            label: i + 1,
            value: i + 1
          });
        }
      }
      this.itemImages.push(new ItemImage());
    }
    this.itemOptionsType[0].title = 'Options';
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
    this.service.getCategoryItem(itemID).subscribe(res => {
      PageService.hideLoader();
      if (res.success) {
        this.itemFormHeader = "Edit Item";
        this.item = res.data.item;
        this.editItemCategoryBackup = this.item.category_id;
        this.initCategoryOptions();
        this.setItemOptionsDefaultValues();
        this.availabilityInfo = new AvailabilityInfo();
        this.initaAvailableOptions();
        this.itemSizes = [];
        this.itemOptions = [];
        this.itemImages = [];
        let dataExist;
        if(res.data.availabilityInfo != '') {
          this.availabilityInfo = new AvailabilityInfo();
          this.availabilityInfo = res.data.availabilityInfo;
          if(res.data.availabilityInfo.availableHours == '') {
            this.availabilityInfo.availableHours = [];
            this.availabilityInfo.availableHours = [
                { id: null, day: 'Monday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00' }] },
                { id: null, day: 'Tuesday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00' }] },
                { id: null, day: 'Wednesday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00' }] },
                { id: null, day: 'Thursday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00' }] },
                { id: null, day: 'Friday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00' }] },
                { id: null, day: 'Saturday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00' }] },
                { id: null, day: 'Sunday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00' }] }
            ];
          }
        }
        if(res.data.options != '') {
          dataExist = 0;
          this.itemOptionsType = res.data.options;
          for(let k=0;k<this.itemOptionsType.length;k++) {
            this.itemOptionsType[k].optionTypeRequired = [];
            if(this.itemOptionsType[k].options.length == 0) {
              for (let j = 0; j < 2; j++) {
                this.itemOptionsType[0].options.push(new ItemOption());
                this.itemOptionsType[0].optionTypeRequired.push({
                  label: 0 + 1,
                  value: 0 + 1
                });
              }
            } else {
              for (let i = 0;i < this.itemOptionsType[k].options.length;i++) {
                this.itemOptionsType[k].optionTypeRequired.push({
                  label: i + 1,
                  value: i + 1
                });
              }
            }
          }
        } else {
          dataExist = 1;
        }
        for (let i = 0; i < 5; i++) {
          if(dataExist == 1) {
            if (i < 2) {
              for (let j = 0; j < this.itemOptionsType.length; j++) {
                this.itemOptionsType[j].optionTypeRequired.push({
                  label: i + 1,
                  value: i + 1
                });
              }
            }
          }
          this.itemImages.push(new ItemImage());
          this.itemSizes.push(
            res.data.sizes[i] ? res.data.sizes[i] : new ItemSize()
          );
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
    let sizes: ItemSize[] = [];
    for (let i = 0; i < this.itemSizes.length; i++) {
      if (
        (this.itemSizes[i].price == undefined ||
          this.itemSizes[i].price.toString() === "") &&
        (this.itemSizes[i].title == undefined || this.itemSizes[i].title === "")
      ) {
        if (this.itemSizes[i].id) {
          this.sizesToDelete.push(this.itemSizes[i].id);
        }
      } else {
        sizes.push(this.itemSizes[i]);
      }
    }
    
    this.service
      .saveMenuItem(
        this.item,
        sizes,
        this.itemOptionsType,
        this.availabilityInfo,
        this.sizesToDelete,
        this.optionsToDelete,
        this.itemsOptionsToDelete
        // this.imagesToDelete
      )
      .subscribe(res => {
        PageService.hideLoader();
        if (res.success) {
          this.showItemFormDialog = false;
          this.pageService.showSuccess(res.message);
          this.updateItemList(res.data.id);
          this.item = new FoodOrderingMenuItem();
          this.item.category_id = this.categoryList[0].id;
          this.sizesToDelete = [];
          this.optionsToDelete = [];
          this.itemsOptionsToDelete = [];
        } else {
          this.pageService.showError(res.message);
        }
      });
  }

  public setQuantity(child: number): void {
    if(this.itemOptionsType[this.activeOptions].options[child].max_qty == '0') {
      this.itemOptionsType[this.activeOptions].options[child].max_qty = 'Unlimited';
    }
  }

  private updateItemList(id: number): void {
    if (!this.itemList[this.item.category_id]) {
      this.itemList[this.item.category_id] = [];
    }
    if (!this.item.id) {
      // New item created
      let newItem: FoodOrderingMenuItem = new FoodOrderingMenuItem();
      newItem.id = id;
      newItem.category_id = this.item.category_id;
      newItem.name = this.item.name;
      this.itemList[this.item.category_id].push(newItem);
    } else {
      // Existing item updated
      this.dataService.getByID(
        this.itemList[this.item.category_id],
        id,
        (data, index) => {
          this.itemList[this.item.category_id][index].name = this.item.name;
        },
        () => {
          this.dataService.getByID(
            this.itemList[this.editItemCategoryBackup],
            id,
            (data, index) => {
              // Item was not found in its category, which means item's category was changed.
              let newItem: FoodOrderingMenuItem = Object.assign(
                {},
                this.itemList[this.editItemCategoryBackup][index]
              );
              newItem.name = this.item.name;
              this.itemList[this.item.category_id].push(newItem);
              this.itemList[this.editItemCategoryBackup].splice(index, 1);

              // Delete item from selected list if it is selected.
              if (
                this.selectedItems[this.editItemCategoryBackup] &&
                this.selectedItems[this.editItemCategoryBackup][id]
              ) {
                this.selectedItems[this.editItemCategoryBackup][id] = false;
                this.handleDeleteButton();
              }
            }
          );
        }
      );
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
        this.selectedItemSizes = this.pageService.toggleAllCheckboxes(
          this.itemSizesCheckAllToggle,
          this.itemSizes,
          true
        );
      });
    });
  }

  public onItemSizeCheck(): void {
    setTimeout(() => {
      this.zone.run(() => {
        this.itemSizesCheckAllToggle = this.pageService.updateCheckAllToggle(
          this.selectedItemSizes,
          this.itemSizes
        );
      });
    });
  }

  public onDeleteItemSizesClick(): void {
    if (
      this.selectedItemSizes.length > 0 &&
      this.selectedItemSizes.indexOf(true) !== -1 &&
      confirm("Are you sure you want to delete the selected items?")
    ) {
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
  
  private onItemOptionDrop(): void {
    if (!this.selectedOptionsTypeReferences.length) {
        return;
    }
    this.selectedOptionsType = [];
    for (let i = 0; i < this.selectedOptionsTypeReferences.length; i++) {
        this.selectedOptionsType[this.itemOptionsType.indexOf(this.selectedOptionsTypeReferences[i])] = true;
    }
  }
  
  private onItemOptionDrag(): void {
    if (!this.selectedOptionsType.length) {
        return;
    }
    this.selectedOptionsTypeReferences = [];
    for (let i in this.selectedOptionsType) {
        if (this.selectedOptionsType[i]) {
            this.selectedOptionsTypeReferences.push(this.itemOptionsType[i]);
        }
    }
  }
    
    private onItemMenuDrag(): void {
      if (!this.selectedMenuItemOptions.length) {
        return;
      }
      this.selectedItemMenuReferences = [];
      for (let i in this.selectedMenuItemOptions) {
        if (this.selectedMenuItemOptions[i]) {
          this.selectedItemMenuReferences.push(this.itemOptions[i]);
        }
      }
    }
    
    private onItemMenuDrop(): void {
      if (!this.selectedItemMenuReferences.length) {
        return;
      }
      this.selectedMenuItemOptions = [];
      for (let i = 0; i < this.selectedItemMenuReferences.length; i++) {
        this.selectedMenuItemOptions[
          this.itemOptions.indexOf(this.selectedItemMenuReferences[i])
        ] = true;
      }
    }

  public onAddNewOptionClick(type: ItemOptionsType): void {
    this.itemOptions = [];
    this.itemOptions = type.options;
    this.onShowMenuItemClick();
  }
  
  public onShowMenuItemClick(): void {
    this.menuItemHeader = " Option Items";
    this.showMenuItemDialog = true;
    this.pageService.onDialogOpen();
  }
  
  public onCloseMenuItemClick(): void {
    this.showMenuItemDialog = false;
  }
  
  public onAddNewItemOptionClick(): void {
    if (this.itemOptionsType.length) {
      this.itemOptionsType[this.activeOptions].options.push(new ItemOption());
      this.itemOptionsType[this.activeOptions].optionTypeRequired = [];
      for (let i = 0;i < this.itemOptionsType[this.activeOptions].options.length;i++) {
        this.itemOptionsType[this.activeOptions].optionTypeRequired.push({
          label: i + 1,
          value: i + 1
        });
      }
    }
  }

  public onAddNewOptionTypeClick(): void {
    this.itemOptionsType.push(new ItemOptionsType());
    this.itemOptionsType[this.itemOptionsType.length - 1].options.push(
      new ItemOption()
    );
    this.itemOptionsType[
      this.itemOptionsType.length - 1
    ].optionTypeRequired.push({ label: 1, value: 1 });
  }

  public onItemOptionSelectAllCheck(): void {
    setTimeout(() => {
      this.zone.run(() => {
        this.selectedOptionsType = this.pageService.toggleAllCheckboxes(
          this.itemOptionsCheckAllToggle,
          this.itemOptionsType,
          true
        );
      });
    });console.log(this.selectedOptionsType)
  }
  
  public onMenuItemOptionSelectAllCheck(): void {
    setTimeout(() => {
      this.zone.run(() => {
        this.selectedMenuItemOptions = this.pageService.toggleAllCheckboxes(
          this.menuItemOptionsCheckAllToggle,
          this.itemOptions,
          true
        );
      });
    });
  }
  
  public onDeleteMenuItemOptionsClick(): void {
    this.optionsToDelete = [];
    if (
      this.selectedMenuItemOptions.length > 0 &&
      this.selectedMenuItemOptions.indexOf(true) !== -1 &&
      confirm("Do you really want to delete the selected options? ")
    ) {
      for (let i = this.selectedMenuItemOptions.length - 1; i >= 0; i--) {
        if (this.selectedMenuItemOptions[i]) {
          if (this.itemOptions[i].id) {
            this.optionsToDelete.push(this.itemOptions[i].id);
          }
          this.itemOptions.splice(i, 1);
        }
      }
      this.selectedMenuItemOptions = [];
    }
  }

  public onItemOptionCheck(): void {
    setTimeout(() => {
      this.zone.run(() => {
        this.itemOptionsCheckAllToggle = this.pageService.updateCheckAllToggle(
          this.selectedItemOptions,
          this.itemOptions
        );
      });
    });
  }

  public onDeleteItemOptionsClick(): void {
    if (
      this.selectedOptionsType.length > 0 &&
      this.selectedOptionsType.indexOf(true) !== -1 &&
      confirm("Do you really want to delete the selected items? ")
    ) {
      for (let i = this.selectedOptionsType.length - 1; i >= 0; i--) {
        if (this.selectedOptionsType[i]) {
          if (this.itemOptionsType[i].id) {
            this.itemsOptionsToDelete.push(this.itemOptionsType[i].id);
          }
          this.itemOptionsType.splice(i, 1);
        }
      }
      this.selectedOptionsType = [];
    }
  }

  public toggleCategoryImageSelector(): void {
    this.showCategoryImageSelector = !this.showCategoryImageSelector;
    if (!this.categoryImagesRetrieved) {
      this.getCategoryImagesList();
    }
  }

  private getCategoryImagesList(newImagesAdded?: boolean): void {
    this.service.getMenuCategoryImagesList(this.appID).subscribe(res => {
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
    this.service
      .addMenuCategoryImages(event.target.files, this.appID)
      .subscribe(res => {
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

  public onCategoryImageDeleteClick(
    imageName: string,
    index: number,
    event: Event
  ): void {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this image?")) {
      PageService.showLoader();
      this.service.deleteMenuCategoryImage(imageName).subscribe(res => {
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

  public toggleItemImageSelector(): void {
    this.showItemImageSelector = !this.showItemImageSelector;
    if (!this.itemImagesRetrieved) {
      this.getItemImagesList();
    }
    // this.showItemImageSelector = !this.showItemImageSelector;
    // if (this.showItemImageSelector) {
    //   this.itemImageOnEdit = itemImage;
    //   if (!this.itemImagesRetrieved) {
    //     this.getItemImagesList();
    //   }
    // }
  }

  public getItemImagesList(newImagesAdded?: boolean): void {
    this.service.getMenuItemImagesList(this.appID).subscribe(res => {
      if (res.success) {
        this.itemImagesRetrieved = true;
        this.itemImagesList = res.data.app;
        if (newImagesAdded) {
          this.item.image = this.itemImagesList[0].name;
        }
      } else {
        console.warn(res.message);
      }
    });

    // this.service.getMenuItemImagesList(this.appID).subscribe(res => {
    //   if (res.success) {
    //     this.itemImagesRetrieved = true;
    //     this.itemImagesList = res.data.app;
    //     if (newImagesAdded) {
    //       this.itemImageOnEdit.image = this.itemImagesList[0].name;
    //       this.itemImageOnEdit.image_url = this.itemImagesList[0].url;
    //     }
    //   } else {
    //     console.warn(res.message);
    //   }
    // });
  }

  public onItemImageChange(event): void {
    PageService.showLoader();
    this.service
      .addMenuItemImages(event.target.files, this.appID)
      .subscribe(res => {
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

  public onItemImageClick(imageName: string): void {
    this.item.image = this.item.image === imageName ? null : imageName;
    this.item.image_url = null;
  }

  public onItemImageSelectAllCheck(): void {
    setTimeout(() => {
      this.zone.run(() => {
        this.selectedItemImages = this.pageService.toggleAllCheckboxes(
          this.itemImagesCheckAllToggle,
          this.itemImages,
          true
        );
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
        this.itemImagesCheckAllToggle = this.pageService.updateCheckAllToggle(
          this.selectedItemImages,
          this.itemImages
        );
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

  public onItemImageDeleteClick(
    imageName: string,
    index: number,
    event: Event
  ): void {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this image?")) {
      PageService.showLoader();
      this.service.deleteMenuItemImage(imageName).subscribe(res => {
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
