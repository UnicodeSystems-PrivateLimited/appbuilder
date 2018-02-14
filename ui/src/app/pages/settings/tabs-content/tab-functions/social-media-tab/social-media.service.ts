import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse } from '../../../../../theme/interfaces';

@Injectable()
export class SocialMediaService {
    private _getInitURL: string = "../api/ws/function/social/user/list";
    private _deleteURL: string = "../api/ws/function/social/user/delete";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(appId: number, tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getInitURL + '/' + appId + '/' + tabId);
    }

    public deleteUser(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteURL, { id: ids });
    }
   }