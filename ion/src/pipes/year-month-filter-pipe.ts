import { Injectable, Pipe } from '@angular/core';
import moment from 'moment';

/*
  Generated class for the YearMonthFilterPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'yearmonthfilter'
})
@Injectable()
export class YearMonthFilterPipe {
  /*
    Takes a value and makes it lowercase.
   */
  transform(value:any) {
    let eventDate = moment(value).format('MMMM YYYY');
      return eventDate;
    
  }
}
