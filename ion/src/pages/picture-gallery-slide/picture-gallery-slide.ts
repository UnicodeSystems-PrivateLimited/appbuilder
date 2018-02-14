import { Component, ViewChild } from '@angular/core';
import { NavController, Platform, NavParams, Slides } from 'ionic-angular';
import { PictureGalleryService, DisplayService } from '../../providers';
import { GalleryPhotos } from "../../interfaces/common-interfaces";
import { GlobalService } from '../../providers';
/*
  Generated class for the PictureGallerySlide page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-picture-gallery-slide',
    templateUrl: 'picture-gallery-slide.html'
})

export class PictureGallerySlide {

    @ViewChild('mySlider') slider: Slides;
    public mySlideOptions;
    public galleryId: number;
    public tabId: number;
    public imageIndex: number;
    public galleryPhotos: GalleryPhotos[] = [];
    public firstChange: boolean = true;
    public currentImageNumber: number;
    public description: string;
    public descDisplay: boolean = false;
    public timeout: any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        public service: PictureGalleryService,
        public display: DisplayService,
        public globalService: GlobalService,
    ) {
        this.galleryPhotos = navParams.get('glryPhotos');
        this.imageIndex = navParams.get('imgIndex');
        this.tabId = navParams.get('tabId');
        this.currentImageNumber = this.imageIndex + 1;
        if (this.currentImageNumber === 1) {
            this.firstChange = false;
        }
        this.mySlideOptions = {
            initialSlide: this.imageIndex
        };
        this.showDescription(this.galleryPhotos[this.imageIndex].description);
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
        this.description = desc;
        this.descDisplay = true;
        this.timeout = setTimeout(() => {
            this.descDisplay = false;
        }, 3000);
    }

    public onImageClick(desc: string): void {
        this.showDescription(desc);
    }


}
