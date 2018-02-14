/**
 * Created by Akash on 04/10/16.
 */
import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse, VoiceRecordingTabItem } from "../../../../../theme/interfaces/common-interfaces";

@Injectable()
export class VoiceRecordingTabService {
    private _getTabDataURL: string = "../api/ws/function/voice-recording/init";
    private _saveURL: string = "../api/ws/function/voice-recording/save";
    private _getItemURL: string = "../api/ws/function/voice-recording/info/";

   
    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }
     public saveVoiceRecordingItem(item: VoiceRecordingTabItem|Object): Observable<APIResponse> {
        return this.dataService.postData(this._saveURL, item);
    }     
     public getVoiceRecordingItem(itemId): Observable<APIResponse> {
        return this.dataService.getData(this._getItemURL+itemId);
    }     

}