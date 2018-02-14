import { Injectable } from '@angular/core';
import { GridDataService } from '../../theme/services';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class MyAppService {

    private _getAppTabsURL = '../api/ws/app/tab/get';
    private _getAllAppListURL = '../api/ws/app/all';
    private _saveLaunchActivityURL = '../api/ws/app/activity/saveLaunchApp';
    private _updateAppPublishInfoURL = '../api/ws/app/update/appPublishInfo';
    private _getAppPublishLogURL = '../api/ws/app/appPublish/log';
    private _saveAppTabTitleTranslationURL = '../api/ws/app/tab/translation';

    constructor(private dataService: GridDataService) {
    }

    public getAllAppTabs(appId: number): Observable<any> {
        // Send '1' in the last URI segment to retrieve all tabs in one key.
        return this.dataService.getData(this._getAppTabsURL + '/' + appId + '/1');
    }

    public getAllAppList(): Observable<any> {
        return this.dataService.getData(this._getAllAppListURL);
    }

    public saveLaunchActivity(appId: number): Observable<any> {
        return this.dataService.getData(this._saveLaunchActivityURL + '/' + appId);
    }
    public updateAppPublishInfo(appId: number, values: any): Observable<any> {
        return this.dataService.postData(this._updateAppPublishInfoURL + '/' + appId, values);
    }
    public getAppUploadStatus(appId: number): Observable<any> {
        return this.dataService.getData(this._getAppPublishLogURL + '/' + appId);
    }
    public saveAppTabTitleTranslation(appId:number):Observable<any>{
         return this.dataService.getData(this._saveAppTabTitleTranslationURL + '/' + appId);
    }
}