import {Component, ViewEncapsulation} from '@angular/core';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, AbstractControl} from '@angular/common';
import {Router, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {PageService, GridDataService} from '../../theme/services';
import {Dialog, Dropdown, Growl, Message} from 'primeng/primeng';
@Component({
    selector: 'login',
    encapsulation: ViewEncapsulation.None,
    directives: [],
    styles: [require('./login.scss')],
    template: require('./login.html'),
    providers: [GridDataService]
})
export class Login {

    public form: ControlGroup;
    msgs: Message[] = [];
    public email: AbstractControl;
    public password: AbstractControl;
    public submitted: boolean = false;
    router: Router;
    protected url = '/api/ws/account/login';
    constructor(private dataService: GridDataService, fb: FormBuilder, router: Router) {
        this.router = router;
        this.form = fb.group({
            'email': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
            'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
        });

        this.email = this.form.controls['email'];
        this.password = this.form.controls['password'];
    }

    ngOnInit() {
        this.email = this.form.controls['email'];
        this.password = this.form.controls['password'];
    }

    public onSubmit(values: Object): void {
        this.submitted = true;
        if (this.form.valid) {
            this.dataService.postData(this.url, values)
                .subscribe(res => {
                    console.log("Submitted Data" + JSON.stringify(res));
                    if (res.success === true) {
                        this.router.navigate(['Pages']);
                    }
                    else {
                        this.showInfo(res.message);
                    }
                });

            // your code goes here
            // console.log(values);
        }
    }
    showInfo(msg) {
        this.msgs = [];
        this.msgs.push({ severity: 'error', summary: msg, detail: '' });
        console.log("i m in showInfo");
    }
}
