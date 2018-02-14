import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, Platform, PopoverController } from 'ionic-angular';
import { EmailFormsTabService, DisplayService } from '../../providers';
import { EmailFormsTabItem, FormField, formFieldTypes, EmailFormData } from "../../interfaces/common-interfaces";
import { EmailFormGuideline } from '../email-form-guideline/email-form-guideline';
import { EmailFormSaved } from "../email-form-saved/email-form-saved";
import { GlobalService } from '../../providers';
import moment from 'moment';
import { Keyboard } from 'ionic-native';
import { Subscription, Subject } from 'rxjs';
/*
  Generated class for the EmailFormDetail page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-email-form-detail',
    templateUrl: 'email-form-detail.html'
})
export class EmailFormDetail {

    public title: string;
    public formId: number;
    public tabId: number;
    public emailForm: EmailFormsTabItem = new EmailFormsTabItem();
    public formFields: FormField[] = [];
    public fieldSize: string[] = [];
    public fieldTypes = formFieldTypes;
    public countries: any;
    public countrySelectOptions: any;
    public formValue: any[] = []; //Array having values of form fields
    public requiredFields: any[] = []; //Array that defines if the form field is required or not
    public validFields: any[] = []; //Array that defines if the form field value is valid or not
    public formFieldType: any[] = []; //Array of form's field type
    public emailFormData: EmailFormData = new EmailFormData();
    public fileUploaded: File | string = '';
    public inputOption: any;

    private FIELD_SIZE_SMALL: number = 1;
    private FIELD_SIZE_MEDIUM: number = 2;
    private FIELD_SIZE_LARGE: number = 3;

    private PHONE_FORMAT_NORMAL: number = 1;
    private PHONE_FORMAT_INTERNATIONAL: number = 2;

    private TIME_FORMAT_12_HOURS: number = 1;
    private TIME_FORMAT_24_HOURS: number = 2;
    public bgImage: string;
    public loader: boolean = false;
    public formSubmitLoader: boolean = false;
    public futureDate = null;
    public tab_nav_type: string = null;
    public subTabId: number = null;
    public showKeyboardOffset: boolean = false;
    public keyboardOffsetHeight: number;
    public keyboardShowSubscription: Subscription;
    public keyboardHideSubscription: Subscription;
    public onKeyboardOffsetShow: Subject<void> = new Subject<void>();

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        public service: EmailFormsTabService,
        public display: DisplayService,
        public popoverCtrl: PopoverController,
        public globalService: GlobalService,
        public zone: NgZone
    ) {
        this.formId = navParams.get('formId');
        this.title = navParams.get('title');
        this.tabId = navParams.get('tabId');
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.fieldSize[this.FIELD_SIZE_SMALL] = "35%";
        this.fieldSize[this.FIELD_SIZE_MEDIUM] = "75%";
        this.fieldSize[this.FIELD_SIZE_LARGE] = "100%";
        this.inputOption = { standalone: true };
        this.getFormData();
        this.bgImage = navParams.get('bgImage');

        if (this.platform.is("cordova") && this.platform.is("android")) {
            this.keyboardShowSubscription = Keyboard.onKeyboardShow().subscribe(event => this.onKeyboardShow(event));
            this.keyboardHideSubscription = Keyboard.onKeyboardHide().subscribe(event => this.onKeyboardHide(event));
        }
    }

    public ionViewWillLeave(): void {
        this.keyboardShowSubscription.unsubscribe();
        this.keyboardHideSubscription.unsubscribe();
        this.onKeyboardOffsetShow.complete();
    }

    public getFormData(): void {
        this.loader = true;
        this.platform.ready().then(() => {
            this.service.getFormData(this.formId).subscribe(res => {
                this.loader = false;
                if (res.success) {
                    this.emailForm = res.data.form;
                    this.formFields = res.data.fields;
                    let todayDate = new Date();
                    let year = todayDate.getFullYear();
                    let month = todayDate.getMonth();
                    let day = todayDate.getDate();
                    this.futureDate = new Date(year + 25, month, day).toISOString();
                    for (var i = 0; i < this.formFields.length; i++) {
                        if (this.formFields[i].field_type_id != this.fieldTypes.SECTION_BREAK) {
                            this.requiredFields[this.formFields[i].id] = this.formFields[i].properties.rules.required;
                            this.validFields[this.formFields[i].id] = true;
                            this.formFieldType[this.formFields[i].id] = this.formFields[i].field_type_id;

                            if (this.formFields[i].field_type_id == this.fieldTypes.NAME) {
                                //If field type is Name
                                this.formValue[this.formFields[i].id] = { 'first': '', 'last': '' };
                            }
                            else if (this.formFields[i].field_type_id == this.fieldTypes.CHECKBOXES) {
                                //If field type is checkbox
                                this.formValue[this.formFields[i].id] = {};
                                for (var j = 0; j < this.formFields[i].properties.choices.length; j++) {
                                    this.formValue[this.formFields[i].id][this.formFields[i].properties.choices[j].name] = this.formFields[i].properties.choices[j].selected;
                                }
                            }
                            else if (this.formFields[i].field_type_id == this.fieldTypes.PHONE) {
                                //If field type is Phone
                                if (this.formFields[i].properties.phone_format == this.PHONE_FORMAT_NORMAL) {
                                    //If phone format is normal
                                    this.formValue[this.formFields[i].id] = { 'fieldOne': '', 'fieldTwo': '', 'fieldThree': '' };
                                } else {
                                    //If phone format is international
                                    this.formValue[this.formFields[i].id] = '';
                                }
                            } else if (this.formFields[i].field_type_id == this.fieldTypes.ADDRESS) {
                                //If field type is Address
                                this.formValue[this.formFields[i].id] = { 'street_address': '', 'address_line_two': '', 'city': '', 'state': '', 'zip': '', 'country': '' };
                            } else if (this.formFields[i].field_type_id == this.fieldTypes.DROPDOWN) {
                                //If field type is dropdown
                                for (var d = 0; d < this.formFields[i].properties.choices.length; d++) {
                                    if (this.formFields[i].properties.choices[d].selected == true) {
                                        this.formValue[this.formFields[i].id] = this.formFields[i].properties.choices[d].name;
                                        break;
                                    } else {
                                        this.formValue[this.formFields[i].id] = '';
                                    }
                                }
                            } else if (this.formFields[i].field_type_id == this.fieldTypes.MULTIPLE_CHOICES) {
                                //If field type is radio
                                for (var r = 0; r < this.formFields[i].properties.choices.length; r++) {
                                    if (this.formFields[i].properties.choices[r].selected == true) {
                                        this.formValue[this.formFields[i].id] = this.formFields[i].properties.choices[r].name;
                                        break;
                                    } else {
                                        this.formValue[this.formFields[i].id] = '';
                                    }
                                }
                                // } else if(this.formFields[i].field_type_id == this.fieldTypes.FILE_UPLOAD){
                                //     //If field type is file
                                //     this.formValue[this.formFields[i].id] = new File([""], "filename");
                            } else if (this.formFields[i].field_type_id == this.fieldTypes.DATE) {
                                //If field is Date Picker
                                // this.formValue[this.formFields[i].id] = new Date().toISOString();
                                this.formValue[this.formFields[i].id] = moment(new Date()).format();

                            } else if (this.formFields[i].field_type_id == this.fieldTypes.TIME) {
                                //If field is Time Picker
                                // this.formValue[this.formFields[i].id] = new Date().toISOString();
                                this.formValue[this.formFields[i].id] = moment(new Date()).format();
                            } else {
                                this.formValue[this.formFields[i].id] = '';
                            }
                        } else {
                            this.formValue[this.formFields[i].id] = '';
                            this.validFields[this.formFields[i].id] = true;
                        }
                    }
                    this.countries = [
                        "Albania",
                        "Algeria",
                        "Andorra",
                        "Angola",
                        "Antigua and Barbuda",
                        "Argentina",
                        "Armenia",
                        "Australia",
                        "Austria",
                        "Azerbaijan",
                        "Bahamas",
                        "Bahrain",
                        "Bangladesh",
                        "Barbados",
                        "Belarus",
                        "Belgium",
                        "Belize",
                        "Benin",
                        "Bhutan",
                        "Bolivia",
                        "Bosnia and Herzegovina",
                        "Botswana",
                        "Brazil",
                        "Brunei Darussalam",
                        "Bulgaria",
                        "Burkina Faso",
                        "Burundi",
                        "Cabo Verde",
                        "Cambodia",
                        "Cameroon",
                        "Canada",
                        "Central African Republic",
                        "Chad",
                        "Chile",
                        "China",
                        "Colombia",
                        "Comoros",
                        "Congo",
                        "Costa Rica",
                        "Côte d'Ivoire",
                        "Croatia",
                        "Cuba",
                        "Cyprus",
                        "Czech Republic",
                        "Democratic People's Republic of Korea (North Korea)",
                        "Democratic Republic of the Cong",
                        "Denmark",
                        "Djibouti",
                        "Dominica",
                        "Dominican Republic",
                        "Ecuador",
                        "Egypt",
                        "El Salvador",
                        "Equatorial Guinea",
                        "Eritrea",
                        "Estonia",
                        "Ethiopia",
                        "Fiji",
                        "Finland",
                        "France",
                        "Gabon",
                        "Gambia",
                        "Georgia",
                        "Germany",
                        "Ghana",
                        "Greece",
                        "Grenada",
                        "Guatemala",
                        "Guinea",
                        "Guinea-Bissau",
                        "Guyana",
                        "Haiti",
                        "Honduras",
                        "Hungary",
                        "Iceland",
                        "India",
                        "Indonesia",
                        "Iran",
                        "Iraq",
                        "Ireland",
                        "Israel",
                        "Italy",
                        "Jamaica",
                        "Japan",
                        "Jordan",
                        "Kazakhstan",
                        "Kenya",
                        "Kiribati",
                        "Kuwait",
                        "Kyrgyzstan",
                        "Lao People's Democratic Republic (Laos)",
                        "Latvia",
                        "Lebanon",
                        "Lesotho",
                        "Liberia",
                        "Libya",
                        "Liechtenstein",
                        "Lithuania",
                        "Luxembourg",
                        "Macedonia",
                        "Madagascar",
                        "Malawi",
                        "Malaysia",
                        "Maldives",
                        "Mali",
                        "Malta",
                        "Marshall Islands",
                        "Mauritania",
                        "Mauritius",
                        "Mexico",
                        "Micronesia (Federated States of)",
                        "Monaco",
                        "Mongolia",
                        "Montenegro",
                        "Morocco",
                        "Mozambique",
                        "Myanmar",
                        "Namibia",
                        "Nauru",
                        "Nepal",
                        "Netherlands",
                        "New Zealand",
                        "Nicaragua",
                        "Niger",
                        "Nigeria",
                        "Norway",
                        "Oman",
                        "Pakistan",
                        "Palau",
                        "Panama",
                        "Papua New Guinea",
                        "Paraguay",
                        "Peru",
                        "Philippines",
                        "Poland",
                        "Portugal",
                        "Qatar",
                        "Republic of Korea (South Korea)",
                        "Republic of Moldova",
                        "Romania",
                        "Russian Federation",
                        "Rwanda",
                        "Saint Kitts and Nevis",
                        "Saint Lucia",
                        "Saint Vincent and the Grenadines",
                        "Samoa",
                        "San Marino",
                        "Sao Tome and Principe",
                        "Saudi Arabia",
                        "Senegal",
                        "Serbia",
                        "Seychelles",
                        "Sierra Leone",
                        "Singapore",
                        "Slovakia",
                        "Slovenia",
                        "Solomon Islands",
                        "Somalia",
                        "South Africa",
                        "South Sudan",
                        "Spain",
                        "Sri Lanka",
                        "Sudan",
                        "Suriname",
                        "Swaziland",
                        "Sweden",
                        "Switzerland",
                        "Syrian Arab Republic",
                        "Tajikistan",
                        "Thailand",
                        "Timor-Leste",
                        "Togo",
                        "Tonga",
                        "Trinidad and Tobago",
                        "Tunisia",
                        "Turkey",
                        "Turkmenistan",
                        "Tuvalu",
                        "Uganda",
                        "Ukraine",
                        "United Arab Emirates",
                        "United Kingdom of Great Britain and Northern Ireland",
                        "United Republic of Tanzania",
                        "United States of America",
                        "Uruguay",
                        "Uzbekistan",
                        "Vanuatu",
                        "Venezuela",
                        "Vietnam",
                        "Yemen",
                        "Zambia",
                        "Zimbabwe"

                    ];
                    // console.log(this.validFields);    
                    // console.log(this.formValue);    
                } else {
                    console.log('Server error occured');
                }
            });
        });
    }

    public onFileUploadChange(event: any, fieldId: number): void {
        // this.fileUploaded = event.target;
        this.fileUploaded = event.target.files[0];
        this.formValue[fieldId] = event.target.files;
    }

    public emailFormSubmit(): void {
        //Required Validation check Start
        let formIsValid = true;
        this.formValue.forEach((data, key) => {
            if (this.requiredFields[key]) {
                //field is required
                if (data) {
                    //form field is filled
                    if (typeof (data) == 'object') {
                        //form field data is object type
                        if (this.formFieldType[key] == this.fieldTypes.CHECKBOXES) {
                            //form field is checkbox type
                            let tempVarForChkbox = false;
                            for (var index in data) {
                                if (data[index] != '') {
                                    tempVarForChkbox = true;
                                    break;
                                }
                            }
                            if (!tempVarForChkbox) {
                                formIsValid = false;
                            }
                            this.validFields[key] = tempVarForChkbox;
                        } else {
                            //form field is (Name, Address or phone) type
                            let tempVar = true;
                            for (var index in data) {
                                if (data[index] == '') {
                                    tempVar = false;
                                    formIsValid = false;
                                }
                            }
                            this.validFields[key] = tempVar;
                        }
                    } else {
                        //form field data is non-object type
                        this.validFields[key] = true;
                    }
                } else {
                    //form field is not filled
                    this.validFields[key] = false;
                    formIsValid = false;
                }
            } else {
                //field is not required
                this.validFields[key] = true;
            }
        });
        //Required Validation check End

        //Form Processing Start
        if (formIsValid) {
            //Push to success page
            this.formSubmitLoader = true;
            this.emailFormData.form_id = this.formId;
            this.emailFormData.form_values = this.formValue;
            this.service.saveFormData(this.emailFormData).subscribe((res) => {
                this.formSubmitLoader = false;
                // console.log(res);
                if (res.success) {
                    this.getFormData();
                    this.navCtrl.push(EmailFormSaved, {
                        formId: this.formId,
                        title: this.title,
                        tab_nav_type: this.tab_nav_type,
                        subTabId: this.subTabId,
                        message: this.emailForm.success_msg,
                        backButton: this.emailForm.back_button_label
                    });
                } else {
                    this.display.showToast(res.message);
                }
            });
        } else {
            //Show alert of invalid form submission
            this.display.showAlert(this.emailForm.error_msg);
        }
        //Form Processing End

    }

    public showGuideline(event, guideline) {
        let popover = this.popoverCtrl.create(EmailFormGuideline, { data: guideline });
        popover.present({ ev: event });
    }

    public clearDateTime(id) {
        this.formValue[id] = '';
    }

    public setDate(id) {
        if (this.formValue[id] == '') {
            this.formValue[id] = moment(new Date()).format();
        }
    }

    public setTime(id) {
        if (this.formValue[id] == '') {
            this.formValue[id] = moment(new Date()).format();
        }
    }

    public onTextInputFocus(event): void {
        if (this.platform.is("cordova") && this.platform.is("android")) {
            let element = event.target;
            let i: number = 1;
            while (element) {
                if (i++ > 3) {
                    break;
                }
                element = element.parentNode;
                if (element.tagName === "ION-ROW") {
                    let subscription: Subscription = this.onKeyboardOffsetShow.subscribe(() => {
                        element.scrollIntoView({ behavior: "smooth" });
                        subscription.unsubscribe();
                    });
                    break;
                }
            }
        }
    }

    public onKeyboardShow(event): void {
        this.zone.run(() => {
            this.keyboardOffsetHeight = event.keyboardHeight;
            this.showKeyboardOffset = true;
            setTimeout(() => this.onKeyboardOffsetShow.next(), 0);
        });
    }

    public onKeyboardHide(event): void {
        console.log(event);
        this.zone.run(() => {
            this.showKeyboardOffset = false;
        });
    }

}
