import { Component, ViewEncapsulation, Input, Output, EventEmitter, HostListener, ChangeDetectorRef } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, TimepickerComponent } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, Carousel, TabView, TabPanel, Calendar, SelectItem, MultiSelect, RadioButton } from 'primeng/primeng';
import { PageService, GridDataService } from '../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { AppState } from '../../app.state';
import { PushNotificationService } from './push-notification.service';
import { TimeZone, PushNotification, send_on, send_now } from '../../theme/interfaces';
import { DatePipe } from '../../pipes/date-format.pipe';
import { PushNotiLocationEditor } from '../push-noti-location-editor';
import { appAccessTypeSingle, appAccessTypeMultiple } from "../../theme/interfaces/common-interfaces";

var firebase = require("firebase");
var moment = require('moment/moment');
declare var FB: any;

@Component({
    selector: 'push-notification',
    pipes: [DatePipe],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, TAB_DIRECTIVES, PushNotiLocationEditor, Calendar, RadioButton, TimepickerComponent, DROPDOWN_DIRECTIVES, MultiSelect, TabView, TabPanel, Dialog],
    template: require('./push-notification.component.html'),
    providers: [PushNotificationService]
})

export class PushNotificationComponent {
    @Input() state: boolean = false;
    public userGroups = [];
    public users = [];
    public subscriptionList = [];
    public contentType = [];
    public notiAudience = [];
    public sentMessage = [];
    public scheduledMsg = [];
    public tabs = [];
    public tabList = [];
    public activeDate: Date = null;
    public activeTime: Date = new Date();
    public appId: any;
    public webUrl: boolean = false;
    public msg: string;
    public msg1: string;
    public firstTabActive: boolean = true;
    public error: boolean = false;
    public success: boolean = true;
    public showHistory: boolean = false;
    public loader: boolean = false;
    public tabactive: boolean = false;
    public tabinactive: boolean = false;
    public ismeridian: boolean = false;
    public tab: boolean = false;
    public charCount: any = 1500;
    public androidCount: any;
    public iphoneCount: any;
    public scheduleMsg: any = 0;
    private SEND_ON: number = send_on;
    private SEND_NOW: number = send_now;
    public sentMsg: any = 0;
    public defaultTimezone: string;
    public send_date: Date = null;
    public send_time: Date = new Date();
    public timezone: TimeZone[] = [];
    public timezoneSelect = [];
    public userGroupSelect = [];
    public currentDate: Date = new Date();
    // public subscriptionSelect = [];
    public circle = [];
    public settings: any = {};
    public pushNotiData: PushNotification = new PushNotification();
    private ACCESS_TYPE_SINGLE: number = appAccessTypeSingle;
    private ACCESS_TYPE_MULTIPLE: number = appAccessTypeMultiple;
    public customerSavedZone: number = null;
    public isFacebookTokenAvailable: boolean = false;
    public isTwitterTokenAvailable: boolean = false;

    public startTimeHour = [];
    public startTimeMin = [];
    public meridians = [];

    public activeUntilHour: number = 1;
    public activeUntilMin: number = 0;
    public activeUntilMeridian: number = 1;

    public sendOnHour: number = 1;
    public sendOnMin: number = 0;
    public sendOnMeridian: number = 1;

    constructor(private service: PushNotificationService,
        private dataService: GridDataService,
        private pageService: PageService,
        private appState: AppState,
        private changeDetectorRef: ChangeDetectorRef) {
        // this.appId = appState.dataAppId;
        this.appId = parseInt(sessionStorage.getItem('appId'));
        this.contentType.push(
            { label: 'None', value: 0 },
            { label: 'Website URL', value: 1 },
            { label: 'Link to a specific tab', value: 2 }
        );
        this.notiAudience.push(
            { label: 'All Users', value: 1 },
            { label: 'Specific Area Users', value: 2 }
        );
        this.circle.push(
            { label: 'Point', value: 1 },
            { label: 'Geo-fence', value: 2 }
        );
        for (let j = 1; j <= 12; j++) {
            this.startTimeHour.push({ label: j, value: j });
        }
        for (let k = 0; k <= 55; k += 5) {
            this.startTimeMin.push({ label: k, value: k });
        }
        this.meridians.push(
            { label: 'AM', value: 1 },
            { label: 'PM', value: 2 }
        );
        this.pageService.getPushNotiOpenStatus().subscribe((res) => {
            if (res) {
                this.getLocationByAppId();
            }
        })

    }

