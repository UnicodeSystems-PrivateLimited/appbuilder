import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, RadioButton, Slider, InputSwitch, SelectItem } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { Tab, ImportFromItune, MusicTabSettings, MusicSetting, widget_location_left, widget_location_right, MusicsList, MusicHeaderImage } from '../../../../../theme/interfaces';
import { MobileViewComponent } from '../../../../../components';
// import { CKEditor } from 'ng2-ckeditor';
import { MusicTabService } from './music-tab.service';
declare var $: any;

@Component({
    selector: 'tab-function-music-tab',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, Dialog, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, Dragula, RadioButton, Slider, InputSwitch, MobileViewComponent],
    encapsulation: ViewEncapsulation.None,
    template: require('./music-tab.component.html'),
    styles: [require('./music-tab.scss')],
    viewProviders: [DragulaService],
    providers: [PageService, GridDataService, MusicTabService]
})

export class MusicTab {

    public tabId: number;
    public ready: boolean = false;
    public addEditDialogDisplay: boolean = false;
    public checkBySearch: boolean = false;
    public checkByURL: boolean = false;
    public importItunesDialogDisplay: boolean = false;
    public import7DigitalDialogDisplay: boolean = false;
    public showDeleteDialog: boolean = false;
    //    public showHeaderImageDeleteDialog: boolean = false;
    public showEditor: boolean = false;
    private WIDGET_LOCATION_LEFT: number = widget_location_left;
    private WIDGET_LOCATION_RIGHT: number = widget_location_right;
    private MUSIC_STATUS_ENABLED: number = 1;
    private MUSIC_STATUS_DISABLED: number = 0;
    public settingsData: MusicSetting = new MusicSetting();
    public hederImage: MusicHeaderImage = new MusicHeaderImage();
    public showLoader: boolean = false;
    public checkTrue: boolean = false;
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
    public musicList: MusicsList[] = [];
    public country = [];
    public countryForItunes: any[] = [];
    public musicHeader: string;
    public tabwrap: boolean = false;
    public phoneHeaderImageTarget: any = null;
    public tabletHeaderImageTarget: any = null;
    public phoneHeaderImage: string = null;
    public tabletHeaderImage: string = null;
    public trackImageTarget: any = null;
    public albumArtImageTarget: any = null;
    public deleteMusicId: number = -1;
    public index: number = -1;
    public track_file_name: string = null;
    public header_image_type: string = null;
    public singleMusicData: MusicsList = new MusicsList();
    public importFromItune: ImportFromItune = new ImportFromItune();
    public ituneSongsList: any[] = [];
    public checkAllItuneList: boolean = false;
    public selectedItuneList: boolean[] = [];
    public selectedItem: boolean[] = [];
    public checkAll: boolean = false;
    public addSaveButtonHide: boolean = false;
    // public ckEditorConfig: any = {
    //     uiColor: '#F0F3F4',
    //     height: '600',
    //     filebrowserUploadUrl: '/api/ws/function/ck-editor-image/uploadCkeditorImage',
    // };
    public editorView: any = null;

