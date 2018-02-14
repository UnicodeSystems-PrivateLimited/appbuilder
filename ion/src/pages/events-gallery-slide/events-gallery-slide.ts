import { Component, ViewChild } from '@angular/core';
import { NavController, Platform, NavParams, Slides } from 'ionic-angular';
import { EventsTabService, DisplayService, GlobalService } from '../../providers';
import { SocialSharing, PhotoLibrary } from 'ionic-native';
/*
  Generated class for the EventsGallerySlide page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-events-gallery-slide',
  templateUrl: 'events-gallery-slide.html'
})
export class EventsGallerySlide {
  @ViewChild('mySlider') slider: Slides;
  @ViewChild("imageData") imageData;

  public mySlideOptions;
  public galleryId: number;
  public tabId: number;
  public imageIndex: number;
  public galleryPhotos = [];
  public firstChange: boolean = true;
  public currentImageNumber: number;
  public caption: string;
  public descDisplay: boolean = false;
  public timeout: any;
  public appStoreUrl: string = null;
  public appName: string = null;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public service: EventsTabService,
    public display: DisplayService,
    public globalService: GlobalService, ) {

    this.galleryPhotos = navParams.get('glryPhotos');
    this.imageIndex = navParams.get('imgIndex');
    this.tabId = navParams.get('tabId');
    this.currentImageNumber = this.imageIndex + 1;
    if (this.currentImageNumber === 1) {
      this.firstChange = false;
    }
    this.mySlideOptions = {
      initialSlide: this.imageIndex,
      zoom: true
    };
    this.appName = this.globalService.initData.appData.app_name;
    console.log(this.appName);

    if (platform.is("android")) {
      this.appStoreUrl = this.globalService.initData.appData.google_play_store_url;
    }
    else if (platform.is("ios")) {
      this.appStoreUrl = this.globalService.initData.appData.ios_app_store_url;
    }
    this.showDescription(this.galleryPhotos[this.imageIndex].caption);

  }

  ionViewDidLoad() {
    console.log('Hello EventsGallerySlide Page');
  }
  public onSlideChanged(): void {
    if (!this.firstChange) {
      this.currentImageNumber = this.slider.getActiveIndex() + 1;
      if (this.currentImageNumber > this.galleryPhotos.length) {
        this.currentImageNumber -= this.galleryPhotos.length;
      } else if (this.currentImageNumber < 1) {
        this.currentImageNumber += this.galleryPhotos.length;
      }
      clearTimeout(this.timeout);
      this.descDisplay = false;
    }
    this.firstChange = false;
  }

  private showDescription(desc: string): void {
    if (!desc || desc === "") {
      return;
    }
    this.caption = desc;
    this.descDisplay = true;
    this.timeout = setTimeout(() => {
      this.descDisplay = false;
    }, 3000);
  }

  public onImageClick(desc: string): void {
    this.showDescription(desc);
  }

  public onSharingClick(): void {
    this.display.showImageShareActionSheet(() => {
      this.onShareByFacebook();
    }, () => {
      this.onShareByTwitter();
    }, () => {
      this.onShareByEmail();
    }, () => {
      this.onShareBySms();
    }, () => {
      this.onSaveToALbum();
    },
      () => {
        this.onShareCancel();
      });
  }

  private onShareByFacebook(): void {
    console.log(this.imageData.nativeElement.src);
    SocialSharing.shareViaFacebook("Check out this app : " + this.appStoreUrl, this.imageData.nativeElement.src).then(() => {
      console.log("Facebook share success");
    }).catch(() => {
      if (!this.platform.is("ios")) {
        this.display.showToast("Facebook app not found.");
      }
    });
  }

  private onShareByTwitter(): void {
    console.log(this.imageData.nativeElement.src);
    SocialSharing.shareViaTwitter("Check out this app : " + this.appStoreUrl, this.imageData.nativeElement.src).then(() => {
      console.log("Twitter share success");
    }).catch(err => {
      if (!this.platform.is("ios")) {
        this.display.showToast("Twitter app not found.");
      }
      console.log(err);
    });
  }

  private onShareByEmail(): void {
    SocialSharing.canShareViaEmail().then(() => {
      SocialSharing.shareViaEmail("Check out this app : " + this.appStoreUrl, this.appName, [], [], [], this.imageData.nativeElement.src).then(() => {
        console.log("Email share success");
      }).catch(() => {
        this.display.showToast("Could not open email sender.");
      });
    }).catch(() => {
      this.display.showToast("Email sending is not supported.");
    });
  }

  private onShareBySms(): void {
    SocialSharing.shareViaSMS(this.imageData.nativeElement.src + "Check out this app : " + this.appStoreUrl, null).then(() => {
      console.log("SMS share success");
    }).catch(() => {
      this.display.showToast("Could not open SMS sender.");
    });
  }

  private onSaveToALbum(): void {
    console.log("this.imageData.nativeElement.src", this.imageData.nativeElement.src);
    PhotoLibrary.saveImage(this.imageData.nativeElement.src, 'events album').then(() => {
      this.display.showToast("Photo saved to album");
    }).catch(() => {
      this.display.showToast("Could not save photo");
    })
  }

  private onShareCancel(): void {
  }
}
