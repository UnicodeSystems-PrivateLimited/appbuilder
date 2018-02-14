import {Component, ViewEncapsulation} from '@angular/core';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, AbstractControl} from '@angular/common';
import {Router, RouteConfig, RouterOutlet, RouterLink, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
@Component({
    selector: 'forgotPassword',
    encapsulation: ViewEncapsulation.None,
    directives: [],
    styles: [require('./forgotPassword.scss')],
    template: require('./forgotPassword.html'),
})
export class Forgot {

    public form: ControlGroup;
    public email: AbstractControl;
    public password: AbstractControl;
    public submitted: boolean = false;
    router: Router;
    constructor(fb: FormBuilder,router: Router) {
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
            this.router.navigate(['Pages']);
            // your code goes here
            // console.log(values);
        }
    }
}
