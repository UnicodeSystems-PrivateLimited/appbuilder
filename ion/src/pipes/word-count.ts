import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the WordCount pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({ name: 'wordCount' })
@Injectable()
export class WordCount {

    public transform(str: string): string {
        let lines: string[] = str.split("\n");
        let totalWords: number = 0;
        for (let line of lines) {
            let words = line.split(" ");
            let finalWords = words.filter((word) => {
                return word;
            });
            totalWords += finalWords.length;
        }
        return totalWords + " word" + (totalWords !== 1 ? "s" : "");
    }

}
