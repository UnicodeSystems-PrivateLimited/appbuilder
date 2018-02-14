/**
 * Created by Akash on 04/10/16.
 */
import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse, ContentTabOneItem } from "../../../../../theme/interfaces/common-interfaces";

@Injectable()
export class ContentTabOneService {
    private _getTabDataURL: string = "../api/ws/function/content-tab-1/init";
    private _saveURL: string = "../api/ws/function/content-tab-1/save";
    private _colorUpdateURL: string = "../api/ws/function/content-tab-1/update-colors";
    private _deleteCommentURL: string = "../api/ws/function/content-tab-1/comment/delete";
    private _deleteImageURL: string = "../api/ws/function/content-tab-1/image/delete/";
   
    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }
     public saveContentTabOneItem(item: ContentTabOneItem|Object) {
        return this.formDataService.postData(this._saveURL, item);
    }
     public saveContentTabOneItemColor(item: ContentTabOneItem|Object) {
        return this.formDataService.postData(this._colorUpdateURL, item);
    }
     public deleteComment(commentId:Object) {
        return this.dataService.postData(this._deleteCommentURL, commentId);
    }
     public deleteImage(type:string,id:number) {
        return this.dataService.getData(this._deleteImageURL+type+"/"+id);
    }
   
}