import { Component, ViewEncapsulation } from '@angular/core';
import { PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dropdown, Dialog } from 'primeng/primeng';
import { SelectItem } from 'primeng/primeng';
import { PageService, GridDataService, FormDataService } from '../../theme/services';
import { APIResponse, ColorIconNewAdd } from '../../theme/interfaces';

@Component({
    selector: 'add-color-icons',
    directives: [Dialog, Dropdown, PAGINATION_DIRECTIVES],
    styles: [require('./add-color-icons.scss')],
    encapsulation: ViewEncapsulation.None,
    template: require('./add-color-icons.html'),
})
export class AddColorIcons {
    public showGridLoader: boolean = false;
    public currentPage: number = 1;
    public itemsPerPage: number = 10;
    public colorIconDialogDisplay: boolean = false;
    public isValidImages: boolean = false;
    public isValidImagesError: boolean = false;
    public galleryImages: any = [];
    public colorIconHeader: string;
    public colorIconImagesTarget: any = null;
    public pictureGalleries: ColorIconNewAdd = new ColorIconNewAdd();
    private _getColorIconsURL: string = '../api/ws/app/tab/icon/colorsection';
    private _saveColorIconsData: string = '../api/ws/app/tab/icon/savecolorsection';
    private _deleteColorIcon: string = '../api/ws/app/tab/icon/deletecoloricon';
    public colorIconsPager: any = {
        total: 0,
        currentPage: 1,
        itemsPerPage: 24
    };
    public colorIcons: any[] = [];

    constructor(
        private dataService: GridDataService,
        private pageService: PageService,
        private formDataService: FormDataService
    ) {
    }

    ngOnInit() {
        this.getColorIcons();
    }

    public showAddColorIconDialog(): void {
        this.colorIconHeader = "Add New Color Icon";
        this.pictureGalleries = new ColorIconNewAdd();
        this.galleryImages = null;
        this.colorIconDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public getColorIcons(): void {
        this.showGridLoader = true;
        this.colorIcons = [];
        this.dataService.getData(this._getColorIconsURL + '/' + this.colorIconsPager.currentPage).subscribe(res => {
            this.showGridLoader = false;
            if (res.success) {
                this.colorIcons = res.data.data;
                this.colorIconsPager.total = res.data.total;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public colorIconsPageChanged(event: any): void {
        this.colorIconsPager.currentPage = event.page;
        this.getColorIcons();
    }

    public onGalleryImagesChange(event: any): void {
        this.colorIconImagesTarget = event.target;
        this.pictureGalleries.image = event.target.files;
        if (this.pictureGalleries.image.length > 10) {
            this.isValidImages = true;
            this.isValidImagesError = true;
        } else {
            this.isValidImages = false;
            this.isValidImagesError = false;
        }
    }

    public onColorIconSubmit(): void {
        this.isValidImages = true;
        this.showGridLoader = true;
        this.formDataService.postData(this._saveColorIconsData, this.pictureGalleries).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.colorIconDialogDisplay = false;
                this.showGridLoader = false;
                this.getColorIcons();
                this.pictureGalleries = new ColorIconNewAdd();
            } else {
                this.showGridLoader = false;
                this.pageService.showError(res.message);
            }
        });
    }

    public deleteColorIcon(id: number): void {
        if (confirm("Are you sure to delete this icon")) {
            this.showGridLoader = true;
            this.dataService.getData(this._deleteColorIcon + '/' + id).subscribe(res => {
                this.showGridLoader = false;
                if (res.success) {
                    this.getColorIcons();
                    this.pageService.showSuccess(res.message);
                } else {
                    this.pageService.showError(res.message);
                }
            });
        }
    }

}