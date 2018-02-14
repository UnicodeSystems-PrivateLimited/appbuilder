import { Component, ViewEncapsulation } from '@angular/core';
import { PageService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Tab } from '../../../../../theme/interfaces';
import { ShoppingCartService } from './shopping-cart.service';
import { TabView, TabPanel } from 'primeng/primeng';
import { Payment } from "./payment/payment.component";
import { Delivery } from "./delivery/delivery.component";
import { Inventory } from "./inventory/inventory.component";
import { Email } from "./email/email.component";
import { TOOLTIP_DIRECTIVES } from "ng2-bootstrap";

@Component({
    selector: 'tab-function-shopping-cart',
    directives: [TabView, TabPanel, Payment, Delivery, Inventory, Email, TOOLTIP_DIRECTIVES],
    encapsulation: ViewEncapsulation.None,
    template: require('./shopping-cart.component.html'),
    styles: [require('./shopping-cart.scss')],
    providers: [PageService, ShoppingCartService],
})

export class ShoppingCart {

    public tabID: number;
    public ready: boolean = false;
    public tabData: Tab;
    public data: any;
    public settings: {
        go_back_prompt: boolean,
        shipping_instruction: boolean,
        category_view_display: number
    };

    constructor(
        private pageService: PageService,
        private params: RouteParams,
        private service: ShoppingCartService
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
                this.settings = JSON.parse(this.tabData.settings);
                this.service.currencySymbolList = res.data.currencySymbolList;
                this.ready = true;
                this.service.dataRetreived.next(true);
                this.service.dataRetreived.complete();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onUpdateSettingsClick(): void {
        this.service.saveSettings(this.settings, this.tabID).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

}