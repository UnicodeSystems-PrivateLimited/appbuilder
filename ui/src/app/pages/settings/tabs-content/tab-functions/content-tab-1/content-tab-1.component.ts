import { Component, ViewEncapsulation } from '@angular/core';
import { TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog } from 'primeng/primeng';
import { PageService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Tab, ContentTabOneItem } from "../../../../../theme/interfaces/common-interfaces";
import { ContentTabOneService } from './content-tab-1.service';
import { ColorPickerDirective } from "../../../../../color-picker/color-picker.directive";
import { GlobalStyleService } from '../../../app-display/global-style.service';
import { LocationEditor, MobileViewComponent } from '../../../../../components';
import { AppState } from '../../../../../app.state';

declare var $: any;

@Component({
    selector: 'tab-function-content-tab-1',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dialog, TAB_DIRECTIVES, MobileViewComponent, ColorPickerDirective],
    encapsulation: ViewEncapsulation.None,
    template: require('./content-tab-1.component.html'),
    styles: [require('./content-tab-1.scss')],
    providers: [PageService, ContentTabOneService, GlobalStyleService]
})

export class ContentTab1 {
    public tabId: number;
    public appId: number;
    public color: string = '#000';
    public ready: boolean = false;
    public item: ContentTabOneItem = new ContentTabOneItem();
    public itemOverlayDisplay: string = "none";
    public phoneHeaderImage: File | string = null;
    public tabletHeaderImage: File | string = null;
    public features: any = {};
    public showEditor: boolean = true;
    public showLoader: boolean = false;
    public addSaveButtonHide: boolean = false;

