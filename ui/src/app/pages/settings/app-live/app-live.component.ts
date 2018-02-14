import { Component, ViewEncapsulation, HostListener, OnInit, OnDestroy } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Router, RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { TabView, Dropdown, Dialog, Carousel, Draggable, RadioButton, Droppable, Message, Growl, SelectItem, TabPanel } from 'primeng/primeng';
import { Dragula } from 'ng2-dragula/ng2-dragula';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { GridDataService, PageService } from '../../../theme/services';
import { ControlGroup, AbstractControl, FORM_DIRECTIVES, Validators, FormBuilder } from '@angular/common';
import { AppState } from '../../../app.state';
import { AppLiveService } from './app-live.service';
import { APIResponse, AppData, AppScreenShot, AppPublish } from '../../../theme/interfaces';
import { ThumbnailFileReader, AppLiveFileReader } from '../../../components';
import { SettingsService } from "../settings.service";
import { EmailValidator  } from '../../../theme/validators';

const IPHONE_4: number = 1;
const IPHONE_5: number = 2;
const IPHONE_6: number = 3;
const IPHONE_6_PLUS: number = 4;
const TABLET: number = 5;

@Component({
    selector: 'app-live',
    pipes: [],
    directives: [Carousel, TOOLTIP_DIRECTIVES, Dropdown, RadioButton, AppLiveFileReader, ThumbnailFileReader, Dialog, Dropdown, Dragula, ROUTER_DIRECTIVES, Draggable, Droppable, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TabView, TabPanel, FORM_DIRECTIVES, Growl, PAGINATION_DIRECTIVES],
    encapsulation: ViewEncapsulation.None,
    template: require('./app-live.html'),
    viewProviders: [DragulaService],
    providers: [GridDataService, PageService, AppLiveService]
})

