import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the AddFoodOrderingAddresses page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-add-food-ordering-addresses',
  templateUrl: 'add-food-ordering-addresses.html'
})
export class AddFoodOrderingAddresses {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    console.log('Hello AddFoodOrderingAddresses Page');
  }

}
