import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ContentTabThreeService, DisplayService } from '../../providers';
import { ContentTabThreeCategory } from "../../interfaces/common-interfaces";
import { ContentTabThreeCategoryDesc } from "../content-tab-three-category-desc/content-tab-three-category-desc";
import { GlobalService } from '../../providers';

/*
  Generated class for the ContentTabThree page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-content-tab-three',
    templateUrl: 'content-tab-three.html'
})
export class ContentTabThree {

    public tabId: number;
    public categoryId: number;
    public title: string;
    public bgImage: string;
    public loader: boolean = false;
    public noDataFound: boolean = false;
    public noSectionCategory: ContentTabThreeCategory[][] = [];
    public sectionWiseCategory: ContentTabThreeCategory[][] = [];
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public service: ContentTabThreeService,
        public display: DisplayService,
        public globalService: GlobalService
    ) {

        this.tabId = navParams.get('tabId');
        this.categoryId = navParams.get('categoryId');
        this.title = navParams.get('title');
        this.bgImage = navParams.get('bgImage');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.getCategoryList();

    }

    public getCategoryList(): void {
        this.loader = true;
        this.service.getContentList(this.tabId).subscribe(res => {
            if (res.success) {
                let categoryList: any = res.data;
                this.noDataFound = this.globalService.isObjectEmpty(categoryList);
                if (typeof categoryList.__noSection !== undefined) {
                    this.noSectionCategory = categoryList.__noSection;
                }
                for (let section in categoryList) {
                    if (section === "__noSection") {
                        continue;
                    }
                    this.sectionWiseCategory.push(categoryList[section]);
                }
                this.loader = false;
            } else {
                console.log("Server error occured.");
            }
        });
    }
    public onCategoryClick(id: number, name: string): void {
        this.navCtrl.push(ContentTabThreeCategoryDesc, {
            categoryId: id,
            title: name,
            bgImage: this.bgImage,
            tabId: this.tabId
        });
    }

}
