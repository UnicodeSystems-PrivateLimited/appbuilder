import { Directive, Input, ElementRef, Renderer } from '@angular/core';

@Directive({
    selector: '[tabWidth]' // Attribute selector
})
export class TabWidth {

    @Input('tabWidth')
    public tabNumber: number;

    constructor(public el: ElementRef, public renderer: Renderer) { }

    public ngOnInit(): void {
        if (!this.tabNumber) {
            this.tabNumber = 4;
        }
        let width: number = Math.round(100 / this.tabNumber);
        this.renderer.setElementAttribute(this.el.nativeElement, "width-" + width.toString(), "");
    }

}
