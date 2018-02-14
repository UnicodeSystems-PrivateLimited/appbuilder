import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { EmailFormsTabService, DisplayService } from '../../providers';
import { FileData } from "../../interfaces/common-interfaces";


/*
  Generated class for the Formfile page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-formfile',
    templateUrl: 'formfile.html'
})
export class Formfile {
    public fileForm: FileData = new FileData();
    public loader: boolean = false;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        public service: EmailFormsTabService,
        public display: DisplayService,
    ) {

    }

    ionViewDidLoad() {
        console.log('Hello Formfile Page');
    }

    public onFileUploadChange(event: any): void {
        // this.fileUploaded = event.target;
        this.fileForm.file_value = event.target.files[0];
    }

    public formSubmit(): void {
        this.loader = true;
        this.service.saveData(this.fileForm).subscribe((res) => {
            this.loader = false;
            console.log(res);
            if (res.success) {
                console.log(res);
            } else {
                this.display.showToast('Server error occured');
            }
        });
    }


}
