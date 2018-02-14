import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse, IpaRequestEmailData } from '../../../theme/interfaces';



@Injectable()
export class IpaRequestAppListService {

    private _getInitDataUrl: string = "../api/ws/function/IpaRequest/init";
    private _makeIpaRequestDoneUrl: string = "../api/ws/function/IpaRequest/done/request";
    private _sendIpaRequestMailUrl: string = "../api/ws/function/IpaRequest/send/email";
    private _getRequestByAppId: string = "../api/ws/function/IpaRequest/getById";
    private _getHistoryByAppId: string = "../api/ws/function/appPublish/history";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(type: number, currentPage: number, itemPerPage: number, queryString: string): Observable<APIResponse> {
        return this.dataService.getData(this._getInitDataUrl + '/' + currentPage + '/' + itemPerPage + '/' + type + queryString);
    }
    public makeIpaRequestDone(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._makeIpaRequestDoneUrl + '/' + id);
    }
    public sendEmail(mailData: IpaRequestEmailData): Observable<APIResponse> {
        return this.dataService.postData(this._sendIpaRequestMailUrl, mailData);
    }
    public getRequestByAppId(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getRequestByAppId + '/' + id);
    }
    public getHistoryByAppId(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getHistoryByAppId + '/' + id);
    }

}