import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import {APIResponse, News} from '../../../../../theme/interfaces';

@Injectable()
export class NewsTabService {
    private _getTabDataURL: string = "../api/ws/function/news/init";
    private _saveNewsKeywordURL: string = "../api/ws/function/news/save";
    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }
    
    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }
    
    public saveNewsKeyword(newsData: News) {
        return this.formDataService.postData(this._saveNewsKeywordURL, newsData);
    }
}