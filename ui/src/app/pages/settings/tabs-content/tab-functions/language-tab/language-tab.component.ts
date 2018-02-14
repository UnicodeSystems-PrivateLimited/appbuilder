import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { LanguageTabService } from './language-tab.service';
import { RouteParams } from '@angular/router-deprecated';
import { MobileViewComponent } from '../../../../../components';
import { Dialog } from 'primeng/primeng';
import { LanguageData } from '../../../../../theme/interfaces';
import { PageService } from '../../../../../theme/services';


@Component({
    selector: 'tab-function-language-tab',
    pipes: [],
    directives: [MobileViewComponent, Dialog],
    encapsulation: ViewEncapsulation.None,
    template: require('./language-tab.component.html'),
    styles: [require('./language-tab.scss')],
    viewProviders: [],
    providers: [LanguageTabService, PageService]
})

export class LanguageTab {

    public tabId: number;
    public ready: boolean = false;
    public tabData: any = null;
    public languageData: any = null;
    public addedLanguages: any[] = [];
    public dialogDisplay: boolean = false;
    public checkAll: boolean = false;
    public checkTrue: boolean = false;
    public checkAllLanguage: boolean = false;
    public selectedItem: boolean[] = [];
    public showLoader: boolean = false;
    public languages: any[] = [];
    public selectedLanguage: boolean[] = [];
    public addLanguageData: LanguageData = new LanguageData();


    constructor(
        private params: RouteParams,
        private service: LanguageTabService,
        private pageService: PageService
    ) {
        this.tabId = parseInt(params.get('tabId'));
        console.log("this.tabId", this.tabId);
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        this.service.getInitData(this.tabId).subscribe((res) => {
            if (res.success) {
                this.tabData = res['data']['tabData'];
                this.languageData = res['data']['languageData'];
                if (this.languageData) {
                    this.addedLanguages = this.languageData.content;
                }
                this.languages = res['data']['languages'];
                console.log(" this.addedLanguages", this.addedLanguages);
                this.ready = true;
                console.log("res", res);
            } else {
                console.log('some server error occure');
            }
        })
    }

    public showAddDialog(): void {
        this.dialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public onCheckAllChange(): void {
        // this.checkTrue = !this.checkTrue;
        this.refreshSelectedItem();
        if (!this.checkAll) {
            for (let i in this.addedLanguages) {
                if (this.addedLanguages[i].code != 'en') {
                    this.selectedItem[this.addedLanguages[i].id] = true;
                }
            }
            this.checkTrue = true;
        }
        else {
            for (let i in this.addedLanguages) {
                if (this.addedLanguages[i].code != 'en') {
                    this.selectedItem[this.addedLanguages[i].id] = false;
                }
            }
            this.checkTrue = false;
        }

    }
    public onCheckAllLanguageChange(): void {
        this.refreshSelectedLanguage();
        if (!this.checkAllLanguage) {
            for (let i in this.languages) {
                this.selectedLanguage[this.languages[i].id] = true;
            }
        }
        else {
            for (let i in this.languages) {
                this.selectedLanguage[this.languages[i].id] = false;
            }
        }

    }
    public refreshSelectedItem(): void {
        this.selectedItem = [];
    }
    public refreshSelectedLanguage(): void {
        this.selectedLanguage = [];
    }


    public onDeleteClick(): void {
        if (this.selectedItem.length > 0 && this.selectedItem.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete coupon? ");
            if (yes) {
                this.deleteLanguages();
            } else {
                this.clearSelects();
            }
        }
    }
    public onSingleDeleteClick(id: number) {
        var yes = window.confirm("Do you really want to delete coupon? ");
        if (yes) {
            let data = { id: this.languageData.id, languageIds: id };
            this.service.deleteLanguages(data).subscribe((res) => {
                if (res.success) {
                    this.getInitData();
                    this.pageService.showSuccess(res.message);
                } else {
                    console.log("some server error occure");
                }
            });
        }
    }
    public deleteLanguages(): void {
        let languageIds: any[] = [];
        for (let i in this.selectedItem) {
            if (this.selectedItem[i]) {
                languageIds.push(i);
            }
        }
        let data = { id: this.languageData.id, languageIds: languageIds };
        this.service.deleteLanguages(data).subscribe((res) => {
            if (res.success) {
                this.checkTrue = false;
                                this.selectedItem = [];
                this.getInitData();
                this.pageService.showSuccess(res.message);
            } else {
                console.log("some server error occure");
            }
            this.clearSelects();
        });
    }
    public clearSelects(): void {
        this.checkAll = false;
        this.selectedItem = [];
    }

    public onCheckTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.addedLanguages.forEach((itemData) => {
                if (itemData.code != 'en') {
                    if (itemData.id != checkedTab) {
                        //if flag set to false don't check further
                        if (flag) {
                            if (this.selectedItem[itemData.id]) {
                                flag = true;
                            } else {
                                flag = false;
                            }
                        }
                    }
                }
            });
        }
        this.checkAll = flag ? true : false;
    }
    public onCheckTablanguageChange(checkedTabValue, checkedTab): void {
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.languages.forEach((itemData) => {
                if (itemData.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedLanguage[itemData.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAllLanguage = flag ? true : false;
    }

    public save(): void {
        this.languages.forEach((lang) => {
            if (this.selectedLanguage[lang.id]) {
                this.addLanguageData.content.push(lang);
            }
        });
        this.service.save(this.tabId, this.addLanguageData).subscribe((res) => {
            if (res.success) {
                this.getInitData();
                this.onAddDialogHide();
                this.addLanguageData = new LanguageData();
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onAddDialogHide(): void {
        this.dialogDisplay = false;
        this.selectedLanguage = [];
        this.checkAllLanguage = false;
    }

}