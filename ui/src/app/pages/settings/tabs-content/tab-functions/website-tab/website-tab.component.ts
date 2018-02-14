import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { WebsiteTabService } from './website-tab.service';
import { Website, Tab, WebsiteTabSettings } from '../../../../../theme/interfaces';
import { MobileViewComponent } from '../../../../../components';


@Component({
    selector: 'tab-function-website-tab',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, Dialog, MobileViewComponent, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, Dragula],
    encapsulation: ViewEncapsulation.None,
    template: require('./website-tab.component.html'),
    styles: [require('./website-tab.scss')],
    viewProviders: [DragulaService],
    providers: [PageService, WebsiteTabService, GridDataService]
})

export class WebsiteTab {

    public tabId: number;
    public thumbnail: File = null;
    public websites: Website[] = [];
    public deleteWebsiteId: number = null;
    public addThumbnailTarget = null;
    public editThumbnailTarget = null;
    public deleteThumbnailId: number;
    public editDialogThumbnail: string | File;
    public checkTrue:boolean = false;
    // ------------------- DISPLAY CONTROL ----------------------------
    public ready: boolean = false;
    public addDialogDisplay: boolean = false;
    public editDialogDisplay: boolean = false;
    public showDeleteDialog: boolean = false;
    public showLoader: boolean = false;
    //    public showThumbnailDeleteDialog: boolean = false;
    public showMainLoader: boolean = false;
    public addSaveButtonHide: boolean = false;
    // ----------------------------------------------------------------

    public addWebsiteData: Website = {
        name: '',
        url: '',
        is_donation_request: false,
        is_printing_allowed: true,
        use_safari_webview: false,
        thumbnail: null
    };

