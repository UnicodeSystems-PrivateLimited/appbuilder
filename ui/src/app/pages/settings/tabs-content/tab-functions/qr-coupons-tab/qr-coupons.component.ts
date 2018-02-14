import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { PageService, GridDataService } from '../../../../../theme/services';
import { Dialog, Dropdown, RadioButton, Calendar, Lightbox, MultiSelect, SelectItem, InputTextarea } from 'primeng/primeng';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { Tab, QrCoupons, TimeZone } from '../../../../../theme/interfaces';
import { MobileViewComponent, ThumbnailFileReader } from '../../../../../components';
import { QrCouponService } from './qr-coupons.service';
var moment = require('moment/moment');


@Component({
    selector: 'tab-function-qr-coupon-tab',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, Dragula, Dialog, InputTextarea, MobileViewComponent, Dropdown, ThumbnailFileReader, Calendar],
    template: require('./qr-coupons.component.html'),
    styles: [require('./qr-coupons-tab.scss')],
    viewProviders: [DragulaService],
    providers: [PageService, , GridDataService, QrCouponService]
})

export class QrCouponsComponent {
    public id: number;
    public tabId: number;
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
    public activities = [];
    public deleteCouponId: number = null;
    public couponHeader: string;
    public timezoneSelect = [];
    public phoneHeaderImageTarget: any = null;
    public tabletHeaderImageTarget: any = null;
    public timezone: TimeZone[] = [];
    public itemData: QrCoupons[] = [];
    public couponData: QrCoupons = new QrCoupons();
    public coupon_end_date: Date = new Date();
    public coupon_start_date: Date = new Date();
    private ENABLED = 1;
    private DISABLED = 2;
    public defaultTimezone: string;
    public currentDate: Date = new Date();
    public qrCode: string = null;
    public qrUrl: string = null;
    public newZone: string;
    public checkTrue: boolean = false;
    // ------------------- DISPLAY CONTROL ----------------------------
    public ready: boolean = false;
    public dialogDisplay: boolean = false;
    public imageShow: boolean = false;
    public showLoader: boolean = false;
    public loader: boolean = false;
    public showDeleteDialog: boolean = false;
    public qrCodeDialog: boolean = false;
    public selectedItem: boolean[] = [];
    public checkAll: boolean = false;
    public addSaveButtonHide: boolean = false;
    //------------------------------------------------------------------
    public customerSavedZone: number = null;

