import { Injectable } from '@angular/core';
import { GridDataService, FormDataService } from '../../../../../theme/services';
import { Observable } from 'rxjs/Observable';
import { APIResponse, OnSubmitSettingsData, GroupList, UserData, GuestData, SingleUserTabAccessData, OnSubmitInviteEmailTemplateData, InviteUserFormData } from '../../../../../theme/interfaces/common-interfaces';

@Injectable()
export class MembershipTabService {

    private _getTabDataURL: string = "../api/ws/function/membership/init";
    private _saveMembershipSettingsDataURL: string = "../api/ws/function/membership/settings/save";
    private _deleteGroupURL: string = "../api/ws/function/membership/group/delete";
    private _getGroupListURL: string = "../api/ws/function/membership/group/list";
    private _deleteUserURL: string = "../api/ws/function/membership/user/delete";
    private _getMultipleUserListURL: string = "../api/ws/function/membership/user/list";
    private _saveGroupDataURL: string = "../api/ws/function/membership/group/save";
    private _getGroupDataURL: string = "../api/ws/function/membership/group/get";
    private _saveUserDataURL: string = "../api/ws/function/membership/user/save";
    private _getUserDataURL: string = "../api/ws/function/membership/user/get";
    private _getGuestDataURL: string = "../api/ws/function/membership/guest/get";
    private _saveGuestDataURL: string = "../api/ws/function/membership/guest/save";
    private _getSingleLoginTabsAccessDataURL: string = "../api/ws/function/membership/single-user/get";
    private _saveSingleUserTabAccessDataURL: string = "../api/ws/function/membership/single-user/save";
    private _getInviteEmailDataURL: string = "../api/ws/function/membership/emailInviteTemplate/get";
    private _saveInviteEmailDataURL: string = "../api/ws/function/membership/emailInviteTemplate/save";
    private _inviteUserDataURL: string = "../api/ws/function/membership/user/invite";

    constructor(private dataService: GridDataService, private formDataService: FormDataService) {
    }

    public getInitData(tabId: number, appId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getTabDataURL + '/' + appId + '/' + tabId);
    }

    public saveMembershipSettingsData(membershipSettingsData: OnSubmitSettingsData): Observable<APIResponse> {
        return this.dataService.postData(this._saveMembershipSettingsDataURL, membershipSettingsData);
    }

    public deleteGroup(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteGroupURL, { id: ids });
    }

    public getGroupList(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getGroupListURL + '/' + tabId);
    }

    public deleteUser(ids: number[]): Observable<APIResponse> {
        return this.dataService.postData(this._deleteUserURL, { id: ids });
    }

    public getMultipleUserList(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getMultipleUserListURL + '/' + tabId);
    }

    public saveGroupData(groupData: GroupList): Observable<APIResponse> {
        return this.dataService.postData(this._saveGroupDataURL, groupData);
    }

    public getGroupData(groupId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getGroupDataURL + '/' + groupId);
    }

    public saveUserData(userData: UserData): Observable<APIResponse> {
        return this.dataService.postData(this._saveUserDataURL, userData);
    }

    public getUserData(userId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getUserDataURL + '/' + userId);
    }

    public getGuestData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getGuestDataURL + '/' + tabId);
    }

    public saveGuestData(guestData: GuestData): Observable<APIResponse> {
        return this.dataService.postData(this._saveGuestDataURL, guestData);
    }

    public getSingleLoginTabsAccessData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getSingleLoginTabsAccessDataURL + '/' + tabId);
    }

    public saveSingleUserTabAccessDataData(singleUserTabAccessData: SingleUserTabAccessData): Observable<APIResponse> {
        return this.dataService.postData(this._saveSingleUserTabAccessDataURL, singleUserTabAccessData);
    }

    public getInviteEmailData(tabId: number): Observable<APIResponse> {
        return this.dataService.getData(this._getInviteEmailDataURL + '/' + tabId);
    }

    public saveInviteEmailData(inviteEmailData: OnSubmitInviteEmailTemplateData): Observable<APIResponse> {
        return this.dataService.postData(this._saveInviteEmailDataURL, inviteEmailData);
    }

    public inviteUser(inviteUserData: InviteUserFormData|Object) {
        return this.formDataService.postData(this._inviteUserDataURL, inviteUserData);
    }
}