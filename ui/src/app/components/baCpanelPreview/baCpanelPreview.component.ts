import { Component, ViewChild, Input, Output, EventEmitter, ElementRef, Renderer } from '@angular/core';
import { Router } from '@angular/router-deprecated';
import { Dialog, Dropdown, Growl, Message } from 'primeng/primeng';
import { CPanelService } from "../../pages/c-panel/c-panel.service";
@Component({
    selector: 'ba-cpanel-preview',
    styles: [require('./baCpanelPreview.scss')],
    template: require('./baCpanelPreview.html'),
    providers: [CPanelService],
    directives: [],

})
export class BaCpanelPreview {
    public cPanelData: typeof CPanelService = CPanelService;
    constructor() {
    }

    public ngOnInit(): void {
        console.log('cPanelData', this.cPanelData.cStepsData);
    }
}
