import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the NoteFilterPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'shoppingcartitemsfilterpipe'
})
@Injectable()
export class ShoppingCartItemsFilterPipe {
  /*
    Takes a value and makes it lowercase.
   */
  transform(categoryListItems: any[], args: any): any {
        var val = args;

        return categoryListItems.filter((items) => {
            if (val === undefined || val == null) {
                return true;
            }
            else {
                return (items.name.toLowerCase().indexOf(val.toLowerCase()) !== -1);
            }
        });
    }
}
