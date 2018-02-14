/**
 * Created by Akash on 27/9/16.
 */
import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { MenuCategory, APIResponse, MenuItem } from "../../../../../theme/interfaces/common-interfaces";

@Injectable()
export class MenuTabService {

    private _getTabDataURL: string = "../api/ws/function/menu-tab/tab/data";
    private _getCategoryListURL: string = "../api/ws/function/menu-tab/category/list";
    private _sortCategoriesURL: string = "../api/ws/function/menu-tab/category/sort";
    private _deleteCategoryURL: string = "../api/ws/function/menu-tab/category/delete";
    private _addCategoryURL: string = "../api/ws/function/menu-tab/category/create";
    private _getCategoryURL: string = "../api/ws/function/menu-tab/category/get";
    private _editCategoryURL: string = "../api/ws/function/menu-tab/category/edit";

    private _getItemListURL: string = "../api/ws/function/menu-tab/item/list";
    private _sortItemsURL: string = "../api/ws/function/menu-tab/item/sort";
    private _addItemURL: string = "../api/ws/function/menu-tab/item/create";
    private _getItemURL: string = "../api/ws/function/menu-tab/item/get";
    private _editItemURL: string = "../api/ws/function/menu-tab/item/edit";
    private _deleteItemURL: string = "../api/ws/function/menu-tab/item/delete";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }

    public getCategoryList(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getCategoryListURL + '/' + tabId);
    }

    public sortCategoryList(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortCategoriesURL, { ids: ids });
    }

    public deleteCategory(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteCategoryURL, { id: ids });
    }

    public addCategory(category: MenuCategory): Observable<APIResponse> {
        return this.dataService.postData(this._addCategoryURL, category);
    }

    public getCategory(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getCategoryURL + '/' + id);
    }

    public editCategory(category: MenuCategory): Observable<APIResponse> {
        return this.dataService.postData(this._editCategoryURL, category);
    }

    public getItemList(catId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getItemListURL + '/' + catId);
    }

    public sortItemList(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortItemsURL, { ids: ids });
    }

    public addMenuItem(item: MenuItem): Observable<APIResponse> {
        item.use_global_colors = +item.use_global_colors;
        return this.dataService.postData(this._addItemURL, item);
    }

    public getMenuItem(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getItemURL + '/' + id);
    }

    public editMenuItem(item: MenuItem): Observable<APIResponse> {
        item.use_global_colors = +item.use_global_colors;
        return this.dataService.postData(this._editItemURL, item);
    }

    public deleteMenuItem(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteItemURL, { id: ids });
    }

}