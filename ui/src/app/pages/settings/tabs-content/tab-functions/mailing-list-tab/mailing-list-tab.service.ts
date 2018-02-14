import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { Website, APIResponse, MailingList, MailingListCategory, MailChimp ,IContact} from '../../../../../theme/interfaces';

@Injectable()
export class MailingListTabService {

    private _getTabDataURL: string = "../api/ws/function/newsletter/init";
    private _getCategoryListURL: string = "../api/ws/function/newsletter/category/list";
    private _saveCategoryURL: string = "../api/ws/function/newsletter/category/create";
    private _deleteCatURL: string = "../api/ws/function/newsletter/category/delete";
    private _getCategoryDataURL: string = "../api/ws/function/newsletter/category/get";
    private _saveURL: string = "../api/ws/function/newsletter/settings/save";
    private _uploadConMailChimpURL: string = "../api/ws/function/newsletter/user/upload/mailChimp";
    private _uploadIcontactURL: string = "../api/ws/function/newsletter/user/upload/iContact";
    private _deleteImageURL: string = "../api/ws/function/newsletter/image/delete";
    private _getIContactAccountDetailsDataURL: string = "../api/ws/function/newsletter/iContact/accountId";
    private _getIContactClientFolderIdURL: string = "../api/ws/function/newsletter/iContact/folderId";
    private _getIContactClientListURL: string = "../api/ws/function/newsletter/iContact/lists";
    private _getMailDataURL: string = "../api/ws/function/newsletter/accounts/get";
    
    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }
    public save(mailingData: MailingList): Observable<APIResponse> {
        return this.formDataService.postData(this._saveURL, mailingData);
    }
    public deleteImage(id: number) {
        return this.dataService.getData(this._deleteImageURL + "/" + id);
    }

    public saveCategory(categoryData: MailingListCategory): Observable<APIResponse> {
        return this.dataService.postData(this._saveCategoryURL, categoryData);
    }
    public getCategoryList(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getCategoryListURL + '/' + tabId);
    }
    public deleteCategory(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteCatURL, { id: ids });
    }
    public getCategoryData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getCategoryDataURL + '/' + id);
    }
    public uploadConMailChimp(mailChimp: MailChimp): Observable<APIResponse> {
        return this.dataService.postData(this._uploadConMailChimpURL, mailChimp);
    }
    public uploadIcontact(iContact: IContact): Observable<APIResponse> {
        return this.dataService.postData(this._uploadIcontactURL, iContact);
    }
    public getIContactAccountDetails(iContact: IContact): Observable<APIResponse> {
        return this.dataService.postData(this._getIContactAccountDetailsDataURL, iContact);
    }
    public getIContactClientFolderId(iContact: IContact): Observable<APIResponse> {
        return this.dataService.postData(this._getIContactClientFolderIdURL, iContact);
    }
    public getIContactClientList(iContact: IContact): Observable<APIResponse> {
        return this.dataService.postData(this._getIContactClientListURL, iContact);
    }
    public getMailData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getMailDataURL + '/' + tabId);
    }
}