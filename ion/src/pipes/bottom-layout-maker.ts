import { Injectable, Pipe } from '@angular/core';

@Pipe({ name: 'bottomLayoutMaker' })
@Injectable()
export class BottomLayoutMaker {

    public transform(value: any[], rows: any, tabNumber: number, rowIndex: number): any[] {
        let chunks: any[][] = this.getChunks(value, tabNumber);
        let rowData: any[][] = [];
        for (let i = 0; i < rows; i++) {
            rowData[i] = [];
        }
        let j: number = 0;
        for (let i = 0; i < chunks.length; i++) {
            if (j >= rows) j = 0;
            rowData[j] = rowData[j].concat(chunks[i]);
            j++;
        }
        return rowData[rowIndex];
    }

    private getChunks(array: any[], chunk: number): any[][] {
        let i: number, j: number, tempArray: any[], returnArray: any[][] = [];
        for (i = 0, j = array.length; i < j; i += chunk) {
            tempArray = array.slice(i, i + chunk);
            returnArray.push(tempArray);
        }
        return returnArray;
    }

}
