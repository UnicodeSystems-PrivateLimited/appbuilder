/**
 * Form Fields Component
 * 
 * @author Akash
 */
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dropdown, SelectItem } from 'primeng/primeng';
import { FormField, formFieldTypes } from '../../theme/interfaces';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';

@Component({
    selector: 'form-fields',
    directives: [TOOLTIP_DIRECTIVES, Dropdown, Dragula],
    encapsulation: ViewEncapsulation.None,
    template: require('./form-fields.component.html'),
})

export class FormFields {

    @Input() fields: FormField[];
    @Output() fieldDelete = new EventEmitter<FormField>();
    @Output() fieldClick = new EventEmitter<FormField>();

    public fieldTypes = formFieldTypes;
    public fieldSize: string[] = [];
    public timeFormatOptions: SelectItem[];
    public phoneFormatOptions: SelectItem[];

    private FIELD_SIZE_SMALL: number = 1;
    private FIELD_SIZE_MEDIUM: number = 2;
    private FIELD_SIZE_LARGE: number = 3;

    private TIME_FORMAT_12_HOURS: number = 1;
    private TIME_FORMAT_24_HOURS: number = 2;

    private PHONE_FORMAT_NORMAL: number = 1;
    private PHONE_FORMAT_INTERNATIONAL: number = 2;

    private FORM_FIELDS_BAG: string = "form-fields-bag";
    private activeField : number ;
    constructor() {
        this.fieldSize[this.FIELD_SIZE_SMALL] = "25%";
        this.fieldSize[this.FIELD_SIZE_MEDIUM] = "50%";
        this.fieldSize[this.FIELD_SIZE_LARGE] = "100%";
    }

    public onDeleteFieldClick(field: FormField, index: number): void {
        if (confirm("Are you sure you want to delete this field?")) {
            this.fields.splice(index, 1);
            this.fieldDelete.emit(field);
        }
    }

    public onFieldClick(field: FormField, index): void {
        this.fieldClick.emit(field);
        this.activeField = index;
        console.log(' this.activeField ', this.activeField );
    }

    public onDuplicateClick(field: FormField): void {
        let duplicateField: FormField = new FormField();
        duplicateField.field_type_id = field.field_type_id;
        duplicateField.properties = Object.assign({}, field.properties);
        this.fields.push(duplicateField);
    }

}