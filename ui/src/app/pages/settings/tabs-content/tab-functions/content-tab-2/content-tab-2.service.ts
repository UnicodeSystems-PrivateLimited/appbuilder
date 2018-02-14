/**
 * Created by Akash on 04/10/16.
 */
import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse, ContentTabOneItem } from "../../../../../theme/interfaces/common-interfaces";

@Injectable()
export class ContentTabTwoService {
    private _getTabDataURL: string = "../api/ws/function/content-tab-2/init";
    private _saveURL: string = "../api/ws/function/content-tab-2/save";
    private _colorUpdateURL: string = "../api/ws/function/content-tab-2/update-colors";
    private _getItemURL: string = "../api/ws/function/content-tab-2/get/";
    private _getItemlistURL: string = "../api/ws/function/content-tab-2/list/";
    private _deleteItemURL: string = "../api/ws/function/content-tab-2/delete";
    private _deleteCommentURL: string = "../api/ws/function/content-tab-2/comment/delete";
    private _sortNumbersURL: string = "../api/ws/function/content-tab-2/sort";
    private _deleteImageURL: string = "../api/ws/function/content-tab-2/image/delete/";
    private _deleteThumbnailImageURL: string = "../api/ws/function/content-tab-2/thumbnail/delete/";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }
    public saveContentTabTwoItem(item: ContentTabOneItem | Object) {
        return this.formDataService.postData(this._saveURL, item);
    }
    public saveContentTabTwoItemColor(item: ContentTabOneItem | Object) {
        return this.formDataService.postData(this._colorUpdateURL, item);
    }

    public getItem(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getItemURL+id);
    }
    public getItemLsit(tabId: number) {
        return this.dataService.getData(this._getItemlistURL+tabId);
    }
    public deleteItem(ids: number[]) {
        return this.dataService.postData(this._deleteItemURL, { id: ids });
    }
    public deleteComment(commentId: Object) {
        return this.dataService.postData(this._deleteCommentURL, commentId);
    }
    public sortNumberList(ids: number[]): Observable<any> {
        return this.dataService.postData(this._sortNumbersURL, { ids: ids });
    }
    public deleteImage(type:string,id:number) {
        return this.dataService.getData(this._deleteImageURL+type+"/"+id);
    }
    public deleteThumbnailImage(type:string,id:number) {
        return this.dataService.getData(this._deleteThumbnailImageURL+type+"/"+id);
    }
}