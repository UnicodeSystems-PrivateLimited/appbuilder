import { Component, ViewEncapsulation, Input, NgZone, OnInit } from '@angular/core';
import { PageService, GridDataService } from '../../../../../../theme/services';
import { FoodOrderingService } from '../food-ordering.service';
import { SelectItem, Dropdown, Dialog } from "primeng/primeng";
import { TOOLTIP_DIRECTIVES } from "ng2-bootstrap";
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';

@Component({
    selector: 'food-ordering-extras',
    encapsulation: ViewEncapsulation.None,
    template: require('./extras.component.html'),
    viewProviders: [DragulaService],
    providers: [PageService],
    directives: [Dropdown, Dialog, TOOLTIP_DIRECTIVES, Dragula]
})

export class Extras implements OnInit {

    // @Input() payment: ShoppingCartPayment;
    // @Input() currencyOptions: SelectItem;
    // @Input() paymentGatewayOptions: SelectItem;
    // @Input() taxMethodOptions: SelectItem;
    // @Input() taxAmountList: ShoppingCartPaymentTaxDetails[] = [];

    public showAddLocationDialog: boolean = false;
    public taxAmountFormHeader: string;
    public selectedTaxAmounts: boolean[] = [];
    public checkAll: boolean = false;
    public locationInfo: any = [];

    constructor(private pageService: PageService,
        private service: FoodOrderingService,
        private dataService: GridDataService,
        private zone: NgZone) { }

    public ngOnInit(): void {
        this.locationInfo.start_order = 'Order Now';
    }

    public onSaveClick(): void {
        alert('Save');
    }

    public showLocationDialog(): void {
        this.showAddLocationDialog = true;
    }

    public onCheckAllChange(): void {
        // this.refreshSelectedItem();
        // if (!this.checkAll) {
        //     for (let i in this.pdfs) {
        //         this.selectedPDF[this.pdfs[i].id] = true;
        //     }
        //     this.checkTrue = true;
        // }
        // else {
        //     for (let i in this.pdfs) {
        //         this.selectedPDF[this.pdfs[i].id] = false;
        //     }
        //     this.checkTrue = false;
        // }
    }

}