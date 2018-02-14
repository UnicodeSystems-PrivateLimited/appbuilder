import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, RadioButton } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { Tab, ImageServiceType, PictureGalleryTabItem, GalleryPictureData, ImportGalleryData, imageServiceTypeCustom, imageServiceTypeFlickr, imageServiceTypePicasa, imageServiceTypeInstagram, galleryTypeGrid, galleryTypeCoverFlow, imageDescriptionYes, imageDescriptionNo, importTypeFacebook, importTypeWebsite, FBAlbumList, SubmitedFBAlbumList } from "../../../../../theme/interfaces/common-interfaces";
import { PictureGalleryService } from './picture-gallery.service';
import { ThumbnailFileReader, MobileViewComponent } from '../../../../../components';
// import { CKEditor } from 'ng2-ckeditor';
import { ProgressBar } from 'primeng/primeng';
import { FacebookService, FacebookLoginResponse, FacebookLoginStatus, FacebookInitParams } from 'ng2-facebook-sdk';
//import {,MobileViewComponent} from '../../../../../components';
import { ImageViewer } from '../../../../../components/image-viewer';

declare var EventSource: any;
declare var $: any;
declare var window: any;
const CLIENT_ID = "99c082eb826449ed81aa0372473f58b7";

@Component({
    selector: 'tab-function-image-gallery',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, Dialog, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, Dragula, RadioButton, MobileViewComponent, ProgressBar, ImageViewer],
    encapsulation: ViewEncapsulation.None,
    template: require('./picture-gallery.component.html'),
    styles: [require('./picture-gallery.scss')],
    viewProviders: [DragulaService],
    providers: [PageService, PictureGalleryService, GridDataService, FacebookService]
})



export class PictureGallery {
    public tabId: number;
    public ready: boolean = false;
    public pictureGalleries: PictureGalleryTabItem = new PictureGalleryTabItem();
    public pictureGalleryList = [];
    public deletePictureGalleryId: number = null;
    public pictureGalleryHeader: string;
    public someStrings: string[] = [];
    public checkTrue: boolean = false;
    // ------------------- DISPLAY CONTROL ----------------------------
    public showDeleteDialog: boolean = false;
    public showLoader: boolean = false;
    public pictureGalleryDialogDisplay: boolean = false;
    public galleryPicDescriptionDialogDisplay: boolean = false;
    public showEditor: boolean = false;
    public importGalleryDialogDisplay: boolean = false;
    public isFBDisabled: boolean = false;
    public isWebDisabled: boolean = true;
    public importGalleryNoImgDialogDisplay: boolean = false;
    public importGalleryImgDownloadDialogDisplay: boolean = false;
    public downloadComplete: boolean = false;
    public downloadInProgress: boolean = true;
    public importGalleryFBAlbumListDialogDisplay: boolean = false;
    public albumDownloadInProgress: boolean = false;
    public addSaveButtonHide: boolean = false;
    public zoomImageDialogDisplay: boolean = false;
    // ----------------------------------------------------------------

    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
    public pictureGalleryThumbnailTarget: any = null;
    public pictureGalleryImagesTarget: any = null;
    public thumbnailImage: File | string = null;
    public galleryImages: any = [];
    public galleryPictureData: GalleryPictureData = new GalleryPictureData();
    public importGalleryData: ImportGalleryData = new ImportGalleryData();
    public tempUrl: string = '';
    public progress: number = 0;
    public currentImg: number = 0;
    public totalImg: number = 0;
    public source: any = '';
    public fbAlbumList: FBAlbumList[] = [];
    public submitedFBAlbumList: SubmitedFBAlbumList = new SubmitedFBAlbumList();
    public fbAlbumIdNamewise: string[] = [];
    public accessKey: string = null;
    public imageServiceType: ImageServiceType = new ImageServiceType();
    private IMAGE_BAG: string = 'image-bag';
    private LISTS_BAG: string = 'lists-bag';
    private IMAGE_SERVICE_TYPE_CUSTOM: number = imageServiceTypeCustom;
    private IMAGE_SERVICE_TYPE_FLICKR: number = imageServiceTypeFlickr;
    private IMAGE_SERVICE_TYPE_PICASA: number = imageServiceTypePicasa;
    private IMAGE_SERVICE_TYPE_INSTAGRAM: number = imageServiceTypeInstagram;

    private GALLERY_TYPE_GRID: number = galleryTypeGrid;
    private GALLERY_TYPE_COVER_FLOW: number = galleryTypeCoverFlow;

    private IMAGE_DESCRIPTION_YES: number = imageDescriptionYes;
    private IMAGE_DESCRIPTION_NO: number = imageDescriptionNo;

