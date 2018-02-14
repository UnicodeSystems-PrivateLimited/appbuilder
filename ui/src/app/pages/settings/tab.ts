import { Component } from '@angular/core';
import {MyTabs} from './tabs.component';

@Component({
  selector: 'myTab',
  inputs: [
    'title:tabTitle',
    'active'
  ],
  styles: [`
    .pane{
      padding: 1em;
    }
  `],
  template: `
    <div [hidden]="!active" class="pane">
      <ng-content></ng-content>
    </div>
  `
})
export class Tab {
  title: string;
  active = this.active || false;
  
  constructor(tabs: MyTabs){
    
   tabs.addTab(this);
    
  }
}