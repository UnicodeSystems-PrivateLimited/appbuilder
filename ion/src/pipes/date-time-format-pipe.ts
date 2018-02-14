import { Injectable, Pipe } from '@angular/core';
import moment from 'moment';
import { GlobalService } from '../providers';

/*
  Generated class for the DateTimeFormatPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'datetimeformatpipe'
})
@Injectable()
export class DateTimeFormatPipe {
  /*
    Takes a value and makes it lowercase.
   */
  constructor(private globalService: GlobalService) {

  }
  transform(value: any) {
    let eventdate;
    if (this.globalService.timeFormatSettings == 24) {
      eventdate = moment(value).format('MMM Do YYYY , HH:mm:ss');
    } else {
      eventdate = moment(value).format('MMM Do YYYY , h:mm:ss a');
    }
    return eventdate;

  }
}
