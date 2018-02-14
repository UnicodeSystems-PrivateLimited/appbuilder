import { Injectable, Pipe } from '@angular/core';

@Pipe({
    name: 'trimmer'
})
@Injectable()
export class Trimmer {

    public transform(str: string, limit: number): string {
        if (str.length < limit) {
            return str;
        } else {
            return str.substr(0, limit) + "...";
        }
    }

}