    public ngOnInit(): void {
        this.getTabs();
        this.getInitData();
        this.getHistory();
    }

    public getInitData(): void {
        this.loader = true;
        this.service.getInitData(this.appId).subscribe(res => {
            this.loader = false;
            if (res.success) {
                this.timezone = res.data.timezoneList;
                this.androidCount = res.data.androidCount;
                this.iphoneCount = res.data.iphoneCount;
                this.userGroups = res.data.userGroups;
                this.subscriptionList = res.data.subscriptionList;
                this.isFacebookTokenAvailable = res.data.isFacebookTokenAvailable;
                this.isTwitterTokenAvailable = res.data.isTwitterTokenAvailable;
                if (res.data.settings) {
                    this.settings = res.data.settings;
                    this.dataService.subscription = this.settings.subscription_service;
                }
                if (res.data.timeSettings) {
                    this.customerSavedZone = res.data.timeSettings.time_zone;
                }
                let tim = new Date().toString();
                let ctime = tim.split(" ");
                this.defaultTimezone = ctime[5];
                let myZone = this.defaultTimezone.split("");
                let newZone = myZone[0] + myZone[1] + myZone[2] + myZone[3] + myZone[4] + myZone[5] + ':' + myZone[6] + myZone[7];
                let count = 0;
                for (let item of res.data.timezoneList) {
                    this.timezoneSelect.push({ label: item.name, value: item.id })
                    if (this.customerSavedZone) {
                        this.pushNotiData.timezone_id = this.customerSavedZone;
                    } else {
                        if (newZone == item.offset_name) {
                            count++;
                            if (count == 1) {
                                this.pushNotiData.timezone_id = item.id;
                            }
                        }
                    }
                }
                this.dataService.userGroupSelect = [];
                this.dataService.userGroupSelect = [{ label: 'None', value: 0 }];
                for (let item of res.data.userGroups) {
                    this.dataService.userGroupSelect.push({ label: item.group_name, value: item.id })
                }
                this.dataService.subscriptionSelect = [];
                for (let item of res.data.subscriptionList) {
                    this.dataService.subscriptionSelect.push({ label: item.subscription_name, value: item.id });
                }
                this.dataService.users = [];
                for (let item of res.data.usersList) {
                    this.dataService.users.push({ label: item.user_name, value: item.id });
                }
            } else {
                console.log('no data found');
            }
        });
    }

    public getTabs(): void {
        this.service.getTabs(this.appId).subscribe(res => {
            if (res.success) {
                this.tabList = res.data;
                let membership: any;
                for (let item of res.data) {
                    this.tabs.push({ label: item.title, value: item.id })
                    if (item.tab_func_code == 'inbox') {
                        let index = 0;
                        index = this.tabs.indexOf(item.id);
                        this.tabs.splice(index, 1);
                    }
                    if (item.tab_func_code == 'membership') {
                        if (item.settings) {
                            membership = JSON.parse(item.settings);
                            if (membership.member_login && (membership.type == this.ACCESS_TYPE_MULTIPLE)) {
                                this.dataService.membershipLogin = membership.member_login;
                            }
                        }
                    }
                }
            } else {
                console.log('no data found');
            }
        });
    }

    public onDialogHide(): void {
        PageService.notiDialog = false;
        this.pushNotiData = new PushNotification();
        this.charCount = 1500;
    }

    public onContentClick(event: any): void {
        if (event.value == 1) {
            this.webUrl = true;
            this.tab = false;
        }
        if (event.value == 2) {
            this.tab = true;
            this.webUrl = false;
        }
    }

    public onAreaChanged(event): void {
        this.pushNotiData.m_lat = event.lat;
        this.pushNotiData.m_long = event.long;
        this.pushNotiData.span = event.span;
        this.pushNotiData.span_type = event.spanType;
        this.pushNotiData.app_id = this.appId;
        this.service.getLocatedAppUsers(this.pushNotiData).subscribe(res => {
            if (res.success) {
                this.androidCount = res.data.androidCount;
                this.iphoneCount = res.data.iphoneCount;
            } else {
                console.log("Get located app users failed:", res.message);
            }
        });
        console.log(this.pushNotiData);
    }

