import { Component, ViewEncapsulation } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { NewsTabService } from './news-tab.service';
import {Tab, News} from '../../../../../theme/interfaces';
import {MobileViewComponent} from '../../../../../components';


@Component({
    selector: 'tab-function-news-tab',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, MobileViewComponent],
    encapsulation: ViewEncapsulation.None,
    template: require('./news-tab.component.html'),
    styles: [require('./news-tab.scss')],
    providers: [PageService, NewsTabService, GridDataService]
})

export class NewsTab {
    public tabId: number;
    public ready: boolean = false;
    public news: News = new News();
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
    public google_keywords = [];
    public twitter_keywords = [];
    public facebook_keywords = [];
    public addSaveButtonHide: boolean = false;
    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: NewsTabService,
        private dataService: GridDataService) {
        this.tabId = parseInt(params.get('tabId'));
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    // One request to get all initial data.     
    public getInitData(): void {
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                console.log("getInitData res", res);
                this.tabData = res.data.tabData;
                if (res.data.newsData !== null) {
                    this.news = res.data.newsData;
                    this.google_keywords = res.data.newsData.google_keywords.split(",");
                    this.news.google_keywords = this.google_keywords.join(" ");
                    this.twitter_keywords = res.data.newsData.twitter_keywords.split(",");
                    this.news.twitter_keywords = this.twitter_keywords.join(" ");
                    this.facebook_keywords = res.data.newsData.facebook_keywords.split(",");
                    this.news.facebook_keywords = this.facebook_keywords.join(" ");
                }
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    // Save news keywords and setting.     
    public saveNews(): void {
        this.ready = true;
        this.addSaveButtonHide = true;
        this.news.tab_id = this.tabId;
        this.news.show_news_home = this.news.show_news_home ? 1 : 0;
        this.news.google_keywords = this.news.google_keywords.trim().replace(/\s+/g, ' ');
        this.news.twitter_keywords = this.news.twitter_keywords.trim().replace(/\s+/g, ' ');
        this.news.facebook_keywords = this.news.facebook_keywords.trim().replace(/\s+/g, ' ');
        let data: News = Object.assign({}, this.news);
        console.log("this.data", data);
        this.service.saveNewsKeyword(data).subscribe(res => {
            console.log('saveNews res+++++++++++++', res);
            if (res.success) {
                this.ready = false;
                this.pageService.showSuccess(res.message);
                this.getInitData();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }
}