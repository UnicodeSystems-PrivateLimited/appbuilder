import { Component, ViewEncapsulation, Input, OnInit, NgZone } from '@angular/core';
import { PageService, GridDataService } from '../../../../../../theme/services';
import { FoodOrderingService } from '../food-ordering.service';
import { SelectItem, Dropdown, Dialog} from "primeng/primeng";
import { TAB_DIRECTIVES, TabsetComponent, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import {
    FoodOrderingEmailCustomerConfirmation, FoodOrderingEmailAdminReceipt, FoodOrderingCustomGuides
} from "../../../../../../theme/interfaces/common-interfaces";

@Component({
    selector: 'food-ordering-email',
    encapsulation: ViewEncapsulation.None,
    template: require('./email.component.html'),
    providers: [PageService],
    directives: [Dropdown, Dialog, TOOLTIP_DIRECTIVES, TAB_DIRECTIVES],
})

export class Email implements OnInit {

    @Input() emailCustomerConfirmation: FoodOrderingEmailCustomerConfirmation;
    @Input() emailAdminReceipt: FoodOrderingEmailAdminReceipt;
    @Input() emailCustomGuides: FoodOrderingCustomGuides;

    public customerConfirmationEditorView: any = null;
    public adminReceiptEditorView: any = null;
    public customGuidesEditorView: any = null;

    constructor(
        private pageService: PageService,
        private service: FoodOrderingService,
        private dataService: GridDataService
    ) {
    }

    public ngOnInit(): void {
        this.service.dataRetreived.subscribe(() => {
            console.log("Data retrieved.");
            this.initEditor();
        });
    }

    private initEditor(): void {
        setTimeout(() => {
            let customerConfirmationEditorDiv = window["_globalJQuery"]("div.dev-customer-confirmation-editor");
            customerConfirmationEditorDiv.froalaEditor({
                fileUploadURL: this.pageService.editorURLs.fileUpload,
                videoUploadURL: this.pageService.editorURLs.videoUpload,
                imageUploadURL: this.pageService.editorURLs.imageUpload + "/" + sessionStorage.getItem('appId'),
                imageManagerLoadURL: this.pageService.editorURLs.imageManagerLoad + "/" + sessionStorage.getItem('appId'),
            });
            this.customerConfirmationEditorView = customerConfirmationEditorDiv.find(".fr-view");
            customerConfirmationEditorDiv.froalaEditor('placeholder.hide');
            this.customerConfirmationEditorView.html(this.emailCustomerConfirmation.template);

            let adminReceiptEditorDiv = window["_globalJQuery"]("div.dev-admin-receipt-editor");
            adminReceiptEditorDiv.froalaEditor({
                fileUploadURL: this.pageService.editorURLs.fileUpload,
                videoUploadURL: this.pageService.editorURLs.videoUpload,
                imageUploadURL: this.pageService.editorURLs.imageUpload + "/" + sessionStorage.getItem('appId'),
                imageManagerLoadURL: this.pageService.editorURLs.imageManagerLoad + "/" + sessionStorage.getItem('appId'),
            });
            this.adminReceiptEditorView = adminReceiptEditorDiv.find(".fr-view");
            adminReceiptEditorDiv.froalaEditor('placeholder.hide');
            this.adminReceiptEditorView.html(this.emailAdminReceipt.template);

            let customGuidesEditorDiv = window["_globalJQuery"]("div.dev-custom-guides-editor");
            customGuidesEditorDiv.froalaEditor({
                fileUploadURL: this.pageService.editorURLs.fileUpload,
                videoUploadURL: this.pageService.editorURLs.videoUpload,
                imageUploadURL: this.pageService.editorURLs.imageUpload + "/" + sessionStorage.getItem('appId'),
                imageManagerLoadURL: this.pageService.editorURLs.imageManagerLoad + "/" + sessionStorage.getItem('appId'),
            });
            this.customGuidesEditorView = customGuidesEditorDiv.find(".fr-view");
            customGuidesEditorDiv.froalaEditor('placeholder.hide') 
            this.customGuidesEditorView.html(this.emailCustomGuides.order_items_list_template);
        });
    }

    public onSaveClickEmailFood(): void {
        this.emailCustomerConfirmation.template = this.customerConfirmationEditorView.html() == '<p><br></p>' ? '' : this.customerConfirmationEditorView.html();
        this.emailAdminReceipt.template = this.adminReceiptEditorView.html() == '<p><br></p>' ? '' : this.adminReceiptEditorView.html();
        this.emailCustomGuides.order_items_list_template = this.customGuidesEditorView.html() == '<p><br></p>' ? '' : this.customGuidesEditorView.html();
        let data = {
            customerConfirmation: this.emailCustomerConfirmation,
            adminReceipt: this.emailAdminReceipt,
            customGuides: this.emailCustomGuides
        }
        this.service.saveEmailFood(data).subscribe(res => {console.log(res);
            if (res.success) {
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

}