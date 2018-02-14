import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse,RecurringEvents,  Settings, EventsList, ImageList, sort_by_manual, sort_by_time } from '../../../../../theme/interfaces';

@Injectable()
export class EventsTabService {
    /**SingleEvents URL */
    private _getTabDataURL: string = "../api/ws/function/eventsTab/init";
    private _saveSettingsURL: string = "../api/ws/function/eventsTab/settings/save";
    private _saveSingleEventURL: string = "../api/ws/function/eventsTab/events/save";
    private _deleteEventURL: string = "../api/ws/function/eventsTab/events/delete";
    private _sortEventsURL: string = "../api/ws/function/eventsTab/events/sort";
    private _getSingleEventURL: string = "../api/ws/function/eventsTab/events/info";
    private _deleteImageURL: string = "../api/ws/function/eventsTab/image/delete/";
    private _deleteCommentURL: string = "../api/ws/function/eventsTab/events/comment/delete";
    private _listCommentURL: string = "../api/ws/function/eventsTab/events/comment/list";
    private _getSingleEventContactURL: string = "../api/ws/function/eventsTab/events/contact/info";
    private _getEventsListURL: string = "../api/ws/function/eventsTab/events/list";
    private _deleteGoingURL: string = "../api/ws/function/eventsTab/events/going/delete";
    private _saveImageEventURL: string = "../api/ws/function/eventsTab/events/image/save";
    private _deleteEventImageURL: string = "../api/ws/function/eventsTab/events/image/delete";
    private _getImageEventURL: string = "../api/ws/function/eventsTab/events/image";
    private _sortImagesURL: string = "../api/ws/function/eventsTab/events/image/sort";

    /**Recurring events url */
    private _getRecurringEventsListURL: string = "../api/ws/function/eventsTab/recurring/events/list";
    private _deleteRecurringEventURL: string = "../api/ws/function/eventsTab/recurring/events/delete";
    private _sortRecurringEventsURL: string = "../api/ws/function/eventsTab/recurring/events/sort";
    private _saveRecurringEventURL: string = "../api/ws/function/eventsTab/recurring/events/save";
    private _getSingleRecurringEventURL: string = "../api/ws/function/eventsTab/recurring/events/info";
    private _deleteRecurringImageURL: string = "../api/ws/function/eventsTab/recurring/events/image/delete/";


    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number, sortBy: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId + '/' + sortBy);
    }
    /**Single events */
    public saveSettings(settings: Settings, tabId: number): Observable<APIResponse> {
        return this.dataService.postData(this._saveSettingsURL + '/' + tabId, settings);
    }
    public saveSingleEvent(singleEventData: EventsList) {
        singleEventData.imported_location = +singleEventData.imported_location;
        return this.formDataService.postData(this._saveSingleEventURL, singleEventData);
    }
    public deleteEvent(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteEventURL, { id: ids });
    }
    public sortEvents(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortEventsURL, { ids: ids });
    }
    public getSingleEventData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getSingleEventURL + '/' + id);
    }
    public deleteImage(imageType: string, id: number) {
        return this.dataService.getData(this._deleteImageURL + imageType + "/" + id);
    }
    public getCommentData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._listCommentURL + '/' + id);
    }
    public deleteComment(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteCommentURL, { id: ids });
    }
    public getSingleEventContactData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getSingleEventContactURL + '/' + id);
    }
    public getEventsList(tabId: number, sortBy: number): Observable<APIResponse> {
        return this.dataService.getData(this._getEventsListURL + '/' + tabId + '/' + sortBy);
    }
    public deleteGoing(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteGoingURL, { id: ids });
    }
    public saveImages(imageData: ImageList) {
        return this.formDataService.postData(this._saveImageEventURL, imageData);
    }
    public deleteEventImage(id: number) {
        return this.dataService.getData(this._deleteEventImageURL + "/" + id);
    }
    public getImageEventData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getImageEventURL + '/' + id);
    }
    public sortImages(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortImagesURL, { ids: ids });
    }
    /**Recurring events */
    public getRecurringEventsList(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getRecurringEventsListURL + '/' + tabId);
    }
    public deleteRecurringEvent(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteRecurringEventURL, { id: ids });
    }
    public sortRecurringEvents(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortRecurringEventsURL, { ids: ids });
    }
     public saveRecurringEvent(recurringEventData: RecurringEvents) {
        recurringEventData.imported_location = +recurringEventData.imported_location;
        return this.formDataService.postData(this._saveRecurringEventURL, recurringEventData);
    }
    public getSingleRecurringEventData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getSingleRecurringEventURL + '/' + id);
    }
     public deleteRecurringImage(imageType: string, id: number) {
        return this.dataService.getData(this._deleteRecurringImageURL + imageType + "/" + id);
    }
}