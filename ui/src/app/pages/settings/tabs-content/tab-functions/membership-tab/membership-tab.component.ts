import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, RadioButton, InputSwitch } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { ColorPickerDirective } from "../../../../../color-picker/color-picker.directive";
import { Tab, MembershipSettings, SingleMemberLoginDetails, OnSubmitSettingsData, MultipleUserList, GroupList, appAccessTypeSingle, appAccessTypeMultiple, AppTabs, UserData, GuestData, SingleUserTabAccessData, OnSubmitInviteEmailTemplateData, InviteUserFormData } from "../../../../../theme/interfaces/common-interfaces";
import { MembershipTabService } from './membership-tab.service';
import { ThumbnailFileReader, MobileViewComponent } from '../../../../../components';
// import { CKEditor } from 'ng2-ckeditor';
import { AppState } from '../../../../../app.state';

@Component({
    selector: 'tab-function-membership',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, Dialog, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, RadioButton, MobileViewComponent, ColorPickerDirective, InputSwitch],
    encapsulation: ViewEncapsulation.None,
    template: require('./membership-tab.component.html'),
    styles: [require('./membership-tab.scss')],
    providers: [PageService, MembershipTabService]
})

export class MembershipTab {
    public tabId: number;
    public appId: any;
    public ready: boolean = false;
    public color: string = '#000';
    public outerOverlayDisplay: string = "block";
    public innerOverlayDisplay: string = "block";
    public settings: MembershipSettings = new MembershipSettings();
    public singleMemberLoginDetails: SingleMemberLoginDetails = new SingleMemberLoginDetails();
    public onSubmitSettingsData: OnSubmitSettingsData = new OnSubmitSettingsData();
    public multipleUserData: MultipleUserList = new MultipleUserList();
    public multipleUserList: MultipleUserList[] = [];
    public checkAllUser: boolean = false;
    public selectedUser: boolean[] = [];
    public groupData: GroupList = new GroupList();
    public groupList: GroupList[] = [];
    public checkAllGroup: boolean = false;
    public selectedGroup: boolean[] = [];
    public groupHeader: string = null;
    public appTabs: AppTabs[] = [];
    public checkAllGroupTabs: boolean = false;
    public checkTrue:boolean = false;
    public checkGrpTrue:boolean = false;
    public selectedGroupTabs: boolean[] = [];
    public userHeader: string = null;
    public userData: UserData = new UserData();
    public checkAllUserTabs: boolean = false;
    public selectedUserTabs: boolean[] = [];
    public guestData: GuestData = new GuestData();
    public guestHeader: string = null;
    public checkAllGuestTabs: boolean = false;
    public selectedGuestTabs: boolean[] = [];
    public singleUserTabAccessData: SingleUserTabAccessData = new SingleUserTabAccessData();
    public checkAllSingleLoginTabs: boolean = false;
    public selectedSingleLoginTabs: boolean[] = [];
    public inviteEmailTemplateData: OnSubmitInviteEmailTemplateData = new OnSubmitInviteEmailTemplateData();
    public inviteUserFormData: InviteUserFormData = new InviteUserFormData();
    public errorMsg: string = null;
    public inviteUserCSV: any = null;
    // public settings.member_login:boolean = false;
    // public settings.guest_login:boolean = false;


    // ------------------- DISPLAY CONTROL ----------------------------
    public showLoader: boolean = false;
    public showEditor: boolean = false;
    //    public showDeleteUserDialog: boolean = false;
    //    public showDeleteGroupDialog: boolean = false;
    public groupFormDialogDisplay: boolean = false;
    public userFormDialogDisplay: boolean = false;
    public guestFormDialogDisplay: boolean = false;
    public singleLoginTabAccessFormDialogDisplay: boolean = false;
    public emailInviteFormDialogDisplay: boolean = false;
    public inviteUserFormDialogDisplay: boolean = false;
    public showError: boolean = false;
    public addSaveButtonHide: boolean = false;

