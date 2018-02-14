import { Component, ViewChild, Input, Output, EventEmitter, ElementRef, Renderer, HostListener } from '@angular/core';
import { PageService } from '../../services';
import { Dialog } from 'primeng/primeng';
import { CPanelService } from "../../../pages/c-panel/c-panel.service";
import { UploadImage } from '../../interfaces';

@Component({
    selector: 'ba-cpanel-image-uploader',
    styles: [require('./baCpanelImageUploader.scss')],
    template: require('./baCpanelImageUploader.html'),
    providers: [PageService, CPanelService],
    directives: [Dialog],

})
export class BaCpanelImageUploader {

    @Input() headerTitle: string = '';
    @Input() imageType: number = null;
    @Output() complete = new EventEmitter<any>();

    public images: any[] = [];
    public showImageDialog: boolean = true;
    public imagesTarget: any = null;
    public cUploadImageData: UploadImage = new UploadImage();
    public disableButton: boolean = false;
    public showLoader: boolean = false;
    public targatedImageId: number = null;
    public staticCpanel: typeof CPanelService = CPanelService;

    constructor(
        private renderer: Renderer,
        private page: PageService,
        private service: CPanelService
    ) {
    }

    public ngOnInit(): void {
        this.getImages();
    }

    public onImagesChange(event: any): void {
        this.imagesTarget = event.target;
        this.cUploadImageData.image_file = event.target.files[0];
    }

    public getImages() {
        this.showLoader = true;
        this.service.getImage(this.imageType).subscribe((res) => {
            if (res.success) {
                this.images = res.data.images;
                this.targatedImageId = this.checkTargatedImage(this.images);
            } else {
                console.log("some server error occure");
            }
            this.showLoader = false;
        })
    }

    public uploadImage(): void {
        this.disableButton = true;
        this.cUploadImageData.type = this.imageType;
        this.service.uplaodImage(this.cUploadImageData).subscribe((res) => {
            if (res.success) {
                console.log("res", res);
                this.images.unshift({ id: res.data.id, name: res.data.imageUrl, type: this.imageType });
                this.clearInputsValue();
                this.page.showSuccess('Image uploaded successfuly');
                this.targetedImage(this.images[0]);
            } else {
                this.page.showError(res.message);
            }
            this.disableButton = false;
        });
    }
    public onComponentClose(): void {
        this.complete.emit({ image: null });
    }

    public deleteImageDialog(id: number, index: number): void {
        var yes = window.confirm("Do you really want to delete image?");
        if (yes) {
            this.service.deleteImage(id).subscribe((res) => {
                if (res.success) {
                    this.images.splice(index, 1);
                    if (this.targatedImageId == id) {
                        this.targatedImageId = this.images[0].id;
                        switch (this.imageType) {
                            case 1:
                                this.staticCpanel.cThemeData.theme_logo = this.images[0].name;
                                break;
                            case 2:
                                this.staticCpanel.cPreViewerData.prev_bg_image = this.images[0].name;
                                break;
                            case 3:
                                this.staticCpanel.cPreViewerData.prev_play_image = this.images[0].name;
                                break;
                            case 4:
                                this.staticCpanel.cPreViewerData.prev_load_image = this.images[0].name;
                                break;
                            case 5:
                                this.staticCpanel.cLoginData.login_logo = this.images[0].name;
                                break;
                        }
                        let image = this.service.getLastSegmentFromUrl(this.images[0].name);
                        let data = { appId: this.staticCpanel.appId, image: image, type: this.imageType };
                        this.service.updateCmsImages(data).subscribe((res) => {
                        });
                    }

                    this.page.showSuccess(res.message);
                }
                else {
                    this.page.showError(res.message);
                }
            });
        }
    }

    public targetedImage(imageData: any): void {
        this.targatedImageId = imageData.id;
        this.complete.emit({ image: imageData.name });
    }

    public clearInputsValue(): void {
        this.imagesTarget.value = null;
        this.cUploadImageData.image_file = null;
    }

    public checkTargatedImage(images: any): number {
        let image = images.filter((image) => {
            switch (this.imageType) {
                case 1:
                    return image.name === this.staticCpanel.cThemeData.theme_logo;
                case 2:
                    return image.name === this.staticCpanel.cPreViewerData.prev_bg_image;
                case 3:
                    return image.name === this.staticCpanel.cPreViewerData.prev_play_image;
                case 4:
                    return image.name === this.staticCpanel.cPreViewerData.prev_load_image;
                case 5:
                    return image.name === this.staticCpanel.cLoginData.login_logo;
            }
        });
        if (image.length > 0) {
            return image[0].id;
        } else {
            return null;
        }
    }
    ngAfterViewInit() {
        this.page.onDialogOpen();
    }

}
