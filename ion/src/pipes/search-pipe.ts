import { Injectable, Pipe } from '@angular/core';

@Pipe({
    name: 'search'
})
@Injectable()
export class SearchPipe {

    transform(data: any[], search: string, key: string) {
        return data.filter(row => {
            if (search === undefined || search == null) {
                return (row[key]);
            } else {
                return (row[key].toLowerCase().indexOf(search.toLowerCase()) !== -1);
            }
        });
    }
}
