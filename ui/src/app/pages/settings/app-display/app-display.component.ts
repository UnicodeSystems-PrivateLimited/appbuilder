import { Component, ViewEncapsulation, forwardRef } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Router, RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { TabView, TabPanel } from 'primeng/primeng';
import { Dragula } from 'ng2-dragula/ng2-dragula';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { Draggable, Droppable, Message, Growl } from 'primeng/primeng';
import { Dialog, Dropdown, Carousel } from 'primeng/primeng';
import { SelectItem } from 'primeng/primeng';
import { GridDataService, PageService } from '../../../theme/services';
import { ControlGroup, AbstractControl, FORM_DIRECTIVES, Validators, FormBuilder } from '@angular/common';
import { AppState } from '../../../app.state';
import { BaCard } from '../../../theme/components';
import { SettingsService } from '../settings.service';
import { DomSanitizationService } from "@angular/platform-browser";
import { DisplaySettings } from './display-settings';
import { BackgroundImages } from './background-images';
import { HomeScreenService } from './home-screen.service';
import { GlobalStyleService } from './global-style.service';
import { HomeScreenSettings, Tab, HomeScreenLayout, HomeScreenIconColor, HomeScreenButtons, HomeScreenHeader, HomeScreenExtraButtons } from '../../../theme/interfaces';
import { GlobalStyleSettings, GlobalStyleHeader, IndividualTabColor, IndividualTabHeader, GlobalStyleIndividualTabs, IndividualTabsButtons, IndividualTabIconColor, GlobalStyleFonts, GlobalStyleLists, GlobalStyleFeatures, GlobalStyleBlurEffect } from '../../../theme/interfaces';
import { Observable } from 'rxjs/Observable';
import { RouteParams } from '@angular/router-deprecated';


@Component({
    selector: 'app-display',
    pipes: [],
    directives: [Carousel, TOOLTIP_DIRECTIVES, Dropdown, Dialog, Dragula, ROUTER_DIRECTIVES, Draggable, Droppable, BaCard, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TabView, TabPanel, FORM_DIRECTIVES, Growl, PAGINATION_DIRECTIVES],
    encapsulation: ViewEncapsulation.None,
    template: require('./app-display.html'),
    viewProviders: [DragulaService],
    providers: [GridDataService, PageService, HomeScreenService, GlobalStyleService]
})

@RouteConfig([
    {
        name: 'DisplaySettings',
        component: DisplaySettings,
        path: '/settings',
        useAsDefault: true
    },
    {
        name: 'BackgroundImages',
        component: BackgroundImages,
        path: '/background-images'
    }
])

export class AppDisplay {
    public showLoader: boolean = false;

    public appId: any;
    public tabs: Tab[] = [];
    public simulatorDisplay: boolean = false;
    public appSimulatorURL: any;
    public tabId: number;

    private TAB_LAYOUT: number = 0;
    private TAB_EXTRA_BUTTONS: number = 1;
    private TAB_SUBTABS: number = 2;
    private TAB_HEADERS: number = 3;
    private TAB_BUTTONS: number = 4;
    private TAB_ICON_COLOR: number = 5;
    public appTabs: any = [];

