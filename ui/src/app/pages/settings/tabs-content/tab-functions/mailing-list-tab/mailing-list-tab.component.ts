import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, RadioButton, Slider, InputSwitch, SelectItem } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { MailingList, MailingListCategory, Tab, MailChimp, IContact } from '../../../../../theme/interfaces';
import { MobileViewComponent, ThumbnailFileReader } from '../../../../../components';
import { MailingListTabService } from './mailing-list-tab.service';
// import { CKEditor } from 'ng2-ckeditor';

@Component({
    selector: 'tab-function-mailing-list-tab',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, Dialog, ThumbnailFileReader, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, Dragula, RadioButton, Slider, InputSwitch, MobileViewComponent],
    encapsulation: ViewEncapsulation.None,
    template: require('./mailing-list-tab.component.html'),
    styles: [require('./mailing-list-tab.scss')],
    viewProviders: [DragulaService],
    providers: [PageService, MailingListTabService, GridDataService]
})

export class MailingListTab {

    public tabId: number;
    public ready: boolean = false;
    public showEditCategoriesDialog: boolean = false;
    public showCategoryDialog: boolean = false;
    public showEditCategoryDialog: boolean = false;
    public showMailchimpDialogBox: boolean = false;
    public showiContactDialogBox: boolean = false;
    public showCampaignMonitorDialogBox: boolean = false;
    public showConstantContactDialogBox: boolean = false;
    public showGetResponseDialogBox: boolean = false;
    public showMyEmmaDialogBox: boolean = false;
    public showVerticalOneDialogBox: boolean = false;
    public showVerticalTwoDialogBox: boolean = false;
    public imageTarget: any = null;
    public charCount: any = 132;
    public header: string;
    public showLoader: boolean = false;
    public addSaveButtonHide: boolean = false;
    public categories = [];
    public account = [];
    public folder = [];
    public lists = [];
    public mailingData: MailingList = new MailingList();
    public mailChimp: MailChimp = new MailChimp();
    public iContact: IContact = new IContact();
    public categoryData: MailingListCategory = new MailingListCategory();
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
   

    constructor(private pageService: PageService, private params: RouteParams, private dataService: GridDataService, private service: MailingListTabService) {
        this.tabId = parseInt(params.get('tabId'));
    }

    public ngOnInit(): void {
        this.ready = true;
        this.getInitData();
    }

