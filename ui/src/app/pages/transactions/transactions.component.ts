import { Component, ViewEncapsulation, HostListener, ChangeDetectorRef, ViewChild, NgZone } from '@angular/core';
import { PageService, GridDataService } from '../../theme/services';
import { AppState } from '../../app.state';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TabsetComponent, TOOLTIP_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, RadioButton, SelectItem, Calendar } from 'primeng/primeng';
import { TransactionsService } from './transactions.service';
import { Array, setTimeout, Number } from 'core-js/library/web/timers';
import { FoodOrdersSearch, Address, FoodOrder, FoodOrderingItemOption, CartItem } from '../../theme/interfaces/index';
import { ClickOutsides } from '../../theme/directives';
var moment = require('moment/moment');
declare var unescape;
declare var jQuery;
const BY_RATE: number = 1;
const BY_FLAT: number = 2;
declare var window;


@Component({
    selector: 'app-transaction',
    directives: [DROPDOWN_DIRECTIVES, ClickOutsides, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, Calendar, Dropdown, RadioButton, Dialog, PAGINATION_DIRECTIVES],
    encapsulation: ViewEncapsulation.None,
    styles: [require('../settings/settings.scss'), require('./transactions.scss')],
    template: require('./transactions.component.html'),
    providers: [GridDataService, PageService, TransactionsService]
})

export class Transactions {
    @ViewChild("foodOrdersTabset") foodOrdersTabset: TabsetComponent;
    public appId: number = null;
    public appCode: string = null;
    public ready: boolean = false;
    public currentDate: Date = new Date();
    public selectedFoodCategory: any;
    public foodCategory: Array<any> = [];
    public foodMenuItemsList: Array<any> = [];
    public selectedFoodItems: any;
    public foodItems: Array<any> = [];
    public selectedItemSize: any = null;
    public itemSizes: Array<any> = [
    ];
    public options: Array<any> = [];
    public showEditOrderDialog: boolean = false;
    /**************************  */
    public ordersList: Array<any> = [];
    public selectedOrder: number = null;
    public showOrderDetail: Array<boolean> = [];
    public currencySymbol: string = null;
    public foodOrderingTabIds: Array<any> = [];

    //-------------- PAGINATION  START--------------------------
    public queryString: string = "";
    public totalItems: number = 0;
    public currentPage: number = 1;
    public itemsPerPage: number = 10;
    public maxSize: number = 4;
    public count: SelectItem[] = [
        { label: '10', value: 10 },
        { label: '20', value: 20 },
        { label: '30', value: 30 },
        { label: '40', value: 40 },
    ];
    public selectedCount: number = 10;
    public foodOrdersSearch: FoodOrdersSearch = new FoodOrdersSearch();
    public orderData: FoodOrder = new FoodOrder();

    //-------------- PAGINATION  END--------------------------

    public paidStatus: Array<any> = [
        { label: 'Paid Status', value: 3 },
        { label: 'Unpaid', value: 1 },
        { label: 'Paid', value: 2 }
    ];
    public orderStates: Array<any> = [
        { label: 'All Orders States', value: 4 },
        { label: 'Canceled', value: 1 },
        { label: 'Served', value: 3 },
        { label: 'Unserved', value: 2 }
    ];
    public orderTypes: Array<any> = [
        { label: 'All Order Types', value: 4 },
        { label: 'Delivery', value: 3 },
        { label: 'Takeout', value: 2 },
        { label: 'Dine In', value: 1 }
    ];
    public locationList: Array<any> = [
        { label: 'All Locations', value: -1 }
    ];
    public editOrderTypes: Array<any> = [
        { label: 'Delivery', value: 3 },
        { label: 'Takeout', value: 2 },
        { label: 'Dine In', value: 1 }
    ];

