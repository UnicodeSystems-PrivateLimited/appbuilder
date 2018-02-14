import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { VoiceRecordingService, DisplayService } from '../../providers';
import { MediaPlugin, File, FileEntry, SocialSharing, Metadata, Diagnostic, Entry } from 'ionic-native';
import { VoiceRecordingTabItem } from '../../interfaces';
import { GlobalService } from '../../providers';

const recordingExt: string = ".wav";

@Component({
    selector: 'page-voice-recording',
    templateUrl: 'voice-recording.html'
})
export class VoiceRecording {

    public tabId: number;
    public title: string;
    public bgImage: string;
    public audio: MediaPlugin;
    public data: VoiceRecordingTabItem = new VoiceRecordingTabItem();
    public tempBaseDirectory: string;
    public baseDirectory: string;
    public tempRecordingsPath: string;
    public recordingsPath: string;
    public recordingsDirName: string = "Recordings";
    public isRecording: boolean = false;
    public recordingLimit: number = 600; // in seconds
    public recordingsList: any[] = [];
    public playingFile: string = null;
    public playingMedia: MediaPlugin = null;
    public recordingFile: FileEntry = null;
    public isPlaying: boolean = false;
    public promptButtonClicked: boolean = false;
    public tab_nav_type: string = null;
    public subTabId: number = null;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public service: VoiceRecordingService,
        public display: DisplayService,
        public platform: Platform,
        public alertCtrl: AlertController,
        public changeDetector: ChangeDetectorRef,
        public globalService: GlobalService,
    ) {
        this.tempBaseDirectory = this.baseDirectory = File.dataDirectory;
        console.log("Base directory for Recordings folder:", this.baseDirectory);
        platform.ready().then(() => {
            this.checkDiagnostics();
        });
        if (platform.is("android")) {
            this.baseDirectory = File.externalDataDirectory;
        }
        this.recordingsPath = this.baseDirectory + this.recordingsDirName;
        if (platform.is("ios")) {
            this.tempBaseDirectory = this.recordingsPath;
        }
        this.tabId = navParams.get("tabId");
        this.title = navParams.get("title");
        this.bgImage = navParams.get("bgImage");
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        this.getData();
    }

    public checkStoragePermission(): void {
        if (this.platform.is("ios")) {
            return;
        }
        Diagnostic.isExternalStorageAuthorized().then((status) => {
            console.log("External storage authorization: ", status);
            if (!status) {
                Diagnostic.requestExternalStorageAuthorization().then((res) => {
                    console.log("External storage auth request: ", res);
                    if (res !== Diagnostic.permissionStatus.GRANTED) {
                        this.navCtrl.pop();
                        this.display.showToast("Please allow storage access to use voice recording.");
                    }
                });
            }
        });
    }

    public ionViewDidEnter(): void {
        this.listRecordings();
    }

    public ionViewWillLeave(): void {
        if (this.audio) {
            if (this.isRecording) {
                this.stopRecording();
            }
            this._removeRecordedFile();
        }
        if (this.playingMedia) {
            this.playingMedia.release();
        }
    }

    public getData(): void {
        this.service.getData(this.tabId).subscribe(res => {
            if (res.success) {
                this.data = res.data;
            } else {
                this.display.showToast("Server error occured.");
            }
        });
    }

    public listRecordings(): void {
        this._checkAndMakeDirectory().then(() => {
            File.listDir(this.baseDirectory, this.recordingsDirName).then((dir) => {
                console.log("List dir result:", dir);
                this.recordingsList = [];
                for (let i = 0, len = dir.length; i < len; i++) {
                    if (dir[i].isFile) {
                        dir[i].getMetadata((data: Metadata) => {
                            data.size = data.size / 1024;
                            this.recordingsList.push(Object.assign({}, dir[i], { metadata: data }));
                            if (i === len - 1) {
                                // Its the last record.
                                this.changeDetector.detectChanges();
                            }
                        });
                    }
                }
            }).catch((err) => {
                this.display.showToast("Could not access file system.");
                console.log("List directory error:", err);
            });
        });
    }

    public onMicClick(): void {
        this._checkAndMakeDirectory().then(() => {
            this.recordingFile = null;
            let tempFileName: string = "recording_" + Date.now().toString() + recordingExt;
            File.createFile(this.tempBaseDirectory, tempFileName, true).then((file: FileEntry) => {
                console.log("Created file: ", file);
                this.audio = new MediaPlugin(this.checkPath(file.nativeURL));
                this.startRecording();
                this.recordingFile = file;
            }).catch((err) => {
                this.display.showToast("Could not create file.");
                console.log("Create File Error:", err);
            });
        });
    }

    public onStopClick(): void {
        this.stopRecording();
        this.promptSave();
    }

    private promptSave(): void {
        let prompt = this.alertCtrl.create({
            inputs: [
                { name: 'name', placeholder: 'Name' },
            ],
            buttons: [
                { text: 'Cancel', handler: data => this.handleFileSaveCancel() },
                { text: 'Save', handler: data => this.handleFileSave(data) }
            ],
            enableBackdropDismiss: false
        });
        prompt.present();
        prompt.onDidDismiss(() => this.onSavePromptDismiss());
    }

    private handleFileSave(data: any): void {
        this.promptButtonClicked = true;
        this._saveRecordedFile(data);
    }

    private handleFileSaveCancel(): void {
        this.promptButtonClicked = true;
        this._removeRecordedFile();
    }

    private onSavePromptDismiss(): void {
        if (this.promptButtonClicked) {
            this.promptButtonClicked = false;
        } else {
            this._removeRecordedFile();
        }
    }

    public onMaxTimeReached(): void {
        this.display.showToast("Voice recording time limit reached.");
        this.onStopClick();
    }

    private _checkAndMakeDirectory(): Promise<boolean> {
        return new Promise((resolve) => {
            File.checkDir(this.baseDirectory, this.recordingsDirName).then(_ => {
                resolve(true);
            }).catch((err) => {
                console.log("Check dir error:", err);
                File.createDir(this.baseDirectory, this.recordingsDirName, true).then(_ => {
                    resolve(true);
                }).catch(err => {
                    console.log("Create dir error", err);
                    this.display.showToast("Could not access file system.");
                });
            });
        });
    }

    public startRecording(): void {
        try {
            this.audio.startRecord();
            this.isRecording = true;
        } catch (e) {
            this.isRecording = false;
            this.display.showToast("Could not start recording.");
            console.log("Start recording error:", e);
        }
    }

    public stopRecording(): void {
        try {
            this.isRecording = false;
            this.audio.stopRecord();
            this.audio.play();
            this.audio.release();
            this.audio = null;
        } catch (e) {
            this.display.showToast("Could not stop recording.");
            console.log("Stop recording error:", e);
        }
    }

    public onPlayPauseClick(file: FileEntry): void {
        if (this.isPlaying) {
            if (this.playingFile === file.name) {
                // When the user clicks pause on an already playing record.
                this._pausePlayback();
            } else {
                // When the user clicks play on a record when another record is playing.
                // ie, we forcefully stop the playing record.
                this._stopPlayback();
                this._initPlaybackStart(file);
            }
        } else {
            if (this.playingMedia && this.playingFile === file.name) {
                // When the user plays a paused record.
                this._startPlayback();
            } else {
                // When the user plays a record when no other record is playing.
                if (this.playingMedia) {
                    // One record is in paused state. Release it from the torture.
                    this._stopPlayback();
                }
                this._initPlaybackStart(file);
            }
        }
    }

    private _initPlaybackStart(file: FileEntry): void {
        this.display.showLoader();
        setTimeout(() => {
            this.display.hideLoader();
            this.playingFile = file.name;
            this.playingMedia = new MediaPlugin(this.checkPath(file.nativeURL), (status) => {
                switch (status) {
                    case MediaPlugin.MEDIA_STARTING:
                    case MediaPlugin.MEDIA_RUNNING:
                        this.isPlaying = true;
                        break;

                    case MediaPlugin.MEDIA_STOPPED:
                        this._onPlaybackStop();
                    case MediaPlugin.MEDIA_PAUSED:
                        this.isPlaying = false;
                        break;
                }
                this.changeDetector.detectChanges();
            });
            this._startPlayback();
        }, 500);
    }

    private _startPlayback(): void {
        try {
            this.playingMedia.play();
            this.isPlaying = true;
        } catch (e) {
            this.display.showToast("Could not play recording.");
        }
    }

    private _stopPlayback(): void {
        try {
            this.playingMedia.stop();
            this.playingMedia.release();
            this._onPlaybackStop();
        } catch (e) {
            this.display.showToast("Could not stop playing recording.");
        }
    }

    private _pausePlayback(): void {
        try {
            this.playingMedia.pause();
        } catch (e) {
            this.display.showToast("Could not pause recording.");
        }
    }

    private _onPlaybackStop(): void {
        this.playingFile = null;
        this.playingMedia = null;
    }

    public onDeleteFileClick(file: FileEntry): void {
        this.display.showConfirm(
            "Delete Recording?",
            "Are you sure you want to delete this recording?",
            () => {
                File.removeFile(this.recordingsPath, file.name).then(_ => {
                    this.display.showToast("Recording successfully deleted.");
                    this.listRecordings();
                }).catch((err) => {
                    this.display.showToast("Could not delete recording");
                });
            }
        );
    }

    private _removeRecordedFile(): void {
        File.removeFile(this.tempBaseDirectory, this.recordingFile.name).then(_ => { }).catch((err) => {
            console.log("File remove error:", err);
            this.display.showToast("Could not access file system");
        });
    }

    private _saveRecordedFile(data): void {
        data.name = data.name;
        data.name = data.name.trim();
        if (data.name || data.name.length > 0) {
            data.name = (<string>data.name).replace(/ /g, "-");
            File.moveFile(this.tempBaseDirectory, this.recordingFile.name, this.recordingsPath, data.name + recordingExt).then((entry: Entry) => {
                console.log(entry);
                this.display.showToast("Recording saved.");
                this.listRecordings();
            }).catch((err) => {
                console.log("Move file error:", err);
                this.display.showToast("Could not access file system");
            });
        }
    }

    public onEmailShareClick(file: FileEntry): void {
        SocialSharing.canShareViaEmail().then(() => {
            SocialSharing.shareViaEmail("", this.data ? this.data.subject : "", [this.data ? this.data.email_id : ""], [], [], file.nativeURL).then(() => {
                console.log("Sharing success");
            }).catch(() => {
                this.display.showToast("Could not share recording.");
            });
        }).catch(err => {
            console.log("Email sharing failed:", err);
            this.display.showToast("Email sharing not available.");
        });
    }

    private checkDiagnostics(): void {
        Diagnostic.isMicrophoneAuthorized().then((status) => {
            console.log("Microphone authorization status:", status);
            status ? this.checkStoragePermission() : this.requestMicAuth();
        });
    }

    private requestMicAuth(): void {
        Diagnostic.requestMicrophoneAuthorization().then((res) => {
            console.log("Microphone authorization request:", res);
            if (res === Diagnostic.permissionStatus.GRANTED || res === Diagnostic.permissionStatus.GRANTED_WHEN_IN_USE) {
                this.checkStoragePermission();
            } else {
                this.navCtrl.pop();
                this.display.showToast("Please allow microphone access to use voice recording.");
            }
        });
    }

    private checkPath(path: string): string {
        if (this.platform.is("ios")) {
            path = path.replace("file://", "");
        }
        return path;
    }

}