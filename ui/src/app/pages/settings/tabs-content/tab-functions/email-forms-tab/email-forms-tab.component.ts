import { Component, ViewEncapsulation, ViewChild, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, TabsetComponent, TimepickerComponent } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, SelectItem, Calendar, RadioButton } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { AppsTab, EmailForm, EmailFormData, FormField, FieldType, formFieldTypes } from '../../../../../theme/interfaces';
import { EmailFormsService } from './email-forms-tab.service';
import { MobileViewComponent, FormFields, FieldProperties } from '../../../../../components';
import { FormEntryPipe } from '../../../../../pipes/form-entry-pipe.pipe';
import { formfieldTypeCheck } from '../../../../../pipes/form-field-type-check.pipe';
import { GlobalStyleService } from '../../../app-display/global-style.service';
import { ChartistJs } from "../../../../charts/components/chartistJs/chartistJs.component";
import { BaThemeConfigProvider } from '../../../../../theme';

var moment = require('moment/moment');

@Component({
    selector: 'tab-function-email-forms-tab',
    pipes: [FormEntryPipe, formfieldTypeCheck],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, Calendar, RadioButton, ChartistJs, Dialog, DROPDOWN_DIRECTIVES, TimepickerComponent, MobileViewComponent, TAB_DIRECTIVES, Dragula, FormFields, FieldProperties],
    encapsulation: ViewEncapsulation.None,
    template: require('./email-forms-tab.component.html'),
    styles: [require('./email-forms-tab.scss')],
    viewProviders: [DragulaService],
    providers: [PageService, EmailFormsService, GlobalStyleService]
})

export class EmailFormsTab {
    public chartData: any;
    public yearData: any[] = [];
    public labels: any[] = [];
    public tabId: number;
    public ready: boolean = false;
    public currentDate: Date = new Date();
    public forms: EmailForm[] = [];
    public deleteFormId: number = null;
    public formId: number = null;
    public form: EmailForm = new EmailForm();
    public tabData: AppsTab = new AppsTab();
    public fieldTypes: FieldType[] = [];
    public formDialogHeader: string;
    public fields: FormField[] = [];
    public selectedField: FormField = null;
    public fieldTypeIcons: string[] = [];
    public headers = [];
    public entries = [];
    public fieldType = [];
    public data = [];
    public deletedField = [];
    public id: number;
    public yearValue: any;
    public monthValue: any;
    public dayValue: any;
    public noOfDay: number;
    public countries: any;
    public headerIds: number[] = [];
    public checkTrue: boolean = false;
    public showChart: boolean = false;
    public fileUploaded: File | string = '';

    // ------------------- DISPLAY CONTROL ----------------------------
    public formDialogDisplay: boolean = false;
    public showDeleteDialog: boolean = false;
    public showLoader: boolean = false;
    public addFieldTabActive: boolean = false;
    public fieldPropsTabActive: boolean = false;
    public formPropsTabActive: boolean = true;
    public entryDialog: boolean = false;
    public previewDialog: boolean = false;
    public statisticsDialog: boolean = false;
    public enable: number = 2;

    // ----------------------------------------------------------------

    private FIELD_SIZE_SMALL: number = 1;
    private FIELD_SIZE_MEDIUM: number = 2;
    private FIELD_SIZE_LARGE: number = 3;

    private TIME_FORMAT_12_HOURS: number = 1;
    private TIME_FORMAT_24_HOURS: number = 2;

    private PHONE_FORMAT_NORMAL: number = 1;
    private PHONE_FORMAT_INTERNATIONAL: number = 2;

