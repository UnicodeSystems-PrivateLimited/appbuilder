import { Injectable } from '@angular/core';
import { GridDataService, FormDataService, PageService } from '../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse, HomeScreenSettings, HomeScreenSubTab } from '../../../theme/interfaces';

@Injectable()
export class HomeScreenService {

    private _userImageInitUrl = '../api/ws/display/background-images/init';
    private _uploadUserImageUrl = '../api/ws/display/background-images/upload-user-image';
    private _updateBackgroundImageUrl = '../api/ws/display/background-images/update';
    private _getLibraryImagesUrl = '../api/ws/display/library/image-list';
    private _importLibImagesUrl = '../api/ws/display/background-images/import-lib-images';
    private initURL: string = "../api/ws/display/settings/init";
    private homeScreenSaveURL: string = "../api/ws/display/settings/home-screen/save";
    private getTabsURL: string = "../api/ws/app/tabs";
    private saveSliderImagesURL: string = "../api/ws/display/background-images/save-slider-images";
    private saveTabLinkAttachmentURL: string = "../api/ws/display/background-images/slider/link-tab";
    private _deleteSliderImageURL: string = "../api/ws/display/background-images/delete-slider-image";
    private setTabBackImageURL: string = "../api/ws/display/background-images/tabs-background-image";
    private _deleteTabBackImageURL: string = "../api/ws/display/background-images/delete-tab-background-image";
    private _getremoveHomeBackgroundImageUrl = '../api/ws/display/background-images/remove-home-background-image';
    private saveButtonBgImgURL: string = "../api/ws/display/settings/button-bg-img/save";
    private listButtonBgImgURL: string = "../api/ws/display/settings/button-bg-img/list";
    public deleteButtonBgImgURL: string = "../api/ws/display/settings/button-bg-img/delete";
    private saveHeaderBgImgURL: string = "../api/ws/display/settings/home-screen/header-bg-img/save";
    private listHeaderBgImgURL: string = "../api/ws/display/settings/home-screen/header-bg-img/list";
    private deleteHeaderBgImgURL: string = "../api/ws/display/settings/home-screen/header-bg-img/delete";
    private saveSubtabURL: string = "../api/ws/display/settings/home-screen/subtabs/save";
    private listSubTabsURL: string = "../api/ws/display/settings/home-screen/subtabs/list";
    private getSubTabURL: string = "../api/ws/display/settings/home-screen/subtabs/get";
    private sortSubTabsURL: string = "../api/ws/display/settings/home-screen/subtabs/sort";
    private deleteSubTabURL: string = "../api/ws/display/settings/home-screen/subtabs/delete";
    public homeScreenSettings: HomeScreenSettings = new HomeScreenSettings();
    public backgroundSetting = { setBackgroundButtonStatusActive: false, setTabBackgroundButtonStatusActive: [], userImageId: 0, sliderNo: [], isModernSliding: false, isTabModernSliding: false, sliderType: 1, tabSliderType: 1 };//used for background images
    public appData: any = {};//used for background images
    public homeScreenSliderData: any = [];//used for background images
    public userImages: any = [];//used for background images
    public homeScreenSettingsReady: boolean = false;
    public tabRowsIterator: number[] = [];
    public sliderDIsplaySettings = { slider: [] }//used for background images
    public sliderTabDIsplaySettings = { slider: [] }//used for background images
    public userImageInfo: any = [];//used for background images for phone
    public userImageTabInfo: any = [];//used for background images for tab
    public appTabs: any = [];//used for background images
    public disabledHomeScreenTabs: boolean[] = [];
    private _deleteUserImagesURL: string = "../api/ws/display/background-images/delete-user-images";
    public buttonBackgroundImageTarget: any = null;
    public buttonBackgroundImages;
    public buttonBgImageSrcs: string[] = [];
    public homeHeaderBackgroundImageTarget: any = null;
    public homeHeaderBackgroundImages;
    public homeHeaderBgImageSrcs: string[] = [];
    public app: any;
    public tabs: any = [];
    public subTabIcons: any = [];
    public subTabList: HomeScreenSubTab[] = [];
    public individualSettings: any = {};
    public tabIndex: number = 0;
    public phoneTabActive: boolean = true;
    public appId: number = null;
    public sliderLinkedTabIDs: number[] = [];
    constructor(
        private dataService: GridDataService,
        private formDataService: FormDataService,
        private pageService: PageService
    ) {
        this.appId = parseInt(sessionStorage.getItem('appId'));
    }

