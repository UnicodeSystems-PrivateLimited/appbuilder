import { Injectable, Pipe } from '@angular/core';

@Pipe({
  name: 'replies'
})
@Injectable()
export class RepliesPipe {
  
    public transform(value: number): string {
        let replyText: string = value <= 1 ? "Reply" : "Replies";
        return (value > 0 ? value + " " : "") + replyText;
    }

}