    public editlocationList: Array<any> = [];
    public editorderStatus: Array<any> = [
        { label: 'Canceled', value: 1 },
        { label: 'Unserved', value: 2 },
        { label: 'Served', value: 3 }
    ];
    public editpaidStatus: Array<any> = [
        { label: 'Unpaid', value: 1 },
        { label: 'Paid', value: 2 }
    ];
    public isAddItem: boolean = false;
    public isEditItem: boolean = false;
    public isConfirmChange: boolean = false;
    public checkAll: boolean = false;
    public checkedOrder: boolean[] = [];
    public checkAllOption: boolean = false;
    public checkedOptions: boolean[] = [];
    public chooseQuantity: number = 1;
    public newItem: CartItem = new CartItem();
    public foodItemSizes: Array<any> = [];
    public additionalNote: string = null;
    public foodOrderCount: any;
    public selectedTabId: number = null;
    public editItemIndex: number = null;
    public editItemData: any = null;
    public checkAllItems: boolean = false;
    public checkedItems: Array<boolean> = [];
    public selectedItemOptions: boolean[][] = [];
    public isAnyOptionSelected: boolean = false;

    constructor(
        protected appState: AppState,
        private service: TransactionsService,
        public pageService: PageService,
        private _changeDetectionRef: ChangeDetectorRef,
        private zone: NgZone
    ) {
        this.appId = parseInt(sessionStorage.getItem('appId'));
        this.appCode = sessionStorage.getItem('appCode');
        this.getInitData();
    }


    public getInitData() {
        this.service.getInitData(this.appId, this.currentPage, this.itemsPerPage, this.queryString).subscribe((res) => {
            if (res.data.success) {
                this.ordersList = this.getOrdersOnBasisOfDate(res['data']['tabData']['data']);
                this.totalItems = res.data.tabData.total;
                this.foodOrderCount = res.data.orderCount;
                console.log("this.ordersList", this.foodOrderCount);
                this.currencySymbol = res.data.currencySymbol;
                this.foodOrderingTabIds = res.data['foodOrderingTabIds'];
                if (this.foodOrderingTabIds.length) {
                    this.selectedTabId = this.foodOrderingTabIds[0].id;
                }
                this.setLocationList(res.data['foodOrderingLocation'])
            }
            this.ready = true;
        });
    }

    public setLocationList(locationList: any) {
        this.locationList = [{ label: 'All Locations', value: -1 }];
        this.editlocationList = [];
        for (let i = 0; i < locationList.length; i++) {
            this.locationList.push({ label: locationList[i].address_section_1 + " " + locationList[i].address_section_2, value: locationList[i].id });
            this.editlocationList.push({ label: locationList[i].address_section_1 + " " + locationList[i].address_section_2, value: locationList[i].id });
        }
    }

    public pageChanged(event: any): void {
        this.currentPage = event.page;
        this.getFoodOrderByTabIds(this.selectedTabId);
    }

    public setItemsPerPage(perPage: number): void {
        this.itemsPerPage = perPage;
    }
    public onOpenEditOrderDialog(order: any): void {
        this.orderData = JSON.parse(JSON.stringify(order));
        for (let i = 0; i < this.orderData.items.length; i++) {
            this.selectedItemOptions[i] = [];
        }
        console.log("this.orderData", this.orderData);
        this.showEditOrderDialog = true;
        this.pageService.onDialogOpen();
        this.menuCategories(this.orderData.tab_id);
        this.menuItems(this.orderData.tab_id);
    }

    public onClickAddItem() {
        this.isAddItem = true;
    }
    public onClickCancel() {
        this.isAddItem = false;
        this.selectedFoodCategory = null;
        this.selectedFoodItems = null;
        this.selectedItemSize = null;
        this.options = [];
        this.itemSizes = [];
    }

    public getOrdersOnBasisOfDate(orders: Array<any>) {
        let sortedOrders = [];
        for (let i in orders) {
            let date = moment(orders[i].datetime).format('DD-MM-YYYY');
            if (!sortedOrders[date])
                sortedOrders[date] = [];
            if (orders[i].tip) {
                orders[i].tip = JSON.parse(orders[i].tip);
            }
            if (orders[i].tax_list) {
                orders[i].tax_list = JSON.parse(orders[i].tax_list);
            }
            if (orders[i].contact) {
                orders[i].contact = JSON.parse(orders[i].contact);
            }
            if (orders[i].items) {
                orders[i].items = JSON.parse(orders[i].items);
            }
            sortedOrders[date].push(orders[i]);
        }
        return this.sortOrders(sortedOrders);
    }

