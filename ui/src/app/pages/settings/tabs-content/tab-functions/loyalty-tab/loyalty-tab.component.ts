import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, RadioButton, Slider, InputSwitch } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { LoyaltyTabService } from './loyalty-tab.service';
import { Tab, Loyalty, AdvancedLoyalty, LoyaltyPerk } from '../../../../../theme/interfaces';
import { LocationEditor, MobileViewComponent, ThumbnailFileReader } from '../../../../../components';
import '../../../../../jquery.loader.ts';

@Component({
    selector: 'tab-function-loyalty-tab',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, Dialog, DROPDOWN_DIRECTIVES, ThumbnailFileReader, Slider, InputSwitch, TAB_DIRECTIVES, RadioButton, Dragula, LocationEditor, MobileViewComponent],
    encapsulation: ViewEncapsulation.None,
    template: require('./loyalty-tab.component.html'),
    styles: [require('./loyalty-tab.scss')],
    viewProviders: [DragulaService],
    providers: [PageService, LoyaltyTabService]
})

export class LoyaltyTabComponent {
    public tabId: number;
    public id: number;
    public loader: boolean = false;
    public header: string;
    public totalPerks = [];
    public squareCounts = [];
    public viewType = [];
    public perksIterator: number[] = [];
    public perks = [];
    public gauge = [];
    // public perkData = [];
    public activity = [];
    public activities = [];
    public activityByUser = [];
    public advanceLoyaltyDialog: boolean = false;
    public phoneHeaderImageTarget: any = null;
    public tabletHeaderImageTarget: any = null;
    public thumbnailImageTarget: any = null;
    public perkImageTarget: any = null;
    public gaugeImageTarget: any = null;
    public advThumbnailImageTarget: any = null;
    public loyaltyDialog: boolean = false;
    public gaugeClick: boolean = false;
    public imageShow: boolean = false;
    public perkDisplay: boolean = false;
    public showPreview: boolean = false;
    public toggle_perk_card: boolean[] = [];
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
    public loyaltyData: Loyalty = new Loyalty();
    public advancedloyaltyData: AdvancedLoyalty = new AdvancedLoyalty();

