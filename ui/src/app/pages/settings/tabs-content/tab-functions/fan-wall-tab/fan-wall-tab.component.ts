import { Component, ViewEncapsulation } from '@angular/core';
import { TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog } from 'primeng/primeng';
import { PageService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Tab, VoiceRecordingTabItem } from "../../../../../theme/interfaces/common-interfaces";
import { FanWallTabService } from './fan-wall-tab.service';
import { ColorPickerDirective } from "../../../../../color-picker/color-picker.directive";
// import { CKEditor } from 'ng2-ckeditor';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { LocationEditor, MobileViewComponent } from '../../../../../components';

@Component({
    selector: 'tab-function-voice-recording-tab',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dialog, TAB_DIRECTIVES, MobileViewComponent, ColorPickerDirective, Dragula],
    encapsulation: ViewEncapsulation.None,
    template: require('./fan-wall-tab.component.html'),
    styles: [require('./fan-wall-tab.scss')],
    providers: [PageService, FanWallTabService]
})

export class FanWall {
    public tabId: number;
    public ready: boolean = false;
    public showLoader: boolean = false;
    public checkTrue: boolean = false;
    public itemList = [];
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
    public comments = [];
    public selectedItem: boolean[] = [];
    public checkAll: boolean = false;
    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: FanWallTabService, dragulaService: DragulaService) {
        this.tabId = parseInt(params.get('tabId'));
        dragulaService.dropModel.subscribe((value) => {
            this.sort();
        });
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {

        // One request to get all initial data.
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                if (res.data.comments != null) {
                    this.itemList = res.data.comments;
                }

                this.tabData = res.data.tabData;
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }
    public sort(): void {
        let ids: number[] = [];
        for (let number of this.itemList) {
            ids.push(number.id);
        }
        this.service.sortNumberList(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('order saved.');
            } else {
                this.pageService.showError(res.message);
            }
        });
    }
    //    public deleteItem(id): voi    d {
    //        if (id    ) {
    //            var yes = window.confirm("Do you really want to delete item.     ");
    //            if (yes    ) {
    //                this.service.deleteItem({ id: id }).subscribe(res =    > {
    //                    console.log(re    s);
    //                    if (res.success    ) {
    //                        for (var i = 0; i < this.itemList.length; i++    ) {
    //                            if (this.itemList[i].id == id    ) {
    //                                this.itemList.splice(i,     1);
    //                                bre    ak;
    //                                }
    //                            }
    //                        console.log(this.itemLis    t);
    //                        this.pageService.showSuccess("Item deleted succesfully.    ");
    //                        }
    //                    e    lse
    //                        this.pageService.showError(res.messag    e);
    //                    });
    //                }
    //            }
    //    }

    public onItemDeleteClick(): void {
        if (this.selectedItem.length > 0 && this.selectedItem.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete item? ");
            if (yes) {
                this.deleteItem();
            }
        }
    }

    public refreshSelectedItem(): void {
        this.selectedItem = [];
    }

    public onCheckAllChange(): void {
        // this.checkTrue = !this.checkTrue;
        this.refreshSelectedItem();
        if (!this.checkAll) {
            for (let i in this.itemList) {
                this.selectedItem[this.itemList[i].id] = true;
            }
            this.checkTrue = true;
        }
        else {
            for (let i in this.itemList) {
                this.selectedItem[this.itemList[i].id] = false;
            }
            this.checkTrue = false;
        }
    }

    public deleteItem(): void {
        let ids: any[] = [];
        for (let i in this.selectedItem) {
            if (this.selectedItem[i]) {
                ids.push(i);
            }
        }
        this.showLoader = true;
        this.service.deleteItem(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkTrue = false;
                this.selectedItem = [];
                for (var i = 0; i < ids.length; i++) {
                    console.log('ids==============', ids[i]);
                    this.itemList.forEach((itemList, index) => {
                        console.log('itemList.id==============', itemList.id);
                        if (itemList.id == ids[i]) {
                            console.log('in');
                            this.itemList.splice(index, 1);
                        }
                    });
                }
                this.pageService.showSuccess(res.message);
                this.checkAll = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onCheckTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.itemList.forEach((itemList) => {
                console.log('itemList', itemList);
                console.log('checkedTab', checkedTab);
                if (itemList.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedItem[itemList.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAll = flag ? true : false;
    }
}