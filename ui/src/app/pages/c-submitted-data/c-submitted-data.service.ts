import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse } from '../../theme/interfaces';
import { MailingList, MailingListCategory, Tab, MailChimp, IContact } from '../../theme/interfaces';

@Injectable()
export class CSubmittedDataService {

    private _getInitDataURL: string = "../api/ws/function/CustomerPortal/SubmittedData/init";
    private _getFormEntryURL: string = "../api/ws/function/CustomerPortal/SubmittedData/formEntry";
    private _getMailingListDataURL: string = "../api/ws/function/CustomerPortal/SubmittedData/MailingList";
    private deleteEntryURL: string = "../api/ws/function/email-forms-entry/delete";
    private _deleteUserURL: string = "../api/ws/function/CustomerPortal/SubmittedData/MailingList/deleteUser";
    private _getDayStatistcisUrl: string = "../api/ws/function/CustomerPortal/email-forms-fields/statistics/getDaydata";
    private _getMonthStatistcisUrl: string = "../api/ws/function/CustomerPortal/email-forms-fields/statistics/getMonthData";
    private _getYearStatistcisUrl: string = "../api/ws/function/CustomerPortal/email-forms-fields/statistics/getYearData";
    private _getBetwwenTwoDatesStatistcisUrl: string = "../api/ws/function/CustomerPortal/email-forms-fields/statistics/getBetweenTwoDateData";
    private _uploadConMailChimpURL: string = "../api/ws/function/CustomerPortal/user/upload/mailChimp";
    private _getMailDataURL: string = "../api/ws/function/CustomerPortal/accounts/get";
    private _getIContactClientListURL: string = "../api/ws/function/CustomerPortal/iContact/lists";
    private _uploadIcontactURL: string = "../api/ws/function/CustomerPortal/user/upload/iContact";
    private _updateAutomaticUploadSetting: string = "../api/ws/function/CustomerPortal/update/uploadSetting";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getInitDataURL + '/' + appId);
    }
    public getFormEntry(formId: number, currentPage: number, itemPerPage: number, queryString: string): Observable<APIResponse> {
        return this.dataService.getData(this._getFormEntryURL + '/' + currentPage + '/' + itemPerPage + '/' + formId + queryString);
    }
    public getMailingListData(appId: number, currentPage: number, itemPerPage: number, queryString: string): Observable<APIResponse> {
        return this.dataService.getData(this._getMailingListDataURL + '/' + currentPage + '/' + itemPerPage + '/' + appId + queryString);
    }
    public deleteFormEntries(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this.deleteEntryURL, { id: ids });
    }
    public getDayStatistcis(formId: number, year: any, month: any, day: any): Observable<APIResponse> {
        return this.dataService.getData(this._getDayStatistcisUrl + '/' + formId + '/' + year + '/' + month + '/' + day);
    }
    public getMonthStatistcis(formId: number, year: any, month: any): Observable<APIResponse> {
        return this.dataService.getData(this._getMonthStatistcisUrl + '/' + formId + '/' + year + '/' + month);
    }
    public getYearStatistcis(formId: number, year: any): Observable<APIResponse> {
        return this.dataService.getData(this._getYearStatistcisUrl + '/' + formId + '/' + year);
    }
    public getBetwwenTwoDatesStatistcis(formId: number, startDate: any, endDate: any): Observable<APIResponse> {
        startDate = encodeURI(startDate);
        endDate = encodeURI(endDate);
        return this.dataService.getData(this._getBetwwenTwoDatesStatistcisUrl + '/' + formId + "?start_date='" + startDate + "'&&end_date='" + endDate + "'");
    }
    public deleteUserList(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteUserURL, { id: ids });
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
    public updateAutomaticUploadSetting(data: any): Observable<APIResponse> {
        return this.dataService.postData(this._updateAutomaticUploadSetting, data);
    }
}