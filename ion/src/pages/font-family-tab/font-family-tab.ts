import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FontFamilyService } from "../../providers/font-family-tab-service";
import { DisplayService } from "../../providers/display-service/display-service";

/*
  Generated class for the FontFamilyTab page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-font-family-tab',
    templateUrl: 'font-family-tab.html'
})
export class FontFamilyTab {
    public loader: boolean = false;
    public fFamily;

    constructor(public navCtrl: NavController, public service: FontFamilyService, public displayService: DisplayService) {
        this.getInitData();
    }

    public getInitData(): void {
       this.loader = true;
        this.service.getFontFamilyData().subscribe((res) => {
            if (res.success) {
                this.fFamily = res.data;
               this.loader = false;
            } else {
                console.log("Server error occured.");
            }
        });
    }

}
