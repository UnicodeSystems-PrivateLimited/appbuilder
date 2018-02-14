/**
* Mobile View Component
* 
* 
*/
import { Component, ViewEncapsulation, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, Carousel, TabView, TabPanel, SelectItem } from 'primeng/primeng';
import { PageService, GridDataService } from '../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { AppState } from '../../app.state';
import { ThumbnailFileReader } from '../../components';
import { MobileViewService } from '../../services/mobile-view.service';
import { LuminosityCheckerPipe } from '../../pipes/luminosity-checker-pipe';
import { BackgroundImageSetting } from '../../theme/interfaces';
import { SettingsService } from '../../pages/settings/settings.service';
@Component({
        selector: 'mobile-view',
        pipes: [LuminosityCheckerPipe],
        directives: [TOOLTIP_DIRECTIVES, Dropdown, TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, TabView, TabPanel, Dialog, ThumbnailFileReader],
        encapsulation: ViewEncapsulation.None,
        template: require('./mobileView.html'),
        styles: [require('./mobileView.scss')],
        providers: [MobileViewService]
})

export class MobileViewComponent {
        @Input() tabId: number;
        @Input() isMembership: boolean = false;
        @Input() isGuestLogin: boolean = false;
        @Input() guestLoginName: string = null;
        @Input() loginColor: string = null;
        @Output() notify: EventEmitter<any> = new EventEmitter<any>();
        public categoryList: SelectItem[] = [];
        public backGroundImage: string = '';
        public appId: number = null;
        public addImages: boolean = false;
        public activeYourImagesTab: boolean = false;
        public importImageIds: any = [];
        public image: File = null;
        public libraryImages: any = [];
        public selectedCategory: number = 0;
        public userImages: any = [];
        public targetedImageId: number = null;
        public userImageInfo: any = [];
        public appData: any = {};//used for background images
        public homeScreenSliderData: any = [];//used for background images
        public appTabs: any = [];
        public tabData: any = {};
        public phoneTabActive: boolean = true;
        public tabletTabActive: boolean = false;
        public iphoneTabActive: boolean = false;
        public bgImageSettings: typeof SettingsService = SettingsService;
        private BGSETTINGUNCHECK: number = 0;
        private BGSETTINGCHECK: number = 1;

        constructor(private params: RouteParams, protected appState: AppState, public mobileViewService: MobileViewService, public pageService: PageService) {
                this.appId = parseInt(sessionStorage.getItem('appId'));

        }
        onClick() {
                this.notify.emit('Click from nested component');
        }
        ngOnInit() {
                console.log('tabId->', this.tabId);
                this.setTabData();
                console.log("bgImageSettings", this.bgImageSettings.tabBgImageSetting);
        }

        public changeBackgroundImage(activeYourImagesTab) {
                this.activeYourImagesTab = activeYourImagesTab;
                console.log(this.activeYourImagesTab);
                this.addImages = true;
                this.pageService.onDialogOpen();
                this.importImageIds = [];
                this.mobileViewService.userImagesOnInit(this.appId).subscribe((res) => {
                        if (res.success) {
                                this.userImages = res.data['user_images_list'];
                                this.appData = res.data['app_data'];
                                this.homeScreenSliderData = res.data['home_screen_sliders'];
                                this.appTabs = res.data['app_tabs_data'];
                                this.setUserImageInfo();
                                if (res.data.library_images_category_list && res.data.library_images_category_list.length) {
                                        this.categoryList.push({ label: 'Category', value: 0 });
                                        for (let i = 0; i < res.data.library_images_category_list.length; i++) {
                                                let name = res.data.library_images_category_list[i].name;
                                                let id = res.data.library_images_category_list[i].id;
                                                this.categoryList.push({ label: name, value: id });
                                        }
                                }
                        }
                });
                this.mobileViewService.getLibraryImages().subscribe((res) => {
                        if (res.success) {
                                this.libraryImages = res.data['library_images_list'];
                        }
                });

        }

