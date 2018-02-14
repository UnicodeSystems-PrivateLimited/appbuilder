import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the NewsFilterPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'newsfilterpipe'
})
@Injectable()
export class NewsFilterPipe {
  /*
    Takes a value and makes it lowercase.
   */
   transform(newsList: any[], args: any): any {
        var val = args;

        return newsList.filter((list) => {
            if (val === undefined || val == null) {
                return (list.title);
            }
            else {
                return (list.title.toLowerCase().indexOf(val.toLowerCase()) !== -1);
            }
        });
    }
}
