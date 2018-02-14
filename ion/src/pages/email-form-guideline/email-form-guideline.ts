import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

/*
  Generated class for the EmailFormGuideline page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-email-form-guideline',
    templateUrl: 'email-form-guideline.html'
})
export class EmailFormGuideline {
    public guideline:string;
    
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController
    ) {
        this.guideline = navParams.get('data');
    }

    close() {
        this.viewCtrl.dismiss();
    }


}
