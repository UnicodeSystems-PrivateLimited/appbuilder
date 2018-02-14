import { Injectable } from "@angular/core";
import {
  GridDataService,
  FormDataService
} from "../../../../../theme/services";
import { Observable } from "rxjs/Observable";
import { APIResponse } from "../../../../../theme/interfaces";
import {
  FoodLocationInfo,
  ServicesInfo,
  FoodOrderingPayment,
  FoodOrderingPaymentTaxDetails,
  FoodOrderingMenuCategory,
  FoodOrderingMenuItem,
  FoodOrderingMenuItemSize,
  FoodOrderingMenuOptionType, AvailabilityInfo
} from "../../../../../theme/interfaces/common-interfaces";
import { AsyncSubject } from "rxjs";

@Injectable()
export class FoodOrderingService {
  private _getInitDataURL: string = "../api/ws/function/food-ordering/init";
  private _saveSettingsURL: string = "../api/ws/function/food-ordering/settings/save";

  //LOCATION
  private _getSingleFoodContactURL: string = "../api/ws/function/food-ordering/contact/info";
  private _saveLocationInfoURL: string = "../api/ws/function/food-ordering/locationInfo/save";
  private _getLocationInfoDataURL: string = "../api/ws/function/food-ordering/locationInfo/getLocationData";
  private _getLocationHoursDataURL: string = "../api/ws/function/food-ordering/locationInfo/getLocationHoursData";
  private _deleteFoodLocationURL: string = "../api/ws/function/food-ordering/locationInfo/location/delete";

  // PAYMENT
  private _savePaymentURL: string = "../api/ws/function/food-ordering/payment/save";
  private _saveTaxAmountURL: string = "../api/ws/function/food-ordering/payment/tax/save";
  private _deleteTaxAmountsURL: string = "../api/ws/function/food-ordering/payment/tax/delete";

  //MENU
  private saveMenuSettingsURL: string = "../api/ws/function/food-ordering/menu/settings/save";
  private sortMenuURL: string = "../api/ws/function/food-ordering/menu/sort";
  private deleteMenuURL: string = "../api/ws/function/food-ordering/menu/delete";
  private getCategoryItemURL: string = "../api/ws/function/food-ordering/category/item/get";
  private getMenuCategoryImagesListListURL: string = "../api/ws/function/food-ordering/menu/category/images/list";
  private getMenuItemImagesListURL: string = "../api/ws/function/food-ordering/menu/item/images/list";
  private addMenuCategoryImagesURL: string = "../api/ws/function/food-ordering/menu/category/images/add";
  private saveMenuCategoryURL: string = "../api/ws/function/food-ordering/menu/category/save";
  private addMenuItemImagesURL: string = "../api/ws/function/food-ordering/menu/item/images/add";
  private deleteMenuCategoryImageURL: string = "../api/ws/function/food-ordering/menu/category/image/delete";
  private deleteMenuItemImageURL: string = "../api/ws/function/food-ordering/menu/item/image/delete";
  private saveMenuItemURL: string = "../api/ws/function/food-ordering/menu/item/save";
  private sortOptionsURL: string = "../api/ws/function/food-ordering/options/sort";
  
  // SERVICES
  private _saveServicesURL: string = "../api/ws/function/food-ordering/services/save";

  //EMAIL
  private _saveEmailFoodURL: string = "../api/ws/function/food-ordering/email/item/save";

  public tabID: number;
  public currencySymbolList: any;
  public settings: {
    start_order_button: string;
    category_view_display: number;
    order_service_type: number;
    url_2: string;
    url_3: string;
    url_4: string;
    url_5: string;
    url_6: string;
    url_7: string;
    url_8: string;
  };
  public dataRetreived: AsyncSubject<boolean>;

  constructor(
    private dataService: GridDataService,
    private formDataService: FormDataService
  ) {
    this.dataRetreived = new AsyncSubject<boolean>();
  }

  public saveServices(data: ServicesInfo): Observable<APIResponse> {
    return this.dataService.postData(this._saveServicesURL, data);
  }

  public getInitData(tabID: number): Observable<APIResponse> {
    return this.dataService.getData(this._getInitDataURL + "/" + tabID);
  }

  public saveSettings(settings: any, tabID: number): Observable<APIResponse> {
    return this.dataService.postData(
      this._saveSettingsURL + "/" + tabID,
      settings
    );
  }

