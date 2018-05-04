import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[appNoContextMenu]'
})
export class NoContextMenuDirective {

    constructor(private el: ElementRef) {
    }

    @HostListener('contextmenu', ['$event']) onContextMenu(event) {
        // only respond to right mouse buttons.
        console.log('nocontexemenu', event);
        return false;
        
    }
}
