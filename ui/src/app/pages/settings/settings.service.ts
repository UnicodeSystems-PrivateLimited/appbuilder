import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../theme/services';
import { SelectItem } from 'primeng/primeng';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { QrImgGenerationData } from '../../theme/interfaces/common-interfaces';

@Injectable()
export class SettingsService {

    private _getTabFuncsURL = '../api/ws/tab/list';
    private _getAppTabsForContentURL = '../api/ws/app/tab/content';
    private _getAppDetailsURL = '../api/ws/app/info';
    private _sortAppTabsURL = '../api/ws/app/tab/sort-content';
    private _getQrImgsURL = '../api/ws/function/qrCouponCode/generate';
    private _getAppSettingURL = "../api/ws/function/clientPermission/init";
    public static appSettingData: any[] = [];


    public tabFuncs: SelectItem[] = [];
    public error: any;
    public static tabBgImageSetting: any = { flag_iphone_img: 0, flag_phone_img: 0, flag_tablet_img: 0, appId: 0 };

    // public static simulatorBaseURL: string = 'http://localhost:8100';
    // public static simulatorBaseURL: string = 'http://tappit.ml/ion/';
    public static simulatorBaseURL: string = 'http://yourmobileschoolapp.us/ion/';

    public static isGeneratingScreenshots: boolean = false;
    public static screenshotGenerationBehaviour: BehaviorSubject<boolean>;

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
        SettingsService.screenshotGenerationBehaviour = new BehaviorSubject<boolean>(SettingsService.isGeneratingScreenshots);
    }

    public getError(): any {
        return this.error;
    }

    public getTabFunctionsList(): SelectItem[] {
        if (this.tabFuncs.length === 0) {
            this.dataService.getData(this._getTabFuncsURL).subscribe(res => {
                if (res.success) {
                    let funcs = res.data;
                    this.tabFuncs.push({ label: 'Select', value: '' });
                    for (let i in funcs) {
                        this.tabFuncs.push({ label: funcs[i].tab_name, value: funcs[i].id });
                    }
                }
            });
        }
        return this.tabFuncs;
    }

    public getAppTabsForContent(id: number): Observable<any> {
        return this.dataService.getData(this._getAppTabsForContentURL + '/' + id);
    }

    public getAppDetails(id: number): Observable<any> {
        return this.dataService.getData(this._getAppDetailsURL + '/' + id);
    }

    public sortAppTabsForContent(data: number[]): Observable<any> {
        return this.dataService.postData(this._sortAppTabsURL, { ids: data });
    }

    public getQrImgs(qrUrls: QrImgGenerationData) {
        return this.dataService.postData(this._getQrImgsURL, qrUrls);
    }
    public getAppSettings(appId: number): Observable<any> {
        return this.dataService.getData(this._getAppSettingURL + '/' + appId);
    }
}
