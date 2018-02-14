import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse } from '../../theme/interfaces';

@Injectable()
export class TransactionsService {

    private _getDataURL: string = "../api/ws/transaction/init";
    private _getFoodOrderByTabIdURL: string = "../api/ws/transaction/orders"
    private _getFoodOrderCaregoryURL: string = "../api/ws/function/food-orders/menu/category/list"
    private _getFoodOrderItemsURL: string = "../api/ws/function/food-orders/menu/items/list"
    private _getItemDetailURL: string = "../api/ws/function/food-orders/item/detail"
    private _deleteFoodOrdersURL: string = "../api/ws/transaction/food-orders/delete";
    private _editOrderUrl: string = "../api/ws/transaction/food-orders/edit";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(appId: number, currentPage: number, itemPerPage: number, queryString: string): Observable<APIResponse> {
        return this.dataService.getData(this._getDataURL + '/' + currentPage + '/' + itemPerPage + '/' + appId + queryString);
    }

    public getFoodOrdersByTabId(tabId: number, currentPage: number, itemPerPage: number, queryString: string): Observable<APIResponse> {
        return this.dataService.getData(this._getFoodOrderByTabIdURL + '/' + currentPage + '/' + itemPerPage + '/' + tabId + queryString)
    }
    public getFoodMenuCategory(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getFoodOrderCaregoryURL + '/' + id);
    }
    public getFoodMenuItems(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getFoodOrderItemsURL + '/' + id);
    }
    public getItemDetails(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getItemDetailURL + '/' + id);
    }
    public deleteFoodOrders(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteFoodOrdersURL, { id: ids });
    }
    public editOrder(data: any): Observable<APIResponse> {
        return this.dataService.postData(this._editOrderUrl, data);
    }
}