    constructor(protected dataService: GridDataService,
        protected router: Router,
        private params: RouteParams,
        protected pageService: PageService,
        protected appState: AppState,
        private settingsService: SettingsService,
        private sanitizer: DomSanitizationService,
        private homeScreenService: HomeScreenService,
        private globalStyleService: GlobalStyleService

    ) {

        this.tabId = parseInt(params.get('tabId'));
        this.appId =parseInt(sessionStorage.getItem('appId'));
        this.appSimulatorURL = sanitizer.bypassSecurityTrustResourceUrl(SettingsService.simulatorBaseURL + "?app_id=" + this.appId);
        this.homeScreenService.homeScreenSettings.app_id = this.appId;
        this.homeScreenService.homeScreenSettings.layout = new HomeScreenLayout();
        this.homeScreenService.homeScreenSettings.icon_color = new HomeScreenIconColor();
        this.homeScreenService.homeScreenSettings.buttons = new HomeScreenButtons();
        this.homeScreenService.homeScreenSettings.header = new HomeScreenHeader();
        this.homeScreenService.homeScreenSettings.extra_buttons = new HomeScreenExtraButtons();
        this.globalStyleService.globalStyleSettings.app_id = this.appId;
        this.globalStyleService.globalStyleSettings.header = new GlobalStyleHeader();
        this.globalStyleService.globalStyleSettings.fonts = new GlobalStyleFonts();
        this.globalStyleService.globalStyleSettings.lists = new GlobalStyleLists();
        this.globalStyleService.globalStyleSettings.features = new GlobalStyleFeatures();
        this.globalStyleService.globalStyleSettings.blur_effect = new GlobalStyleBlurEffect();
        this.globalStyleService.individualTabSettings.tab_id = this.tabId;
        this.globalStyleService.individualTabSettings.buttons = new IndividualTabsButtons();
        this.globalStyleService.individualTabSettings.icon_color = new IndividualTabIconColor();
        this.globalStyleService.individualTabSettings.header = new IndividualTabHeader();
        this.globalStyleService.individualTabSettings.color = new IndividualTabColor();

    }

    public ngOnInit(): void {
        if ((typeof this.appId === "undefined" || this.appId == null) && this.appState.isCustomerLogin) {
            // No access to settings without App ID. Go back to your App grid page.
            this.router.parent.navigate(['Settings']);
        }
        this.settingsService.getAppTabsForContent(this.appId);
        this.getInitData();
    }

