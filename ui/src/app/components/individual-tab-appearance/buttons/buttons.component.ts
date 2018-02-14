import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { InputSwitch, Slider } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { ColorPickerDirective } from "../../../color-picker/color-picker.directive";
import { AppState } from '../../../app.state';
import { GlobalStyleService } from '../../../pages/settings/app-display/global-style.service';
import { HomeScreenService } from '../../../pages/settings/app-display/home-screen.service';
import {  HomeScreenSettings } from '../../../theme/interfaces';

@Component({
    selector: 'individual-tab-buttons',
    directives: [TOOLTIP_DIRECTIVES, TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, InputSwitch, Slider, ColorPickerDirective],
    template: require('./buttons.component.html'),
})

export class IndividualButtonsComponent {
    public noImage: boolean = false;
    public checked: boolean = true;
    public backgroundImg: File = null;
    public appId;

    constructor(
        private params: RouteParams,
        private appState: AppState,
        private pageService: PageService,
        private dataService: GridDataService,
        private service: GlobalStyleService,
        private homeScreenService: HomeScreenService

    ) {
        this.appId = appState.dataAppId;
    }

    public ngOnInit(): void {
        this.getBackgroundImages();
    }
    public onBackgroundImageChange(event): void {
        this.backgroundImg = event.target.files[0];
        this.service.buttonBackgroundImageTarget = event.target;
    }

    public onBackgroundImgUploadClick(): void {
        PageService.showLoader();
        this.service.uploadButtonBackgroundImg(this.backgroundImg, this.appId).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.backgroundImg = null;
                this.service.buttonBackgroundImageTarget.value = null;
                this.pageService.showSuccess("Background image saved");
                this.getBackgroundImages();
                this.service.individualTabSettings.buttons.background_img = res.createdImgId;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onBackgroundImgClick(id: number): void {
        this.noImage = false;
        this.service.individualTabSettings.buttons.background_img = id;
    }

    public getBackgroundImages(): void {
        this.service.getButtonBackrgroundImagesList(this.appId).subscribe(res => {
            if (res.success) {
                this.service.buttonBackgroundImages = res.data;
                for (let val of res.data) {
                    this.service.buttonBgImageSrcs[val.id] = val.name;
                }
            }
        });
    }

    public onDeleteBgImageClick(event, id: number): void {
        event.stopPropagation();
        if (confirm("Are you sure you want to delete this ?")) {
            PageService.showLoader();
            this.service.deleteButtonBackrgroundImage(id).subscribe(res => {
                PageService.hideLoader();
                if (res.success) {
                    this.pageService.showSuccess(res.message);
                    this.dataService.getByID(this.service.buttonBackgroundImages, id, (data, index) => {
                        this.service.buttonBackgroundImages.splice(index, 1);
                        this.service.buttonBgImageSrcs[data.id] = null;
                    });
                } else {
                    this.pageService.showSuccess(res.message);
                }
            });
        }
    }

    public onNoImage(): void {
        this.noImage = true;
        this.service.individualTabSettings.buttons.background_img = null;
    }
}