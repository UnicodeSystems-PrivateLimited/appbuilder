import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { PageService, GridDataService } from '../../theme/services';
import { AppState } from '../../app.state';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { CSettingService } from './c-settings.service';
import { MembershipTabService } from '../settings/tabs-content/tab-functions/membership-tab/membership-tab.service';
import { Dropdown, RadioButton, InputSwitch } from 'primeng/primeng';
import { CustomerSetting, AppConfigSetting, AppConfigScreenSetting, SaveMembershipSettings } from '../../theme/interfaces';
import { ColorPickerDirective } from "../../color-picker/color-picker.directive";
import { Dialog, SelectItem } from 'primeng/primeng';
import { Tab, MembershipSettings, SingleMemberLoginDetails, OnSubmitSettingsData, MultipleUserList, GroupList, appAccessTypeSingle, appAccessTypeMultiple, AppTabs, UserData, GuestData, SingleUserTabAccessData, OnSubmitInviteEmailTemplateData, InviteUserFormData } from "../../theme/interfaces/common-interfaces";
import { ArrayElementCounterPipe } from '../../pipes/array-element-counter-pipe';
import { UserFilterPipe } from '../../pipes/user-filter.pipe';
import { MobileViewService } from '../../services/mobile-view.service';
import { ThumbnailFileReader } from '../../components';
import { SettingsService } from '../../pages/settings/settings.service';

declare var $: any;

@Component({
    selector: 'c-settings',
    pipes: [ArrayElementCounterPipe, UserFilterPipe],
    directives: [Dialog, ColorPickerDirective, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, Dropdown, RadioButton, InputSwitch, ThumbnailFileReader],
    encapsulation: ViewEncapsulation.None,
    styles: [require('../settings/settings.scss')],
    template: require('./c-settings.component.html'),
    providers: [GridDataService, PageService, CSettingService, MembershipTabService, MobileViewService]
})


export class CSettings {

    public timezoneSelect = [];
    public appId: number = null;
    public tabId: number = null;
    public loginMulorSing: number = 1;
    public settingAppconfigData: CustomerSetting = new CustomerSetting();
    public appConfigSetting: AppConfigSetting = new AppConfigSetting();
    public appConfigScreenSetting: AppConfigScreenSetting = new AppConfigScreenSetting();
    public appMembershipData: MembershipSettings = new MembershipSettings();
    public disableSaveButton: boolean = false;
    public checked1: boolean = false;
    public settings_guest_login: boolean = false;
    public addConfirmDialogDisplay: boolean = false;
    public mLview: boolean = true;
    public loginMveiw: boolean = true;
    public memberChange: boolean = true;
    public memberLChange: boolean = false;
    public settings: MembershipSettings = new MembershipSettings();
    public singleMemberLoginDetails: SingleMemberLoginDetails = new SingleMemberLoginDetails();
    public onSubmitSettingsData: OnSubmitSettingsData = new OnSubmitSettingsData();
    public multipleUserData: MultipleUserList = new MultipleUserList();
    public multipleUserList: MultipleUserList[] = [];
    public checkAllUser: boolean = false;
    public selectedUser: boolean[] = [];
    public groupData: GroupList = new GroupList();
    public groupList: GroupList[] = [];
    public addSaveButtonHide: boolean = false;
    public guestData: GuestData = new GuestData();
    public appTabs: AppTabs[] = [];
    public selectedGuestTabs: boolean[] = [];
    public groups: any[] = [];
    public checkAllGuestTabs: boolean = false;
    public checkAllSingleLoginTabs: boolean = false;
    public selectedSingleLoginTabs: boolean[] = [];
    public singleUserTabAccessData: SingleUserTabAccessData = new SingleUserTabAccessData();
    public groupHeader: string = null;
    public checkAllGroupTabs: boolean = false;
    public selectedGroupTabs: boolean[] = [];
    public checkAllGroup: boolean = false;
    public groupSubmitButton: string = null;
    public checkGrpTrue: boolean = false;
    public selectedGroup: boolean[] = [];
    public userHeader: string = null;
    public userData: UserData = new UserData();
    public checkAllUserTabs: boolean = false;
    public selectedUserTabs: boolean[] = [];
    public userSubmitButton: string = null;
    public checkTrue: boolean = false;
    public editorView: any = null;
    public emailInviteFormDialogDisplay: boolean = false;
    public inviteEmailTemplate: string = "";
    public inviteEmailTemplateData: OnSubmitInviteEmailTemplateData = new OnSubmitInviteEmailTemplateData();
    public inviteUserFormData: InviteUserFormData = new InviteUserFormData();
    public errorMsg: string = null;
    public inviteUserCSV: any = null;
    public showError: boolean = false;
    public saveMembershipSettings: SaveMembershipSettings = new SaveMembershipSettings();
    public addImages: boolean = false;
    public activeYourImagesTab: boolean = false;
    public importImageIds: any = [];
    public userImages: any = [];
    public appData: any = {};//used for background images
    public homeScreenSliderData: any = [];//used for background images
    public categoryList: SelectItem[] = [];
    public libraryImages: any = [];
    public userImageInfo: any = [];
    public bgAppTabs: any = [];
    public targetedImageId: number = null;
    public phoneTabActive: boolean = true;
    public tabletTabActive: boolean = false;
    public image: File = null;
    public userSearch: string;
    public deviceType: number = 1;
    public tabletSettingsAsPhone: boolean = false;
    public bgImageSettings: typeof SettingsService = SettingsService;
    private BGSETTINGUNCHECK: number = 0;
    private BGSETTINGCHECK: number = 1;

