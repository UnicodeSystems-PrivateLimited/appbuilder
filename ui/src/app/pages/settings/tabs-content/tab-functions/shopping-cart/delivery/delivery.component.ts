import { Component, ViewEncapsulation, Input, OnInit, NgZone } from '@angular/core';
import { PageService, GridDataService } from '../../../../../../theme/services';
import { ShoppingCartService } from '../shopping-cart.service';
import { SelectItem, Dropdown, Dialog } from "primeng/primeng";
import {
    ShoppingCartBlockedCountry, ShoppingCartDelivery,
    ShoppingCartShippingCharge
} from "../../../../../../theme/interfaces/common-interfaces";
import { TOOLTIP_DIRECTIVES } from "ng2-bootstrap";

@Component({
    selector: 'shopping-cart-delivery',
    encapsulation: ViewEncapsulation.None,
    template: require('./delivery.component.html'),
    providers: [PageService],
    directives: [Dropdown, Dialog, TOOLTIP_DIRECTIVES]
})

export class Delivery implements OnInit {

    @Input() delivery: ShoppingCartDelivery;
    @Input() shippingCharges: ShoppingCartShippingCharge[] = [];
    @Input() blockedCountries: ShoppingCartBlockedCountry[] = [];
    @Input() countryList: any;
    @Input() currency: string;

    public selectedShippingCharges: boolean[] = [];
    public shippingChargesCheckAllToggle: boolean = false;
    public selectedBlockedCountries: boolean[] = [];
    public blockedCountriesCheckAllToggle: boolean = false;
    public showShippingChargeFormDialog: boolean = false;
    public shippingChargeFormHeader: string;
    public shippingCharge: ShoppingCartShippingCharge;
    public showBlockedCountryFormDialog: boolean = false;
    public blockedCountryFormHeader: string;
    public blockedCountry: ShoppingCartBlockedCountry;
    public shippingChargeCountryOptions: SelectItem[] = [];
    public blockedCountryOptions: SelectItem[] = [];

    constructor(private pageService: PageService,
                private service: ShoppingCartService,
                private dataService: GridDataService,
                private zone: NgZone) {
    }

    public ngOnInit(): void {
        this.shippingCharge = new ShoppingCartShippingCharge();
        this.shippingCharge.tab_id = this.service.tabID;

        this.blockedCountry = new ShoppingCartBlockedCountry();
        this.blockedCountry.tab_id = this.service.tabID;

        this.blockedCountryOptions.push({ label: "Please Select", value: null });
        for (let code in this.countryList) {
            this.blockedCountryOptions.push({ label: this.countryList[code], value: code });
        }
        this.shippingChargeCountryOptions = this.blockedCountryOptions.slice();
        // Insert Default option in shipping charge country options.
        this.shippingChargeCountryOptions.splice(1, 0, { label: "Default", value: 1 });
    }

