import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { PageService, GridDataService } from '../../theme/services';
import { AppState } from '../../app.state';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dropdown, RadioButton, InputSwitch } from 'primeng/primeng';
import { CustomerSetting, AppConfigSetting, AppConfigScreenSetting, SaveMembershipSettings } from '../../theme/interfaces';
import { Dialog, SelectItem, Calendar } from 'primeng/primeng';
import { Tab, AppAnalyticsSelectorData } from "../../theme/interfaces/common-interfaces";
import { CAnalyticsService } from './c-analytics.service';
import { ChartistJs } from "../charts/components/chartistJs/chartistJs.component";
import { Chartist } from "../../theme/components/baChartistChart/baChartistChart.loader";
import { NothingFound } from "./nothing-found.component";

var moment = require('moment/moment');
require("chartist-plugin-tooltips");

const LIVE_APP: number = 1;
const PREVIEW_APP: number = 2;

@Component({
    selector: 'c-analytics',
    pipes: [],
    directives: [Dialog, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, Dropdown, RadioButton, Calendar, ChartistJs, PAGINATION_DIRECTIVES, NothingFound],
    encapsulation: ViewEncapsulation.None,
    styles: [require('../settings/settings.scss')],
    template: require('./c-analytics.component.html'),
    providers: [GridDataService, PageService, CAnalyticsService]
})


export class CAnalytics {

    public appId: number = null;
    public tabId: number = null;
    public dateRange = [{ label: 'Today', value: 1 }, { label: 'Last 7 days', value: 2 }, { label: 'Month to date', value: 3 }, { label: 'Year to date', value: 4 }, { label: 'The previous month', value: 5 }, { label: 'Custom Range', value: 6 }];
    public selectedDateRange: number = 2;
    public appType = [{ label: 'Live App Views', value: 1 }, { label: 'Previews', value: 2 }];
    public selectedAppType: number = 1;
    public startDate: string = null;
    public endDate: string = null;
    public custom_start_date: Date = new Date(new Date().setDate(new Date().getDate() - 6));
    public custom_end_date: Date = new Date();
    public appAnalyticsSelectorData: AppAnalyticsSelectorData = new AppAnalyticsSelectorData();
    public iosDownloads: number = 0;
    public androidDownloads: number = 0;
    public androidSession: number = 0;
    public iosSession: number = 0;
    public html5Session: number = 0;
    public androidAvgTime: number = 0.0;
    public iosAvgTime: number = 0.0;
    public html5AvgTime: number = 0.0;
    public chartData: any;
    public chartTooltipOptions: Object;
    public chartAreaLineOptions: Object;
    public countrySessions: any[] = [];
    public tabsChartData: any;
    public tabsChartOptions: Object;
    public tabSessions: { tab_name: string, total_sessions: number, android_sessions: number, ios_sessions: number, html5_sessions: number }[] = [];

    public countrySessionsCurrentPage: number = 1;
    public countrySessionsPerPage: number = 10;

    public tabSessionsCurrentPage: number = 1;
    public tabSessionsPerPage: number = 10;

    // ------------------- DISPLAY CONTROL ----------------------------
    public showLoader: boolean = false;
    public dateRangeSelector: boolean = false;
    public showCustomDateRangeDialog: boolean = false;
    public showChart: boolean = false;
    public showNoDataFound: boolean = false;
    public showChartLoader: boolean = false;
    public showTabsChart: boolean = false;