    private ACCESS_TYPE_SINGLE: number = appAccessTypeSingle;
    private ACCESS_TYPE_MULTIPLE: number = appAccessTypeMultiple;

    // ------------------- DISPLAY CONTROL ----------------------------
    public showLoader: boolean = false;
    public guestFormDialogDisplay: boolean = false;
    public singleLoginTabAccessFormDialogDisplay: boolean = false;
    public groupFormDialogDisplay: boolean = false;
    public memberAddUserForm: boolean = false;
    public userFormDialogDisplay: boolean = false;
    public showEditor: boolean = false;
    public inviteUserFormDialogDisplay: boolean = false;
    public defaultTimezone: string;
    public showMainLoader: boolean = false;
    public appCode: any;

    constructor(
        protected appState: AppState,
        private service: CSettingService,
        private pageService: PageService,
        private membershipService: MembershipTabService,
        private dataService: GridDataService,
        public mobileViewService: MobileViewService
    ) {
        PageService.showpushNotificationButton = false;
        this.appId = +sessionStorage.getItem('appId');
        this.appCode = sessionStorage.getItem('appCode');
        this.getInitData();

    }

    public getInitData(): void {
        this.showMainLoader = true;
        this.service.getInitData(this.appId).subscribe((res) => {
            if (res.success) {

                this.tabletSettingsAsPhone = SettingsService.tabBgImageSetting.flag_tablet_img;
                if (res['settingData'] && res['settingData']['config_data']) {
                    this.appConfigSetting = res['settingData']['config_data'];
                }
                if (res['settingData'] && res['settingData']['app_screen_config_data']) {
                    this.appConfigScreenSetting = res['settingData']['app_screen_config_data'];
                    if (this.appConfigScreenSetting.privacy_policy == 1) {
                        let url = window.location.origin + '/api/privacy-policy?app_code='+this.appCode;
                        this.appConfigScreenSetting.privacy_policy_url = url;
                    }
                }
                if (res['membershipData'] && res['membershipData']['settings']) {
                    this.tabId = res['membershipData']['id'];
                    this.appMembershipData = JSON.parse(res['membershipData']['settings']);
                    this.mLview = !this.appMembershipData.member_login;
                    this.loginMveiw = !this.appMembershipData.guest_login;
                }
                if (res['singleUserData']) {
                    this.singleMemberLoginDetails = res['singleUserData'];
                }
                if (res['multipleUserList']) {
                    this.multipleUserList = res['multipleUserList'];
                }
                if (res['guestUser']) {
                    this.guestData = res['guestUser'];
                }
                this.appTabs = res['appTabs'];
                this.groupList = res['groupList'];
                let tim = new Date().toString();
                let ctime = tim.split(" ");
                this.defaultTimezone = ctime[5];
                let myZone = this.defaultTimezone.split("");
                let newZone = myZone[0] + myZone[1] + myZone[2] + myZone[3] + myZone[4] + myZone[5] + ':' + myZone[6] + myZone[7];
                let count = 0;
                for (let item of res['timezoneList']) {
                    this.timezoneSelect.push({ label: item.name, value: item.id })
                    if (newZone === item.offset_name) {
                        count++;
                        if (count == 1 && !res['settingData']) {
                            this.appConfigSetting.time_zone = item.id;
                        }
                    }
                }
                 
            }
          
            this.showMainLoader = false;
        });
    }

