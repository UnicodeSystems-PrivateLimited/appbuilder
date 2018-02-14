import {Injectable, Pipe, PipeTransform} from '@angular/core';

/*
 Generated class for the UserFilter Pipe.

 See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 Angular 2 Pipes.
 */
@Pipe({
    name: 'userFilterPipe'
})
@Injectable()
export class UserFilterPipe {

    public transform(userList: any[], args: any): any {
        var val = args;
        return userList.filter((list) => {
            if ((val === undefined || val == null)) {
                return true;
            } else {
                return (list.user_name.toLowerCase().indexOf(val.toLowerCase()) !== -1);
            }
        });
    }

}
