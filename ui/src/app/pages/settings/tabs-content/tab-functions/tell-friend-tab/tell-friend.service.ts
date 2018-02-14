import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse } from '../../../../../theme/interfaces';

@Injectable()
export class TellFriendService {

    private _getTabDataURL: string = "../api/ws/function/tell-friend/init";


    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }


    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }

}