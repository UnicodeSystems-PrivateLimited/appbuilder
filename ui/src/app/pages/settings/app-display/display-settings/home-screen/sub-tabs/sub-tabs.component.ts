/**
 * SubTabs Component
 */
import { Component, ViewEncapsulation, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { InputSwitch, Dialog, SelectItem, Dropdown, Draggable, Droppable } from 'primeng/primeng';
import { ColorPickerDirective } from "../../../../../../color-picker/color-picker.directive";
import { PageService, GridDataService } from '../../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { SettingsService } from '../../../../settings.service';
import { HomeScreenService } from '../../../home-screen.service';
import { HomeScreenSubTab } from '../../../../../../theme/interfaces';
import { AppState } from '../../../../../../app.state';
import { Trimmer } from '../../../../../../pipes/trimmer.pipe';

@Component({
    selector: 'sub-tabs',
    directives: [TOOLTIP_DIRECTIVES, TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, Dropdown, InputSwitch, Dialog, ColorPickerDirective, Dragula, Draggable, Droppable],
    template: require('./sub-tabs.component.html'),
    viewProviders: [DragulaService],
    pipes: [Trimmer]
})

export class SubTabsComponent {

    private _saveLanguageTranslationURL: string = '../api/ws/app/tab/translation';
    public checked: boolean = true;
    public colorDisplay: boolean = false;
    public categories: SelectItem[] = [];
    public newHomeSubTabsDisplay: boolean = false;
    public showLoader: boolean = false;
    public colorVar: string = "#fff";
    public subtab: HomeScreenSubTab = new HomeScreenSubTab();
    public selectedIconId: number = null;
    public customIconTarget: any = null;
    public appId: any;
    public dialogHeader: string = null;
    public editMode: boolean = false;
    public iconThumbnailSrc: string = null;
    public isExternalLink: boolean = false;
    public draggedSubtab: HomeScreenSubTab;
    public draggedIndex: number;

    constructor(
        private params: RouteParams,
        private settingsService: SettingsService,
        private service: HomeScreenService,
        private pageService: PageService,
        private appState: AppState,
        private dataService: GridDataService
    ) {
        this.appId = this.appState.dataAppId;
        this.subtab.app_id = this.appId;
    }

    public ngOnInit(): void {
        this.getAllAppTabs();
    }

    public getAllAppTabs(): void {
        this.settingsService.getAppTabsForContent(this.appId).subscribe(res => {
            if (res.success) {
                this.categories.push({ label: '--Choose--', value: '' });
                for (let item of res.data) {
                    this.categories.push({ label: item.title, value: item.id })
                }
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onAddHomeTabs(sortOrder: number): void {
        this.subtab.sort_order = sortOrder;
        this.isExternalLink = false;
        this.dialogHeader = "ADD HOME SUB TABS";
        this.newHomeSubTabsDisplay = true;
        this.pageService.onDialogOpen();
        this.colorDisplay = true;
        this.editMode = false;
    }

    public onIconClick(icon): void {
        this.selectedIconId = icon.id;
        this.subtab.icon_name = icon.name;
    }

    public onCustomIconChange(event): void {
        this.subtab.icon_image = event.target.files[0];
        this.customIconTarget = event.target;
    }

    public onSaveClick(): void {
        if (this.isExternalLink) {
            this.subtab.tab_id = undefined;
        } else {
            this.subtab.external_url = undefined;
        }
        this.service.saveSubTab(this.subtab).subscribe(res => {
            if (res.success) {
                this.saveTranslationOfTab(this.appId, this.subtab.title, res.subTabId, 'sub_tab_translation');
                this.pageService.showSuccess(res.message);
                this.subtab = new HomeScreenSubTab();
                this.subtab.app_id = this.appId;
                this.newHomeSubTabsDisplay = false;
                this.selectedIconId = null;
                if (this.customIconTarget) {
                    this.customIconTarget.value = null;
                }
                this.getSubTabList();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public sort(): void {
        let ids: number[] = [];
        for (let subtab of this.service.subTabList) {
            ids.push(subtab.id);
        }
        this.service.sortSubTabs(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('Item order saved.')
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onEditClick(id: number): void {
        this.dialogHeader = "EDIT HOME SUB TABS";
        this.colorDisplay = true;
        this.editMode = true;
        PageService.showLoader();
        this.service.getSubTabData(id).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.newHomeSubTabsDisplay = true;
                this.pageService.onDialogOpen();
                this.subtab = res.data;
                this.isExternalLink = this.subtab.external_url ? true : false;
                this.iconThumbnailSrc = this.subtab.icon_name;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onDeleteClick(id: number): void {
        if (confirm("Are you sure you want to delete this ?")) {
            PageService.showLoader();
            this.service.deleteSubTab(id).subscribe(res => {
                PageService.hideLoader();
                if (res.success) {
                    this.pageService.showSuccess("Sub Tab deleted successfully");
                    this.dataService.getByID(this.service.subTabList, id, (data, index) => {
                        this.service.subTabList[index] = <HomeScreenSubTab>{};
                    });
                } else {
                    this.pageService.showError(res.message);
                }
            });
        }
    }

    public getSubTabList(): void {
        this.service.listSubTabs(this.appId).subscribe(res => {
            if (res.success) {
                this.service.subTabList = res.data;
                this.service.subTabList = Object.keys(res.data).map(i => res.data[i]);
            }
        });
    }

    public onDialogHide(): void {
        this.subtab = new HomeScreenSubTab();
        this.subtab.app_id = this.appId;
        this.selectedIconId = null;
        if (this.customIconTarget) {
            this.customIconTarget.value = null;
        }
    }

    public saveTranslationOfTab(appId: number, tabTitle: string, tabId: number, tabType: string): void {
        let tabData = { appId: appId, title: tabTitle, tabId: tabId, tabType: tabType };
        this.dataService.postData(this._saveLanguageTranslationURL, tabData).subscribe((res) => {
            console.log("res", res);
        });
    }

    public onDragStart(subtab: HomeScreenSubTab, index: number): void {
        this.draggedSubtab = subtab;
        this.draggedIndex = index;
    }

    public onDrop(subtab: HomeScreenSubTab | {}, index: number): void {
        if (this.draggedSubtab && this.draggedIndex !== undefined) {
            this.service.subTabList[this.draggedIndex] = <HomeScreenSubTab>subtab;
            this.service.subTabList[index] = this.draggedSubtab;
            this.sort();
        }
    }

    public onDragEnd(): void {
        this.draggedSubtab = undefined;
        this.draggedIndex = undefined;
    }

}