    // public ckEditorConfig: any = {
    //     uiColor: '#F0F3F4',
    //     height: '600',
    //     filebrowserUploadUrl: '/api/ws/function/ck-editor-image/uploadCkeditorImage',
    // };

    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
    public phoneHeaderImageTarget: any = null;
    public tabletHeaderImageChange: any = null;
    public comments = [];
    public editorView: any = null;

    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: ContentTabOneService,
        private globalStyleService: GlobalStyleService,
        protected appState: AppState
    ) {
        this.tabId = parseInt(params.get('tabId'));
        this.item.tab_id = this.tabId;
        this.appId = appState.dataAppId;
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        // One request to get all initial data.
        this.changeEditorColors(this.features.background_color, this.features.feature_text);
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                if (res.data.itemData != null) {
                    this.item = res.data.itemData;
                    if (res.data.style.features) {
                        this.features = res.data.style.features;
                    }
                    console.log(this.features.background_color)
                    this.item.phone_header_image_url = res.data.itemData.phone_header_image;
                    this.item.add_header_and_comment = this.item.add_header_and_comment ? true : false;
                    this.item.is_header_required = this.item.is_header_required ? true : false;
                    this.item.use_global_colors = this.item.use_global_colors ? true : false;
                    this.phoneHeaderImage = this.item.phone_header_image;
                    this.tabletHeaderImage = this.item.tablet_header_image;
                    this.itemOverlayDisplay = this.item.use_global_colors ? "block" : "none";
                    if (this.item.use_global_colors) {
                        this.changeEditorColors(this.features.background_color, this.features.feature_text);
                    } else {
                        this.changeEditorColors(this.item.background_color, this.item.text_color);
                    }
                }
                if (res.data.comments != null) {
                    this.comments = res.data.comments;

                }
                this.tabData = res.data.tabData;
                this.ready = true;
                this.initEditor();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onItemUseGlobalClick(): void {
        this.itemOverlayDisplay = !this.item.use_global_colors ? "block" : "none";
        if (!this.item.use_global_colors) {
            this.changeEditorColors(this.features.background_color, this.features.feature_text);
            console.log(this.globalStyleService.globalStyleSettings.features);
        } else {
            this.changeEditorColors(this.item.background_color, this.item.text_color);
        }
    }

    public changeEditorColors(backgroundColor: string, textColor: string): void {
        // this.showEditor = false;
        // this.ckEditorConfig.contentsCss = "body { background-color: " + backgroundColor + "; color: " + textColor + "; }";

        // // Reloading the editor forcefully so that the new config can be initialized.
        // setInterval(() => {
        //     this.showEditor = true;
        // }, 0);
        if (this.editorView) {
            this.editorView.css({
                "background-color": backgroundColor,
                "color": textColor
            });
        }
    }

    public onUpdateColorClick(): void {
        this.changeEditorColors(this.item.background_color, this.item.text_color);
        if (this.item.id) {
            this.showLoader = true;
            this.service.saveContentTabOneItemColor({ id: this.item.id, background_color: this.item.background_color, text_color: this.item.text_color }).subscribe(res => {
                console.log(res);
                if (res.success) {
                    this.pageService.showSuccess("Item updated succesfully.");
                    this.item.background_color = res.data.background_color;
                    this.item.text_color = res.data.text_color;
                    if (this.item.use_global_colors) {
                        this.changeEditorColors(this.features.background_color, this.features.feature_text);
                    } else {
                        this.changeEditorColors(this.item.background_color, this.item.text_color);
                    }
                } else {
                    this.pageService.showError(res.message);
                }
                this.showLoader = false;
            });
        }
    }

    public onPhoneHeaderImageChange(event: any): void {
        this.phoneHeaderImageTarget = event.target;
        this.item.phone_header_image = event.target.files[0];
    }

    public onTabletHeaderImageChange(event: any): void {
        this.tabletHeaderImageChange = event.target;
        this.item.tablet_header_image = event.target.files[0];
    }

    public onItemSubmit(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.item.add_header_and_comment = this.item.add_header_and_comment ? 1 : 0;
        this.item.use_global_colors = this.item.use_global_colors ? 1 : 0;
        this.item.is_header_required = this.item.is_header_required ? 1 : 0;
        if (this.editorView) {
            this.item.description = this.editorView.html();
        }
        console.log(this.item);
        this.service.saveContentTabOneItem(this.item).subscribe(res => {
            console.log(res);
            if (res.success) {
                this.pageService.showSuccess("Item saved succesfully.");
                this.item = res.data;
                this.item.description = res.data.description;
                this.phoneHeaderImage = this.item.phone_header_image;
                this.tabletHeaderImage = this.item.tablet_header_image;
                this.getInitData();
                if (this.item.use_global_colors) {
                    this.changeEditorColors(this.features.background_color, this.features.feature_text);
                } else {
                    this.changeEditorColors(this.item.background_color, this.item.text_color);
                }
                this._clearImageInputs();

            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
            this.showLoader = false;
        });
    }

    private _clearImageInputs(): void {
        if (this.phoneHeaderImageTarget) {
            this.phoneHeaderImageTarget.value = null;
        }
        if (this.tabletHeaderImageChange) {
            this.tabletHeaderImageChange.value = null;
        }
    }
    public deleteComment(id): void {
        if (id) {

            this.service.deleteComment({ id: id }).subscribe(res => {
                console.log(res);
                if (res.success) {
                    for (var i = 0; i < this.comments.length; i++) {
                        if (this.comments[i].id = id) {
                            this.comments.splice(i, 1);
                        }
                    }
                    this.pageService.showSuccess("Comment deleted succesfully.");
                }
                else
                    this.pageService.showError(res.message);
            });
        }

    }
    public deleteImage(type: string, id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deleteImage(type, id).subscribe(res => {
                    console.log(res);
                    if (res.success) {
                        if (type == "phone_header") {
                            this.item.phone_header_image = '';
                            this.phoneHeaderImage = '';
                            this.item.phone_header_image_url = null;
                        }
                        else if (type == "tablet_header") {
                            this.item.tablet_header_image = '';

                            this.tabletHeaderImage = '';
                        }
                        this.pageService.showSuccess("Image deleted succesfully.");
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
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
            if(this.item.description) {
                editorDiv.froalaEditor('placeholder.hide') 
            }
            this.editorView.html(this.item.description);
            if (this.item.use_global_colors && this.features.background_color && this.features.feature_text) {
                this.changeEditorColors(this.features.background_color, this.features.feature_text);
            } else {
                this.changeEditorColors(this.item.background_color, this.item.text_color);
            }
        });
    }

}