import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, Control, AbstractControl } from '@angular/common';
import { Router, RouteConfig, RouterOutlet, RouteParams, RouterLink, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { DROPDOWN_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { SelectItem } from 'primeng/primeng';
import { BaCard } from '../../theme/components';
import { PageService, GridDataService } from '../../theme/services';
import { Dialog, Dropdown, Growl, Message } from 'primeng/primeng';
import { EmailValidator, EqualPasswordsValidator, UrlValidator, AlphaValidator, WhitespaceValidator, PasswordValidator, AppNameValidator } from '../../theme/validators';
import { MyAppPipe, MyAppLengthPipe } from '../../theme/pipes';
import { AppState } from '../../app.state';
import { MyAppService } from './myApp.service';
import { Observable } from 'rxjs/Observable';

export interface AppInfo {
    id?: any;
    app_name: string;
    app_code: string;
    username: string;
    password: string;
    app_icon_name: string;
    client_name: string;
    client_email: string;
    client_phone: number;
    label: string;
    ios_app_store_url: string;
    ios_app_store_id: string;
    google_play_store_url: string;
    html5_mobile_website_url: string;
    apple_credit_used?: boolean;
    code_version?: any;
    created_at?: any;
    created_by?: any;
    source_app_id?: any;
    updated_at?: any;
}

export interface AppSearch {
    title?: string;
    publish_status?: string;
}

export interface Duplicate {
    id: number;
    code?: string;
    name?: string;
    appTabs?: any;
}


@Component({
    selector: 'dashboard',
    pipes: [MyAppPipe, MyAppLengthPipe],
    directives: [ROUTER_DIRECTIVES, BaCard, DROPDOWN_DIRECTIVES, Growl, Dialog, Dropdown, PAGINATION_DIRECTIVES],
    encapsulation: ViewEncapsulation.None,
    styles: [require('./myApp.scss')],
    template: require('./myApp.html'),
    providers: [GridDataService, PageService, MyAppService]
})

export class MyApp {

    public form: ControlGroup;
    public appPublishForm: ControlGroup;
    public duplicateForm: ControlGroup;
    public createDuplicateForm: ControlGroup;
    //var of form
    public app_name: AbstractControl;
    public app_code: AbstractControl;
    public app_icon_name: AbstractControl;
    public username: AbstractControl;
    public password: AbstractControl;
    public client_name: AbstractControl;
    public client_email: AbstractControl;
    public client_phone: AbstractControl;
    public label: AbstractControl;
    public ios_app_store_url: AbstractControl;
    public ios_app_store_id: AbstractControl;
    public google_play_store_url: AbstractControl;
    public html5_mobile_website_url: AbstractControl;
    //var of create duplicate form
    public cd_app_name: AbstractControl;
    public cd_app_code: AbstractControl;
    public cd_username: AbstractControl;
    public cd_password: AbstractControl;

    private _getAppInfo = '../api/ws/app/info';
    private _getAppUrl = '../api/ws/app/list';
    private _appAddUrl = '../api/ws/app/create';
    private _appUpdateUrl = '../api/ws/app/update/';
    private _duplicateAddUrl = '../api/ws/app/duplicate';
    private _appDeleteURL = '../api/ws/app/delete';

    // -------------------------------------------------------------------------

    //var of duplicateForm
    public d_app_name: Control;
    public d_app_code: Control;
    public d_username: Control;
    public d_password: Control;
    public d_app_icon_name: Control;
    public d_client_name: Control;
    public d_client_email: Control;
    public d_client_phone: Control;
    public d_label: Control;
    public d_ios_app_store_url: Control;
    public d_ios_app_store_id: Control;
    public d_google_play_store_url: Control;
    public d_html5_mobile_website_url: Control;

    //push publish form
    public apple_user_name: Control;
    public apple_password: Control;
    public apple_dev_name: Control;
    public push_publish_email: Control;

    public isDelayedRunning;
    public list;
    public appInfo: AppInfo;
    public appData: AppInfo;
    public submitted: boolean = false;
    router: Router;
    public id;
    private loginAppCode;
    public loginAppid;
    public maxSize: number = 4;
    public bigTotalItems: number = 175;
    public bigCurrentPage: number = 1;

    //-------------- PAGINATION --------------------------
    public totalItems: number = 0;
    public currentPage: number = 1;
    public itemsPerPage: number = 10;
    //----------------------------------------------------

    //delete modal
    selectedAppId: string[] = [];
    deleteAppById() {

    }

    display: boolean = false;
    display2: boolean = false;
    duplicateModal: boolean = false;
    pushPublishModal: boolean = false;
    createDuplicateModal: boolean = false;
    pushUploadModal: boolean = false;

    showDialog(code, id) {
        this.loginAppCode = code;
        this.loginAppid = id;
        this.appState.dataAppId = id;
        this.appState.dataAppCode = code;
        this.appState.setAppState(this.appState.dataAppId, this.appState.dataAppCode);
        this.appService.saveLaunchActivity(this.appState.dataAppId).subscribe(res => {
            console.log(res.message);
        });
        this.router.navigate(['Settings']);
    }

    showDialog1() {
        this.display2 = true;
        this.page.onDialogOpen();
        this.refreshAppInfo();
    }

    showDialog2(id) {
        this.duplicateModal = true;
        this.page.onDialogOpen();
        this.getAppData(id);
    }
    showDialog3(id) {
        this.pushPublishModal = true;
        this.page.onDialogOpen();
        this.getAppData(id);
    }
    showDialog4(id) {
        this.pushUploadModal = true;
        this.page.onDialogOpen();
        this.getPushUploadAppData(id);
    }

    categories: SelectItem[];
    selectedCat: string;
    app: SelectItem[];
    count: SelectItem[];
    selectedCount: any;
    public selectedApps: boolean[] = [];
    public deleteConfirmDialogDisplay: boolean = false;

    //---------------- APP SEARCH -------------------------
    public appSearch: AppSearch = {
        title: '',
        publish_status: 'AllApps'
    };
    public queryString: string = '';
    //-----------------------------------------------------

    public checkAll: boolean = false;
    public duplicate: Duplicate = {
        id: null,
        appTabs: null
    };
    public appDropdown: SelectItem[] = [];
    public checkAllAppTabs: boolean = false;
    public checkedAppTabs: boolean[] = [];
    public appBundleId: string = null;
    public appId: number = null;
    public ispushPublishModalRunning: boolean = false;
    public appPublishLog: any = [];
    public showLoader: boolean = false;

    constructor(
        private appState: AppState,
        private fb: FormBuilder,
        router: Router,
        private dataService: GridDataService,
        private page: PageService, routeParams: RouteParams,
        private appService: MyAppService
    ) {
        if (this.appState.isCustomerLogin)
            this.appState.isAllAppPage = true;
        PageService.showpushNotificationButton = false;
        this.router = router;

        this.form = fb.group({
            'app_name': ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(80),AppNameValidator.validate])],
            'app_code': ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(80), WhitespaceValidator.validate])],
            'app_icon_name': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
            'username': ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(80)])],
            'password': ['', Validators.compose([Validators.required, Validators.minLength(4), PasswordValidator.validate])],
            'client_name': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
            // 'client_email': [''],
            'client_email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
            'client_phone': ['', Validators.compose([Validators.minLength(10), Validators.maxLength(12)])],
            'ios_app_store_url': ['', Validators.compose([UrlValidator.validate])],
            'label': ['', Validators.compose([Validators.minLength(3), AlphaValidator.validate])],
            'ios_app_store_id': [''],
            'google_play_store_url': ['', Validators.compose([UrlValidator.validate])],
            'html5_mobile_website_url': ['', Validators.compose([UrlValidator.validate])],
        });

        this.createDuplicateForm = fb.group({
            'app_name': ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(80),AppNameValidator.validate])],
            'app_code': ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(80), WhitespaceValidator.validate])],
            'username': ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(80)])],
            'password': ['', Validators.compose([Validators.required, Validators.minLength(4), PasswordValidator.validate])],
        });

        this.apple_user_name = new Control('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(80)]));
        this.apple_dev_name = new Control('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(80)]));
        this.apple_password = new Control('', Validators.compose([Validators.required, Validators.minLength(4)]));
        this.push_publish_email = new Control('', Validators.compose([Validators.required, EmailValidator.validate]));
        this.appPublishForm = fb.group({
            'apple_user_name': this.apple_user_name,
            'apple_dev_name': this.apple_dev_name,
            'apple_password': this.apple_password,
            'push_publish_email': this.push_publish_email,
        });


        //var of form 
        this.app_name = this.form.controls['app_name'];
        this.app_code = this.form.controls['app_code'];
        this.app_icon_name = this.form.controls['app_icon_name'];
        this.username = this.form.controls['username'];
        this.password = this.form.controls['password'];
        this.client_name = this.form.controls['client_name'];
        this.client_email = this.form.controls['client_email'];
        this.client_phone = this.form.controls['client_phone'];
        this.label = this.form.controls['label'];
        this.ios_app_store_url = this.form.controls['ios_app_store_url'];
        this.ios_app_store_id = this.form.controls['ios_app_store_id'];
        this.google_play_store_url = this.form.controls['google_play_store_url'];
        this.html5_mobile_website_url = this.form.controls['html5_mobile_website_url'];

        //var of createDuplicateForm
        this.cd_app_name = this.createDuplicateForm.controls['app_name'];
        this.cd_app_code = this.createDuplicateForm.controls['app_code'];
        this.cd_username = this.createDuplicateForm.controls['username'];
        this.cd_password = this.createDuplicateForm.controls['password'];

        //var of duplicateForm

        this.d_app_name = new Control('', Validators.compose([Validators.required, Validators.minLength(3),AppNameValidator.validate]));
        this.d_app_code = new Control('', Validators.compose([Validators.required, Validators.minLength(3), WhitespaceValidator.validate]));
        this.d_username = new Control('', Validators.compose([Validators.required, Validators.minLength(4)]));
        this.d_password = new Control('', Validators.compose([Validators.required, Validators.minLength(4), PasswordValidator.validate]));
        this.d_app_icon_name = new Control('', Validators.compose([Validators.required, Validators.minLength(3)]));
        this.d_client_name = new Control('', Validators.compose([Validators.required, Validators.minLength(3)]));
        this.d_client_email = new Control('', Validators.compose([Validators.required, EmailValidator.validate]));
        this.d_client_phone = new Control('', Validators.compose([Validators.minLength(10), Validators.maxLength(12)]));
        this.d_label = new Control('', Validators.compose([Validators.minLength(3), AlphaValidator.validate]));
        this.d_ios_app_store_url = new Control('', Validators.compose([UrlValidator.validate]));
        this.d_ios_app_store_id = new Control('', Validators.compose([Validators.minLength(3)]));
        this.d_google_play_store_url = new Control('', Validators.compose([UrlValidator.validate]));
        this.d_html5_mobile_website_url = new Control('', Validators.compose([UrlValidator.validate]));


        this.duplicateForm = this.fb.group({
            'app_name': this.d_app_name,
            'app_code': this.d_app_code,
            'username': this.d_username,
            'password': this.d_password,
            'app_icon_name': this.d_app_icon_name,
            'client_name': this.d_client_name,
            'client_email': this.d_client_email,
            'client_phone': this.d_client_phone,
            'ios_app_store_url': this.d_ios_app_store_url,
            'label': this.d_label,
            'ios_app_store_id': this.d_ios_app_store_id,
            'google_play_store_url': this.d_google_play_store_url,
            'html5_mobile_website_url': this.d_html5_mobile_website_url

        });
        //var of select
        this.categories = [];
        this.categories.push({ label: 'All Category', value: 'Category' });
        this.categories.push({ label: 'Category 1', value: 'Category 1' });
        this.categories.push({ label: 'Category 2', value: 'Category 2' });
        this.categories.push({ label: 'Category 3', value: 'Category 3' });
        this.categories.push({ label: 'Category 4', value: 'Category 4' });
        this.app = [];
        this.app.push({ label: 'All App', value: 'AllApps' });
        this.app.push({ label: 'Published', value: 'Published' });
        this.app.push({ label: 'UnPublished', value: 'UnPublished' });

        this.count = [];
        this.count.push({ label: '10', value: 10 });
        this.count.push({ label: '20', value: 20 });
        this.count.push({ label: '30', value: 30 });
    }

    ngOnInit() {
        //var of form 
        this.app_name = this.form.controls['app_name'];
        this.app_code = this.form.controls['app_code'];
        this.app_icon_name = this.form.controls['app_icon_name'];
        this.username = this.form.controls['username'];
        this.password = this.form.controls['password'];
        this.client_name = this.form.controls['client_name'];
        this.client_email = this.form.controls['client_email'];
        this.client_phone = this.form.controls['client_phone'];
        this.label = this.form.controls['label'];
        this.ios_app_store_url = this.form.controls['ios_app_store_url'];
        this.ios_app_store_id = this.form.controls['ios_app_store_id'];
        this.google_play_store_url = this.form.controls['google_play_store_url'];
        this.html5_mobile_website_url = this.form.controls['html5_mobile_website_url'];

        this.getAppView();
    }

    public getAppView(): void {
        this.showLoader = true;
        this.dataService.getData(this._getAppUrl + '/' + this.currentPage + '/' + this.itemsPerPage + this.queryString).subscribe(list => {
            // Laravel's paginator gives data in data key of the response.
            // So we have to retrieve it like list.data.data
            this.list = list.data.data;
            this.totalItems = list.data.total;
            this.checkAll = false;
            this.showLoader = false;
            this.refreshSelectedApps();
        });
    }

    getAppInfo(appInfo: AppInfo) {
        this.appData = appInfo;
    }

    getAppData(id) {
        this.appId = id;
        this.dataService.getData(this._getAppInfo + '/' + id).subscribe(
            appInfo => {
                this.appInfo = appInfo.data;
                console.log('res: before :' + appInfo + JSON.stringify(appInfo));
                console.log('res: before data :' + appInfo.data + JSON.stringify(appInfo.data));
                console.log('appIfo data: before :' + this.appInfo);
                appInfo.data.apple_user_name = appInfo.data.apple_user_name ? appInfo.data.apple_user_name : "";
                appInfo.data.apple_password = appInfo.data.apple_password ? appInfo.data.apple_password : "";
                appInfo.data.apple_dev_name = appInfo.data.apple_dev_name ? appInfo.data.apple_dev_name : "";
                appInfo.data.push_publish_email = appInfo.data.push_publish_email ? appInfo.data.push_publish_email : "";
                this.appBundleId = appInfo.appBundleId.replace("{{appCode}}", "" + appInfo.data.app_code + "");
                this.getAppInfo(this.appInfo);
            });
    }

    public onSubmit(values: Object): void {
        console.log('value to submit: ' + values);
        this.submitted = true;
        if (this.form.valid) {
            console.log("Form validation successful");
            this.createApp(values);

        }
        if (this.duplicateForm.valid) {
            console.log("app validation successful");
            this.appUpdate();

        }
        if (this.createDuplicateForm.valid) {
            console.log("duplicateapp validation successful");
            this.createDuplicateApp(values);
        }
    }

    createApp(values) {
        this.isDelayedRunning = true;
        this.dataService.postData(this._appAddUrl, values)
            .subscribe(res => {
                console.log("AddApp:" + JSON.stringify(res));
                this.isDelayedRunning = false;
                if (res.success === true) {
                    console.log("App added successfully");
                    this.page.showSuccess(res.message);
                    this.display2 = false;
                    this.getAppView();
                    this.refreshAppInfo();
                }
                else {
                    console.log("Error adding app");
                    this.page.showError(res.message);
                }
            });
    }

    public refreshAppInfo(): void {
        this.form = this.fb.group({
            'app_name': ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(80),AppNameValidator.validate])],
            'app_code': ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(80), WhitespaceValidator.validate])],
            'app_icon_name': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
            'username': ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(80)])],
            'password': ['', Validators.compose([Validators.required, Validators.minLength(4), PasswordValidator.validate])],
            'client_name': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
            'client_email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
            'client_phone': ['', Validators.compose([Validators.minLength(10), Validators.maxLength(12)])],
            'ios_app_store_url': ['', Validators.compose([UrlValidator.validate])],
            'label': ['', Validators.compose([Validators.minLength(3), AlphaValidator.validate])],
            'ios_app_store_id': [''],
            'google_play_store_url': ['', Validators.compose([UrlValidator.validate])],
            'html5_mobile_website_url': ['', Validators.compose([UrlValidator.validate])],
        });

        this.app_name = this.form.controls['app_name'];
        this.app_code = this.form.controls['app_code'];
        this.app_icon_name = this.form.controls['app_icon_name'];
        this.username = this.form.controls['username'];
        this.password = this.form.controls['password'];
        this.client_name = this.form.controls['client_name'];
        this.client_email = this.form.controls['client_email'];
        this.client_phone = this.form.controls['client_phone'];
        this.label = this.form.controls['label'];
        this.ios_app_store_url = this.form.controls['ios_app_store_url'];
        this.ios_app_store_id = this.form.controls['ios_app_store_id'];
        this.google_play_store_url = this.form.controls['google_play_store_url'];
        this.html5_mobile_website_url = this.form.controls['html5_mobile_website_url'];
    }

    public createDuplicateApp(values: any): void {
        this.isDelayedRunning = true;
        values['source_app_id'] = this.duplicate.id;
        values['app_tab_ids'] = [];
        for (let i in this.checkedAppTabs) {
            if (this.checkedAppTabs[i]) {
                values['app_tab_ids'].push(i);
            }
        }
        this.dataService.postData(this._duplicateAddUrl, values)
            .subscribe(res => {
                console.log("AddApp:" + JSON.stringify(res));
                this.isDelayedRunning = false;
                if (res.success === true) {
                    console.log("Duplicate App added successfully");
                    this.page.showSuccess(res.message);
                    this.getAppView();
                    this.createDuplicateModal = false;
                    console.log(values);
                    this.appService.saveAppTabTitleTranslation(res.appId).subscribe((res) => {
                        if (res.success) {
                            console.log(res.data);
                        }
                    });
                }
                else {
                    console.log("Error adding app");
                    this.page.showError(res.message);
                }
            });
    }


    appUpdate() {
        this.isDelayedRunning = true;
        this.dataService.postData(this._appUpdateUrl + this.appData.id, this.appData)
            .subscribe(res => {
                console.log("Submitted Data" + JSON.stringify(res));
                this.isDelayedRunning = false;
                if (res.success === true) {
                    this.getAppView();
                    this.page.showSuccess(res.message);
                    this.duplicateModal = false;
                }
                else {
                    console.log("Error Updating App");
                    this.page.showError(res.message);
                }
            });
    }

    public showDeleteConfirmDialog(): void {
        if (this.selectedApps.length > 0 && this.selectedApps.indexOf(true) !== -1) {
            // this.deleteConfirmDialogDisplay = true;
            var yes = window.confirm("Do you really want to delete app? ");
            if (yes) {
                this.deleteApps();
            }
        }
    }

    public deleteApps(): void {
        let ids: any[] = [];
        for (let i in this.selectedApps) {
            if (this.selectedApps[i]) {
                ids.push(i);
            }
        }
        this.dataService.postData(this._appDeleteURL, { id: ids }).subscribe(res => {
            this.deleteConfirmDialogDisplay = false;
            if (res.success) {
                this.getAppView();
                this.selectedApps = [];
                this.page.showSuccess(res.message);
            } else {
                this.page.showError(res.message);
            }
        });
    }

    public refreshSelectedApps(): void {
        this.selectedApps = [];
    }

    public setItemsPerPage(perPage: number): void {
        this.itemsPerPage = perPage;
        this.getAppView();
    }

    public pageChanged(event: any): void {
        this.currentPage = event.page;
        this.getAppView();
    }

    public searchApp(): void {
        this.getQueryString();
        this.getAppView();
    }

    public getQueryString(): void {
        let queryString = '?';
        for (let i in this.appSearch) {
            if (this.appSearch.hasOwnProperty(i) && this.appSearch[i] != '') {
                queryString += encodeURIComponent("search[" + i + "]") + "=" + encodeURIComponent(this.appSearch[i]) + "&";
            }
        }
        this.queryString = queryString;
    }

    public onCheckAllChange(): void {
        this.refreshSelectedApps();
        // ATTENTION FUTURE ISSUE RESOLVER: Angular prioritizes click event over ngModel, so checkAll
        // gets updated with the latest value 'after' the execution of this function. That's why
        // there's a '!' symbol in the condition below. So if Angular makes any changes in the next
        // release, you might have to remove the '!' symbol. You're welcome.
        if (!this.checkAll) {
            for (let i in this.list) {
                this.selectedApps[this.list[i].id] = true;
            }
        }
    }

    public refreshApps() {
        this.queryString = '';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.appSearch.title = '';
        this.appSearch.publish_status = 'AllApps';
        this.selectedCount = 10;
        this.getAppView();
    }

    public showDuplicateDialog(id: number): void {
        this.appDropdown = [];
        Observable.forkJoin(
            this.appService.getAllAppTabs(id),
            this.appService.getAllAppList()
        ).subscribe(res => {
            if (res[0].success && res[1].success) {
                this.duplicate.appTabs = res[0].data;
                for (let app of res[1].data) {
                    this.appDropdown.push({ label: app.app_name, value: app.id });
                }
                this.duplicate.id = id;
                this.createDuplicateModal = true;
                this.page.onDialogOpen();
            } else {
                this.page.showError('Server error occurred');
            }
        });
    }

    public onAppChange(): void {
        this.isDelayedRunning = true;
        this.appService.getAllAppTabs(this.duplicate.id).subscribe(res => {
            if (res.success) {
                this.checkAllAppTabs = false;
                this.checkedAppTabs = [];
                this.duplicate.appTabs = res.data;
                this.isDelayedRunning = false;
            } else {
                this.page.showError(res.message);
            }
        });
    }

    public onCheckAllTabsChange(): void {
        this.checkedAppTabs = [];
        if (!this.checkAllAppTabs) {
            for (let tab of this.duplicate.appTabs) {
                this.checkedAppTabs[tab.id] = true;
            }
        }
    }

    public onTabCheckChange(): void {
        if (this.checkAllAppTabs) {
            this.checkAllAppTabs = false;
        }
    }
    jsonPipe(code): void {
        console.log(code);
        console.log(code.errors.validateWhitespace);
    }

    public onCheckTabChange(checkedTabValue, checkedTab): void {
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.list.forEach((list) => {
                console.log('list', list);
                console.log('checkedTab', checkedTab);
                if (list.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedApps[list.id]) {
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

    public onPublishFormSubmit(values: Object): void {
        console.log('value to submit: ', values);

        if (this.appPublishForm.valid) {
            console.log("appPublishForm validation successful");
            this.updateAppPublishInfo(values);
        }
    }

    public updateAppPublishInfo(values: any) {
        this.ispushPublishModalRunning = true;
        this.appService.updateAppPublishInfo(this.appId, values).subscribe((res) => {
            if (res.success) {
                this.ispushPublishModalRunning = false;
                this.page.showSuccess(res.message);
                console.log("res", res);
            } else {
                this.page.showError(res.message);
            }
        });
    }
    public getPushUploadAppData(id: number) {
        this.ispushPublishModalRunning = true;
        this.appService.getAppUploadStatus(id).subscribe((res) => {
            if (res.success) {
                this.appPublishLog = res.appPublishLog;
            }
            this.ispushPublishModalRunning = false;
        })
    }
}