    constructor(
        protected appState: AppState,
        private pageService: PageService,
        private dataService: GridDataService,
        private analyticsService: CAnalyticsService
    ) {
        PageService.showpushNotificationButton = false;
        this.appId = sessionStorage.getItem('appId');

        this.chartTooltipOptions = { appendToBody: true };
        this.chartAreaLineOptions = {
            fullWidth: true,
            low: 0,
            height: "200px",
            width: "650px",
            showArea: true,
            plugins: [Chartist.plugins.tooltip(this.chartTooltipOptions)],
            axisY: { onlyInteger: true },
            axisX: { showLabel: false },
        };
        this.tabsChartOptions = {
            low: 0,
            height: "200px",
            width: "650px",
            axisY: { onlyInteger: true },
            axisX: { showLabel: false },
            seriesBarDistance: 10,
            plugins: [Chartist.plugins.tooltip(this.chartTooltipOptions)],
        };

        this.chartData = {
            areaLineData: {
                labels: [1, 2, 3],
                series: [
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0]
                ]
            },
            areaLineOptions: this.chartAreaLineOptions
        }
        this.getInitData();
    }

    public getInitData(): void {
        PageService.showLoader();
        this.showChartLoader = true;
        let currentDate = new Date();
        this.endDate = this.getDateInFormat(currentDate);
        let startDate = new Date(currentDate.setDate(currentDate.getDate() - 6));
        this.startDate = this.getDateInFormat(startDate);
        this.getAnalyticsData(this.selectedAppType);
    }

    public getAnalyticsData(appStatus: number): void {
        let chartlabel = [];
        let chartSeries = [];
        this.appAnalyticsSelectorData.app_id = this.appId;
        this.appAnalyticsSelectorData.start_date = this.startDate;
        this.appAnalyticsSelectorData.end_date = this.endDate;
        this.appAnalyticsSelectorData.app_type = appStatus;
        this.analyticsService.getInitData(this.appAnalyticsSelectorData).subscribe((res) => {
            PageService.hideLoader();
            if (res.success) {
                this.iosDownloads = res.data.ios_app_downloads;
                this.androidDownloads = res.data.android_app_downloads;
                this.androidSession = res.data.android_sessions;
                this.iosSession = res.data.ios_sessions;
                this.html5Session = res.data.html5_sessions;
                this.androidAvgTime = res.data.android_avg_time;
                this.iosAvgTime = res.data.ios_avg_time;
                this.html5AvgTime = res.data.html5_avg_time;
                this.countrySessions = res.data.country_sessions;
                this.tabSessions = res.data.tab_sessions;
                let androidSessionData = [];
                this.showChart = false;
                for (let date in res.data.android_sessions_data) {
                    chartlabel.push(date);
                    androidSessionData.push({ meta: "Android (" + date + ")", value: res.data.android_sessions_data[date] });
                }
                let iosSessionData = [];
                for (let date in res.data.ios_sessions_data) {
                    iosSessionData.push({ meta: "iOS (" + date + ")", value: res.data.ios_sessions_data[date] });
                }
                let html5SessionData = [];
                for (let date in res.data.html5_sessions_data) {
                    html5SessionData.push({ meta: "HTML5 (" + date + ")", value: res.data.html5_sessions_data[date] });
                }

                if (chartlabel.length === 1) {
                    chartlabel.push(chartlabel[0]);
                    androidSessionData.push(androidSessionData[0]);
                    iosSessionData.push(iosSessionData[0]);
                    html5SessionData.push(html5SessionData[0]);
                }

                this.chartData = {
                    areaLineData: {
                        labels: chartlabel,
                        series: [
                            iosSessionData,
                            androidSessionData
                        ]
                    },
                    areaLineOptions: this.chartAreaLineOptions
                }
                if (this.selectedAppType === 1) {
                    this.chartData.areaLineData.series.push(html5SessionData);
                }
                setTimeout(() => this.showChart = true);
                this.initTabSessionsChart();
                console.log('chartlabel-----', chartlabel);
                console.log('chartSeries-----', androidSessionData);
                console.log('chartSeries-----', iosSessionData);
                console.log('chartSeries-----', html5SessionData);
            } else {
                this.pageService.showError(res.message);
            }
            this.showChartLoader = false;
        });
    }
    public onChangeDateRange(event: any): void {
        let currentDate = new Date();
        if (event.value == 1) {//today
            let date = this.getDateInFormat(currentDate);
            this.startDate = date;
            this.endDate = date;
            this.getAnalyticsData(this.selectedAppType);
        } else if (event.value == 2) {// last week
            this.endDate = this.getDateInFormat(currentDate);
            let startDate = new Date(currentDate.setDate(currentDate.getDate() - 6));
            this.startDate = this.getDateInFormat(startDate);
            this.getAnalyticsData(this.selectedAppType);
        } else if (event.value == 3) {// month to date 
            this.startDate = this.getDateInFormat(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
            this.endDate = this.getDateInFormat(new Date());
            this.getAnalyticsData(this.selectedAppType);
        } else if (event.value == 4) { // year to date
            this.startDate = this.getDateInFormat(new Date(new Date().getFullYear(), 0));
            this.endDate = this.getDateInFormat(new Date());
            this.getAnalyticsData(this.selectedAppType);
        } else if (event.value == 5) { // previous month
            let previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));
            this.startDate = this.getDateInFormat(new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1));
            this.endDate = this.getDateInFormat(new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0));
            this.getAnalyticsData(this.selectedAppType);
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
        this.getAnalyticsData(this.selectedAppType);
    }

    public onChangeAppType(event: any): void {
        console.log('this.selectedAppType--', this.selectedAppType);
        this.getAnalyticsData(this.selectedAppType);
    }

    public onCountryPageChanged(event: { page: number, itemsPerPage: number }): void {
        this.countrySessionsCurrentPage = event.page;
    }

    public onCountrySessionsSortClick(): void {
        this.countrySessions.reverse();
    }

    private initTabSessionsChart(): void {
        this.showTabsChart = false;

        type Series = { meta: string, value: any };

        let androidSessions: Series[] = [];
        let iosSessions: Series[] = [];
        let html5Sessions: Series[] = [];

        let chartSessionsUpperLimit: number = this.tabSessionsCurrentPage * this.tabSessionsPerPage;
        let chartTabsLimit: number = this.tabSessions.length > chartSessionsUpperLimit ? chartSessionsUpperLimit : this.tabSessions.length;

        for (let i = chartSessionsUpperLimit - this.tabSessionsPerPage; i < chartTabsLimit; i++) {
            androidSessions.push({ meta: this.tabSessions[i].tab_name + " (Android)", value: this.tabSessions[i].android_sessions });
            iosSessions.push({ meta: this.tabSessions[i].tab_name + " (iOS)", value: this.tabSessions[i].ios_sessions });
            html5Sessions.push({ meta: this.tabSessions[i].tab_name + " (HTML5)", value: this.tabSessions[i].html5_sessions });
        }

        this.tabsChartData = {
            simpleBarData: { series: [iosSessions, androidSessions] },
            simpleBarOptions: this.tabsChartOptions
        };

        if (this.selectedAppType === 1) {
            this.tabsChartData.simpleBarData.series.push(html5Sessions);
        }

        setTimeout(() => this.showTabsChart = true);
    }

    public onTabSessionsPageChanged(event: { page: number, itemsPerPage: number }): void {
        this.tabSessionsCurrentPage = event.page;
        this.initTabSessionsChart();
    }

    public onTabSessionsSortClick(): void {
        this.tabSessions.reverse();
    }

}