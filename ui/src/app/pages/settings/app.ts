//our root app component
import {Component} from '@angular/core';
import {MyTabs} from './tabs.component';
import {Tab} from './tab';

@Component({
    selector: 'app',
    template: `
      <tabs>
        <tab [tabTitle]="'Tab 1'">Tab 1 Content</tab>
        <tab tabTitle="Tab 2">Tab 2 Content</tab>
      </tabs>
    `,
    directives: [MyTabs, Tab]
})
export class App { }