    public getInitData(): void {
        // One request to get all initial data.
        Observable.forkJoin(
            this.homeScreenService.getInitData(this.appId),
            this.globalStyleService.getInitData(this.appId)
        ).subscribe(res => {
            if (res[0].success && res[1].success) {
                if (res[0].data.settings) {
                    this.homeScreenService.homeScreenSettings.id = res[0].data.settings.id;
                    if (!this.empty(res[0].data.settings.layout)) {
                        this.homeScreenService.homeScreenSettings.layout = res[0].data.settings.layout;
                        this.homeScreenService.homeScreenSettings.layout.traditional_tab_number = parseInt(this.homeScreenService.homeScreenSettings.layout.traditional_tab_number);
                        this.homeScreenService.homeScreenSettings.layout.show_status_bar = res[0].data.settings.layout.show_status_bar == 1 ? true : false;
                    }

                    if (!this.empty(res[0].data.settings.icon_color)) {
                        this.homeScreenService.homeScreenSettings.icon_color = res[0].data.settings.icon_color;
                        this.homeScreenService.homeScreenSettings.icon_color.show_icon = res[0].data.settings.icon_color.show_icon == 1 ? true : false;
                        this.homeScreenService.homeScreenSettings.icon_color.enable_color = res[0].data.settings.icon_color.enable_color == 1 ? true : false;
                        if ((res[0].data.settings.icon_color.icon_color == null || res[0].data.settings.icon_color.icon_color == "")) {
                            this.homeScreenService.homeScreenSettings.icon_color.icon_color = "#000";
                        }
                    }
                    if (!this.empty(res[0].data.settings.subtabs)) {
                        this.homeScreenService.homeScreenSettings.subtabs.show_on_tablet = res[0].data.settings.subtabs.show_on_tablet == 1 ? true : false;
                    }

                    if (!this.empty(res[0].data.settings.buttons)) {
                        this.homeScreenService.homeScreenSettings.buttons = res[0].data.settings.buttons;
                        this.homeScreenService.homeScreenSettings.buttons.show_text = res[0].data.settings.buttons.show_text == 1 ? true : false;
                    }

                    if (!this.empty(res[0].data.settings.header)) {
                        this.homeScreenService.homeScreenSettings.header = res[0].data.settings.header;
                    }
                    if (!this.empty(res[0].data.settings.extra_buttons)) {
                        this.homeScreenService.homeScreenSettings.extra_buttons = res[0].data.settings.extra_buttons;
                        this.homeScreenService.homeScreenSettings.extra_buttons.call_us = res[0].data.settings.extra_buttons.call_us == 1 ? true : false;
                        this.homeScreenService.homeScreenSettings.extra_buttons.direction = res[0].data.settings.extra_buttons.direction == 1 ? true : false;
                        this.homeScreenService.homeScreenSettings.extra_buttons.tell_friend = res[0].data.settings.extra_buttons.tell_friend == 1 ? true : false;
                    }
                }
                if (res[0].data.individualSettings) {
                    this.homeScreenService.individualSettings = res[0].data.individualSettings;
                }

                if (!this.empty(res[0].data.image_list)) {
                    this.homeScreenService.buttonBackgroundImages = res[0].data.image_list;
                    for (let val of res[0].data.image_list) {
                        this.homeScreenService.buttonBgImageSrcs[val.id] = val.name;
                    }
                }
                if (!this.empty(res[0].data.header_image_list)) {
                    this.homeScreenService.homeHeaderBackgroundImages = res[0].data.header_image_list;
                    for (let val of res[0].data.header_image_list) {
                        this.homeScreenService.homeHeaderBgImageSrcs[val.id] = val.name;
                    }
                }
                if (!this.empty(res[1].data.image_list)) {
                    this.globalStyleService.headerBackgroundImages = res[1].data.image_list;
                    for (let val of res[1].data.image_list) {
                        this.globalStyleService.headerBgImageSrcs[val.id] = val.name;
                    }
                }
                if (!this.empty(res[1].data.color_theme)) {
                    for (let item of res[1].data.color_theme) {
                        this.globalStyleService.color_theme.push({ label: item.name, value: item.id })
                    }
                }

                if (!this.empty(res[1].data.font_list)) {
                    for (let item of res[1].data.font_list) {
                        this.globalStyleService.font_list.push({ label: item.label, value: item.id })
                        this.globalStyleService.font_value[item.id] = item.value;
                    }
                }
                if (!this.empty(res[1].data.black_icon)) {
                    this.globalStyleService.blackIcons = res[1].data.black_icon;
                }
                if (!this.empty(res[1].data.white_icon)) {
                    this.globalStyleService.whiteIcons = res[1].data.white_icon;
                }

                this.homeScreenService.subTabIcons = res[0].data.subTabIcons;
                this.homeScreenService.subTabList = Object.keys(res[0].data.subTabs).map(i => res[0].data.subTabs[i]);

                if (res[1].data.globalStyle) {
                    this.globalStyleService.globalStyleSettings.id = res[1].data.globalStyle.id;

                    if (!this.empty(res[1].data.globalStyle.header)) {
                        this.globalStyleService.globalStyleSettings.header = res[1].data.globalStyle.header;
                    }
                    if (!this.empty(res[1].data.globalStyle.fonts)) {
                        this.globalStyleService.globalStyleSettings.fonts = res[1].data.globalStyle.fonts;
                    }
                    if (!this.empty(res[1].data.globalStyle.lists)) {
                        this.globalStyleService.globalStyleSettings.lists = res[1].data.globalStyle.lists;
                    }
                    if (!this.empty(res[1].data.globalStyle.features)) {
                        this.globalStyleService.globalStyleSettings.features = res[1].data.globalStyle.features;
                    }
                    if (!this.empty(res[1].data.app_tabs_data)) {
                        this.globalStyleService.appTabs = res[1].data.app_tabs_data;
                    }
                    if (!this.empty(res[1].data.globalStyle.blur_effect)) {
                        let checkAllLocked: boolean = false;
                        this.globalStyleService.globalStyleSettings.blur_effect = res[1].data.globalStyle.blur_effect;
                        for (let i in this.globalStyleService.globalStyleSettings.blur_effect) {
                            if (this.globalStyleService.globalStyleSettings.blur_effect[i] === "false") {
                                this.globalStyleService.globalStyleSettings.blur_effect[i] = this.globalStyleService.globalBlurCheckAll = false;
                                checkAllLocked = true;
                            } else {
                                this.globalStyleService.globalStyleSettings.blur_effect[i] = true;
                                if (!checkAllLocked) {
                                    this.globalStyleService.globalBlurCheckAll = true;
                                }
                            }
                        }
                        this.globalStyleService.overlayDisplay = this.globalStyleService.globalBlurCheckAll ? "block" : "none";
                    }
                    this.globalStyleService.globalStyleSettingsReady = true;
                }

                this.homeScreenService.app = res[0].data.appData;
                this.homeScreenService.homeScreenSettingsReady = true;

                if (this.homeScreenService.homeScreenSettings.layout.home_layout === 1 && this.homeScreenService.homeScreenSettings.layout.traditional_position !== 2) {
                    this.homeScreenService.disabledHomeScreenTabs[this.TAB_EXTRA_BUTTONS] = true;
                    this.homeScreenService.disabledHomeScreenTabs[this.TAB_SUBTABS] = true;
                }
                this.homeScreenService.buttonBackgroundImageTarget = null;
                this.globalStyleService.headerBackgroundImageTarget = null;
                this.homeScreenService.homeHeaderBackgroundImageTarget = null;

            } else {
                console.log('no data found');
            }
        });
    }