    // public loyaltyPerk: LoyaltyPerk[] = [];
    public loyaltyList: Loyalty[] = [];
    public addSaveButtonHide: boolean = false;
    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: LoyaltyTabService,
        private dragulaService: DragulaService,
        private dataService: GridDataService) {
        this.tabId = parseInt(params.get('tabId'));
        this.id = parseInt(params.get('ids'));

        dragulaService.dropModel.subscribe((value) => {
            this.sortLoyalty();
        });


        let i = 1;
        for (i = 1; i <= 10; i++) {
            this.totalPerks.push({ label: i, value: i });
        }
        let j = 1;
        for (j = 1; j <= 20; j++) {
            this.squareCounts.push({ label: j, value: j });
        }

        this.viewType.push({ label: 'Gauge', value: 2 },
            { label: 'Stamps', value: 1 });
        this.gauge.push({ label: 'Display as percentage', value: 1 },
            { label: 'Display as stamp progress', value: 2 });

    }

    public showAdvanceDialog() {
        this.perks = [];
        let j = 1;
        for (let i = 0; i < j; i++) {
            this.perks.push(i);
            this.advancedloyaltyData.perkData.push(new LoyaltyPerk());
        }
        this.header = 'ADD ADVANCED LOYALTY';
        this.activity = [];
        this.activityByUser = [];
        this.perkDisplay = true;
        this.advanceLoyaltyDialog = true;
        this.pageService.onDialogOpen();
    }

    public showaddLoyaltyDialog() {
        this.header = 'ADD LOYALTY';
        this.activities = [];
        this.loyaltyDialog = true;
        this.pageService.onDialogOpen();
        this.imageShow = true;
        this.loyaltyData = new Loyalty();
        this._clearImageInputs();
    }

    public showEditAdvanceDialog(id: number) {
        this.header = 'EDIT ADVANCED LOYALTY';
        this.advanceLoyaltyDialog = true;
        this.pageService.onDialogOpen();
        this.imageShow = true;
        this.service.getSingleAdvLoyaltyData(id).subscribe((res) => {
            if (res.success) {
                this.advancedloyaltyData = res.data;
                this.getPerks(id);
                this.advancedloyaltyData.id = id;
                this.activity = res.data.activities;
                this.activityByUser = res.data.activitiesByUser;
            } else {
                console.log('no data found');

            }
        });
    }

    public getPerks(id: number): void {
        this.service.getPerkList(id).subscribe((res) => {
            if (res.success) {
                this.perks = [];
                for (let i = 1; i <= res.data.length; i++) {
                    this.perks.push(i);
                }
                this.advancedloyaltyData.perkData = res.data;
                if (res.data.length) {
                    this.perkDisplay = true;
                }
                console.log(this.advancedloyaltyData.perkData)
            } else {
                console.log('no data found');

            }
        });
    }

    public showEditLoyaltyDialog(id: number) {
        this.header = 'EDIT  LOYALTY';
        this.loyaltyDialog = true;
        this.pageService.onDialogOpen();
        this.imageShow = true;
        this.service.getSingleLoyaltyData(id).subscribe((res) => {
            if (res.success) {
                this.loyaltyData = res.data;
                this.activities = res.data.activities;
                this.loyaltyData.phone_header_image_url = res.data.phone_header_image;
                this.loyaltyData.is_header_required = res.data.is_header_required == 1 ? true : false;
                this.loyaltyData.id = id;
            } else {
                console.log('no data found');

            }
        });

    }

    public onDialogHide(): void {
        this.perks = [];
        this.imageShow = false;
        this.advancedloyaltyData = new AdvancedLoyalty();
        this.activity = [];
        this.activityByUser = [];
        // this._clearAdvancedImageInputs();
        this.perkImageTarget = null;
        this.gaugeImageTarget = null;
        this.advanceLoyaltyDialog = false;
        let j = 1;
        for (let i = 0; i < j; i++) {
            this.perks.push(i);
            this.advancedloyaltyData.perkData.push(new LoyaltyPerk());
        }
        this.perkDisplay = false;
    }

    public onLoyaltyDialogHide(): void {
        this.imageShow = false;
        this.activities = [];
        this.loyaltyData = new Loyalty();
        this.loyaltyDialog = false;
        this._clearImageInputs();
    }

    public onViewChange(event: any): void {
        if (event.value == 1) {
            this.gaugeClick = true;
        } else {
            this.gaugeClick = false;
        }

    }
    public onRewardClick(event: any): void {
        this.showPreview = true;
        this.showPreview = this.loyaltyData.issue_freebie_loyalty ? false : true;
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                this.loyaltyList = res.data.loyaltylist;
                console.log(this.loyaltyList);
                this.tabData = res.data.tabData;
            } else {
                console.log('no data found');
            }
        });
    }

    public sortLoyalty(): void {
        let ids: number[] = [];
        for (let item of this.loyaltyList) {
            ids.push(item.id);
        }
        this.service.sortLoyaltyList(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('Item order saved.')
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onDeleteClick(id: number,loyaltyType:number): void {
        if (!confirm("Are you sure you want to delete this item ?")) {
            return;
        }
        this.loader = true;
        this.service.deleteLoyalty(id,loyaltyType).subscribe(res => {
            if (res.success) {
                this.loader = false;
                this.pageService.showSuccess(res.message);
                this.dataService.getByID(this.loyaltyList, id, (item, index) => {
                    this.loyaltyList.splice(index, 1);
                });
                this.getInitData();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onDeleteAdvClick(id: number): void {
        if (!confirm("Are you sure you want to delete this item ?")) {
            return;
        }
        this.loader = true;
        this.service.deleteAdvLoyalty([id]).subscribe(res => {
            if (res.success) {
                this.loader = false;
                this.pageService.showSuccess(res.message);
                this.dataService.getByID(this.loyaltyList, id, (item, index) => {
                    this.loyaltyList.splice(index, 1);
                });
                this.getInitData();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }


    public onPhoneHeaderImageChange(event: any): void {
        this.phoneHeaderImageTarget = event.target;
        this.loyaltyData.phone_header_image = event.file[0];
    }

    public onPerkThumbnailChange(event: any, i: number): void {
        this.perkImageTarget = event.target;
        this.advancedloyaltyData.perkData[i].perk_thumbnail = event.file[0];
    }

    public onGaugeIconChange(event: any, i: number): void {
        this.gaugeImageTarget = event.target;
        this.advancedloyaltyData.perkData[i].gauge_icon = event.file[0];
    }

    public onTabletHeaderImageChange(event: any): void {
        this.tabletHeaderImageTarget = event.target;
        this.loyaltyData.tablet_header_image = event.file[0];
    }

    public onThumbnailImageChange(event: any): void {
        this.thumbnailImageTarget = event.target;
        this.loyaltyData.thumbnail = event.file[0];
    }

    public onAdvThumbnailChange(event: any): void {
        this.advThumbnailImageTarget = event.target;
        this.advancedloyaltyData.thumbnail = event.file;
    }

    public onSaveLoyalty(): void {
        this.loader = true;
        this.addSaveButtonHide = true;
        this.loyaltyData.tab_id = this.tabId;
        this.loyaltyData.is_advance = 0;
        this.loyaltyData.issue_freebie_loyalty = this.loyaltyData.issue_freebie_loyalty ? 1 : 0;
        this.loyaltyData.is_header_required = this.loyaltyData.is_header_required ? 1 : 0;
        this.service.saveLoyalty(this.loyaltyData).subscribe((res) => {
            this.loader = false;
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this._clearImageInputs();
                this.loyaltyData = new Loyalty();
                this.getInitData();
                this.loyaltyDialog = false;
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    private _clearImageInputs(): void {
        if (this.phoneHeaderImageTarget) {
            this.phoneHeaderImageTarget.value = null;
        }
        if (this.loyaltyData.phone_header_image) {
            this.loyaltyData.phone_header_image = null;
        }
        if (this.tabletHeaderImageTarget) {
            this.tabletHeaderImageTarget.value = null;
        }
        if (this.loyaltyData.tablet_header_image) {
            this.loyaltyData.tablet_header_image = null;
        }
        if (this.thumbnailImageTarget) {
            this.thumbnailImageTarget.value = null;
        }
        if (this.loyaltyData.thumbnail) {
            this.loyaltyData.thumbnail = null;
        }

    }

    public deleteLoyaltyImage(imageType: string, id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deleteLoyaltyImage(imageType, id).subscribe(res => {
                    if (res.success) {
                        this.pageService.showSuccess("Image deleted succesfully.");
                        this.getInitData();
                        if (imageType == "phone_header") {
                            this.loyaltyData.phone_header_image = null;
                            this.phoneHeaderImageTarget = null;
                            this.loyaltyData.phone_header_image_url = null;
                        }
                        else if (imageType == "tablet_header") {
                            this.loyaltyData.tablet_header_image = null;
                            this.tabletHeaderImageTarget = null;
                        }
                        else if (imageType == "thumbnail") {
                            this.loyaltyData.thumbnail = null;
                            this.thumbnailImageTarget = null;
                        }
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }


    public onSaveAdvancedLoyalty(): void {
        this.loader = true;
        this.addSaveButtonHide = true;
        this.advancedloyaltyData.tab_id = this.tabId;
        this.advancedloyaltyData.is_advance = 1;
        this.advancedloyaltyData.earn_credit = this.advancedloyaltyData.earn_credit ? 1 : 0;
        // this.advancedloyaltyData.perkData['reuse_perk'] = this.advancedloyaltyData.perkData['reuse_perk'] ? 1 : 0;
        this.service.saveAdvancedLoyalty(this.advancedloyaltyData).subscribe((res) => {
            this.loader = false;
            if (res.success) {
                this.advanceLoyaltyDialog = false;
                this.pageService.showSuccess('Loyalty added successfully');
                this.perkDisplay = false;
                this.advancedloyaltyData = new AdvancedLoyalty();
                let j = 1;
                for (let i = 0; i < j; i++) {
                    this.perks.push(i);
                    this.advancedloyaltyData.perkData.push(new LoyaltyPerk());
                }
                this.getInitData();
                // this._clearAdvancedImageInputs();
                this.perkImageTarget = null;
                this.gaugeImageTarget = null;
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public deleteAdvLoyaltyImage(imageType: string, id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deleteAdvLoyaltyImage(imageType, id).subscribe(res => {
                    if (res.success) {
                        this.pageService.showSuccess("Image deleted succesfully.");
                        this.getInitData();
                        if (this.advThumbnailImageTarget || this.advancedloyaltyData.thumbnail) {
                            this.advThumbnailImageTarget = null;
                            this.advancedloyaltyData.thumbnail = null;
                        }
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }

    private _clearAdvancedImageInputs(i: number, imageType: string): void {
        if ((this.perkImageTarget !== null || this.perkImageTarget == 'undefined') && (imageType == 'perk_thumbnail')) {
            this.perkImageTarget = null;
            this.advancedloyaltyData.perkData[i].perk_thumbnail = null;
        }
        if ((this.gaugeImageTarget !== null || this.gaugeImageTarget == 'undefined') && (imageType == 'gauge_icon')) {
            this.gaugeImageTarget = null;
            this.advancedloyaltyData.perkData[i].gauge_icon = null;
        }

    }

    public deletPerkImage(imageType: string, id: number, i: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deletePerkImage(imageType, id).subscribe(res => {
                    if (res.success) {
                        this.pageService.showSuccess("Image deleted succesfully.");
                        // this._clearAdvancedImageInputs(i,imageType);
                        if ((this.perkImageTarget != null || this.perkImageTarget == undefined) && (imageType == 'perk_thumbnail')) {
                            this.perkImageTarget = null;
                            this.advancedloyaltyData.perkData[i].perk_thumbnail = null;
                        }
                        if ((this.gaugeImageTarget != null || this.gaugeImageTarget == undefined) && (imageType == 'gauge_icon')) {
                            this.gaugeImageTarget = null;
                            this.advancedloyaltyData.perkData[i].gauge_icon = null;
                        }
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }

    // disble enter keyCode
    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.which == 13 || event.keyCode == 13)
            event.preventDefault();
    }

    public onPerksClick(event: any): void {
        this.perkDisplay = true;
        if (this.perks.length == null || this.perks.length) {
            this.perks = [];
            this.advancedloyaltyData.perkData = [];
            for (let i = 1; i <= event.value; i++) {
                this.perks.push(event.value);
                this.advancedloyaltyData.perkData.push(new LoyaltyPerk());
            }
        } else {
            for (let i = this.perks.length; i < event.value; i++) {
                this.perks.push(i);
                this.advancedloyaltyData.perkData.push(new LoyaltyPerk());
            }
        }
    }

    public deleteAdvancedActivity(id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deleteAdvancedActivity([id]).subscribe(res => {
                    console.log(res);
                    if (res.success) {
                        for (var i = 0; i < this.activity.length; i++) {
                            if (this.activity[i].id == id) {
                                this.activity.splice(i, 1);
                            }
                        }
                        for (var i = 0; i < this.activityByUser.length; i++) {
                            if (this.activityByUser[i].id == id) {
                                this.activityByUser.splice(i, 1);
                            }
                        }
                        this.pageService.showSuccess("Activity deleted succesfully.");
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }

    public deleteActivity(id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deleteActivity([id]).subscribe(res => {
                    console.log(res);
                    if (res.success) {
                        for (var i = 0; i < this.activities.length; i++) {
                            if (this.activities[i].id == id) {
                                this.activities.splice(i, 1);
                            }
                        }
                        this.pageService.showSuccess("Activity deleted succesfully.");
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }

    public toggleperkOpeningCard(id: number): void {
        this.toggle_perk_card[id] = !this.toggle_perk_card[id];
    }
}
