import { Directive } from '@angular/core';
import { ElementRef } from '@angular/core/src/linker/element_ref';

@Directive({
    selector: '[remove-toolbar-background]'
})
export class RemoveToolbarBackground {

    constructor(public el: ElementRef) { }

    ngOnInit(): void {
        this.el.nativeElement.querySelector('.toolbar-background').remove();
    }

}
