/**
 * Created by Akash on 16/9/16.
 */
import { Injectable, Inject } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { PhoneNumber } from '../../../../../theme/interfaces';

@Injectable()
export class CallUsService {

    private _getTabDataURL: string = "../api/ws/function/call-us/tab/data"
    private _getNumberListURL: string = "../api/ws/function/call-us/list";
    private _sortNumbersURL: string = "../api/ws/function/call-us/sort";
    private _deleteNumberURL: string = "../api/ws/function/call-us/delete";
    private _addNumberURL: string = "../api/ws/function/call-us/create";
    private _getNumberURL: string = "../api/ws/function/call-us/get";
    private _editNumberURL: string = "../api/ws/function/call-us/edit";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<any> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }

    public getNumberList(tabId: number): Observable<any> {
        return this.dataService.getData(this._getNumberListURL + '/' + tabId);
    }

    public sortNumberList(ids: number[]): Observable<any> {
        return this.dataService.postData(this._sortNumbersURL, { ids: ids });
    }

    public deleteNumber(ids: number[]): Observable<any> {
        return this.dataService.postData(this._deleteNumberURL, { id: ids });
    }

    public addPhoneNumber(phoneNumber: PhoneNumber): Observable<any> {
        return this.formDataService.postData(this._addNumberURL, phoneNumber);
    }

    public getNumberData(id: number): Observable<any> {
        return this.dataService.getData(this._getNumberURL + '/' + id);
    }

    public editNumber(phoneNumber: PhoneNumber): Observable<any> {
        return this.formDataService.postData(this._editNumberURL, phoneNumber);
    }

}