import { Component, ViewEncapsulation, Input } from '@angular/core';
import { BaCard } from '../../../../theme/components';

import { ChartistJsService } from './chartistJs.service';
import { BaChartistChart } from '../../../../theme/components';

@Component({
  selector: 'chartist',
  encapsulation: ViewEncapsulation.None,
  pipes: [],
  providers: [ChartistJsService],
  directives: [BaCard, BaChartistChart],
  styles: [require('chartist/dist/chartist.css'), require('./chartistJs.scss')],
  template: require('./chartistJs.html'),
})

export class ChartistJs {

  @Input() data: any;
  @Input() chartType: string = 'bar';//bar,line
  // data:any;

  constructor(private _chartistJsService: ChartistJsService) {
  }

  ngOnInit() {
    // this.data = this._chartistJsService.getAll();
  }

  getResponsive(padding, offset) {
    return this._chartistJsService.getResponsive(padding, offset);
  }
}