    public editWebsiteData: Website = {
        id: null,
        name: '',
        url: '',
        is_donation_request: false,
        is_printing_allowed: false,
        use_safari_webview: false,
        thumbnail: null
    };

    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };

    public settings: WebsiteTabSettings = {
        show_nav_bar: false
    }

    public selectedWeb: boolean[] = [];
    public checkAll: boolean = false;


    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: WebsiteTabService,
        private dragulaService: DragulaService,
        private dataService: GridDataService) {
        this.tabId = parseInt(params.get('tabId'));
        this.addWebsiteData.tab_id = this.tabId;

        dragulaService.dropModel.subscribe((value) => {
            this.sortWebsites();
        });
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        // One request to get all initial data.
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                this.websites = res.data.websites;
                this.tabData = res.data.tabData;

                // If settings are available
                if (res.data.tabData.settings) {
                    this.settings = JSON.parse(res.data.tabData.settings);
                }

                // We are ready to roll.
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public sortWebsites(): void {
        let ids: number[] = [];
        for (let website of this.websites) {
            ids.push(website.id);
        }
        this.service.sortWebsiteList(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('Website order saved.')
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    //    public onDeleteClick(id: number): void {
    //        this.deleteWebsiteId = id;
    //        this.showDeleteDialog = true;
    //    }
    //
    //    public deleteWebView(): void {
    //        this.showLoader = true;
    //        this.service.deleteWebsite([this.deleteWebsiteId]).subscribe((res) => {
    //            if (res.success) {
    //                this.showLoader = false;
    //                this.showDeleteDialog = false;
    //                this.pageService.showSuccess(res.message);
    //                this.websites.forEach((website, index) => {
    //                    if (website.id === this.deleteWebsiteId) {
    //                        this.websites.splice(index, 1);
    //                    }
    //                });
    //            } else {
    //                this.pageService.showError(res.message);
    //            }
    //        });
    //    }
    public deleteWebView(): void {
        let ids: any[] = [];
        for (let i in this.selectedWeb) {
            if (this.selectedWeb[i]) {
                ids.push(i);
            }
        }
        console.log('ids++++++++++++++', ids);
        this.showLoader = true;
        this.service.deleteWebsite(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkTrue = false;
                this.selectedWeb = [];
                for (var i = 0; i < ids.length; i++) {
                    console.log('ids==============', ids[i]);
                    this.websites.forEach((websites, index) => {
                        console.log('websites.id==============', websites.id);
                        if (websites.id == ids[i]) {
                            console.log('in');
                            this.websites.splice(index, 1);
                        }
                    });
                }
                this.pageService.showSuccess("Website deleted succesfully.");
                this.checkAll = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onAddWebsiteThumbnailChange(event: any): void {
        this.addWebsiteData.thumbnail = event.target.files[0];
        this.addThumbnailTarget = event.target;
    }

    public onEditWebsiteThumbnailChange(event: any): void {
        this.editWebsiteData.thumbnail = event.target.files[0];
        this.editThumbnailTarget = event.target;
    }

    public onAddWebsiteSubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.service.addWebsite(this.addWebsiteData).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.addDialogDisplay = false;
                this.pageService.showSuccess(res.message);
                this.refreshAddWebsiteData();
                this.getWebsiteList();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public onEditWebsiteSubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.service.editWebsite(this.editWebsiteData).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.editDialogDisplay = false;
                this.pageService.showSuccess(res.message);
                this.refreshEditWebsiteData();
                this.getWebsiteList();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public getWebsiteList(): void {
        this.service.getWebsiteList(this.tabId).subscribe(res => {
            if (res.success) {
                this.websites = res.data;
            } else {
                this.pageService.showError('Server error occurred');
            }
        });
    }

    public refreshAddWebsiteData(): void {
        this.addWebsiteData.name = '';
        this.addWebsiteData.url = '';
        this.addWebsiteData.is_donation_request = false;
        this.addWebsiteData.is_printing_allowed = true;
        this.addWebsiteData.use_safari_webview = false;
        this.addWebsiteData.thumbnail = null;
    }

    public refreshEditWebsiteData(): void {
        this.editWebsiteData.id = null;
        this.editWebsiteData.name = '';
        this.editWebsiteData.url = '';
        this.editWebsiteData.is_donation_request = false;
        this.editWebsiteData.is_printing_allowed = false;
        this.editWebsiteData.use_safari_webview = false;
        this.editWebsiteData.thumbnail = null;
    }

    public showAddDialog(): void {
        if (this.addThumbnailTarget) {
            // Clear the image name from the target element.
            this.addThumbnailTarget.value = null;
        }
        this.addWebsiteData.thumbnail = null;
        this.addDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public showEditDialog(id: number): void {
        if (this.editThumbnailTarget) {
            // Clear the image name from the target element.
            this.editThumbnailTarget.value = null;
        }
        this.refreshEditWebsiteData();
        this.editDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.showLoader = true;
        this.service.getWebsiteData(id).subscribe((res) => {
            if (res.success) {
                this.editWebsiteData = res.data;
                this.editWebsiteData.is_donation_request = !!this.editWebsiteData.is_donation_request;
                this.editWebsiteData.is_printing_allowed = !!this.editWebsiteData.is_printing_allowed;
                this.editWebsiteData.use_safari_webview = !!this.editWebsiteData.use_safari_webview;
                this.editDialogThumbnail = this.editWebsiteData.thumbnail;
                this.showLoader = false;
            }
        });
    }

    public onAddWebsiteCheckboxClick(): void {
        this.addWebsiteData.is_donation_request = false;
        this.addWebsiteData.is_printing_allowed = false;
        this.addWebsiteData.use_safari_webview = false;
    }

    public onEditWebsiteCheckboxClick(): void {
        this.editWebsiteData.is_donation_request = false;
        this.editWebsiteData.is_printing_allowed = false;
        this.editWebsiteData.use_safari_webview = false;
    }

    public onDeleteThumbnailClick(id: number): void {
        this.deleteThumbnailId = id;
        //        this.showThumbnailDeleteDialog = true;
        var yes = window.confirm("Are you sure you want to delete this thumbnail ? ");
        if (yes) {
            this.deleteThumbnail();
        }
    }

    public deleteThumbnail(): void {
        this.showLoader = true;
        this.service.deleteThumbnail(this.deleteThumbnailId).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.editWebsiteData.thumbnail = null;
                this.editDialogThumbnail = null;
                //                this.showThumbnailDeleteDialog = false;
                this.dataService.getByID(this.websites, this.deleteThumbnailId, (website) => {
                    website.thumbnail = null;
                });
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public saveSettings(): void {
        this.showMainLoader = true;
        this.service.saveSettings(this.settings, this.tabId).subscribe((res) => {
            this.showMainLoader = false;
            if (res.success) {
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onCheckAllChange(): void {
    //   this.checkTrue = !this.checkTrue;
      this.refreshSelectedItems();
        if (!this.checkAll) {
            for (let i in this.websites) {
                this.selectedWeb[this.websites[i].id] = true;
            }
            this.checkTrue = true;
        }
        else {
            for (let i in this.websites) {
                this.selectedWeb[this.websites[i].id] = false;
            }
            this.checkTrue = false;
        }
    }

    public refreshSelectedItems(): void {
        this.selectedWeb = [];
    }

    public onWebDeleteClick(): void {
        if (this.selectedWeb.length > 0 && this.selectedWeb.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete website? ");
            if (yes) {
                this.deleteWebView();
            }
        }
    }

    public onCheckTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.websites.forEach((websites) => {
                console.log('websites', websites);
                console.log('checkedTab', checkedTab);
                if (websites.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedWeb[websites.id]) {
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
}