    constructor(private pageService: PageService,
        private params: RouteParams,
        private dragulaService: DragulaService,
        private service: QrCouponService,
        private dataService: GridDataService) {
        this.tabId = parseInt(params.get('tabId'));
        this.id = parseInt(params.get('ids'));
        dragulaService.dropModel.subscribe((value) => {
            this.sortCoupons();
        });
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        // One request to get all initial data.
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                this.tabData = res.data.tabData;
                this.itemData = res.data.itemData;
                if (res.data.timeSettings) {
                    this.customerSavedZone = res.data.timeSettings.time_zone;
                }
                let tim = new Date().toString();
                let ctime = tim.split(" ");
                this.defaultTimezone = ctime[5];
                let myZone = this.defaultTimezone.split("");
                this.newZone = myZone[0] + myZone[1] + myZone[2] + myZone[3] + myZone[4] + myZone[5] + ':' + myZone[6] + myZone[7];
                let count = 0;
                for (let item of res.data.timezoneList) {
                    this.timezoneSelect.push({ label: item.name, value: item.id });
                    if (this.customerSavedZone) {
                        this.couponData.timezone_id = this.customerSavedZone;
                    } else {
                        if (this.newZone === item.offset_name) {
                            count++;
                            if(count == 1){
                            this.couponData.timezone_id = item.id;
                            }
                        }
                    }
                }
                if (res.data.timezoneList) {
                    this.timezone = res.data.timezoneList;
                }
                this.ready = true;
            } else {
                console.log('no data found');
            }
        });
    }

    public showAddDialog() {
        this.activities = [];
        this.dialogDisplay = true;
        this.pageService.onDialogOpen();
        this.coupon_end_date = null;
        this.coupon_start_date = null;
        this.couponHeader = 'ADD NEW QR COUPON';
        this.imageShow = true;
        let count = 0;
        for (let item of this.timezone) {
            if (this.customerSavedZone) {
                this.couponData.timezone_id = this.customerSavedZone;
            } else {
                if (this.newZone === item.offset_name) {
                    count++;
                    if(count == 1){
                    this.couponData.timezone_id = item.id;
                    }
                }
            }
        }

    }

    public onPhoneHeaderImageChange(event: any): void {
        this.phoneHeaderImageTarget = event.target;
        this.couponData.phone_header_image = event.file[0];
    }

    public onTabletHeaderImageChange(event: any): void {
        this.tabletHeaderImageTarget = event.target;
        this.couponData.tablet_header_image = event.file[0];
    }

    public onSaveCoupon(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.couponData.tab_id = this.tabId;
        if ((this.coupon_end_date == null) || (!this.coupon_end_date)) {
            var mcoupon_end_date = null;
        } else {
            var mcoupon_end_date = moment(this.coupon_end_date).format('YYYY-MM-DD');
        }
        this.couponData.end_date = mcoupon_end_date;
        if ((this.coupon_start_date == null) || (!this.coupon_start_date)) {
            var mcoupon_start_date = null;
        } else {
            var mcoupon_start_date = moment(this.coupon_start_date).format('YYYY-MM-DD');
        }
        this.couponData.start_date = mcoupon_start_date;
        let data: QrCoupons = Object.assign({}, this.couponData);
        data.coupon_reuse = data.coupon_reuse ? this.ENABLED : this.DISABLED;
        data.coupon_status = data.coupon_status ? this.ENABLED : this.DISABLED;
        data.is_header_required = data.is_header_required ? 1 : 2;
        this.service.saveCoupons(data).subscribe(res => {
            console.log(res);
            if (res.success) {
                this.pageService.showSuccess("Coupon saved succesfully.");
                this._clearImageInputs();
                this.getCouponsList();
                this.couponData = new QrCoupons();
                this.imageShow = false;
                this.dialogDisplay = false;
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
            this.showLoader = false;
        });
    }

    private _clearImageInputs(): void {
        if (this.phoneHeaderImageTarget) {
            this.phoneHeaderImageTarget.value = null;
            this.couponData.phone_header_image = null;
        }
        if (this.tabletHeaderImageTarget) {
            this.tabletHeaderImageTarget.value = null;
            this.couponData.tablet_header_image = null;
        }
    }

    public getCouponsList(): void {
        this.service.getCouponsList(this.tabId).subscribe(res => {
            if (res.success) {
                this.itemData = res.data;
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public showEditDialog(id: number): void {
        this.dialogDisplay = true;
        this.pageService.onDialogOpen();
        this.couponHeader = 'EDIT COUPON DETAILS';
        this.imageShow = true;
        this.service.getSingleCouponData(id).subscribe((res) => {
            if (res.success) {
                this.couponData = res.data;
                this.couponData.coupon_reuse = (res.data.coupon_reuse == 1) ? 1 : 0;
                this.couponData.coupon_status = (res.data.coupon_status == 1) ? 1 : 0;
                this.couponData.is_header_required = (res.data.is_header_required == 1) ? true : false;
                this.coupon_start_date = res.data.start_date ? moment(res.data.start_date).format('MM/DD/YYYY') : null;
                this.coupon_end_date = res.data.end_date ? moment(res.data.end_date).format('MM/DD/YYYY') : null;
                this.couponData.phone_header_image_url = res.data.phone_header_image;
                this.activities = res.data.activities;
            }
        });
    }

    public onDialogHide(): void {
        this._clearImageInputs();
        this.imageShow = false;
        this.coupon_start_date = new Date();
        this.coupon_end_date = new Date();
        this.couponData = new QrCoupons();
    }

    public deleteImage(imageType: string, id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deleteImage(imageType, id).subscribe(res => {
                    console.log(imageType);
                    console.log(res);
                    if (res.success) {
                        if (imageType == "phone_header") {
                            this.couponData.phone_header_image = null;
                            this.phoneHeaderImageTarget = null;
                            this.couponData.phone_header_image_url = null;
                        }
                        else if (imageType == "tablet_header") {
                            this.couponData.tablet_header_image = null;
                            this.tabletHeaderImageTarget = null;
                        }
                        this.pageService.showSuccess("Image deleted succesfully.");
                        this._clearImageInputs();
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }

    //    public onDeleteClick(id: number): void {
    //        this.deleteCouponId = id;
    //        this.showDeleteDialog = true;
    //    }
    //
    //    public deleteCoupon(): void {
    //        this.showLoader = true;
    //        this.service.deleteCoupon([this.deleteCouponId]).subscribe((res) => {
    //            if (res.success) {
    //                this.showLoader = false;
    //                this.showDeleteDialog = false;
    //                this.pageService.showSuccess('Coupon Deleted Successfully');
    //                this.getCouponsList();
    //                this.itemData.forEach((item, index) => {
    //                    if (item.id === this.deleteCouponId) {
    //                        this.itemData.splice(index, 1);
    //                    }
    //                });
    //            } else {
    //                this.pageService.showError(res.message);
    //            }
    //        });
    //    }

    public sortCoupons(): void {
        let ids: number[] = [];
        for (let item of this.itemData) {
            ids.push(item.id);
        }
        this.service.sortCouponsList(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('Coupon order saved.')
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public viewQrCodeDialog(id: number): void {
        this.qrCodeDialog = true;
        this.pageService.onDialogOpen();
        this.loader = true;
        this.qrUrl = null;
        this.service.getSingleCouponData(id).subscribe((res) => {
            if (res.success) {
                this.loader = false;
                this.qrUrl = res.data.qr_coupon_code;
                this.qrCode = res.data.qr_code;
            }
        });
    }

    public onDeleteClick(): void {
        if (this.selectedItem.length > 0 && this.selectedItem.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete coupon? ");
            if (yes) {
                this.deleteCoupon();
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
            for (let i in this.itemData) {
                this.selectedItem[this.itemData[i].id] = true;
            }
            this.checkTrue = true;
        }
        else {
            for (let i in this.itemData) {
                this.selectedItem[this.itemData[i].id] = false;
            }
            this.checkTrue = false;
        }
    }

    public deleteCoupon(): void {
        let ids: any[] = [];
        for (let i in this.selectedItem) {
            if (this.selectedItem[i]) {
                ids.push(i);
            }
        }
        this.showLoader = true;
        this.service.deleteCoupon(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkTrue = false;
                                this.selectedItem = [];

                for (var i = 0; i < ids.length; i++) {
                    console.log('ids==============', ids[i]);
                    this.itemData.forEach((itemData, index) => {
                        console.log('itemData.id==============', itemData.id);
                        if (itemData.id == ids[i]) {
                            console.log('in');
                            this.itemData.splice(index, 1);
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

    // disble enter keyCode
    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.which == 13 || event.keyCode == 13)
            event.preventDefault();
    }

    public onCheckTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.itemData.forEach((itemData) => {
                console.log('itemData', itemData);
                console.log('checkedTab', checkedTab);
                if (itemData.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedItem[itemData.id]) {
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

    public deleteActivity(id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deleteActivity([id]).subscribe(res => {
                    console.log(res);
                    if (res.success) {
                        for (var i = 0; i < this.activities.length; i++) {
                            if (this.activities[i].id == id) {
                                this.activities.splice(i, 1);
                            }
                        }
                        this.pageService.showSuccess("Activity deleted succesfully.");
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }

    public viewQrImgByCode(qrCode: string): void {
        if (qrCode != null) {
            this.qrCodeDialog = true;
            this.pageService.onDialogOpen();
            this.loader = true;
            this.qrUrl = null;
            this.qrCode = null;
            this.service.getQRImg(qrCode).subscribe((res) => {
                if (res.success) {
                    this.loader = false;
                    this.qrUrl = res.data;
                    this.qrCode = qrCode;
                } else {
                    this.pageService.showError(res.message);
                }
            });
        } else {
            this.pageService.showError('Enter a QR code.');
        }
    }
}
