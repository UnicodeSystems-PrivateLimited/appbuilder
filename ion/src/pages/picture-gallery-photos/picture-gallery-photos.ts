import { Component, ViewChild } from '@angular/core';
import { NavController, Platform, NavParams, LoadingController, Slides } from 'ionic-angular';
import { PictureGalleryService, DisplayService } from '../../providers';
import { GalleryPhotos } from "../../interfaces/common-interfaces";
import { PictureGallerySlide } from "../picture-gallery-slide/picture-gallery-slide";
import { GlobalService } from '../../providers';
/*
  Generated class for the PictureGalleryPhotos page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-picture-gallery-photos',
    templateUrl: 'picture-gallery-photos.html'
})
export class PictureGalleryPhotos {

    @ViewChild('coverflowGrid') slider: Slides;
    public galleryId: number;
    public tabId: number;
    public galleryName: string;
    public galleryPhotos: GalleryPhotos[][] = [];
    public bgImage: string;
    public loader: boolean = false;
    public galleryType: number;
    public settings: any;
    public slideOptions: any;
    public currentIndex: number = 0;

    private GALLERY_TYPE_GRID: number = 1;
    private GALLERY_TYPE_COVERFLOW: number = 2;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        public service: PictureGalleryService,
        public display: DisplayService,
        private loadingCtrl: LoadingController,
        public globalService: GlobalService,
    ) {
        this.galleryId = navParams.get('glryId');
        this.tabId = navParams.get('tabId');
        this.galleryName = navParams.get('glryName');
        this.bgImage = navParams.get('bgImage');
        this.galleryType = navParams.get("galleryType");
        this.settings = navParams.get("settings");
        this.slideOptions = {
            effect: "coverflow"
        };
    }

    public ionViewDidLoad(): void {
        if (this.settings && this.settings.imageServiceType != 1) {
            this.getInstagramImages();
        } else {
            this.getGalleryPhotosList();
        }
    }

    public onSlideChanged(): void {
        this.currentIndex = this.slider.getActiveIndex();
        console.log(this.currentIndex);
    }

    public getGalleryPhotosList(): void {
        this.loader = true;
        console.log('getGalleryPhotosList called -----')
        this.service.getGalleryPhotosList(this.galleryId).subscribe(res => {
            if (res.success) {
                if (this.platform.is("ipad") && this.galleryType === this.GALLERY_TYPE_COVERFLOW) {
                    if (res.data.galleryimages.length > 15) {
                        for (let i = 0; i < 15; i++) {
                            this.galleryPhotos.push(res.data.galleryimages[i]);
                        }
                    } else {
                        this.galleryPhotos = res.data.galleryimages;
                    }
                } else {
                    this.galleryPhotos = res.data.galleryimages;
                }
                console.log("this.galleryPhotos", this.galleryPhotos);
                this.loader = false;
            } else {
                this.display.showToast("Could not fetch data");
            }
        });
    }

    public onGalleryPictureClick(imageIndex: number, allGalleryPhotos: any): void {
        this.navCtrl.push(PictureGallerySlide, {
            imgIndex: imageIndex,
            glryPhotos: allGalleryPhotos,
            tabId: this.tabId
        })
    }
    public getInstagramImages(): void {
        this.loader = true;
        this.service.getInstagramImagesList(this.tabId, this.settings.instagram_user_name).subscribe((res) => {
            if (res.success) {
                this.galleryPhotos = res.data;
                console.log("  this.galleryPhotos",  this.galleryPhotos);
                this.loader = false;
            } else {
                this.display.showToast("Could not fetch data");
            }
        })
    }

}