export class AppLive implements OnInit, OnDestroy {
    public price = [];
    public language = [];
    public appCategory = [];
    public defaultPic = '../../../../assets/no-image.png';
    public id: any;
    public imageTarget: any = null;
    public screenAnOneTarget: any = null;
    public screenAnTwoTarget: any = null;
    public screenAnThreeTarget: any = null;
    public screenAnFourTarget: any = null;
    public screenAnFiveTarget: any = null;
    public phoneSplashscreenTarget: any = null;
    public tabSplashscreenTarget: any = null;
    public iphoneSplashscreenTarget: any = null;
    public loader: boolean = false;
    public active: boolean = false;
    public itunes: boolean = false;
    public expedited: boolean = false;
    public standard_app: boolean = false;
    public expedited_upload: boolean = false;
    public bizness_app_review: boolean = false;
    public app_build_service: boolean = false;
    public editPublish: boolean;
    public iphoneView: number = 0;
    public nextClick: boolean = false;
    public backClick: boolean = true;
    public firstTabActive: boolean = true;
    public secondTabActive: boolean = true;
    public publishDialog: boolean = false;
    public appData: AppData = new AppData();
    public appIphoneFourScreenShot: any = {};
    public appIphoneFiveScreenShot: any = {};
    public appIphoneSixScreenShot: any = {};
    public appIphoneSixPlusScreenShot: any = {};
    public appTabletScreenShot: any = {};
    public appScreenShot: AppScreenShot = new AppScreenShot();
    public appPublish: AppPublish = new AppPublish();
    public icon_name: string;
    public screenshotGenFailData: any[] = [];
    public phoneNames: string[] = [];
    public settingsService: typeof SettingsService = SettingsService;
    public generateScreenshotsDialog: boolean = false;
    public screenshotObservationInterval: NodeJS.Timer;
    public isPublishOption: boolean = true;
public msg :boolean =false;
    constructor(protected dataService: GridDataService,
        protected pageService: PageService,
        protected service: AppLiveService,
        protected router: Router,
        protected appState: AppState) {

        this.id = sessionStorage.getItem('appId');
        let k = 0.00;
        for (let i = 0; i <= 50; i++) {
            this.price.push({ label: k, value: k });
            k = i + 0.99;
        }
        let x = 54.99;
        for (let i = 50; i <= 99; i++) {
            this.price.push({ label: x, value: x });
            i = i + 4;
            x = x + 5;
        }
        let z = 109.99;
        for (let i = 100; i <= 999; i++) {
            this.price.push({ label: z, value: z });
            i = i + 9;
            z = z + 10;
        }

        this.language.push(
            { label: 'Select language' },
            { label: 'Australian English', value: 'Australian English' },
            { label: 'Brazilian Portugese', value: 'Brazilian Portugese' },
            { label: 'Canadian English', value: 'Canadian English' },
            { label: 'Canadian French', value: 'Canadian French' },
            { label: 'Danish (dansk)', value: 'Danish' },
            { label: 'Dutch (Flemish)', value: 'Dutch' },
            { label: 'Finnish (Suomen kieli)', value: 'Finnish' },
            { label: 'French (le français)', value: 'French' },
            { label: 'German (Deutsch)', value: 'German' },
            { label: 'Greek (ελληνικά)', value: 'Greek' },
            { label: 'Indonesian (Bahasa Indonesia)', value: 'Indonesia' },
            { label: 'Italian (Italiano)', value: 'Italian' },
            { label: 'Japanese (日本語)', value: 'Japanese' },
            { label: 'Korean (한국어)', value: 'Korean' },
            { label: 'Malay (بهاس ملايو)', value: 'Malay' },
            { label: 'Mexican', value: 'Mexican' },
            { label: 'Norwegian (norsk)', value: 'Norwegian' },
            { label: 'Norwegian', value: 'Norwegian' },
            { label: 'Portuguese (português)', value: 'Portuguese' },
            { label: 'Russian (русский)', value: 'Russian' },
            { label: 'Simplified Chinese (中文 简体)', value: 'Simplified Chinese' },
            { label: 'Spanish (español)', value: 'Spanish' },
            { label: 'Swedish', value: 'Swedish' },
            { label: 'Thai (ภาษาไทย)', value: 'Thai' },
            { label: 'Traditional Chinese (中文 繁體)', value: 'Traditional Chinese' },
            { label: 'Turkish (Türkçe)', value: 'Turkish' },
            { label: 'UK English', value: 'UK English' },
            { label: 'US English', value: 'US English' },
            { label: 'Vietnamese (Tiếng Việt)', value: 'Vietnamese' });

        this.appCategory.push(
            { label: 'Select category' },
            { label: 'Books', value: 'Books' },
            { label: 'Business', value: 'Business' },
            { label: 'Catalogs', value: 'Catalogs' },
            { label: 'Education', value: 'Education' },
            { label: 'Entertainment', value: 'Entertainment' },
            { label: 'Finance', value: 'Finance' },
            { label: 'Food & Drink', value: 'Food & Drink' },
            { label: 'Games', value: 'Games' },
            { label: 'Health & Fitness', value: 'Health & Fitness' },
            { label: 'Lifestyle', value: 'Lifestyle' },
            { label: 'Medical', value: 'Medical' },
            { label: 'Music', value: 'Music' },
            { label: 'Navigation', value: 'Navigation' },
            { label: 'News', value: 'News' },
            { label: 'Photo & Video', value: 'Photo & Video' },
            { label: 'Productivity', value: 'Productivity' },
            { label: 'Reference', value: 'Reference' },
            { label: 'Shopping', value: 'Shopping' },
            { label: 'Social Networking', value: 'Social Networking' },
            { label: 'Sports', value: 'Sports' },
            { label: 'Travel', value: 'Travel' },
            { label: 'Utilities', value: 'Utilities' },
            { label: 'Weather', value: 'Weather' }
        );

        this.initPhoneNames();

        SettingsService.screenshotGenerationBehaviour.subscribe(isGenerating => {
            if (isGenerating) {
                this.startLookingForScreenshots();
            }
        });
    }

    public ngOnInit(): void {
        if ((typeof this.id === "undefined" || this.id == null) && this.appState.isCustomerLogin) {
            this.router.parent.navigate(['Settings']);
        }
        this.getAppInfo();
        this.getScreenShots();
    }

    public ngOnDestroy(): void {
        if (this.screenshotObservationInterval) {
            clearInterval(this.screenshotObservationInterval);
        }
    }

    public getAppInfo(): void {
        this.loader = true;
        this.service.getAppData(this.id).subscribe((res) => {
            if (res.success) {
                this.loader = false;
                this.appData = res.data;
                this.appData.disable_comment = res.data.disable_comment == 1 ? true : false;
                this.appData.audio_bg_play = res.data.audio_bg_play == 1 ? true : false;
                this.appData.icon_name = res.data.icon_name;
                this.appPublish.apple_user_name = res.data.apple_user_name ? res.data.apple_user_name : "";
                this.appPublish.apple_password = res.data.apple_password ? res.data.apple_password : "";
                this.appPublish.apple_dev_name = res.data.apple_dev_name ? res.data.apple_dev_name : "";
            }
        });
    }

