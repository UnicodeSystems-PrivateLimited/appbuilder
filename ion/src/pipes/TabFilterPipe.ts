import { Injectable, Pipe } from '@angular/core';
import { Platform } from 'ionic-angular';

/*
 Generated class for the TabFilterPipe pipe.

 See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 Angular 2 Pipes.
 */
@Pipe({
    name: 'tabFilterPipe'
})
@Injectable()
export class TabFilterPipe {

    public webRestrictedTabs: string[] = [
        'voice_recording',
        'qr_scanner',
        'notepad',
        'inbox',
        'find_where_i_parked'
    ];

    public appRestrictedTabs: string[] = [
        'membership'
    ];

    constructor(public platform: Platform) {
    }

    public transform(list: any[], args: any): any {
        let filteredTabs: any[];
        var val = args;

        return list.filter((list) => {
            if ((val === undefined || val == null)) {
                return this.checkTabRestriction(list) ? (list.title) : false;
            } else {
                return (list.title.toLowerCase().indexOf(val.toLowerCase()) !== -1 && this.checkTabRestriction(list));
            }
        });

    }

    /**
     * true - Tab not restricted
     * false - Tab is restricted
     */

    private checkTabRestriction(tab: any): boolean {
        if(this.appRestrictedTabs.indexOf(tab.tab_func_code) === -1 ? true : false){
            if (this.platform.is("core") || this.platform.is("mobileweb")) {
                return this.webRestrictedTabs.indexOf(tab.tab_func_code) === -1 ? true : false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
}
