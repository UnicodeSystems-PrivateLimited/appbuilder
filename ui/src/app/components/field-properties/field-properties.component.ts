/**
 * Field Properties Component
 * 
 * @author Akash
 */
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dropdown, SelectItem } from 'primeng/primeng';
import { FormField, formFieldTypes } from '../../theme/interfaces';

@Component({
    selector: 'field-props',
    directives: [TOOLTIP_DIRECTIVES, Dropdown],
    encapsulation: ViewEncapsulation.None,
    template: require('./field-properties.component.html'),
})

export class FieldProperties {

    @Input() field: FormField;

    public timeFormatOptions: SelectItem[];
    public phoneFormatOptions: SelectItem[];
    public sizeOptions: SelectItem[] = [];

    private FIELD_SIZE_SMALL: number = 1;
    private FIELD_SIZE_MEDIUM: number = 2;
    private FIELD_SIZE_LARGE: number = 3;

    private TIME_FORMAT_12_HOURS: number = 1;
    private TIME_FORMAT_24_HOURS: number = 2;

    private PHONE_FORMAT_NORMAL: number = 1;
    private PHONE_FORMAT_INTERNATIONAL: number = 2;

    constructor() {
        this.sizeOptions = this.getSizeOptions();
        this.timeFormatOptions = this.getTimeFormatOptions();
        this.phoneFormatOptions = this.getPhoneFormatOptions();
    }

    private getSizeOptions(): SelectItem[] {
        return [
            { label: "Small", value: this.FIELD_SIZE_SMALL },
            { label: "Medium", value: this.FIELD_SIZE_MEDIUM },
            { label: "Large", value: this.FIELD_SIZE_LARGE }
        ];
    }

    public getTimeFormatOptions(): SelectItem[] {
        return [
            { label: "12 Hours", value: this.TIME_FORMAT_12_HOURS },
            { label: "24 Hours", value: this.TIME_FORMAT_24_HOURS }
        ];
    }

    public getPhoneFormatOptions(): SelectItem[] {
        return [
            { label: "(###) ### - ####", value: this.PHONE_FORMAT_NORMAL },
            { label: "International", value: this.PHONE_FORMAT_INTERNATIONAL }
        ]
    }

    public onPlusClick(choice: any, index: number): void {
        this.field.properties.choices.splice(index + 1, 0, Object.assign({}, choice));
    }

    public onMinusClick(index: number): void {
        if (this.field.properties.choices.length > 1) {
            this.field.properties.choices.splice(index, 1);
        }
    }

    public onStarClick(choice: any, index: number): void {
        if (this.field.field_type_id !== formFieldTypes.CHECKBOXES) {
            let count = 0;
            for (let singleChoice of this.field.properties.choices) {
                if (index != count) {
                    singleChoice.selected = false;
                }
                count++;
            }
        }
        choice.selected = !choice.selected;
    }

}