    public saveChanges() {
        this.loader = true;
        this.appData.disable_comment = this.appData.disable_comment ? 1 : 0;
        this.appData.audio_bg_play = this.appData.audio_bg_play ? 1 : 0;
        this.service.saveApp(this.id, this.appData).subscribe(res => {
            if (res.success === true) {
                this.pageService.showSuccess(res.message);
                this.getAppInfo();
            }
            else {
                console.log("Error Updating App");
                this.pageService.showError(res.message, (messages) => {
                    for (let i = 0; i < messages.length; i++) {
                        let replaceString: string = "html5 mobile website url";
                        let index: number = messages[i].indexOf(replaceString);
                        if (index !== -1) {
                            messages[i] = messages[i].replace(replaceString, "official website url");
                        }
                    }
                });
            }
            this.loader = false;
        });
    }

    public onImageChange(event: any): void {
        this.appData.icon_name = event.file[0];
        this.imageTarget = event.target;
        if (this.imageTarget !== null) {
            this.onUploadClick();
        }
    }

    public onUploadClick(): void {
        this.loader = true;
        this.service.uploadIcon(this.id, this.appData.icon_name)
            .subscribe(res => {
                this.loader = false;
                if (res.success === true) {
                    this.pageService.showSuccess(res.message);
                    this.appData.icon_name = null;
                    this.imageTarget = null;
                    this.getAppInfo();
                }
                else {
                    this.pageService.showError(res.message);
                }
            });
    }

