import {Injectable, Pipe, PipeTransform} from '@angular/core';
var moment = require('moment/moment');

@Pipe({
    name: 'datePipe',
    pure: false
})
@Injectable()
export class DatePipe implements PipeTransform {

   transform(value:any) {
    let logindate = moment(value).format('Do-MMM-YYYY');
      return logindate;
    
  }

}