    private IMPORT_TYPE_FACEBOOK: number = importTypeFacebook;
    private IMPORT_TYPE_WEBSITE: number = importTypeWebsite;
    public selectedFBAlbumList: boolean[] = [];
    public selectedItem: boolean[] = [];
    public checkAll: boolean = false;
    public galleryImg: any[] = [];
    public imgPointer: number = null;
    public totalGalleryImages: number = null;
    public editorView: any = null;
    // public ckEditorConfig: any = {
    //     uiColor: '#F0F3F4',
    //     height: '600',
    //     filebrowserUploadUrl: '/api/ws/function/ck-editor-image/uploadCkeditorImage',
    // };
    public instagramUserName: string = null;

    constructor(
        private pageService: PageService,
        private params: RouteParams,
        private service: PictureGalleryService,
        private dragulaService: DragulaService,
        private dataService: GridDataService,
        private fb: FacebookService
    ) {
        let fbParams: FacebookInitParams = {
            appId: '1020349944740206',
            xfbml: true,
            version: 'v2.8'
        };
        this.fb.init(fbParams);
        this.tabId = parseInt(params.get('tabId'));
        dragulaService.dropModel.subscribe((value) => {
            switch (value[0]) {
                case this.IMAGE_BAG:
                    this.sortImages();
                    break;
                case this.LISTS_BAG:
                    this.sortPictureGalleries()
                    break;
            }
        });

    }


    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        // One request to get all initial data.
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                this.pictureGalleryList = res.data.gallery_list;
                this.tabData = res.data.tabData;
                if (res.data.tabData.settings) {
                    this.imageServiceType = JSON.parse(res.data.tabData.settings);
                    this.instagramUserName = this.imageServiceType.instagram_user_name ? this.imageServiceType.instagram_user_name : null;
                }
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public sortPictureGalleries(): void {
        let ids: number[] = [];
        for (let pictureGallery of this.pictureGalleryList) {
            ids.push(pictureGallery.id);
        }
        this.service.sortGalleryList(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('Gallery order saved.')
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    //    public onDeleteClick(id: number): void {
    //        this.deletePictureGalleryId = id;
    //        this.showDeleteDialog = true;
    //    }
    //
    //    public deletePictureGallery(): void {
    //        this.showLoader = true;
    //        this.service.deletePictureGallery([this.deletePictureGalleryId]).subscribe((res) => {
    //            if (res.success) {
    //                this.showLoader = false;
    //                this.showDeleteDialog = false;
    //                this.pageService.showSuccess(res.message);
    //                this.pictureGalleryList.forEach((pictureGallery, index) => {
    //                    if (pictureGallery.id === this.deletePictureGalleryId) {
    //                        this.pictureGalleryList.splice(index, 1);
    //                    }
    //                });
    //            } else {
    //                this.pageService.showError(res.message);
    //            }
    //        });
    //    }

    public showAddPictureGalleryDialog(): void {
        this.pictureGalleryHeader = "Add New Gallery";
        this.pictureGalleries = new PictureGalleryTabItem();
        this.pictureGalleries.tab_id = this.tabId;
        this._clearImageInputs();
        this.thumbnailImage = null;
        this.galleryImages = null;
        this.pictureGalleryDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public onGalleryThumbnailChange(event: any): void {
        this.pictureGalleryThumbnailTarget = event.target;
        this.pictureGalleries.thumbnail = event.target.files[0];
    }

    public onGalleryImagesChange(event: any): void {
        this.pictureGalleryImagesTarget = event.target;
        this.pictureGalleries.image = event.target.files;
    }

    public onPictureGallerySubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.service.savePictureGalleryItem(this.pictureGalleries).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.getPictureGalleryList();
                this._clearImageInputs();
                if (this.pictureGalleryHeader == 'Add New Gallery') {
                    this.pictureGalleryDialogDisplay = false;
                } else {
                    this.thumbnailImage = res.data.galleryData.thumbnail;
                    this.galleryImages = res.data.galleryimages;
                }
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
            this.showLoader = false;
        });
    }