    public deleteImage(id: number): void {
        this.loader = true;
        this.service.deleteImage(this.id).subscribe(res => {
            this.loader = false;
            if (res.success) {
                this.pageService.showSuccess('Image successfully deleted.');
                this.appData.icon_name = null;
                this.imageTarget = null;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onScreenOne(event: any, type: number): void {
        this.appScreenShot.screen_shot_1 = event.file[0];
        this.screenAnOneTarget = event.target;
        if (this.screenAnOneTarget !== null) {
            this.onScreenShot(type);
        }
    }
    public onScreenTwo(event: any, type: number): void {
        this.appScreenShot.screen_shot_2 = event.file[0];
        this.screenAnTwoTarget = event.target;
        if (this.screenAnTwoTarget !== null) {
            this.onScreenShot(type);
        }
    }
    public onScreenThree(event: any, type: number): void {
        this.appScreenShot.screen_shot_3 = event.file[0];
        this.screenAnThreeTarget = event.target;
        if (this.screenAnThreeTarget !== null) {
            this.onScreenShot(type);
        }
    }
    public onScreenFour(event: any, type: number): void {
        this.appScreenShot.screen_shot_4 = event.file[0];
        this.screenAnFourTarget = event.target;
        if (this.screenAnFourTarget !== null) {
            this.onScreenShot(type);
        }
    }
    public onScreenFive(event: any, type: number): void {
        this.appScreenShot.screen_shot_5 = event.file[0];
        this.screenAnFiveTarget = event.target;
        if (this.screenAnFiveTarget !== null) {
            this.onScreenShot(type);
        }
    }

    public onPhoneSplashChange(event: any): void {
        this.appData.phone_splash_screen = event.file[0];
        this.phoneSplashscreenTarget = event.target;
        if (this.phoneSplashscreenTarget !== null) {
            this.onSplashUploadClick();
        }
    }

    public onTabSplashChange(event: any): void {
        this.appData.tablet_splash_screen = event.file[0];
        this.tabSplashscreenTarget = event.target;
        if (this.tabSplashscreenTarget !== null) {
            this.onSplashUploadClick();
        }
    }

    public onIphoneSplashChange(event: any): void {
        this.appData.iphone_splash_screen = event.file[0];
        this.iphoneSplashscreenTarget = event.target;
        if (this.iphoneSplashscreenTarget !== null) {
            this.onSplashUploadClick();
        }

    }

    public onScreenShot(type: number): void {
        this.loader = true;
        this.appScreenShot.app_id = this.id;
        this.appScreenShot.type = type;
        this.service.uploadScreenShot(this.appScreenShot).subscribe(res => {
            this.loader = false;
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.appScreenShot = new AppScreenShot();
                this.screenAnOneTarget = null;
                this.screenAnTwoTarget = null;
                this.screenAnThreeTarget = null;
                this.screenAnFourTarget = null;
                this.screenAnFiveTarget = null;
                this.getScreenShots();
            }
            else {
                this.pageService.showError(res.message);
            }
        });
    }

    public getScreenShots(): void {
        this.service.getScreenShot(this.id).subscribe((res) => {
            if (res.success) {
                if (res.data) {
                    if (res.data.appIphoneFourScreenShot) {
                        this.appIphoneFourScreenShot = res.data.appIphoneFourScreenShot;
                    }
                    if (res.data.appIphoneSixScreenShot) {
                        this.appIphoneSixScreenShot = res.data.appIphoneSixScreenShot;
                    }
                    if (res.data.appIphoneSixPlusScreenShot) {
                        this.appIphoneSixPlusScreenShot = res.data.appIphoneSixPlusScreenShot;
                    }
                    if (res.data.appTabletScreenShot) {
                        this.appTabletScreenShot = res.data.appTabletScreenShot;
                    }
                    if (res.data.appIphoneFiveScreenShot) {
                        this.appIphoneFiveScreenShot = res.data.appIphoneFiveScreenShot;
                    }
                }
                else {
                    console.log('No data found');
                }
            }
        });
    }

    public onSplashUploadClick() {
        this.loader = true;
        this.service.uploadSplashScreen(this.id, this.appData.phone_splash_screen, this.appData.tablet_splash_screen, this.appData.iphone_splash_screen)
            .subscribe(res => {
                this.loader = false;
                if (res.success === true) {
                    this.pageService.showSuccess(res.message);
                    this.appData.phone_splash_screen = null;
                    this.phoneSplashscreenTarget = null;
                    this.appData.iphone_splash_screen = null;
                    this.iphoneSplashscreenTarget = null;
                    this.appData.tablet_splash_screen = null;
                    this.tabSplashscreenTarget = null;
                    this.getAppInfo();
                }
                else {
                    this.pageService.showError(res.message);
                }
            });
    }

    public deleteSplashImage(imageType: string): void {
        if (this.id) {
            this.loader = true;
            this.service.deleteSplashImage(imageType, this.id).subscribe(res => {
                this.loader = false;
                if (res.success) {
                    if (imageType == "phone") {
                        this.appData.phone_splash_screen = null;
                        this.phoneSplashscreenTarget = null;
                    }
                    if (imageType == "tablet") {
                        this.appData.tablet_splash_screen = null;
                        this.tabSplashscreenTarget = null;
                    }
                    if (imageType == "iphone") {
                        this.appData.iphone_splash_screen = null;
                        this.iphoneSplashscreenTarget = null;
                    }
                    this.pageService.showSuccess("Splash Image deleted succesfully.");
                }
                else
                    this.pageService.showError(res.message);
            });

        }
    }

    public deleteScreenShot(imageType: number, imageName: string): void {
        if (this.id) {
            this.loader = true;
            this.service.deleteScreenShot(imageType, imageName, this.id).subscribe(res => {
                this.loader = false;
                if (res.success) {
                    if ((imageType == 1 || imageType == 2 || imageType == 3 || imageType == 4 || imageType == 5) && imageName == 'screen_shot_1') {
                        this.appScreenShot.screen_shot_1 = null;
                        this.screenAnOneTarget = null;
                    }
                    if ((imageType == 1 || imageType == 2 || imageType == 3 || imageType == 4 || imageType == 5) && imageName == 'screen_shot_2') {
                        this.appScreenShot.screen_shot_2 = null;
                        this.screenAnTwoTarget = null;
                    }
                    if ((imageType == 1 || imageType == 2 || imageType == 3 || imageType == 4 || imageType == 5) && imageName == 'screen_shot_3') {
                        this.appScreenShot.screen_shot_3 = null;
                        this.screenAnThreeTarget = null;
                    }
                    if ((imageType == 1 || imageType == 2 || imageType == 3 || imageType == 4 || imageType == 5) && imageName == 'screen_shot_4') {
                        this.appScreenShot.screen_shot_4 = null;
                        this.screenAnFourTarget = null;
                    }
                    if ((imageType == 1 || imageType == 2 || imageType == 3 || imageType == 4 || imageType == 5) && imageName == 'screen_shot_5') {
                        this.appScreenShot.screen_shot_5 = null;
                        this.screenAnFiveTarget = null;
                    }
                    this.getScreenShots();
                    this.pageService.showSuccess("Screen shot deleted succesfully.");
                }
                else
                    this.pageService.showError(res.message);
            });

        }
    }

    public onPublishClick(): void {
        this.publishDialog = true;
        this.pageService.onDialogOpen();
        this.active = false;
        this.firstTabActive = true;
        this.isPublishOption = true;
    }

    public onSavePublish(): void {
        this.loader = true;
        this.appPublish.app_id = this.id;
        // this.appPublish.update_type = (this.itunes ? 1 :(this.expedited ? 2 : (this.standard_app ? 3 : (this.expedited_upload ? 4 : (this.bizness_app_review ? 5 : 6)))));
        this.appPublish.iphone_product = this.appPublish.iphone_product ? 1 : 0;
        this.appPublish.android_product = this.appPublish.android_product ? 1 : 0;
        this.appPublish.tab_product = this.appPublish.tab_product ? 1 : 0;
        this.service.saveAppPublish(this.id, this.appPublish)
            .subscribe(res => {
                this.loader = false;
                if (res.success === true) {
                    this.publishDialog = false;
                    this.appPublish = new AppPublish();
                    this.isPublishOption = true;
                    this.pageService.showSuccess(res.message);
                }
                else {
                    this.pageService.showError(res.message);
                }
            });
    }

    public onBackClick(): void {
        this.firstTabActive = false;
        this.isPublishOption = true;
        setTimeout(() => {
            this.firstTabActive = true;
            this.active = false;
        }, 0);
    }

    public onNextClick(): void {
        this.getPublishInfo();
        this.isPublishOption = false;
        if (this.appPublish.email == null) {
            this.pageService.showError('Please enter your email address.');

        }
        else if (this.appPublish.apple_user_name == null) {
            this.pageService.showError('Please enter your Apple ID.');

        }
        else if (this.appPublish.apple_password == null) {
            this.pageService.showError('Please enter your Apple Password.');

        }
        else if (this.appPublish.apple_dev_name == null) {
            this.pageService.showError('Please enter your Apple Developer Name.');
        } else {
            this.active = true;
        }
    }

    public onGenerateScreenShotsClick(): void {
        PageService.showLoader();
        this.service.generateScreenshots(this.id).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                SettingsService.isGeneratingScreenshots = true;
                SettingsService.screenshotGenerationBehaviour.next(true);
            } else {
                SettingsService.isGeneratingScreenshots = false;
                if (res.data) {
                    this.screenshotGenFailData = res.data;
                    this.generateScreenshotsDialog = true;
                    this.pageService.onDialogOpen();
                }
                if (res.message) {
                    this.pageService.showError(res.message);
                }
            }
        });
    }

