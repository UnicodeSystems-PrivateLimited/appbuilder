import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { Website, APIResponse, WebsiteTabSettings } from '../../../../../theme/interfaces';

@Injectable()
export class WebsiteTabService {

    private _getTabDataURL: string = "../api/ws/function/website/tab/data";
    private _getWebsiteListURL: string = "../api/ws/function/website/list";
    private _sortWebsitesURL: string = "../api/ws/function/website/sort";
    private _deleteWebsiteURL: string = "../api/ws/function/website/delete";
    private _addWebsiteURL: string = "../api/ws/function/website/create";
    private _getWebsiteURL: string = "../api/ws/function/website/get";
    private _editWebsiteURL: string = "../api/ws/function/website/edit";
    private _deleteThumbnailURL: string = "../api/ws/function/website/delete-thumbnail";
    private _saveSettingsURL: string = "../api/ws/function/website/settings/save";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }

    public getWebsiteList(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getWebsiteListURL + '/' + tabId);
    }

    public sortWebsiteList(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortWebsitesURL, { ids: ids });
    }

    public deleteWebsite(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteWebsiteURL, { id: ids });
    }

    public addWebsite(website: Website): Observable<APIResponse> {
        website.is_donation_request = +website.is_donation_request;
        website.is_printing_allowed = +website.is_printing_allowed;
        website.use_safari_webview = +website.use_safari_webview;
        return this.formDataService.postData(this._addWebsiteURL, website);
    }

    public getWebsiteData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getWebsiteURL + '/' + id);
    }

    public editWebsite(website: Website): Observable<APIResponse> {
        website.is_donation_request = +website.is_donation_request;
        website.is_printing_allowed = +website.is_printing_allowed;
        website.use_safari_webview = +website.use_safari_webview;
        return this.formDataService.postData(this._editWebsiteURL, website);
    }

    public deleteThumbnail(websiteId: number): Observable<APIResponse> {
        return this.dataService.getData(this._deleteThumbnailURL + '/' + websiteId);
    }

    public saveSettings(settings: WebsiteTabSettings, tabId: number): Observable<APIResponse> {
        return this.dataService.postData(this._saveSettingsURL + '/' + tabId, settings);
    }

}