    public onSaveClick(): void {
        this.service.saveDelivery(this.delivery).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onShippingMethodChange(): void {
        setTimeout(() => {
            this.zone.run(() => {
                if (!this.delivery.is_shipping_method) {
                    this.delivery.is_shipping_fee_taxable = false;
                    this.delivery.is_delivery_address_validation = false;
                }
            });
        });
    }

    public onShippingChargeSelectAllCheck(): void {
        setTimeout(() => {
            this.zone.run(() => {
                this.selectedShippingCharges = this.pageService.toggleAllCheckboxes(this.shippingChargesCheckAllToggle, this.shippingCharges);
            });
        });
    }

    public onShippingChargeCheck(): void {
        setTimeout(() => {
            this.zone.run(() => {
                this.shippingChargesCheckAllToggle = this.pageService.updateCheckAllToggle(this.selectedShippingCharges, this.shippingCharges);
            });
        });
    }

    public onBlockedCountrySelectAllCheck(): void {
        setTimeout(() => {
            this.zone.run(() => {
                this.selectedBlockedCountries = this.pageService.toggleAllCheckboxes(this.blockedCountriesCheckAllToggle, this.blockedCountries);
            });
        });
    }

    public onBlockedCountryCheck(): void {
        setTimeout(() => {
            this.zone.run(() => {
                this.blockedCountriesCheckAllToggle = this.pageService.updateCheckAllToggle(this.selectedBlockedCountries, this.blockedCountries);
            });
        });
    }

    public onAddNewShippingChargeClick(): void {
        this.shippingChargeFormHeader = "Add New Shipping Charge";
        this.shippingCharge = new ShoppingCartShippingCharge();
        this.shippingCharge.tab_id = this.service.tabID;
        this.showShippingChargeFormDialog = true;
        this.pageService.onDialogOpen();
    }

    public onEditShippingChargeClick(shippingCharge: ShoppingCartBlockedCountry): void {
        this.shippingChargeFormHeader = "Edit Tax Amount";
        this.shippingCharge = Object.assign({}, shippingCharge);
        this.showShippingChargeFormDialog = true;
        this.pageService.onDialogOpen();
    }

    public onShippingChargeFormSubmit(): void {
        PageService.showLoader();
        this.service.saveShippingCharge(this.shippingCharge).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.showShippingChargeFormDialog = false;
                this.pageService.showSuccess(res.message);
                this.updateShippingChargeList(res.data.id);
                this.shippingCharge = new ShoppingCartShippingCharge();
                this.shippingCharge.tab_id = this.service.tabID;
                this.shippingChargesCheckAllToggle = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    private updateShippingChargeList(id: number): void {
        if (!this.shippingCharge.id) { // New shipping charge created
            this.shippingCharge.id = id;
            this.shippingCharges.push(Object.assign({}, this.shippingCharge));
        } else { // Existing shipping charge updated
            this.dataService.getByID(this.shippingCharges, id, (data, index) => {
                this.shippingCharges[index] = Object.assign({}, this.shippingCharge);
            });
        }
    }

    public onDeleteShippingChargeClick(): void {
        if (
            this.selectedShippingCharges.length > 0
            && this.selectedShippingCharges.indexOf(true) !== -1
            && confirm("Do you really want to delete the selected items? ")
        ) {
            this.deleteShippingCharges();
        }
    }

    private deleteShippingCharges(): void {
        PageService.showLoader();
        let ids: any[] = [];
        for (let i in this.selectedShippingCharges) {
            if (this.selectedShippingCharges[i]) {
                ids.push(i);
            }
        }
        this.service.deleteShippingCharges(ids).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.selectedShippingCharges = [];
                for (let i = 0; i < ids.length; i++) {
                    this.dataService.getByID(this.shippingCharges, ids[i], (data, index) => {
                        this.shippingCharges.splice(index, 1);
                    });
                }
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onAddNewBlockedCountryClick(): void {
        this.blockedCountryFormHeader = "Add New Blocked Country";
        this.blockedCountry = new ShoppingCartBlockedCountry();
        this.blockedCountry.tab_id = this.service.tabID;
        this.showBlockedCountryFormDialog = true;
        this.pageService.onDialogOpen();
    }

    public onEditBlockedCountryClick(blockedCountry: ShoppingCartBlockedCountry): void {
        this.blockedCountryFormHeader = "Edit Tax Amount";
        this.blockedCountry = Object.assign({}, blockedCountry);
        this.showBlockedCountryFormDialog = true;
        this.pageService.onDialogOpen();
    }

    public onBlockedCountryFormSubmit(): void {
        PageService.showLoader();
        this.service.saveBlockedCountry(this.blockedCountry).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.showBlockedCountryFormDialog = false;
                this.pageService.showSuccess(res.message);
                this.updateBlockedCountryList(res.data.id);
                this.blockedCountry = new ShoppingCartBlockedCountry();
                this.blockedCountry.tab_id = this.service.tabID;
                this.blockedCountriesCheckAllToggle = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    private updateBlockedCountryList(id: number): void {
        if (!this.blockedCountry.id) { // New shipping charge created
            this.blockedCountry.id = id;
            this.blockedCountries.push(Object.assign({}, this.blockedCountry));
        } else { // Existing shipping charge updated
            this.dataService.getByID(this.blockedCountries, id, (data, index) => {
                this.blockedCountries[index] = Object.assign({}, this.blockedCountry);
            });
        }
    }

    public onDeleteBlockedCountryClick(): void {
        if (
            this.selectedBlockedCountries.length > 0
            && this.selectedBlockedCountries.indexOf(true) !== -1
            && confirm("Do you really want to delete the selected items? ")
        ) {
            this.deleteBlockedCountries();
        }
    }

    private deleteBlockedCountries(): void {
        PageService.showLoader();
        let ids: any[] = [];
        for (let i in this.selectedBlockedCountries) {
            if (this.selectedBlockedCountries[i]) {
                ids.push(i);
            }
        }
        this.service.deleteBlockedCountries(ids).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.selectedBlockedCountries = [];
                for (let i = 0; i < ids.length; i++) {
                    this.dataService.getByID(this.blockedCountries, ids[i], (data, index) => {
                        this.blockedCountries.splice(index, 1);
                    });
                }
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

}