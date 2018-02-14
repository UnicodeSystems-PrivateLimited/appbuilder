import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the NoteFilterPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'notefilterpipe'
})
@Injectable()
export class NoteFilterPipe {
  /*
    Takes a value and makes it lowercase.
   */
  transform(notes: any[], args: any): any {
        var val = args;

        return notes.filter((note) => {
            if (val === undefined || val == null) {
                return (note.body);
            }
            else {
                return (note.body.toLowerCase().indexOf(val.toLowerCase()) !== -1);
            }
        });
    }
}
