import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the QrCouponPipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'qrCouponPipe'
})
@Injectable()
export class QrCouponPipe {
  /*
    Takes a value and makes it lowercase.
   */
  transform(couponList: any[], args: any): any {
        var val = args;

        return couponList.filter((list) => {
            if (val === undefined || val == null) {
                return (list.coupon_name);
            }
            else {
                return (list.coupon_name.toLowerCase().indexOf(val.toLowerCase()) !== -1);
            }
        });
    }
}