    public saveSetting(): void {
        this.settingAppconfigData.app_id = this.appId;
        this.settingAppconfigData.config_data = this.appConfigSetting;
        this.settingAppconfigData.app_screen_config_data = this.appConfigScreenSetting;
        this.settingAppconfigData.app_membership_settings_data = this.appMembershipData;
        this.settingAppconfigData.single_member_login_details = this.singleMemberLoginDetails;
        this.disableSaveButton = true;
         if (this.appConfigScreenSetting.privacy_policy == 1) {
            let url = window.location.origin + '/api/privacy-policy?app_code='+this.appCode;
            this.appConfigScreenSetting.privacy_policy_url = url;
        }
        this.service.saveAppConfigSetting(this.settingAppconfigData).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
            this.disableSaveButton = false;
        });
    }

    public memberDisplayWrapper(): void {
        this.appMembershipData.member_login = !this.appMembershipData.member_login;
        this.saveMembershipSettings.app_id = this.appId;
        this.saveMembershipSettings.membsership_settings = this.appMembershipData;
        this.service.saveMembershipSetting(this.saveMembershipSettings).subscribe((res) => {
            if (res.success) {
                this.mLview = !this.mLview;
                this.memberChange = true;
                this.tabId = res.data;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }
    public onChangeMember() {
        if (this.memberChange) {
            this.mLview = !this.mLview;
            this.appMembershipData.member_login = !this.appMembershipData.member_login;
        }
    }
    public onChangeLMember() {
        this.loginMveiw = !this.loginMveiw;
        // if (!this.memberLChange) {
        //     this.loginMveiw = !this.loginMveiw;
        // }
    }

    public onChangePrivacy() {
        console.log(this.appConfigScreenSetting.privacy_policy_url);
        if (this.appConfigScreenSetting.privacy_policy == 1 && !this.appConfigScreenSetting.privacy_policy_url) {
            let url = window.location.origin + '/api/privacy-policy?app_code='+this.appCode;
            this.appConfigScreenSetting.privacy_policy_url = url;
        }
    }

    //Guest Login Functionality
    public showGuestLoginDialog(): void {
        this.showLoader = true;
        this.membershipService.getGuestData(this.tabId).subscribe(res => {
            this.showLoader = false;
            this.groups = [{ label: 'No Group', value: 0 }];
            for (let group of this.groupList) {
                this.groups.push({ label: group.group_name, value: group.id });
            }
            this.refreshSelectedGuestTabs();
            if (res.data.itemData != null) {
                this.guestData = res.data.itemData;
                if (res.data.itemData.tabs_access) {
                    for (let i of res.data.itemData.tabs_access) {
                        this.selectedGuestTabs[i] = true;
                    }
                }
            }

            this.checkAllGuestTabs = true;
            this.appTabs.every((data) => {
                if (typeof this.selectedGuestTabs[data.id] == 'undefined') {
                    this.checkAllGuestTabs = false;
                    return false;
                } else {
                    return true;
                }
            });

            this.guestFormDialogDisplay = true;
            this.pageService.onDialogOpen();
        });
    }

    public refreshSelectedGuestTabs(): void {
        this.selectedGuestTabs = [];
    }

    public onGuestFormSubmit(): void {
        this.showLoader = true;
        this.guestData.tab_id = this.tabId;
        let ids: any[] = [];
        for (let i in this.selectedGuestTabs) {
            if (this.selectedGuestTabs[i]) {
                ids.push(i);
            }
        }
        this.guestData.tabs_access = ids;

        this.membershipService.saveGuestData(this.guestData).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.guestFormDialogDisplay = false;
                this.checkAllGuestTabs = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onGuestCheckTabChange(checkedTabValue, checkedTab): void {
        let flag: boolean = true;
        if (checkedTabValue) {
            // this.checkAllGuestTabs = false;
            flag = false;
        } else {
            this.appTabs.forEach((data) => {
                if (data.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedGuestTabs[data.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAllGuestTabs = flag ? true : false;
    }

    public onCheckAllGuestTabsChange(): void {
        this.refreshSelectedGuestTabs();
        if (!this.checkAllGuestTabs) {
            for (let i in this.appTabs) {
                this.selectedGuestTabs[this.appTabs[i].id] = true;
            }
        }
        else {
            for (let i in this.appTabs) {
                this.selectedGuestTabs[this.appTabs[i].id] = false;
            }
        }
    }

    //Single Login Functionality
    public showSingleLoginTabsAccessDialog(): void {
        this.showLoader = true;
        this.refreshSelectedSingleLoginTabs();
        this.membershipService.getSingleLoginTabsAccessData(this.tabId).subscribe(res => {
            this.showLoader = false;
            if (res.data.itemData != null) {
                if (res.data.itemData.tabs_access) {
                    for (let i of res.data.itemData.tabs_access) {
                        this.selectedSingleLoginTabs[i] = true;
                    }
                }
            }

            this.checkAllSingleLoginTabs = true;
            this.appTabs.every((data) => {
                if (this.selectedSingleLoginTabs[data.id] == undefined) {
                    this.checkAllSingleLoginTabs = false;
                    return false;
                } else {
                    return true;
                }
            });

            this.singleLoginTabAccessFormDialogDisplay = true;
            this.pageService.onDialogOpen();
        });
    }

    public refreshSelectedSingleLoginTabs(): void {
        this.selectedSingleLoginTabs = [];
    }

    public onCheckAllSingleLoginTabsChange(): void {
        this.refreshSelectedSingleLoginTabs();
        if (!this.checkAllSingleLoginTabs) {
            for (let i in this.appTabs) {
                this.selectedSingleLoginTabs[this.appTabs[i].id] = true;
            }
        }
        else {
            for (let i in this.appTabs) {
                this.selectedSingleLoginTabs[this.appTabs[i].id] = false;
            }
        }
    }

    public onsingleLoginTabAccessFormSubmit(): void {
        this.showLoader = true;
        this.singleUserTabAccessData.tab_id = this.tabId;
        let ids: any[] = [];
        for (let i in this.selectedSingleLoginTabs) {
            if (this.selectedSingleLoginTabs[i]) {
                ids.push(i);
            }
        }
        this.singleUserTabAccessData.tabs_access = ids;

        this.membershipService.saveSingleUserTabAccessDataData(this.singleUserTabAccessData).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.singleLoginTabAccessFormDialogDisplay = false;
                this.checkAllSingleLoginTabs = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onSingleLoginCheckTabChange(checkedTabValue, checkedTab): void {
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.appTabs.forEach((data) => {
                if (data.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedSingleLoginTabs[data.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAllSingleLoginTabs = flag ? true : false;
    }

    //Membership Group Functionality
    public getGroupList(): void {
        this.membershipService.getGroupList(this.tabId).subscribe(res => {
            if (res.success) {
                this.groupList = res.data;
                this.checkAllGroup = false;
                this.dataService.userGroupSelect = [];
                this.dataService.userGroupSelect = [{ label: 'None', value: 0 }];
                for (let item of res.data) {
                    this.dataService.userGroupSelect.push({ label: item.group_name, value: item.id })
                }
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public showCreateGroupFormDialog(): void {
        this.groupHeader = 'Add Group';
        this.groupSubmitButton = 'Add';
        this.groupData = new GroupList();
        this.checkAllGroupTabs = false;
        this.selectedGroupTabs = [];
        this.groupFormDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public onCheckAllGroupTabsChange(): void {
        this.refreshSelectedGroupsTabs();
        if (!this.checkAllGroupTabs) {
            for (let i in this.appTabs) {
                this.selectedGroupTabs[this.appTabs[i].id] = true;
            }
        }
        else {
            for (let i in this.appTabs) {
                this.selectedGroupTabs[this.appTabs[i].id] = false;
            }
        }
    }

    public refreshSelectedGroupsTabs(): void {
        this.selectedGroupTabs = [];
    }

    public onGroupFormSubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.groupData.tab_id = this.tabId;
        let ids: any[] = [];
        for (let i in this.selectedGroupTabs) {
            if (this.selectedGroupTabs[i]) {
                ids.push(i);
            }
        }
        this.groupData.tabs_access = ids;

        this.membershipService.saveGroupData(this.groupData).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                this.getGroupList();
                this.pageService.showSuccess(res.message);
                this.groupFormDialogDisplay = false;
                this.checkAllGroupTabs = false;
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public showEditGroupFormDialog(groupId): void {
        this.showLoader = true;
        this.membershipService.getGroupData(groupId).subscribe(res => {
            this.showLoader = false;
            this.groupHeader = 'Edit Group';
            this.groupSubmitButton = 'Save';
            this.groupData = res.data.itemData;
            this.refreshSelectedGroupsTabs();
            if (res.data.itemData.tabs_access) {
                for (let i of res.data.itemData.tabs_access) {
                    this.selectedGroupTabs[i] = true;
                }
            }

            this.checkAllGroupTabs = true;
            this.appTabs.every((data) => {
                if (typeof this.selectedGroupTabs[data.id] == 'undefined') {
                    this.checkAllGroupTabs = false;
                    return false;
                } else {
                    return true;
                }
            });

            this.groupFormDialogDisplay = true;
            this.pageService.onDialogOpen();
        });
    }

    public onGroupCheckTabChange(checkedTabValue, checkedTab): void {
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.appTabs.forEach((data) => {
                if (data.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedGroupTabs[data.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAllGroupTabs = flag ? true : false;
    }

    public onCheckAllGroupChange(): void {
        // this.checkGrpTrue = !this.checkGrpTrue;
        this.refreshSelectedGroups();
        if (!this.checkAllGroup) {
            for (let i in this.groupList) {
                this.selectedGroup[this.groupList[i].id] = true;
            }
            this.checkGrpTrue = true;
        }
        else {
            for (let i in this.groupList) {
                this.selectedGroup[this.groupList[i].id] = false;
            }
            this.checkGrpTrue = false;
        }
    }

    public refreshSelectedGroups(): void {
        this.selectedGroup = [];
    }

    public onGroupDeleteClick(): void {
        if (this.selectedGroup.length > 0 && this.selectedGroup.indexOf(true) !== -1) {
            var yes = window.confirm("Are you sure you want to delete the selected Group ? ");
            if (yes) {
                this.deleteGroup();
            }
        }
    }

    public deleteGroup(): void {
        let ids: any[] = [];
        for (let i in this.selectedGroup) {
            if (this.selectedGroup[i]) {
                ids.push(i);
            }
        }
        this.showLoader = true;
        this.membershipService.deleteGroup(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkGrpTrue = false;
                this.getGroupList();
                this.getMultipleUserList();
                this.pageService.showSuccess(res.message);
                this.groupList.forEach((item, index) => {
                    if (item.id === this.selectedGroup['id']) {
                        this.groupList.splice(index, 1);
                    }
                });
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onSelectedGroupCheckTabChange(checkedTabValue, checkedTab): void {
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.groupList.forEach((groupList) => {
                if (groupList.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedGroup[groupList.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAllGroup = flag ? true : false;
    }

    //Membership User Functionality
    public getMultipleUserList(): void {
        this.membershipService.getMultipleUserList(this.tabId).subscribe(res => {
            if (res.success) {
                this.multipleUserList = res.data;
                this.checkAllUser = false;
                this.dataService.users = [];
                for (let item of res.data) {
                    this.dataService.users.push({ label: item.user_name, value: item.id });
                }
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public showCreateUserDialog(): void {
        this.userHeader = 'Create User';
        this.userSubmitButton = 'Add';
        this.groups = [{ label: 'No Group', value: 1.1 }];
        for (let group of this.groupList) {
            this.groups.push({ label: group.group_name, value: group.id });
        }
        this.userData = new UserData();
        this.userData.group_id = 1.1;
        this.checkAllUserTabs = false;
        this.selectedUserTabs = [];
        this.userFormDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public refreshSelectedUserTabs(): void {
        this.selectedUserTabs = [];
    }

    public onUserFormSubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.userData.tab_id = this.tabId;
        let ids: any[] = [];
        if (this.userData.group_id == 1.1 || this.userData.group_id == null) {
            for (let i in this.selectedUserTabs) {
                if (this.selectedUserTabs[i]) {
                    ids.push(i);
                }
            }
        }
        this.userData.tabs_access = ids;
        if (this.userData.group_id == 1.1) {
            this.userData.group_id = 0;
        }

        this.membershipService.saveUserData(this.userData).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                this.getMultipleUserList();
                this.pageService.showSuccess(res.message);
                this.userFormDialogDisplay = false;
                this.checkAllUserTabs = false;
            } else {
                if (this.userData.group_id == 0) {
                    this.userData.group_id = 1.1;
                }
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public showEditUserFormDialog(userId): void {
        this.showLoader = true;
        this.membershipService.getUserData(userId).subscribe(res => {
            this.showLoader = false;
            this.userHeader = 'Edit User';
            this.userSubmitButton = 'Save';
            this.groups = [{ label: 'No Group', value: 1.1 }];
            for (let group of this.groupList) {
                this.groups.push({ label: group.group_name, value: group.id });
            }
            this.userData = res.data.itemData;
            this.userData.password = '';
            this.userData.password_confirmation = '';
            if (this.userData.group_id == 0 || this.userData.group_id == null) {
                this.userData.group_id = 1.1;
            }
            this.refreshSelectedUserTabs();
            if (res.data.itemData.tabs_access) {
                for (let i of res.data.itemData.tabs_access) {
                    this.selectedUserTabs[i] = true;
                }
            }

            this.checkAllUserTabs = true;
            this.appTabs.every((data) => {
                if (typeof this.selectedUserTabs[data.id] == 'undefined') {
                    this.checkAllUserTabs = false;
                    return false;
                } else {
                    return true;
                }
            });

            this.userFormDialogDisplay = true;
            this.pageService.onDialogOpen();
        });
    }

    public onUserDeleteClick(): void {
        if (this.selectedUser.length > 0 && this.selectedUser.indexOf(true) !== -1) {
            var yes = window.confirm("Are you sure you want to delete the selected User ? ");
            if (yes) {
                this.deleteUser();
            }
        }
    }

    public deleteUser(): void {
        let ids: any[] = [];
        for (let i in this.selectedUser) {
            if (this.selectedUser[i]) {
                ids.push(i);
            }
        }
        this.showLoader = true;
        this.membershipService.deleteUser(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkTrue = false;
                this.getMultipleUserList();
                this.pageService.showSuccess(res.message);
                this.multipleUserList.forEach((item, index) => {
                    if (item.id === this.selectedUser['id']) {
                        this.multipleUserList.splice(index, 1);
                    }
                });
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public showEditInviteMailDialog(): void {
        this.showLoader = true;
        this.membershipService.getInviteEmailData(this.tabId).subscribe(res => {
            this.showLoader = false;
            this.showEditor = true;
            if (res.success) {
                this.inviteEmailTemplate = res.data.itemData;
                this.initEditor();
                console.log(this.inviteEmailTemplate);
            } else {
                this.pageService.showError(res.message);
            }
        });
        this.emailInviteFormDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public onEmailInviteFormSubmit(): void {
        this.inviteEmailTemplateData.tab_id = this.tabId;
        if (this.editorView) {
            this.inviteEmailTemplateData.content = this.editorView.html();
        }
        this.membershipService.saveInviteEmailData(this.inviteEmailTemplateData).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.showEditor = false;
                this.editorView = null;
                this.emailInviteFormDialogDisplay = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
        // this.emailInviteFormDialogDisplay = true;

    }

    private initEditor(): void {
        setTimeout(() => {
            let editorDiv = window["_globalJQuery"]("div#description-editor");
            editorDiv.froalaEditor({
                fileUploadURL: this.pageService.editorURLs.fileUpload,
                videoUploadURL: this.pageService.editorURLs.videoUpload,
                imageUploadURL: this.pageService.editorURLs.imageUpload + "/" + sessionStorage.getItem('appId'),
                imageManagerLoadURL: this.pageService.editorURLs.imageManagerLoad + "/" + sessionStorage.getItem('appId'),
            });
            this.editorView = editorDiv.find(".fr-view");
            if (this.inviteEmailTemplate) {
                editorDiv.froalaEditor('placeholder.hide')
            }
            this.editorView.html(this.inviteEmailTemplate);
        });
    }

    public hideDescDialog(): void {
        this.editorView = null;
    }

    public showInviteUserDialog(): void {
        this.groups = [{ label: 'No Groups', value: 1.1 }];
        for (let group of this.groupList) {
            this.groups.push({ label: group.group_name, value: group.id });
        }
        this.inviteUserFormData.group_id = 1.1;
        this.inviteUserFormDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public onInviteUserFormSubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.inviteUserFormData.tab_id = this.tabId;
        if (this.inviteUserFormData.group_id == 1.1) {
            this.inviteUserFormData.group_id = 0;
        }

        this.membershipService.inviteUser(this.inviteUserFormData).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.inviteUserFormDialogDisplay = false;
                this.inviteUserFormData = new InviteUserFormData();
                this._clearCSVInput();
                console.log(res);
            } else {
                if (res.exType == 1) {
                    this.pageService.showError(res.message);
                } else {
                    this.errorMsg = res.message;
                    this.showError = true;
                }
                console.log(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public onCSVDataChange(event: any): void {
        this.inviteUserCSV = event.target;
        this.inviteUserFormData.csv_emails = event.target.files[0];
    }

    private _clearCSVInput(): void {
        if (this.inviteUserCSV) {
            this.inviteUserCSV.value = null;
        }
    }

    public changeBackgroundImage(activeYourImagesTab) {
        this.activeYourImagesTab = activeYourImagesTab;
        this.addImages = true;
        this.pageService.onDialogOpen();
        this.importImageIds = [];
        this.mobileViewService.userImagesOnInit(this.appId).subscribe((res) => {
            if (res.success) {
                this.userImages = res.data['user_images_list'];
                this.appData = res.data['app_data'];
                this.homeScreenSliderData = res.data['home_screen_sliders'];
                this.bgAppTabs = res.data['app_tabs_data'];
                this.setUserImageInfo();
                if (res.data.library_images_category_list && res.data.library_images_category_list.length) {
                    this.categoryList.push({ label: 'Category', value: 0 });
                    for (let i = 0; i < res.data.library_images_category_list.length; i++) {
                        let name = res.data.library_images_category_list[i].name;
                        let id = res.data.library_images_category_list[i].id;
                        this.categoryList.push({ label: name, value: id });
                    }
                }
            }
        });

        this.mobileViewService.getLibraryImages().subscribe((res) => {
            if (res.success) {
                this.libraryImages = res.data['library_images_list'];
            }
        });
    }

    private setUserImageInfo(): void {
        for (let i = 0; i < this.userImages.length; i++) {
            this.userImageInfo[this.userImages[i].id] = [];
            if (this.appData.home_screen_background_image == this.userImages[i].id) {

                this.userImageInfo[this.userImages[i].id].push('Home Screen');
            }

            for (let j = 0; j < this.homeScreenSliderData.length; j++) {
                if (this.homeScreenSliderData[j].image_id && this.homeScreenSliderData[j].image_id == this.userImages[i].id) {
                    this.userImageInfo[this.userImages[i].id].push('Slider ' + this.homeScreenSliderData[j].slider_no)
                }

            }
            for (let k = 0; k < this.bgAppTabs.length; k++) {
                if (this.bgAppTabs[k].background_image && this.bgAppTabs[k].background_image == this.userImages[i].id) {
                    let title = this.bgAppTabs[k].title.charAt(0).toUpperCase() + this.bgAppTabs[k].title.substr(1);
                    this.userImageInfo[this.userImages[i].id].push(title)
                }

            }
            if (!this.userImageInfo[this.userImages[i].id].length) {
                delete this.userImageInfo[this.userImages[i].id];
            }
        }
    }

    public importLibraryImagesToYourImages() {
        if (this.importImageIds.length > 0) {
            let data = { lib_images_id: this.importImageIds.join(','), app_id: this.appId }
            console.log(data);
            this.mobileViewService.importLibraryImagesToYourImages(data).subscribe((res) => {
                if (res.success) {
                    this.importImageIds = [];
                    console.log('this.userImages', this.userImages);
                    this.userImages = this.userImages.concat(res.data['imported_images']);
                    console.log('this.userImages', this.userImages);
                }
            });
        }
    }

    public SaveMyChoice() {
        console.log('SaveMyChoice ', this.targetedImageId);
        let postData = { appId: this.appId, tabsId: this.tabId, userImageId: this.targetedImageId, bgImageType: this.deviceType }
        console.log(postData, "postData");
        this.mobileViewService.setTabBackImage(postData).subscribe((res) => {
            console.log(res);
            if (res.success) {
                this.pageService.showSuccess(res.message[0]);
                this.appData = res.data['app_data'];
                this.appTabs = res.data['app_tabs_data'];
                this.setUserImageInfo();
                // this.setTabData();
                this.addImages = false;
                this.targetedImageId = null;
            } else {
                this.pageService.showError(res.message);
            }
        });

    }

    public deleteTargetedImage() {
        if (!confirm("Are you sure you want to remove this item ?")) {
            return;
        }
        let postData = { appId: this.appId, imgIds: this.targetedImageId, bgImageType: this.deviceType }
        console.log('deleteTargetedImage ', this.targetedImageId);
        this.mobileViewService.deleteUserImages(postData).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess(res.message[0]);
                this.userImages = res.data['user_images_list'];
                this.appData = res.data['app_data'];
                this.homeScreenSliderData = res.data['home_screen_sliders'];
                this.appTabs = res.data['app_tabs_data'];
                this.setUserImageInfo();
                // this.setTabData();
                this.targetedImageId = null;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onImageSelect(evt) {
        let tgt = evt.target || window.event.srcElement;
        this.image = tgt.files[0];
        let data = { app_id: this.appId, name: this.image };
        this.mobileViewService.uplaodUserImage(data).subscribe((res) => {
            if (res.success) {
                this.userImages.push(res.data[0]);
            }
        });
    }

    public targetImage(imageId) {
        this.targetedImageId = imageId;
        console.log('targetImage ', this.targetedImageId);
    }

    public importImage(id) {
        console.log(id);
        let index = this.importImageIds.indexOf(id);

        if (index >= 0) {
            console.log('exist');
            this.importImageIds.splice(index, 1);
        }
        else {
            console.log('not exist');
            this.importImageIds.push(id);
        }
    }

    public onChangeTabImgSettings(): void {
        var yes = window.confirm("This is a global setting that affects all background images within your app. Are you sure you'd like to continue?");
        if (!yes) {
            setTimeout(() => {
                this.tabletSettingsAsPhone = !this.tabletSettingsAsPhone;
            }, 0);
        } else {
            SettingsService.tabBgImageSetting.flag_phone_img = SettingsService.tabBgImageSetting.flag_phone_img ? this.BGSETTINGCHECK : this.BGSETTINGUNCHECK;
            SettingsService.tabBgImageSetting.flag_tablet_img = !SettingsService.tabBgImageSetting.flag_tablet_img ? this.BGSETTINGCHECK : this.BGSETTINGUNCHECK;
            SettingsService.tabBgImageSetting.flag_iphone_img = SettingsService.tabBgImageSetting.flag_iphone_img ? this.BGSETTINGCHECK : this.BGSETTINGUNCHECK;

            SettingsService.tabBgImageSetting.appId = this.appId;
            this.mobileViewService.setTabBackImageSetting(SettingsService.tabBgImageSetting).subscribe((res) => {
                if (res.success) {
                    this.pageService.showSuccess(res.message);
                } else {
                    this.pageService.showError('Error: Unable to save this setting');
                }
            });
        }
    }

}