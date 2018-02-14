import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GlobalService, TabService, DisplayService, DataService } from '../../providers';
import { StatusBar, Splashscreen } from "ionic-native";
import { HomePage } from "../home/home";

const membershipLoginTypeSingle: number = 2;
const membershipLoginTypeMulti: number = 3;
import { Keyboard } from 'ionic-native';

@Component({
    selector: 'page-preview',
    templateUrl: 'preview.html'
})
export class Preview {

    public appCode: string;
    public loader: boolean = false;

    constructor(
        public navCtrl: NavController,
        public tabService: TabService,
        public display: DisplayService,
        public globalService: GlobalService,
        public dataService: DataService,
    ) { }

    public onLoadDemoClick(): void {
        if (!this.appCode || this.appCode === "") {
            this.display.showToast("Please enter App Code.");
            return;
        }
        this.loader = true;
        DataService.appCode = this.appCode;
        this.tabService.getTabs().subscribe((res) => {
            this.loader = false;
            if (res.success) {
                this.navCtrl.setRoot(HomePage);
            } else {
                this.display.showToast(res.message);
            }
        });
    }

    public ionViewDidLoad(): void {
        setTimeout(() => {
            Splashscreen.hide();
        }, 2000);
    }

    private setFontFamily(): void {
        if (this.globalService.initData.globalStyleSettings && this.globalService.initData.globalStyleSettings.fonts) {
            let fontFamily: string = this.globalService.font[this.globalService.initData.globalStyleSettings.fonts.font_id];

            let x = document.createElement("STYLE");
            let t = document.createTextNode("* {font-family:" + fontFamily + ";}");
            x.appendChild(t);
            document.head.appendChild(x);
        }
    }

    public checkMemberLogin(): void {
        if (this.globalService.tabs) {
            for (let tab of this.globalService.tabs) {
                if (tab.settings) {
                    let tabSettings = JSON.parse(tab.settings);
                    if (tabSettings.member_login) {
                        this.globalService.membershipLoginFormColor = tabSettings.login_color;
                        this.globalService.membershipLoginInputColor = 'inset 0 -1px 0 0 ' + tabSettings.login_color;

                        this.globalService.isMemberLogin = true;
                        this.globalService.membershipLoginBg = tab.bgImage;

                        if (tabSettings.type == membershipLoginTypeMulti) {
                            this.globalService.membershipLoginType = membershipLoginTypeMulti;
                        }
                        if (tabSettings.type == membershipLoginTypeSingle) {
                            this.globalService.membershipLoginType = membershipLoginTypeSingle;
                        }

                        if (tabSettings.guest_login) {
                            this.globalService.isGuestLoginEnabled = true;
                        }
                    }
                }
            }
        }
    }
    public clickOutside() {
        Keyboard.close();
    }
}
