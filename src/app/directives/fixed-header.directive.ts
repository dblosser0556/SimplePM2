import { Directive, ElementRef, Renderer, OnInit, Input, AfterViewInit, HostListener, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appFixedHeader]'
})
export class FixedHeaderDirective implements OnInit, AfterViewInit {
    @Input() height: number;
    table: any;
    container: any;
    containerWidth: number;

    constructor(private el: ElementRef, private renderer: Renderer2) {
        this.table = el.nativeElement;
        this.container = el.nativeElement.parentElement;
    }

    @HostListener('window:resize') onresize() {
        this.transformTable();
    }
    ngOnInit() {

    }

    ngAfterViewInit() {
        this.transformTable();
    }
    transformTable() {
        const containerWidth = this.container.clientWidth;
        let tableWidth = 0;
        let elems = this.table.querySelectorAll('thead, tbody, tfoot');
        for (const elem of elems) {
            this.renderer.setStyle(elem, 'display', '');
        }
        let i = 0;
        const thElems = this.table.querySelectorAll('tr:first-child th');

        for (const thElem of thElems) {
            const tdElems = this.table.querySelector('tbody tr:first-child td:nth-child(' + (i + 1) + ')');
            const tfElems = this.table.querySelector('tfoot tr:first-child td:nth-child(' + (i + 1) + ')');
            const columnWidth = tdElems ? tdElems.clientWidth : thElem.clientWidth;
            tableWidth += columnWidth;

            if (tdElems) {
                tdElems.style.width = columnWidth + 'px';
            }
            if (thElem) {
                thElem.style.width = columnWidth + 'px';
            }
            if (tfElems) {
                tfElems.style.width = columnWidth + 'px';
            }
            i++;

        }

        // set the css on the thead and tbody
        elems = this.table.querySelectorAll('thead, tfoot');
        for (const elem of elems) {
            this.renderer.setStyle(elem, 'display', 'block');
        }


        let tbody = this.table.querySelector('tbody');
        this.renderer.setStyle(tbody, 'display', 'block');
        if (this.height !== undefined) {
            const height = this.height + 'px';
            this.renderer.setStyle(tbody, 'height', height);
        } else {
            this.renderer.setStyle(tbody, 'height', 'inherit');
        }
        this.renderer.setStyle(tbody, 'overflow', 'auto');


        // reduce the width of the last column by the width of the scroll bar.
        tbody = this.table.querySelector('tbody');
        let scrollBarWidth = tbody.offsetWidth - tbody.clientWidth;
        if (scrollBarWidth > 0) {
            scrollBarWidth -= 2;

            const lastColumn = this.table.querySelector('tbody tr:first-child td:last-child');
            lastColumn.style.width = (lastColumn.offsetWidth - scrollBarWidth) + 'px';

        }


        // check to see if the table will over flow its container.
        if (containerWidth < tableWidth) {
            this.renderer.setStyle(this.container, 'display', 'block');
            this.renderer.setStyle(this.container, 'overflow-x', 'auto');
        } else  {
            this.renderer.setStyle(this.container, 'overflow-x', 'visible');
        }

    }

}
