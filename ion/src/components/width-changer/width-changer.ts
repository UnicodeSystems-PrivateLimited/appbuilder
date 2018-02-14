import { Directive, ElementRef, Input, Renderer } from '@angular/core';

@Directive({ selector: '[widthChanger]' })
export class WidthChanger {

    @Input('widthChanger') serviceCount: number;

    constructor(public el: ElementRef, public renderer: Renderer) { }

    public ngOnInit(): void {
        let widthPercent = this.serviceCount === 1 ? 100 : 50;
        this.renderer.setElementAttribute(this.el.nativeElement, 'width-' + widthPercent, '');
    }

}
