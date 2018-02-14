import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { Website, APIResponse, WebsiteTabSettings, Direction} from '../../../../../theme/interfaces';

@Injectable()
export class DirectionTabService {

    private _getTabDataURL: string = "../api/ws/function/direction/init";
    private _sortDirectionsURL: string = "../api/ws/function/direction/sort";
    private _deleteDirectionURL: string = "../api/ws/function/direction/delete";
    private _saveDirectionsURL: string = "../api/ws/function/direction/save";
    private _getDirectionListURL: string = "../api/ws/function/direction/list";
    private _geDirectionURL: string = "../api/ws/function/direction/get";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }


    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }
    public sortDirectionList(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortDirectionsURL, { ids: ids });
    }


    public deleteDirection(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteDirectionURL, { id: ids });
    }

    public addDirection(addDirectionData: Direction): Observable<APIResponse> {
        return this.dataService.postData(this._saveDirectionsURL, addDirectionData);
    }

    public getDirectionList(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getDirectionListURL + '/' + tabId);
    }
    public getDirectionData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._geDirectionURL + '/' + id);
    }

    public editDirection(editDirectionData: Direction): Observable<APIResponse> {
        return this.dataService.postData(this._saveDirectionsURL , editDirectionData);
    }






}