        public selectedChange(event) {
                console.log('selectedChange');
                console.log(event.value);
                this.selectedCategory = event.value;
                if (this.selectedCategory) {
                        this.importImageIds = [];
                        this.mobileViewService.getLibraryImagesByCategory(this.selectedCategory).subscribe((res) => {
                                if (res.success) {
                                        this.libraryImages = res.data['category_image_list'];
                                        console.log('this.libraryImages', this.libraryImages);
                                }
                        });
                }
        }
        public importImage(id) {
                console.log(id);
                let index = this.importImageIds.indexOf(id);

                if (index >= 0) {
                        console.log('exist');
                        this.importImageIds.splice(index, 1);
                }
                else {
                        console.log('not exist');
                        this.importImageIds.push(id);
                }
        }
        public importLibraryImagesToYourImages() {
                if (this.importImageIds.length > 0) {
                        let data = { lib_images_id: this.importImageIds.join(','), app_id: this.appId }
                        console.log(data);
                        this.mobileViewService.importLibraryImagesToYourImages(data).subscribe((res) => {
                                if (res.success) {
                                        this.importImageIds = [];
                                        console.log('this.userImages', this.userImages);
                                        this.userImages = this.userImages.concat(res.data['imported_images']);
                                        console.log('this.userImages', this.userImages);
                                }
                        });
                }
        }
        public onImageSelect(evt) {
                let tgt = evt.target || window.event.srcElement;
                this.image = tgt.files[0];
                let data = { app_id: this.appId, name: this.image };
                this.mobileViewService.uplaodUserImage(data).subscribe((res) => {
                        if (res.success) {
                                this.userImages.push(res.data[0]);

                        }
                });
        }
        public targetImage(imageId) {
                this.targetedImageId = imageId;
                console.log('targetImage ', this.targetedImageId);
        }
        public SaveMyChoice() {
                console.log('SaveMyChoice ', this.targetedImageId);
                let postData = { appId: this.appId, tabsId: this.tabId, userImageId: this.targetedImageId, bgImageType: (this.phoneTabActive ? 1 : (this.tabletTabActive ? 2 : 3)) }
                console.log(postData, "postData");
                this.mobileViewService.setTabBackImage(postData).subscribe((res) => {
                        console.log(res);
                        if (res.success) {
                                this.pageService.showSuccess(res.message[0]);
                                this.appData = res.data['app_data'];
                                this.appTabs = res.data['app_tabs_data'];
                                this.setUserImageInfo();
                                this.setTabData();
                                this.addImages = false;
                                this.targetedImageId = null;
                        }

                        else {
                                this.pageService.showError(res.message);
                        }
                });

        }
        public removeTabBackgroundImage() {

                if (!confirm("Are you sure you want to remove this item ?")) {
                        return;
                }
                this.mobileViewService.deleteTabBackImage({ appId: this.appId, tabId: this.tabId, bgImageType: (this.phoneTabActive ? 1 : (this.tabletTabActive ? 2 : 3)) }).subscribe((res) => {
                        console.log(res);
                        if (res.success) {
                                this.pageService.showSuccess(res.message[0]);
                                this.appTabs = res.data['app_tabs_data'];
                                this.setUserImageInfo();
                                this.setTabData();
                        }

                        else {
                                this.pageService.showError(res.message);
                        }
                });

        }
        public deleteTargetedImage() {
                if (!confirm("Are you sure you want to remove this item ?")) {
                        return;
                }
                let postData = { appId: this.appId, imgIds: this.targetedImageId, bgImageType: (this.phoneTabActive ? 1 : (this.tabletTabActive ? 2 : 3)) }
                console.log('deleteTargetedImage ', this.targetedImageId);
                this.mobileViewService.deleteUserImages(postData).subscribe((res) => {
                        if (res.success) {
                                this.pageService.showSuccess(res.message[0]);
                                this.userImages = res.data['user_images_list'];
                                this.appData = res.data['app_data'];
                                this.homeScreenSliderData = res.data['home_screen_sliders'];
                                this.appTabs = res.data['app_tabs_data'];
                                this.setUserImageInfo();
                                this.setTabData();
                                this.targetedImageId = null;
                        }

                        else {
                                this.pageService.showError(res.message);
                        }
                });

        }

