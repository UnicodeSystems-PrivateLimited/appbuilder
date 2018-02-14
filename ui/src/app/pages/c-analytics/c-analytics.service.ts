import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse } from '../../theme/interfaces';
import { AppAnalyticsSelectorData } from '../../theme/interfaces';

@Injectable()
export class CAnalyticsService {

    private _getInitDataURL: string = "../api/ws/function/AppAnalytics/init";
    // private _updateAutomaticUploadSetting: string = "../api/ws/function/CustomerPortal/update/uploadSetting";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(appAnalyticsSelectorData: AppAnalyticsSelectorData): Observable<APIResponse> {
        return this.dataService.postData(this._getInitDataURL, appAnalyticsSelectorData);
    }
    
    // public updateAutomaticUploadSetting(data: any): Observable<APIResponse> {
    //     return this.dataService.postData(this._updateAutomaticUploadSetting, data);
    // }
}