import { Injectable, Pipe } from '@angular/core';

@Pipe({
    name: 'trimmer'
})
@Injectable()
export class Trimmer {

    public transform(str: string, limit: number, strictLimit?: boolean): string {
        // used to remove multiple spaces between string
        let splited_string = str.split(" ");
        let final_string = splited_string.filter(function (string) {
            return string;
        });
        let final_strings = final_string.join(" ");
        // logic for implementing trimmer
        if (final_strings.length <= limit) {
            return str;
        } else {
            if (strictLimit) {
                limit -= 3;
            }
            return str.substr(0, limit) + "...";
        }
    }

}
