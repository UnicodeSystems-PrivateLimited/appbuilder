import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { Website, APIResponse, WebsiteTabSettings, Around, AroundUsTabCategory} from '../../../../../theme/interfaces';

@Injectable()
export class AroundUsTabService {

    private _getTabDataURL: string = "../api/ws/function/around-us/init";
    private _sortAroundItemURL: string = "../api/ws/function/around-us/category/item/sort";
    private _listCommentURL: string = "../api/ws/function/around-us/comment/list";
    private _listItemURL: string = "../api/ws/function/around-us/category/item/get";
    private _getItemURL: string = "../api/ws/function/around-us/category/item/info";
    private _deleteCommentURL: string = "../api/ws/function/around-us/comment/delete";
    private _deleteItemURL: string = "../api/ws/function/around-us/category/item/delete";
    private _saveAroundUsItemURL: string = "../api/ws/function/around-us/category/item/save";
    private _saveCategoryURL: string = "../api/ws/function/around-us/category/save";
    private _deleteAroundUsImageURL: string = "../api/ws/function/around-us/category/item/thumbnail/delete";


    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }
    public sortAroundItemList(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortAroundItemURL, { ids: ids });
    }
    public getCommentData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._listCommentURL + '/' + id);
    }
    public getItemList(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._listItemURL + '/' + tabId);
    }
    public getSingleItemData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getItemURL + '/' + id);
    }
    public deleteComment(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteCommentURL, { id: ids });
    }
    public deleteItem(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteItemURL, { id: ids });
    }
    public saveAroundUsItem(aroundUsData: Around, isMapDataSet: boolean): Observable<APIResponse> {
        let postData = Object.assign({}, aroundUsData, { isMapDataSet: +isMapDataSet });
        return this.formDataService.postData(this._saveAroundUsItemURL, postData);
    }
    public saveCategory(categoryData: AroundUsTabCategory[]): Observable<APIResponse> {
        return this.dataService.postData(this._saveCategoryURL, categoryData);
    }
    public deleteThumbnailImage(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._deleteAroundUsImageURL + '/' + id);
    }
}

