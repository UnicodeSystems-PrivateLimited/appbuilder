import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'arrayElementCounterPipe',
    pure: false
})
@Injectable()
export class ArrayElementCounterPipe implements PipeTransform {
    transform(value: any) {
        let count = 0;
        if (value) {
            let val_arr = JSON.parse(value);
            count = val_arr.length;
        } 
        return count;
    }
}