    public toggleSimulator(): void {
        this.simulatorDisplay = !this.simulatorDisplay;
    }

    public saveBackgroundImage() {
        this.homeScreenService.saveBackgroundImage();
        // console.log(this.homeScreenService.backgroundSetting);
        // console.log('slider data saving..');
        // let imageId = this.homeScreenService.backgroundSetting.userImageId;
        // let sliderNo = this.homeScreenService.backgroundSetting.sliderNo.join(',');
        // let isModernSliding = this.homeScreenService.backgroundSetting.isModernSliding ? 1 : 0;
        // let sliderType = this.homeScreenService.backgroundSetting.sliderType;
        // this.homeScreenService.setSliderImage({ appId: this.appId, userImageId: imageId, sliderNo: sliderNo, isModernSliding: isModernSliding, sliderType: sliderType }).subscribe((res) => {
        //     console.log(res);
        //     if (res.success) {
        //         this.pageService.showSuccess(res.message[0]);
        //         this.homeScreenService.appData = res.data['app_data'];
        //         this.homeScreenService.homeScreenSliderData = res.data['home_screen_sliders'];
        //         this.homeScreenService.sliderDIsplaySettings.slider = [];

        //         for (let i = 0; i < this.homeScreenService.homeScreenSliderData.length; i++) {
        //             this.homeScreenService.sliderDIsplaySettings.slider[this.homeScreenService.homeScreenSliderData[i].slider_no] = this.homeScreenService.homeScreenSliderData[i].image_id;
        //         }

        //         if (!(this.homeScreenService.backgroundSetting.setBackgroundButtonStatusActive || this.homeScreenService.backgroundSetting.setTabBackgroundButtonStatusActive.length)) {
        //             this.homeScreenService.backgroundSetting.userImageId = 0;
        //         }
        //         this.homeScreenService.backgroundSetting.setBackgroundButtonStatusActive = false;
        //         this.homeScreenService.backgroundSetting.sliderNo = [];
        //         this.homeScreenService.backgroundSetting.isModernSliding = this.homeScreenService.appData.is_modern_sliding ? true : false;
        //         this.homeScreenService.backgroundSetting.sliderType = this.homeScreenService.appData.slider_type ? this.homeScreenService.appData.slider_type : 1;
        //         this.homeScreenService.setUserImageInfo();
        //     } else {
        //         this.pageService.showError(res.message);
        //     }
        // });
        // if (this.homeScreenService.backgroundSetting.userImageId) {
        //     if (this.homeScreenService.backgroundSetting.setBackgroundButtonStatusActive) {
        //         console.log('background data saving..');
        //         let imageId = this.homeScreenService.backgroundSetting.userImageId;
        //         this.homeScreenService.setBackgroundImage({ appId: this.appId, imgId: imageId }).subscribe((res) => {
        //             console.log(res);
        //             if (res.success) {
        //                 this.pageService.showSuccess(res.message);
        //                 this.homeScreenService.appData = res.data['app_data'];
        //                 if (!(this.homeScreenService.backgroundSetting.setTabBackgroundButtonStatusActive.length || this.homeScreenService.backgroundSetting.sliderNo.length)) {
        //                     this.homeScreenService.backgroundSetting.userImageId = 0;
        //                 }
        //                 this.homeScreenService.backgroundSetting.setBackgroundButtonStatusActive = false;
        //                 this.homeScreenService.setUserImageInfo();
        //             } else {
        //                 this.pageService.showError(res.message);
        //             }
        //         });
        //     }



        //     if (this.homeScreenService.backgroundSetting.setTabBackgroundButtonStatusActive.length) {
        //         console.log('tabs data saving..');
        //         let imageId = this.homeScreenService.backgroundSetting.userImageId;
        //         let tabsId = this.homeScreenService.backgroundSetting.setTabBackgroundButtonStatusActive.join(',');
        //         this.homeScreenService.setTabBackImage({ appId: this.appId, userImageId: imageId, tabsId: tabsId,bgImageType: (this.homeScreenService.phoneTabActive ? 1 :  2 ) }).subscribe((res) => {
        //             console.log(res);
        //             if (res.success) {
        //                 this.pageService.showSuccess(res.message[0]);
        //                 this.homeScreenService.appData = res.data['app_data'];
        //                 this.homeScreenService.appTabs = res.data['app_tabs_data'];

        //                 if (!(this.homeScreenService.backgroundSetting.setBackgroundButtonStatusActive || this.homeScreenService.backgroundSetting.sliderNo.length)) {
        //                     this.homeScreenService.backgroundSetting.userImageId = 0;
        //                 }
        //                 this.homeScreenService.backgroundSetting.setTabBackgroundButtonStatusActive = [];
        //                 this.homeScreenService.setUserImageInfo();
        //             }

        //             else {
        //                 this.pageService.showError(res.message);
        //             }
        //         });
        //     }
        // }
        // else {
        //     console.log("please select image");
        // }
    }