    constructor(
        private pageService: PageService,
        private params: RouteParams,
        private dragulaService: DragulaService,
        private service: MusicTabService,
        private dataService: GridDataService) {

        this.tabId = parseInt(params.get('tabId'));
        this.country.push({ label: 'India', value: "1" }, { label: 'Australia', value: "2" }, { label: 'Singapore', value: "3" }, { label: 'Japan', value: "4" });
        dragulaService.dropModel.subscribe((value) => {
            this.sort();
        });
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        // One request to get all initial data.     
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                this.tabData = res.data.tabData;
                if (res.data.tabData.settings) {
                    this.settingsData = JSON.parse(res.data.tabData.settings);
                }
                if (res.data.header_image) {
                    if (this.settingsData.phone_header_image)
                        this.phoneHeaderImage = res.data.header_image.phone_header_image;
                    if (this.settingsData.tablet_header_image)
                        this.tabletHeaderImage = res.data.header_image.tablet_header_image;
                }
                this.getMusicList();
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    // update settings

    public saveSettings(): void {
        this.showLoader = true;
        this.service.saveSettings(this.settingsData, this.tabId).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.getMusicList();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    // use to sort music list

    public sort(): void {
        let ids: number[] = [];
        for (let number of this.musicList) {
            ids.push(number.id);
        }
        this.service.sortNumberList(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('order saved.');
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    //get all track list

    public getMusicList(): void {
        this.service.getMusicList(this.tabId).subscribe(res => {
            if (res.success) {
                this.musicList = res.data;
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    // save/edit single music or track   

    public showAddDialog(): void {
        this.tabwrap = true;
        this.musicHeader = "NEW MUSIC";
        this.addEditDialogDisplay = true;
        this.pageService.onDialogOpen();
        // this.showEditor = true;
        this.initEditor();
    }

    public onSaveSingleMusic(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        if (this.editorView) {
            this.singleMusicData.description = this.editorView.html();
        }
        this.singleMusicData.tab_id = this.tabId;
        let data: MusicsList = Object.assign({}, this.singleMusicData);
        data.is_for_android = data.is_for_android ? this.MUSIC_STATUS_ENABLED : this.MUSIC_STATUS_DISABLED;
        data.is_active_iphone = data.is_active_iphone ? this.MUSIC_STATUS_ENABLED : this.MUSIC_STATUS_DISABLED;
        this.service.saveSingleMusic(data).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.addEditDialogDisplay = false;
                this.editorView = null;
                this.singleMusicData = new MusicsList();
                this.getMusicList();
                this._clearRecurringImageInputs();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
            this.showLoader = false;
            // this.showEditor = false;
        });
    }

    public showEditDialog(music_item: MusicsList): void {
        this.tabwrap = true;
        this.musicHeader = "EDIT TRACK";
        this.addEditDialogDisplay = true;
        this.pageService.onDialogOpen();
        // this.showEditor = true;
        this.singleMusicData = music_item;
        this.initEditor();
        if (!this.singleMusicData.track_file && this.singleMusicData.track_url) {
            this.track_file_name = this.singleMusicData.track_url.substr(this.singleMusicData.track_url.lastIndexOf('/') + 1);
        }
    }

    public fileChangeEvent(fileInput: any): void {
        this.trackImageTarget = fileInput.target
        this.singleMusicData.track_file = fileInput.target.files[0];
    }

    public photoChangeEvent(fileInput: any): void {
        this.albumArtImageTarget = fileInput.target;
        this.singleMusicData.art_file = fileInput.target.files[0];
    }

    private _clearRecurringImageInputs(): void {

        if (this.phoneHeaderImageTarget) {
            this.phoneHeaderImageTarget.value = null;
        }
        if (this.tabletHeaderImageTarget) {
            this.tabletHeaderImageTarget.value = null;
        }
        if (this.trackImageTarget) {
            this.trackImageTarget.value = null;
        }
        if (this.albumArtImageTarget) {
            this.albumArtImageTarget.value = null;
        }
    }

    //delete track
    //    public onDeleteClick(id: number, index: number): void {
    //        this.deleteMusicId = id;
    //        this.index = index;
    //        this.showDeleteDialog = true;
    //    }
    //
    //    public deleteTrack(): void {
    //        this.showLoader = true;
    //        this.service.deleteMusicTrack(this.deleteMusicId).subscribe((res) => {
    //            if (res.success) {
    //                this.showLoader = false;
    //                this.showDeleteDialog = false;
    //                this.pageService.showSuccess(res.message);
    //                this.musicList.splice(this.index, 1);
    //            } else {
    //                this.pageService.showError(res.message);
    //            }
    //        });
    //    }

    //set or remove header image for phone or tablet

    public phoneHeaderChangeEvent(fileInput: any) {
        this.phoneHeaderImageTarget = fileInput.target;
        this.hederImage.phone_header_image = fileInput.target.files[0];
    }

    public tabletHeaderChangeEvent(fileInput: any) {
        this.tabletHeaderImageTarget = fileInput.target;
        this.hederImage.tablet_header_image = fileInput.target.files[0];
    }

    public uploadHeaderImage(): void {
        if (!this.settingsData.phone_header_image && !this.hederImage.phone_header_image) {
            this.pageService.showError("Please upload a phone header image.");
        } else {
            this.showLoader = true;
            var self = this;
            this.service.saveHeaderImages(this.hederImage).subscribe(res => {
                if (res.success) {
                    self._clearRecurringImageInputs();
                    if (res.data.phone_header_image) {
                        self.phoneHeaderImage = res.data.phone_header_image;
                        self.settingsData.phone_header_image = res.data.phone_header_image.substr(res.data.phone_header_image.lastIndexOf('/') + 1);
                    }
                    if (res.data.tablet_header_image) {
                        self.tabletHeaderImage = res.data.tablet_header_image;
                        self.settingsData.tablet_header_image = res.data.tablet_header_image.substr(res.data.tablet_header_image.lastIndexOf('/') + 1);
                    }
                    self.service.saveSettings(self.settingsData, self.tabId).subscribe(res => {
                    });
                    self.pageService.showSuccess("Header image updated successfully!");
                } else {
                    self.pageService.showError(res.message);
                }
                self.showLoader = false;
            });
        }
    }

    public deleteHeaderImageDialog(header_image_type: string): void {
        //        this.showHeaderImageDeleteDialog = true;
        this.header_image_type = header_image_type;
        var yes = window.confirm("Are you sure you want to delete the selected item ? ");
        if (yes) {
            this.deleteHeaderImage();
        }
    }
    public deleteHeaderImage(): void {
        if (this.header_image_type == "phone") {
            this.phoneHeaderImage = null;
            this.settingsData.phone_header_image = null;
        } else if (this.header_image_type == "tablet") {
            this.tabletHeaderImage = null;
            this.settingsData.tablet_header_image = null;
        }
        this.service.saveSettings(this.settingsData, this.tabId).subscribe(res => {
            if (res.success) {
                //                this.showHeaderImageDeleteDialog = false;
                this.header_image_type = null;
            }
        });
    }

    // search and import track from itune by keyword or by album url

    public showImportItunesDialog(): void {
        this.importItunesDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.checkBySearch = false;
        this.checkByURL = false;
        this.showLoader = true;
        this.service.getCountryListItunes().subscribe((res) => {
            if (res.success) {
                this.countryForItunes = res.data.countries;
            }
            this.showLoader = false;
        });
    }

    public onCheckBySearch(): void {
        this.checkBySearch = true;
        this.checkByURL = false;
    }

    public onCheckByURL(): void {
        this.checkBySearch = false;
        this.checkByURL = true;
    }
    public searchTrackFromItune(): void {
        this.importFromItune.tab_id = this.tabId;
        this.service.getSongsFromItune(this.importFromItune).subscribe((res) => {
            if (res.success) {
                this.ituneSongsList = res.data;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }
    public onImportItueDialogHide(): void {
        this.importFromItune = new ImportFromItune();
    }

    public onCheckAllItuneListChange(): void {
        if (!this.checkAllItuneList) {
            for (let i in this.ituneSongsList) {
                this.selectedItuneList[i] = true;
            }
        }
        else {
            for (let i in this.ituneSongsList) {
                this.selectedItuneList[i] = false;
            }
        }
    }

    public importTrackOfItunes(): void {
        this.addSaveButtonHide = true;
        if (this.selectedItuneList.length > 0 && this.selectedItuneList.indexOf(true) !== -1) {
            let track_list: any[] = [];
            for (let i in this.selectedItuneList) {
                if (this.selectedItuneList[i]) {
                    track_list.push(this.ituneSongsList[i]);
                }
            }
            this.service.importTrackOfItunes(track_list, this.tabId).subscribe((res) => {
                if (res.success) {
                    this.getMusicList();
                    this.importItunesDialogDisplay = false;
                    this.pageService.showSuccess(res.message);
                } else {
                    this.pageService.showError(res.message);
                }
                this.addSaveButtonHide = false;
            })
        }
    }

    // search and import track from 7Digital by keyword or by album url

    public showImport7DigitalDialog(): void {
        this.import7DigitalDialogDisplay = true;
        this.pageService.onDialogOpen();
    }


    public onDialogHide(): void {
        this._clearRecurringImageInputs();
        this.track_file_name = null;
        this.editorView = null;
        this.singleMusicData = new MusicsList();
    }
    public onDeleteClick(): void {
        if (this.selectedItem.length > 0 && this.selectedItem.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete item? ");
            if (yes) {
                this.deleteTrack();
            }
        }
    }

    public refreshSelectedItem(): void {
        this.selectedItem = [];
    }

    public onCheckAllChange(): void {
        // this.checkTrue = !this.checkTrue;
        this.refreshSelectedItem();
        if (!this.checkAll) {
            for (let i in this.musicList) {
                this.selectedItem[this.musicList[i].id] = true;
            }
            this.checkTrue = true;
        }
        else {
            for (let i in this.musicList) {
                this.selectedItem[this.musicList[i].id] = false;
            }
            this.checkTrue =false;
        }
    }
    public onCheckDialogTabChange(checkedTabValue, checkedTab): void {
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            for (var i = 0; i < this.ituneSongsList.length; i++) {
                if (i == checkedTab) {
                    if (!(!this.selectedItuneList[i])) {
                        flag = false;
                        break;
                    }
                } else {
                    if (!this.selectedItuneList[i]) {
                        flag = false;
                        break;
                    }
                }

            }
        }
        this.checkAllItuneList = flag ? true : false;
    }

    public deleteTrack(): void {
        let ids: any[] = [];
        for (let i in this.selectedItem) {
            if (this.selectedItem[i]) {
                ids.push(i);
            }
        }
        this.showLoader = true;
        this.service.deleteMusicTrack(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkTrue = false;
                                this.selectedItem = [];

                for (var i = 0; i < ids.length; i++) {
                    console.log('ids==============', ids[i]);
                    this.musicList.forEach((musicList, index) => {
                        console.log('musicList.id==============', musicList.id);
                        if (musicList.id == ids[i]) {
                            console.log('in');
                            this.musicList.splice(index, 1);
                        }
                    });
                }
                this.pageService.showSuccess(res.message);
                this.checkAll = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onCheckTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.musicList.forEach((musicList) => {
                console.log('musicList', musicList);
                console.log('checkedTab', checkedTab);
                if (musicList.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedItem[musicList.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAll = flag ? true : false;
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
            if(this.singleMusicData.description) {
                editorDiv.froalaEditor('placeholder.hide') 
            }
            this.editorView.html(this.singleMusicData.description);
        });
    }
}