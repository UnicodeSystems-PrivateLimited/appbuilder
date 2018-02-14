import { Component, ViewEncapsulation, Input, NgZone, OnInit } from '@angular/core';
import { PageService, GridDataService } from '../../../../../../theme/services';
import { ShoppingCartService } from '../shopping-cart.service';
import { SelectItem, Dropdown, Dialog } from "primeng/primeng";
import {
    AuthorizeNetCredentials,
    PaypalCredentials,
    ShoppingCartPayment,
    ShoppingCartPaymentTaxDetails,
    StripeCredentials
} from "../../../../../../theme/interfaces/common-interfaces";
import { TOOLTIP_DIRECTIVES } from "ng2-bootstrap";

@Component({
    selector: 'shopping-cart-payment',
    encapsulation: ViewEncapsulation.None,
    template: require('./payment.component.html'),
    providers: [PageService],
    directives: [Dropdown, Dialog, TOOLTIP_DIRECTIVES]
})

export class Payment implements OnInit {

    @Input() payment: ShoppingCartPayment;
    @Input() currencyOptions: SelectItem;
    @Input() paymentGatewayOptions: SelectItem;
    @Input() taxMethodOptions: SelectItem;
    @Input() taxAmountList: ShoppingCartPaymentTaxDetails[] = [];

    public showTaxAmountFormDialog: boolean = false;
    public taxAmountFormHeader: string;
    public taxAmount: ShoppingCartPaymentTaxDetails;
    public selectedTaxAmounts: boolean[] = [];
    public checkAllToggle: boolean = false;
    public authorizeNetCredentials: AuthorizeNetCredentials;
    public paypalCredentials: PaypalCredentials;
    public stripeCredentials: StripeCredentials;

    public PAYMENT_GATEWAY = {
        AUTHORIZE_NET: 1,
        PAYPAL: 2,
        STRIPE: 3
    };

    constructor(private pageService: PageService,
                private service: ShoppingCartService,
                private dataService: GridDataService,
                private zone: NgZone) {
        this.authorizeNetCredentials = new AuthorizeNetCredentials();
        this.paypalCredentials = new PaypalCredentials();
        this.stripeCredentials = new StripeCredentials();
    }

    public ngOnInit(): void {
        this.taxAmount = new ShoppingCartPaymentTaxDetails();
        this.taxAmount.payment_id = this.payment.id;

        switch (this.payment.payment_gateway) {
            case this.PAYMENT_GATEWAY.AUTHORIZE_NET:
                this.authorizeNetCredentials = <AuthorizeNetCredentials>this.payment.payment_gateway_credentials;
                break;
            case this.PAYMENT_GATEWAY.PAYPAL:
                this.paypalCredentials = <PaypalCredentials>this.payment.payment_gateway_credentials;
                break;
            case this.PAYMENT_GATEWAY.STRIPE:
                this.stripeCredentials = <StripeCredentials>this.payment.payment_gateway_credentials;
                break;
            default:
                this.payment.payment_gateway_credentials = null;
        }
    }

    public onSaveClick(): void {
        this.service.savePayment(this.payment).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onAddNewTaxAmountClick(): void {
        this.taxAmountFormHeader = "Add New Tax Amount";
        this.taxAmount = new ShoppingCartPaymentTaxDetails();
        this.taxAmount.payment_id = this.payment.id;
        this.showTaxAmountFormDialog = true;
        this.pageService.onDialogOpen();
    }

    public onTaxAmountFormSubmit(): void {
        PageService.showLoader();
        this.service.saveTaxAmount(this.taxAmount).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.showTaxAmountFormDialog = false;
                this.pageService.showSuccess(res.message);
                this.updateTaxList(res.data.id);
                this.taxAmount = new ShoppingCartPaymentTaxDetails();
                this.taxAmount.payment_id = this.payment.id;
                this.checkAllToggle = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    private updateTaxList(taxID: number): void {
        if (!this.taxAmount.id) { // New tax created
            this.taxAmount.id = taxID;
            this.taxAmountList.push(Object.assign({}, this.taxAmount));
        } else { // Existing tax updated
            this.dataService.getByID(this.taxAmountList, taxID, (data, index) => {
                this.taxAmountList[index] = Object.assign({}, this.taxAmount);
            });
        }
    }

    public onTaxEditClick(tax: ShoppingCartPaymentTaxDetails): void {
        this.taxAmountFormHeader = "Edit Tax Amount";
        this.taxAmount = Object.assign({}, tax);
        this.showTaxAmountFormDialog = true;
        this.pageService.onDialogOpen();
    }

    public onTaxCheck(): void {
        setTimeout(() => {
            this.zone.run(() => {
                this.checkAllToggle = this.pageService.updateCheckAllToggle(this.selectedTaxAmounts, this.taxAmountList);
            });
        });

    }

    public onSelectAllCheck(): void {
        setTimeout(() => {
            this.zone.run(() => {
                this.selectedTaxAmounts = this.pageService.toggleAllCheckboxes(this.checkAllToggle, this.taxAmountList);
            });
        });
    }

    public onTaxDeleteClick(): void {
        if (
            this.selectedTaxAmounts.length > 0
            && this.selectedTaxAmounts.indexOf(true) !== -1
            && confirm("Do you really want to delete the selected items? ")
        ) {
            this.deleteTaxDetails();
        }
    }

    private deleteTaxDetails(): void {
        PageService.showLoader();
        let ids: any[] = [];
        for (let i in this.selectedTaxAmounts) {
            if (this.selectedTaxAmounts[i]) {
                ids.push(i);
            }
        }
        this.service.deleteTaxAmounts(ids).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.selectedTaxAmounts = [];
                for (let i = 0; i < ids.length; i++) {
                    this.dataService.getByID(this.taxAmountList, ids[i], (data, index) => {
                        this.taxAmountList.splice(index, 1);
                    });
                }
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onPaymentGatewayChange(): void {
        switch (this.payment.payment_gateway) {
            case this.PAYMENT_GATEWAY.AUTHORIZE_NET:
                this.payment.payment_gateway_credentials = this.authorizeNetCredentials;
                break;
            case this.PAYMENT_GATEWAY.PAYPAL:
                this.payment.payment_gateway_credentials = this.paypalCredentials;
                break;
            case this.PAYMENT_GATEWAY.STRIPE:
                this.payment.payment_gateway_credentials = this.stripeCredentials;
                break;
            default:
                this.payment.payment_gateway_credentials = null;
        }
    }

}