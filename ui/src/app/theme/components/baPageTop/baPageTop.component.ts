import { Component, ViewEncapsulation } from '@angular/core';
import { GridDataService, PageService } from '../../../theme/services';
import { AppState } from '../../../app.state';
import { BaProfilePicturePipe } from '../../pipes';
import { BaMsgCenter } from '../../components/baMsgCenter';
import { BaContentTop } from '../../components/baContentTop';
import { BaSidebar } from '../../components/baSidebar';
import { BaScrollPosition } from '../../directives';
import { Router } from '@angular/router-deprecated';
import { BaPictureUploader } from '../baPictureUploader';
import { SettingsService } from '../../../pages/settings/settings.service'
import { ACTION } from '../../interfaces/c-panel-declaration';

const superAdmin = 1;
const customer = 4;

@Component({
    selector: 'ba-page-top',
    styles: [require('./baPageTop.scss')],
    template: require('./baPageTop.html'),
    directives: [BaMsgCenter, BaScrollPosition, BaContentTop, BaSidebar],
    pipes: [BaProfilePicturePipe],
    encapsulation: ViewEncapsulation.None,
    providers: [PageService]
})
export class BaPageTop {
    private _getProfileUrl = '../api/ws/account/profile';
    public staticSettingService: typeof SettingsService = SettingsService;
    public staticPageService: typeof PageService = PageService;

    public action: any[] = ACTION;

    public isScrolled: boolean = false;
    public isMenuCollapsed: boolean = false;
    public isProfileRetrieved: boolean = false;
    constructor(private _state: AppState, private dataService: GridDataService, router: Router, private page: PageService) {
        this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
            this.isMenuCollapsed = isCollapsed;
        });
    }

    public toggleMenu() {
        this.isMenuCollapsed = !this.isMenuCollapsed;
        this._state.notifyDataChanged('menu.isCollapsed', this.isMenuCollapsed);
    }
    public scrolledChanged(isScrolled) {
        this.isScrolled = isScrolled;
    }
    ngOnInit() {
        this.getProfileView();

    }
    public openLink(nav: any) {
        window.open(nav.link);
    }
    getProfileView() {

        this.dataService.getData(this._getProfileUrl).subscribe(account => {
            this.dataService.account.first_name = account.data.first_name;
            this.dataService.account.last_name = account.data.last_name;
            this.dataService.account.email = account.data.email;
            this.dataService.account.avatar = account.data.avatar;
            this.dataService.account.role = account.data.role;
            this._state.dataAppId = account.data.app_id;
            this._state.dataAppCode = account.data.app_code;
            if (this.dataService.account.role == 4) {
                GridDataService.isCustomerPortal = true;
            }
            this.isProfileRetrieved = true;
        });

    }

}
