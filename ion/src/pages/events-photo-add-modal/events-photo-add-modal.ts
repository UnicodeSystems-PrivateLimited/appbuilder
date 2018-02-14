import { Component } from '@angular/core';
import { NavController, ViewController, NavParams } from 'ionic-angular';
import { EventsTabService, DisplayService, GlobalService } from '../../providers';
import { Events, EventsGallery } from "../../interfaces/common-interfaces";
import { ImagePicker } from 'ionic-native';

/*
  Generated class for the EventsPhotoAddModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-events-photo-add-modal',
  templateUrl: 'events-photo-add-modal.html'
})
export class EventsPhotoAddModal {
  public tabId: number;
  public itemId: number;
  public type: number;
  public file: File;
  public fileUploaded: File[] = [];
  public eventGallery: EventsGallery = new EventsGallery();
  public eventId: number;
  public loader: boolean = false;

  constructor(public navCtrl: NavController,
    public viewCtrl: ViewController,
    public globalService: GlobalService,
    public service: EventsTabService,
    public display: DisplayService,
    public navParams: NavParams,
  ) {
    this.tabId = navParams.get('tabId');
    this.itemId = navParams.get('itemId');
    this.file = navParams.get('file');
    this.type = navParams.get('type');

  }

  ionViewDidLoad() {
    console.log('Hello EventsPhotoAddModal Page');
  }

  public dismiss(): void {
    let data = { tabId: this.tabId, itemId: this.itemId };
    this.viewCtrl.dismiss(data);
  }

  // public onFileUploadChange(event: any): void {
  //   this.fileUploaded = event.target;
  //   this.eventGallery.image = event.target.files;
  // }

  public onAddPhoto(): void {
    this.loader = true;
    this.eventGallery.event_id = this.itemId;
    if (this.type == 1) {
      this.eventGallery.image = [this.file];
    } else {
      this.eventGallery.image = this.fileUploaded;
    }
    this.service.saveImages(this.eventGallery).subscribe(res => {
      if (res.success) {
        this.loader = false;
        this.display.showToast(res.message);
        this.dismiss();
        this.fileUploaded = null;
        this.eventGallery = new EventsGallery();
      }
      else {
        this.loader = false;
        this.display.showToast(res.message);
        this.dismiss();
      }
    });
  }
  public selectPhoto(): void {
    ImagePicker.getPictures({
      maximumImagesCount: 10
    }).then((results) => {
      console.log("results++++++++++++", results);
      if (typeof results == "object" && results.length > 0) {
        results.forEach((result) => {
          this.globalService.getFileFromUri(result).then((file) => {
            this.fileUploaded.push(file);
          });
        });
      }
    });
  }
}
