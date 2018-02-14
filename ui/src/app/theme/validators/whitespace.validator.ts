import {Control} from '@angular/common';

export class WhitespaceValidator {

  public static validate(c: Control) {
    function hasWhiteSpace(s) {
        var ws = s.indexOf(' ') === -1;
        var comma = s.indexOf(',') === -1;
        var dot = s.indexOf('.') === -1;
        
        if(ws && comma && dot){
            return true;
        } else {
            return false;
        }
    }
    
    return hasWhiteSpace(c.value) ? null : {
      validateWhitespace: {
        valid: false
      }
    };
  }
}