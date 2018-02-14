import { Injectable, Pipe } from '@angular/core';
var moment = require('moment/moment');

/*
  Generated class for the DateTimeFormat pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
    name: 'dateTimeFormatPipe'
})
@Injectable()
export class DateTimeFormatPipe {
    transform(value: any, formatType: any) {
        let server_time = new Date(moment(value).format());
        let current_zone_time = new Date(server_time.getTime() - (server_time.getTimezoneOffset() * 60000));
        let current_zone_time_formated = moment(current_zone_time).format(formatType);
        return current_zone_time_formated;
    }
}
