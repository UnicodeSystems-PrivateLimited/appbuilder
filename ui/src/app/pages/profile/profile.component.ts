import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, Growl, Message } from 'primeng/primeng';
import { SelectItem } from 'primeng/primeng';
import { BaCard } from '../../theme/components';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { PageService, GridDataService } from '../../theme/services';
import { Router } from '@angular/router-deprecated';
import { BaPictureUploader } from '../../theme/components';

declare var require: any;
declare var noty: any;

@Component({
    selector: 'profile',
    pipes: [],
    directives: [ROUTER_DIRECTIVES, BaCard, Growl, DROPDOWN_DIRECTIVES, Dialog, Dropdown, PAGINATION_DIRECTIVES, BaPictureUploader],
    styles: [require('./profile.scss')],
    encapsulation: ViewEncapsulation.None,
    template: require('./profile.html'),
    providers: [PageService]

})


export class Profile {
    //------------------------API URLs---------------------------------
    public defaultPicture = 'assets/img/theme/no-photo.png';
    public profile: any = {
        picture: 'assets/img/app/profile/no-photo.png'
    };
    public uploaderOptions: any = {
        url: '../api/ws/account/profileimage',

    };
    private _getProfileUrl = '../api/ws/account/profile';
    private _postProfileUrl = '../api/ws/account/edit-email';
    private _changePassUrl = '../api/ws/account/changepassword';
    //-------------------------------------------------------------------

    public data = { old_password: "", new_password: "", confirm_password: "" };
    public display = false;
    public changePass = false;
    submitted = false;
    private _router;
    public account = { first_name: '', last_name: '', email: '', avatar: '' };
    public user = { email: "", first_name: "", last_name: "", avatar: "" };
    public changepassword;
    public isDelayedRunning;


    constructor(private dataService: GridDataService, router: Router, private page: PageService) {
        this._router = router;
        PageService.showpushNotificationButton = false;
    }

    ngOnInit() {
        this.getProfileView();
        this.user.first_name = this.account.first_name;
        this.user.last_name = this.account.last_name;
        this.user.email = this.account.email;
        console.log(this.account);

    }

    getProfileView() {

        this.dataService.getData(this._getProfileUrl).subscribe(account => {
            this.account.first_name = this.dataService.account.first_name = account.data.first_name;
            this.account.last_name = this.dataService.account.last_name = account.data.last_name;
            this.account.email = this.dataService.account.email = account.data.email;
            this.page.filename = account.data.avatar;
            this.profile.picture = '../api/storage/app/user/image/' + this.page.filename;

        });

    }

    showDialog() {
        this.display = true
        this.page.onDialogOpen();
    }

    dialogChangePass() {
        this.changePass = true;
        this.page.onDialogOpen();
    }

    profileUpdate() {
        this.isDelayedRunning = true;
        this.dataService.postData(this._postProfileUrl, this.account)
            .subscribe(user => {
                console.log("Submitted Data" + JSON.stringify(user));
                this.isDelayedRunning = false;
                if (user.success === true) {
                    this.getProfileView();
                    this.page.showSuccess(user.message);
                    this.display = false;
                }
                else {
                    this.page.showError(user.message);
                }
            });
    }

    changePassword() {
        console.log(this.data);
        this.isDelayedRunning = true;
        this.dataService.postData(this._changePassUrl, this.data)
            .subscribe(res => {
                console.log("Data:" + JSON.stringify(res));
                this.isDelayedRunning = false;
                if (res.success === true) {
                    console.log("Password changed successfully");
                    this.page.showSuccess(res.message);
                    this.changePass = false;
                }
                else {
                    this.page.showError(res.message);
                }
            });
    }

    cancelProfile() {
        this.display = false;
        this.getProfileView();
    }
}



