import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the FileNamePipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
    name: 'fileName'
})
@Injectable()
export class FileNamePipe {

    public transform(value: string): string {
        let splits: string[] = value.split('.');
        splits.pop();
        return splits.join('.');
    }

}
