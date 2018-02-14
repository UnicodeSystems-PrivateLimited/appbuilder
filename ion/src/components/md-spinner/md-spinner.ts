import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'md-spinner',
  templateUrl: 'md-spinner.html'
})
export class MdSpinnerComponent {

  @Input() state: boolean = false;
  @Input() type: string = 'inline';

  constructor() {

  }

}
