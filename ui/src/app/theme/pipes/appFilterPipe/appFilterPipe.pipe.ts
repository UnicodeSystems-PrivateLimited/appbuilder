
import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'appFilterPipe',
    pure: false
})
@Injectable()
export class MyAppPipe implements PipeTransform {
    transform(list: any[], args: any): any {
        //   return friends.filter(friend => friend.user.fname.indexOf(args[0]) !== -1);
         console.log('args : ' + args);
        var val = args;

        return list.filter((list) => {
           // console.log('VAL : ' + val);
          //  console.log('VAL : ' + val);
            if (val === undefined || val == null) {
                return (list.app_name);
            }
            else
                return (list.app_name.toLowerCase().indexOf(val.toLowerCase()) !== -1);

        });
    }
}
