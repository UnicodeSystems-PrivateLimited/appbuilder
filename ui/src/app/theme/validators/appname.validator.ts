import {Control} from '@angular/common';

export class AppNameValidator {

  public static validate(c: Control) {
      let NAME_REGEXP = /^[A-Za-z\d\s]+$/;
    
    return NAME_REGEXP.test(c.value) ? null : {
      validateAppName: {
        valid: false
      }
    };
  }
}