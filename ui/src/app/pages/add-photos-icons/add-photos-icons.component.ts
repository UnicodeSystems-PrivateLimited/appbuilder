import { Component, ViewEncapsulation } from '@angular/core';
import { PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dropdown, Dialog } from 'primeng/primeng';
import { SelectItem } from 'primeng/primeng';
import { PageService, GridDataService, FormDataService } from '../../theme/services';
import { APIResponse, PhotosIconNewAdd } from '../../theme/interfaces';

@Component({
    selector: 'add-photos-icons',
    directives: [Dialog, Dropdown, PAGINATION_DIRECTIVES],
    styles: [require('./add-photos-icons.scss')],
    encapsulation: ViewEncapsulation.None,
    template: require('./add-photos-icons.html'),
})
export class AddPhotosIcons {
    public showGridLoader: boolean = false;
    public photosIconDialogDisplay: boolean = false;
    public isValidImages: boolean = false;
    public isValidImagesError: boolean = false;
    public galleryImages: any = [];
    public photosIconHeader: string;
    public photosIconImagesTarget: any = null;
    public pictureGalleries: PhotosIconNewAdd = new PhotosIconNewAdd();
    private _getPhotosIconsURL: string = '../api/ws/app/tab/icon/photosiconsection';
    private _savePhotosIconsData: string = '../api/ws/app/tab/icon/savephotosiconsection';
    private _deletePhotosIcon: string = '../api/ws/app/tab/icon/deletephotosicon';
    public photosIconsPager: any = {
        total: 0,
        currentPage: 1,
        itemsPerPage: 24
    };
    public photosIcons: any[] = [];

    constructor(
        private dataService: GridDataService,
        private pageService: PageService,
        private formDataService: FormDataService
    ) {
    }

    ngOnInit() {
        this.getPhotosIcons();
    }

    public showAddPhotosIconDialog(): void {
        this.photosIconHeader = "Add New Photos Icon";
        this.pictureGalleries = new PhotosIconNewAdd();
        this.galleryImages = null;
        this.photosIconDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public getPhotosIcons(): void {
        this.showGridLoader = true;
        this.photosIcons = [];
        this.dataService.getData(this._getPhotosIconsURL + '/' + this.photosIconsPager.currentPage).subscribe(res => {
            this.showGridLoader = false;
            if (res.success) {
                this.photosIcons = res.data.data;
                this.photosIconsPager.total = res.data.total;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public photosIconsPageChanged(event: any): void {
        this.photosIconsPager.currentPage = event.page;
        this.getPhotosIcons();
    }

    public onGalleryImagesChange(event: any): void {
        this.photosIconImagesTarget = event.target;
        this.pictureGalleries.image = event.target.files;
        if (this.pictureGalleries.image.length > 10) {
            this.isValidImages = true;
            this.isValidImagesError = true;
        } else {
            this.isValidImages = false;
            this.isValidImagesError = false;
        }
    }

    public onPhotosIconSubmit(): void {
        this.isValidImages = true;
        this.photosIconDialogDisplay = false;
        this.showGridLoader = true;
        this.formDataService.postData(this._savePhotosIconsData, this.pictureGalleries).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.showGridLoader = false;
                this.getPhotosIcons();
                this.pictureGalleries = new PhotosIconNewAdd();
            } else {
                this.showGridLoader = false;
                this.pageService.showError(res.message);
            }
        });
    }

    public deletePhotosIcon(id: number): void {
        if (confirm("Are you sure to delete this icon")) {
            this.showGridLoader = true;
            this.dataService.getData(this._deletePhotosIcon + '/' + id).subscribe(res => {
                this.showGridLoader = false;
                if (res.success) {
                    this.getPhotosIcons();
                    this.pageService.showSuccess(res.message);
                } else {
                    this.pageService.showError(res.message);
                }
            });
        }
    }

}