    public sortOrders(orders: Array<any>) {
        let newOrders = [];
        for (let order in orders) {
            newOrders.push(orders[order]);
        }
        for (let i in newOrders) {
            newOrders[i].sort((a, b) => {
                let textA = new Date(a.datetime).getTime();
                let textB = new Date(b.datetime).getTime();
                return textB - textA;
            });
        }
        return newOrders;
    }

    public selecteOrder(id: number): void {
        this.selectedOrder = id;
    }

    public showOrderDetails(id: number): void {
        if (typeof this.showOrderDetail[id] == 'undefined') {
            this.showOrderDetail[id] = true;
        } else {
            this.showOrderDetail[id] = !this.showOrderDetail[id];
        }
    }

    public getFoodOrderByTabIds(tabId: number) {
        // this.ready = false;
        this.service.getFoodOrdersByTabId(tabId, this.currentPage, this.itemsPerPage, this.queryString).subscribe((res) => {
            if (res.data.success) {
                this.ordersList = this.getOrdersOnBasisOfDate(res['data']['tabData']['data']);
                this.totalItems = res.data.tabData.total;
                this.foodOrderCount = res.data.orderCount;
                console.log("this.ordersList", this.ordersList);
                this.currencySymbol = res.data.currencySymbol;
            }
            // this.ready = true;
        });
    }

    public searchInFoodOrders() {
        console.log(this.foodOrdersSearch);
        let queryString = '?';
        for (let i in this.foodOrdersSearch) {
            if (this.foodOrdersSearch.hasOwnProperty(i) && this.foodOrdersSearch[i] != '') {
                queryString += encodeURIComponent("search[" + i + "]") + "=" + encodeURIComponent(this.foodOrdersSearch[i]) + "&";
            }
        }
        this.currentPage = 1;
        this.queryString = queryString;
        this.getFoodOrderByTabIds(this.selectedTabId);
    }

    public resetSearch() {
        this.foodOrdersSearch = new FoodOrdersSearch();
        this.searchInFoodOrders();
    }
    public menuCategories(tabId: number) {
        this.foodCategory = [];
        this.service.getFoodMenuCategory(tabId).subscribe((res) => {
            if (res.success) {
                for (let i = 0; i < res.data.menuCategory.length; i++) {
                    this.foodCategory.push({ label: res.data.menuCategory[i].name + '(' + res.data.menuCategory[i].no_of_items + ')', value: res.data.menuCategory[i].id });
                }
            }
        });
    }

    public menuItems(tabId: number) {
        this.service.getFoodMenuItems(tabId).subscribe((res) => {
            if (res.success) {
                this.foodMenuItemsList = res.data.menuItems;
            }
        })
    }

    public changeFoodCategory(cat: any) {
        this.selectedFoodCategory = cat;
        this.foodItems = [];
        for (let i = 0; i < this.foodMenuItemsList[cat.value].length; i++) {
            this.foodItems.push({ 'label': this.foodMenuItemsList[cat.value][i].name + '(' + this.decodeCurrency(this.currencySymbol) + this.foodMenuItemsList[cat.value][i].price + ')', 'value': this.foodMenuItemsList[cat.value][i].id });
        }
    }

    public changeFoodItem(item: any) {
        this.selectedFoodItems = item;
        this.itemSizes = [];
        this.options = [];
        this.service.getItemDetails(item.value).subscribe((res) => {
            console.log("res", res);
            if (res.success) {
                for (let option in res.data.options) {
                    this.options.push(res.data.options[option]);
                }
                console.log("this.options", this.options);
                for (let j = 0; j < res.data.sizes.length; j++) {
                    this.itemSizes.push({ 'label': res.data.sizes[j].title + ' (' + this.decodeCurrency(this.currencySymbol) + res.data.sizes[j].price + ')', value: res.data.sizes[j].id });
                }
                if (this.itemSizes.length) {
                    this.foodItemSizes = res.data.sizes;
                    this.selectedItemSize = this.itemSizes[0];
                } else {
                    this.selectedItemSize = null;
                    this.foodItemSizes = [];
                }
            }
            this.showOptionDropDown();
        });
    }

