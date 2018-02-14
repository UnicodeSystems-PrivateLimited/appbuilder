import { Injectable, Pipe, PipeTransform } from '@angular/core';

/*
  Generated class for the LuminosityCheckerPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
    name: 'luminosityChecker',
    pure: false
})
@Injectable()
export class LuminosityCheckerPipe implements PipeTransform {

    public transform(hex: string): string {
        let r: number, g: number, b: number, a: number, rgba: string, rgbaInArray: string[], lum: number, result: string;
        hex = hex.replace('#', '');
        if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
            a = 1;
        } else if (hex.length === 3) {
            r = parseInt(hex.substring(0, 1) + hex.substring(0, 1), 16);
            g = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
            b = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
            a = 1;
        } else {
            rgba = hex;
            rgba = rgba.replace('rgba', '');
            rgba = rgba.replace('(', '');
            rgba = rgba.replace(')', '');
            rgbaInArray = rgba.split(',');
            r = parseInt(rgbaInArray[0]);
            g = parseInt(rgbaInArray[1]);
            b = parseInt(rgbaInArray[2]);
            a = parseFloat(rgbaInArray[3]);
        }

        lum = (r*0.299 + g*0.587 + b*0.114) / 255;
        if(lum > 0.5) {
            result = '#000';
        } else {
            if(a < 0.5) {
                result = '#000';
            } else {
                result = '#fff';
            }
        }
        return result;
    }
}
