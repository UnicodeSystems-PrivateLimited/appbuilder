import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { GlobalService, MusicTabService } from '../../providers';
import { MusicTrackDetail } from '../music-track-detail/music-track-detail'

/*
  Generated class for the MusicTab page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-music-tab',
  templateUrl: 'music-tab.html'
})
export class MusicTab {

  public tabId: number;
  public bgImage: string;
  public title: string;
  public musicTabType: string = "allTracks";

  public loader: boolean = false;
  public alltrackList: any = null;
  public albumList: any = [];
  public tabdata: any = null;
  public tabHeaderImage: string = null;
  public tabs: string = "alltracks";
  public toggleAlbumTrack: Array<boolean> = [];
  public tab_nav_type: string = null;
  public subTabId: number = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalService: GlobalService,
    public service: MusicTabService,
    private platform: Platform,
  ) {
    this.tabId = this.navParams.get('tabId');
    this.title = this.navParams.get('title');
    this.bgImage = this.navParams.get('bgImage');
    this.tab_nav_type = navParams.get('tab_nav_type');
    this.subTabId = navParams.get('subTabId');
    this.globalService.checkTabAddedInEmailMarketting(this.tabId);
    if (this.platform.is("android")) {
      this.getInitData(1);
    } else if ("ios") {
      this.getInitData(2);
    }

  }

  ionViewDidLoad() {
  }

  public getInitData(type: number): void {
    this.loader = true;
    this.service.getInitData(this.tabId, type).subscribe((res) => {
      this.loader = false;
      if (res.success) {
        this.alltrackList = res.data.itemData;
        this.tabdata = res.data.tabData;
        let albums: any = res.data.musicCategory;
        let i = 0;
        for (let album in albums) {
          this.albumList.push(albums[album]);
          this.toggleAlbumTrack[i] = false;
          i++;
        }
        if (this.platform.is("tablet")) {
          this.tabHeaderImage = res.data.header_image.tablet_header_image;
        } else {
          this.tabHeaderImage = res.data.header_image.phone_header_image;
        }
      } else {
        console.log('Server error occured');
      }

    });
  }

  public toggleAlbumTracks(index: number): void {
    this.toggleAlbumTrack[index] = !this.toggleAlbumTrack[index];
  }
  public goTrackDetailPage(track: any): void {
    // 1=>for all track 2=>album
    this.navCtrl.push(MusicTrackDetail, {
      tabId: this.tabId,
      title: this.title,
      bgImage: this.bgImage,
      trackData: track,
      tabHeaderImage: this.tabHeaderImage,
      subTabId: this.subTabId,
      tab_nav_type: this.tab_nav_type
    });
  }
}
