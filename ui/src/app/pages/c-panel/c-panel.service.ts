import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse, CPanelStepsSetting, CPanelThemeSetting, CPanelFooterSetting, CPanelHeaderSetting, CPanelLoginSetting, CPanelPreViewerSetting, UploadImage, CPanelData } from '../../theme/interfaces';

@Injectable()
export class CPanelService {

    private _getTabDataURL: string = "../api/ws/function/clientPermission/init";
    private _saveURL: string = "../api/ws/function/clientPermission/save";
    private _getClientLanguageURL: string = "../api/ws/function/clientPermission/languages";
    private _getThemeURL: string = "../api/ws/function/clientPermission/themes";
    private _getImageURL: string = "../api/ws/function/clientPermission/images";
    private _uplaodImageURL: string = "../api/ws/function/clientPermission/imageUpload";
    private _deleteImageURL: string = "../api/ws/function/clientPermission/image/delete";
    private _updateCmsImageURL: string = "../api/ws/function/clientPermission/updateCmsImages";
    private _getDefaultCMSData: string = "../api/ws/function/clientPermission/defaultCmsSettings";
    private _updateDefaultCMSData: string = "../api/ws/function/clientPermission/saveDefaultSetting"
    private _removeLoginBgImageUrl: string = "../api/ws/function/clientPermission/removeLoginBgImage";
    public static cStepsData: CPanelStepsSetting = new CPanelStepsSetting();
    public static cThemeData: CPanelThemeSetting = new CPanelThemeSetting();
    public static cFooterData: CPanelFooterSetting = new CPanelFooterSetting();
    public static cHeaderData: CPanelHeaderSetting = new CPanelHeaderSetting();
    public static cLoginData: CPanelLoginSetting = new CPanelLoginSetting();
    public static cPreViewerData: CPanelPreViewerSetting = new CPanelPreViewerSetting();
    public static allTheme: any[] = [];
    public static allThemeData: any[] = [];
    public static clientLanguage: any[] = [];
    public static loginBgImageTarget: any = null;
    public static loginBgImage: File = null;
    public static defaultCmsSettingButton: boolean = false;
    public static appId: number = null;
    public static refreshLoginComponent: boolean = false;
    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + appId);
    }

    public save(cpanelData: CPanelData): Observable<APIResponse> {
        return this.formDataService.postCPanelNestedData(this._saveURL, cpanelData);
    }

    public getLanguages(): Observable<APIResponse> {
        return this.dataService.getData(this._getClientLanguageURL);
    }

    public getThemes(): Observable<APIResponse> {
        return this.dataService.getData(this._getThemeURL);
    }

    public getImage(type: number): Observable<APIResponse> {
        return this.dataService.getData(this._getImageURL + '/' + type);
    }

    public uplaodImage(data: UploadImage): Observable<any> {
        return this.formDataService.postData(this._uplaodImageURL, data);
    }

    public deleteImage(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._deleteImageURL + '/' + id);
    }
    public updateCmsImages(data: any): Observable<APIResponse> {
        return this.dataService.postData(this._updateCmsImageURL, data);
    }

    public getLastSegmentFromUrl(url: string): string {
        let regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        if (regexp.test(url)) {
            return url.substr(url.lastIndexOf('/') + 1);
        } else {
            return url;
        }
    }

    public getDefaultCMSSettings(): Observable<APIResponse> {
        return this.dataService.getData(this._getDefaultCMSData);
    }
    public updateDefaultSettings(): Observable<APIResponse> {
        return this.dataService.getData(this._updateDefaultCMSData);
    }

    public removeLoginBgImage(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this._removeLoginBgImageUrl + '/' + appId);
    }
}