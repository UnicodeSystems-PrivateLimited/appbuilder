import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { Tab, APIResponse, InboxTabSettings, InboxTabSubscription} from '../../../../../theme/interfaces';

@Injectable()
export class InboxTabService {
    private _getTabDataURL: string = "../api/ws/function/inboxTab/init";
    private _saveInboxSettingsURL: string = "../api/ws/function/inboxTab/save";
    private _sortSubscriptionURL: string = "../api/ws/function/inboxTab/subscription/sort";
    private _saveSubscriptionURL: string = "../api/ws/function/inboxTab/subscription/save";
    private _deleteSubscriptionURL: string = "../api/ws/function/inboxTab/subscription/delete";
    private _getSingleSubscriptionURL: string = "../api/ws/function/inboxTab/subscription/get/info";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }
    public saveSettings(settingsData: InboxTabSettings): Observable<APIResponse> {
        return this.dataService.postData(this._saveInboxSettingsURL, settingsData);
    }
    public sortSubscription(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortSubscriptionURL, { ids: ids });
    }
    public saveSubscription(subscriptionData: InboxTabSubscription): Observable<APIResponse> {
        return this.dataService.postData(this._saveSubscriptionURL, subscriptionData);
    }
    public deleteSubscription(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteSubscriptionURL, { id: ids });
    }
    public getSingleSubscriptionData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getSingleSubscriptionURL + '/' + id);
    }
}