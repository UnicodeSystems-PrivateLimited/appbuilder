import {Injectable} from '@angular/core';
import {Http, URLSearchParams, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs';
@Injectable()
export class GridDataService {

    public account = {
        first_name: null,
        last_name: null,
        email: null,
        avatar: null,
        role: null
    };
    public membershipLogin: boolean = false; //check if membership login is enabled
    public subscription: boolean = false; //check if subscription is enabled
    public subscriptionSelect = [];
    public userGroupSelect = [];
    public users = [];
    public static isCustomerPortal: boolean = false;

    constructor(private _http: Http) { }
    getData(dataUrl: string, params?: Object) {
        if (params) {
            let sParams: URLSearchParams = new URLSearchParams();
            for (let i in params) {
                sParams.set(i, params[i]);
            }
            return this._http.get(dataUrl, new RequestOptions({ search: sParams })).map((res: Response) => res.json())
                .do(data => {
                    // console.log("Response:" + JSON.stringify(data));
                    this.checkAuth(data);
                }).catch(this.handleError);
        } else {
            return this._http.get(dataUrl).map((res: Response) => res.json())
                .do(data => {
                    // console.log("Response:" + JSON.stringify(data));
                    this.checkAuth(data);
                }).catch(this.handleError);
        }
    }

    postData(dataUrl, jsonData) {
        let body = JSON.stringify(jsonData);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this._http.post(dataUrl, body, options)
            .map(res => res.json()).do(data => this.checkAuth(data))
            .catch(this.handleError);
    }

    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error || 'Server error');
    }

    /**
     * Checks if the user is logged in.
     * If not, then redirects to the login page.
     */
    private checkAuth(res: any): void {
        if (typeof res.session != 'undefined' && !res.session) {
            window.open('../api', '_self');
        }
    }

    public getByID(data: any[], id: number, callback: (data: any, index: any) => void, notFound: () => void = () => { }): void {
        for (let i in data) {
            if (data[i].id == id) {
                callback(data[i], i);
                return;
            }
        }
        notFound();
    }

    public static getFormattedDate(date: string): string {
        let d: Date = new Date(date);
        return d.getMonth() + '-' + d.getDate() + '-' + d.getFullYear();
    }
}