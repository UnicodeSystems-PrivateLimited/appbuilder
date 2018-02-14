/**
 * Created by Akash on 04/10/16.
 */
import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse, ContentTabOneItem, ContentTabThreeCategory, ContentTabThreeItem } from "../../../../../theme/interfaces/common-interfaces";

@Injectable()
export class ContentTabThreeService {
    private _getTabDataURL: string = "../api/ws/function/content-tab-3/init";
    private _saveCategoryURL: string = "../api/ws/function/content-tab-3/save";
    private _getCategoryItemURL: string = "../api/ws/function/content-tab-3/categoryItem/list/";
    private _saveCategoryItemURL: string = "../api/ws/function/content-tab-3/categoryItem/save";
    private _getEditCategoryItemURL: string = "../api/ws/function/content-tab-3/categoryItem/getData/";
    private _colorUpdateURL: string = "../api/ws/function/content-tab-3/categoryItem/update-colors";
    private _sortCategoriesURL: string = "../api/ws/function/content-tab-3/sort";
    private _sortItemsURL: string = "../api/ws/function/content-tab-3/categoryItem/sort";
    private _getItemCommentsURL: string = "../api/ws/function/content-tab-3/comment/list/";
    private _deleteItemURL: string = "../api/ws/function/content-tab-3/categoryItem/delete";
    private _deleteCommentURL: string = "../api/ws/function/content-tab-3/comment/delete";
    // private _sortNumbersURL: string = "../api/ws/function/content-tab-2/sort";
    private _deleteImageURL: string = "../api/ws/function/content-tab-3/categoryItem/image/delete/";
    private _deleteCategoryItemThumbnailImageURL: string = "../api/ws/function/content-tab-3/categoryItem/thumbnail/delete/";
    private _deleteThumbnailCategoryImageURL: string = "../api/ws/function/content-tab-3/thumbnail/delete";
    private _deleteCategoryURL: string = "../api/ws/function/content-tab-3/delete";
    private _getSingleCategoryURL: string = "../api/ws/function/content-tab-3/getCategoryData";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }
    public saveCategory(item: ContentTabThreeCategory | Object) {
        return this.formDataService.postData(this._saveCategoryURL, item);
    }
    public getCategoryItem(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getCategoryItemURL + id);
    }
    public saveContentTabThreeItem(item: ContentTabThreeItem | Object) {
        return this.formDataService.postData(this._saveCategoryItemURL, item);
    }
    public editCategoryItem(id: number) {
        return this.dataService.getData(this._getEditCategoryItemURL + id);
    }
    public saveContentTabThreeItemColor(item: ContentTabThreeItem | Object) {
        return this.formDataService.postData(this._colorUpdateURL, item);
    }
    public sortCategoryList(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortCategoriesURL, { ids: ids });
    }
    public sortItemList(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortItemsURL, { ids: ids });
    }


    public listItemComments(id: number) {
        return this.dataService.getData(this._getItemCommentsURL + id);
    }
    public deleteItem(ids: number[]) {
        return this.dataService.postData(this._deleteItemURL, { id: ids });
    }
    public deleteComment(ids: number[]) {
        return this.dataService.postData(this._deleteCommentURL, { id: ids });
    }
    // public sortNumberList(ids: number[]): Observable<any> {
    //     return this.dataService.postData(this._sortNumbersURL, { ids: ids });
    // }
    public deleteImage(type: string, id: number) {
        return this.dataService.getData(this._deleteImageURL + type + "/" + id);
    }
    public deleteThumbnailImage(type: string, id: number) {
        return this.dataService.getData(this._deleteCategoryItemThumbnailImageURL + type + "/" + id);
    }
    public deleteThumbnailCategoryImage(id: number) {
        return this.dataService.getData(this._deleteThumbnailCategoryImageURL + "/" + id);
    }
    public deleteCategory(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteCategoryURL, { id: ids });
    }
    public getSingleCategoryData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getSingleCategoryURL + '/' + id);
    }
}