import { Injectable, Pipe } from '@angular/core';

@Pipe({
    name: 'jsonParser'
})
@Injectable()
export class JsonParser {

    transform(value: string): any {
        value = JSON.parse(value);
        return value;
    }
    
}