    public getPictureGalleryList() {
        this.service.getPictureGalleryList(this.tabId).subscribe(res => {
            if (res.success) {
                if (res.data && res.data.length) {
                    this.pictureGalleryList = res.data;
                }
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    private _clearImageInputs(): void {
        if (this.pictureGalleryThumbnailTarget) {
            this.pictureGalleryThumbnailTarget.value = null;
        }
        if (this.pictureGalleryImagesTarget) {
            this.pictureGalleryImagesTarget.value = null;
        }
    }

    public showEditPictureGalleryDialog(pictureGalleryId): void {
        PageService.showLoader();

        this.service.getPictureGalleryData(pictureGalleryId).subscribe(res => {
            PageService.hideLoader();
            this.pictureGalleryHeader = "Edit Gallery";
            this._clearImageInputs();
            this.pictureGalleries = res.data.galleryData;
            this.thumbnailImage = this.pictureGalleries.thumbnail;
            this.galleryImages = res.data.galleryimages;
            this.pictureGalleryDialogDisplay = true;
            this.pageService.onDialogOpen();
            this.totalGalleryImages = this.galleryImages.length;
        });
    }

    public deleteThumbnailImage(type: string, id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item.");
            if (yes) {
                this.service.deleteThumbnailImage(type, id).subscribe(res => {
                    if (res.success) {
                        if (type == "thumbnail") {
                            this.pictureGalleries.thumbnail = '';
                            this.thumbnailImage = '';
                        }
                        this.pageService.showSuccess(res.message);
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }

    public deleteGalleryImage(type: string, id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item.");
            if (yes) {
                this.service.deleteGalleryImage(type, id).subscribe(res => {
                    if (res.success) {
                        if (type == "image") {
                            this.dataService.getByID(this.galleryImages, id, (data, index) => {
                                this.galleryImages.splice(index, 1);
                            });
                        }
                        this.pageService.showSuccess(res.message);
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }

    public showDescriptionDialog(galleryPictureId): void {
        console.log(galleryPictureId);
        this.showEditor = true;
        this.service.getGalleryPictureData(galleryPictureId).subscribe(res => {
            if (res.success) {
                this.galleryPictureData = res.data;
                this.initEditor();
                this.galleryPicDescriptionDialogDisplay = true;
                this.pageService.onDialogOpen();
            }
            else
                this.pageService.showError(res.message);
        });
    }

    public onGalleryPictureDescriptionSubmit(): void {
        this.showLoader = true;
        if (this.editorView) {
            this.galleryPictureData.description = this.editorView.html();
        }
        this.service.saveGalleryPictureData(this.galleryPictureData).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
            this.showLoader = false;
            this.galleryPicDescriptionDialogDisplay = false;
            this.showEditor = false;
            this.editorView = null;
        });
    }

    public showImportGalleryDialog(): void {
        this.importGalleryData.tab_id = this.tabId;
        // this.importGalleryData.name = 'Misc Photos';
        this.importGalleryDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public onImportTypeClick(importType): void {
        if (importType == importTypeFacebook) {
            this.isFBDisabled = false;
            this.isWebDisabled = true;
            this.importGalleryData.importTypeService = importTypeFacebook;
        } else {
            this.isFBDisabled = true;
            this.isWebDisabled = false;
            this.importGalleryData.importTypeService = importTypeWebsite;
        }
    }

    public onImportGallerySubmit(): void {
        this.showLoader = true;
        if (this.importGalleryData.importTypeService == importTypeFacebook) {
            // console.log(this.importGalleryData);
            if (this.importGalleryData.fbUrl == null) {
                this.showLoader = false;
                this.pageService.showError('Facebook page URL not found.');
            } else {
                this.fb.getLoginStatus().then(
                    (value: FacebookLoginStatus) => {
                        if (value.status == 'connected') {
                            // console.log(value.authResponse);
                            this.getFBAlbumList(value.authResponse);
                        } else {
                            // console.log('nottttttttttt');
                            this.fb.login().then(
                                (response: FacebookLoginResponse) => this.getFBAlbumList(response.authResponse),
                                (error: any) => console.error(error)
                            );
                        }
                    }
                );


            }
        } else {
            if (typeof (EventSource) !== "undefined") {
                if (this.importGalleryData.webUrl != null) {
                    this.tempUrl = encodeURIComponent(this.importGalleryData.webUrl);
                }
                this.source = new EventSource(this.service.saveImportWebUrlPictureDataURL + '/' + this.importGalleryData.tab_id + '?webUrl=' + this.tempUrl);
                this.source.addEventListener("message", (event) => {
                    let res = JSON.parse(event.data);
                    if (res.success) {
                        this.importGalleryDialogDisplay = false;
                        if (res.data.total == 0) {
                            this.source.close();
                            this.importGalleryNoImgDialogDisplay = true;
                            this.pageService.onDialogOpen();
                        } else {
                            this.progress = ((res.data.current / res.data.total) * 100);
                            this.progress = Math.floor(this.progress);
                            this.totalImg = res.data.total;
                            this.currentImg = res.data.current;

                            if (res.data.total == res.data.current) {
                                this.source.close();
                                this.downloadComplete = true;
                                this.downloadInProgress = false;
                                this.getPictureGalleryList();
                                this.pageService.showSuccess('Gallery created successfully.');
                            } else {
                                this.downloadComplete = false;
                                this.downloadInProgress = true;
                                this.importGalleryImgDownloadDialogDisplay = true;
                                this.pageService.onDialogOpen();
                            }
                        }
                        this.isFBDisabled = false;
                        this.isWebDisabled = true;
                        this.importGalleryData = new ImportGalleryData();
                    } else {
                        this.source.close();
                        this.pageService.showError(res.message);
                    }
                    this.showLoader = false;
                });
            } else {
                this.service.saveImportWebUrlPictureData(this.importGalleryData).subscribe(res => {
                    if (res.success) {
                        this.getPictureGalleryList();
                        this.importGalleryDialogDisplay = false;
                        this.pageService.showSuccess(res.message);
                    } else {
                        this.pageService.showError(res.message);
                    }
                });
            }
        }
    }

    public onImportGalleryCancel(): void {
        this.source.close();
        this.getPictureGalleryList();
        this.importGalleryImgDownloadDialogDisplay = false;
    }

    public onDownloadComplete(): void {
        this.getPictureGalleryList();
        this.importGalleryImgDownloadDialogDisplay = false;
    }

    public getFBAlbumList(response): void {
        if (this.importGalleryData.fbUrl[this.importGalleryData.fbUrl.length - 1] == '/') {
            this.importGalleryData.fbUrl = this.importGalleryData.fbUrl.slice(0, -1);
        }
        this.service.getFBPageAlbumList(this.importGalleryData.fbUrl, response.accessToken).subscribe(res => {
            this.importGalleryDialogDisplay = false;
            this.importGalleryFBAlbumListDialogDisplay = true;
            this.pageService.onDialogOpen();

            if (res.success) {
                this.fbAlbumList = res.data.albums;
                this.accessKey = res.data.access_token;
                this.importGalleryData.fbUrl = null;

                for (var i = 0; this.fbAlbumList.length > i; i++) {
                    this.fbAlbumIdNamewise[this.fbAlbumList[i].id] = this.fbAlbumList[i].id + '__' + this.fbAlbumList[i].name;
                }
            } else {
                this.pageService.showError(res.message);
            }
            this.showLoader = false;
        });
    }

    public onSubmitFBAlbumList(albumIds: any): void {
        this.submitedFBAlbumList.accessKey = this.accessKey;
        this.submitedFBAlbumList.tab_id = this.tabId;

        for (var key in albumIds) {
            if (albumIds[key]) {
                this.submitedFBAlbumList.album_ids.push(this.fbAlbumIdNamewise[key]);
            }
        }
        this.saveFBAlbum(this.submitedFBAlbumList);
    }

    private saveFBAlbum(fbAlbumDetails): void {
        console.log(fbAlbumDetails.album_ids);
        this.showLoader = true;
        this.service.saveFBAlbumImages(fbAlbumDetails).subscribe(res => {
            // this.submitedFBAlbumList.album_ids = [];
            if (res.success) {
                this.showLoader = false;
                this.importGalleryFBAlbumListDialogDisplay = false;
                this.getPictureGalleryList();
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
        console.log('Submit ho gaya album ban gaya');
    }

    public saveServiceType(): void {
        this.imageServiceType.tab_id = this.tabId;
        if (this.imageServiceType.image_service_type == 4) {
            this.imageServiceType.instagram_user_name = this.instagramUserName;
        }

        if (this.imageServiceType.image_service_type == 4 && !this.imageServiceType.instagram_user_name) {
            this.pageService.showError('You need to connect your Instagram account before saving.After connected successfully, please try to save again.')
        } else {
            this.showLoader = true;
            this.addSaveButtonHide = true;
            this.service.saveImageServiceType(this.imageServiceType).subscribe((res) => {
                if (res.success) {
                    this.showLoader = false;
                    this.pageService.showSuccess(res.message);
                } else {
                    this.pageService.showError(res.message);
                }
                this.addSaveButtonHide = false;
            });
        }
    }

    public onDeleteClick(): void {
        if (this.selectedItem.length > 0 && this.selectedItem.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete item? ");
            if (yes) {
                this.deletePictureGallery();
            }
        }
    }

    public refreshSelectedItem(): void {
        this.selectedItem = [];
    }

    public onCheckAllChange(): void {
        // this.checkTrue = !this.checkTrue;
        this.refreshSelectedItem();
        if (!this.checkAll) {
            for (let i in this.pictureGalleryList) {
                this.selectedItem[this.pictureGalleryList[i].id] = true;
            }
            this.checkTrue = true;
        }
        else {
            for (let i in this.pictureGalleryList) {
                this.selectedItem[this.pictureGalleryList[i].id] = false;
            }
            this.checkTrue = false;
        }
    }

    public deletePictureGallery(): void {
        let ids: any[] = [];
        for (let i in this.selectedItem) {
            if (this.selectedItem[i]) {
                ids.push(i);
            }
        }
        this.showLoader = true;
        this.service.deletePictureGallery(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkTrue = false;
                this.selectedItem = [];

                for (var i = 0; i < ids.length; i++) {
                    console.log('ids==============', ids[i]);
                    this.pictureGalleryList.forEach((pictureGalleryList, index) => {
                        console.log('galleryImages.id==============', pictureGalleryList.id);
                        if (pictureGalleryList.id == ids[i]) {
                            console.log('in');
                            this.pictureGalleryList.splice(index, 1);
                        }
                    });
                }
                this.pageService.showSuccess(res.message);
                this.checkAll = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public sortImages(): void {
        let ids: number[] = [];
        for (let item of this.galleryImages) {
            ids.push(item.id);
            console.log(ids);
        }
        this.service.sortImages(ids).subscribe((res) => {
            if (res.success) {
                // this.pageService.showSuccess(res.data);
            } else {
                this.pageService.showError(res.data);
            }
        });
    }

    public onClickImageZoom(index: number): void {
        this.galleryImg = this.galleryImages;
        this.imgPointer = index;
        this.zoomImageDialogDisplay = true;
    }
    public cancelImageModel() {
        this.zoomImageDialogDisplay = false;
    }

    public onCheckTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.pictureGalleryList.forEach((pictureGalleryList) => {
                console.log('pictureGalleryList', pictureGalleryList);
                console.log('checkedTab', checkedTab);
                if (pictureGalleryList.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedItem[pictureGalleryList.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAll = flag ? true : false;
    }

    private initEditor(): void {
        setTimeout(() => {
            let editorDiv = window["_globalJQuery"]("div#description-editor");
            editorDiv.froalaEditor({
                fileUploadURL: this.pageService.editorURLs.fileUpload,
                videoUploadURL: this.pageService.editorURLs.videoUpload,
                imageUploadURL: this.pageService.editorURLs.imageUpload + "/" + sessionStorage.getItem('appId'),
                imageManagerLoadURL: this.pageService.editorURLs.imageManagerLoad + "/" + sessionStorage.getItem('appId'),
            });
            this.editorView = editorDiv.find(".fr-view");
            if (this.galleryPictureData.description) {
                editorDiv.froalaEditor('placeholder.hide')
            }
            this.editorView.html(this.galleryPictureData.description);
        });
    }

    public hideDescDialog(): void {
        console.log('Hide dialog called');
        this.editorView = null;
    }

    public getInstagramUserInfo(access_token: any) {
        this.service.getInstagramUserInfo(access_token).subscribe(res => {
            if (res.success) {
                console.log(res);
                this.instagramUserName = res['user'].username;
                this.saveServiceType();
                console.log("this.instagramUserName", this.instagramUserName);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public instagramLogin(): void {

        let url = "https://api.instagram.com/oauth/authorize/?client_id=" + CLIENT_ID + "&redirect_uri=" + window.location.origin + "&response_type=token";
        let project = window.open(url, "project", "width=550,height=270,left=150,top=200,toolbar=0,status=0");
        this.checkWinURL(project);
    }
    public checkWinURL(project: any) {
        let interval = setInterval(() => {
            try {
                let url = project.location.href;
                if (url.indexOf(window.location.origin) != -1) {
                    console.log("this.urls", url);
                    let subStr = url.substr(url.lastIndexOf('/') + 1);
                    if (subStr.indexOf('access_token') != -1) {
                        let access_token = subStr.substr(subStr.lastIndexOf('=') + 1);
                        this.getInstagramUserInfo(access_token);
                    } else {
                        this.pageService.showError("Authentication Failed");
                    }
                    clearInterval(interval);
                    project.close();
                }
            } catch (e) {
                console.log(e.TypeError);
                setTimeout(() => {
                    clearInterval(interval);
                    project.close();
                }, 120000);
            }
        }, 1000);
    }
    public instagramLogout(): void {
        this.ready = false;
        this.service.instagramLogout(this.tabId).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('Logout successfully');
                this.getInitData();
            }
        })
    }
}
