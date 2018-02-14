import { Component, ViewEncapsulation, Inject, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Router, RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { TabView } from 'primeng/primeng';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { TabPanel } from 'primeng/primeng';
import { Draggable, Droppable, Message, Growl } from 'primeng/primeng';
import { Dialog, Dropdown, Carousel } from 'primeng/primeng';
import { SelectItem } from 'primeng/primeng';
import { GridDataService, PageService, FormDataService } from '../../../theme/services';
import { ControlGroup, AbstractControl, FORM_DIRECTIVES, Validators, FormBuilder } from '@angular/common';
import { AppState } from '../../../app.state';
import { BaCard } from '../../../theme/components';
import { SettingsService } from '../settings.service';
import { DomSanitizationService } from "@angular/platform-browser";


@Component({
    selector: 'app-tabs',
    pipes: [],
    directives: [Carousel, TOOLTIP_DIRECTIVES, Dropdown, Dialog, Dragula, ROUTER_DIRECTIVES, Draggable, Droppable, BaCard, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TabView, TabPanel, FORM_DIRECTIVES, Growl, PAGINATION_DIRECTIVES],
    encapsulation: ViewEncapsulation.None,
    template: require('./app-tabs.html'),
    styles: [require('./app-tabs.scss')],
    viewProviders: [DragulaService],
    providers: [GridDataService, PageService, FormDataService]
})

export class AppTabs {

    // ------------------------- API URLs -------------------------------------
    private _getAppTabsURL: string = '../api/ws/app/tab/get';
    private _addAppTabURL: string = '../api/ws/app/tab/create';
    private _getAppTabInfoURL: string = '../api/ws/app/tab/info';
    private _getBlackIconsURL: string = '../api/ws/app/tab/icon/black';
    private _getWhiteIconsURL: string = '../api/ws/app/tab/icon/white';
    private _getColorIconsURL: string = '../api/ws/app/tab/icon/color';
    private _getPhotosIconsURL: string = '../api/ws/app/tab/icon/photos';
    private _editAppTabURL: string = '../api/ws/app/tab/update';
    private _sortAppTabsURL: string = '../api/ws/app/tab/sort';
    private _tabDeleteURL: string = '../api/ws/app/tab/delete';
    private _statusUpdateURL: string = '../api/ws/app/tab/status/update';
    private _saveLanguageTranslationURL: string = '../api/ws/app/tab/translation';
    //-------------------------------------------------------------------------

    //-------------------- DISPLAY CONTROL VARIABLES -------------
    public appTabAddDisplay: boolean = false;
    public appTabEditDisplay: boolean = false;
    public allActiveDialogDisplay: boolean = false;
    public simulatorDisplay: boolean = false;
    public checkTrue: boolean = false;
    //------------------------------------------------------------

    //------------------------ ICON PAGINATION --------------------
    public blackIconsPager: any = {
        total: 0,
        currentPage: 1,
        itemsPerPage: 12
    };
    public whiteIconsPager: any = {
        total: 0,
        currentPage: 1,
        itemsPerPage: 12
    };
    public colorIconsPager: any = {
        total: 0,
        currentPage: 1,
        itemsPerPage: 12
    };
    public photosIconsPager: any = {
        total: 0,
        currentPage: 1,
        itemsPerPage: 12
    };
    //-------------------------------------------------------------

    private APPS_TAB_STATUS_ENABLED: number = 1;
    private APPS_TAB_STATUS_DISABLED: number = 2;

    public blackIcons: any[] = [];
    public whiteIcons: any[] = [];
    public colorIcons: any[] = [];
    public photosIcons: any[] = [];
    public iconSelect: boolean[] = [];
    public appTabIconSrc: string = '';
    public deleteConfirmDialogDisplay: boolean = false;
    public checkAllActive: boolean = false;
    public checkAllInactive: boolean = false;
    public appId: any;
    public categories: SelectItem[] = [];
    public appSimulatorURL: any;

    public appDetails: Object = {
        app_name: ''
    };

    public tabs = {
        activeTabs: [],
        inactiveTabs: []
    };

    public appTabForm: any = {
        app_id: '', // The App ID is given to add a tab to that App.
        title: '',
        tab_func_id: '',
        active: true,
        icon_name: '',
        status: this.APPS_TAB_STATUS_ENABLED,
        icon_image: null,
        icon_type: 1
    };

    public editAppTabForm: any = {
        id: '', // The Tab ID is given to update an App Tab.
        title: '',
        tab_func_id: '',
        active: true,
        icon_name: '',
        type: '',
        status: this.APPS_TAB_STATUS_ENABLED,
        icon_image: null,
        icon_type: '',
        is_color_icon_update: 0,
        is_photo_icon_update: 0
    };

    public tabSelector = {
        active: [],
        inactive: [],
    };

    public tabStatus: boolean[] = [];
    public editAppTabImage: File = null;
    public addAppTabImage: File = null;
    public addImageTarget = null;
    public editImageTarget = null;
    public showTabFunctionDropDown: boolean = false;
    public disableSaveButton: boolean = false;

    constructor(
        private dataService: GridDataService,
        private dragulaService: DragulaService,
        private pageService: PageService,
        private appState: AppState,
        private settingsService: SettingsService,
        private router: Router,
        private formDataService: FormDataService,
        private sanitizer: DomSanitizationService
    ) {
        this.appId = sessionStorage.getItem('appId');
        dragulaService.dropModel.subscribe((value) => {
            this.updateTabSelector(value.slice(1));
            this.sortAppTabs();
        });
        this.appSimulatorURL = sanitizer.bypassSecurityTrustResourceUrl(SettingsService.simulatorBaseURL + "?app_id=" + this.appId);
    }

    public ngOnInit(): void {
        if ((typeof this.appId === "undefined" || this.appId == null) && this.appState.isCustomerLogin) {
            // No access to app without App ID. Go back to your App grid page.
            this.router.parent.navigate(['Settings']);
        }
        this.getAppDetails();
        this.getAppTabs();
        this.categories = this.settingsService.getTabFunctionsList();
    }

    public showAppTabAddDialog(): void {
        this.iconSelect = [];
        this.refreshIconPagination();
        this.appTabAddDisplay = true;
        this.pageService.onDialogOpen();
        if (this.addImageTarget) {
            // Clear the image name from the target element.
            this.addImageTarget.value = null;
        }
        this.addAppTabImage = null;
        this.showTabFunctionDropDown = true;
        this.getBlackIcons();
        this.getWhiteIcons();
    }

    public showAppTabEditDialog(id: any): void {
        this.iconSelect = [];
        this.refreshIconPagination();
        this.appTabEditDisplay = true;
        this.pageService.onDialogOpen();
        if (this.editImageTarget) {
            // Clear the image name from the target element.
            this.editImageTarget.value = null;
        }
        this.editAppTabImage = null;
        this.getAppTabInfo(id);
        this.getBlackIcons();
        this.getWhiteIcons();
    }

    public getAppTabs(): void {
        this.dataService.getData(this._getAppTabsURL + '/' + this.appId).subscribe(res => {
            if (res.success === true) {
                this.tabs.activeTabs = res.data.active;
                this.tabs.inactiveTabs = res.data.inactive;
                let allTabs = this.tabs.activeTabs.concat(this.tabs.inactiveTabs);
                for (let i in allTabs) {
                    this.tabStatus[allTabs[i].id] = allTabs[i].status == this.APPS_TAB_STATUS_ENABLED ? true : false;
                }
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public appTabSubmit(): void {
        this.appTabForm.app_id = this.appId;
        this.appTabForm.status = this.appTabForm.active ? this.APPS_TAB_STATUS_ENABLED : this.APPS_TAB_STATUS_DISABLED;
        this.disableSaveButton = true;
        this.formDataService.postData(this._addAppTabURL, this.appTabForm).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.saveTranslationOfTab(this.appId, res.tabData.title, res.tabData.id, 'tab_translation');
                this.getAppTabs();
                this.appTabAddDisplay = false;
                this.showTabFunctionDropDown = false;
                this.refreshAppTabForm();
            } else {
                this.pageService.showError(res.message);
            }
            this.disableSaveButton = false;
        });
    }

    public setIcon(id: number, imgName: string, icontype: number, action: string = 'insert', isColorIcon: boolean = false): void {
        if (action === 'edit') {
            this.editAppTabForm.icon_name = imgName;
            this.editAppTabForm.icon_type = icontype;
            this.editAppTabForm.type = 2;
            this.editAppTabForm.is_color_icon_update = (icontype == 3) ? 1 : 0;
            this.editAppTabForm.is_photo_icon_update = (icontype == 4) ? 1 : 0;
            console.log(this.editAppTabForm.icon_type);
        } else {
            this.appTabForm.icon_name = imgName;
            this.appTabForm.icon_type = icontype;
            console.log(this.appTabForm.icon_type);

        }
        this.iconSelect = [];
        this.iconSelect[id] = true;
    }

    protected refreshAppTabForm(): void {
        this.appTabForm.title = '';
        this.appTabForm.tab_func_id = '';
        this.appTabForm.active = true;
        this.appTabForm.icon_name = '';
        this.appTabForm.status = this.APPS_TAB_STATUS_ENABLED;
        this.appTabForm.icon_image = null;
    }

    protected refreshEditAppTabForm(): void {
        this.editAppTabForm.id = '';
        this.editAppTabForm.title = '';
        this.editAppTabForm.tab_func_id = '';
        this.editAppTabForm.active = true;
        this.editAppTabForm.icon_name = '';
        this.editAppTabForm.icon_image = '';
        this.editAppTabForm.type = '';
        this.editAppTabForm.icon_type = 1;
        this.editAppTabForm.status = this.APPS_TAB_STATUS_ENABLED;
    }

    public getAppTabInfo(id: any): void {
        this.dataService.getData(this._getAppTabInfoURL + '/' + id).subscribe(res => {
            if (res.success === true) {
                this.editAppTabForm.id = id;
                this.editAppTabForm.title = res.data.title;
                this.editAppTabForm.tab_func_id = res.data.tab_func_id;
                this.editAppTabForm.type = res.data.type;
                this.editAppTabForm.icon_name = res.data.icon_name;
                this.editAppTabForm.icon_type = res.data.icon_type;
                this.editAppTabForm.active = res.data.status == this.APPS_TAB_STATUS_ENABLED ? true : false;
                this.appTabIconSrc = res.data.src;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public getBlackIcons(): void {
        this.dataService.getData(this._getBlackIconsURL + '/' + this.blackIconsPager.currentPage).subscribe(res => {
            if (res.success) {
                this.blackIcons = res.data.data;
                this.blackIconsPager.total = res.data.total;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public getWhiteIcons(): void {
        this.dataService.getData(this._getWhiteIconsURL + '/' + this.whiteIconsPager.currentPage).subscribe(res => {
            if (res.success) {
                this.whiteIcons = res.data.data;
                this.whiteIconsPager.total = res.data.total;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public updateAppTabSubmit(): void {
        this.editAppTabForm.status = this.editAppTabForm.active ? this.APPS_TAB_STATUS_ENABLED : this.APPS_TAB_STATUS_DISABLED;
        this.disableSaveButton = true;
        console.log('this.editAppTabForm -----', this.editAppTabForm);
        this.formDataService.postData(this._editAppTabURL, this.editAppTabForm).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.saveTranslationOfTab(this.appId, this.editAppTabForm.title, this.editAppTabForm.id, 'tab_translation');
                this.getAppTabs();
                this.appTabEditDisplay = false;
                this.refreshEditAppTabForm();
            } else {
                this.pageService.showError(res.message);
            }
            this.disableSaveButton = false;
        });
    }

    public sortAppTabs(): void {
        let activeTabs = [];
        let inactiveTabs = [];
        for (let i in this.tabs.activeTabs) {
            activeTabs.push(this.tabs.activeTabs[i].id);
        }
        for (let i in this.tabs.inactiveTabs) {
            inactiveTabs.push(this.tabs.inactiveTabs[i].id);
        }
        this.dataService.postData(this._sortAppTabsURL, {
            activeTabs: activeTabs,
            inactiveTabs: inactiveTabs
        }).subscribe(res => {
            if (!res.success) {
                this.pageService.showError(res.message);
            }
        });
    }

    public blackIconsPageChanged(event: any): void {
        this.blackIconsPager.currentPage = event.page;
        this.getBlackIcons();
    }

    public whiteIconsPageChanged(event: any): void {
        this.whiteIconsPager.currentPage = event.page;
        this.getWhiteIcons();
    }

    public refreshIconPagination(): void {
        this.blackIconsPager.total = 0;
        this.blackIconsPager.currentPage = 1;
        this.whiteIconsPager.total = 0;
        this.whiteIconsPager.currentPage = 1;
    }

    public showDeleteConfirmDialog(): void {
        if ((this.tabSelector.active.length > 0 && this.tabSelector.active.indexOf(true) !== -1) || (this.tabSelector.inactive.length > 0 && this.tabSelector.inactive.indexOf(true) !== -1)) {
            this.deleteConfirmDialogDisplay = true;
            this.pageService.onDialogOpen();
        }
    }

    public deleteTabs(): void {
        let ids: any[] = [];
        for (let i in this.tabSelector.active) {
            if (this.tabSelector.active[i]) {
                ids.push(i);
            }
        }
        for (let i in this.tabSelector.inactive) {
            if (this.tabSelector.inactive[i]) {
                ids.push(i);
            }
        }
        this.dataService.postData(this._tabDeleteURL, { id: ids }).subscribe(res => {
            this.deleteConfirmDialogDisplay = false;
            if (res.success) {
                this.getAppTabs();
                this.checkTrue = false;
                this.tabSelector.active = [];
                this.tabSelector.inactive = [];
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public selectAllActive(): void {
        // this.checkTrue = !this.checkTrue;
        this.tabSelector.active = [];
        if (!this.checkAllActive) {
            for (let i in this.tabs.activeTabs) {
                this.tabSelector.active[this.tabs.activeTabs[i].id] = true;
            }
            this.checkTrue = true;
        } else {
            for (let i in this.tabs.activeTabs) {
                this.tabSelector.active[this.tabs.activeTabs[i].id] = false;
            }
            this.checkTrue = false;
        }
    }

    public selectAllInactive(): void {
        // this.checkTrue = !this.checkTrue;
        this.tabSelector.inactive = [];
        if (!this.checkAllInactive) {
            for (let i in this.tabs.inactiveTabs) {
                this.tabSelector.inactive[this.tabs.inactiveTabs[i].id] = true;
            }
            this.checkTrue = true;

        } else {
            for (let i in this.tabs.inactiveTabs) {
                this.tabSelector.inactive[this.tabs.inactiveTabs[i].id] = false;
            }
            this.checkTrue = false;

        }
    }

    public changeStatus(id: number, status: number): void {
        this._sendStatusUpdateRequest([id], status);
    }

    private _sendStatusUpdateRequest(ids: number[], status: number): void {
        this.dataService.postData(this._statusUpdateURL, {
            ids: ids,
            status: status
        }).subscribe(res => {
            if (res.success) {
                this.getAppTabs();
                this.allActiveDialogDisplay = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public makeAllActive(): void {
        let ids: number[] = [];
        for (let tab of this.tabs.inactiveTabs) {
            ids.push(tab.id);
        }
        this._sendStatusUpdateRequest(ids, this.APPS_TAB_STATUS_ENABLED);
    }

    public updateTabSelector(args): void {
        let [el, target, source] = args;
        if (target !== source) {
            this.tabStatus[el.id] = !this.tabStatus[el.id];
        }
    }

    public getAppDetails(): void {
        this.settingsService.getAppDetails(this.appId).subscribe(res => {
            if (res.success) {
                this.appDetails = res.data;
                SettingsService.tabBgImageSetting.flag_iphone_img = res.data['flag_iphone_img'];
                SettingsService.tabBgImageSetting.flag_phone_img = res.data['flag_phone_img'];
                SettingsService.tabBgImageSetting.flag_tablet_img = res.data['flag_tablet_img'];
                SettingsService.tabBgImageSetting.appId = res.data['id'];
                SettingsService.isGeneratingScreenshots = !!res.data.is_generating_screenshots;
                SettingsService.screenshotGenerationBehaviour.next(SettingsService.isGeneratingScreenshots);
            }
        });
    }

    public onEditTabImageChange(event: any): void {
        this.editAppTabForm.icon_image = event.target.files[0];
        this.editImageTarget = event.target;
        this.editAppTabForm.type = 1;
    }

    public onAddTabImageChange(event: any): void {
        this.appTabForm.icon_image = event.target.files[0];
        this.addImageTarget = event.target;
    }

    public toggleSimulator(): void {
        this.simulatorDisplay = !this.simulatorDisplay;
    }

    public onCheckActiveTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.tabs.activeTabs.forEach((activeTabs) => {
                console.log('activeTabs', activeTabs);
                console.log('checkedTab', checkedTab);
                if (activeTabs.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.tabSelector.active[activeTabs.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAllActive = flag ? true : false;
    }

    public onCheckInactiveTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.tabs.inactiveTabs.forEach((inactiveTabs) => {
                console.log('inactiveTabs', inactiveTabs);
                console.log('checkedTab', checkedTab);
                if (inactiveTabs.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.tabSelector.inactive[inactiveTabs.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAllInactive = flag ? true : false;
    }

    public saveTranslationOfTab(appId: number, tabTitle: string, tabId: number, tabType: string): void {
        let tabData = { appId: appId, title: tabTitle, tabId: tabId, tabType: tabType };
        this.dataService.postData(this._saveLanguageTranslationURL, tabData).subscribe((res) => {
            console.log("res", res);
        });
    }
    public onAppTabDialogHide(): void {
        this.appTabForm.tab_func_id = '';
        this.showTabFunctionDropDown = false;
    }

    public onFormTabChange(event): void {
        if (event.index === 2 && !this.colorIcons.length) { // Color icons tab
            this.getColorIcons();
        }
        if (event.index === 3 && !this.photosIcons.length) { // Color icons tab
            this.getPhotosIcons();
        }
    }

    public getColorIcons(): void {
        PageService.showLoader();
        this.dataService.getData(this._getColorIconsURL + '/' + this.colorIconsPager.currentPage).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.colorIcons = this.colorIcons.concat(res.data.data);
                this.colorIconsPager.total = res.data.total;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public colorIconsPageChanged(event: any): void {
        if (event.page === this.colorIconsPager.currentPage) {
            return;
        }
        this.colorIconsPager.currentPage = event.page;
        if (this.colorIcons.length <= (12 * (event.page - 1))) {
            this.getColorIcons();
        }
    }

    public getPhotosIcons(): void {
        PageService.showLoader();
        this.dataService.getData(this._getPhotosIconsURL + '/' + this.photosIconsPager.currentPage).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.photosIcons = this.photosIcons.concat(res.data.data);
                this.photosIconsPager.total = res.data.total;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public photosIconsPageChanged(event: any): void {
        if (event.page === this.photosIconsPager.currentPage) {
            return;
        }
        this.photosIconsPager.currentPage = event.page;
        if (this.photosIcons.length <= (12 * (event.page - 1))) {
            this.getPhotosIcons();
        }
    }

}