import {Injectable, Pipe, PipeTransform} from '@angular/core';
var moment = require('moment/moment');

@Pipe({
    name: 'timePipe',
    pure: false
})
@Injectable()
export class TimePipe implements PipeTransform {

   transform(value:any) {
    let time = moment(value).format(' hh:mm a');
      return time;
    
  }

}