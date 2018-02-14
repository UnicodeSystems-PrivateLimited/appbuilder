import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse } from '../../../../../theme/interfaces';

@Injectable()
export class LanguageTabService {

    private _getTabDataURL: string = "../api/ws/function/language-tab/init";
    private _saveURL: string = "../api/ws/function/language-tab/save";
    private _deleteURL: string = "../api/ws/function/language-tab/delete";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {

    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }
    public save(tabId: number, data: any): Observable<APIResponse> {
        return this.dataService.postData(this._saveURL + '/' + tabId, data);
    }

    public deleteLanguages(data: any): Observable<APIResponse> {
        return this.dataService.postData(this._deleteURL, data);
    }

}