    private FORMS_BAG: string = "forms-bag";
    private FORM_FIELDS_BAG: string = "form-fields-bag";
    public selectedForm: boolean[] = [];
    public checkAll: boolean = false;
    public addSaveButtonHide: boolean = false;
    public formValue: any[] = []; //Array having values of form fields
    public requiredFields: any[] = [];
    public formFieldType: any[] = [];
    public validFields: any[] = [];
    public formFields: FormField[] = [];
    public fieldsTypes = formFieldTypes;
    public fieldSize: string[] = [];
    public years: any[] = [];
    public months: any[] = [];
    public days: any[] = [];
    public timeFormatOptions: SelectItem[];
    public phoneFormatOptions: SelectItem[];
    public emailFormData: EmailFormData = new EmailFormData();
    public formSubmitLoader: boolean = false;
    public cYear: any;
    @ViewChild('emailFormTab') emailFormTab: TabsetComponent;
    constructor(
        private pageService: PageService,
        private _baConfig: BaThemeConfigProvider,
        private params: RouteParams,
        private service: EmailFormsService,
        private dragulaService: DragulaService,
        private dataService: GridDataService
    ) {
        this.tabId = parseInt(params.get('tabId'));
        this.form.tab_id = this.tabId;
        this.fieldTypeIcons[formFieldTypes.SINGLE_LINE_TEXT] = "fa-edit";
        this.fieldTypeIcons[formFieldTypes.PARAGRAPH_TEXT] = "fa-list-alt";
        this.fieldTypeIcons[formFieldTypes.NUMBER] = "fa-sort-numeric-asc";
        this.fieldTypeIcons[formFieldTypes.CHECKBOXES] = "fa-check-square-o";
        this.fieldTypeIcons[formFieldTypes.MULTIPLE_CHOICES] = "fa-wpforms";
        this.fieldTypeIcons[formFieldTypes.DROPDOWN] = "fa-dropbox";
        this.fieldTypeIcons[formFieldTypes.NAME] = "fa-user";
        this.fieldTypeIcons[formFieldTypes.DATE] = "fa-calendar";
        this.fieldTypeIcons[formFieldTypes.TIME] = "fa-clock-o";
        this.fieldTypeIcons[formFieldTypes.PHONE] = "fa-volume-control-phone";
        this.fieldTypeIcons[formFieldTypes.ADDRESS] = "fa-home";
        this.fieldTypeIcons[formFieldTypes.WEBSITE] = "fa-globe";
        this.fieldTypeIcons[formFieldTypes.PRICE] = "fa-usd";
        this.fieldTypeIcons[formFieldTypes.EMAIL] = "fa-envelope-o";
        this.fieldTypeIcons[formFieldTypes.SECTION_BREAK] = "fa-pencil-square-o";
        this.fieldTypeIcons[formFieldTypes.FILE_UPLOAD] = "fa-upload";
        this.fieldSize[this.FIELD_SIZE_SMALL] = "25%";
        this.fieldSize[this.FIELD_SIZE_MEDIUM] = "50%";
        this.fieldSize[this.FIELD_SIZE_LARGE] = "100%";
        dragulaService.dropModel.subscribe(value => {
            console.log('drop model');
            console.log(value[0]);
            if (value[0] === this.FORMS_BAG) {
                console.log('condition true');
                this.sort();
            }
        });
        //Statistics//
        let date = new Date();
        this.cYear = moment(date).format('YYYY');
        for (let i = 2010; i <= this.cYear; i++) {
            this.years.push({ label: i, value: i });
        }
        this.months.push(
            { label: 'Jan', value: 1 },
            { label: 'Feb', value: 2 },
            { label: 'March', value: 3 },
            { label: 'April', value: 4 },
            { label: 'May', value: 5 },
            { label: 'June', value: 6 },
            { label: 'July', value: 7 },
            { label: 'August', value: 8 },
            { label: 'September', value: 9 },
            { label: 'October', value: 10 },
            { label: 'November', value: 11 },
            { label: 'December', value: 12 }
        );

        for (let j = 1; j <= 31; j++) {
            this.days.push({ label: j, value: j });
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
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                this.tabData = res.data.tabData;
                this.fieldTypes = res.data.fieldTypes;
                this.forms = res.data.formList;
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onAddCustomFormClick(): void {
        this.formDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.formDialogHeader = "Add Custom Form";
    }

    public onAddFieldClick(fieldType: FieldType): void {
        let field: FormField = new FormField();
        field.form_id = this.form.id ? this.form.id : null;
        field.field_type_id = fieldType.id;
        let defaultRules = {
            required: false
        };
        field.properties.label = fieldType.name;
        field.properties.guidelines = "";

        switch (fieldType.id) {
            case formFieldTypes.SINGLE_LINE_TEXT:
            case formFieldTypes.NUMBER:
            case formFieldTypes.PARAGRAPH_TEXT:
            case formFieldTypes.WEBSITE:
            case formFieldTypes.EMAIL:
                field.properties.size = this.FIELD_SIZE_MEDIUM;
            case formFieldTypes.NAME:
            case formFieldTypes.DATE:
            case formFieldTypes.PRICE:
            case formFieldTypes.FILE_UPLOAD:
            case formFieldTypes.ADDRESS:
                field.properties.rules = defaultRules;
                break;

            case formFieldTypes.TIME:
                field.properties.rules = defaultRules;
                field.properties.format = this.TIME_FORMAT_24_HOURS;
                break;

            case formFieldTypes.PHONE:
                field.properties.rules = defaultRules;
                field.properties.phone_format = this.PHONE_FORMAT_NORMAL;
                break;

            case formFieldTypes.DROPDOWN:
                field.properties.size = this.FIELD_SIZE_MEDIUM;
            case formFieldTypes.CHECKBOXES:
            case formFieldTypes.MULTIPLE_CHOICES:
                field.properties.rules = defaultRules;
                field.properties.choices = [
                    { name: "First Option", selected: false },
                    { name: "Second Option", selected: false },
                    { name: "Third Option", selected: false }
                ];
                break;

        }

        this.fields.push(field);
    }

    public onFieldDelete(field): void {
        this.selectedField = null;
        this.deletedField.push(field.id);
    }

    public onFieldClick(field: FormField): void {
        this.selectedField = field;
        this.emailFormTab.tabs[1].active = true;
    }

    public onAddAnotherFieldClick(): void {
        this.emailFormTab.tabs[0].active = true;
    }

    public onTitleAndDescClick(): void {
        this.activateFormPropsTab();
    }

    private activateFormPropsTab(): void {
        this.emailFormTab.tabs[2].active = true;
    }

    public onSaveFormClick(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        // Yes, we are literally saving the form of a Form.
        this.service.saveForm(this.form, this.fields, this.deletedField).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                this.formDialogDisplay = false;
                this.dataService.getByID(this.forms, res.data.insertedId, (form: EmailForm) => {
                    form.title = this.form.title;
                }, () => {
                    let form: EmailForm = new EmailForm();
                    form.id = res.data.insertedId;
                    form.title = this.form.title;
                    this.deletedField = [];
                    this.forms.push(form);
                });
                this.onAfterDialogHide();
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public onEditFormClick(id: number): void {
        this.formDialogHeader = "Edit Custom Form";
        PageService.showLoader();
        this.service.getForm(id).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.formDialogDisplay = true;
                this.pageService.onDialogOpen();
                this.form = res.data.form;
                this.fields = res.data.fields;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onAfterDialogHide(): void {
        this.selectedField = null;
        this.activateFormPropsTab();
        this.form = new EmailForm();
        this.form.tab_id = this.tabId;
        this.fields = [];
        this.deletedField = [];
    }

    public sort(): void {
        let ids: number[] = [];
        for (let form of this.forms) {
            ids.push(form.id);
        }
        this.service.sortForms(ids).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    //    public onDeleteFormClick(id: number): void {
    //        if (!confirm("Are you sure you want to delete this form ?")) {
    //            return;
    //        }
    //        this.showLoader = true;
    //        this.service.deleteForm([id]).subscribe(res => {
    //            if (res.success) {
    //                this.showLoader = false;
    //                this.pageService.showSuccess(res.message);
    //                this.dataService.getByID(this.forms, id, (form, index) => {
    //                    this.forms.splice(index, 1);
    //                });
    //            } else {
    //                this.pageService.showError(res.message);
    //            }
    //        });
    //    }

    public onEntryClick(form_id): void {
        this.entryDialog = true;
        this.pageService.onDialogOpen();
        this.id = form_id;
        this.service.listEmailFormEntries(form_id).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.headers = res.data.header;
                this.entries = res.data.entries;
                this.fieldType = res.data.field_type;
                for (let entry of this.entries) {
                    for (let item in entry.data) {
                        if (typeof (entry.data[item].value) == 'object') {
                            let fieldVal = '';
                            let count = 0;
                            if (this.fieldType[entry.data[item].id] == formFieldTypes.CHECKBOXES) {
                                for (let key in entry.data[item].value) {
                                    if (entry.data[item].value[key] == 'true') {
                                        if (count == 0) {
                                            fieldVal = key;
                                        } else {
                                            fieldVal = fieldVal + ', ' + key;
                                        }
                                        count++;
                                    }
                                }
                            } else if (this.fieldType[entry.data[item].id] == formFieldTypes.ADDRESS) {
                                fieldVal = 'Street Address: ' + entry.data[item].value['street_address'] + ', Address Line 2: ' + entry.data[item].value['address_line_two']
                                    + ', City: ' + entry.data[item].value['city'] + ', State: ' + entry.data[item].value['state']
                                    + ', Zip: ' + entry.data[item].value['zip'] + ', Country: ' + entry.data[item].value['country'];
                            } else {
                                for (let key in entry.data[item].value) {
                                    // if(item.value.key != '') {
                                    if (count == 0) {
                                        fieldVal = entry.data[item].value[key];
                                    } else {
                                        fieldVal = fieldVal + ' ' + entry.data[item].value[key];
                                    }
                                    count++;
                                    // }
                                }
                            }
                            // console.log(fieldVal);
                            entry.data[item].value = fieldVal;
                        }
                    }
                }
                this.initHeaderIds();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onEntryDeleteClick(id): void {
        if (!confirm("Are you sure you want to delete this entry ?")) {
            return;
        }
        this.showLoader = true;
        this.service.deleteEntry([id]).subscribe(res => {
            if (res.success) {
                this.showLoader = false;
                this.pageService.showSuccess(res.message);
                this.entries.forEach((entry, index) => {
                    if (entry._id == id) {
                        this.entries.splice(index, 1);
                    }
                });
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    private initHeaderIds(): void {
        this.headerIds = [];
        for (let val of this.headers) {
            this.headerIds.push(val.id);
        }
    }

    public onFormDeleteClick(): void {
        if (this.selectedForm.length > 0 && this.selectedForm.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete form? ");
            if (yes) {
                this.deleteForm();
            }
        }
    }

    public refreshSelectedCategory(): void {
        this.selectedForm = [];
    }

    public onCheckAllChange(): void {
        // this.checkTrue = !this.checkTrue;
        this.refreshSelectedCategory();
        if (!this.checkAll) {
            for (let i in this.forms) {
                this.selectedForm[this.forms[i].id] = true;
            }
            this.checkTrue = true;
        }
        else {
            for (let i in this.forms) {
                this.selectedForm[this.forms[i].id] = false;
            }
            this.checkTrue = false;
        }
    }

    public deleteForm(): void {
        let ids: any[] = [];
        for (let i in this.selectedForm) {
            if (this.selectedForm[i]) {
                ids.push(i);
            }
        }
        console.log('ids++++++++++++++', ids);
        this.showLoader = true;
        this.service.deleteForm(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkTrue = false;
                this.selectedForm = [];
                for (var i = 0; i < ids.length; i++) {
                    console.log('ids==============', ids[i]);
                    this.forms.forEach((forms, index) => {
                        console.log('forms.id==============', forms.id);
                        if (forms.id == ids[i]) {
                            console.log('in');
                            this.forms.splice(index, 1);
                        }
                    });
                }
                this.pageService.showSuccess("Form deleted succesfully.");
                this.checkAll = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onCheckTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.forms.forEach((forms) => {
                console.log('forms', forms);
                console.log('checkedTab', checkedTab);
                if (forms.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedForm[forms.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAll = flag ? true : false;
    }

    public onPreviewClick(id: number): void {
        this.previewDialog = true;
        this.pageService.onDialogOpen();
        this.service.getForm(id).subscribe(res => {
            if (res.success) {
                this.form = res.data.form;
                this.formFields = res.data.fields;
                for (var i = 0; i < this.formFields.length; i++) {
                    if (this.formFields[i].field_type_id != this.fieldsTypes.SECTION_BREAK) {
                        this.requiredFields[this.formFields[i].id] = this.formFields[i].properties.rules.required;
                        this.validFields[this.formFields[i].id] = true;
                        this.formFieldType[this.formFields[i].id] = this.formFields[i].field_type_id;

                        if (this.formFields[i].field_type_id == this.fieldsTypes.NAME) {
                            //If field type is Name
                            this.formValue[this.formFields[i].id] = { 'first': '', 'last': '' };
                        }
                        else if (this.formFields[i].field_type_id == this.fieldsTypes.CHECKBOXES) {
                            //If field type is checkbox
                            this.formValue[this.formFields[i].id] = {};
                            for (var j = 0; j < this.formFields[i].properties.choices.length; j++) {
                                this.formValue[this.formFields[i].id][this.formFields[i].properties.choices[j].name] = this.formFields[i].properties.choices[j].selected;
                            }
                        }
                        else if (this.formFields[i].field_type_id == this.fieldsTypes.PHONE) {
                            //If field type is Phone
                            if (this.formFields[i].properties.phone_format == this.PHONE_FORMAT_NORMAL) {
                                //If phone format is normal
                                this.formValue[this.formFields[i].id] = { 'fieldOne': '', 'fieldTwo': '', 'fieldThree': '' };
                            } else {
                                //If phone format is international
                                this.formValue[this.formFields[i].id] = '';
                            }
                        } else if (this.formFields[i].field_type_id == this.fieldsTypes.ADDRESS) {
                            //If field type is Address
                            this.formValue[this.formFields[i].id] = { 'street_address': '', 'address_line_two': '', 'city': '', 'state': '', 'zip': '', 'country': '' };
                        } else if (this.formFields[i].field_type_id == this.fieldsTypes.DROPDOWN) {
                            //If field type is dropdown
                            for (var d = 0; d < this.formFields[i].properties.choices.length; d++) {
                                if (this.formFields[i].properties.choices[d].selected == true) {
                                    this.formValue[this.formFields[i].id] = this.formFields[i].properties.choices[d].name;
                                    break;
                                } else {
                                    this.formValue[this.formFields[i].id] = '';
                                }
                            }
                        } else if (this.formFields[i].field_type_id == this.fieldsTypes.MULTIPLE_CHOICES) {
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
                        } else if (this.formFields[i].field_type_id == this.fieldsTypes.DATE) {
                            //If field is Date Picker
                            // this.formValue[this.formFields[i].id] = new Date().toISOString();
                            this.formValue[this.formFields[i].id] = moment(new Date()).format('MM/DD/YY');

                        } else if (this.formFields[i].field_type_id == this.fieldsTypes.TIME) {
                            //If field is Time Picker
                            // this.formValue[this.formFields[i].id] = new Date().toISOString();
                            this.formValue[this.formFields[i].id] = new Date();
                        } else {
                            this.formValue[this.formFields[i].id] = '';
                        }
                    } else {
                        this.formValue[this.formFields[i].id] = '';
                        this.validFields[this.formFields[i].id] = true;
                    }
                }
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onPreviewSubmit(): void {
        //Required Validation check Start
        let formIsValid = true;
        this.formValue.forEach((data, key) => {
            if (this.requiredFields[key]) {
                //field is required
                if (data) {
                    //form field is filled
                    if (typeof (data) == 'object') {
                        //form field data is object type
                        if (this.formFieldType[key] == this.fieldsTypes.CHECKBOXES) {
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
            this.emailFormData.form_id = this.form.id;
            this.emailFormData.form_values = this.formValue;
            console.log(this.emailFormData);
            this.service.saveFormData(this.emailFormData).subscribe((res) => {
                this.formSubmitLoader = false;
                if (res.success) {
                    this.previewDialog = false;
                    this.emailFormData = new EmailFormData();
                    this.pageService.showSuccess('Success! Your submission has been saved');
                } else {
                    this.pageService.showError('Server error occured');
                }
            });
        } else {
            //Show alert of invalid form submission
            if (!confirm(this.form.error_msg)) {
                return;
            }
        }
    }

    public onFileUploadChange(event: any, fieldId: number): void {
        this.fileUploaded = event.target.files[0];
        this.formValue[fieldId] = event.target.files;
    }

    public onStatisticsClick(id: number): void {
        this.enable = 2;
        this.statisticsDialog = true;
        this.pageService.onDialogOpen();
        this.formId = id;
        this.showChart = false;
        setTimeout(() => {
            this.showChart = true;
        }, 0); 
               this.chartData = {
                simpleBarData: {
                    labels: [],
                    series: [
                    ]
                },
                simpleBarOptions: {
                    fullWidth: true,
                    height: '300px',
                },
            }
    }

    public onMonthChange(event: any): void {
        this.noOfDay = event.value;
        this.days = [];
        if ((event.value == 1) || (event.value == 3) || (event.value == 5) || (event.value == 7) || (event.value == 8) || (event.value == 10) || (event.value == 12)) {
            for (let k = 1; k <= 31; k++) {
                this.days.push({ label: k, value: k })
            }
        } else if ((event.value == 4) || (event.value == 6) || (event.value == 9) || (event.value == 11)) {
            for (let k = 1; k <= 30; k++) {
                this.days.push({ label: k, value: k })
            }
        } else {
            for (let k = 1; k <= 28; k++) {
                this.days.push({ label: k, value: k })
            }
        }
    }

    public onDayClick(type: number): void {
        this.enable = type;
        this.showChart = false;
        setTimeout(() => {
            this.showChart = true;
        }, 0);
        if (type == 1) {
            this.chartData = {
                simpleBarData: {
                    labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
                    series: [      
               ]
                },
                simpleBarOptions: {
                    fullWidth: true,
                    height: '300px'
                },
            }
        }
        if (type == 2) {
            this.chartData = {
                simpleBarData: {
                    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
                    series: [
                    ]
                },
                simpleBarOptions: {
                    fullWidth: true,
                    height: '300px'
                },
            }
        }
        if (type == 3) {
            this.chartData = {
                simpleBarData: {
                    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
                    series: []
                },
                simpleBarOptions: {
                    fullWidth: true,
                    height: '300px'
                },
            }
        }
        if (type == 0) {
            this.chartData = {
                simpleBarData: {
                    labels: [],
                    series: []
                },
                simpleBarOptions: {
                    fullWidth: true,
                    height: '300px'
                },
            }
        }
    }

    public onRefreshClick(): void {
        if (this.enable == 3) {
            this.yearData = [];
            this.labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
            this.service.getYearStatistcis(this.formId, this.yearValue).subscribe(res => {
                if (res.success) {
                    let data = res.data;
                    for (let item of this.labels) {
                        let status = data.hasOwnProperty(item);
                        if (status) {
                            this.yearData.push(data[item]);
                        }
                        else {
                            this.yearData.push(0);
                        }
                    }
                    this.chartData = {};
                    this.showChart = false;
                    setTimeout(() => {
                        this.showChart = true;
                    }, 0);
                    if (this.chartData) {
                        this.chartData = {
                            simpleBarData: {
                                labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
                                series: [this.yearData]
                            },
                            simpleBarOptions: {
                                fullWidth: true,
                                height: '300px'
                            },
                        }
                    }
                } else {
                    this.pageService.showError(res.message);
                }
            });
        } else if (this.enable == 2) {
            if ((this.noOfDay == 1) || (this.noOfDay == 3) || (this.noOfDay == 5) || (this.noOfDay == 7) || (this.noOfDay == 8) || (this.noOfDay == 10) || (this.noOfDay == 12)) {
                this.yearData = [];
                this.labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
                this.service.getMonthStatistcis(this.formId, this.yearValue, this.noOfDay).subscribe(res => {
                    if (res.success) {
                        let data = res.data;
                        for (let item of this.labels) {
                            let status = data.hasOwnProperty(item);
                            if (status) {
                                this.yearData.push(data[item]);
                            }
                            else {
                                this.yearData.push(0);
                            }
                        }
                        this.chartData = {};
                        this.showChart = false;
                        if (this.chartData) {
                            setTimeout(() => {
                                this.showChart = true;
                            }, 0);
                            this.chartData = {
                                simpleBarData: {
                                    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
                                    series: [this.yearData]
                                },
                                simpleBarOptions: {
                                    fullWidth: true,
                                    height: '300px'
                                },
                            }
                        }
                    } else {
                        this.pageService.showError(res.message);
                    }
                });
            } else if ((this.noOfDay == 4) || (this.noOfDay == 6) || (this.noOfDay == 9) || (this.noOfDay == 11)) {
                this.yearData = [];
                this.labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
                    this.service.getMonthStatistcis(this.formId, this.yearValue, this.noOfDay).subscribe(res => {
                        if (res.success) {
                            let data = res.data;
                            for (let item of this.labels) {
                                let status = data.hasOwnProperty(item);
                                if (status) {
                                    this.yearData.push(data[item]);
                                }
                                else {
                                    this.yearData.push(0);
                                }
                            }
                            this.chartData = {};
                            this.showChart = false;
                            setTimeout(() => {
                                this.showChart = true;
                            }, 0);
                            if (this.chartData) {
                                this.chartData = {
                                    simpleBarData: {
                                        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
                                        series: [this.yearData]
                                    },
                                    simpleBarOptions: {
                                        fullWidth: true,
                                        height: '300px'
                                    },
                                }
                            }
                        } else {
                            this.pageService.showError(res.message);
                        }
                    });
            } else {
                this.yearData = [];
                this.labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28'];
                this.service.getMonthStatistcis(this.formId, this.yearValue, this.noOfDay).subscribe(res => {
                    if (res.success) {
                        let data = res.data;
                        for (let item of this.labels) {
                            let status = data.hasOwnProperty(item);
                            if (status) {
                                this.yearData.push(data[item]);
                            }
                            else {
                                this.yearData.push(0);
                            }
                        }
                        this.chartData = {};
                        this.showChart = false;
                        setTimeout(() => {
                            this.showChart = true;
                        }, 0);
                        if (this.chartData) {
                            this.chartData = {
                                simpleBarData: {
                                    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28'],
                                    series: [this.yearData]
                                },
                                simpleBarOptions: {
                                    fullWidth: true,
                                    height: '300px'
                                },
                            }
                        }
                    } else {
                        this.pageService.showError(res.message);
                    }
                });
            }
        }else if(this.enable == 1){
              this.yearData = [];
              this.labels= ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
              this.service.getDayStatistcis(this.formId, this.yearValue,this.noOfDay,this.dayValue).subscribe(res => {
                if (res.success) {
                    console.log(res.data);
                    let data = res.data;
                    for (let item of this.labels) {
                        let status = data.hasOwnProperty(item);
                        if (status) {
                            this.yearData.push(data[item]);
                        }
                        else {
                            this.yearData.push(0);
                        }
                    }
                    this.chartData = {};
                    this.showChart = false;
                    setTimeout(() => {
                        this.showChart = true;
                    }, 0);
                    if (this.chartData) {
                        this.chartData = {
                            simpleBarData: {
                                labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
                                series: [this.yearData]
                            },
                            simpleBarOptions: {
                                fullWidth: true,
                                height: '300px'
                            },
                        }
                    }
                } else {
                    this.pageService.showError(res.message);
                }
            });
        }else{
            this.yearData = [];
            this.labels = [],
              this.service.getTwelveMonthStatistics(this.formId).subscribe(res => {
                if (res.success) {
                    console.log(res.data);
                    let data = res.data;
                     for (let entry in res['data']) {
                    this.labels.push(entry);
                    this.yearData.push(res['data'][entry]);
                }
                    this.showChart = false;
                    setTimeout(() => {
                        this.showChart = true;
                    }, 0);
                        this.chartData = {
                            simpleBarData: {
                                labels: this.labels,
                                series: [this.yearData]
                            },
                            simpleBarOptions: {
                                fullWidth: true,
                                height: '300px'
                            },
                        }
                } else {
                    this.pageService.showError(res.message);
                }
            });
        }
    }

    public onYearChange(event: any): void {
        this.yearValue = event.value;
    }
    public onDayChange(event: any): void {
        this.dayValue = event.value;
    }
}
