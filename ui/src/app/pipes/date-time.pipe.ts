import {Injectable, Pipe, PipeTransform} from '@angular/core';
var moment = require('moment/moment');

@Pipe({
    name: 'dateTimePipe',
    pure: false
})
@Injectable()
export class DateTimePipe implements PipeTransform {

   transform(value:any) {
    let dateTime = moment(value).format('Do-MMM-YYYY hh:mm a');
      return dateTime;
    
  }

}