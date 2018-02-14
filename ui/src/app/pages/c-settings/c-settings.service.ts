import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse } from '../../theme/interfaces';
import { CustomerSetting, SaveMembershipSettings } from '../../theme/interfaces';

@Injectable()
export class CSettingService {

    private _getDataURL: string = "../api/ws/function/CustomerPortal/setting/init";
    private _saveAppConfigURL: string = "../api/ws/function/CustomerPortal/setting/save";
    private _saveMembershipSettingsDataURL: string = "../api/ws/function/CustomerPortal/membershipsettings/save";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getDataURL + '/' + appId);
    }

    public saveAppConfigSetting(appConfigData: CustomerSetting): Observable<APIResponse> {
        return this.dataService.postData(this._saveAppConfigURL, appConfigData);
    }

    public saveMembershipSetting(membershipSettingsData: SaveMembershipSettings): Observable<APIResponse> {
        return this.dataService.postData(this._saveMembershipSettingsDataURL, membershipSettingsData);
    }
}