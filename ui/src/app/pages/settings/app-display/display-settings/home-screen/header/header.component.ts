/**
 * Header Component
 * 
 * 
 */
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { InputSwitch, Slider } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { ColorPickerDirective } from "../../../../../../color-picker/color-picker.directive";
import { AppState } from '../../../../../../app.state';
import { HomeScreenSettings } from '../../../../../../theme/interfaces';
import { HomeScreenService } from '../../../home-screen.service';


@Component({
    selector: 'header',
    directives: [TOOLTIP_DIRECTIVES, TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, InputSwitch, Slider, ColorPickerDirective],
    template: require('./header.component.html'),
})

export class HeaderComponent {
    checked: boolean = true;
    public noImage: boolean = false;
    public appId: number;
    public headerBackgroundImg: File = null;

    constructor(private params: RouteParams,
        private service: HomeScreenService,
        private appState: AppState,
        private pageService: PageService,
        private dataService: GridDataService) {

        this.appId = appState.dataAppId;
    }

    public onHeaderBgImageChange(event): void {
        this.headerBackgroundImg = event.target.files[0];
        this.service.homeHeaderBackgroundImageTarget = event.target;
    }

    public onHeaderBgImgUploadClick(): void {
        PageService.showLoader();
        this.service.uploadHeaderBackgroundImg(this.headerBackgroundImg, this.appId).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.service.homeHeaderBackgroundImageTarget.value = null;
                this.headerBackgroundImg = null;
                this.pageService.showSuccess("Background image saved");
                this.getHeaderImages();
                this.service.homeScreenSettings.header.background_img = res.createdImgId;

            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public getHeaderImages(): void {
        this.service.getHeaderBackrgroundImagesList(this.appId).subscribe(res => {
            if (res.success) {
                this.service.homeHeaderBackgroundImages = res.data;
                for (let val of res.data) {
                    this.service.homeHeaderBgImageSrcs[val.id] = val.name;
                }
            }
        });
    }

    public onBackgroundImgClick(id: number): void {
        this.noImage = false;
        this.service.homeScreenSettings.header.background_img = id;
    }

    public onDeleteHeaderBgImageClick(event, id: number): void {
        event.stopPropagation();
        if (confirm("Are you sure you want to delete this ?")) {
            PageService.showLoader();
            this.service.deleteHeaderBackrgroundImage(id).subscribe(res => {
                PageService.hideLoader();
                if (res.success) {
                    this.pageService.showSuccess(res.message);
                    this.dataService.getByID(this.service.homeHeaderBackgroundImages, id, (data, index) => {
                        this.service.homeHeaderBackgroundImages.splice(index, 1);
                        this.service.homeHeaderBgImageSrcs[data.id] = null;
                    });
                } else {
                    this.pageService.showSuccess(res.message);
                }
            });
        }
    }

    public onNoImage(): void {
        this.noImage = true;
        this.service.homeScreenSettings.header.background_img = null;
    }
}
