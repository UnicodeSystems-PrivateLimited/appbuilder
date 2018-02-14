import { Injectable, Pipe } from '@angular/core';
import moment from 'moment';

/*
  Generated class for the DateFormatPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'dateFormatPipe'
})
@Injectable()
export class DateFormatPipe {
  /*
    Takes a value and makes it lowercase.
   */
  transform(value:any) {
    let dateValue = moment(value).format('MMMM Do YYYY');
      return dateValue;
    
  }
}
