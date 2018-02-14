import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse, QrCoupons } from '../../../../../theme/interfaces';

@Injectable()
export class QrCouponService {

    private _getTabDataURL: string = "../api/ws/function/qrCouponCode/init";
    private _saveCouponURL: string = "../api/ws/function/qrCouponCode/save";
    private _getCouponsListURL: string = "../api/ws/function/qrCouponCode/list";
    private _getSingleCouponURL: string = "../api/ws/function/qrCouponCode/get";
    private _deleteImageURL: string = "../api/ws/function/qrCouponCode/image/delete/";
    private _deleteCouponURL: string = "../api/ws/function/qrCouponCode/delete";
    private _sortCouponsURL: string = "../api/ws/function/qrCouponCode/sort";
    private _deletActivityURL: string = "../api/ws/function/qrCouponCode/activity/delete";
    private _getQRImgURL: string = "../api/ws/function/qrCouponCode/viewQRByCode";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }


    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }
    public saveCoupons(couponData: QrCoupons) {
        return this.formDataService.postData(this._saveCouponURL, couponData);
    }
    public getCouponsList(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getCouponsListURL + '/' + tabId);
    }
    public getSingleCouponData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getSingleCouponURL + '/' + id);
    }
    public deleteImage(imageType: string, id: number) {
        return this.dataService.getData(this._deleteImageURL + imageType + "/" + id);
    }
    public deleteCoupon(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteCouponURL, { id: ids });
    }
    public sortCouponsList(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortCouponsURL, { ids: ids });
    }
    public deleteActivity(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deletActivityURL, { id: ids });
    }
    public getQRImg(code: string): Observable<APIResponse> {
        return this.dataService.getData(this._getQRImgURL + '/' + code);
    }

}