import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { PictureGalleryTabItem, ImageServiceType, GalleryPictureData, ImportGalleryData, APIResponse, FBPageData, SubmitedFBAlbumList } from '../../../../../theme/interfaces/common-interfaces';
@Injectable()
export class PictureGalleryService {

    private _getTabDataURL: string = "../api/ws/function/image-gallery/init";
    private _sortPictureGalleryURL: string = "../api/ws/function/image-gallery/sort";
    private _deletePictureGalleryURL: string = "../api/ws/function/image-gallery/delete";
    private _saveURL: string = "../api/ws/function/image-gallery/save";
    private _getPictureGalleryListURL: string = "../api/ws/function/image-gallery/list";
    private _getPictureGalleryDataURL: string = "../api/ws/function/image-gallery/info";
    private _deleteThumbnailImageURL: string = "../api/ws/function/image-gallery/thumbnail/delete";
    private _deleteGalleryImageURL: string = "../api/ws/function/image-gallery/image/delete";
    private _getGalleryPictureDataURL: string = "../api/ws/function/image-gallery/image/description";
    private _saveGalleryPictureDataURL: string = "../api/ws/function/image-gallery/image/description/save";
    public saveImportWebUrlPictureDataURL: string = "../api/ws/function/image-gallery/getImageUrl";
    private _saveImportWebUrlPictureDataURLNonSSE: string = "../api/ws/function/image-gallery/saveWebUrlImages";
    private _saveImportFBUrlDataURL: string = "../api/ws/function/image-gallery/user/facebooklogin";
    private fbPageData: FBPageData = new FBPageData();
    private _getFBPageAlbumListURL: string = "../api/ws/function/image-gallery/facebook/pageAlbums";
    private _saveFBAlbumImagesURL: string = "../api/ws/function/image-gallery/facebook/gallaryImport";
    private _saveImageservicetype: string = "../api/ws/function/image-gallery/imageServiceType";
    private _sortImagesURL: string = "../api/ws/function/image-gallery/images/sort";
    private _getInstagramUserInfoURL: string = "../api/ws/function/image-gallery/instagram/user/info";
    private _logoutImstagramUrl: string = "../api/ws/function/image-gallery/instagram/lagout";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }

    public sortGalleryList(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortPictureGalleryURL, { ids: ids });
    }

    public deletePictureGallery(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deletePictureGalleryURL, { id: ids });
    }

    public savePictureGalleryItem(item: PictureGalleryTabItem | Object) {
        return this.formDataService.postData(this._saveURL, item);
    }

    public getPictureGalleryList(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getPictureGalleryListURL + '/' + tabId);
    }

    public getPictureGalleryData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getPictureGalleryDataURL + '/' + id);
    }

    public deleteThumbnailImage(type: string, id: number): Observable<APIResponse> {
        return this.dataService.getData(this._deleteThumbnailImageURL + '/' + id);
    }

    public deleteGalleryImage(type: string, id: number): Observable<APIResponse> {
        return this.dataService.getData(this._deleteGalleryImageURL + '/' + id);
    }

    public getGalleryPictureData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getGalleryPictureDataURL + '/' + id);
    }

    public saveGalleryPictureData(galleryPictureData: GalleryPictureData | Object) {
        return this.formDataService.postData(this._saveGalleryPictureDataURL, galleryPictureData);
    }

    public saveImportWebUrlPictureData(importGalleryData: ImportGalleryData | Object) {
        return this.formDataService.postData(this._saveImportWebUrlPictureDataURLNonSSE, importGalleryData);
    }

    public saveImportFBUrlData(importGalleryData: ImportGalleryData | Object) {
        return this.formDataService.postData(this._saveImportFBUrlDataURL, importGalleryData);
    }

    public getFBPageAlbumList(fbPageUrl: string, accessKey: string) {
        this.fbPageData.accessKey = accessKey;
        this.fbPageData.fbPageUrl = fbPageUrl;
        return this.formDataService.postData(this._getFBPageAlbumListURL, this.fbPageData);
    }

    public saveFBAlbumImages(submitedFBAlbumList: SubmitedFBAlbumList) {
        return this.formDataService.postData(this._saveFBAlbumImagesURL, submitedFBAlbumList);
    }
    public saveImageServiceType(imageServicetype: ImageServiceType) {
        return this.dataService.postData(this._saveImageservicetype, imageServicetype)
    }
    public sortImages(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortImagesURL, { ids: ids });
    }
    public getInstagramUserInfo(access_token: any): Observable<APIResponse> {
        return this.dataService.getData(this._getInstagramUserInfoURL + '/' + access_token);
    }
    public instagramLogout(tabId:number): Observable<APIResponse>{
       return this.dataService.getData(this._logoutImstagramUrl+'/'+tabId);
    }
}