    public getInitData(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this.initURL + '/' + appId);
    }

    public saveSettings(homeScreenSettings: HomeScreenSettings): Observable<APIResponse> {
        let data = Object.assign({}, homeScreenSettings);
        return this.formDataService.postNestedData(this.homeScreenSaveURL, data);
    }
    ///////////////////////////background-services-start//////////////////////// 
    public userImagesOnInit(appId): Observable<any> {
        return this.dataService.getData(this._userImageInitUrl + "/" + appId);
    }
    public uplaodUserImage(data): Observable<any> {
        return this.formDataService.postData(this._uploadUserImageUrl, data);
    }
    public setBackgroundImage(data): Observable<any> {
        return this.dataService.postData(this._updateBackgroundImageUrl, data);
    }
    public getLibraryImages(): Observable<any> {
        return this.dataService.getData(this._getLibraryImagesUrl);
    }
    public getLibraryImagesByCategory(catId): Observable<any> {
        return this.dataService.getData(this._getLibraryImagesUrl + "/" + catId);
    }
    public importLibraryImagesToYourImages(data): Observable<any> {
        return this.dataService.postData(this._importLibImagesUrl, data);
    }
    public removeHomeBackgroundImage(appId: number, bgImageType: number): Observable<any> {
        return this.dataService.getData(this._getremoveHomeBackgroundImageUrl + "/" + appId + '/' + bgImageType);
    }

    public setSliderImage(data): Observable<any> {
        return this.dataService.postData(this.saveSliderImagesURL, data);
    }
    public setTabBackImage(data): Observable<any> {
        return this.dataService.postData(this.setTabBackImageURL, data);
    }
    public deleteTabBackImage(data): Observable<any> {
        return this.dataService.postData(this._deleteTabBackImageURL, data);
    }
    public deleteSliderImage(data): Observable<any> {
        return this.dataService.postData(this._deleteSliderImageURL, data);
    }
    ////////////////////////////////background-services-end/////////////////////////////////
    public getAllTabs(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this.getTabsURL + '/' + appId);
    }

    public initTabRowsIterator(): void {
        this.tabRowsIterator = [];
        for (let i = 0; i < this.homeScreenSettings.layout.traditional_rows; i++) {
            this.tabRowsIterator.push(i);
        }
    }

    public setUserImageInfo(): void {
        for (let i = 0; i < this.userImages.length; i++) {
            this.userImageInfo[this.userImages[i].id] = [];

            // for phone
            if (this.appData.home_screen_background_image == this.userImages[i].id) {

                this.userImageInfo[this.userImages[i].id].push('Home Screen');
            }

            for (let j = 0; j < this.homeScreenSliderData.length; j++) {
                if (this.homeScreenSliderData[j].image_id && this.homeScreenSliderData[j].image_id == this.userImages[i].id) {
                    this.userImageInfo[this.userImages[i].id].push('Slider ' + this.homeScreenSliderData[j].slider_no)
                }

            }
            for (let k = 0; k < this.appTabs.length; k++) {
                if (this.appTabs[k].background_image && this.appTabs[k].background_image == this.userImages[i].id) {
                    let title = this.appTabs[k].title.charAt(0).toUpperCase() + this.appTabs[k].title.substr(1);
                    this.userImageInfo[this.userImages[i].id].push(title)
                }

            }
            if (!this.userImageInfo[this.userImages[i].id].length) {
                delete this.userImageInfo[this.userImages[i].id];
            }
            // for tab

            this.userImageTabInfo[this.userImages[i].id] = [];
            if (this.appData.home_screen_tab_background_image == this.userImages[i].id) {

                this.userImageTabInfo[this.userImages[i].id].push('Home Screen');
            }

            for (let j = 0; j < this.homeScreenSliderData.length; j++) {
                if (this.homeScreenSliderData[j].tab_image_id && this.homeScreenSliderData[j].tab_image_id == this.userImages[i].id) {
                    this.userImageTabInfo[this.userImages[i].id].push('Slider ' + this.homeScreenSliderData[j].slider_no)
                }

            }
            for (let k = 0; k < this.appTabs.length; k++) {
                if (this.appTabs[k].tablet_bg_img && this.appTabs[k].tablet_bg_img == this.userImages[i].id) {
                    let title = this.appTabs[k].title.charAt(0).toUpperCase() + this.appTabs[k].title.substr(1);
                    this.userImageTabInfo[this.userImages[i].id].push(title)
                }

            }
            if (!this.userImageTabInfo[this.userImages[i].id].length) {
                delete this.userImageTabInfo[this.userImages[i].id];
            }
        }

    }

    public deleteUserImages(data): Observable<any> {
        return this.dataService.postData(this._deleteUserImagesURL, data);
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

    public uploadHeaderBackgroundImg(name: File, appId: number): Observable<any> {
        return this.formDataService.postData(this.saveHeaderBgImgURL, { name: name, app_id: appId });
    }

    public getHeaderBackrgroundImagesList(appId: number): Observable<any> {
        return this.dataService.getData(this.listHeaderBgImgURL + "/" + appId);
    }

    public deleteHeaderBackrgroundImage(id: number): Observable<any> {
        return this.dataService.getData(this.deleteHeaderBgImgURL + "/" + id);
    }

    public saveSubTab(subtab: HomeScreenSubTab): Observable<any> {
        subtab.active = +subtab.active;
        subtab.homescreen_only = +subtab.homescreen_only;
        return this.formDataService.postData(this.saveSubtabURL, subtab);
    }

    public listSubTabs(appId: number): Observable<APIResponse> {
        return this.dataService.getData(this.listSubTabsURL + "/" + appId);
    }

    public getSubTabData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this.getSubTabURL + "/" + id);
    }

    public sortSubTabs(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this.sortSubTabsURL, { ids: ids });
    }

    public deleteSubTab(id: number): Observable<APIResponse> {
        return this.dataService.getData(this.deleteSubTabURL + "/" + id);
    }
    public saveBackgroundImage() {

        console.log(this.backgroundSetting);
        console.log('slider data saving..');
        let imageId = this.backgroundSetting.userImageId;
        let sliderNo = this.backgroundSetting.sliderNo.join(',');
        let isModernSliding;
        let sliderType;
        if (this.phoneTabActive) {
            isModernSliding = this.backgroundSetting.isModernSliding ? 1 : 0;
            sliderType = this.backgroundSetting.sliderType;
        } else {
            isModernSliding = this.backgroundSetting.isTabModernSliding ? 1 : 0;
            sliderType = this.backgroundSetting.tabSliderType;
        }
        console.log('sliderNo data saving..', sliderNo);

        this.setSliderImage({ appId: this.appId, userImageId: imageId, sliderNo: sliderNo, isModernSliding: isModernSliding, sliderType: sliderType, sdImageType: (this.phoneTabActive ? 1 : 2) }).subscribe((res) => {
            console.log(res);
            if (res.success) {
                if (sliderNo) {
                    this.pageService.showSuccess(res.message[0]);
                }
                this.appData = res.data['app_data'];
                this.homeScreenSliderData = res.data['home_screen_sliders'];
                this.sliderDIsplaySettings.slider = [];
                this.sliderTabDIsplaySettings.slider = [];

                for (let i = 0; i < this.homeScreenSliderData.length; i++) {
                    this.sliderDIsplaySettings.slider[this.homeScreenSliderData[i].slider_no] = this.homeScreenSliderData[i].image_id;
                    this.sliderTabDIsplaySettings.slider[this.homeScreenSliderData[i].slider_no] = this.homeScreenSliderData[i].tab_image_id;
                }

                if (!(this.backgroundSetting.setBackgroundButtonStatusActive || this.backgroundSetting.setTabBackgroundButtonStatusActive.length)) {
                    this.backgroundSetting.userImageId = 0;
                }
                this.backgroundSetting.setBackgroundButtonStatusActive = false;
                this.backgroundSetting.sliderNo = [];
                this.backgroundSetting.isModernSliding = this.appData.is_modern_sliding ? true : false;
                this.backgroundSetting.sliderType = this.appData.slider_type ? this.appData.slider_type : 1;
                this.backgroundSetting.isTabModernSliding = this.appData.is_tab_modern_sliding ? true : false;
                this.backgroundSetting.tabSliderType = this.appData.tab_slider_type ? this.appData.tab_slider_type : 1;
                this.setUserImageInfo();
            } else {
                this.pageService.showError(res.message);
            }
        });

        if (this.backgroundSetting.userImageId) {
            if (this.backgroundSetting.setBackgroundButtonStatusActive) {
                console.log('background data saving..');
                let imageId = this.backgroundSetting.userImageId;
                this.setBackgroundImage({ appId: this.appId, imgId: imageId, bgImageType: (this.phoneTabActive ? 1 : 2) }).subscribe((res) => {
                    console.log(res);
                    if (res.success) {
                        this.pageService.showSuccess(res.message);
                        this.appData = res.data['app_data'];
                        if (!(this.backgroundSetting.setTabBackgroundButtonStatusActive.length || this.backgroundSetting.sliderNo.length)) {
                            this.backgroundSetting.userImageId = 0;
                        }
                        this.backgroundSetting.setBackgroundButtonStatusActive = false;
                        this.setUserImageInfo();
                    } else {
                        this.pageService.showError(res.message);
                    }
                });
            }



            if (this.backgroundSetting.setTabBackgroundButtonStatusActive.length) {
                console.log('tabs data saving..');
                let imageId = this.backgroundSetting.userImageId;
                let tabsId = this.backgroundSetting.setTabBackgroundButtonStatusActive.join(',');
                this.setTabBackImage({ appId: this.appId, userImageId: imageId, tabsId: tabsId, bgImageType: (this.phoneTabActive ? 1 : 2) }).subscribe((res) => {
                    console.log(res);
                    if (res.success) {
                        this.pageService.showSuccess(res.message[0]);
                        this.appData = res.data['app_data'];
                        this.appTabs = res.data['app_tabs_data'];

                        if (!(this.backgroundSetting.setBackgroundButtonStatusActive || this.backgroundSetting.sliderNo.length)) {
                            this.backgroundSetting.userImageId = 0;
                        }
                        this.backgroundSetting.setTabBackgroundButtonStatusActive = [];
                        this.setUserImageInfo();
                    }

                    else {
                        this.pageService.showError(res.message);
                    }
                });
            }
        }
        else {
            console.log("please select image");
        }
    }

    public saveTabLinkAttachment(appID: number, slideNo: number, linkedTabID: number): Observable<APIResponse> {
        return this.dataService.postData(this.saveTabLinkAttachmentURL, { appID: appID, slideNo: slideNo, linkedTabID: linkedTabID });
    }
}
