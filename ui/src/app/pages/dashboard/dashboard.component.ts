import { Component, ViewEncapsulation } from '@angular/core';

import { PopularApp } from './popularApp';
import { PieChart } from './pieChart';
import { TrafficChart } from './trafficChart';
import { UsersMap } from './usersMap';
import { LineChart } from './lineChart';
import { Feed } from './feed';
import { Todo } from './todo';
import { Calendar } from './calendar';
import { BaCard } from '../../theme/components';
import { PageService } from '../../theme/services';
import { DashboardService } from './dashboard.service';
import { DashboardActivities, activityType } from '../../theme/interfaces';
import { TimeDifferenceFormatPipe } from '../../pipes/time-difference-format.pipe';
import { DateTimeFormatPipe } from '../../pipes/date-time-format.pipe';
import { Dropdown, SelectItem } from 'primeng/primeng';
import { PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';

@Component({
    selector: 'dashboard',
    pipes: [TimeDifferenceFormatPipe, DateTimeFormatPipe],
    directives: [PopularApp, PAGINATION_DIRECTIVES, Dropdown, PieChart, TrafficChart, UsersMap, LineChart, Feed, Todo, Calendar, BaCard],
    encapsulation: ViewEncapsulation.None,
    styles: [require('./dashboard.scss')],
    template: require('./dashboard.html'),
    providers: [PageService, DashboardService]
})
export class Dashboard {
    public acivities: DashboardActivities[] = [];
    public dateformat: string = "dddd, MMMM Do, YYYY";
    public timeformat: string = "h:mm a";
    public activityType = activityType;
    public showLoader: boolean = false;
    public totalItems: number = 0;
    public currentPage: number = 1;
    public itemsPerPage: number = 10;
    public maxSize: number = 4;
    public count: SelectItem[] = [{ label: '10', value: 10 }, { label: '20', value: 20 }, { label: '30', value: 30 }, { label: '40', value: 40 }];
    public selectedCount: number = 10;

    constructor(
        private pageService: PageService,
        private service: DashboardService
    ) {
        PageService.showpushNotificationButton = false;
        this.showLoader = true;
        this.getInitData();
    }

    // public ngOnInit(): void {

    // }

    public getInitData(): void {

        this.service.getInitData(this.currentPage, this.itemsPerPage).subscribe(res => {
            if (res.success) {
                this.acivities = res['data'].data;
                this.totalItems = res['data'].total;
            } else {
                this.pageService.showError(res.message);
            }
            this.showLoader = false;
        });
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
