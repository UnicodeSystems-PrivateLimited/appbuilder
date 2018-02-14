import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, RadioButton, Slider, InputSwitch } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { InboxTabService } from './inbox-tab.service';
import { Tab, InboxTabSettings, InboxTabSubscription, icon_location_left, icon_location_right } from '../../../../../theme/interfaces';
import { LocationEditor } from '../../../../../components';
import { MobileViewComponent } from '../../../../../components';
import '../../../../../jquery.loader.ts';

@Component({
    selector: 'tab-function-inbox-tab',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, Dialog, DROPDOWN_DIRECTIVES, Slider, InputSwitch, TAB_DIRECTIVES, RadioButton, Dragula, LocationEditor, MobileViewComponent],
    encapsulation: ViewEncapsulation.None,
    template: require('./inbox-tab.component.html'),
    styles: [require('./inbox-tab.scss')],
    viewProviders: [DragulaService],
    providers: [PageService, InboxTabService]
})

export class InboxTab {
    rangeValues: number[] = [20, 80];
    checked1: boolean = false;
    val1: number;
    public id: number;
    public subscriptionData: InboxTabSubscription = new InboxTabSubscription();
    public settingsData: InboxTabSettings = new InboxTabSettings();
    public subscriptionList: InboxTabSubscription[] = [];
    private LEFT: number = icon_location_left;
    private RIGHT: number = icon_location_right;
    public tabId: number;
    public checkAll: boolean = false;
    public checkTrue: boolean = false;
    public selectedItem: boolean[] = [];
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
    // ------------------- DISPLAY CONTROL ----------------------------
    public ready: boolean = false;
    //    public showDeleteDialog: boolean = false;
    public subscriptionHeader: string;
    public showLoader: boolean = false;
    public newSubscriptionDisplay: boolean = false;
    public settingsOverlayDisplay: string = "none";
    public subscriptionOverlayDisplay: string = "block";
    public addSaveButtonHide: boolean = false;
    // ----------------------------------------------------------------


    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: InboxTabService,
        private dragulaService: DragulaService,
        private dataService: GridDataService) {
        this.tabId = parseInt(params.get('tabId'));
        this.id = parseInt(params.get('ids'));

        dragulaService.dropModel.subscribe((value) => {
            this.sortSubscription();
        });
    }


    public ngOnInit(): void {
        this.getInitData();
    }
    public onCheckAllChange(): void {
        // this.checkTrue = !this.checkTrue;
        this.refreshSelectedItems();
        if (!this.checkAll) {
            for (let i in this.subscriptionList) {
                this.selectedItem[this.subscriptionList[i].id] = true;
            }
            this.checkTrue = true;
        }
        else {
            for (let i in this.subscriptionList) {
                this.selectedItem[this.subscriptionList[i].id] = false;
            }
            this.checkTrue = false;
        }
    }
    public refreshSelectedItems(): void {
        this.selectedItem = [];
    }

    public getInitData(): void {
        // One request to get all initial data.
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                this.tabData = res.data.tabData;
                this.subscriptionList = res.data.subscriptionList;
                if (res.data.settingsData !== undefined && res.data.settingsData) {
                    this.settingsData = res.data.settingsData;
                    if (res.data.settingsData.subscription_service == 1) {
                        this.settingsData.subscription_service = true;
                        this.subscriptionOverlayDisplay = "none";
                    }
                    else {
                        this.settingsData.subscription_service = false;
                    }
                }

                this.ready = true;

            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onSaveInboxSettings(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.settingsData.tab_id = this.tabId;
        this.service.saveSettings(this.settingsData).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.dataService.subscription = this.settingsData.subscription_service;
                this.settingsData = new InboxTabSettings();
                this.pageService.showSuccess(res.message);
                this.getInitData();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public onMsgCenterShorcutClick(): void {
        this.settingsOverlayDisplay = this.settingsData.msg_center_shortcut ? "block" : "none";

    }
    public onEnableSubscriptionClick(): void {
        this.subscriptionOverlayDisplay = !this.settingsData.subscription_service ? "block" : "none";

    }

    public sortSubscription(): void {
        let ids: number[] = [];
        for (let item of this.subscriptionList) {
            ids.push(item.id);
        }
        this.service.sortSubscription(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess(res.data);
            } else {
                this.pageService.showError(res.data);
            }
        });
    }

    onNewSubscription() {
        this.newSubscriptionDisplay = true;
        this.subscriptionHeader = "ADD SUBSCRIPTION";
        this.pageService.onDialogOpen();
    }

    public onSaveSubscription(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.subscriptionData.tab_id = this.tabId;
        this.service.saveSubscription(this.subscriptionData).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.getSubscriptionList();
                this.subscriptionData = new InboxTabSubscription();
                this.newSubscriptionDisplay = false;
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    showEditDialog(id: number) {
        this.newSubscriptionDisplay = true;
        this.pageService.onDialogOpen();
        this.showLoader = true;
        this.subscriptionHeader = "EDIT SUBSCRIPTION";
        this.service.getSingleSubscriptionData(id).subscribe((res) => {
            if (res.success) {
                this.subscriptionData = res.data;
                this.subscriptionData.id = res.data.id;
                this.showLoader = false;
            }
        });
    }

    public onDeleteClick(): void {
        if (this.selectedItem.length > 0 && this.selectedItem.indexOf(true) !== -1) {
            //            this.showDeleteDialog = true;
            var yes = window.confirm("Are you sure you want to delete the selected Item ? ");
            if (yes) {
                this.deleteSubscription();
            }
        }
    }

    public deleteSubscription(): void {
        let ids: any[] = [];
        for (let i in this.selectedItem) {
            if (this.selectedItem[i]) {
                ids.push(i);
            }
        }
        this.showLoader = true;
        this.service.deleteSubscription(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkTrue = false;
                                this.selectedItem = [];

                //                this.showDeleteDialog = false;
                this.getSubscriptionList();
                this.pageService.showSuccess(res.message);
                this.subscriptionList.forEach((item, index) => {
                    if (item.id === this.selectedItem['id']) {
                        this.subscriptionList.splice(index, 1);
                    }
                });
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public getSubscriptionList(): void {
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                this.subscriptionList = res.data.subscriptionList;
                this.dataService.subscriptionSelect = [];
                for (let item of res.data.subscriptionList) {
                    this.dataService.subscriptionSelect.push({ label: item.subscription_name, value: item.id })
                }
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onDialogHide(): void {
        this.newSubscriptionDisplay = false;
        this.subscriptionData = new InboxTabSubscription();
    }

    public onCheckTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.subscriptionList.forEach((subscriptionList) => {
                console.log('subscriptionList', subscriptionList);
                console.log('checkedTab', checkedTab);
                if (subscriptionList.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedItem[subscriptionList.id]) {
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
