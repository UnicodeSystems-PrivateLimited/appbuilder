import { Directive, ElementRef } from '@angular/core';

@Directive({ selector: '[mode-ios]' })
export class ModeIOS {

    constructor(public el: ElementRef) {
    }

    public ngOnInit(): void {
        this.el.nativeElement.className = this.el.nativeElement.className.replace(/md/g, 'ios');
    }

}
