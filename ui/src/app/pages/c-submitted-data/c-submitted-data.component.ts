import { Component, ViewEncapsulation, HostListener, ChangeDetectorRef } from '@angular/core';
import { PageService, GridDataService } from '../../theme/services';
import { AppState } from '../../app.state';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, RadioButton, SelectItem, Calendar } from 'primeng/primeng';
import { MailingListTabService } from '../settings/tabs-content/tab-functions/mailing-list-tab/mailing-list-tab.service';
import { CSubmittedDataService } from './c-submitted-data.service';
import { formFieldTypes } from '../../theme/interfaces';
import { formfieldTypeCheck } from '../../pipes/form-field-type-check.pipe';
import { ChartistJs } from "../charts/components/chartistJs/chartistJs.component";
import { MailingList, MailingListCategory, Tab, MailChimp, IContact } from '../../theme/interfaces';
var moment = require('moment/moment');
import { Chartist } from "../../theme/components/baChartistChart/baChartistChart.loader";
require("chartist-plugin-tooltips");


@Component({
    selector: 'c-submitted-data',
    pipes: [formfieldTypeCheck],
    directives: [DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, Calendar, Dropdown, RadioButton, Dialog, PAGINATION_DIRECTIVES, ChartistJs],
    encapsulation: ViewEncapsulation.None,
    styles: [require('../settings/settings.scss')],
    template: require('./c-submitted-data.component.html'),
    providers: [GridDataService, PageService, CSubmittedDataService, MailingListTabService]
})

export class CSubmittedData {
    public appId: number = null;
    public appCode: string = null;
    public formList: Array<any> = [];
    public headers = [];
    public entries = [];
    public fieldType = [];
    public selectedRow: number = null;
    public selectedEmailListRow: number = null;
    public selectedForm: number = null;
    public showFormValue: Array<boolean> = [];
    public showEmailList: Array<boolean> = [];
    public checkAll: boolean = false;
    public checkMailingListAll: boolean = false;
    public checkedForm: boolean[] = [];
    public checkedUser: boolean[] = [];
    public checkTrue: boolean = false;
    public checkMailingListTrue: boolean = false;

    //-------------- PAGINATION For Email Form Data--------------------------
    public queryString: string = "";
    public totalItems: number = 0;
    public currentPage: number = 1;
    public itemsPerPage: number = 20;
    public maxSize: number = 4;
    public count: SelectItem[];
    public selectedCount: any;
    public valueSearch = {
        title: ''
    };

    //-------------- PAGINATION For Email Form Data--------------------------

    public queryEmailListString: string = "";
    public totalEmailListItems: number = 0;
    public currentEmailListPage: number = 1;
    public itemsPerEmailListPage: number = 20;
    public maxSizeEmailList: number = 4;
    public countEmailList: SelectItem[];
    public selectedEmailListCount: any;
    public valueSearchEmailList = {
        title: ''
    };
    public mailingListData: Array<any> = [];

    public chartCategory = [{ label: 'Today', value: 1 }, { label: 'Last 7 days', value: 2 }, { label: 'Month to date', value: 3 }, { label: 'Year to date', value: 4 }, { label: 'The previous month', value: 5 }, { label: 'Custom Range', value: 6 }]
    //----------------------------------------------------
    public chartData: any;
    public selectedChartCategory: number = 6;
    public showChart: boolean = true;
    public showNoDataFound: boolean = false;
    public showNoFormEntryFound: boolean = false;
    public startDate: string = null;
    public endDate: string = null;
    public showCustomDateRangeDialog: boolean = false;
    public custom_start_date: Date = new Date(new Date().setDate(new Date().getDate() - 6));
    public custom_end_date: Date = new Date();
    public noformAdded: boolean = false;
    public isMailingListTabAdded: boolean = false;
    public isEmailFormTabAdded: boolean = false;
    public showMailchimpDialogBox: boolean = false;
    public mailChimp: MailChimp = new MailChimp();
    public showiContactDialogBox: boolean = false;
    public iContact: IContact = new IContact();
    public showConstantContactDialogBox: boolean = false;
    public showCampaignMonitorDialogBox: boolean = false;
    public showGetResponseDialogBox: boolean = false;
    public showMyEmmaDialogBox: boolean = false;
    public account = [];
    public folder = [];
    public lists = [];
    public automaticUploadUsers: boolean = false;
    public disableAddButton: boolean = false;
    public ready: boolean = false;
    public showEmailFormLoader: boolean = false;
    public showChartLoader: boolean = false;
    public chartTooltipOptions: Object;
    public chartAreaLineOptions: Object;