        private setUserImageInfo(): void {
                for (let i = 0; i < this.userImages.length; i++) {
                        this.userImageInfo[this.userImages[i].id] = [];
                        if ((this.tabletTabActive ? this.appData.home_screen_tab_background_image : this.appData.home_screen_background_image) == this.userImages[i].id) {

                                this.userImageInfo[this.userImages[i].id].push('Home Screen');
                        }

                        for (let j = 0; j < this.homeScreenSliderData.length; j++) {
                                if (this.phoneTabActive || this.iphoneTabActive) {
                                        if (this.homeScreenSliderData[j].image_id && this.homeScreenSliderData[j].image_id == this.userImages[i].id) {
                                                this.userImageInfo[this.userImages[i].id].push('Slider ' + this.homeScreenSliderData[j].slider_no)
                                        }
                                } else {
                                        if (this.homeScreenSliderData[j].tab_image_id && this.homeScreenSliderData[j].tab_image_id == this.userImages[i].id) {
                                                this.userImageInfo[this.userImages[i].id].push('Slider ' + this.homeScreenSliderData[j].slider_no)
                                        }
                                }

                        }
                        for (let k = 0; k < this.appTabs.length; k++) {
                                if (this.phoneTabActive) {
                                        if (this.appTabs[k].background_image && this.appTabs[k].background_image == this.userImages[i].id) {
                                                let title = this.appTabs[k].title.charAt(0).toUpperCase() + this.appTabs[k].title.substr(1);
                                                this.userImageInfo[this.userImages[i].id].push(title)
                                        }
                                }
                                if (this.tabletTabActive) {
                                        if (this.appTabs[k].tablet_bg_img && this.appTabs[k].tablet_bg_img == this.userImages[i].id) {
                                                let title = this.appTabs[k].title.charAt(0).toUpperCase() + this.appTabs[k].title.substr(1);
                                                this.userImageInfo[this.userImages[i].id].push(title)
                                        }
                                }
                                if (this.iphoneTabActive) {
                                        if (this.appTabs[k].iphone_bg_img && this.appTabs[k].iphone_bg_img == this.userImages[i].id) {
                                                let title = this.appTabs[k].title.charAt(0).toUpperCase() + this.appTabs[k].title.substr(1);
                                                this.userImageInfo[this.userImages[i].id].push(title)
                                        }
                                }


                        }
                        if (!this.userImageInfo[this.userImages[i].id].length) {
                                delete this.userImageInfo[this.userImages[i].id];
                        }
                }

        }
        private setTabData() {
                this.mobileViewService.getTabBackgroundImage(this.tabId).subscribe((res) => {
                        if (res.success) {
                                this.tabData = res.data['tab_data'];
                        }
                });
        }
        public selectedTab(e: any): void {
                if (e.heading == "PHONE") {
                        this.iphoneTabActive = false;
                        this.tabletTabActive = false;
                        this.phoneTabActive = true;
                }
                if (e.heading == "TABLET") {
                        this.iphoneTabActive = false;
                        this.tabletTabActive = true;
                        this.phoneTabActive = false;
                }
                if (e.heading == "IPHONE 4") {
                        this.iphoneTabActive = true;
                        this.tabletTabActive = false;
                        this.phoneTabActive = false;
                }
        }

        public onCheckBgImageSetting(event: any, bgType: number): void {
                switch (bgType) {
                        case 1:
                                SettingsService.tabBgImageSetting.flag_phone_img = !SettingsService.tabBgImageSetting.flag_phone_img ? this.BGSETTINGCHECK : this.BGSETTINGUNCHECK;
                                SettingsService.tabBgImageSetting.flag_tablet_img = SettingsService.tabBgImageSetting.flag_tablet_img ? this.BGSETTINGCHECK : this.BGSETTINGUNCHECK;
                                SettingsService.tabBgImageSetting.flag_iphone_img = (SettingsService.tabBgImageSetting.flag_phone_img && SettingsService.tabBgImageSetting.flag_iphone_img) ? this.BGSETTINGUNCHECK : (SettingsService.tabBgImageSetting.flag_iphone_img ? this.BGSETTINGCHECK : this.BGSETTINGUNCHECK);
                                break;
                        case 2:
                                SettingsService.tabBgImageSetting.flag_phone_img = SettingsService.tabBgImageSetting.flag_phone_img ? this.BGSETTINGCHECK : this.BGSETTINGUNCHECK;
                                SettingsService.tabBgImageSetting.flag_tablet_img = !SettingsService.tabBgImageSetting.flag_tablet_img ? this.BGSETTINGCHECK : this.BGSETTINGUNCHECK;
                                SettingsService.tabBgImageSetting.flag_iphone_img = SettingsService.tabBgImageSetting.flag_iphone_img ? this.BGSETTINGCHECK : this.BGSETTINGUNCHECK;
                                break;
                        case 3:
                                SettingsService.tabBgImageSetting.flag_tablet_img = SettingsService.tabBgImageSetting.flag_tablet_img ? this.BGSETTINGCHECK : this.BGSETTINGUNCHECK;
                                SettingsService.tabBgImageSetting.flag_iphone_img = !SettingsService.tabBgImageSetting.flag_iphone_img ? this.BGSETTINGCHECK : this.BGSETTINGUNCHECK;
                                SettingsService.tabBgImageSetting.flag_phone_img = (SettingsService.tabBgImageSetting.flag_phone_img && SettingsService.tabBgImageSetting.flag_iphone_img) ? this.BGSETTINGUNCHECK : (SettingsService.tabBgImageSetting.flag_phone_img ? this.BGSETTINGCHECK : this.BGSETTINGUNCHECK);
                                break;
                }
                SettingsService.tabBgImageSetting.appId = this.appId;
                this.mobileViewService.setTabBackImageSetting(SettingsService.tabBgImageSetting).subscribe((res) => {
                        if (res.success) {
                                this.pageService.showSuccess(res.message);
                        } else {
                                this.pageService.showError('Error: Unable to save this setting');
                        }
                });
        }

}
