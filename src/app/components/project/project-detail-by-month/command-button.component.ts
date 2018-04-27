import {
    Component, OnInit, Input, Output, EventEmitter,
    ElementRef, Renderer2
} from '@angular/core';
import { MenuItem } from '../../../models';

@Component({
    selector: 'app-command-button',
    template: ` <button type="button" class="btn"
        (click)="handleClickEvent([menuItem])"
        title={{menuItem.description}}>{{menuItem.title}}</button>`
})
export class CommandButtonComponent implements OnInit {

    @Input() menuItem: MenuItem;

    @Input() first: boolean;
    @Input() last: boolean;

    @Output() menuItemClick = new EventEmitter<MenuItem>();

    constructor(private el: ElementRef,
        private renderer: Renderer2) { }

    ngOnInit() {

        this.renderer.setAttribute(this.el.nativeElement.childNodes[1], 'innerText', this.menuItem.title);
        this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'backgroundColor', this.menuItem.bgColor);
        this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'borderColor', this.menuItem.color);
        this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'color', this.menuItem.color);
        this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'margin-right', '0px');
        this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'borderRadius', '0px');
        this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'padding', '0px');

        if (this.first) {
            this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'borderBottomLeftRadius', '5px');
            this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'borderTopLeftRadius', '5px');
        }

        if (this.last) {
            this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'borderBottomRightRadius', '5px');
            this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'borderTopRightRadius', '5px');
        }

    }
    handleClickEvent(menuItem: MenuItem) {
        this.menuItemClick.emit(menuItem);
    }
}
