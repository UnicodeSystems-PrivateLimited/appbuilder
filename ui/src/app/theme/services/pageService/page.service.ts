import { Injectable } from "@angular/core";
import { GridDataService } from '../gridService';
import { Dialog, Dropdown, Growl, Message } from 'primeng/primeng';
import { Component, ViewChild, Input, Output, EventEmitter, ElementRef, Renderer } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';

@Injectable()

@Component({})

export class PageService {
    public static msgs: Message[] = [];
    public static msgLife: number = 5000;
    public static loaderDisplay: boolean = false;
    public reg_msg = '';
    public friendProfileId = '';
    public userdetails = {};
    public filename = '';
    public static notiDialog: boolean = false;
    public static showpushNotificationButton: boolean = false;
    private isPushNotiOpen: BehaviorSubject<boolean>;
    private _getProfileUrl = '../api/ws/account/profile';
    public profile: any = {

        picture: 'assets/img/app/profile/Nasta.png'
    };
    public msgText: string = null;
    public urlText: string = null;

    public editorURLs = {
        imageUpload: "../api/ws/editor/upload/image",
        fileUpload: "../api/ws/editor/upload/file",
        videoUpload: "../api/ws/editor/upload/video",
        imageManagerLoad: "../api/ws/editor/upload/load-images"
    };

    constructor(private dataService: GridDataService) {
        this.isPushNotiOpen = new BehaviorSubject(false);
    }

    public setPushNotiOpenStatus(val) {
        this.isPushNotiOpen.next(val);
    }

    public getPushNotiOpenStatus() {
        return this.isPushNotiOpen.asObservable();
    }

    getProfileView() {

        this.dataService.getData(this._getProfileUrl).subscribe(account => {
            this.filename = account.data.avatar;
            this.profile.picture = '../api/storage/app/user/image/' + this.filename;

        });

    }

    public showSuccess(msg: any): void {
        this.hide();
        if (msg.constructor !== Array) {
            msg = this.getMessageArrayFromJSONString(msg);
        }
        if (msg.length > 1) {
            PageService.msgLife = msg.length * 5000 <= 20000 ? msg.length * 5000 : 20000;
        }
        for (let i in msg) {
            PageService.msgs.push({ severity: 'info', summary: msg[i], detail: '' });
        }
    }

    public showError(msg: any, messagesCallback?: (msgs: string[]) => void): void {
        this.hide();
        if (msg.constructor !== Array) {
            msg = this.getMessageArrayFromJSONString(msg);
        }
        if (msg.length > 1) {
            PageService.msgLife = msg.length * 5000 <= 20000 ? msg.length * 5000 : 20000;
        }
        if (messagesCallback) messagesCallback(<string[]>msg);
        for (let i in msg) {
            PageService.msgs.push({ severity: 'error', summary: msg[i], detail: '' });
        }
    }

    public hide(): void {
        PageService.msgLife = 5000;
        PageService.msgs = [];
    }

    /**
     * Checks if the message returned by the API is a simple string or a JSON
     * encoded string from Laravel's validator. If it is JSON, then converts it to
     * an array of string messages.
     */
    public getMessageArrayFromJSONString(msgStr: string): string[] {
        try {
            let json = JSON.parse(msgStr);
            if (json.constructor !== Array) {
                let messages: string[] = [];
                for (let i in json) {
                    messages.push(json[i][0]);
                }
                return messages;
            } else {
                return json;
            }
        } catch (e) {
            return [msgStr];
        }
    }

    public static showLoader(): void {
        PageService.loaderDisplay = true;
    }

    public static hideLoader(): void {
        PageService.loaderDisplay = false;
    }

    public onDialogOpen(): void {
        jQuery('html, body').animate({ scrollTop: 0 }, { duration: 1000 });
    }

    public showWarning(message: string, life: number = 5000): void {
        this.hide();
        PageService.msgs.push({ severity: 'warn', summary: message, detail: '' });
        PageService.msgLife = life;
    }

    public validateEmail(email) {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    public checkEmailValidation(email) {
        if (email) {
            if (this.validateEmail(email)) {
                this.msgText = '';
            } else {
                this.msgText = 'Enter valid email';
            }
        } else {
            this.msgText = '';
        }
    }

    public validateUrl(url) {
        let reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
        return reg.test(url);
    }

    public checkUrlValidation(url) {
        if (url) {
            if (this.validateUrl(url)) {
                this.urlText = '';
            } else {
                this.urlText = 'Enter valid url';
            }
        } else {
            this.urlText = '';
        }
    }

    public updateCheckAllToggle(selectedItems: boolean[], itemList: any[]): boolean {
        return this.getSize(selectedItems) === itemList.length && this.isEveryItemChecked(selectedItems);
    }

    private isEveryItemChecked(selectedItems: boolean[]): boolean {
        return selectedItems.every(value => {
            return value;
        });
    }

    private getSize(arr: any): number {
        let size: number = 0;
        for (let i in arr) {
            if (arr[i] !== undefined) {
                size++;
            }
        }
        return size;
    }

    public toggleAllCheckboxes(checkAllToggle: boolean, itemList: any[], useIndex?: boolean): boolean[] {
        let allSelectedItems: boolean[] = [];
        for (let i in itemList) {
            allSelectedItems[useIndex ? i : itemList[i].id] = checkAllToggle;
        }
        return allSelectedItems;
    }
}

