import { Component, ViewEncapsulation } from '@angular/core';
import { TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog } from 'primeng/primeng';
import { PageService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Tab, VoiceRecordingTabItem } from "../../../../../theme/interfaces/common-interfaces";
import { VoiceRecordingTabService } from './voice-recording-tab.service';
import { ColorPickerDirective } from "../../../../../color-picker/color-picker.directive";
// import { CKEditor } from 'ng2-ckeditor';
import { MobileViewComponent } from '../../../../../components';


@Component({
    selector: 'tab-function-voice-recording-tab',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dialog, TAB_DIRECTIVES, MobileViewComponent, ColorPickerDirective],
    encapsulation: ViewEncapsulation.None,
    template: require('./voice-recording-tab.component.html'),
    styles: [require('./voice-recording-tab.scss')],
    providers: [PageService, VoiceRecordingTabService]
})

export class VoiceRecording {
    public tabId: number;
    public ready: boolean = false;
    public showLoader: boolean = false;
    public item: VoiceRecordingTabItem = new VoiceRecordingTabItem();
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
    public comments = [];
    public addSaveButtonHide: boolean = false;

    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: VoiceRecordingTabService) {
        this.tabId = parseInt(params.get('tabId'));
        this.item.tab_id = this.tabId;
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {

        // One request to get all initial data.
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                if (res.data.voiceData != null) {
                    this.item = res.data.voiceData;
                }

                this.tabData = res.data.tabData;
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }


    public onItemSubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        console.log(this.item);
        this.service.saveVoiceRecordingItem(this.item).subscribe(res => {
            console.log(res);
            if (res.success) {
                this.pageService.showSuccess("Item saved succesfully.");
                this.item = res.data;
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
            this.showLoader = false;
        });
    }
    public getItem() {
        this.service.getVoiceRecordingItem(this.tabId).subscribe(res => {
            if (res.success) {
                if (res.data && res.data.length) {
                    this.item = res.data;
                }
            } else {
                this.pageService.showError(res.message);
            }
        });
    }
}