import { Directive, OnInit, HostListener, OnDestroy, Output, EventEmitter, ElementRef } from '@angular/core';

@Directive({
    selector: '[click-outside]'
})
export class ClickOutsides {
    @Output()
    public clickOutside = new EventEmitter<MouseEvent>();

    constructor(private _elementRef: ElementRef) {
    }



    @HostListener('document:click', ['$event', '$event.target'])
    public onClick(event: MouseEvent, targetElement: HTMLElement): void {
        if (!targetElement) {
            return;
        }

        const clickedInside = this._elementRef.nativeElement.contains(targetElement);
        if (!clickedInside) {
            this.clickOutside.emit(event);
        }
    }
}
