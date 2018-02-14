import { Component, ViewEncapsulation } from '@angular/core';
import { PageService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Tab, orderingServiceType } from '../../../../../theme/interfaces';
import { FoodOrderingService } from './food-ordering.service';
import { TabView, TabPanel } from 'primeng/primeng';
import { Locations } from "./locations/locations.component";
import { Services } from "./services/services.component";
import { Payment } from "./payment/payment.component";
import { Email } from "./email/email.component";
import { Menu } from "./menu/menu.component";
import { Extras } from "./extras/extras.component";
import { TOOLTIP_DIRECTIVES } from "ng2-bootstrap";

@Component({
    selector: 'tab-function-food-ordering',
    directives: [TabView, TabPanel, TOOLTIP_DIRECTIVES, Locations, Services, Payment, Email, Extras, Menu],
    encapsulation: ViewEncapsulation.None,
    template: require('./food-ordering.component.html'),
    styles: [require('./food-ordering.scss')],
    providers: [PageService, FoodOrderingService],
})

export class FoodOrdering {

    public tabID: number;
    public ready: boolean = false;
    public loader: boolean = true;
    public tabData: Tab;
    public data: any;
    public orderServiceType = orderingServiceType;
    public ordServiceType: number;
    public savedServiceType: number;

    constructor(
        private pageService: PageService,
        private params: RouteParams,
        private service: FoodOrderingService
    ) {
        this.tabID = parseInt(params.get('tabId'));
        this.service.tabID = this.tabID;
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        this.service.getInitData(this.tabID).subscribe(res => {
            if (res.success) {
                this.data = res.data;
                this.tabData = res.data.tabData;
                this.service.settings = JSON.parse(this.tabData.settings);
                this.ordServiceType = this.service.settings.order_service_type;
                this.savedServiceType = this.service.settings.order_service_type;
                this.service.currencySymbolList = res.data.currencySymbolList;
                this.ready = true;
                this.service.dataRetreived.next(true);
                this.service.dataRetreived.complete();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    onOrderServiceTypeChange(type: number): void {
        if (type === this.orderServiceType.MYCHECK) {
            this.ordServiceType = this.orderServiceType.MYCHECK;
        } else if (type === this.orderServiceType.IMENU360) {
            this.ordServiceType = this.orderServiceType.IMENU360;
        } else if (type === this.orderServiceType.OLO) {
            this.ordServiceType = this.orderServiceType.OLO;
        } else if (type === this.orderServiceType.EAT24) {
            this.ordServiceType = this.orderServiceType.EAT24;
        } else if (type === this.orderServiceType.GRUBHUB) {
            this.ordServiceType = this.orderServiceType.GRUBHUB;
        } else if (type === this.orderServiceType.SEAMLESS) {
            this.ordServiceType = this.orderServiceType.SEAMLESS;
        } else if (type === this.orderServiceType.ONOSYS) {
            this.ordServiceType = this.orderServiceType.ONOSYS;
        } else {
            this.ordServiceType = this.orderServiceType.CUSTOM;
        }
    }

    updateOrderingService(): void {
        this.loader = false;
        this.service.settings.order_service_type = this.ordServiceType;
        this.service.saveSettings(this.service.settings, this.service.tabID).subscribe(res => {
            if (res.success) {
                this.savedServiceType = this.ordServiceType;
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
            this.loader = true;
        });
    }

}