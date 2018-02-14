import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'formEntryPipe',
    pure: false
})
@Injectable()
export class FormEntryPipe implements PipeTransform {

    transform(list: any[], headerIds: number[]): any {
        return list.filter((val) => {
            if (headerIds.indexOf(parseInt(val.id)) !== -1) {
                return (val);
            }
        });
    }

}