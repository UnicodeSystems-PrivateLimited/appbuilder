import { Component, ViewChild, Input, Output, EventEmitter, ElementRef, Renderer } from '@angular/core';
import { Ng2Uploader } from 'ng2-uploader/ng2-uploader';
import { PageService, GridDataService } from '../../services';
import { Router } from '@angular/router-deprecated';
import { Dialog, Dropdown, Growl, Message } from 'primeng/primeng';

@Component({
    selector: 'ba-picture-uploader',
    styles: [require('./baPictureUploader.scss')],
    template: require('./baPictureUploader.html'),
    providers: [PageService, Ng2Uploader],
    directives: [Growl],

})
export class BaPictureUploader {

    @Input() defaultPicture: string = '';
    @Input() picture: string = '';

    @Input() uploaderOptions: any = {};
    @Input() canDelete: boolean = true;
    public sucMessage: string;
    public errMessage: string;
    public showMessage: string;
    public imageRefresh;

    msgs: Message[] = [];
    public smsg;


    private _getProfileUrl = '../api/ws/account/profile';
    public profile: any = {

        picture: 'assets/img/app/profile/Nasta.png'
    };

    onUpload: EventEmitter<any> = new EventEmitter();
    onUploadCompleted: EventEmitter<any> = new EventEmitter();

    @ViewChild('fileUpload') protected _fileUpload: ElementRef;

    public uploadInProgress: boolean = false;

    constructor(private renderer: Renderer, protected _uploader: Ng2Uploader, private dataService: GridDataService, router: Router, private page: PageService) {
    }

    public ngOnInit(): void {
        if (this._canUploadOnServer()) {
            setTimeout(() => {
                this._uploader.setOptions(this.uploaderOptions);
            });

            this._uploader._emitter.subscribe((data) => {
                this._onUpload(data);
            });
        } else {
            console.warn('Please specify url parameter to be able to upload the file on the back-end');
        }
    }

    public onFiles(): void {

        let files = this._fileUpload.nativeElement.files;
        if (files.length) {
            if (files[0].type == 'image/jpeg' || files[0].type == 'image/jpg' || files[0].type == 'image/bmp' || files[0].type == 'image/jpeg' || files[0].type == 'image/png' || files[0].type == 'image/gif') {
                const file = files[0];
                this._changePicture(file);
                if (this._canUploadOnServer()) {
                    this.uploadInProgress = true;
                    this._uploader.addFilesToQueue(files);

                }

            }
            else {

                this.errMessage = "Invalid Image Format";
                this.showError();
                console.log(this.errMessage);

            }
        }

    }

    getProfileView() {

        this.dataService.getData(this._getProfileUrl).subscribe(account => {
            this.page.filename = account.data.avatar;
            this.dataService.account.avatar = account.data.avatar;
            this.profile.picture = '../api/storage/app/user/image/' + this.page.filename;
        });
    }

    public bringFileSelector(): boolean {
        this.renderer.invokeElementMethod(this._fileUpload.nativeElement, 'click');
        return false;
    }

    public removePicture(): boolean {
        this.picture = '';
        return false;
    }

    protected _changePicture(file: File): void {
        const reader = new FileReader();
        reader.addEventListener('load', (event: Event) => {
            this.picture = (<any>event.target).result;
        }, false);
        reader.readAsDataURL(file);
    }

    protected _onUpload(data): void {
        if (data['done'] || data['abort'] || data['error']) {
            this.smsg = data['response'];
            let obj = JSON.parse(this.smsg);
            if (obj.success === true) {
                this.sucMessage = "Image changed successfully";
                this.showSuccess();
                this._onUploadCompleted(data);
                this.page.filename = this.profile.picture;
                console.log(data);
                console.log('data.response' + data.response + 'typeof' + typeof (data.response));
                console.log('smsg' + this.smsg + 'typeof' + typeof (this.smsg));
                console.log('smsg.success' + obj.success);

            }
            console.log('data : ');
            console.log(data);

        } else {
            this.onUpload.emit(data);

        }
    }
    showSuccess() {
        this.msgs = [];
        this.msgs.push({ severity: 'info', summary: this.sucMessage, detail: '' });
    }
    showError() {
        this.msgs = [];
        this.msgs.push({ severity: 'error', summary: this.errMessage, detail: '' });

    }
    hide() {
        this.msgs = [];
    }

    protected _onUploadCompleted(data): void {
        this.uploadInProgress = false;
        this.onUploadCompleted.emit(data);
        this.getProfileView();
    }

    protected _canUploadOnServer(): boolean {
        return !!this.uploaderOptions['url'];
    }
}
