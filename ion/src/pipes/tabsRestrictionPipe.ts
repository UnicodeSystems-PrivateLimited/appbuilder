import { Injectable, Pipe } from '@angular/core';
import { Platform } from 'ionic-angular';

/*
 Generated class for the TabsRestrictionPipe pipe.

 See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 Angular 2 Pipes.
 */
@Pipe({
    name: 'tabsRestrictionPipe'
})
@Injectable()
export class TabsRestrictionPipe {

    public webRestrictedTabs: string[] = [
        'voice_recording',
        'qr_scanner',
        'notepad'
    ];

    public appRestrictedTabs: string[] = [
        'membership'
    ];

    constructor(public platform: Platform) {
    }

    public transform(list: any[]): any {
        let filteredTabs: any[];

        return list.filter((list) => {
            return (this.checkTabRestriction(list));
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