    public getInitData(): void {
        this.showLoader = true;
        this.service.getInitData(this.tabId).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                if (res.data.settingsData) {
                    this.mailingData = res.data.settingsData;
                    if (res.data.settingsData.automatic_upload) {
                        this.mailingData.automatic_upload = res.data.settingsData.automatic_upload ? true : false;
                    }
                    if (res.data.settingsData.prompt_action) {
                        this.mailingData.prompt_action = res.data.settingsData.prompt_action ? true : false;
                    }
                    this.mailingData.image_file_url = res.data.settingsData.image_file;
                }

                this.tabData = res.data.tabData;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public showEditDialog(): void {
        this.showEditCategoriesDialog = true;
        this.pageService.onDialogOpen();
        this.getCategoryList();
    }

    public showAddCatDialog(): void {
        this.header = 'ADD CATEGORY';
        this.showCategoryDialog = true;
        this.pageService.onDialogOpen();
        this.categoryData = new MailingListCategory();
    }

    public showEditCatDialog(id: number): void {
        this.header = 'EDIT CATEGORY DETAILS';
        this.showCategoryDialog = true;
        this.pageService.onDialogOpen();
        this.showLoader = true;
        this.service.getCategoryData(id).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                this.categoryData = res.data.itemData;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public showMailchimpDialog(): void {
        this.showMailchimpDialogBox = true;
        this.pageService.onDialogOpen();
    }

    public showiContactDialog(): void {
        this.showiContactDialogBox = true;
        this.pageService.onDialogOpen();
        this.getMailData();
    }

    public showConstantContactDialog(): void {
        this.showConstantContactDialogBox = true;
         this.pageService.onDialogOpen();
    }

    public showCampaignMonitorDialog(): void {
        this.showCampaignMonitorDialogBox = true;
         this.pageService.onDialogOpen();
    }

    public showGetResponseDialog(): void {
        this.showGetResponseDialogBox = true;
         this.pageService.onDialogOpen();
    }

    public showMyEmmaDialog(): void {
        this.showMyEmmaDialogBox = true;
         this.pageService.onDialogOpen();
    }
    public showVerticalOneDialog(): void {
        this.showVerticalOneDialogBox = true;
         this.pageService.onDialogOpen();
    }
    public showVerticalTwoDialog(): void {
        this.showVerticalTwoDialogBox = true;
         this.pageService.onDialogOpen();
    }

    public onDeleteClick(id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deleteCategory([id]).subscribe(res => {
                    if (res.success) {
                        this.pageService.showSuccess("Category deleted succesfully.");
                        this.categories.forEach((cat, index) => {
                            if (cat.id === id) {
                                this.categories.splice(index, 1);
                            }
                        });
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }

    }

    public onImageChange(event: any) {
        this.imageTarget = event.target;
        this.mailingData.image_file = event.file[0];
    }

    public onCharCount(): void {
        let lng = this.mailingData.description
        if (lng) {
            let lngd = (lng.length) + 1;
            this.charCount = 132 - lngd;
        }
    }

    public onSaveCategory(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.categoryData.tab_id = this.tabId;
        this.service.saveCategory(this.categoryData).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.showCategoryDialog = false;
                this.pageService.showSuccess(res.message);
                this.categoryData = new MailingListCategory();
                this.getCategoryList();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public getCategoryList(): void {
        this.showLoader = true;
        this.service.getCategoryList(this.tabId).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                this.categories = res.data;
            } else {
                console.log('no data found');
            }
        });
    }

    public onSaveSettings(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.mailingData.tab_id = this.tabId;
        this.mailingData.automatic_upload = this.mailingData.automatic_upload ? 1 : 0;
        this.mailingData.prompt_action = this.mailingData.prompt_action ? 1 : 0;
        this.service.save(this.mailingData).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.getInitData();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public deleteImage(id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deleteImage(id).subscribe(res => {
                    console.log(res);
                    if (res.success) {
                        this.mailingData.image_file_url = null;
                        this.imageTarget = '';
                        this.mailingData.image_file = null;
                        this.pageService.showSuccess("Image deleted succesfully.");
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }

    public onMailChimp(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.mailChimp.tabId = this.tabId;
        this.service.uploadConMailChimp(this.mailChimp).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.mailChimp = new MailChimp();
                this.showMailchimpDialogBox = false;
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public getIContactAcDetails(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.iContact.tabId = this.tabId;
        this.service.getIContactAccountDetails(this.iContact).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                if (res.data.length) {
                    this.account.push({ label: '--Select an account--' });
                    for (let item of res.data) {
                        this.account.push({ label: item.first_name + ' ' + item.last_name, value: item.account_id })
                    }
                }
                // this.iContact = new IContact();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public getIContactClientFolderId(event: any): void {
        this.iContact.tabId = this.tabId;
        this.iContact.account_id = event.value;
        this.service.getIContactClientFolderId(this.iContact).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                if (res.data.length) {
                    this.folder.push({ label: '--Select an folder ID--' });
                    for (let item of res.data) {
                        this.folder.push({ label: item.client_folder_id, value: item.client_folder_id })
                    }
                }
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public getIContactClientList(event: any): void {
        this.iContact.tabId = this.tabId;
        this.iContact.client_folder_id = event.value;
        this.iContact.account_id = this.iContact.account_id;
        this.service.getIContactClientList(this.iContact).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                if (res.data.length) {
                    this.lists.push({ label: '--Select a List--' });
                    for (let item of res.data) {
                        this.lists.push({ label: item.name, value: item.listId })
                    }
                }
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public getMailData(): void {
        this.service.getMailData(this.tabId).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                if(res.data.iConnect){
                this.iContact = res.data.iConnect;
                }
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

     public uploadIContact(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.iContact.tabId = this.tabId;
        this.service.uploadIcontact(this.iContact).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.iContact = new IContact();
                this.showiContactDialogBox = false;
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

}