    public onSaveSettings(): void {
        this.homeScreenService.homeScreenSettings.app_id = this.appId;
        this.globalStyleService.globalStyleSettings.app_id = this.appId;
        this.homeScreenService.homeScreenSettings.icon_color.show_icon = this.homeScreenService.homeScreenSettings.icon_color.show_icon ? 1 : 0;
        this.homeScreenService.homeScreenSettings.icon_color.enable_color = this.homeScreenService.homeScreenSettings.icon_color.enable_color ? 1 : 0;
        this.homeScreenService.homeScreenSettings.buttons.show_text = this.homeScreenService.homeScreenSettings.buttons.show_text ? 1 : 0;
        this.homeScreenService.homeScreenSettings.extra_buttons.call_us = this.homeScreenService.homeScreenSettings.extra_buttons.call_us ? 1 : 0;
        this.homeScreenService.homeScreenSettings.extra_buttons.direction = this.homeScreenService.homeScreenSettings.extra_buttons.direction ? 1 : 0;
        this.homeScreenService.homeScreenSettings.extra_buttons.tell_friend = this.homeScreenService.homeScreenSettings.extra_buttons.tell_friend ? 1 : 0;
        this.homeScreenService.homeScreenSettings.layout.show_status_bar = this.homeScreenService.homeScreenSettings.layout.show_status_bar ? 1 : 0;
        this.homeScreenService.homeScreenSettings.subtabs.show_on_tablet = this.homeScreenService.homeScreenSettings.subtabs.show_on_tablet ? 1 : 0;
        if (this.homeScreenService.homeScreenSettings.icon_color.enable_color == 0) {
            this.homeScreenService.homeScreenSettings.icon_color.icon_color = null;
        }
        PageService.showLoader();
        Observable.forkJoin(
            this.homeScreenService.saveSettings(this.homeScreenService.homeScreenSettings),
            this.globalStyleService.save(this.globalStyleService.globalStyleSettings)
        ).subscribe((res) => {
            if (res[0].success && res[1].success) {
                PageService.hideLoader();
                this.getInitData();
                if (res[0].success) {
                    console.log(this.homeScreenService.homeScreenSettings);
                }
                if (res[1].success) {
                    console.log(this.globalStyleService.globalStyleSettings);
                }
                this.pageService.showSuccess('Settings Saved Successfully');
            } else {
                this.pageService.showError('Error Occurred');

            }
        });
    }

    private empty(value): boolean {
        if (value) {
            if (value.constructor === Array) {
                return value.length > 0 ? false : true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

}
