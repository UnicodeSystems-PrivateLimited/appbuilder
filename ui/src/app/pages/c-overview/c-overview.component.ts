import { Component, ViewEncapsulation } from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, Control, AbstractControl } from '@angular/common';
import { Router, RouteConfig, RouterOutlet, RouteParams, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { DROPDOWN_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { SelectItem } from 'primeng/primeng';
import { BaCard } from '../../theme/components';
import { PageService, GridDataService } from '../../theme/services';
import { Dialog, Dropdown, Growl, Message } from 'primeng/primeng';
import { EmailValidator, EqualPasswordsValidator, UrlValidator, AlphaValidator } from '../../theme/validators';
import { MyAppPipe } from '../../theme/pipes';
import { AppState } from '../../app.state';
import { Observable } from 'rxjs/Observable';
import { Settings } from '../settings';
import { SettingsService } from '../settings/settings.service';
import { DomSanitizationService } from "@angular/platform-browser";
import { COverviewService } from './c-overview.service';
import { DashboardActivities, activityType } from '../../theme/interfaces';
import { TimeDifferenceFormatPipe } from '../../pipes/time-difference-format.pipe';
import { DateTimeFormatPipe } from '../../pipes/date-time-format.pipe';
import { ChartistJs } from "../charts/components/chartistJs/chartistJs.component";
import { Chartist } from "../../theme/components/baChartistChart/baChartistChart.loader";
import { AppAnalyticsSelectorData } from "../../theme/interfaces/common-interfaces";
import { CAnalyticsService } from '../c-analytics/c-analytics.service';



@Component({
    selector: 'c-overview',
    pipes: [MyAppPipe, TimeDifferenceFormatPipe, DateTimeFormatPipe],
    directives: [ROUTER_DIRECTIVES, BaCard, DROPDOWN_DIRECTIVES, Growl, Dialog, Dropdown, PAGINATION_DIRECTIVES, ChartistJs],
    encapsulation: ViewEncapsulation.None,
    styles: [require('../settings/settings.scss')],
    template: require('./c-overview.component.html'),
    providers: [GridDataService, PageService, COverviewService, CAnalyticsService]
})


export class COverview {
    public appId: any;
    public appCode: any;
    public appSimulatorURL: any;
    public acivities: DashboardActivities[] = [];
    public dateformat: string = "dddd, MMMM Do, YYYY";
    public timeformat: string = "h:mm a";
    public activityType = activityType;
    public chartData: any;
    public chartTooltipOptions: Object;
    public chartAreaLineOptions: Object;
    public showChartLoader: boolean = false;
    public startDate: string = null;
    public endDate: string = null;
    public appAnalyticsSelectorData: AppAnalyticsSelectorData = new AppAnalyticsSelectorData();
    public showChart: boolean = false;
    public selectedAppType: number = 1;
    public showNotingFoundAnalytics: boolean = false;
    public topUserList: Array<any> = [];
    public showMainLoader: boolean = false;
    public totalItems: number = 0;
    public currentPage: number = 1;
    public itemsPerPage: number = 10;
    public maxSize: number = 4;
    public count: SelectItem[] = [{ label: '10', value: 10 }, { label: '20', value: 20 }, { label: '30', value: 30 }, { label: '40', value: 40 }];
    public selectedCount: number = 10;

    constructor(
        settingsService: SettingsService,
        protected appState: AppState,
        protected router: Router,
        private sanitizer: DomSanitizationService,
        private service: COverviewService,
        private pageService: PageService,
        private analyticsService: CAnalyticsService
    ) {
        this.appId = parseInt(sessionStorage.getItem('appId'));
        PageService.showpushNotificationButton = false;
        this.chartAreaLineOptions = {
            fullWidth: true,
            low: 0,
            height: "270px",
            showArea: true,
            plugins: [Chartist.plugins.tooltip(this.chartTooltipOptions)],
            axisY: { onlyInteger: true },
            axisX: { showLabel: false },
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
        this.showMainLoader = true;
        this.analyticsService.getInitData(this.appAnalyticsSelectorData).subscribe((res) => {
            PageService.hideLoader();
            if (res.success) {
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
                this.showNotingFoundAnalytics = (res.data.android_sessions == 0 && res.data.ios_sessions == 0 && res.data.html5_sessions == 0) ? true : false;

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
            } else {
                this.pageService.showError(res.message);
            }
            this.showChartLoader = false;
            this.showMainLoader = false;
        });
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

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        this.service.getInitData(this.appId, this.currentPage, this.itemsPerPage).subscribe(res => {
            if (res.success) {
                this.acivities = res.data.data;
                this.totalItems = res['data'].total;
                this.topUserList = res['topUser'];
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public navigateToPage(pageName: string): void {
        if (pageName == 'CPromote') {
            console.log("hi");
            this.router.parent.navigate(['CPromote', { tab_type: 2 }]);
        } else {
            this.router.parent.navigate([pageName]);
        }

    }
    public setItemsPerPage(perPage: number): void {
        this.itemsPerPage = perPage;
        this.getInitData();
    }
    public pageChanged(event: any): void {
        this.currentPage = event.page;
        this.getInitData();
    }
}