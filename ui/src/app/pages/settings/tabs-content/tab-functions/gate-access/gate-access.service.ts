/**
 * Created by Akash on 04/10/16.
 */
import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse, GateAccessData } from '../../../../../theme/interfaces';

@Injectable()
export class GateAccessService {
    private _getTabDataURL: string = "../api/ws/function/gate-access/init";
    private _saveTabDataURL: string = "../api/ws/function/gate-access/save";
    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }

    public saveTabData(data: GateAccessData): Observable<APIResponse> {
        return this.formDataService.postData(this._saveTabDataURL, data);
    }

}