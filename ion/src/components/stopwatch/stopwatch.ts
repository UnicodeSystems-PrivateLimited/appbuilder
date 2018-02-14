import { Component, Input, Output, EventEmitter } from '@angular/core';

/*
  Generated class for the Stopwatch component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
    selector: 'stopwatch',
    templateUrl: 'stopwatch.html'
})
export class Stopwatch {

    public seconds: number = 0;
    public minutes: number = 0;
    public totalSeconds: number = 0;
    @Input() maxTime: number = 3600; // in seconds
    @Output() maxTimeReached: EventEmitter<null> = new EventEmitter<null>();

    constructor() {
    }

    public ngOnInit(): void {
        setInterval(() => {
            if (this.seconds === 59) {
                this.seconds = 0;
                this.minutes++;
            } else {
                this.seconds++;
            }
            this.totalSeconds++;
            if (this.totalSeconds === this.maxTime) {
                this.maxTimeReached.emit();
            }
        }, 1000);

    }

}
