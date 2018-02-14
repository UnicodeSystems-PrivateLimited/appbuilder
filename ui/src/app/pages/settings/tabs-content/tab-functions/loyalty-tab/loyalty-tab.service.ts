import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { Tab, APIResponse, Loyalty, LoyaltyPerk, AdvancedLoyalty} from '../../../../../theme/interfaces';

@Injectable()
export class LoyaltyTabService {

    private _getInitDataURL: string = "../api/ws/function/loyalty/init";
    private _sortLoyaltyURL: string = "../api/ws/function/loyalty/sort";
    private _deleteLoyaltyURL: string = "../api/ws/function/loyalty/delete";
    private _deleteAdvLoyaltyURL: string = "../api/ws/function/loyalty/advanced/delete";
    private _saveLoyaltyURL: string = "../api/ws/function/loyalty/save";
    private _saveAdvancedLoyaltyURL: string = "../api/ws/function/advanced/loyalty/save";
    private _getSingleLoyaltyURL: string = "../api/ws/function/loyalty/get";
    private _getSingleAdvLoyaltyURL: string = "../api/ws/function/loyalty/advanced/get";
    private _deleteLoyaltyImageURL: string = "../api/ws/function/loyalty/image/delete/";
    private _deleteAdvLoyaltyImageURL: string = "../api/ws/function/advanced/loyalty/image/delete/";
    private _deletePerkImageURL: string = "../api/ws/function/loyalty/perk/delete/";
    private _deleteAdvActivityURL: string = "../api/ws/function/advanced/loyalty/activity/delete";
    private _deletActivityURL: string = "../api/ws/function/loyalty/activity/delete";
    private _getPerkURL: string = "../api/ws/function/loyalty/perk/get";


    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getInitDataURL + '/' + tabId);
    }

    public sortLoyaltyList(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortLoyaltyURL, { ids: ids });
    }


    public deleteLoyalty(ids: number,loyaltyType:number): Observable<APIResponse> {
        return this.dataService.postData(this._deleteLoyaltyURL, { id: ids ,is_advance:loyaltyType});
    }
    public deleteAdvLoyalty(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteAdvLoyaltyURL, { id: ids });
    }

    public saveLoyalty(loyaltyData: Loyalty) {
        return this.formDataService.postData(this._saveLoyaltyURL, loyaltyData);
    }

    public saveAdvancedLoyalty(advancedloyaltyData: AdvancedLoyalty) {
        // let data = Object.assign({}, advancedloyaltyData, loyaltyPerk)
        return this.formDataService.postNestedLoyaltyData(this._saveAdvancedLoyaltyURL, advancedloyaltyData);
    }

    public getSingleLoyaltyData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getSingleLoyaltyURL + '/' + id);
    }
    public getSingleAdvLoyaltyData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getSingleAdvLoyaltyURL + '/' + id);
    }

    public deleteLoyaltyImage(imageType: string, id: number) {
        return this.dataService.getData(this._deleteLoyaltyImageURL + imageType + "/" + id);
    }

    public deleteAdvLoyaltyImage(imageType: string, id: number) {
        return this.dataService.getData(this._deleteAdvLoyaltyImageURL + imageType + "/" + id);
    }

    public deletePerkImage(imageType: string, id: number) {
        return this.dataService.getData(this._deletePerkImageURL + imageType + "/" + id);
    }

       public getPerkList(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getPerkURL + '/' + id);
    }

    public deleteAdvancedActivity(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteAdvActivityURL, { id: ids });
    }
       public deleteActivity(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deletActivityURL, { id: ids });
    }


}