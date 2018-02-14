import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { Website, ImportFromItune, APIResponse, WebsiteTabSettings, Direction, MusicSetting, MusicsList, MusicHeaderImage} from '../../../../../theme/interfaces';

@Injectable()
export class MusicTabService {
    private _getTabDataURL: string = "../api/ws/function/music/init";
    private _saveSettingsURL: string = "../api/ws/function/website/musicSettings/save";
    private _getMusicList: string = "../api/ws/function/music/list";
    private _saveSingleMusicURL: string = "../api/ws/function/music/save";
    private _deleteMusicTrack: string = "../api/ws/function/music/delete";
    private _sortNumbersURL: string = "../api/ws/function/music/sort";
    private _saveHeaderImages: string = "../api/ws/function/music/uploadImage";
    private _getCountryListItunes: string = "../api/ws/function/music/isoCountryList";
    private _getMusicListFromItunes: string = "../api/ws/function/music/search/iTunes";
    private _saveTracksOfItune:string="../api/ws/function/music/import/iTunesTrack";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }
    public saveSettings(settings: MusicSetting, tab_id: number): Observable<APIResponse> {
        return this.dataService.postData(this._saveSettingsURL + '/' + tab_id, settings);
    }

    public getMusicList(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getMusicList + '/' + tabId);
    }
    public saveSingleMusic(singleMusicData: MusicsList) {
        return this.formDataService.postData(this._saveSingleMusicURL, singleMusicData);
    }
    public deleteMusicTrack(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteMusicTrack, { id: ids });
    }
    public sortNumberList(ids: number[]): Observable<any> {
        return this.dataService.postData(this._sortNumbersURL, { ids: ids });
    }
    public saveHeaderImages(headerImages: MusicHeaderImage): Observable<any> {
        console.log("headerImages", headerImages);
        return this.formDataService.postData(this._saveHeaderImages, headerImages);
    }
    public getCountryListItunes(): Observable<APIResponse> {
        return this.dataService.getData(this._getCountryListItunes);
    }
    public getSongsFromItune(importFromItune: ImportFromItune): Observable<APIResponse> {
        return this.dataService.postData(this._getMusicListFromItunes, importFromItune);
    }
    public importTrackOfItunes(importFromItune,tabId): Observable<APIResponse> {
     return this.dataService.postData(this._saveTracksOfItune,{tab_id:tabId,itune_list:importFromItune})
    }


}