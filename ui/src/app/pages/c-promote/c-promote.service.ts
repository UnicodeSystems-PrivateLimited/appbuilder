import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse, AppConfigPromoteSetting } from '../../theme/interfaces';
import { MailingList, MailingListCategory, Tab, MailChimp, IContact } from '../../theme/interfaces';

@Injectable()
export class CPromoteService {

    private _getDataURL: string = "../api/ws/function/CustomerPortal/promote/init";
    private _savePromoteSettingUrl: string = "../api/ws/function/CustomerPortal/promote/save";
    public _savePromoteImageUrl: string = "../api/ws/function/CustomerPortal/promote/upload/image"
    public _deletePromoteImageUrl: string = "../api/ws/function/CustomerPortal/promote/delete/image"
    public _getAppTabsUrl: string = "../api/ws/function/CustomerPortal/emailMarketting/tabList"
    public _deleteUserEmailUrl: string = "../api/ws/function/CustomerPortal/emailMarketting/deleteUser/email"
    public _deleteUsersBassisDevicesUrl: string = "../api/ws/function/CustomerPortal/userActivity/deleteUser"
    private _uploadConMailChimpURL: string = "../api/ws/function/CustomerPortal/emailMarketting/user/upload/mailChimp";
    private _getMailDataURL: string = "../api/ws/function/CustomerPortal/accounts/get";
    private _getIContactClientListURL: string = "../api/ws/function/CustomerPortal/iContact/lists";
    private _uploadIcontactURL: string = "../api/ws/function/CustomerPortal/emailMarketting/user/upload/iContact";
    private _getUserActivityURL: string = "../api/ws/function/CustomerPortal/userActivity/init";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getDataURL + "/" + appId);
    }
    public savePromoteSetting(data: AppConfigPromoteSetting): Observable<APIResponse> {
        return this.dataService.postData(this._savePromoteSettingUrl, data);
    }
    public savePromoteImages(data: any): Observable<APIResponse> {
        return this.formDataService.postData(this._savePromoteImageUrl, data);
    }
    public deletePromoteImages(id: number, type: number): Observable<APIResponse> {
        return this.dataService.getData(this._deletePromoteImageUrl + '/' + id + '/' + type);
    }
    public deleteUserEmail(ids: Array<number>): Observable<APIResponse> {
        return this.dataService.postData(this._deleteUserEmailUrl, { id: ids });
    }
    public deleteUsersBassisDevices(ids: Array<number>): Observable<APIResponse> {
        return this.dataService.postData(this._deleteUsersBassisDevicesUrl, { id: ids });
    }
    public uploadConMailChimp(mailChimp: MailChimp): Observable<APIResponse> {
        return this.dataService.postData(this._uploadConMailChimpURL, mailChimp);
    }
    public getMailData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getMailDataURL + '/' + tabId);
    }
    public getIContactClientListByAppId(iContact: IContact): Observable<APIResponse> {
        return this.dataService.postData(this._getIContactClientListURL, iContact);
    }
    public uploadIcontactByAppId(iContact: IContact): Observable<APIResponse> {
        return this.dataService.postData(this._uploadIcontactURL, iContact);
    }
    public getUserActivityData(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getUserActivityURL + '/' + appId);
    }
}