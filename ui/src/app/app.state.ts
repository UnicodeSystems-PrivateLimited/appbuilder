import { Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AppState {

  private _data = new Subject<Object>();
  private _dataStream$ = this._data.asObservable();
  public dataAppId: any;
  public dataAppCode;
  public isCustomerLogin: boolean = false;
  public isDeveloperLogin: boolean = false;
  public isAllAppPage: boolean = true;
  private _subscriptions: Map<string, Array<Function>> = new Map<string, Array<Function>>();

  constructor() {
    this._dataStream$.subscribe((data) => this._onEvent(data));
  }

  // getAppId(){

  //   return this.dataAppId;
  // }

  notifyDataChanged(event, value) {

    let current = this._data[event];
    if (current != value) {
      this._data[event] = value;

      this._data.next({
        event: event,
        data: this._data[event]
      });
    }
  }

  subscribe(event: string, callback: Function) {
    var subscribers = this._subscriptions.get(event) || [];
    subscribers.push(callback);

    this._subscriptions.set(event, subscribers);
  }

  _onEvent(data: any) {
    var subscribers = this._subscriptions.get(data['event']) || [];

    subscribers.forEach((callback) => {
      callback.call(null, data['data']);
    });
  }

  setAppState(appId, appCode): void {
     sessionStorage.setItem('appId', appId);
     sessionStorage.setItem('appCode', appCode);
  }

}