    public decodeCurrency(str) {
        return str.replace(/&#(\d+);/g, (match, dec) => {
            return String.fromCharCode(dec);
        });
    }

    public changeItemSize(size: any) {
        console.log("size", size);
        this.selectedItemSize = size;
    }
    public showOptionDropDown() {
        jQuery("#order-option").click((e) => {
            e.stopPropagation();
            jQuery("#order-menu-list").toggle();
        });
    }

    public onClickOutside(event: any) {
        jQuery("#order-menu-list").hide();
    }

    public onCheckAllChange(): void {
        this.refreshSelectedOrders();
        if (!this.checkAll) {
            for (let arrayEntry of this.ordersList) {
                for (let i in arrayEntry) {
                    this.checkedOrder[arrayEntry[i].id] = true;
                }
            }
        }
        else {
            for (let arrayEntry of this.ordersList) {
                for (let i in arrayEntry) {
                    this.checkedOrder[arrayEntry[i].id] = false;
                }
            }
        }
    }

    public refreshSelectedOrders(): void {
        this.checkedOrder = [];
    }

    public onCheckChange(checkedTabValue, checkedTab): void {
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            for (let arrayEntry of this.ordersList) {
                arrayEntry.forEach((entry) => {
                    if (entry.id != checkedTab) {
                        if (flag) {
                            if (this.checkedOrder[entry.id]) {
                                flag = true;
                            } else {
                                flag = false;
                            }
                        }
                    }
                });
            }
        }
        this.checkAll = flag ? true : false;
    }
    public deleteOrders() {
        if (this.checkedOrder.length > 0 && this.checkedOrder.indexOf(true) !== -1) {
            var yes = window.confirm("Are you sure you want to delete the selected Item ? ");
            if (yes) {
                let ids: any[] = [];
                for (let i in this.checkedOrder) {
                    if (this.checkedOrder[i]) {
                        ids.push(i);
                    }
                }
                console.log("ids :", ids);
                this.service.deleteFoodOrders(ids).subscribe(
                    (res) => {
                        if (res.success) {
                            this.pageService.showSuccess("Orders deleted succesfully.");
                            this.currentPage = 1;
                            this.getFoodOrderByTabIds(this.selectedTabId);
                            this.checkedOrder = [];
                            this.checkAll = false;
                        }
                        console.log("response : ", res);
                    });
            }
        }
    }

    public onOptionCheck(checkedTabValue, checkedTab): void {
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            for (let arrayEntry of this.options) {
                arrayEntry.forEach((entry) => {
                    if (entry.id != checkedTab) {
                        //if flag set to false don't check further
                        if (flag) {
                            if (this.checkedOptions[entry.id]) {
                                flag = true;
                            } else {
                                flag = false;
                            }
                        }
                    }
                });
            }
        }
        this.checkAllOption = flag ? true : false;
    }

    public onCheckAllOptionChange() {
        this.refreshSelectedOptions();
        if (!this.checkAllOption) {
            for (let arrayEntry of this.options) {
                for (let i in arrayEntry) {
                    this.checkedOptions[arrayEntry[i].id] = true;
                }
            }
        }
        else {
            for (let arrayEntry of this.options) {
                for (let i in arrayEntry) {
                    this.checkedOptions[arrayEntry[i].id] = false;
                }
            }
        }
    }
    public refreshSelectedOptions(): void {
        this.checkedOptions = [];
    }

    public getSelectedOrderLength() {
        let count = [];
        for (let i in this.checkedOptions) {
            if (this.checkedOptions[i]) {
                count.push(i);
            }
        }
        return count.length;

    }

    public confirmChange(): void {
        /******************** Getting Item details */
        let optionIds = [];
        for (let i in this.checkedOptions) {
            if (this.checkedOptions[i]) {
                optionIds.push(+i);
            }
        }
        console.log(this.isAddItem, "this.isAddItem");
        console.log(this.isEditItem, "this.isEditItem");
        let selectedOptions = this.getOptions(optionIds);
        let sizes = this.getItemSize(this.selectedItemSize.value);
        if (this.isAddItem) {
            let item = this.getItem(this.selectedFoodItems.value);
            this.newItem.item_id = item.id;
            this.newItem.is_tax_exempted = item.is_tax_exempted;
            this.newItem.item_image = item.image;
            this.newItem.item_price = this.selectedItemSize ? parseFloat(sizes.price) : parseFloat(item.price);
            this.newItem.item_name = item.name;
            this.newItem.quantity = this.chooseQuantity;
            this.newItem.notes = this.additionalNote;
            this.newItem.size = sizes ? sizes : null;
            let itemPrice = this.newItem.item_price;
            if (selectedOptions.length) {
                this.newItem.options = [];
                for (let i in selectedOptions) {
                    let optionCharge = parseFloat(selectedOptions[i].charges);
                    itemPrice = itemPrice + optionCharge;
                    this.newItem.options.push({ "option": selectedOptions[i], "quantity": 1 });
                }
            }
            this.newItem.total_price = itemPrice;
            this.orderData.items.push(this.newItem);
            this.orderData.total_price = parseFloat("" + this.orderData.total_price);
            this.orderData.total_price = this.orderData.total_price + (this.newItem.total_price * this.newItem.quantity);
        }
        if (this.isEditItem) {
            console.log(" this.orderData", this.orderData);
            this.orderData.items[this.editItemIndex].size = sizes ? sizes : null;
            this.orderData.items[this.editItemIndex].item_price = this.selectedItemSize ? parseFloat(sizes.price) : parseFloat("" + this.orderData.items[this.editItemIndex].item_price);
            this.orderData.items[this.editItemIndex].quantity = this.chooseQuantity;
            this.orderData.items[this.editItemIndex].notes = this.additionalNote;
            let itemPrice = this.orderData.items[this.editItemIndex].item_price;
            if (selectedOptions.length) {
                this.orderData.items[this.editItemIndex].options = [];
                for (let i in selectedOptions) {
                    let quantity = this.getOptionQuantity(selectedOptions[i].id);
                    console.log("quantity", quantity);
                    let optionCharge = parseFloat(selectedOptions[i].charges) * (quantity ? parseFloat(quantity) : 1);
                    itemPrice = itemPrice + optionCharge;
                    this.orderData.items[this.editItemIndex].options.push({ "option": selectedOptions[i], "quantity": quantity ? parseFloat(quantity) : 1 });
                }
            }
            this.orderData.items[this.editItemIndex].total_price = itemPrice;
            this.orderData.total_price = 0;
            for (let i in this.orderData.items) {
                this.orderData.total_price = this.orderData.total_price + (parseFloat("" + this.orderData.items[i].total_price) * parseFloat("" + this.orderData.items[i].quantity));
            }
        }
        if (this.orderData.tip) {
            this.setTipValue();
        }
        this.updateTaxListAndTotalCharges();
        this.updateOrder();
    }

    public getOptionQuantity(id: number) {
        let quantity = null;
        console.log("id", id);
        console.log("this.editItemData.options", this.editItemData.options);
        for (let i in this.editItemData.options) {
            console.log("this.editItemData.options[i].option.id", this.editItemData.options[i].option.id);
            if (this.editItemData.options[i].option.id == id) {
                quantity = this.editItemData.options[i].quantity;
                break;
            }
        }
        return quantity;
    }

    public getOptions(ids: Array<number>) {
        let options = [];
        for (let arrayEntry of this.options) {
            for (let i in arrayEntry) {
                if (ids.indexOf(arrayEntry[i].id) != -1) {
                    options.push({
                        'id': arrayEntry[i].id,
                        'type_id': arrayEntry[i].type_id,
                        'title': arrayEntry[i].title,
                        'charges': arrayEntry[i].charges,
                        'is_allow_qty': arrayEntry[i].is_allow_qty,
                        'max_qty': arrayEntry[i].max_qty,
                    })
                }
            }
        }
        return options;
    }
    public getItem(id: number) {
        let item;
        for (let arrayEntry in this.foodMenuItemsList[this.selectedFoodCategory.value]) {
            console.log("arrayEntry", arrayEntry);
            if (this.foodMenuItemsList[this.selectedFoodCategory.value][arrayEntry].id == id) {
                item = this.foodMenuItemsList[this.selectedFoodCategory.value][arrayEntry];
                break;
            }
        }
        return item;
    }
    public getItemSize(id: number) {
        let size;
        for (let i in this.foodItemSizes) {
            if (this.foodItemSizes[i].id == id) {
                return size = {
                    'id': this.foodItemSizes[i].id,
                    'item_id': this.foodItemSizes[i].item_id,
                    'price': this.foodItemSizes[i].price,
                    'title': this.foodItemSizes[i].title,
                };
            }
        }
    }
    private updateTaxListAndTotalCharges(): void {
        if (this.orderData.items.length) {
            let tax_list = this.orderData.tax_list;
            this.orderData.tax_list = [];
            this.orderData.convenience_fee = this.orderData.convenience_fee ? parseFloat("" + this.orderData.convenience_fee) : 0;
            this.orderData.delivery_charges = this.orderData.delivery_charges ? parseFloat("" + this.orderData.delivery_charges) : 0;
            this.orderData.free_delivery_amount = this.orderData.delivery_charges ? parseFloat("" + this.orderData.free_delivery_amount) : 0;
            this.orderData.total_charges = this.orderData.total_price + this.orderData.convenience_fee;
            if (this.orderData.tip) {
                this.orderData.total_charges += this.orderData.tip.amount ? this.orderData.tip.amount : 0;
            }

            let isDeliveryFeeApplicable: boolean = false;
            if (this.orderData.type == 3 && this.orderData.total_price < this.orderData.free_delivery_amount) {
                this.orderData.total_charges += this.orderData.delivery_charges;
                isDeliveryFeeApplicable = true;
            }

            if (tax_list && !tax_list.length) {
                return;
            }
            let taxableTotalPrice: number = 0;
            for (let item of this.orderData.items) {
                if (!item.is_tax_exempted) {
                    taxableTotalPrice += parseFloat("" + item.total_price) * parseFloat("" + item.quantity);
                }
            }
            for (let tax of tax_list) {
                tax.tax.tax_value = parseFloat("" + tax.tax.tax_value);
                let amount: number;
                if (tax.tax.tax_method === BY_FLAT) {
                    amount = tax.tax.tax_value;
                } else {
                    amount = tax.tax.tax_value / 100 * taxableTotalPrice;
                    amount += this.orderData.convenience_fee_taxable ? tax.tax.tax_value / 100 * this.orderData.convenience_fee : 0;
                    if (isDeliveryFeeApplicable && this.orderData.delivery_price_fee_taxable) {
                        amount += tax.tax.tax_value / 100 * this.orderData.delivery_charges;
                    }
                }
                this.orderData.tax_list.push({
                    tax: tax.tax,
                    amount: amount
                });
                this.orderData.total_charges += amount;
            }
        } else {
            this.orderData.tax_list = [];
            this.orderData.convenience_fee = null;
            this.orderData.tip = null;
        }
    }
    public downloadCsv(type: number) {
        let params;
        let ids: any[] = [];
        let tabId = this.selectedTabId;
        if (type == 2) {
            if (this.checkedOrder.length > 0 && this.checkedOrder.indexOf(true) !== -1) {
                for (let i in this.checkedOrder) {
                    if (this.checkedOrder[i]) {
                        ids.push(i);
                    }
                }
            }
        }

        params = ids.toString();
        let url = window.location.origin + "/api/ws/function/food-orders/downloadCsv/" + tabId + "/" + type + "?ids=" + params;
        window.open(url, "_self");
    }
    public onClickBack(): void {
        this.selectedFoodCategory = null;
        this.selectedFoodItems = null;
        this.selectedItemSize = null;
        this.options = [];
        this.itemSizes = [];
        this.checkedOptions = [];
        this.chooseQuantity = 1;
        this.checkAllOption = false;
        if (this.isEditItem) {
            this.isEditItem = false;
            this.editItemIndex = null;
            this.editItemData = null;
        }
    }
    public onItemEdit(item: any, editItemIndex: number): void {
        console.log("item", item);
        console.log("editItemIndex", editItemIndex);
        this.editItemIndex = editItemIndex;
        this.editItemData = JSON.parse(JSON.stringify(item));
        this.isEditItem = true;
        this.itemSizes = [];
        this.options = [];
        this.chooseQuantity = item.quantity;
        this.service.getItemDetails(item.item_id).subscribe((res) => {
            console.log("res", res);
            if (res.success) {
                for (let option in res.data.options) {
                    this.options.push(res.data.options[option]);
                }
                console.log("this.options", this.options);
                for (let j = 0; j < res.data.sizes.length; j++) {
                    this.itemSizes.push({ 'label': res.data.sizes[j].title + ' (' + this.decodeCurrency(this.currencySymbol) + res.data.sizes[j].price + ')', value: res.data.sizes[j].id });
                    if (res.data.sizes[j].id == item.size.id)
                        this.selectedItemSize = { 'label': res.data.sizes[j].title + ' (' + this.decodeCurrency(this.currencySymbol) + res.data.sizes[j].price + ')', value: res.data.sizes[j].id };
                }
                if (this.itemSizes.length) {
                    this.foodItemSizes = res.data.sizes;
                } else {
                    this.selectedItemSize = null;
                    this.foodItemSizes = [];
                }
                for (let opt in item.options) {
                    this.checkedOptions[item.options[opt].option.id] = true;
                    this.onOptionCheck(true, item.options[opt].option.id);
                }
            }
            this.showOptionDropDown();
        });
    }

    public onClickSave(): void {
        let copyOrderData = JSON.parse(JSON.stringify(this.orderData));
        for (let item of copyOrderData.items) {
            let options = [];
            for (let opt of item.options) {
                if (opt.option.is_allow_qty) {
                    if (opt.option.max_qty) {
                        if (opt.quantity > 0 && opt.quantity <= opt.option.max_qty) {
                            options.push(opt);
                        } else if (opt.quantity > opt.option.max_qty) {
                            opt.quantity = opt.option.max_qty;
                            options.push(opt);
                        }
                    } else {
                        options.push(opt);
                    }
                } else {
                    if (opt.quantity > 0) {
                        opt.quantity = 1;
                        options.push(opt);
                    }
                }
            }
            item.options = options;
            item.item_price = parseFloat(item.item_price);
            let itemCharges = item.item_price;
            for (let i in options) {
                let optionCharge = parseFloat(options[i].option.charges) * (options[i].quantity);
                itemCharges = itemCharges + optionCharge;
            }
            item.total_price = itemCharges;
        }
        copyOrderData.total_price = 0;
        for (let item of copyOrderData.items) {
            copyOrderData.total_price = copyOrderData.total_price + (parseFloat(item.total_price) * parseFloat(item.quantity));
        }
        this.orderData = copyOrderData;
        if (this.orderData.tip) {
            this.setTipValue();
        }
        this.updateTaxListAndTotalCharges();
        this.updateOrder();
    }

    public onTabChange(event: any, id: number) {
        this.selectedTabId = id;
        this.currentPage = 1;
        this.getFoodOrderByTabIds(this.selectedTabId);

    }

    public onItemCheckAllChange(): void {
        this.refreshSelectedItems();
        if (!this.checkAllItems) {
            for (let i = 0; i < this.orderData.items.length; i++) {
                this.checkedItems[i] = true;
                for (let opt of this.orderData.items[i].options) {
                    this.selectedItemOptions[i][opt.option.id] = true;
                }
            }
            this.isAnyOptionSelected = true;
        }
        else {
            for (let i = 0; i < this.orderData.items.length; i++) {
                this.checkedItems[i] = false;
                for (let opt of this.orderData.items[i].options) {
                    this.selectedItemOptions[i][opt.option.id] = false;
                }
            }
            this.isAnyOptionSelected = false;
        }
        // this.onChangeItemsOptionCheck();
    }
    public refreshSelectedItems(): void {
        this.checkedItems = [];
    }

    public onCheckItemChange(checkedTabValue, checkedTab): void {
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
            for (let opt of this.orderData.items[checkedTab].options) {
                this.selectedItemOptions[checkedTab][opt.option.id] = false;
            }
        } else {
            for (let opt of this.orderData.items[checkedTab].options) {
                this.selectedItemOptions[checkedTab][opt.option.id] = true;
            }
            for (let i = 0; i < this.orderData.items.length; i++) {
                if (i != checkedTab) {
                    if (flag) {
                        if (this.checkedItems[i]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            }
        }
        this.onChangeItemsOptionCheck(checkedTab);
        this.checkAllItems = flag ? true : false;
    }

    public onChangeItemsOptionCheck(index: number) {
        setTimeout(() => {
            this.zone.run(() => {
                if (this.selectedItemOptions[index].length && this.selectedItemOptions[index].indexOf(false) !== -1) {
                    this.checkedItems[index] = false;
                    this.checkAllItems = false;
                }
                for (let i in this.selectedItemOptions) {
                    if (this.selectedItemOptions[i].length && this.selectedItemOptions[i].indexOf(true) !== -1) {
                        this.isAnyOptionSelected = true;
                        return;
                    }
                }

                this.isAnyOptionSelected = false;
            });
        })
    }

    public deleteItems(): void {
        let items = JSON.parse(JSON.stringify(this.orderData.items));
        let selectedItemIds = [];
        let selectedItemsOptionIds = [];
        let remainingItems = [];

        for (let i in this.checkedItems) {
            if (this.checkedItems[i]) {
                selectedItemIds.push(+i);
            }
        }
        for (let k in this.selectedItemOptions) {
            selectedItemsOptionIds[k] = [];
            for (let l in this.selectedItemOptions[k]) {
                if (this.selectedItemOptions[k][l]) {
                    selectedItemsOptionIds[k].push(+l);
                }
            }
        }
        for (let j = 0; j < items.length; j++) {
            if (selectedItemIds.indexOf(j) == -1) {
                let selectedOptions = [];
                for (let m = 0; m < items[j].options.length; m++) {
                    if (selectedItemsOptionIds[j].indexOf(items[j].options[m].option.id) == -1) {
                        selectedOptions.push(items[j].options[m]);
                    }
                }
                items[j].options = selectedOptions;
                let itemCharges = parseFloat(items[j].item_price);
                for (let n in items[j].options) {
                    let optionCharge = parseFloat(items[j].options[n].option.charges) * (items[j].options[n].quantity);
                    itemCharges = itemCharges + optionCharge;
                }
                items[j].total_price = itemCharges;
                remainingItems.push(items[j]);
            }
        }
        this.orderData.items = remainingItems;
        this.orderData.total_price = 0;
        for (let i in this.orderData.items) {
            this.orderData.total_price = this.orderData.total_price + (parseFloat("" + this.orderData.items[i].total_price) * parseFloat("" + this.orderData.items[i].quantity));
        }
        if (this.orderData.tip) {
            this.setTipValue();
        }
        this.updateTaxListAndTotalCharges();
        this.updateOrder();
    }

    public setTipValue(): void {
        if (this.orderData.tip.percent && this.orderData.tip.amount) {
            this.orderData.tip.percent = parseInt("" + this.orderData.tip.percent);
            this.orderData.tip.amount = this.orderData.tip.percent / 100 * this.orderData.total_price;
        }
    }

    public updateOrder() {
        PageService.showLoader();
        this.service.editOrder(this.orderData).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.showEditOrderDialog = false;
                PageService.hideLoader();
                this.getFoodOrderByTabIds(this.selectedTabId);
                this.clearAllVarables();
            }
        });
    }

    public clearAllVarables() {
        this.editItemIndex = null;
        this.editItemData = null;
        this.checkAllItems = false;
        this.checkedItems = [];
        this.orderData= new FoodOrder();
        this.selectedItemOptions = [];
        this.isAnyOptionSelected = false;
    }

    public closeModel() {
        this.showEditOrderDialog = false;
        this.clearAllVarables();
    }

}