import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse } from '../../../../../theme/interfaces';
import {
    ShoppingCartBlockedCountry,
    ShoppingCartDelivery, ShoppingCartInventoryCategory, ShoppingCartInventoryItem, ShoppingCartInventoryItemOption,
    ShoppingCartInventoryItemSize,
    ShoppingCartPayment,
    ShoppingCartPaymentTaxDetails, ShoppingCartShippingCharge

} from "../../../../../theme/interfaces/common-interfaces";
import { AsyncSubject } from 'rxjs';

@Injectable()
export class ShoppingCartService {

    private getInitDataURL: string = "../api/ws/function/shopping-cart/init";
    private saveSettingsURL: string = "../api/ws/function/shopping-cart/settings/save";

    // PAYMENT
    private savePaymentURL: string = "../api/ws/function/shopping-cart/payment/save";
    private saveTaxAmountURL: string = "../api/ws/function/shopping-cart/payment/tax/save";
    private deleteTaxAmountsURL: string = "../api/ws/function/shopping-cart/payment/tax/delete";

    // DELIVERY
    private saveDeliveryURL: string = "../api/ws/function/shopping-cart/delivery/save";
    private saveShippingChargeURL: string = "../api/ws/function/shopping-cart/delivery/shipping-charge/save";
    private saveBlockedCountryURL: string = "../api/ws/function/shopping-cart/delivery/blocked-country/save";
    private deleteShippingChargeURL: string = "../api/ws/function/shopping-cart/delivery/shipping-charge/delete";
    private deleteBlockedCountryURL: string = "../api/ws/function/shopping-cart/delivery/blocked-country/delete";

    // INVENTORY
    private saveInventorySettingsURL: string = "../api/ws/function/shopping-cart/inventory/settings/save";
    private sortInventoryURL: string = "../api/ws/function/shopping-cart/inventory/sort";
    private saveInventoryCategoryURL: string = "../api/ws/function/shopping-cart/inventory/category/save";
    private saveInventoryItemURL: string = "../api/ws/function/shopping-cart/inventory/item/save";
    private deleteInventoryURL: string = "../api/ws/function/shopping-cart/inventory/delete";
    private getInventoryItemURL: string = "../api/ws/function/shopping-cart/inventory/item/get";
    private getInventoryCategoryImagesListURL: string = "../api/ws/function/shopping-cart/inventory/category/images/list";
    private addInventoryCategoryImagesURL: string = "../api/ws/function/shopping-cart/inventory/category/images/add";
    private deleteInventoryCategoryImageURL: string = "../api/ws/function/shopping-cart/inventory/category/image/delete";
    private getInventoryItemImagesListURL: string = "../api/ws/function/shopping-cart/inventory/item/images/list";
    private addInventoryItemImagesURL: string = "../api/ws/function/shopping-cart/inventory/item/images/add";
    private deleteInventoryItemImageURL: string = "../api/ws/function/shopping-cart/inventory/item/image/delete";

    //EMAIL
    private saveEmailCartURL: string = "../api/ws/function/shopping-cart/email/item/save";

    public tabID: number;
    public currencySymbolList: any;

    public dataRetreived: AsyncSubject<boolean>;

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
        this.dataRetreived = new AsyncSubject<boolean>();
    }

    public getInitData(tabID: number): Observable<APIResponse> {
        return this.dataService.getData(this.getInitDataURL + "/" + tabID);
    }

    public saveSettings(settings: any, tabID: number): Observable<APIResponse> {
        return this.dataService.postData(this.saveSettingsURL + "/" + tabID, settings);
    }

    public savePayment(data: ShoppingCartPayment): Observable<APIResponse> {
        return this.dataService.postData(this.savePaymentURL, data);
    }

    public saveTaxAmount(taxAmount: ShoppingCartPaymentTaxDetails): Observable<APIResponse> {
        return this.dataService.postData(this.saveTaxAmountURL, taxAmount);
    }

    public deleteTaxAmounts(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this.deleteTaxAmountsURL, { ids: ids });
    }

    public saveDelivery(data: ShoppingCartDelivery): Observable<APIResponse> {
        return this.dataService.postData(this.saveDeliveryURL, data);
    }

    public saveShippingCharge(shippingCharge: ShoppingCartShippingCharge): Observable<APIResponse> {
        return this.dataService.postData(this.saveShippingChargeURL, shippingCharge);
    }

    public saveBlockedCountry(blockedCountry: ShoppingCartBlockedCountry): Observable<APIResponse> {
        return this.dataService.postData(this.saveBlockedCountryURL, blockedCountry);
    }

    public deleteShippingCharges(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this.deleteShippingChargeURL + "/" + this.tabID, { ids: ids });
    }

    public deleteBlockedCountries(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this.deleteBlockedCountryURL, { ids: ids });
    }

    public saveInventorySettings(settings: any): Observable<APIResponse> {
        return this.dataService.postData(this.saveInventorySettingsURL, settings);
    }

    public sortInventory(data: any): Observable<APIResponse> {
        return this.dataService.postData(this.sortInventoryURL, data);
    }

    public saveInventoryCategory(category: ShoppingCartInventoryCategory): Observable<APIResponse> {
        return this.dataService.postData(this.saveInventoryCategoryURL, category);
    }

    public saveInventoryItem(
        item: ShoppingCartInventoryItem,
        sizes?: ShoppingCartInventoryItemSize[],
        options?: ShoppingCartInventoryItemOption[],
        images?: any[],
        sizesToDelete?: number[],
        optionsToDelete?: number[],
        imagesToDelete?: number[]
    ): Observable<APIResponse> {
        let data = {
            item: item,
            sizes: sizes,
            options: options,
            images: images,
            sizesToDelete: sizesToDelete,
            optionsToDelete: optionsToDelete,
            imagesToDelete: imagesToDelete
        };
        return this.dataService.postData(this.saveInventoryItemURL, data);
    }

    public deleteInventory(categoryIDs: number[], itemIDs: number[]): Observable<APIResponse> {
        let data = { categoryIDs: categoryIDs, itemIDs: itemIDs };
        return this.dataService.postData(this.deleteInventoryURL, data);
    }

    public getInventoryItem(itemID: number): Observable<APIResponse> {
        return this.dataService.getData(this.getInventoryItemURL + "/" + itemID);
    }

    public saveEmailCart(data): Observable<APIResponse> {
        return this.dataService.postData(this.saveEmailCartURL, data);
    }

    public getInventoryCategoryImagesList(appID: number): Observable<APIResponse> {
        return this.dataService.getData(this.getInventoryCategoryImagesListURL + "/" + appID);
    }

    public addInventoryCategoryImages(images: File[], appID: number): Observable<APIResponse> {
        return this.formDataService.postData(this.addInventoryCategoryImagesURL, {
            images: images,
            app_id: appID
        });
    }

    public deleteInventoryCategoryImage(imageName: string): Observable<APIResponse> {
        return this.dataService.postData(this.deleteInventoryCategoryImageURL, { imageName: imageName });
    }

    public getInventoryItemImagesList(appID: number): Observable<APIResponse> {
        return this.dataService.getData(this.getInventoryItemImagesListURL + "/" + appID);
    }

    public addInventoryItemImages(images: File[], appID: number): Observable<APIResponse> {
        return this.formDataService.postData(this.addInventoryItemImagesURL, {
            images: images,
            app_id: appID
        });
    }

    public deleteInventoryItemImage(imageName: string): Observable<APIResponse> {
        return this.dataService.postData(this.deleteInventoryItemImageURL, { imageName: imageName });
    }

}