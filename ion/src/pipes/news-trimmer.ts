import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the NewsTrimmer pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'newstrimmer'
})
@Injectable()
export class NewsTrimmer {

  public transform(str: string, limit: number): string {

    // logic for implementing trimmer
      if (str.length < limit) {
        return str;
      } else {
        return str.substr(0, limit) + "...";
      }
  }

}
