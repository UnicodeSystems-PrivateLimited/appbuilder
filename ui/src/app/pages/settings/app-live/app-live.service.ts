import { Injectable } from '@angular/core';
import { GridDataService, FormDataService} from '../../../theme/services';
import { Observable, }    from 'rxjs/Observable';
import { APIResponse, AppData, AppScreenShot, AppPublish, PushNotificationKeyId } from '../../../theme/interfaces';

@Injectable()
export class AppLiveService {

    private _getAppInfo = '../api/ws/app/info';
    private _saveAppURL: string = '../api/ws/app/update';
    private _saveAppPublishURL: string = '../api/ws/app/publish/save';
    private _saveIconURL: string = '../api/ws/app/icon/upload';
    private _saveSplashURL: string = '../api/ws/app/splash-screen/upload';
    private _saveScreenShotURL: string = '../api/ws/app/screen-shot/upload';
    private _deleteImageURL: string = "../api/ws/app/icon/delete";
    private _deleteSplashImageURL: string = "../api/ws/app/splash-screen/delete";
    private _deleteScreenShotURL: string = "../api/ws/app/screen-shot/delete";
    private _getScreenURL = '../api/ws/app/screen-shot/get';
    private generateScreenShotsURL: string = "../api/ws/app/screen-shot/generate";
    private screenShotGenerationStatusURL: string = "../api/ws/app/screen-shot/generate/status";
    private getPublishURL: string = "../api/ws/app/publish/info";
    private prepareAppURL: string = "../api/ws/app/prepare";
    private _getServerIdDataUrl: string = "../api/ws/app/serverkey";
    private _saveServerKeyURL: string = '../api/ws/app/serverkey/save';

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getAppData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getAppInfo + '/' + id);
    }
    public saveApp(id: number, appData: AppData): Observable<APIResponse> {
        return this.dataService.postData(this._saveAppURL + '/' + id, appData);
    }
    public uploadIcon(id: number, icon_name: any): Observable<APIResponse> {
        return this.formDataService.postData(this._saveIconURL + '/' + id, { icon_name: icon_name });
    }

    public deleteImage(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._deleteImageURL + '/' + id);
    }

    public uploadScreenShot(appScreenShot: AppScreenShot): Observable<APIResponse> {
        return this.formDataService.postData(this._saveScreenShotURL, appScreenShot);
    }

    public getScreenShot(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getScreenURL + '/' + id);
    }

    public uploadSplashScreen(id: number, phone_splash_screen: string, tablet_splash_screen: string, iphone_splash_screen: string): Observable<APIResponse> {
        return this.formDataService.postData(this._saveSplashURL + '/' + id, { phone_splash_screen: phone_splash_screen, tablet_splash_screen: tablet_splash_screen, iphone_splash_screen: iphone_splash_screen });
    }

    public deleteSplashImage(imageType: string, id: number) {
        return this.dataService.getData(this._deleteSplashImageURL + '/' + imageType + "/" + id);
    }

    public deleteScreenShot(imageType: number, imageName: string, appId: number) {
        return this.dataService.getData(this._deleteScreenShotURL + '/' + imageType + "/" + imageName + '/' + appId);
    }

    public saveAppPublish(id: number, appPublish: AppPublish): Observable<APIResponse> {
        return this.dataService.postData(this._saveAppPublishURL, appPublish);
    }

    public generateScreenshots(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this.generateScreenShotsURL + "/" + appId);
    }

    public getScreenshotGenerationStatus(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this.screenShotGenerationStatusURL + "/" + appId);
    }
    public getPublishInfo(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this.getPublishURL + "/" + appId);
    }

    public prepareApp(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this.prepareAppURL + "/" + appId);
    }
    
    public getServerIdRequestDone(app_id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getServerIdDataUrl + "/" + app_id);
    }
    public saveServerKey(data: PushNotificationKeyId): Observable<APIResponse> {
        return this.dataService.postData(this._saveServerKeyURL, data);
    }
}