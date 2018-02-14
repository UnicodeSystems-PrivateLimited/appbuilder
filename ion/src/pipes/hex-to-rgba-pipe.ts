import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the HexToRGBAPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
    name: 'hex2rgba'
})
@Injectable()
export class HexToRGBAPipe {

    public transform(hex: string): string {
        let r: number, g: number, b: number, result: string;
        hex = hex.replace('#', '');
        if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else if (hex.length === 3) {
            r = parseInt(hex.substring(0, 1) + hex.substring(0, 1), 16);
            g = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
            b = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
        } else {
            return null;
        }
        result = 'rgba(' + r + ',' + g + ',' + b + ',' + '0.7)';
        return result;
    }
}
