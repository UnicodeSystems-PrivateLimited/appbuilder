import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Platform, ViewController, ModalController } from 'ionic-angular';
import { SocialMedia, DisplayService, SocialService, GlobalService, DataService } from '../../providers';
import { Input } from '@angular/core';
import { Printer, PrintOptions, ThemeableBrowser, SafariViewController, Camera, ImagePicker, Device, ImageResizer, ImageResizerOptions, File } from 'ionic-native';
import { UserProfile } from "../../interfaces/common-interfaces";

/*
  Generated class for the SettingsUserProfileModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-settings-user-profile-modal',
    templateUrl: 'settings-user-profile-modal.html'
})
export class SettingsUserProfileModal {

    public data: UserProfile = new UserProfile();
    public profilePicSrc: string = null;
    public showBirthdayDropdowns: boolean = false;
    public months: number[] = [];
    public days: number[] = [];
    public bypassViewLeaveChecker: boolean = false;

    private imageResizerOptions: ImageResizerOptions = {
        uri: null,
        quality: 100,
        width: 140,
        height: 140,
        folderName: File.externalCacheDirectory
    };

    constructor(
        public viewCtrl: ViewController,
        public display: DisplayService,
        public service: SocialService,
        public globalService: GlobalService,
        public dataService: DataService,
        public modalCtrl: ModalController,
        public platform: Platform
    ) {
        this.initializeDayMonthArrays();
        service.userProfileDataBehaviorSubject.subscribe(isRetrieved => {
            if (isRetrieved) {
                this.data = <UserProfile>Object.assign({}, service.userProfileData);
                this.profilePicSrc = <string>this.data.picture;
                if (this.data.birth_day && this.data.birth_month) {
                    this.showBirthdayDropdowns = true;
                }
            }
        });
    }

    public ionViewCanLeave(): boolean {
        if (this.bypassViewLeaveChecker) {
            this.bypassViewLeaveChecker = false;
            return true;
        }
        for (let prop in this.data) {
            if (this.service.userProfileData[prop] !== this.data[prop]) {
                let confirmResult: boolean = this.confirmLeaving();
                if (confirmResult) this.cleanCameraPictures();
                return confirmResult;
            }
        }
        this.cleanCameraPictures();
        return true;
    }


    private confirmLeaving(): boolean {
        if (confirm("Go back without saving your changes?")) {
            return true;
        }
        return false;
    }

    public dismiss() {
        this.viewCtrl.dismiss().catch(() => {
            console.log("View dismiss was cancelled by ionViewCanLeave");
        });
    }

    public getUserInfo(): void {
        let id = this.globalService.initData.appData.id;
        this.globalService.getUserInfo(id).subscribe(res => {
            if (res.success) {
                if (res.data) {
                    this.data = <UserProfile>Object.assign({}, res.data);
                    this.service.userProfileData = <UserProfile>Object.assign({}, res.data);
                    this.profilePicSrc = <string>this.data.picture;
                    this.service.isUserProfileDataRetrieved = true;
                }
            } else {
                console.log(res.message);
            }
        });
    }

    public onProfileFormSubmit(): void {
        this.display.showNativeLoader();
        this.data.app_id = this.globalService.initData.appData.id;
        this.data.device_uuid = Device.uuid;
        this.globalService.saveUserProfile(this.data).subscribe(res => {
            this.display.hideNativeLoader();
            if (res.success) {
                this.showMessage("Profile saved successfully");
                this.getUserInfo();
            } else {
                this.showMessage("Invalid data provided");
                console.log("Profile save errors:", res.message);
            }
        });
    }

    public onImageClick(): void {
        this.bypassViewLeaveChecker = true;
        this.display.showImagePickerActionSheet(
            () => this.takeFromCamera(),
            () => this.takeFromLibrary()
        );
    }


    public takeFromCamera(): void {
        let options = {
            destinationType: Camera.DestinationType.FILE_URI,
            quality: 100,
        };
        Camera.getPicture(options).then((fileURI: string) => {
            this.imageResizerOptions.uri = fileURI;
            ImageResizer.resize(this.imageResizerOptions).then((filePath: string) => {
                this.globalService.getFileFromUri(filePath).then((file) => {
                    this.data.picture = file;
                    this.profilePicSrc = filePath;
                });
            });
        }, (err) => {
            console.log(err);
        });
    }

    public takeFromLibrary(): void {
        let options = {
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
        };
        Camera.getPicture(options).then((imageData) => {
            let imageDataURI: string = "data:image/jpeg;base64," + imageData;
            this.data.picture = this.globalService.dataURIToFile(imageDataURI);
            this.profilePicSrc = imageDataURI;
        }, (error) => {
            console.log("Library get picture error:", error);
        });
    }

    public onImageTrashClick(): void {
        if (confirm("Are you sure you want to remove this image from your profile?")) {
            this.profilePicSrc = this.data.picture = null;
        }
    }

    public initializeDayMonthArrays(): void {
        for (let i = 1; i <= 31; i++) {
            this.days.push(i);
        }
        for (let i = 1; i <= 12; i++) {
            this.months.push(i);
        }
    }

    public onBirthdayTap(): void {
        this.showBirthdayDropdowns = true;
    }

    private showMessage(message: string): void {
        if (this.platform.is("cordova")) {
            this.display.showToast(message);
        } else {
            this.display.showAlert(message);
        }
    }

    public onSelectBoxClick(): void {
        this.bypassViewLeaveChecker = true;
    }

    private cleanCameraPictures(): void {
        Camera.cleanup().catch(err => {
            console.log("Camera cleanup rejected:", err);
        });
    }

}