  public savePayment(data: FoodOrderingPayment): Observable<APIResponse> {
    return this.dataService.postData(this._savePaymentURL, data);
  }

  public saveTaxAmount(
    taxAmount: FoodOrderingPaymentTaxDetails
  ): Observable<APIResponse> {
    return this.dataService.postData(this._saveTaxAmountURL, taxAmount);
  }

  public deleteTaxAmounts(ids: number[]): Observable<APIResponse> {
    return this.dataService.postData(this._deleteTaxAmountsURL, { ids: ids });
  }

  public saveEmailFood(data): Observable<APIResponse> {
    return this.dataService.postData(this._saveEmailFoodURL, data);
  }

  public getSingleFoodContactData(id: number): Observable<APIResponse> {
    return this.dataService.getData(this._getSingleFoodContactURL + "/" + id);
  }

  public saveLocationInfo(data): Observable<APIResponse> {
    return this.dataService.postData(this._saveLocationInfoURL, data);
  }

  public getLocationInfoData(tabID: number): Observable<APIResponse> {
    return this.dataService.getData(this._getLocationInfoDataURL + "/" + tabID);
  }

  public deleteFoodLocation(ids: number[]): Observable<APIResponse> {
    return this.dataService.postData(this._deleteFoodLocationURL, { ids: ids });
  }

  public getLocationHoursData(id: number): Observable<APIResponse> {
    return this.dataService.getData(this._getLocationHoursDataURL + "/" + id);
  }

  public saveMenuSettings(settings: any): Observable<APIResponse> {
    return this.dataService.postData(this.saveMenuSettingsURL, settings);
  }

  public sortMenu(data: any): Observable<APIResponse> {
    return this.dataService.postData(this.sortMenuURL, data);
  }
  
  public sortOptions(data: any): Observable<APIResponse> {
    return this.dataService.postData(this.sortOptionsURL, data);
  }

  public deleteMenu(
    categoryIDs: number[],
    itemIDs: number[]
  ): Observable<APIResponse> {
    let data = { categoryIDs: categoryIDs, itemIDs: itemIDs };
    return this.dataService.postData(this.deleteMenuURL, data);
  }

  public getCategoryItem(itemID: number): Observable<APIResponse> {
    return this.dataService.getData(this.getCategoryItemURL + "/" + itemID);
  }

  public addMenuCategoryImages(
    images: File[],
    appID: number
  ): Observable<APIResponse> {
    return this.formDataService.postData(this.addMenuCategoryImagesURL, {
      images: images,
      app_id: appID
    });
  }

  public getMenuCategoryImagesList(appID: number): Observable<APIResponse> {
    return this.dataService.getData(
      this.getMenuCategoryImagesListListURL + "/" + appID
    );
  }
  
  public getMenuItemImagesList(appID: number): Observable<APIResponse> {
    return this.dataService.getData(
      this.getMenuItemImagesListURL + "/" + appID
    );
  }

  public saveMenuCategory(
    category: FoodOrderingMenuCategory
  ): Observable<APIResponse> {
    return this.dataService.postData(this.saveMenuCategoryURL, category);
  }
  
  public addMenuItemImages(images: File[], appID: number): Observable<APIResponse> {
      return this.formDataService.postData(this.addMenuItemImagesURL, {
          images: images,
          app_id: appID
      });
  }
  
  public deleteMenuCategoryImage(imageName: string): Observable<APIResponse> {
      return this.dataService.postData(this.deleteMenuCategoryImageURL, { imageName: imageName });
  }
    
  public deleteMenuItemImage(imageName: string): Observable<APIResponse> {
    return this.dataService.postData(this.deleteMenuItemImageURL, { imageName: imageName });
  }
  
  public saveMenuItem(
      item: FoodOrderingMenuItem,
      sizes?: FoodOrderingMenuItemSize[],
      options?: FoodOrderingMenuOptionType[],
      availabilityInfo?: AvailabilityInfo,
      sizesToDelete?: number[],
      optionsToDelete?: number[],
      itemsOptionsToDelete?: number[]
  ): Observable<APIResponse> {
      let data = {
          item: item,
          sizes: sizes,
          options: options,
          availabilityInfo: availabilityInfo,
          sizesToDelete: sizesToDelete,
          optionsToDelete: optionsToDelete,
          itemsOptionsToDelete: itemsOptionsToDelete
      };
      return this.dataService.postData(this.saveMenuItemURL, data);
  }
}
