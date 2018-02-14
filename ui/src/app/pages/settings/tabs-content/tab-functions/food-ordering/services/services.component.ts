import { Component, ViewEncapsulation, Input, OnInit } from '@angular/core';
import { PageService, GridDataService } from '../../../../../../theme/services';
import { FoodOrderingService } from '../food-ordering.service';
import { SelectItem, Dropdown, Dialog } from "primeng/primeng";
import { ServicesInfo } from "../../../../../../theme/interfaces/common-interfaces";
import { TOOLTIP_DIRECTIVES } from "ng2-bootstrap";

@Component({
    selector: 'food-ordering-services',
    encapsulation: ViewEncapsulation.None,
    template: require('./services.component.html'),
    providers: [PageService],
    directives: [Dropdown, Dialog, TOOLTIP_DIRECTIVES]
})

export class Services implements OnInit {

    @Input() servicesInfo: ServicesInfo;
    @Input() currency: string;

    public daysOptions = [];
    public deliveryDaysOptions = [];

    constructor(private pageService: PageService,
        private service: FoodOrderingService,
        private dataService: GridDataService
    ) {
        this.daysOptions = [
            {label: '0', value: 0},
            {label: '1', value: 1},
            {label: '2', value: 2},
            {label: '3', value: 3},
            {label: '4', value: 4},
            {label: '5', value: 5},
            {label: '6', value: 6}
        ];
        this.deliveryDaysOptions = [
            {label: 'Km', value: '1'},
            {label: 'Mi', value: '2'}
        ];
    }

    public ngOnInit(): void {
        //console.log('hello', this.servicesInfo);
    }

    public onSaveClick(): void {
        //this.servicesInfo.tabID = this.service.tabID;
        PageService.showLoader();
        this.service.saveServices(this.servicesInfo).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public convertDeliverRadius(): void {
        let res;
        if(this.servicesInfo.delivery_radius_type == '2') {
            res = this.servicesInfo.delivery_radius / 1.609344;
            this.servicesInfo.delivery_radius = res.toFixed(2);
        } else {
            res = this.servicesInfo.delivery_radius * 1.609344;
            this.servicesInfo.delivery_radius = res.toFixed(0);
        }
    }


}