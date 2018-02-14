import {Control} from '@angular/common';

export class AlphaValidator {

  public static validate(c: Control) {
    let ALPHA_REGEXP = /^[A-z]+$/;
    if(c.value){
    return ALPHA_REGEXP.test(c.value) ? null : {
      validateAlpha: {
        valid: false
      }
    };
    }
  }
}