    private ACCESS_TYPE_SINGLE: number = appAccessTypeSingle;
    private ACCESS_TYPE_MULTIPLE: number = appAccessTypeMultiple;
    public isMembership: boolean = true;
    // public ckEditorConfig: any = {
    //     uiColor: '#F0F3F4',
    //     height: '600',
    //     filebrowserUploadUrl: '/api/ws/function/ck-editor-image/uploadCkeditorImage',
    // };

    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };

    public type = [
        { label: 'Single', value: 2 },
        { label: 'Multiple', value: 3 }
    ];

    public groups: any[] = [];
    public inviteEmailTemplate: string = "";

    constructor(
        private appState: AppState,
        private pageService: PageService,
        private params: RouteParams,
        private service: MembershipTabService,
        private dataService: GridDataService
    ) {
        this.appId = this.appState.dataAppId;
        this.tabId = parseInt(params.get('tabId'));
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        // One request to get all initial data.
        this.service.getInitData(this.tabId, this.appId).subscribe(res => {
            if (res.success) {
                console.log(res);
                this.tabData = res.data.tabData;
                this.appTabs = res.data.appTabs;
                if (res.data.singleUserData) {
                    this.singleMemberLoginDetails = res.data.singleUserData;
                }
                this.multipleUserList = res.data.multipleUserList;
                this.groupList = res.data.groupList;
                if (res.data.tabData.settings) {
                    this.settings = JSON.parse(res.data.tabData.settings);
                }
                if (res.data.guestUser) {
                    this.guestData = res.data.guestUser;
                }
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public saveMembershipSettings(): void {
        this.addSaveButtonHide = true;
        this.onSubmitSettingsData.tab_id = this.tabId;
        this.onSubmitSettingsData.membsershipSettings = this.settings;
        this.onSubmitSettingsData.singleMemberLoginDetails = this.singleMemberLoginDetails;
        this.service.saveMembershipSettingsData(this.onSubmitSettingsData).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
                if (this.onSubmitSettingsData.membsershipSettings.member_login && (this.onSubmitSettingsData.membsershipSettings.type == this.ACCESS_TYPE_MULTIPLE))
                    this.dataService.membershipLogin = this.onSubmitSettingsData.membsershipSettings.member_login;
                this.getInitData();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public onCheckAllUserChange(): void {
        // this.checkTrue = !this.checkTrue;
        this.refreshSelectedUsers();
        if (!this.checkAllUser) {
            for (let i in this.multipleUserList) {
                this.selectedUser[this.multipleUserList[i].id] = true;
            }
            this.checkTrue = true;
        }
        else {
            for (let i in this.multipleUserList) {
                this.selectedUser[this.multipleUserList[i].id] = false;
            }
            this.checkTrue = false;
        }
    }

    public refreshSelectedUsers(): void {
        this.selectedUser = [];
    }

    public onUserDeleteClick(): void {
        if (this.selectedUser.length > 0 && this.selectedUser.indexOf(true) !== -1) {
            //            this.showDeleteUserDialog = true;
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
        this.service.deleteUser(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkTrue = false;
                                this.selectedUser = [];

                this.getMultipleUserList();
                //                this.showDeleteUserDialog = false;
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

    public getMultipleUserList(): void {
        this.service.getMultipleUserList(this.tabId).subscribe(res => {
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
            //            this.showDeleteGroupDialog = true;
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
        this.service.deleteGroup(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkGrpTrue = false;
                                this.selectedGroup = [];

                this.getGroupList();
                this.getMultipleUserList();
                //                this.showDeleteGroupDialog = false;
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

    public getGroupList(): void {
        this.service.getGroupList(this.tabId).subscribe(res => {
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

        this.service.saveGroupData(this.groupData).subscribe(res => {
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
        this.service.getGroupData(groupId).subscribe(res => {
            this.showLoader = false;
            this.groupHeader = 'Edit Group';
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

    public showCreateUserDialog(): void {
        this.userHeader = 'Create User';
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

    public onCheckAllUserTabsChange(): void {
        this.refreshSelectedUserTabs();
        if (!this.checkAllUserTabs) {
            for (let i in this.appTabs) {
                this.selectedUserTabs[this.appTabs[i].id] = true;
            }
        }
        else {
            for (let i in this.appTabs) {
                this.selectedUserTabs[this.appTabs[i].id] = false;
            }
        }
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
        // console.log(this.userData);
        this.service.saveUserData(this.userData).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                this.getMultipleUserList();
                this.pageService.showSuccess(res.message);
                this.userFormDialogDisplay = false;
                this.checkAllUserTabs = false;
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public showEditUserFormDialog(userId): void {
        this.showLoader = true;
        this.service.getUserData(userId).subscribe(res => {
            this.showLoader = false;
            this.userHeader = 'Edit User';
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

    public showGuestLoginDialog(): void {
        this.showLoader = true;
        this.service.getGuestData(this.tabId).subscribe(res => {
            this.showLoader = false;
            this.guestHeader = 'Edit Guest Login';
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

        this.service.saveGuestData(this.guestData).subscribe(res => {
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

    public showSingleLoginTabsAccessDialog(): void {
        this.showLoader = true;
        this.refreshSelectedSingleLoginTabs();
        this.service.getSingleLoginTabsAccessData(this.tabId).subscribe(res => {
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

        this.service.saveSingleUserTabAccessDataData(this.singleUserTabAccessData).subscribe(res => {
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

    public showEditInviteMailDialog(): void {
        this.showLoader = true;
        this.service.getInviteEmailData(this.tabId).subscribe(res => {
            this.showLoader = false;
            this.showEditor = true;
            if (res.success) {
                this.inviteEmailTemplate = res.data.itemData;
                console.log(this.inviteEmailTemplate);
            } else {
                this.pageService.showError(res.message);
            }
        });
        this.emailInviteFormDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public onEmailInviteFormSubmit(): void {
        console.log(this.inviteEmailTemplate);
        this.inviteEmailTemplateData.tab_id = this.tabId;
        this.inviteEmailTemplateData.content = this.inviteEmailTemplate;
        this.service.saveInviteEmailData(this.inviteEmailTemplateData).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.emailInviteFormDialogDisplay = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
        this.emailInviteFormDialogDisplay = true;
        this.pageService.onDialogOpen();

    }

    public switchChange(): void {
        if (!this.settings.member_login) {
            this.settings.guest_login = false;
        }
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

        this.service.inviteUser(this.inviteUserFormData).subscribe(res => {
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

    public onSingleLoginCheckTabChange(checkedTabValue, checkedTab): void {
        let flag: boolean = true;
        if (checkedTabValue) {
            // this.checkAllSingleLoginTabs = false;
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

    public onUserCheckTabChange(checkedTabValue, checkedTab): void {
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.appTabs.forEach((data) => {
                if (data.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedUserTabs[data.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAllUserTabs = flag ? true : false;
    }

    public onSelectedUserCheckTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.multipleUserList.forEach((multipleUserList) => {
                if (multipleUserList.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedUser[multipleUserList.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAllUser = flag ? true : false;
    }
    public onSelectedGroupCheckTabChange(checkedTabValue, checkedTab): void {
        // this.checkGrpTrue = !this.checkGrpTrue;
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

    public checkIfAllTabsSelected(val) {
        return val == true;
    }
}
