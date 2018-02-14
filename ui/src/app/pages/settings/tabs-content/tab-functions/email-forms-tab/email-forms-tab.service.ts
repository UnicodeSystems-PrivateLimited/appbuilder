import { Injectable, Inject } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { PhoneNumber, APIResponse, EmailForm, FormField, DeletedField, EmailFormData } from '../../../../../theme/interfaces';

@Injectable()
export class EmailFormsService {

    private initURL: string = "../api/ws/function/email-forms-tab/init";
    private saveFormURL: string = "../api/ws/function/email-forms-tab/save";
    private getFormURL: string = "../api/ws/function/email-forms-tab/get";
    private sortFormsURL: string = "../api/ws/function/email-forms-tab/sort";
    private deleteFormURL: string = "../api/ws/function/email-forms-tab/delete";
    private getFieldsURL: string = "../api/ws/function/email-forms-entry/list";
    private getYearURL: string = "../api/ws/function/email-forms-tab/statistics/year/data";
    private getMonthURL: string = "../api/ws/function/email-forms-tab/statistics/year/month/data";
    private getDayURL: string = "../api/ws/function/email-forms-tab/statistics/year/month/day/data";
    private getTwelveMonthURL: string = "../api/ws/function/email-forms-tab/statistics/twelve/month/data";
    private deleteEntryURL: string = "../api/ws/function/email-forms-entry/delete";
    private _saveEmailFormDataURL: string = "../api/ws/function/email-forms-tab/save-email-form-data";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this.initURL + '/' + tabId);
    }

    public saveForm(form: EmailForm, fields: FormField[], deletedField: DeletedField[]): Observable<APIResponse> {
        let data = { form: form, fields: fields, deletedField: deletedField };
        return this.dataService.postData(this.saveFormURL, data);
    }

    public getForm(id: number): Observable<APIResponse> {
        return this.dataService.getData(this.getFormURL + '/' + id);
    }

    public sortForms(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this.sortFormsURL, { ids: ids });
    }

    public deleteForm(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this.deleteFormURL, { id: ids });
    }

    public listEmailFormEntries(id: number): Observable<APIResponse> {
        return this.dataService.getData(this.getFieldsURL + '?form_id=' + id);
    }

    public deleteEntry(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this.deleteEntryURL, { id: ids });
    }
    public saveFormData(emailFormData: EmailFormData) {
        return this.formDataService.postFormNestedData(this._saveEmailFormDataURL, emailFormData);
    }
     public getYearStatistcis(id: number,year:any): Observable<APIResponse> {
        return this.dataService.getData(this.getYearURL + '/' + id + '/' + year);
    }
     public getMonthStatistcis(id: number,year:any,month:any): Observable<APIResponse> {
        return this.dataService.getData(this.getMonthURL + '/' + id + '/' + year + '/' + month);
    }
     public getDayStatistcis(id: number,year:any,month:any,day:any): Observable<APIResponse> {
        return this.dataService.getData(this.getDayURL + '/' + id + '/' + year + '/' + month + '/' + day);
    }
     public getTwelveMonthStatistics(id: number): Observable<APIResponse> {
        return this.dataService.getData(this.getTwelveMonthURL + '/' + id);
    }
}