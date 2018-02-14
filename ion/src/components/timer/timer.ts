import { Component, Output, EventEmitter } from '@angular/core';
import { FindWhereIParkedService } from "../../providers"

@Component({
    selector: 'timer',
    templateUrl: 'timer.html'
})
export class Timer {

    public timer: string;
    @Output() timerDateTimeOpened: EventEmitter<null> = new EventEmitter<null>();
    @Output() timerDateTimeCancelled: EventEmitter<null> = new EventEmitter<null>();
    @Output() timerDateTimeDone: EventEmitter<null> = new EventEmitter<null>();

    constructor(public service: FindWhereIParkedService) {
    }

    public onTimerClick(): void {
        if (this.service.timerRunning) {
            this.service.stopTimer();
        }
    }

    public onTimeChange(): void {
        this.onTimerDateTimeDone();
        this.service.timerRunning = true;
        let timerSplit: string[] = this.timer.split(":");
        this.service.timerTime.hours = parseInt(timerSplit[0]);
        this.service.timerTime.minutes = parseInt(timerSplit[1]);
        this.service.timerTime.seconds = 0;
        this.service.startTimer();
    }

    public onDateTimeClicked(): void {
        this.timerDateTimeOpened.emit();
    }

    public onDateTimeCancelled(): void {
        this.timerDateTimeCancelled.emit();
    }

    public onTimerDateTimeDone(): void {
        this.timerDateTimeDone.emit();
    }
}
