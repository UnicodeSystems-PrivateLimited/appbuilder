import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the EventFilterPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'eventfilterpipe'
})
@Injectable()
export class EventFilterPipe {
  /*
    Takes a value and makes it lowercase.
   */
   transform(eventList: any[], args: any): any {
        var val = args;

        return eventList.filter((list) => {
            if (val === undefined || val == null) {
                return (list.name);
            }
            else {
                return (list.name.toLowerCase().indexOf(val.toLowerCase()) !== -1);
            }
        });
    }
}