    constructor(
        protected appState: AppState,
        private service: CSubmittedDataService,
        private malingService: MailingListTabService,
        public pageService: PageService,
        private _changeDetectionRef: ChangeDetectorRef
    ) {
        this.appId = parseInt(sessionStorage.getItem('appId'));
        // this.appId = this.appId ? this.appId : 60;
        this.appCode = sessionStorage.getItem('appCode');
        this.chartTooltipOptions = { appendToBody: true };
        this.chartAreaLineOptions = {
            fullWidth: true,
            low: 0,
             width: "650px",
            height: "300px",
            showArea: true,
            plugins: [Chartist.plugins.tooltip(this.chartTooltipOptions)],
            axisY: { onlyInteger: true },
            axisX: { showLabel: false },
        };
        this.chartData = {
            areaLineData: {
                labels: [1, 2],
                series: [
                    [5, 5]
                ]
            },
            areaLineOptions: this.chartAreaLineOptions
        }
        this.getInitData();
    }

    public getInitData(): void {
        this.service.getInitData(this.appId).subscribe((res) => {
            if (res.success) {
                this.formList = res['emailFormData'];
                this.noformAdded = this.formList.length <= 0 ? true : false;
                this.isMailingListTabAdded = res['mailingTabIds'].length ? true : false;
                this.isEmailFormTabAdded = res['emailTabIds'].length ? true : false;
                if (this.formList.length > 0) {
                    this.getFormEntries(this.formList[0].id);
                    this.selectedForm = this.formList[0].id;
                }
                if (res['mailingTabIds'].length) {
                    this.currentEmailListPage = 1;
                    this.getMailingListData();
                }
                this.ready = true;
            } else {
                console.log(res.message);
            }
        });
    }
    public getEntries(formId: number): void {
        this.currentPage = 1;
        this.getFormEntries(formId);
    }

    public getFormEntries(formId: number): void {
        this.selectedForm = formId;
        this.showEmailFormLoader = true;
        this.service.getFormEntry(formId, this.currentPage, this.itemsPerPage, this.queryString).subscribe((res) => {
            if (res.success) {
                this.headers = res.data.header;
                this.fieldType = res.data.field_type;
                this.totalItems = res.data.formdata.total;
                let pageno = Math.ceil(this.totalItems / 20);
                this.count = [];
                for (let i = 1; i <= pageno; i++) {
                    this.count.push({ label: '' + i * 20 + '', value: i * 20 });
                }
                this.selectedCount = 20;
                this.entries = [];
                for (let entry in res.data.entries) {
                    this.entries.push(res.data.entries[entry]);
                }
                this.showNoFormEntryFound = this.entries.length <= 0 ? true : false;
                for (let arrayEntry of this.entries) {
                    for (let entry of arrayEntry) {
                        for (let item in entry.data) {
                            if (typeof (entry.data[item].value) == 'object') {
                                let fieldVal = '';
                                let count = 0;
                                if (this.fieldType[entry.data[item].id] == formFieldTypes.CHECKBOXES) {
                                    for (let key in entry.data[item].value) {
                                        if (entry.data[item].value[key] == 'true') {
                                            if (count == 0) {
                                                fieldVal = key;
                                            } else {
                                                fieldVal = fieldVal + ', ' + key;
                                            }
                                            count++;
                                        }
                                    }
                                } else if (this.fieldType[entry.data[item].id] == formFieldTypes.ADDRESS) {
                                    fieldVal = 'Street Address: ' + entry.data[item].value['street_address'] + ', Address Line 2: ' + entry.data[item].value['address_line_two']
                                        + ', City: ' + entry.data[item].value['city'] + ', State: ' + entry.data[item].value['state']
                                        + ', Zip: ' + entry.data[item].value['zip'] + ', Country: ' + entry.data[item].value['country'];
                                } else {
                                    for (let key in entry.data[item].value) {
                                        if (count == 0) {
                                            fieldVal = entry.data[item].value[key];
                                        } else {
                                            fieldVal = fieldVal + ' ' + entry.data[item].value[key];
                                        }
                                        count++;
                                    }
                                }
                                entry.data[item].value = fieldVal;
                            }
                        }
                    }
                }
            } else {
                console.log(res.message);
            }
            this.showEmailFormLoader = false;
        });

        this.selectedChartCategory = 6;
        this.startDate = this.getDateInFormat(this.custom_start_date);
        this.endDate = this.getDateInFormat(this.custom_end_date);
        this.getBetweenTwoDateStatistcis();
    }
    public onCheckAllChange(): void {
        this.checkTrue = !this.checkTrue;
        this.refreshSelectedCategory();
        if (!this.checkAll) {
            for (let arrayEntry of this.entries) {
                for (let i in arrayEntry) {
                    this.checkedForm[arrayEntry[i]._id] = true;
                }
            }
        }
        else {
            for (let arrayEntry of this.entries) {
                for (let i in arrayEntry) {
                    this.checkedForm[arrayEntry[i]._id] = false;
                }
            }
        }
    }
    public onCheckMailingListAllChange(): void {
        this.checkMailingListTrue = !this.checkMailingListTrue;
        this.refreshEmailListSelectedCategory();
        if (!this.checkMailingListAll) {
            for (let list of this.mailingListData) {
                this.checkedUser[list.id] = true;
            }
        }
        else {
            for (let list of this.mailingListData) {
                this.checkedUser[list.id] = false;
            }
        }
    }
    public refreshSelectedCategory(): void {
        this.checkedForm = [];
    }
    public refreshEmailListSelectedCategory(): void {
        this.checkedUser = [];
    }

