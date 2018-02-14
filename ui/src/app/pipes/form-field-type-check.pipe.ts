import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'formfieldTypeCheck',
    pure: false
})
@Injectable()
export class formfieldTypeCheck implements PipeTransform {

    transform(fieldVal: string, fieldType: number): any {
        if (fieldType == 16) {
            let fieldWithLink = "<a href='../api/ws/function/email-forms-fields/formFileDownload?formField="+fieldVal+"'>"+fieldVal+"</a>";
            return fieldWithLink;
        } else {
            return fieldVal;
        }
    }

}