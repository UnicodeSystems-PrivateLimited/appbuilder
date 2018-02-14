/**
 * Created by Akash on 04/10/16.
 */
import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { ContactLocation, APIResponse, OpeningTime } from '../../../../../theme/interfaces';

@Injectable()
export class ContactUsService {

    private _getInitDataURL: string = "../api/ws/function/contact-us/init";
    private _getLocationListURL: string = "../api/ws/function/contact-us/location/list";
    private _sortLocationsURL: string = "../api/ws/function/contact-us/location/sort";
    private _deleteLocationURL: string = "../api/ws/function/contact-us/location/delete";
    private _saveLocationURL: string = "../api/ws/function/contact-us/location/save";
    private _getLocationURL: string = "../api/ws/function/contact-us/location/get";
    private _deleteLocationImageURL: string = "../api/ws/function/contact-us/location/image/delete";
    private _getOpeningListURL: string = "../api/ws/function/contact-us/location/opening/list";
    private _sortOpeningTimesURL: string = "../api/ws/function/contact-us/location/opening/sort";
    private _deleteOpeningTimeURL: string = "../api/ws/function/contact-us/location/opening/delete";
    private _saveOpeningTimeURL: string = "../api/ws/function/contact-us/location/opening/save";
    private _getOpeningTimeURL: string = "../api/ws/function/contact-us/location/opening/get";
    private _deleteCommentURL: string = "../api/ws/function/contact-us/location/comment/delete";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getInitDataURL + '/' + tabId);
    }

    public saveLocation(location: ContactLocation, isMapDataSet: boolean) {
        let postData = Object.assign({}, location, { isMapDataSet: +isMapDataSet });
        return this.formDataService.postData(this._saveLocationURL, postData);
    }

    public getLocationList(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getLocationListURL + '/' + tabId);
    }

    public sortLocationList(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortLocationsURL, { ids: ids });
    }

    public deleteLocation(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteLocationURL, { id: ids });
    }

    public getLocationData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getLocationURL + '/' + id);
    }

    public deleteImage(type: string, locationId: number): Observable<APIResponse> {
        return this.dataService.getData(this._deleteLocationImageURL + '/' + type + '/' + locationId);
    }

    public getOpeningTimesList(locationId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getOpeningListURL + '/' + locationId);
    }

    public sortOpeningTimes(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortOpeningTimesURL, { ids: ids });
    }

    public deleteOpeningTime(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteOpeningTimeURL, { id: ids });
    }

    public saveOpeningTime(openingTime: OpeningTime): Observable<APIResponse> {
        return this.dataService.postData(this._saveOpeningTimeURL, openingTime);
    }

    public getOpeningTimeData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getOpeningTimeURL + '/' + id);
    }

    public deleteComment(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteCommentURL, { id: ids });
    }

}