    public onCheckChange(checkedTabValue, checkedTab): void {
        this.checkTrue = !this.checkTrue;
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            for (let arrayEntry of this.entries) {
                arrayEntry.forEach((entry) => {
                    if (entry._id != checkedTab) {
                        //if flag set to false don't check further
                        if (flag) {
                            if (this.checkedForm[entry._id]) {
                                flag = true;
                            } else {
                                flag = false;
                            }
                        }
                    }
                });
            }
        }
        this.checkAll = flag ? true : false;
    }
    public onEmailListCheckChange(checkedTabValue, checkedTab): void {
        this.checkMailingListTrue = !this.checkMailingListTrue;
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {

            this.mailingListData.forEach((list) => {
                if (list.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.checkedUser[list.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });

        }
        this.checkMailingListAll = flag ? true : false;
    }

    public showFormValueTable(id: number): void {
        if (typeof this.showFormValue[id] == 'undefined') {
            this.showFormValue[id] = true;
        } else {
            this.showFormValue[id] = !this.showFormValue[id];
        }
    }
    public showEmailListTable(id: number): void {
        if (typeof this.showEmailList[id] == 'undefined') {
            this.showEmailList[id] = true;
        } else {
            this.showEmailList[id] = !this.showEmailList[id];
        }
    }

    public selecteRow(id: number): void {
        this.selectedRow = id;
    }
    public selecteEmailListRow(id: number): void {
        this.selectedEmailListRow = id;
    }

    public deleteFormEntries(): void {
        if (this.checkedForm.length > 0 && this.checkedForm.indexOf(true) !== -1) {
            //            this.showDeleteItemDialog = true;
            var yes = window.confirm("Are you sure you want to delete the selected Item ? ");
            if (yes) {
                let ids: any[] = [];
                for (let i in this.checkedForm) {
                    if (this.checkedForm[i]) {
                        ids.push(i);
                    }
                }
                this.service.deleteFormEntries(ids).subscribe((res) => {
                    if (res.success) {
                        this.checkTrue = false;
                        this.getFormEntries(this.selectedForm);
                        this.service.getInitData(this.appId).subscribe((res) => {
                            if (res.success) {
                                this.formList = res['emailFormData'];
                                this.noformAdded = this.formList.length <= 0 ? true : false;
                                this.isMailingListTabAdded = res['mailingTabIds'].length ? true : false;
                                this.isEmailFormTabAdded = res['emailTabIds'].length ? true : false;
                            }
                        });
                        this.pageService.showSuccess("Entries deleted succesfully.");
                        this.checkAll = false;
                    } else {
                        this.pageService.showError(res.message);
                    }
                });
            }
        }
    }
    public pageChanged(event: any): void {
        this.currentPage = event.page;
        console.log("this.currentPage", this.currentPage);
        this.getFormEntries(this.selectedForm);
    }
    public emailListPageChanged(event: any): void {
        this.currentEmailListPage = event.page;
        console.log("this.currentPage", this.currentEmailListPage);
        this.getMailingListData();
    }

    public ngAfterViewInit(): void {
        this._changeDetectionRef.detectChanges();
    }
    public setItemsPerPage(perPage: number): void {
        this.itemsPerPage = perPage;
        this.getFormEntries(this.selectedForm);
    }
    public setEmailListItemsPerPage(perPage: number): void {
        this.itemsPerEmailListPage = perPage;
        this.getMailingListData();
    }

    public searchInFormValue(): void {
        let queryString = '?';
        for (let i in this.valueSearch) {
            if (this.valueSearch.hasOwnProperty(i) && this.valueSearch[i] != '') {
                queryString += encodeURIComponent("search[" + i + "]") + "=" + encodeURIComponent(this.valueSearch[i]) + "&";
            }
        }
        this.currentPage = 1;
        this.queryString = queryString;
        this.getFormEntries(this.selectedForm);
    }
    public searchInMailingList(): void {
        let queryString = '?';
        for (let i in this.valueSearchEmailList) {
            if (this.valueSearchEmailList.hasOwnProperty(i) && this.valueSearchEmailList[i] != '') {
                queryString += encodeURIComponent("search[" + i + "]") + "=" + encodeURIComponent(this.valueSearchEmailList[i]) + "&";
            }
        }
        this.currentEmailListPage = 1;
        this.queryEmailListString = queryString;
        this.getMailingListData();
    }

    public onChangeCategory(event: any): void {
        console.log("event", event);
        let currentDate = new Date();
        this.showChartLoader = true;
        if (event.value == 1) {//today
            let date = this.getDateInFormat(currentDate);
            this.showDayStatistcis(date);
        } else if (event.value == 2) {// last week
            this.endDate = this.getDateInFormat(currentDate);
            let startDate = new Date(currentDate.setDate(currentDate.getDate() - 6));
            this.startDate = this.getDateInFormat(startDate);
            this.getBetweenTwoDateStatistcis();
        } else if (event.value == 3) {// month to date 
            this.startDate = this.getDateInFormat(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
            this.endDate = this.getDateInFormat(new Date());
            this.getMonthStatistcis(new Date().getFullYear(), new Date().getMonth() + 1);
        } else if (event.value == 4) { // year to date
            this.startDate = this.getDateInFormat(new Date(new Date().getFullYear(), 0));
            this.endDate = this.getDateInFormat(new Date());
            this.getYearStatistcis(new Date().getFullYear());
        } else if (event.value == 5) { // previous month
            let previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));
            this.startDate = this.getDateInFormat(new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1));
            this.endDate = this.getDateInFormat(new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0));
            this.getMonthStatistcis(previousMonth.getFullYear(), previousMonth.getMonth() + 1);
        } else if (event.value == 6) {//Custom date
            this.showCustomDateSelectDialog();
        }
    }

    public getDateInFormat(date: any): string {
        date = new Date(date);
        let dd = date.getDate();
        let mm = date.getMonth() + 1; //January is 0!
        let yyyy = date.getFullYear();
        let day = null;
        let month = null;
        let inFormatDate = null;
        day = dd < 10 ? '0' + dd : dd;
        month = mm < 10 ? '0' + mm : mm;
        inFormatDate = yyyy + '-' + month + '-' + day;
        return inFormatDate;
    }
    public showDayStatistcis(date: string) {
        this.startDate = date;
        this.endDate = date;
        this.service.getDayStatistcis(this.selectedForm, new Date().getFullYear(), (new Date().getMonth()) + 1, new Date().getDate()).subscribe((res) => {
            if (res.success) {
                console.log("res", res);
                this.showNoDataFound = res['data'] > 0 ? false : true;
                this.showChart = false;
                setTimeout(() => {
                    this.showChart = true;
                }, 0);
                this.chartData = {
                    areaLineData: {
                        labels: [date, date],
                        series: [
                            [{meta:date,value:res['data']}, {meta:date,value:res['data']}]
                        ]
                    },
                    areaLineOptions: this.chartAreaLineOptions
                }
            }
            this.showChartLoader = false;
        });
    }
    public getBetweenTwoDateStatistcis(): void {
        console.log("hi am called");
        this.service.getBetwwenTwoDatesStatistcis(this.selectedForm, this.startDate, this.endDate).subscribe((res) => {
            if (res.success) {
                let chartlabel = [];
                let chartSeries = [];
                console.log("typeof res['data']", typeof res['data']);
                this.showNoDataFound = this.isEmpty(res['data']) ? true : false;
                this.showChart = false;
                for (let entry in res['data']) {
                    chartlabel.push(entry);
                    chartSeries.push({meta:entry,value:res['data'][entry]});
                }
                if (chartlabel.indexOf(this.startDate) < 0) {
                    chartlabel.unshift(this.startDate);
                    chartSeries.unshift({meta:this.startDate,value:0});
                }
                if (chartlabel.indexOf(this.endDate) < 0) {
                    chartlabel.push(this.endDate);
                    chartSeries.push({meta:this.endDate,value:0});
                }
                console.log("chartlabel", chartlabel);
                console.log("chartSeries", chartSeries);
                setTimeout(() => {
                    this.showChart = true;
                }, 0);
                this.chartData = {
                    areaLineData: {
                        labels: chartlabel,
                        series: [
                            chartSeries
                        ]
                    },
                    areaLineOptions: this.chartAreaLineOptions
                }
            }
            this.showChartLoader = false;
        });
    }

    public getMonthStatistcis(year: any, month: any): void {
        this.service.getMonthStatistcis(this.selectedForm, year, month).subscribe((res) => {
            if (res.success) {
                let chartlabel = [];
                let chartSeries = [];

                this.showNoDataFound = this.isEmpty(res['data']) ? true : false;
                this.showChart = false;
                for (let entry in res['data']) {
                    chartlabel.push(entry);
                    chartSeries.push({meta:entry,value:res['data'][entry]});
                }
                if (chartlabel.length == 1) {
                    chartlabel.push(chartlabel[0]);
                    chartSeries.push(chartSeries[0]);
                }
                console.log("chartlabel", chartlabel);
                console.log("chartSeries", chartSeries);
                setTimeout(() => {
                    this.showChart = true;
                }, 0);
                this.chartData = {
                    areaLineData: {
                        labels: chartlabel,
                        series: [
                            chartSeries
                        ]
                    },
                    areaLineOptions: this.chartAreaLineOptions
                }
            }
            this.showChartLoader = false;
        });
    }
    public getYearStatistcis(year: any): void {
        this.service.getYearStatistcis(this.selectedForm, year).subscribe((res) => {
            if (res.success) {
                let chartlabel = [];
                let chartSeries = [];
                console.log("typeof res['data']", typeof res['data']);
                this.showNoDataFound = this.isEmpty(res['data']) ? true : false;
                this.showChart = false;
                for (let entry in res['data']) {
                    chartlabel.push(entry);
                    chartSeries.push({meta:entry,value:res['data'][entry]});
                }
                if (chartlabel.length == 1) {
                    chartlabel.push(chartlabel[0]);
                    chartSeries.push(chartSeries[0]);
                }
                setTimeout(() => {
                    this.showChart = true;
                }, 0);
                this.chartData = {
                    areaLineData: {
                        labels: chartlabel,
                        series: [
                            chartSeries
                        ]
                    },
                    areaLineOptions: this.chartAreaLineOptions
                }
            }
            this.showChartLoader = false;
        });
    }
    public isEmpty(obj): boolean {
        console.log(obj);
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    public showCustomDateSelectDialog(): void {
        this.custom_start_date = moment(this.custom_start_date).format('MM/DD/YYYY');
        this.custom_end_date = moment(this.custom_end_date).format('MM/DD/YYYY');
        this.showCustomDateRangeDialog = true;
        this.pageService.onDialogOpen();
    }
    public onSubmitCustomDate(): void {
        this.showCustomDateRangeDialog = false;
        this.startDate = this.getDateInFormat(moment(this.custom_start_date).format());
        this.endDate = this.getDateInFormat(moment(this.custom_end_date).format());
        this.getBetweenTwoDateStatistcis();
    }

    public getMailingListData(): void {
        this.service.getMailingListData(this.appId, this.currentEmailListPage, this.itemsPerEmailListPage, this.queryEmailListString).subscribe((res) => {
            if (res.success) {
                console.log("res+++++++++++++++++++", res);
                this.totalEmailListItems = res.data.total;
                let pageno = Math.ceil(this.totalEmailListItems / 20);
                this.countEmailList = [];
                for (let i = 1; i <= pageno; i++) {
                    this.countEmailList.push({ label: '' + i * 20 + '', value: i * 20 });
                }
                this.selectedEmailListCount = 20;
                this.mailingListData = [];
                this.mailingListData = res.data.data;
                console.log("this.mailingListData+++++++++++++++++++", this.mailingListData);
                if (res['newsLetterSetting']) {
                    this.automaticUploadUsers = res['newsLetterSetting'].automatic_upload ? true : false;
                }
            } else {
                console.log("server error occure");
            }
        });
    }
    public deleteMailingListEntries(): void {
        if (this.checkedUser.length > 0 && this.checkedUser.indexOf(true) !== -1) {
            //            this.showDeleteItemDialog = true;
            var yes = window.confirm("Are you sure you want to delete the selected Item ? ");
            if (yes) {
                let ids: any[] = [];
                for (let i in this.checkedUser) {
                    if (this.checkedUser[i]) {
                        ids.push(i);
                    }
                }
                this.service.deleteUserList(ids).subscribe((res) => {
                    if (res.success) {
                        this.checkMailingListTrue = false;
                        this.getMailingListData();
                        this.pageService.showSuccess("Entries deleted succesfully.");
                        this.checkMailingListAll = false;
                    } else {
                        this.pageService.showError(res.message);
                    }
                });
            }
        }
    }
    public showMailchimpDialog(): void {
        this.showMailchimpDialogBox = true;
        this.pageService.onDialogOpen();
    }
    public onMailChimp(): void {
        this.mailChimp.appId = this.appId;
        this.mailChimp.tabId = 0;
        this.disableAddButton = true;
        this.service.uploadConMailChimp(this.mailChimp).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.mailChimp = new MailChimp();
                this.showMailchimpDialogBox = false;
            } else {
                this.pageService.showError(res.message);
            }
            this.disableAddButton = false;
        });
    }
    public showiContactDialog(): void {
        this.showiContactDialogBox = true;
        this.pageService.onDialogOpen();
        this.getMailData();
    }
    public getIContactAcDetails(): void {
        this.iContact.tabId = 0;
        this.iContact.appId = this.appId;
        this.disableAddButton = true;
        this.malingService.getIContactAccountDetails(this.iContact).subscribe((res) => {
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
            this.disableAddButton = false;
        });
    }
    public getIContactClientFolderId(event: any): void {
        this.iContact.tabId = 0;
        this.iContact.appId = this.appId;
        this.iContact.account_id = event.value;
        this.malingService.getIContactClientFolderId(this.iContact).subscribe((res) => {
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
        this.iContact.tabId = 0;
        this.iContact.appId = this.appId;
        this.iContact.client_folder_id = event.value;
        this.iContact.account_id = this.iContact.account_id;
        this.service.getIContactClientListByAppId(this.iContact).subscribe((res) => {
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
    public uploadIContact(): void {
        this.iContact.tabId = 0;
        this.iContact.appId = this.appId;
        this.disableAddButton = true;
        this.service.uploadIcontactByAppId(this.iContact).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.iContact = new IContact();
                this.showiContactDialogBox = false;
            } else {
                this.pageService.showError(res.message);
            }
            this.disableAddButton = false;
        });
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

    public getMailData(): void {
        this.service.getMailData(this.appId).subscribe((res) => {
            if (res.success) {
                if (res.data.iConnect) {
                    this.iContact = res.data.iConnect;
                }
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onAutomaticButtonChange(): void {
        let automatic_upload = this.automaticUploadUsers ? 0 : 1;
        let data = { appId: this.appId, automatic_upload: automatic_upload };
        console.log("this.automaticUploadUsers", this.automaticUploadUsers);
        this.service.updateAutomaticUploadSetting(data).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
            } else {
                console.log("some server error occure");
            }
        })
    }

}