import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ContentTabThreeService, DisplayService } from '../../providers';
import { ContentTabThreeCategoryItem } from "../../interfaces/common-interfaces";
import { ContentTabThreeCategoryItemDesc } from "../content-tab-three-category-item-desc/content-tab-three-category-item-desc";
import { GlobalService } from '../../providers';

/*
  Generated class for the ContentTabThreeCategoryDesc page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-content-tab-three-category-desc',
    templateUrl: 'content-tab-three-category-desc.html'
})
export class ContentTabThreeCategoryDesc {

    public tabId: number;
    public categoryId: number;
    public bgImage: string;
    public title: string;
    public loader: boolean = false;
    public noSectionCategoryItem: ContentTabThreeCategoryItem[][] = [];
    public sectionWiseCategoryItem: ContentTabThreeCategoryItem[][] = [];


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
        this.getCategoryItemList();


    }

    public getCategoryItemList(): void {
        this.loader = true;
        this.service.getCategoryItemList(this.categoryId).subscribe(res => {
            if (res.success) {
                let categoryItemList: any = res.data;
                if (typeof categoryItemList.__noSection !== undefined) {
                    this.noSectionCategoryItem = categoryItemList.__noSection;
                }
                for (let section in categoryItemList) {
                    if (section === "__noSection") {
                        continue;
                    }
                    this.sectionWiseCategoryItem.push(categoryItemList[section]);
                }
                this.loader = false;
            } else {
                console.log("Server error occured.");
            }
        });
    }
    public onCategoryItemClick(id: number, name: string): void {
        this.navCtrl.push(ContentTabThreeCategoryItemDesc, {
            itemId: id,
            title: name,
            tabId: this.tabId
        });
    }
}
