import { Component } from '@angular/core';
import { NavController, Platform, NavParams, LoadingController } from 'ionic-angular';
import { PictureGalleryService, DisplayService } from '../../providers';
import { Gallery } from "../../interfaces/common-interfaces";
import { PictureGalleryPhotos } from "../picture-gallery-photos/picture-gallery-photos";
import { GlobalService } from '../../providers';
/*
  Generated class for the PictureGallery page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-picture-gallery',
    templateUrl: 'picture-gallery.html'
})
export class PictureGallery {

    public tabId: number;
    public title: string;
    public bgImage: string;
    public gallery: Gallery[] = [];
    public loader: boolean = false;
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        public service: PictureGalleryService,
        public display: DisplayService,
        private loadingCtrl: LoadingController,
        public globalService: GlobalService,
    ) {
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.getGalleryList();
    }

    public getGalleryList(): void {
        this.loader = true;
        this.service.getList(this.tabId).subscribe(res => {
            if (res.success) {
                console.log(this.tabId);
                this.gallery = res.data;
                this.loader = false;
            } else {
                this.display.showToast("Could not fetch data");
            }
        });
    }

    public onGalleryClick(galleryId: number, galleryName: string, galleryType: number): void {
        this.navCtrl.push(PictureGalleryPhotos, {
            glryId: galleryId,
            glryName: galleryName,
            bgImage: this.bgImage,
            tabId: this.tabId,
            settings:null,
            galleryType: galleryType
        })
    }

}
