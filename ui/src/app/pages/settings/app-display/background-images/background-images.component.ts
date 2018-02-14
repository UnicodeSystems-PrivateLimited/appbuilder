import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Router, RouteConfig, ROUTER_DIRECTIVES, RouteParams } from '@angular/router-deprecated';
import { TabView, TabPanel } from 'primeng/primeng';
import { Dragula } from 'ng2-dragula/ng2-dragula';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { Dialog, Dropdown, Carousel } from 'primeng/primeng';
import { SelectItem } from 'primeng/primeng';
import { GridDataService, PageService } from '../../../../theme/services';
import { ControlGroup, AbstractControl, FORM_DIRECTIVES, Validators, FormBuilder } from '@angular/common';
import { AppState } from '../../../../app.state';
import { BaCard } from '../../../../theme/components';
import { HomeScreenService } from '../home-screen.service';
import { DomSanitizationService } from "@angular/platform-browser";
import { ThumbnailFileReader } from '../../../../components';


@Component({
    selector: 'background-images',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES,TabView, TabPanel, Dropdown, Dialog, TAB_DIRECTIVES, ThumbnailFileReader],
    template: require('./background-images.component.html'),

})

export class BackgroundImages {
    sliding: SelectItem[];
    slidingTab: SelectItem[];
    public categoryList: SelectItem[] = [];
    public selectedSlide = 4;
    public selectedTabSlide = 4;
    public selectedCategory: number = 0;
    public addImages: boolean = false;
    public addAttachMent: boolean = false;
    public appId: number = null;
    public image: File = null;
    public libraryImages: any = [];
    public showLoader: boolean = false;
    public importImageIds = [];
    public targetedImageIds: Array<number> = [];
    public bgImageType: number = 1;
    public showLinkEditorDialog: boolean = false;
    public linkAttachSlideNo: number;
    public sliderLinkTabID: number;
    public tabLinkOptions: SelectItem[] = [];
    public linkSettingSaveDisable: boolean = false;

    constructor(private params: RouteParams, public homeScreenService: HomeScreenService, protected appState: AppState, protected pageService: PageService) {
        this.appId = parseInt(sessionStorage.getItem('appId'));
        this.sliding = [];
        this.sliding.push({ label: 'Manual Swipe', value: 1 });
        this.sliding.push({ label: 'Sliding', value: 2 });
        this.sliding.push({ label: 'Fade', value: 3 });
        this.userImagesOnInit();
    }

