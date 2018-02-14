import { Component} from '@angular/core';
import {NgFor } from '@angular/common';
import { Tab } from './tab';
import {Dragula} from 'ng2-dragula/ng2-dragula';
import {DragulaService} from 'ng2-dragula/ng2-dragula';

@Component({
  selector: 'myTabs',
  template:`
    <ul class="nav nav-tabs" [dragula]='"first-bag"'>
      <li *ngFor="let tab of tabs" (click)="selectTab(tab)" [class.active]="tab.active">
        <a > <i class="fa fa-ellipsis-v"></i> <i class="fa fa-ellipsis-v"></i> {{tab.title}}</a>
      </li>
    </ul>
    <ng-content></ng-content>
  `,
  directives: [Dragula],
  viewProviders: [DragulaService],
})
export class MyTabs {
  
  tabs: Tab[];
  
  constructor() {
    this.tabs = [];
  }
  selectTab(tab){
    
    _deactivateAllTabs(this.tabs);
    tab.active = true;
    
    function _deactivateAllTabs(tabs: Tab[]){
      tabs.forEach((tab)=>tab.active = false);
    }
    
  }
  // _deactivateAllTabs(){
  //   this.tabs.forEach((tab)=>tab.active = false);
  // }

  addTab(tab: Tab) {
    if (this.tabs.length === 0) {
      tab.active = true;
    }
    this.tabs.push(tab);
  }
}
