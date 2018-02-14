
import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'addCountPipe',
    pure: false
})
@Injectable()
export class AddCountPipe implements PipeTransform {
    transform(users: any[], args: any): any {
        let count = 0;
        let val = args;
        for (let user of users) {
            if (val == 'share') {
                count = count + user.share_count ? user.share_count : 0;
            }
            if (val == 'activity') {
                count = count + user.activity ? parseInt(user.activity) : 0;
            }
            if (val == 'fanwall') {
                if(user.fanwall)
                count = count + user.fanwall;
            }
            if (val == 'comment') {
                if(user.comment)
                count = count + parseInt(user.comment);
            }
        }
        return count;
    }
}
