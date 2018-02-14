/**
 * Created by Akash on 04/10/16.
 */
import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse } from "../../../../../theme/interfaces/common-interfaces";

@Injectable()
export class FanWallTabService {
    private _getTabDataURL: string = "../api/ws/function/fan-wall/init";
    private _deleteItemURL: string = "../api/ws/function/fan-wall/delete";
    private _getItemURL: string = "../api/ws/function/fan-wall/info/";
    private _sortNumbersURL: string = "../api/ws/function/fan-wall/sort";


    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }

    public getFanWallItem(itemId): Observable<APIResponse> {
        return this.dataService.getData(this._getItemURL + itemId);
    }
    public sortNumberList(ids: number[]): Observable<any> {
        return this.dataService.postData(this._sortNumbersURL, { ids: ids });
    }
//    public deleteItem(id: Object) {
//        return this.dataService.postData(this._deleteItemURL, id);
//    }
    public deleteItem(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteItemURL, { id: ids });
    }
}