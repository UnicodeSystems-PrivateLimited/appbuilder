import { Component, ViewEncapsulation, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Calendar } from 'primeng/primeng';
import { PageService, GridDataService } from '../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { AppState } from '../../app.state';
var moment = require('moment/moment');

@Component({
    selector: 'date-range-selector',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Calendar],
    encapsulation: ViewEncapsulation.None,
    template: require('./date-range-selector.component.html'),
    providers: []
})

export class DateRangeSelector {
    // @Input() appId: number;
    public currentDate: Date = new Date();
    public toDate: Date;
    public fromDate: Date;

    constructor(private params: RouteParams, protected appState: AppState, public pageService: PageService) {
        // this.appId = appState.dataAppId;
        this.toDate = moment(new Date()).format('MM/DD/YYYY');
        this.fromDate = moment(new Date(this.currentDate.getTime() - (6 * 24 * 60 * 60 * 1000))).format('MM/DD/YYYY');
    }

    public onClickToday(): void {
        this.toDate = moment(new Date()).format('MM/DD/YYYY');
        this.fromDate = moment(new Date()).format('MM/DD/YYYY');
    }

    public onClickLastSevenDays(): void {
        this.toDate = moment(new Date()).format('MM/DD/YYYY');
        this.fromDate = moment(new Date(this.currentDate.getTime() - (6 * 24 * 60 * 60 * 1000))).format('MM/DD/YYYY');
    }

    public onClickMonthToDate(): void {
        this.toDate = moment(new Date()).format('MM/DD/YYYY');
        this.fromDate = moment(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1)).format('MM/DD/YYYY');;
    }

    public onClickYearToDate(): void {
        this.toDate = moment(new Date()).format('MM/DD/YYYY');
        this.fromDate = moment(new Date(this.currentDate.getFullYear(), 0, 1)).format('MM/DD/YYYY');
    }

    // public onClickPreviousMonth(): void {
    //     this.toDate = moment(new Date()).format('MM/DD/YYYY');
    //     this.fromDate = moment(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1)).format('MM/DD/YYYY');
    // }
}  