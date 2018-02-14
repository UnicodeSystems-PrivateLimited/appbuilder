
import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'appLengthFilterPipe',
})
@Injectable()
export class MyAppLengthPipe implements PipeTransform {
    transform(input: string): any {
        if (input.length > 10) {
            return (input.substring(0, 10).concat("..."));
        }
        else {
            return (input);
        }
    }
}
