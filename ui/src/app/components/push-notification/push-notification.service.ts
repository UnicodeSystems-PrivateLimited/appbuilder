import { Injectable } from '@angular/core';
import { PageService, GridDataService } from '../../theme/services';
import { Observable, } from 'rxjs/Observable';
import { APIResponse, PushNotification } from '../../theme/interfaces';

@Injectable()
export class PushNotificationService {
    private _getTabsURL = '../api/ws/app/tab/content';
    private _getInitURL: string = "../api/ws/function/push-noti/init";
    private _saveURL: string = "../api/ws/function/push-noti/save";
    private _getUsersURL = '../api/ws/function/push-noti/users';
    private _deleteNotiURL: string = "../api/ws/function/push-noti/delete";
    private _getHistoryURL: string = "../api/ws/function/push-noti/history/get";
    private saveFacebookTokenURL: string = "../api/ws/app/facebook-token/save";
    private deleteFacebookTokenURL: string = "../api/ws/app/facebook-token/delete";
    private saveTwitterTokenURL: string = "../api/ws/app/twitter-token/save";
    private deleteTwitterTokenURL: string = "../api/ws/app/twitter-token/delete";
    private getLocatedAppUsersURL: string = "../api/ws/function/push-noti/get-located-users";
    private _getLocationByAppIdUrl: string = "../api/ws/app/location/list";

    constructor(private dataService: GridDataService) {
    }

    public getTabs(id: number): Observable<any> {
        return this.dataService.getData(this._getTabsURL + '/' + id);
    }

    public getInitData(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getInitURL + '/' + appId);
    }

    public save(pushNotiData: PushNotification): Observable<APIResponse> {
        return this.dataService.postData(this._saveURL, pushNotiData);
    }

    public getUsers(appId: number, groupId: number): Observable<any> {
        return this.dataService.getData(this._getUsersURL + '/' + appId + '/' + groupId);
    }
    public deleteNoti(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteNotiURL, { id: ids });
    }
    public getHistory(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getHistoryURL + '/' + appId);
    }

    public saveFacebookToken(accessToken: string, appId: number): Observable<APIResponse> {
        let data: any = {
            appID: appId,
            accessToken: accessToken
        };
        return this.dataService.postData(this.saveFacebookTokenURL, data);
    }

    public deleteFacebookToken(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this.deleteFacebookTokenURL + '/' + appId);
    }

    public saveTwitterTokenAndSecret(accessToken: string, secret: string, appId: number): Observable<APIResponse> {
        let data: any = {
            appID: appId,
            accessToken: accessToken,
            secret: secret
        };
        return this.dataService.postData(this.saveTwitterTokenURL, data);
    }

    public deleteTwitterTokenAndSecret(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this.deleteTwitterTokenURL + '/' + appId);
    }

    public getLocatedAppUsers(data: PushNotification): Observable<APIResponse> {
        return this.dataService.postData(this.getLocatedAppUsersURL, data);
    }
    public getLocationByAppId(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getLocationByAppIdUrl + '/' + id);
    }
}