/**
 * Created by Gaurav on 24/05/17.
 */
import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse } from '../../theme/interfaces';

@Injectable()
export class DashboardService {

    private _getInitDataURL: string = "../api/ws/app/activity/getActivityList";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(currentPage: number, itemPerPage: number): Observable<APIResponse> {
        return this.dataService.getData(this._getInitDataURL + '/' + currentPage + '/' + itemPerPage);
    }
}