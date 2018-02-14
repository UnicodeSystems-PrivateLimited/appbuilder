import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse, GlobalStyleSettings, TabData, GlobalStyleIndividualTabs } from '../../../theme/interfaces';
import {  SelectItem, Dropdown } from 'primeng/primeng';

@Injectable()
export class GlobalStyleService {

    private initURL: string = "../api/ws/display/settings/global-style/init";
    private globalStyleSaveURL: string = "../api/ws/display/settings/global-style/save";
    private saveHeaderBgImgURL: string = "../api/ws/display/settings/header-bg-img/save";
    private listHeaderBgImgURL: string = "../api/ws/display/settings/header-bg-img/list";
    public deleteHeaderBgImgURL: string = "../api/ws/display/settings/header-bg-img/delete";
    public _geThemeURL: string = "../api/ws/display/settings/color-theme/get";
    public _geFontURL: string = "../api/ws/display/settings/font-family/get";
    private _getBlackIconsURL: string = '../api/ws/app/tab/icon/black';
    private _getWhiteIconsURL: string = '../api/ws/app/tab/icon/white';
    private _getAppTabInfoURL: string = '../api/ws/app/tab/info';
    private _editAppTabURL: string = '../api/ws/app/tab/update';
    private individualAppearanceSaveURL: string = "../api/ws/display/settings/global-style/individual-tab/save";
    private saveButtonBgImgURL: string = "../api/ws/display/settings/button-bg-img/save";
    private listButtonBgImgURL: string = "../api/ws/display/settings/button-bg-img/list";
    public deleteButtonBgImgURL: string = "../api/ws/display/settings/button-bg-img/delete";
    private getAppearanceURL: string = "../api/ws/display/settings/home-screen/get";
    private _deleteSettingsURL: string = "../api/ws/display/settings/global-style/individual-tab/delete";
    public globalStyleSettings: GlobalStyleSettings = new GlobalStyleSettings();
    public individualTabSettings: GlobalStyleIndividualTabs = new GlobalStyleIndividualTabs();
    public tabData: TabData = new TabData();
    public appTabs: any = []
    public globalStyleSettingsReady: boolean = false;
    public headerBackgroundImageTarget: any = null;
    public headerBackgroundImages;
    public buttonBackgroundImageTarget: any = null;
    public buttonBackgroundImages;
    public buttonBgImageSrcs: string[] = [];
    public headerBgImageSrcs: string[] = [];
    public color_theme = [];
    public font_list = [];
    public colorTheme = [];
    public editDialog: boolean = false;
    public font_value: string[]=[];
    public appTabIconSrc: string = '';
    public editImageTarget = null;
    public APPS_TAB_STATUS_ENABLED: number = 1;
    public APPS_TAB_STATUS_DISABLED: number = 2;
    public globalBlurCheckAll: boolean = false;
    public overlayDisplay: string = "block";
    //------------------------ ICON PAGINATION --------------------
    public blackIconsPager: any = {
        total: 0,
        currentPage: 1,
        itemsPerPage: 8
    };
    public whiteIconsPager: any = {
        total: 0,
        currentPage: 1,
        itemsPerPage: 8
    };
    //-------------------------------------------------------------
    public blackIcons: Object[] = [];
    public whiteIcons: Object[] = [];
    public iconSelect: boolean[] = [];

    constructor(
        private dataService: GridDataService,
        private formDataService: FormDataService
    ) {
    }

    public getInitData(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this.initURL + '/' + appId);
    }

    public save(globalStyleSettings: GlobalStyleSettings): Observable<APIResponse> {
        let data = Object.assign({}, globalStyleSettings);
        return this.formDataService.postNestedData(this.globalStyleSaveURL, data);
    }

    public uploadHeaderBackgroundImg(name: File, appId: number): Observable<any> {
        return this.formDataService.postData(this.saveHeaderBgImgURL, { name: name, app_id: appId });
    }

    public getHeaderBackrgroundImagesList(appId: number): Observable<any> {
        return this.dataService.getData(this.listHeaderBgImgURL + "/" + appId);
    }

    public deleteHeaderBgImage(id: number): Observable<any> {
        return this.dataService.getData(this.deleteHeaderBgImgURL + "/" + id);
    }

    public getSingleThemeData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._geThemeURL + '/' + id);
    }

    public getSingleFontData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._geFontURL + '/' + id);
    }
    public getTabData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getAppTabInfoURL + '/' + id);
    }

    public saveIndividualTab(tabData: TabData): Observable<APIResponse> {
        return this.formDataService.postData(this._editAppTabURL, tabData);
    }

    public saveIndividualTabAppearance(individualTabSettings: GlobalStyleIndividualTabs): Observable<APIResponse> {
        let data = Object.assign({}, individualTabSettings);
        return this.formDataService.postNestedData(this.individualAppearanceSaveURL, data);
    }
    public getIndividualTabAppearance(tab_id: number): Observable<APIResponse> {
        return this.dataService.getData(this.getAppearanceURL + '/' + tab_id);
    }

    public uploadButtonBackgroundImg(name: File, appId: number): Observable<any> {
        return this.formDataService.postData(this.saveButtonBgImgURL, { name: name, app_id: appId });
    }

    public getButtonBackrgroundImagesList(appId: number): Observable<any> {
        return this.dataService.getData(this.listButtonBgImgURL + "/" + appId);
    }

    public deleteButtonBackrgroundImage(id: number): Observable<any> {
        return this.dataService.getData(this.deleteButtonBgImgURL + "/" + id);
    }
     public deleteIndividualSettings(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteSettingsURL, { id: ids });
    }
}
