import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse, GpsCoupons } from '../../../../../theme/interfaces';

@Injectable()
export class GpsCouponService {

    private _getTabDataURL: string = "../api/ws/function/gpsCouponCode/init";
    private _saveCouponURL: string = "../api/ws/function/gpsCouponCode/save";
    private _getCouponsListURL: string = "../api/ws/function/gpsCouponCode/list";
    private _getSingleCouponURL: string = "../api/ws/function/gpsCouponCode/get";
    private _deleteImageURL: string = "../api/ws/function/gpsCouponCode/image/delete/";
    private _deleteCouponURL: string = "../api/ws/function/gpsCouponCode/delete";
    private _sortCouponsURL: string = "../api/ws/function/gpsCouponCode/sort";
    private _deletActivityURL: string = "../api/ws/function/gpsCouponCode/activity/delete";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + tabId);
    }
    public saveCoupons(couponData: GpsCoupons) {
        return this.formDataService.postData(this._saveCouponURL, couponData);
    }
    public getCouponsList(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getCouponsListURL + '/' + tabId);
    }
    public getSingleCouponData(id: number): Observable<APIResponse> {
        return this.dataService.getData(this._getSingleCouponURL + '/' + id);
    }
    public deleteCoupon(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteCouponURL, { id: ids });
    }
    public sortCouponsList(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._sortCouponsURL, { ids: ids });
    }
    public deleteImage(imageType: string, id: number) {
        return this.dataService.getData(this._deleteImageURL + imageType + "/" + id);
    }
     public deleteActivity(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deletActivityURL, { id: ids });
    }
}