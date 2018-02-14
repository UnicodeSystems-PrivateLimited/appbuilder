import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the LoyaltyPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'loyaltyPipe'
})
@Injectable()
export class LoyaltyPipe {
  /*
    Takes a value and makes it lowercase.
   */
//   transform(lists: any[], args: any, field:string): any {
//         var val = args;

//         return lists.filter((list) => {
//             if (val === undefined || val == null) {
//                 return (list[field]);
//             }
//             else {
//                 return (list[field].toLowerCase().indexOf(val.toLowerCase()) !== -1);
//             }
//         });
//     }

      transform(lists: any[], args: any): any {
        var val1 = args;
        return lists.filter((list) => {
            if (val1 === undefined || val1 == null) {
                return (list.loyalty_title ? list.loyalty_title : list.reward_text);
            }
            
            else {
                return ((list.loyalty_title ? list.loyalty_title : list.reward_text).toLowerCase().indexOf(val1.toLowerCase()) !== -1);
            }
        });
    }
}
