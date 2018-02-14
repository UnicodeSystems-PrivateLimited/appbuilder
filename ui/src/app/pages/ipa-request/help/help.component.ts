import { Component, ViewEncapsulation } from '@angular/core';
import { TabView, TabPanel } from 'primeng/primeng';

@Component({
    selector: 'app-help',
    directives: [TabView,TabPanel],
    encapsulation: ViewEncapsulation.None,
    styles: [require('./help.scss')],
    template: require('./help.component.html'),
    pipes: [],
    providers: []
})

export class Help {
    constructor(
    ) {

    }
}