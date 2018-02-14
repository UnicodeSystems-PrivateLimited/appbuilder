import { Component, ViewEncapsulation } from '@angular/core';
import { PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dropdown, Dialog } from 'primeng/primeng';
import { SelectItem } from 'primeng/primeng';
import { PageService, GridDataService } from '../../theme/services';
import { APIResponse } from '../../theme/interfaces';

const STATUS_ACTIVE: number = 1;
const STATUS_BANNED: number = 0;

class User {
    id: number;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    activated: number = 1;
    last_login: Date;
}

class Filters {
    sortFor: string;
    sortType: string;
    activated: number;
    user: string;
    perPage: number = 10;
    currentPage: number = 1;
    totalItems: number = 0;
}

@Component({
    selector: 'addUser',
    directives: [Dialog, Dropdown, PAGINATION_DIRECTIVES],
    styles: [require('./addUser.scss')],
    encapsulation: ViewEncapsulation.None,
    template: require('./addUser.html'),
})
export class AddUser {
    public currentPage: number = 1;
    public itemsPerPage: number = 10;
    public maxSize: number = 4;
    public userDialog: boolean = false;
    public userStatus: number = 1;
    public selectedCount: number = 10;
    public user: any;
    public userDialogHeader: string = '';
    public userData: User = new User();
    public usersList: User[] = [];
    public perPageOptions: SelectItem[];
    public statusOptions: SelectItem[] = [
        { label: 'Active', value: STATUS_ACTIVE },
        { label: 'Banned', value: STATUS_BANNED }
    ];
    public confirmPassword: string;
    public showConfirmPasswordMsg: boolean = false;
    public showGridLoader: boolean = false;
    public filters: Filters = new Filters();
    public oppositeSortType = {
        asc: 'desc',
        desc: 'asc'
    };
    public statusFilterOptions: SelectItem[];

    private saveUserURL: string = "../api/ws/user/save";
    private getUserListURL: string = "../api/ws/user/list";
    private getUserURL: string = "../api/ws/user/get";

    constructor(
        private dataService: GridDataService,
        private pageService: PageService
    ) {
        this.perPageOptions = [
            { label: '10', value: 10 },
            { label: '20', value: 20 },
            { label: '50', value: 50 },
            { label: '100', value: 100 }
        ];
        this.statusFilterOptions = [
            { label: "All users", value: undefined },
            { label: "Active", value: STATUS_ACTIVE },
            { label: "Banned", value: STATUS_BANNED }
        ];
    }

    ngOnInit() {
        this.getUserList();
    }

    public addUserDialog(): void {
        this.userDialogHeader = 'Add User';
        this.userData = new User();
        this.showConfirmPasswordMsg = false;
        this.confirmPassword = undefined;
        this.userDialog = true;
    }

    public requestedAppSearch = {
        title: '',
        updateTypes: 'All'
    };

    public editUserDialog(id: number): void {
        this.userDialogHeader = 'Edit User';
        this.showConfirmPasswordMsg = false;
        this.confirmPassword = undefined;
        PageService.showLoader();
        this.dataService.getData(this.getUserURL + "/" + id).subscribe((res: APIResponse) => {
            PageService.hideLoader();
            if (res.success) {
                this.userData = res.data;
                this.userDialog = true;
            } else {
                this.pageService.showError("Error occured while fetching user details.");
            }
        });
    }

    public saveUser(): void {
        if (this.userData.password != this.confirmPassword) {
            this.showConfirmPasswordMsg = true;
            return;
        }
        this.showConfirmPasswordMsg = false;
        PageService.showLoader();
        this.dataService.postData(this.saveUserURL, this.userData).subscribe((res: APIResponse) => {
            PageService.hideLoader();
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.userDialog = false;
                this.getUserList();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public getUserList(): void {
        this.showGridLoader = true;
        this.dataService.getData(this.getUserListURL, this.filters).subscribe((res: APIResponse) => {
            this.showGridLoader = false;
            if (res.success) {
                this.usersList = res.data.data;
                this.filters.totalItems = res.data.total;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public refreshList(): void {
        this.filters = new Filters();
        this.getUserList();
    }

    public sortList(sortFor: string): void {
        this.filters.sortType = this.filters.sortFor == sortFor ? this.oppositeSortType[this.filters.sortType] : "asc";
        this.filters.sortFor = sortFor;
        this.getUserList();
    }

    public onPageChanged(event: { page: number, itemsPerPage: number }): void {
        if (event) {
            this.filters.currentPage = event.page;
        }
        this.getUserList();
    }

    public onPerPageChange(): void {
        this.filters.currentPage = 1;
        this.getUserList();
    }

}