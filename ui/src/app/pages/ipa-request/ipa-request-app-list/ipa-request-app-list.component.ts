import { Component, ViewEncapsulation, } from '@angular/core';
import { PageService } from '../../../theme/services';
import { Dropdown, SelectItem, Dialog } from 'primeng/primeng';
import {  TOOLTIP_DIRECTIVES, TAB_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { IpaRequestAppListService } from './ipa-request-app-list.service';
import { Help } from '../help/help.component';
import { DateTimeFormatPipe } from '../../../pipes/date-time-format.pipe';
import { IpaRequestEmailData } from '../../../theme/interfaces';

declare var $: any;

@Component({
    selector: 'ipa-request-app-list',
    directives: [TOOLTIP_DIRECTIVES, Dropdown, PAGINATION_DIRECTIVES, Dialog, Help],
    encapsulation: ViewEncapsulation.None,
    styles: [require('./ipa-request-app-list.scss')],
    template: require('./ipa-request-app-list.component.html'),
    pipes: [DateTimeFormatPipe],
    providers: [PageService, IpaRequestAppListService]
})
export class IpaRequestAppList {
    public appUpdateTypes: SelectItem[] = [{ label: 'All', value: 'All' }, { label: 'Itunes Update', value: 'Itunes Update' }, { label: 'Expedited Update', value: 'Expedited Update' }, { label: 'Standard App upload', value: 'Standard App upload' }, { label: 'Expedited upload', value: 'Expedited upload' }, { label: 'Tappit app review', value: 'Tappit app review' }, { label: 'App Build Service', value: 'App Build Service' }];
    //-------------- PAGINATION --------------------------
    public totalItems: number = 0;
    public currentPage: number = 1;
    public itemsPerPage: number = 10;
    public maxSize: number = 4;
    //----------------------------------------------------
    public count: SelectItem[] = [{ label: '10', value: 10 }, { label: '20', value: 20 }, { label: '30', value: 30 }, { label: '40', value: 40 }];
    public selectedCount: number = 10;

    public requestedAppList: any = [];
    public appHistory: any = [];
    //---------------- APP SEARCH -------------------------
    public requestedAppSearch = {
        title: '',
        updateTypes: 'All'
    };
    public queryString: string = '';
    public showLoader: boolean = false;
    public showAppInfoDialog: boolean = false;
    public showAppHelpDialog: boolean = false;
    public sortFor: number = null;//1=>App name 2=>client email 3=>Requested On ,4=>Update Type
    public sortType: string = null;
    public emailData: IpaRequestEmailData = new IpaRequestEmailData();
    public showEmailDialog: boolean = false;
    public emailTypes: Array<any> = [{ label: 'Query', value: 1 }, { label: 'Response', value: 2 }];
    public editorView: any = null;
    public requestTypes: Array<any> = [{ label: 'Pending Requests', value: 1 }, { label: 'Done Requests', value: 2 }];
    public requestType: number = 1;
    public disableSendMailButton: boolean = false;
    public appName: string;
    constructor(
        public pageService: PageService,
        public service: IpaRequestAppListService
    ) {
        this.getInitData();
    }
    public pageChanged(event: any): void {
        this.currentPage = event.page;
        this.getInitData();
    }
    public setItemsPerPage(perPage: number): void {
        this.itemsPerPage = perPage;
        this.getInitData();
    }
    public getInitData(): void {
        this.showLoader = true;
        this.service.getInitData(this.requestType, this.currentPage, this.itemsPerPage, this.queryString).subscribe((res) => {
            if (res.success) {
                this.requestedAppList = res['requestedAppList'].data;
                this.totalItems = res['requestedAppList'].total;
            }
            this.showLoader = false;
        });
    }
    public searchRequestedApp(): void {
        this.getQueryString();
        this.getInitData();
    }
    public getQueryString(): void {
        let queryString = '?';
        for (let i in this.requestedAppSearch) {
            if (this.requestedAppSearch.hasOwnProperty(i) && this.requestedAppSearch[i] != '') {
                queryString += encodeURIComponent("search[" + i + "]") + "=" + encodeURIComponent(this.requestedAppSearch[i]) + "&";
            }
        }
        this.queryString = queryString;
    }
    public refreshRequestedApps(): void {
        this.queryString = '';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.requestType = 1;
        this.requestedAppSearch.title = '';
        this.requestedAppSearch.updateTypes = 'All';
        this.selectedCount = 10;
        this.getInitData();
    }
    public onClickHelp(): void {
        this.showAppHelpDialog = true;
    }

    public sortData(sortFor: number): void {
        if (this.sortFor == sortFor) {
            this.sortType = this.sortType == 'asc' ? 'desc' : 'asc';
        } else {
            this.sortType = 'asc';
        }
        this.sortFor = sortFor;
        let self = this;
        if (sortFor == 1) {
            this.requestedAppList.sort(function (a, b) {
                let textA = a.app_name.toUpperCase();
                let textB = b.app_name.toUpperCase();
                if (self.sortType == 'asc') {
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                } else {
                    return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                }
            });
        } else if (sortFor == 2) {
            this.requestedAppList.sort(function (a, b) {
                let textA = a.email.toUpperCase();
                let textB = b.email.toUpperCase();
                if (self.sortType == 'asc') {
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                } else {
                    return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                }
            });
        } else if (sortFor == 3) {
            this.requestedAppList.sort(function (a, b) {
                let textA = new Date(a.created_at).getTime();
                let textB = new Date(b.created_at).getTime();
                if (self.sortType == 'asc') {
                    return textA - textB;
                } else {
                    return textB - textA;
                }
            });
        } else if (sortFor == 4) {
            this.requestedAppList.sort(function (a, b) {
                let textA = self.appUpdateTypes[a.update_type].value;
                let textB = self.appUpdateTypes[b.update_type].value;
                if (self.sortType == 'asc') {
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                } else {
                    return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                }
            });
        }

    }
    public markAsDone(id: number, index: number): void {
        var yes = window.confirm("Do you really want to mark as done this request? ");
        if (yes) {
            this.service.makeIpaRequestDone(id).subscribe((res) => {
                if (res.success) {
                    this.requestedAppList.splice(index, 1);
                    this.pageService.showSuccess(res.message);
                } else {
                    console.log(res.message);
                }
            });
        }

    }
    public openEmailDialog(email: string, appName: string): void {
        this.emailData.client_email = email;
        this.emailData.app_name = appName;
        this.showEmailDialog = true;
        this.initEditor();
    }
    private initEditor(): void {
        setTimeout(() => {
            let editorDiv = window["_globalJQuery"]("div#description-editor");
            editorDiv.froalaEditor({
                fileUploadURL: this.pageService.editorURLs.fileUpload,
                videoUploadURL: this.pageService.editorURLs.videoUpload,
                imageUploadURL: this.pageService.editorURLs.imageUpload + "/0",
                imageManagerLoadURL: this.pageService.editorURLs.imageManagerLoad + "/0",
            });
            this.editorView = editorDiv.find(".fr-view");
            this.editorView.html("");
        });
    }
    public sendMail(): void {
        if (this.editorView) {
            this.emailData.email_body = this.editorView.html();
        }
        console.log("emailData", this.emailData);
        this.disableSendMailButton = true;
        this.service.sendEmail(this.emailData).subscribe((res) => {
            if (res.success) {
                this.showEmailDialog = false;
                this.emailData = new IpaRequestEmailData();
                this.editorView = null;
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
            this.disableSendMailButton = false;
        });
    }

    public onAppInfo(id: number, appName: string, appCode: string): void {
        this.showAppInfoDialog = true;
        this.appName = appName + ' [' + appCode + ']';
        this.getAppHistory(id);
        console.log(id);
    }


    public getAppHistory(id: number): void {
        this.showLoader = true;
        this.service.getHistoryByAppId(id).subscribe((res) => {
            if (res.success) {
                if (res.data) {
                    this.appHistory = res.data;
                } else {
                    console.log('No history found');
                }
            }
            this.showLoader = false;
        });
    }

    public onCloseAppLogDialog(): void {
        this.showAppInfoDialog = false;
        this.appHistory = [];
    }
}