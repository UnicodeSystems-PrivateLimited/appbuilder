/**
 * Created by Akash on 19/9/16.
 */
import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { PDF, APIResponse } from '../../../../../theme/interfaces';

@Injectable()
export class PDFTabService {

    private _getTabDataURL: string = "../api/ws/function/pdf/tab/data";
    private _getListURL: string = "../api/ws/function/pdf/list";
    private _sortURL: string = "../api/ws/function/pdf/sort";
    private _deleteURL: string = "../api/ws/function/pdf/delete";
    private _addURL: string = "../api/ws/function/pdf/create";
    private _getURL: string = "../api/ws/function/pdf/get";
    private _editURL: string = "../api/ws/function/pdf/edit";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }

    public getList(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getListURL + '/' + tabId);
    }

    public sortList(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortURL, { ids: ids });
    }

    public deletePDF(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteURL, { id: ids });
    }

    public addPDF(pdf: PDF): Observable<APIResponse> {
        pdf.is_printing_allowed = +pdf.is_printing_allowed;
        return this.formDataService.postData(this._addURL, pdf);
    }

    public getPDF(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getURL + '/' + id);
    }

    public editPDF(pdf: PDF): Observable<APIResponse> {
        pdf.is_printing_allowed = +pdf.is_printing_allowed;
        return this.formDataService.postData(this._editURL, pdf);
    }

}