    public onSave(): void {
        this.loader = true;
        this.pushNotiData.app_id = this.appId;

        if ((this.activeDate == null) || (!this.activeDate)) {
            var mactivedate = null;
        } else {
            var mactivedate = moment(this.activeDate).format('YYYY-MM-DD');
        }
        if ((this.send_date == null) || (!this.send_date)) {
            var msenddate = null;
        } else {
            var msenddate = moment(this.send_date).format('YYYY-MM-DD');
        }
        if (this.activeDate == null) {
            this.pushNotiData.active = null;
        } else {
            let mactivetime: string = this.convertTo24HourFormat(this.activeUntilHour, this.activeUntilMin, this.activeUntilMeridian);
            this.pushNotiData.active = mactivedate + " " + mactivetime;
        }

        if (this.send_date == null) {
            this.pushNotiData.send_on_date = null;
        } else {
            let msendtime: string = this.convertTo24HourFormat(this.sendOnHour, this.sendOnMin, this.sendOnMeridian);
            this.pushNotiData.send_on_date = msenddate + " " + msendtime;
        }
        this.pushNotiData.android_type = this.pushNotiData.android_type ? 1 : 0;
        this.pushNotiData.iphone_type = this.pushNotiData.iphone_type ? 1 : 0;
        this.pushNotiData.facebook_type = this.pushNotiData.facebook_type ? 1 : 0;
        this.pushNotiData.twitter_type = this.pushNotiData.twitter_type ? 1 : 0;
        this.service.save(this.pushNotiData).subscribe((res) => {
            this.loader = false;
            if (res.success) {
                this.getHistory();
                this.getInitData();
                this.pageService.showSuccess('Notification sent successfully.');
                this.tabactive = false;
                this.tabinactive = true;
                this.activeDate = null;
                this.activeTime = null;
                this.send_date = null;
                this.send_time = null;
                this.charCount = 1500;
                this.activeUntilHour = 1;
                this.activeUntilMin = 0;
                this.activeUntilMeridian = 1;
                this.sendOnHour = 1;
                this.sendOnMin = 0;
                this.sendOnMeridian = 1;
                this.pushNotiData = new PushNotification();
                this.onTabClick();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onUpClick(): void {
        this.showHistory = true;
    }
    public onDownClick(): void {
        this.showHistory = false;
    }

    public alertTab(): void {
        if (this.pushNotiData.message == null || this.pushNotiData.message == '') {
            this.error = true;
            this.success = false;
        } else if (this.pushNotiData.android_type == 0 && this.pushNotiData.iphone_type == 0 && this.pushNotiData.facebook_type == 0 && this.pushNotiData.twitter_type == 0) {
            this.error = true;
            this.success = false;
        } else {
            this.error = false;
            this.success = true;
        }
    }

    public onGroupSelect(event: any, groupId: number): void {
        this.pushNotiData.user_id = [];
        this.service.getUsers(this.appId, groupId).subscribe(res => {
            if (res.success) {
                for (let item of res.data.users) {
                    this.pushNotiData.user_id.push(item.id);
                }
                console.log(this.pushNotiData.user_id);
            }
        });
    }

    public onTabClick(): void {
        this.firstTabActive = false;
        setTimeout(() => {
            this.firstTabActive = true;
        }, 0);
    }

    public onDeleteNoti(id: number): void {
        if (!confirm("Are you sure you want to delete this item ?")) {
            return;
        }
        this.loader = true;
        this.service.deleteNoti([id]).subscribe(res => {
            if (res.success) {
                this.loader = false;
                this.pageService.showSuccess(res.message);
                this.getHistory();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public getHistory(): void {
        this.loader = true;
        this.service.getHistory(this.appId).subscribe(res => {
            this.loader = false;
            if (res.success) {
                if (res.data.sentNotiList) {
                    this.sentMessage = res.data.sentNotiList;
                }
                if (res.data.scheduledNotiList) {
                    this.scheduledMsg = res.data.scheduledNotiList;
                }
                this.sentMsg = res.data.sentMsg;
                this.scheduleMsg = res.data.scheduleMsg;
            } else {
                console.log('no data found');
            }
        });
    }

    public onCharCount(): void {
        let lng = this.pushNotiData.message
        if (lng) {
            let lngd = (lng.length) + 1;
            this.charCount = 1500 - lngd;
        }
    }


    public onFacebookTargetClick(): void {
        if (this.pushNotiData.facebook_type || this.isFacebookTokenAvailable) {
            return;
        }
        FB.getLoginStatus(response => {
            console.log("Facebook login response:", response);
            if (response.status === 'connected') {
                this.onFacebookLogin(response);
            } else {
                this.pushNotiData.facebook_type = 0;
                this.changeDetectorRef.detectChanges();
                FB.login(response => this.onFacebookLogin(response), {
                    scope: "publish_actions",
                    return_scopes: true
                });
            }
        }, true);
    }

    private onFacebookLogin(response: any): void {
        if (response.status !== 'connected') {
            return;
        }
        this.service.saveFacebookToken(response.authResponse.accessToken, this.appId).subscribe(res => {
            if (res.success) {
                console.log("Facebook token saved");
                this.isFacebookTokenAvailable = true;
                this.pushNotiData.facebook_type = 1;
                this.changeDetectorRef.detectChanges();
            } else {
                console.log("Error while saving facebook token:", res.message);
            }
        });
    }

    public onFacebookDisconnect(): void {
        PageService.showLoader();
        this.service.deleteFacebookToken(this.appId).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                console.log("Facebook token deleted");
                this.isFacebookTokenAvailable = false;
                this.pushNotiData.facebook_type = 0;
                this.changeDetectorRef.detectChanges();
            } else {
                console.log("Error while deleting facebook token:", res.message);
            }
        });
    }

    private convertTo24HourFormat(hour: number, minute: number, meridian: number): string {
        if (meridian == 1 && hour == 12) {
            hour = 0;
        } else if (meridian == 2 && hour != 12) {
            hour += 12;
        }
        return hour.toString() + ":" + minute.toString();
    }

    public onTwitterTargetClick(): void {
        if (this.pushNotiData.twitter_type || this.isTwitterTokenAvailable) {
            return;
        }
        this.pushNotiData.twitter_type = 0;
        this.changeDetectorRef.detectChanges();
        let provider = new firebase.auth.TwitterAuthProvider();
        firebase.auth().signInWithPopup(provider).then(response => {
            console.log("Twitter login successful", response);
            this.onTwitterLoginSuccess(response);
        }).catch(error => {
            console.log("Twitter login failed", error);
            if (error.code === "auth/popup-closed-by-user") {
                this.pageService.showWarning("Please complete the Twitter connection process to post your message to Twitter.", 60000);
            } else {
                this.pageService.showWarning("Sorry! Could not connect to Twitter. Please try again.", 60000);
            }
        });
    }

    public onTwitterLoginSuccess(response: any): void {
        this.service.saveTwitterTokenAndSecret(response.credential.accessToken, response.credential.secret, this.appId).subscribe(res => {
            if (res.success) {
                console.log("Twitter token and secret saved");
                this.isTwitterTokenAvailable = true;
                this.pushNotiData.twitter_type = 1;
                this.changeDetectorRef.detectChanges();
            } else {
                console.log("Error while saving twitter token and secret:", res.message);
            }
        });
    }

    public onTwitterDisconnect(): void {
        PageService.showLoader();
        this.service.deleteTwitterTokenAndSecret(this.appId).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                console.log("Twitter token and secret deleted");
                this.isTwitterTokenAvailable = false;
                this.pushNotiData.twitter_type = 0;
                this.changeDetectorRef.detectChanges();
            } else {
                console.log("Error while deleting twitter token and secret:", res.message);
            }
        });
    }
    // <a href="{{pushNotiData.website_url}}" target="_blank">

    public isUrl(url: string): boolean {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regexp.test(url);
    }
    public onClickPreview(): void {
        if (this.isUrl(this.pushNotiData.website_url)) {
            window.open(this.pushNotiData.website_url, '_blank');
        } else {
            this.pageService.showError('Please enter a valid url');
        }
    }

    public onSpanTypeChanged(event): void {
        this.pushNotiData.span = event.span;
        this.pushNotiData.span_type = event.spanType;
    }

    public getLocationByAppId(): void {
        this.service.getLocationByAppId(this.appId).subscribe((res) => {
            if (res.success) {
                if (res.data && res.data.contactList.length) {
                    this.pushNotiData.m_lat = +res.data.contactList[0].m_lat;
                    this.pushNotiData.m_long = +res.data.contactList[0].m_long;
                }
            }
        });
    }
}