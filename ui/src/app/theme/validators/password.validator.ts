import {Control} from '@angular/common';

export class PasswordValidator {

  public static validate(c: Control) {
    let ALPHA_REGEXP = /^[0-9a-zA-Z]+$/;
    
    return ALPHA_REGEXP.test(c.value) ? null : {
      validatePassword: {
        valid: false
      }
    };
  }
}