    private initPhoneNames(): void {
        this.phoneNames[IPHONE_4] = "iPhone 4";
        this.phoneNames[IPHONE_5] = "iPhone 5";
        this.phoneNames[IPHONE_6] = "iPhone 6";
        this.phoneNames[IPHONE_6_PLUS] = "iPhone 6 Plus";
        this.phoneNames[TABLET] = "Tablet";
    }

    private startLookingForScreenshots(): void {
        this.screenshotObservationInterval = setInterval(() => {
            this.service.getScreenshotGenerationStatus(this.id).subscribe(res => {
                if (res.success && !res.data.is_generating_screenshots) {
                    SettingsService.isGeneratingScreenshots = false;
                    SettingsService.screenshotGenerationBehaviour.next(false);
                    this.getScreenShots();
                    clearInterval(this.screenshotObservationInterval);
                }
            });
        }, 3000);
    }

    public onDialogHide(): void {
        this.appPublish = new AppPublish();
    }

    public getPublishInfo(): void {
        this.service.getPublishInfo(this.id).subscribe(res => {
            if (res.success) {
                if (res.data) {
                    this.editPublish = false;
                    this.appPublish.update_type = 1;
                } else {
                    this.editPublish = true;
                    this.appPublish.update_type = 3;
                }
            }
            //  else {
            //     this.editPublish = false;
            //     this.appPublish.update_type = 1;
            // }
        });
    }

}

