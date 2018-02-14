import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ContentTabTwoService, DisplayService } from '../../providers';
import { ContentTabTwoItem } from "../../interfaces/common-interfaces";
import { ContentTabTwoDesc } from "../content-tab-two-desc/content-tab-two-desc";
import { GlobalService } from '../../providers';

@Component({
    selector: 'page-content-tab-two',
    templateUrl: 'content-tab-two.html'
})
export class ContentTabTwo {

    public tabId: number;
    public title: string;
    public bgImage: string;
    public noSectionItems: ContentTabTwoItem[][] = [];
    public sectionWiseItems: ContentTabTwoItem[][] = [];
    public loader: boolean = false;
    public tab_nav_type: string = null;
    public subTabId: number = null;
    public noDataFound: boolean = false;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public service: ContentTabTwoService,
        public display: DisplayService,
        public globalService: GlobalService

    ) {
        this.tabId = navParams.get('tabId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.getItemList();
    }

    public getItemList(): void {
        this.loader = true;
        this.service.getContentList(this.tabId).subscribe(res => {
            if (res.success) {
                let itemList: any = res.data;
                this.noDataFound = this.globalService.isObjectEmpty(itemList);
                if (typeof itemList.__noSection !== undefined) {
                    this.noSectionItems = itemList.__noSection;
                }
                for (let section in itemList) {
                    if (section === "__noSection") {
                        continue;
                    }
                    this.sectionWiseItems.push(itemList[section]);
                }
                this.loader = false;
            } else {
                console.log("Server error occured.");
            }
        });
    }

    public onItemClick(id: number, name: string): void {
        this.navCtrl.push(ContentTabTwoDesc, {
            itemId: id,
            title: name,
            tabId: this.tabId
        });
    }


}