    public onAddImageClick(): void {
        this.addImages = true;
        this.pageService.onDialogOpen();
        this.importImageIds = [];
        this.showLoader = true;
        this.homeScreenService.getLibraryImages().subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.libraryImages = res.data['library_images_list'];
                console.log('this.homeScreenService.userImages', this.libraryImages);
            }

        });
    }

    public userImagesOnInit() {
        console.log('init calling..');
        this.homeScreenService.userImagesOnInit(this.appId).subscribe((res) => {
            if (res.success) {
                this.homeScreenService.userImages = res.data['user_images_list'];
                this.homeScreenService.appData = res.data['app_data'];
                this.homeScreenService.homeScreenSliderData = res.data['home_screen_sliders'];
                this.homeScreenService.appTabs = res.data['app_tabs_data'];
                this.homeScreenService.backgroundSetting.sliderNo = [];
                this.homeScreenService.backgroundSetting.isModernSliding = this.homeScreenService.appData.is_modern_sliding ? true : false;
                this.homeScreenService.backgroundSetting.sliderType = this.homeScreenService.appData.slider_type ? this.homeScreenService.appData.slider_type : 1;
                this.selectedSlide = this.homeScreenService.backgroundSetting.sliderType;
                this.homeScreenService.backgroundSetting.isTabModernSliding = this.homeScreenService.appData.is_tab_modern_sliding ? true : false;
                this.homeScreenService.backgroundSetting.tabSliderType = this.homeScreenService.appData.tab_slider_type ? this.homeScreenService.appData.tab_slider_type : 1;
                this.selectedTabSlide = this.homeScreenService.backgroundSetting.tabSliderType;
                this.homeScreenService.setUserImageInfo();
                console.log('this.homeScreenService.userImageInfo', this.homeScreenService.userImageInfo)
                if (this.homeScreenService.backgroundSetting.isModernSliding) {
                    this.sliding = [];
                    this.sliding.push({ label: 'Manual Swipe', value: 1 });
                    this.sliding.push({ label: 'Parallax', value: 4 });
                    this.sliding.push({ label: 'Ken Burns', value: 5 });
                }
                if (this.homeScreenService.appTabs) {
                    for (let i = 0; i < this.homeScreenService.appTabs.length; i++) {
                        this.tabLinkOptions.push({
                            label: this.homeScreenService.appTabs[i].title,
                            value: this.homeScreenService.appTabs[i].id
                        });
                    }
                }
                this.homeScreenService.sliderDIsplaySettings.slider = [];

                for (let i = 0; i < this.homeScreenService.homeScreenSliderData.length; i++) {
                    this.homeScreenService.sliderDIsplaySettings.slider[this.homeScreenService.homeScreenSliderData[i].slider_no] = this.homeScreenService.homeScreenSliderData[i].image_id;
                    this.homeScreenService.sliderLinkedTabIDs[this.homeScreenService.homeScreenSliderData[i].slider_no] = this.homeScreenService.homeScreenSliderData[i].linked_tab_id;
                }

                if (res.data.library_images_category_list && res.data.library_images_category_list.length) {
                    this.categoryList.push({ label: 'Category', value: 0 });

                    for (let i = 0; i < res.data.library_images_category_list.length; i++) {
                        let name = res.data.library_images_category_list[i].name;
                        let id = res.data.library_images_category_list[i].id;
                        // console.log('name ', name, ' id ', id);
                        this.categoryList.push({ label: name, value: id });
                    }
                }
            }
        });
    }
    public onImageSelect(evt) {
        let tgt = evt.target || window.event.srcElement;
        this.image = tgt.files[0];
        let data = { app_id: this.appId, name: this.image };
        this.showLoader = true;
        this.homeScreenService.uplaodUserImage(data).subscribe((res) => {
            if (res.success) {
                this.homeScreenService.userImages.push(res.data[0]);
                this.pageService.showSuccess(res.success);
            } else {
                this.pageService.showError(res.message);
            }
            this.showLoader = false;
        });
    }
    public setBackgroundImage(id) {
        this.homeScreenService.backgroundSetting.userImageId = id;
    }
    public setBackgroundButtonStatus() {
        console.log(this.homeScreenService.backgroundSetting.setBackgroundButtonStatusActive);
        this.homeScreenService.backgroundSetting.setBackgroundButtonStatusActive = !this.homeScreenService.backgroundSetting.setBackgroundButtonStatusActive;
        console.log(this.homeScreenService.backgroundSetting.setBackgroundButtonStatusActive);

    }
    public selectedChange(event) {
        console.log('selectedChange');
        console.log(event.value);
        this.selectedCategory = event.value;
        if (this.selectedCategory) {
            this.importImageIds = [];
            this.homeScreenService.getLibraryImagesByCategory(this.selectedCategory).subscribe((res) => {
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

        if (index != -1) {
            console.log('exist');
            this.importImageIds.splice(index, 1);
        }
        else {
            console.log('not exist');
            this.importImageIds.push(id);
        }
        console.log('this.importImageIds');
        console.log(this.importImageIds);
    }

    public importLibraryImagesToYourImages() {
        if (this.importImageIds.length > 0) {
            let data = { lib_images_id: this.importImageIds.join(','), app_id: this.appId }
            console.log(data);
            this.homeScreenService.importLibraryImagesToYourImages(data).subscribe((res) => {
                if (res.success) {
                    let message = this.importImageIds.length > 1 ? this.importImageIds.length + ' Images imported successfully!' : this.importImageIds.length + ' Image imported successfully!'
                    this.pageService.showSuccess(message);
                    this.importImageIds = [];
                    console.log('this.homeScreenService.userImages', this.homeScreenService.userImages);
                    console.log('dgdgdhfhfgjfg', res.data['imported_images']);
                    this.homeScreenService.userImages = this.homeScreenService.userImages.concat(res.data['imported_images']);
                    console.log('this.homeScreenService.userImages', this.homeScreenService.userImages);
                }
            });
        }
    }

    public removeHomeBackgroundImage() {
        if (!confirm("Are you sure you want to remove this item ?")) {
            return;
        }
        this.homeScreenService.removeHomeBackgroundImage(this.appId, this.homeScreenService.phoneTabActive ? 1 : 2).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.homeScreenService.appData = res.data['app_data'];
                this.homeScreenService.backgroundSetting.userImageId = 0;
                this.homeScreenService.setUserImageInfo();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public setTabBackgroundButtonStatus(tabId: number) {
        console.log(this.homeScreenService.backgroundSetting.isModernSliding);
        let index = this.homeScreenService.backgroundSetting.setTabBackgroundButtonStatusActive.indexOf(tabId);

        if (index != -1) {
            console.log('exist');
            this.homeScreenService.backgroundSetting.setTabBackgroundButtonStatusActive.splice(index, 1);
        }
        else {
            console.log('not exist');
            this.homeScreenService.backgroundSetting.setTabBackgroundButtonStatusActive.push(tabId);
        }
    }

    public modernSliding(event) {
        console.log(event);
    }
    public setSliderImage(slideNo) {
        console.log(slideNo);
        console.log(this.homeScreenService.backgroundSetting.isModernSliding);
        let index = this.homeScreenService.backgroundSetting.sliderNo.indexOf(slideNo);

        if (index != -1) {
            console.log('exist');
            this.homeScreenService.backgroundSetting.sliderNo.splice(index, 1);
        }
        else {
            console.log('not exist');
            this.homeScreenService.backgroundSetting.sliderNo.push(slideNo);
        }
    }

    public removeSliderImage(slider) {
        console.log(slider);
        if (!confirm("Are you sure you want to remove this item ?")) {
            return;
        }
        this.homeScreenService.deleteSliderImage({ appId: this.appId, sliderNo: slider, sdImageType: (this.homeScreenService.phoneTabActive ? 1 : 2) }).subscribe((res) => {
            console.log(res);
            if (res.success) {
                this.pageService.showSuccess(res.message[0]);

                this.homeScreenService.homeScreenSliderData = res.data['home_screen_sliders'];
                this.homeScreenService.sliderDIsplaySettings.slider = [];
                this.homeScreenService.sliderTabDIsplaySettings.slider = [];
                for (let i = 0; i < this.homeScreenService.homeScreenSliderData.length; i++) {
                    this.homeScreenService.sliderDIsplaySettings.slider[this.homeScreenService.homeScreenSliderData[i].slider_no] = this.homeScreenService.homeScreenSliderData[i].image_id;
                    this.homeScreenService.sliderTabDIsplaySettings.slider[this.homeScreenService.homeScreenSliderData[i].slider_no] = this.homeScreenService.homeScreenSliderData[i].tab_image_id;
                }
                this.homeScreenService.setUserImageInfo();
            }

            else {
                this.pageService.showError(res.message);
            }
        });
    }
    public removeTabBackgroundImage(id) {
        console.log(id);
        if (!confirm("Are you sure you want to remove this item ?")) {
            return;
        }
        this.homeScreenService.deleteTabBackImage({ appId: this.appId, tabId: id, bgImageType: (this.homeScreenService.phoneTabActive ? 1 : 2) }).subscribe((res) => {
            console.log(res);
            if (res.success) {
                this.pageService.showSuccess(res.message[0]);
                this.homeScreenService.appTabs = res.data['app_tabs_data'];
                this.homeScreenService.setUserImageInfo();
            }

            else {
                this.pageService.showError(res.message);
            }
        });
    }
    public checkModernSliding() {
        console.log('checkModernSliding');
        this.homeScreenService.backgroundSetting.isModernSliding = !this.homeScreenService.backgroundSetting.isModernSliding;
        if (this.homeScreenService.backgroundSetting.isModernSliding) {
            this.selectedSlide = this.homeScreenService.appData.slider_type > 3 ? this.homeScreenService.appData.slider_type : 1;


            this.sliding = [];
            this.sliding.push({ label: 'Manual Swipe', value: 1 });
            this.sliding.push({ label: 'Parallax', value: 4 });
            this.sliding.push({ label: 'Ken Burns', value: 5 });

        }
        else {
            this.selectedSlide = this.homeScreenService.appData.slider_type < 4 ? this.homeScreenService.appData.slider_type : 1;
            this.sliding = [];
            this.sliding.push({ label: 'Manual Swipe', value: 1 });
            this.sliding.push({ label: 'Sliding', value: 2 });
            this.sliding.push({ label: 'Fade', value: 3 });
        }
    }
    public checkTabModernSliding() {
        console.log('checkTabModernSliding');
        this.homeScreenService.backgroundSetting.isTabModernSliding = !this.homeScreenService.backgroundSetting.isTabModernSliding;
        if (this.homeScreenService.backgroundSetting.isTabModernSliding) {
            this.selectedTabSlide = this.homeScreenService.appData.tab_slider_type > 3 ? this.homeScreenService.appData.tab_slider_type : 1;


            this.slidingTab = [];
            this.slidingTab.push({ label: 'Manual Swipe', value: 1 });
            this.slidingTab.push({ label: 'Parallax', value: 4 });
            this.slidingTab.push({ label: 'Ken Burns', value: 5 });

        }
        else {
            this.selectedTabSlide = this.homeScreenService.appData.tab_slider_type < 4 ? this.homeScreenService.appData.tab_slider_type : 1;
            this.slidingTab = [];
            this.slidingTab.push({ label: 'Manual Swipe', value: 1 });
            this.slidingTab.push({ label: 'Sliding', value: 2 });
            this.slidingTab.push({ label: 'Fade', value: 3 });
        }
    }

    public selectedSlideChange(event) {
        console.log('selectedChange');
        console.log(event.value);
        this.selectedSlide = event.value;
        this.homeScreenService.backgroundSetting.sliderType = this.selectedSlide;
    }
    public selectedTabSlideChange(event) {
        console.log('selectedChange');
        console.log(event.value);
        this.selectedTabSlide = event.value;
        this.homeScreenService.backgroundSetting.tabSliderType = this.selectedTabSlide;
    }

    public targetImage(id) {
        let index = this.targetedImageIds.indexOf(id);

        if (index != -1) {

            this.targetedImageIds.splice(index, 1);
        }
        else {
            console.log('not exist');
            this.targetedImageIds.push(id);
        }
    }

    // public deleteTargetedImage() {
    //     let postData = { appId: this.appId, imgIds: this.targetedImageIds.join(','), bgImageType: this.bgImageType }
    //     console.log('deleteTargetedImage ', this.targetedImageIds);
    //     if (!confirm("Are you sure you want to remove this item ?")) {
    //         return;
    //     }
    //     this.showLoader = true;
    //     this.homeScreenService.deleteUserImages(postData).subscribe((res) => {
    //         if (res.success) {
    //             this.showLoader = false;
    //             this.pageService.showSuccess(res.message[0]);
    //             this.homeScreenService.userImages = res.data['user_images_list'];
    //             this.homeScreenService.appData = res.data['app_data'];
    //             this.homeScreenService.homeScreenSliderData = res.data['home_screen_sliders'];
    //             this.homeScreenService.appTabs = res.data['app_tabs_data'];
    //             this.homeScreenService.sliderDIsplaySettings.slider = [];
    //             for (let i = 0; i < this.homeScreenService.homeScreenSliderData.length; i++) {
    //                 this.homeScreenService.sliderDIsplaySettings.slider[this.homeScreenService.homeScreenSliderData[i].slider_no] = this.homeScreenService.homeScreenSliderData[i].image_id;
    //             }
    //             this.homeScreenService.setUserImageInfo();
    //             this.targetedImageIds = [];
    //         }

    //         else {
    //             this.pageService.showError(res.message);
    //         }
    //     });
    // }

    public deleteImages(id: number): void {
        this.targetedImageIds = [];
        this.targetedImageIds.push(id);
        let postData = { appId: this.appId, imgIds: this.targetedImageIds.join(','), bgImageType: this.bgImageType }
        console.log('deleteTargetedImage ', this.targetedImageIds);
        if (!confirm("Are you sure you want to remove this item ?")) {
            return;
        }
        this.showLoader = true;
        this.homeScreenService.deleteUserImages(postData).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.pageService.showSuccess(res.message[0]);
                this.homeScreenService.userImages = res.data['user_images_list'];
                this.homeScreenService.appData = res.data['app_data'];
                this.homeScreenService.homeScreenSliderData = res.data['home_screen_sliders'];
                this.homeScreenService.appTabs = res.data['app_tabs_data'];
                this.homeScreenService.sliderDIsplaySettings.slider = [];
                this.homeScreenService.sliderTabDIsplaySettings.slider = [];
                for (let i = 0; i < this.homeScreenService.homeScreenSliderData.length; i++) {
                    this.homeScreenService.sliderDIsplaySettings.slider[this.homeScreenService.homeScreenSliderData[i].slider_no] = this.homeScreenService.homeScreenSliderData[i].image_id;
                    this.homeScreenService.sliderTabDIsplaySettings.slider[this.homeScreenService.homeScreenSliderData[i].slider_no] = this.homeScreenService.homeScreenSliderData[i].tab_image_id;
                }
                this.homeScreenService.setUserImageInfo();
                this.targetedImageIds = [];
            }

            else {
                this.pageService.showError(res.message);
            }
        });
    }

    public handleChange(event: any): void {
        console.log("handleChange called");
        console.log(event.index);
        if (event.index == 0) {
            this.homeScreenService.phoneTabActive = true;
            this.bgImageType = 1;
        } else {
            this.homeScreenService.phoneTabActive = false;
            this.bgImageType = 2;
        }
    }

    public onClickAttachMent(type: string, id: number): void {
        console.log("onClickAttachMent called");
        if (type == 'home') {
            this.setBackgroundButtonStatus();
        } else if (type == 'slide') {
            this.setSliderImage(id);
        } else if (type == 'tab') {
            this.setTabBackgroundButtonStatus(id);
        }

        this.addAttachMent = true;
        this.pageService.onDialogOpen();
        this.importImageIds = [];
        this.showLoader = true;
        this.homeScreenService.getLibraryImages().subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.libraryImages = res.data['library_images_list'];
                console.log('this.homeScreenService.userImages', this.libraryImages);
            }

        });
    }
    public saveChoices(): void {
        this.homeScreenService.saveBackgroundImage();
        this.addAttachMent = false;
    }
    public onaddAttachMentDialogHide(): void {
        this.homeScreenService.backgroundSetting.userImageId = 0;
        this.homeScreenService.backgroundSetting.sliderNo = [];
        this.homeScreenService.backgroundSetting.setTabBackgroundButtonStatusActive = [];
    }

    public onLinkAttachClick(slideNo: number): void {
        console.log(this.homeScreenService.sliderLinkedTabIDs[slideNo]);
        this.sliderLinkTabID = this.homeScreenService.sliderLinkedTabIDs[slideNo] || undefined;
        this.linkAttachSlideNo = slideNo;
        this.showLinkEditorDialog = true;
        this.pageService.onDialogOpen();
    }

    public onLinkAttachSubmit(): void {
        PageService.showLoader();
        this.linkSettingSaveDisable = true;
        this.homeScreenService.saveTabLinkAttachment(this.appId, this.linkAttachSlideNo, this.sliderLinkTabID).subscribe(res => {
            PageService.hideLoader();
            this.linkSettingSaveDisable = false;
            if (res.success) {
                this.pageService.showSuccess("Link settings saved.");
                this.homeScreenService.sliderLinkedTabIDs[this.linkAttachSlideNo] = this.sliderLinkTabID;
                this.showLinkEditorDialog = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

}
