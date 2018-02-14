import { Component, ViewEncapsulation } from '@angular/core';
import { RouteParams } from '@angular/router-deprecated';
import { AppLiveService } from '../../settings/app-live/app-live.service';
import { IpaRequestAppListService } from '../ipa-request-app-list/ipa-request-app-list.service';
import { AppData, IpaRequest, PushNotificationKeyId } from '../../../theme/interfaces';
import { TabView, TabPanel, SelectItem } from 'primeng/primeng';
import { TOOLTIP_DIRECTIVES, TAB_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { DateTimeFormatPipe } from '../../../pipes/date-time-format.pipe';
import { PageService } from '../../../theme/services';

@Component({
    selector: 'app-info-view',
    directives: [TabView, TabPanel, TOOLTIP_DIRECTIVES, TAB_DIRECTIVES],
    styles: [require('../../settings/settings.scss')],
    encapsulation: ViewEncapsulation.None,
    template: require('./app-info-view.component.html'),
    pipes: [DateTimeFormatPipe],
    providers: [AppLiveService, IpaRequestAppListService]
})
export class AppInfoView {
    public appId: number = null;
    public appData: AppData = new AppData();
    public appIphoneFourScreenShot: any = {};
    public appIphoneFiveScreenShot: any = {};
    public appIphoneSixScreenShot: any = {};
    public appIphoneSixPlusScreenShot: any = {};
    public appTabletScreenShot: any = {};
    public showLoader: boolean = false;
    public requestedAppData: any = new IpaRequest();
    public appUpdateTypes: SelectItem[] = [{ label: 'All', value: 'All' }, { label: 'Itunes Update', value: 'Itunes Update' }, { label: 'Expedited Update', value: 'Expedited Update' }, { label: 'Standard App upload', value: 'Standard App upload' }, { label: 'Expedited upload', value: 'Expedited upload' }, { label: 'Tappit app review', value: 'Tappit app review' }, { label: 'App Build Service', value: 'App Build Service' }];
    public isPrepared: boolean = false;
    public preparedMessage: string = '';
    public text: string;
    public results: string[];
    public results_key: string[];
    public keyData: Array<string> = [];
    public serialkeyData: Array<string> = [];
    public serverKeyData: any = {};
    public serverKeyId: PushNotificationKeyId = new PushNotificationKeyId();

    constructor(private params: RouteParams, protected service: AppLiveService, private requestService: IpaRequestAppListService, private pageService: PageService) {
        this.appId = parseInt(params.get('appId'));
        this.getAppInfo();
        this.getScreenShots();
        this.getAppRequest();
        this.getServerId();
    }

    public getAppInfo(): void {
        this.showLoader = true;
        this.service.getAppData(this.appId).subscribe((res) => {
            if (res.success) {
                this.appData = res.data;
                this.appData.disable_comment = res.data.disable_comment == 1 ? true : false;
                this.appData.audio_bg_play = res.data.audio_bg_play == 1 ? true : false;
                this.appData.icon_name = res.data.icon_name;
            }
            this.showLoader = false;
        });
    }
    public getAppRequest(): void {
        this.requestService.getRequestByAppId(this.appId).subscribe((res) => {
            if (res.success) {
                //console.log("res", res);
                this.requestedAppData = res['requestData'][0];
            }
        });
    }
    public getScreenShots(): void {
        this.service.getScreenShot(this.appId).subscribe((res) => {
            if (res.success) {
                if (res.data) {
                    if (res.data.appIphoneFourScreenShot) {
                        this.appIphoneFourScreenShot = res.data.appIphoneFourScreenShot;
                    }
                    if (res.data.appIphoneSixScreenShot) {
                        this.appIphoneSixScreenShot = res.data.appIphoneSixScreenShot;
                    }
                    if (res.data.appIphoneSixPlusScreenShot) {
                        this.appIphoneSixPlusScreenShot = res.data.appIphoneSixPlusScreenShot;
                    }
                    if (res.data.appTabletScreenShot) {
                        this.appTabletScreenShot = res.data.appTabletScreenShot;
                    }
                    if (res.data.appIphoneFiveScreenShot) {
                        this.appIphoneFiveScreenShot = res.data.appIphoneFiveScreenShot;
                    }
                }
                else {
                    console.log('No data found');
                }
            }
        });
    }

    public onPrepareAppClick(): void {
        PageService.showLoader();
        this.service.prepareApp(this.appId).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.preparedMessage = "App prepared. Please proceed with Xcode.";
                this.pageService.showSuccess(this.preparedMessage);
                this.isPrepared = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }
    
    public getServerId(): void {
        this.service.getServerIdRequestDone(this.appId).subscribe((res) => {
            if (res.success) {
                this.serverKeyData = res.data.list;
                if(res.data.appkeydata) {
                    this.serverKeyId = res.data.appkeydata;
                }    
                for(let a in res.data.list) {
                    this.keyData.push(res.data.list[a].sender_id);
                    this.serialkeyData.push(res.data.list[a].server_key);
                }
            }
        });
    }
    
    selectSenderId() {
        for(let a in this.serverKeyData) {
            if(this.serverKeyData[a].sender_id == this.serverKeyId.sender_id) {
                this.serverKeyId.server_key = this.serverKeyData[a].server_key;
            }
        }
    }
    
    selectServerKey() {
        for(let a in this.serverKeyData) {
            if(this.serverKeyData[a].server_key == this.serverKeyId.server_key) {
                this.serverKeyId.sender_id = this.serverKeyData[a].sender_id;
            }
        }
    }

    public saveServerKeyData(): void {
        this.serverKeyId.app_id = this.appId;
        this.service.saveServerKey(this.serverKeyId).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.isPrepared = true;
                this.serverKeyId.id = res.data.id;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

}